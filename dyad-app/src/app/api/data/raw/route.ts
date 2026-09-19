import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getRawDirectory(): string {
  const candidatePaths = [
    path.resolve(process.cwd(), '../prototype-datasets-collection/raw'),
    path.resolve(process.cwd(), 'prototype-datasets-collection/raw'),
    'c:\\Users\\daiwi\\Code\\DYAD-PRAYAS\\prototype-datasets-collection\\raw',
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ p)) return p;
  }
  return path.resolve(process.cwd(), '../prototype-datasets-collection/raw');
}

function getDataDirectory(): string {
  return path.resolve(process.cwd(), 'public/data');
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function inferRawCategory(subfolder: string, filename: string): string {
  const lower = (subfolder + '/' + filename).toLowerCase();
  if (lower.includes('demograph') || lower.includes('ward') || lower.includes('census') || lower.includes('slum')) {
    return 'Demographics & Equity Census';
  }
  if (lower.includes('environment') || lower.includes('lake') || lower.includes('stream') || lower.includes('wetland')) {
    return 'Lakes, Wetlands & KTFD Risk';
  }
  if (lower.includes('mobility') || lower.includes('traffic') || lower.includes('speed')) {
    return 'Traffic Sensors & Mobility Indicators';
  }
  if (lower.includes('poi') || lower.includes('economic') || lower.includes('park')) {
    return 'Commercial POI & Jobs';
  }
  if (lower.includes('metro') || lower.includes('bmrcl')) {
    return 'Rapid Transit & GTFS Feeds';
  }
  if (lower.includes('road')) {
    return 'Arterial Road Network';
  }
  return 'Municipal Spatial Dataset';
}

/**
 * GET /api/data/raw
 * Scans `prototype-datasets-collection/raw` and returns all available test datasets.
 */
export async function GET() {
  try {
    const rawDir = getRawDirectory();
    if (!fs.existsSync(/*turbopackIgnore: true*/ rawDir)) {
      return NextResponse.json({ success: true, files: [] });
    }

    const files: Array<{
      id: string;
      name: string;
      relativePath: string;
      subfolder: string;
      category: string;
      size: string;
      sizeBytes: number;
      type: string;
    }> = [];

    function scanDir(currentDir: string, relPath: string = '') {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativeEntryPath = path.join(relPath, entry.name).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          scanDir(fullPath, relativeEntryPath);
        } else if (entry.isFile()) {
          // Exclude metadata sidecars and hidden files
          if (entry.name.startsWith('.') || entry.name.endsWith('.metadata.json') || entry.name.endsWith('.meta.json')) {
            continue;
          }

          const stat = fs.statSync(fullPath);
          const ext = path.extname(entry.name).toLowerCase().replace('.', '');
          const subfolder = relPath.split(/[/\\]/)[0] || 'general';
          const category = inferRawCategory(subfolder, entry.name);

          files.push({
            id: `raw-${entry.name}`,
            name: entry.name,
            relativePath: relativeEntryPath,
            subfolder,
            category,
            size: formatBytes(stat.size),
            sizeBytes: stat.size,
            type: ext,
          });
        }
      }
    }

    scanDir(rawDir);
    files.sort((a, b) => a.category.localeCompare(b.category));

    return NextResponse.json({
      success: true,
      rawPath: rawDir,
      files,
      count: files.length,
    });
  } catch (error: any) {
    console.error('[API/data/raw] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to scan raw datasets directory' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/data/raw
 * Copies a dataset from `prototype-datasets-collection/raw/` into `public/data/` for active use.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { relativePath, targetName } = body;

    if (!relativePath) {
      return NextResponse.json(
        { success: false, error: 'relativePath is required' },
        { status: 400 }
      );
    }

    const rawDir = getRawDirectory();
    const sourcePath = path.resolve(rawDir, relativePath);

    // Security check against directory traversal
    if (!sourcePath.startsWith(rawDir) || !fs.existsSync(/*turbopackIgnore: true*/ sourcePath)) {
      return NextResponse.json(
        { success: false, error: 'Source dataset file not found in raw repository' },
        { status: 404 }
      );
    }

    const dataDir = getDataDirectory();
    if (!fs.existsSync(/*turbopackIgnore: true*/ dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filename = targetName || path.basename(sourcePath);
    const destinationPath = path.join(dataDir, filename);

    fs.copyFileSync(sourcePath, destinationPath);

    return NextResponse.json({
      success: true,
      message: `Staged '${filename}' into active storage repository.`,
      filename,
      sizeBytes: fs.statSync(destinationPath).size,
    });
  } catch (error: any) {
    console.error('[API/data/raw] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to stage raw dataset' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/data/raw
 * Resets active storage by removing all files except base metro lines and stations.
 */
export async function DELETE() {
  try {
    const dataDir = getDataDirectory();
    if (!fs.existsSync(/*turbopackIgnore: true*/ dataDir)) {
      return NextResponse.json({ success: true, message: 'Active storage is already empty.' });
    }

    const files = fs.readdirSync(dataDir);
    let removedCount = 0;

    for (const f of files) {
      if (f !== 'metro_lines.geojson' && f !== 'metro_stations.geojson' && !f.startsWith('.')) {
        try {
          fs.unlinkSync(path.join(dataDir, f));
          removedCount++;
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleared active storage. Removed ${removedCount} test file(s). Base metro network preserved.`,
    });
  } catch (error: any) {
    console.error('[API/data/raw] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear active storage' },
      { status: 500 }
    );
  }
}
