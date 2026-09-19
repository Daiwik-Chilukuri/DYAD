import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sseHeaders: Record<string, string> = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',
};

/**
 * Resolves the absolute path to `run_stream_bridge.py`.
 */
function resolveRunnerScriptPath(): string {
  const candidatePaths = [
    path.resolve(process.cwd(), '../prototype-modal-cloud-orchestrator/run_stream_bridge.py'),
    path.resolve(process.cwd(), 'prototype-modal-cloud-orchestrator/run_stream_bridge.py'),
    'c:\\Users\\daiwi\\Code\\DYAD-PRAYAS\\prototype-modal-cloud-orchestrator\\run_stream_bridge.py',
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
      return candidate;
    }
  }

  return path.resolve(process.cwd(), '../prototype-modal-cloud-orchestrator/run_stream_bridge.py');
}

/**
 * Resolves the Python executable name or path.
 */
function resolvePythonExecutable(): string {
  return process.env.PYTHON_PATH || process.env.PYTHON_BIN || 'python';
}

/**
 * POST /api/corridor/stream
 * Handles corridor evaluation requests and returns a real-time Server-Sent Events (SSE) stream.
 */
export async function POST(request: Request) {
  let corridorPayload: unknown;
  try {
    corridorPayload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Branch 1: If MODAL_ENDPOINT_URL is configured, forward to Modal Cloud endpoint
  const modalEndpoint = process.env.MODAL_ENDPOINT_URL;
  if (modalEndpoint) {
    try {
      const modalResponse = await fetch(modalEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corridorPayload),
        signal: request.signal,
      });

      if (modalResponse.ok && modalResponse.body) {
        return new Response(modalResponse.body, { headers: sseHeaders });
      }
      console.warn(
        `[API/corridor/stream] Modal endpoint returned ${modalResponse.status}. Falling back to local runner.`
      );
    } catch (err) {
      console.warn('[API/corridor/stream] Modal fetch failed, falling back to local runner:', err);
    }
  }

  // Branch 2: Local Child Process Runner Fallback
  const runnerScript = resolveRunnerScriptPath();
  const pythonPath = resolvePythonExecutable();

  const stream = new ReadableStream({
    start(controller) {
      const child = spawn(/*turbopackIgnore: true*/ pythonPath, ['-u', runnerScript], {
        cwd: path.dirname(runnerScript),
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          PYTHONIOENCODING: 'utf-8',
        },
      });

      // Send inbound JSON payload to Python via stdin
      child.stdin.write(JSON.stringify(corridorPayload));
      child.stdin.end();

      // Stream child process stdout chunks directly into SSE response
      child.stdout.on('data', (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk));
      });

      // Capture and log stderr for debugging without corrupting stdout SSE protocol
      child.stderr.on('data', (errChunk: Buffer) => {
        const errMsg = errChunk.toString('utf-8');
        console.error('[run_stream_bridge stderr]:', errMsg);
      });

      child.on('close', (code: number | null) => {
        if (code !== 0 && code !== null) {
          console.error(`[run_stream_bridge] Exited with code ${code}`);
        }
        controller.close();
      });

      child.on('error', (err: Error) => {
        console.error('[run_stream_bridge spawn error]:', err);
        const errEvent = `event: error\ndata: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`;
        controller.enqueue(new TextEncoder().encode(errEvent));
        controller.close();
      });

      // Terminate child process if client disconnects early
      request.signal.addEventListener('abort', () => {
        try {
          child.kill('SIGTERM');
        } catch {
          // Process already closed
        }
      });
    },
  });

  return new Response(stream, { headers: sseHeaders });
}

/**
 * GET /api/corridor/stream
 * Health check endpoint.
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'DYAD Corridor SSE Streaming API is active. POST corridor payload to stream.',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
