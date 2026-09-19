# DYAD: Modal Cloud Multi-Agent Orchestrator (`prototype-modal-cloud-orchestrator`)

Cloud-native spatial multi-agent orchestration service built on **Modal AI** and powered by the **OpenAI API** (`sol-medium` / `terra` with automatic fallback to `gpt-4o` / `gpt-4o-mini`).

This service ingests user-drawn transit corridors from `prototype-map-canvas-ui`, dispatches 4 specialized domain subagents (Demographics, Economics, Mobility, Ecological Risk), and streams an authoritative, quantitative **`AuthorityDossier`** via Server-Sent Events (SSE).

---

## 📁 Directory Structure

```
prototype-modal-cloud-orchestrator/
├── PRD_AGENTS.md           # Full Multi-Agent Product Requirements & Architecture Spec
├── README.md               # Quickstart & Deployment Guide
├── app.py                  # Modal Serverless Application & SSE Streaming Endpoint
├── orchestrator.py         # Multi-Agent Workflow Engine & OpenAI Synthesis
├── test_openai_key.py      # Standalone verification script for OpenAI credentials
├── .env.example            # Environment variable template
├── .env                    # Local secrets (gitignored)
├── schemas/
│   ├── __init__.py
│   └── dossier.py          # Pydantic data models (AuthorityDossier, Pillars, Telemetry)
├── tools/
│   ├── __init__.py
│   ├── gis_tools.py        # Deterministic GIS tools (catchments, POI clustering, lake buffers)
│   └── code_interpreter.py # Sandboxed Python execution tool
└── docs/
    ├── modal-serverless.md # Offline Modal reference docs
    ├── modal-mcp-setup.md  # Modal MCP server setup
    └── openai-agents-sdk.md# OpenAI Agents SDK and models reference
```

---

## 🚀 Quickstart & Setup

### 1. Configure Local Environment
Add your `OPENAI_API_KEY` to `.env`:
```bash
# In prototype-modal-cloud-orchestrator/.env
OPENAI_API_KEY="sk-proj-..."
```

### 2. Verify OpenAI API Key & Model Access
Run the pre-flight verification script to test connection, model access (`sol-medium`, `terra`, `gpt-4o`), and structured outputs:
```bash
python test_openai_key.py
```

Expected output:
```
======================================================================
   DYAD: OpenAI API Key & Model Access Verification
======================================================================

[1] Checking Environment...
  [✓] Found OPENAI_API_KEY in .env (starts with sk-proj-...)

[2] Testing OpenAI API Connectivity...
  [✓] Connected to OpenAI API successfully!
  [✓] Available Models Detected: 82

[3] Probing Target Models:
  [-] sol-medium: Not Available (Will fallback to gpt-4o)
  [-] terra: Not Available (Will fallback to gpt-4o-mini)
  [✓] gpt-4o: Available
  [✓] gpt-4o-mini: Available

[4] Testing Structured Outputs (Pydantic parsing)...
  [✓] Structured output succeeded!
...
[✓] ALL TESTS PASSED! System is ready for Modal cloud deployment.
```

---

## ☁️ Modal AI Deployment

### 1. Authenticate with Modal
If not already authenticated:
```bash
modal setup
```

### 2. Register OpenAI Secret on Modal
Store your OpenAI API key in Modal's encrypted secret store:
```bash
modal secret create openai-secret OPENAI_API_KEY="your-actual-api-key"
```

### 3. Test Remote Run via Modal CLI
Execute a remote cloud run of the Bangalore Outer Ring Road Phase 3B metro corridor test:
```bash
modal run app.py
```

### 4. Deploy Live Web Endpoint
Deploy the public, auto-scaling SSE streaming endpoint:
```bash
modal deploy app.py
```
Modal will output a public HTTPS URL (e.g., `https://<username>--dyad-modal-orchestrator-stream-corridor-analysis.modal.run`).

---

## 🛰️ API Contract: SSE Streaming

### Endpoint
`POST /stream_corridor_analysis`  
`Content-Type: application/json`

### Request Payload (`CorridorRequest`)
```json
{
  "corridor_id": "blr-orr-phase-3b",
  "corridor_name": "Outer Ring Road Metro",
  "coordinates": [
    [77.6200, 12.9170],
    [77.6410, 12.9240],
    [77.6780, 12.9280],
    [77.6950, 12.9350],
    [77.7010, 12.9560],
    [77.6980, 12.9780],
    [77.6940, 12.9980]
  ],
  "budget_cap_inr_cr": 5600.0,
  "target_completion_year": 2027
}
```

### Response Stream (SSE)
```text
event: telemetry
data: {"type": "telemetry", "agent": "demographics_specialist", "status": "tool_executing", "message": "Computing 500m walking catchment...", "progress_pct": 25}

event: telemetry
data: {"type": "telemetry", "agent": "economic_specialist", "status": "tool_executing", "message": "Aggregating tech corridors...", "progress_pct": 45}

event: dossier
data: {"corridor_id": "blr-orr-phase-3b", "total_length_km": 11.4, "estimated_ridership_daily": 145000, "overall_viability_score": 84.5, ...}

event: done
data: [DONE]
```

---

## 🛡️ Model Fallback Guarantee
DYAD is designed with a resilient fallback hierarchy:
1. Master Orchestrator: `sol-medium` ➔ `gpt-4o`
2. Domain Subagents: `terra` ➔ `gpt-4o-mini`
3. If API limits are exceeded or keys are absent in local offline development, the deterministic GIS engine automatically compiles a high-fidelity synthetic `AuthorityDossier` so developers and UI prototypes are never blocked.
