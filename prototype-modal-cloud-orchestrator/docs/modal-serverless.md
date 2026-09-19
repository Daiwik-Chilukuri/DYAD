# Modal AI Serverless Architecture Guide
## Deploying Multi-Agent Systems on Modal (`modal.com`)

### 1. Core Architecture
Modal runs containerized Python functions in the cloud with sub-second boot times, automatic autoscaling, and zero idle cost.

```python
import modal

app = modal.App("dyad-agents")

# Define pre-warmed image with GIS and AI dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "openai",
        "openai-agents",
        "geopandas",
        "shapely",
        "numpy",
        "scipy",
        "pydantic",
        "fastapi"
    )
)
```

### 2. Secret Management
Never hardcode API keys. Store them in Modal secrets:
```bash
modal secret create openai-secret OPENAI_API_KEY="sk-..."
```
Attach to functions:
```python
@app.function(
    image=image,
    secrets=[modal.Secret.from_name("openai-secret")],
    timeout=120,
)
def run_agents(corridor_data: dict):
    # OPENAI_API_KEY is available in os.environ
    pass
```

### 3. Server-Sent Events (SSE) Streaming Webhook
To stream live telemetry badges to the Next.js frontend:
```python
from fastapi.responses import StreamingResponse

@app.function(image=image, secrets=[modal.Secret.from_name("openai-secret")])
@modal.web_endpoint(method="POST")
def stream_corridor_analysis(request: dict):
    def event_generator():
        # Phase 1: Stream agent telemetry events
        yield f"data: {json.dumps({'type': 'telemetry', 'agent': 'demographics', 'status': 'complete'})}\n\n"
        # Phase 2: Stream final structured dossier
        yield f"data: {json.dumps({'type': 'dossier', 'data': final_dossier})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```
