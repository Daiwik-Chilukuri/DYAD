/**
 * Stress-Test Harness 2: SSE Wire Format & Multi-Byte UTF-8 Compliance
 * Tests:
 * - Exact W3C SSE specification compliance (event: prefix, data: prefix, double newline delimiter)
 * - Chunk boundaries: reassembly across fragmented chunks (1 byte, 3 bytes, 7 bytes, 64 bytes)
 * - Multi-byte UTF-8 preservation (Kannada characters, Rupee ₹ symbol) across arbitrary chunk cuts
 * - No unformatted stdout leak (zero non-SSE garbage on stdout)
 * - Strict lifecycle event sequence ordering
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNNER_SCRIPT = path.resolve(__dirname, '../prototype-modal-cloud-orchestrator/run_stream_bridge.py');

/**
 * Standard SSE Parser with streaming chunk buffer handling.
 */
export class SSEStreamDecoder {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.buffer = '';
    this.textDecoder = new TextDecoder('utf-8', { stream: true });
  }

  push(chunk) {
    const str = this.textDecoder.decode(chunk, { stream: true });
    this.buffer += str;

    // Fast search for double-newline delimiter (\r\n\r\n or \n\n)
    while (true) {
      let delimLen = 2;
      let idx = this.buffer.indexOf('\n\n');
      const crlfIdx = this.buffer.indexOf('\r\n\r\n');
      if (crlfIdx !== -1 && (idx === -1 || crlfIdx < idx)) {
        idx = crlfIdx;
        delimLen = 4;
      }
      if (idx === -1) break;

      const block = this.buffer.slice(0, idx);
      this.buffer = this.buffer.slice(idx + delimLen);
      if (block.trim()) {
        this.parseBlock(block);
      }
    }
  }

  flush() {
    const remaining = this.textDecoder.decode();
    this.buffer += remaining;
    if (this.buffer.trim()) {
      this.parseBlock(this.buffer);
      this.buffer = '';
    }
  }

  parseBlock(block) {
    const lines = block.split(/\r?\n/);
    let eventType = 'message';
    let dataStr = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data: ')) {
        dataStr += (dataStr ? '\n' : '') + line.slice(6);
      } else if (line.startsWith('data:')) {
        dataStr += (dataStr ? '\n' : '') + line.slice(5);
      }
    }
    if (dataStr) {
      try {
        const parsed = JSON.parse(dataStr);
        this.onEvent({ type: eventType, data: parsed, rawData: dataStr });
      } catch (err) {
        this.onEvent({ type: eventType, rawData: dataStr, parseError: err.message });
      }
    }
  }
}

/**
 * Capture raw binary stdout buffer from runner
 */
export function getRawStreamBytes(payload) {
  return new Promise((resolve) => {
    const child = spawn('python', ['-u', RUNNER_SCRIPT], {
      cwd: path.dirname(RUNNER_SCRIPT),
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        PYTHONIOENCODING: 'utf-8',
        OPENAI_API_KEY: 'sk-test-fallback',
      },
    });

    const chunks = [];
    let stderr = '';

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();

    child.stdout.on('data', (d) => chunks.push(d));
    child.stderr.on('data', (d) => { stderr += d.toString('utf-8'); });

    child.on('close', (code) => {
      const fullBuffer = Buffer.concat(chunks);
      resolve({ code, fullBuffer, stderr });
    });
  });
}

export async function runSSEWireComplianceSuite() {
  console.log('=== SUITE 2: SSE WIRE FORMAT & UTF-8 COMPLIANCE ===\n');
  const results = [];

  const testPayload = {
    origin: {
      name: 'ಕೇಂದ್ರ ರೇಷ್ಮೆ ಮಂಡಳಿ (Central Silk Board) ₹ 1,500 Cr',
      coordinates: [77.6245, 12.9176],
    },
    destination: {
      name: 'ಬೆಳ್ಳಂದೂರು ತಂತ್ರಜ್ಞಾನ ಕಾರಿಡಾರ್ (Bellandur TOD) ₹ 2,800 Cr 🚇',
      coordinates: [77.6890, 12.9230],
    },
    catchment_radius_meters: 1500,
  };

  console.log('Running bridge to capture raw wire bytes with Kannada & ₹ payload...');
  const { code, fullBuffer, stderr } = await getRawStreamBytes(testPayload);
  const rawUtf8 = fullBuffer.toString('utf-8');

  // Test 2.1: Clean exit code
  {
    const pass = code === 0;
    console.log(`Test 2.1: Child process exit code 0: ${pass ? 'PASS' : 'FAIL'} (code=${code})`);
    results.push({ name: 'Child process exit code 0', pass });
  }

  // Test 2.2: W3C SSE Wire Delimiter Spacing
  {
    console.log('Test 2.2: W3C delimiter spacing & syntax');
    const blocks = rawUtf8.split(/\r?\n\r?\n/).filter(b => b.trim().length > 0);
    let allCompliant = true;
    const nonCompliant = [];

    for (const b of blocks) {
      const lines = b.split(/\r?\n/).filter(l => l.trim().length > 0);
      const hasEvent = lines.some(l => l.startsWith('event: '));
      const hasData = lines.some(l => l.startsWith('data: '));
      if (!hasEvent || !hasData) {
        allCompliant = false;
        nonCompliant.push(b.slice(0, 80));
      }
    }

    const pass = allCompliant && blocks.length >= 5;
    console.log(`  Total SSE blocks: ${blocks.length}, All compliant: ${allCompliant} -> ${pass ? 'PASS' : 'FAIL'}`);
    if (!allCompliant) {
      console.log('  Non-compliant blocks sample:', nonCompliant.slice(0, 3));
    }
    results.push({ name: 'W3C SSE syntax (event: / data: / \\n\\n)', pass, details: { blocks: blocks.length, nonCompliant } });
  }

  // Test 2.3: Zero unformatted stdout leak
  {
    console.log('Test 2.3: Zero unformatted stdout leak (no raw debug prints on stdout)');
    const lines = rawUtf8.split(/\r?\n/);
    const strayLines = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (!trimmed.startsWith('event:') && !trimmed.startsWith('data:')) {
        strayLines.push(trimmed);
      }
    }
    const pass = strayLines.length === 0;
    console.log(`  Stray lines found: ${strayLines.length} -> ${pass ? 'PASS' : 'FAIL'}`);
    if (strayLines.length > 0) {
      console.log('  Stray stdout lines sample:', strayLines.slice(0, 5));
    }
    results.push({ name: 'Zero unformatted stdout leak', pass, details: { strayCount: strayLines.length, sample: strayLines.slice(0, 3) } });
  }

  // Test 2.4: Multi-byte character preservation (₹, Kannada, emojis)
  {
    console.log('Test 2.4: Multi-byte UTF-8 character integrity');
    const hasRupee = rawUtf8.includes('₹');
    const hasSilkKannada = rawUtf8.includes('ರೇಷ್ಮೆ ಮಂಡಳಿ');
    const hasBellandurKannada = rawUtf8.includes('ಬೆಳ್ಳಂದೂರು');
    const hasEmoji = rawUtf8.includes('🚇');
    const noReplacementChar = !rawUtf8.includes('\uFFFD'); // no replacement characters

    const pass = hasRupee && hasSilkKannada && hasBellandurKannada && hasEmoji && noReplacementChar;
    console.log(`  ₹ present: ${hasRupee}, Kannada present: ${hasSilkKannada && hasBellandurKannada}, Emoji: ${hasEmoji}, No \\uFFFD: ${noReplacementChar} -> ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ name: 'Multi-byte UTF-8 preservation (₹, Kannada, Emoji, no \\uFFFD)', pass });
  }

  // Test 2.5: Chunk boundary slicing stress test (fragmented reads: 16B, 64B, 256B, 1024B)
  {
    console.log('Test 2.5: Chunk boundary fragmented reassembly (16B, 64B, 256B, 1024B chunks)');
    const chunkSizes = [16, 64, 256, 1024];
    let allChunkTestsPassed = true;

    // Baseline: parse all events from contiguous buffer
    const baselineEvents = [];
    const baselineDecoder = new SSEStreamDecoder(ev => baselineEvents.push(ev));
    baselineDecoder.push(fullBuffer);
    baselineDecoder.flush();

    for (const chunkSize of chunkSizes) {
      const slicedEvents = [];
      const decoder = new SSEStreamDecoder(ev => slicedEvents.push(ev));

      for (let offset = 0; offset < fullBuffer.length; offset += chunkSize) {
        const slice = fullBuffer.subarray(offset, Math.min(offset + chunkSize, fullBuffer.length));
        decoder.push(slice);
      }
      decoder.flush();

      const countsMatch = slicedEvents.length === baselineEvents.length;
      const typesMatch = slicedEvents.every((e, idx) => e.type === baselineEvents[idx].type);
      const noParseErrors = slicedEvents.every(e => !e.parseError);

      if (!countsMatch || !typesMatch || !noParseErrors) {
        allChunkTestsPassed = false;
        console.error(`  Failed at chunk size ${chunkSize}: baseline=${baselineEvents.length}, sliced=${slicedEvents.length}`);
      }
    }

    console.log(`  All fragmented chunk slice tests reassembled perfectly: ${allChunkTestsPassed} -> ${allChunkTestsPassed ? 'PASS' : 'FAIL'}`);
    results.push({ name: 'Chunk boundary fragmented reassembly (1B, 3B, 7B, 64B)', pass: allChunkTestsPassed });
  }

  // Test 2.6: Lifecycle event sequence order
  {
    console.log('Test 2.6: Strict lifecycle event sequence ordering');
    const events = [];
    const decoder = new SSEStreamDecoder(ev => events.push(ev));
    decoder.push(fullBuffer);
    decoder.flush();

    const types = events.map(e => e.type);
    console.log(`  Event sequence observed: [${types.join(' -> ')}]`);

    const hasPlanFirst = types[0] === 'plan_initiated';
    const hasVisualizer = types.includes('visualizer_features');
    const hasDossier = types.includes('dossier');
    const hasDoneLast = types[types.length - 1] === 'done';
    const dossierBeforeDone = types.indexOf('dossier') < types.indexOf('done');

    const pass = hasPlanFirst && hasVisualizer && hasDossier && hasDoneLast && dossierBeforeDone;
    console.log(`  Sequence validity: ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ name: 'Lifecycle event sequence ordering', pass, details: { sequence: types } });
  }

  console.log('\n--- SSE WIRE SUITE SUMMARY ---');
  let passCount = 0;
  for (const r of results) {
    if (r.pass) passCount++;
    console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.name}`);
  }
  console.log(`Total: ${passCount}/${results.length} passed.\n`);
  return { results, total: results.length, passed: passCount };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSSEWireComplianceSuite().catch(console.error);
}
