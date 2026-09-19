# OpenAI Agents SDK Reference Guide
## Framework Architecture & Primitives (`openai-agents`)

The OpenAI Agents SDK is a Python-first framework for building multi-agent workflows.

### 1. Key Primitives
* **`Agent`**: Autonomous actor with instructions, tools, and assigned model.
* **`Runner`**: Execution loop manager that dispatches queries, executes tool calls, and handles multi-turn agent conversations.
* **`Handoffs`**: Delegation mechanism transferring control from the orchestrator to specialized subagents.
* **`Guardrails`**: Input and output validation checks.

### 2. Model Routing in DYAD
* **Master Orchestrator:** `sol-medium` (GPT-5.6 Sol tier) for multi-agent dispatch, error recovery, and comprehensive executive synthesis.
* **Domain Subagents:** `terra` (GPT-5.6 Terra tier) for rapid spatial analysis, tool execution, and quantitative calculations.
* **Fallback Strategy:** Automatic fallback to `gpt-4o` and `gpt-4o-mini` if account tier is transitioning.

### 3. Tool Definition Syntax
```python
from agents import Agent, Runner, function_tool

@function_tool
def calculate_catchment_population(buffer_radius_km: float) -> dict:
    """Calculates population within buffer."""
    # Deterministic spatial calculation using GeoPandas / Shapely
    return {"population": 340000, "working_class_pct": 0.62}

demographics_agent = Agent(
    name="DemographicsAgent",
    model="terra",
    instructions="You are the Demographics & Equity Agent for Bengaluru...",
    tools=[calculate_catchment_population],
)
```

### 4. Structured Output Handling
Use Pydantic models with `response_format` to enforce strict schema adherence for the Authority Dossier:
```python
from pydantic import BaseModel

class AuthorityDossier(BaseModel):
    corridor_id: str
    overall_score: int
    feasibility_rating: str
    # ...
```
