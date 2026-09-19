## 2026-09-19T17:16:00Z
You are the Implementation Worker for Milestone 2 (M2: Backend Integration & Streaming API Route).
Your working directory is: c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\worker_m2\
You MUST read the authoritative original user request at:
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\ORIGINAL_REQUEST.md
Also read:
c:\Users\daiwi\Code\DYAD-PRAYAS\PROJECT.md
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\explorer_survey_2\survey_report.md
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\context.md
c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\design-system.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

FILE BOUNDARIES:
You exclusively own:
- `prototype-modal-cloud-orchestrator/run_stream_bridge.py`
- `dyad-app/src/app/api/corridor/stream/route.ts`
DO NOT edit `dyad-app/components/MapCanvas.tsx` or `dyad-app/components/dossier/`.

YOUR MISSION:
1. Implement `prototype-modal-cloud-orchestrator/run_stream_bridge.py`:
   - Standalone CLI runner designed to be executed via `python -u`.
   - Ensure UTF-8 output encoding: `sys.stdout.reconfigure(encoding='utf-8')`.
   - Read JSON input from `sys.stdin`.
   - Initialize `DyadMasterOrchestrator` from `master_orchestrator.py`.
   - Ensure dataset resolution works properly (falling back to `runs/run_real_datasets_audit` on `dyad-datasets-volume` or deterministic local fallback).
   - Iterate over `orchestrator.execute_stream(...)` and format each yielded event as standard SSE:
     `event: {event['type']}\ndata: {json.dumps(event, ensure_ascii=False)}\n\n`
     followed by immediate `sys.stdout.flush()`.
   - Wrap in robust exception handling that falls back to `_create_deterministic_fallback(...)` on unexpected exceptions, guaranteeing that the stream always delivers `dossier` and `done` without terminating abruptly.
2. Implement Next.js SSE Route Handler at `dyad-app/src/app/api/corridor/stream/route.ts`:
   - Set `export const runtime = 'nodejs';` and `export const dynamic = 'force-dynamic';`
   - Handle `POST(request: Request)`:
     - Parse request body JSON.
     - If `process.env.MODAL_ENDPOINT_URL` is set, forward request to Modal endpoint via `fetch()` and pipe the response stream.
     - Else (local runner fallback), spawn a child process (`python -u prototype-modal-cloud-orchestrator/run_stream_bridge.py` or full path) using Node's `child_process.spawn`.
     - Set environment variables `PYTHONUNBUFFERED: '1'`, `PYTHONIOENCODING: 'utf-8'`.
     - Write the request body JSON to `child.stdin` and close stdin.
     - Pipe child process `stdout` chunks through a `ReadableStream`.
     - Handle `child.stderr` for logging/debugging without corrupting stdout SSE stream.
     - Return `new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'Connection': 'keep-alive' } })`.
3. Verification:
   - Test `run_stream_bridge.py` by feeding a test corridor JSON via stdin:
     `{"origin": {"name": "Silk Board", "coordinates": [77.6245, 12.9176]}, "destination": {"name": "Sarjapur", "coordinates": [77.6820, 12.9290]}, "catchment_radius_meters": 2000}`
     Confirm it yields `plan_initiated`, `telemetry`, `subagents_spawned`, `visualizer_features`, `dossier`, `done`.
   - Run `npx tsc --noEmit` in `dyad-app/` and verify 0 TypeScript compiler errors.

Write your handoff report to `c:\Users\daiwi\Code\DYAD-PRAYAS\.agents\worker_m2\handoff.md` and send a completion message to parent when done.
