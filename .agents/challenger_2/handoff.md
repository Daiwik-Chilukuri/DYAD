# Challenger 2 Empirical Stress Test Report

**Verdict**: `REQUEST_CHANGES`  
**Milestone**: M4 (Empirical Backend Streaming & SSE Protocol Verification)  
**Agent**: Challenger 2 (Empirical Challenger: Critic, Specialist)  
**Date**: 2026-09-19T17:45:00Z  

---

## 1. Observation

Direct empirical observations obtained by executing test suites and stress harnesses across `dyad-app/` and `prototype-modal-cloud-orchestrator/`:

### 1.1 Baseline Test Suite & Build Output
- **Command**: `node tests/e2e/runner.mjs` (working directory: `c:\Users\daiwi\Code\DYAD-PRAYAS\dyad-app`)
  ```text
  TOTAL | All Active Tiers Combined |   225 |  225 |    0 |   63ms
  ✔ TEST SUITE PASSED: 100% (225/225) tests successful!
  ```
- **Command**: `npm run build` (working directory: `c:\Users\daiwi\Code\DYAD-PRAYAS\dyad-app`)
  ```text
  ▲ Next.js 16.3.5 (Turbopack)
  ✓ Compiled successfully in 586ms
  ✓ Generating static pages using 8 workers (6/6) in 981ms
  Route (app)
  ┌ ○ /
  ├ ○ /_not-found
  ├ ○ /agents
  ├ ƒ /api/corridor/stream
  └ ○ /data
  ```

### 1.2 Master Empirical Stress Test Scorecard
- **Command**: `node prototype-streaming-stress-tests/run_all_stress_tests.mjs` (working directory: `c:\Users\daiwi\Code\DYAD-PRAYAS`)
  ```text
  ================================================================
                     MASTER EMPIRICAL SCORECARD                   
  ================================================================
   Suites Passed: 2 / 4
   Total Checks:  20
   Passed Checks: 18
   Failed Checks: 2
   Total Time:    155.61s
  ================================================================

  FAILURES RECORDED:
    - [Payload Stress] Identical origin and destination coordinates
    - [SSE Wire & UTF-8] Zero unformatted stdout leak
  ```

### 1.3 Verbatim Bug Reproduction Outputs

#### Bug 1: 0-Length Corridor Pydantic Validation Crash
- **File**: `prototype-modal-cloud-orchestrator/schemas/dossier.py:94`
- **Code**: `total_length_km: float = Field(..., gt=0.0, description="...")`
- **File**: `prototype-modal-cloud-orchestrator/master_orchestrator.py:463`
- **Input Payload**: `{"origin": {"name": "A", "coordinates": [77.6245, 12.9176]}, "destination": {"name": "A", "coordinates": [77.6245, 12.9176]}}`
- **Verbatim Error**:
  ```text
  Traceback (most recent call last):
    File "master_orchestrator.py", line 463, in _create_deterministic_fallback
      return AuthorityDossier(...)
    File "pydantic/main.py", line 263, in __init__
      validated_self = self.__pydantic_validator__.validate_python(data, self_instance=self)
  pydantic_core._pydantic_core.ValidationError: 1 validation error for AuthorityDossier
  total_length_km
    Input should be greater than 0 [type=greater_than, input_value=0.0, input_type=float]
  ```
- **Consequence**: `run_stream_bridge.py` lines 414-419 catch `fallback_exc`, emit `event: error` and `event: done`, and terminate with `sys.exit(1)` with **no dossier generated**.

#### Bug 2: Unformatted Python Print Leak onto SSE stdout Stream
- **File**: `prototype-modal-cloud-orchestrator/master_orchestrator.py:400` and line 309
- **Code**:
  ```python
  # line 400:
  print(f"[Master Orchestrator] Warning: LLM parse error ({exc}). Generating deterministic fallback dossier.")
  # line 309:
  print(f"[Master Orchestrator] Warning: Failed to query Modal volume: {e}")
  ```
- **Verbatim Stdout Stream Leak**:
  ```text
  event: telemetry
  data: {"type": "telemetry", "agent": "master_orchestrator", "status": "synthesizing", "message": "Master Orchestrator (gpt-5.6-sol) synthesizing Executive Authority Dossier..."}

  [Master Orchestrator] Warning: LLM parse error (Error code: 401 - {'error': {'message': 'Incorrect API key provided: sk-test-****back.'}}). Generating deterministic fallback dossier.
  event: telemetry
  data: {"type": "telemetry", "agent": "master_orchestrator", "status": "completed", ...}
  ```
- **Consequence**: Non-SSE plaintext string is piped directly into `child.stdout` in `dyad-app/src/app/api/corridor/stream/route.ts:98`, violating W3C SSE wire format syntax.

#### Bug 3: Schema Contract Gap on `estimated_tod_yield_inr_cr`
- **File**: `prototype-modal-cloud-orchestrator/schemas/dossier.py:45-53`
- **Observation**: `EconomicPillarMetrics` does not define `estimated_tod_yield_inr_cr` or `tod_land_value_capture_inr_cr`.
- **Contract Specification**: `PROJECT.md` §3 Authority Dossier TypeScript Contract requires:
  ```typescript
  export interface EconomicPillarMetrics {
    tech_parks_within_1km: number;
    commercial_centers_within_1km: number;
    hospitals_within_1km: number;
    annual_farebox_revenue_inr_cr: number;
    economic_multiplier_index: number;
    estimated_tod_yield_inr_cr: number;
  }
  ```
- **Consequence**: When synthesizing fallback or LLM dossier, `estimated_tod_yield_inr_cr` is absent from the raw JSON payload. `dyad-app/components/dossier/DomainPillarCards.tsx:62` has to supply a defensive fallback: `const todYield = economic?.estimated_tod_yield_inr_cr ?? (farebox * 2.2);`.

### 1.4 Passing Verifications
- **Multi-byte UTF-8 Integrity**: Kannada text (`ಕೇಂದ್ರ ರೇಷ್ಮೆ ಮಂಡಳಿ`, `ಬೆಳ್ಳಂದೂರು`), Indian Rupee symbol (`₹`), emojis (`🚇 ✨`), and quotes passed through Python stdin, stdout, and JSON decoding with zero replacement characters (`\uFFFD`) and 100% preservation.
- **Chunk Boundary Slicing**: Reassembly tested across 16B, 64B, 256B, and 1024B fragmented chunks reassembled all 11 lifecycle SSE events with 100% fidelity.
- **Client Request Abort**: Route handler abort listener (`child.kill('SIGTERM')`) terminates Python child process cleanly on Windows without orphaned processes (verified PID alive check = `false`).
- **Deterministic Math Range Validation**: All numerical metrics fall strictly within valid bounds (viability score: `45.0 - 82.8` in `[0, 100]`, population: `>= 0`, equity index: `[0, 100]`, congestion reduction: `[0, 100]`, KTFD enums: `COMPLIANT`/`FLAGGED`).
- **Concurrent Requests**: 5 parallel child processes executed simultaneously without file lock collisions or race conditions.

---

## 2. Logic Chain

1. **Premise 1**: The user may select the same metro station as origin and terminus pin (or pins located less than 50 meters apart, where haversine distance rounds to `0.0 km`).
   - *Supported by Observation 1.3 (Bug 1)*: Passing identical coordinates produces `length_km = 0.0`.
   - *Inference*: In `master_orchestrator.py:463`, calling `_create_deterministic_fallback` attempts to instantiate `AuthorityDossier(total_length_km=length_km, ...)`. Because `schemas/dossier.py:94` defines `total_length_km: float = Field(..., gt=0.0)`, Pydantic raises `ValidationError`, crashing the fallback handler.
   - *Conclusion*: Siting pins close together will crash the corridor evaluation without returning a dossier.

2. **Premise 2**: Next.js route handler at `dyad-app/src/app/api/corridor/stream/route.ts` streams `child.stdout` directly to the client as `text/event-stream`.
   - *Supported by Observation 1.3 (Bug 2)*: `master_orchestrator.py:400` executes `print(f"[Master Orchestrator] Warning: ...")`. Python `print()` outputs to standard output (`sys.stdout`) unless redirected.
   - *Inference*: When OpenAI fails or times out, the warning message is enqueued onto the client's SSE byte stream. A line not starting with `event: ` or `data: ` is invalid SSE wire syntax.
   - *Conclusion*: Master orchestrator debug logs corrupt the SSE wire protocol unless redirected to `sys.stderr`.

3. **Premise 3**: Interface contract in `PROJECT.md` §3 defines `estimated_tod_yield_inr_cr` as a core pillar metric.
   - *Supported by Observation 1.3 (Bug 3)*: The Pydantic schema in `schemas/dossier.py` does not include this attribute.
   - *Conclusion*: Contract mismatch between backend Pydantic schema and frontend TypeScript contract.

---

## 3. Caveats

- Tests were run with Python 3.12.5 on Windows 11 using local child process execution (`run_stream_bridge.py`).
- Modal cloud volume queries were tested with both active cloud connection and disconnected fallback mode.
- In-browser MapLibre GL WebGL canvas rendering was verified via component contracts and static build; physical headless browser GPU buffer execution was not run due to CI container constraints.

---

## 4. Conclusion & Required Changes

**Verdict**: `REQUEST_CHANGES`

The streaming route architecture, multi-byte UTF-8 handling, and deterministic fallback mathematics are robust, but 3 targeted fixes are required to eliminate fatal corner cases:

### Required Remediation Items:
1. **Fix 0-Length Corridor Validation** (`schemas/dossier.py` & `master_orchestrator.py`):
   - In `schemas/dossier.py:94`, change `total_length_km: float = Field(..., gt=0.0)` to `ge=0.0` or in `master_orchestrator.py:464` enforce `total_length_km=max(0.1, length_km)`.
2. **Redirect All Orchestrator Warning Prints to stderr** (`master_orchestrator.py`):
   - In `prototype-modal-cloud-orchestrator/master_orchestrator.py` line 309 and line 400, replace `print(...)` with `sys.stderr.write(f"...\\n")` or `print(..., file=sys.stderr)`.
3. **Add `estimated_tod_yield_inr_cr` to Backend Schema** (`schemas/dossier.py`):
   - In `EconomicPillarMetrics`, add `estimated_tod_yield_inr_cr: float = Field(default=0.0, ge=0.0, description="...")`.

---

## 5. Verification Method

To independently verify these findings:

1. **Run Master Stress Harness**:
   ```powershell
   node prototype-streaming-stress-tests/run_all_stress_tests.mjs
   ```
   *Expected Result*: Demonstrates the 2 failing checks (`Identical origin and destination coordinates` and `Zero unformatted stdout leak`).

2. **Run E2E Test Suite**:
   ```powershell
   cd dyad-app
   node tests/e2e/runner.mjs
   ```
   *Expected Result*: 225/225 tests pass.

3. **Verify Zero Build Errors**:
   ```powershell
   cd dyad-app
   npm run build
   ```
   *Expected Result*: Clean build with 0 TypeScript compiler errors.
