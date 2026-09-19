#!/usr/bin/env python3
"""
DYAD: OpenAI API & Modal Cloud Readiness Verifier
Tests your OPENAI_API_KEY, verifies model availability (Sol/Terra tiers with fallback),
checks structured output generation, and checks Modal environment status.
"""

import os
import sys
import json
import time
import shutil
import subprocess
from pathlib import Path

try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

# Load local .env
def load_env():
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    k, v = line.split("=", 1)
                    v = v.strip().strip('"').strip("'")
                    if k not in os.environ and v:
                        os.environ[k] = v

load_env()

API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()

# Canonical OpenAI API Model ID Mapping
MODEL_ALIASES = {
    "sol-medium": "gpt-5.6-sol",
    "sol-med": "gpt-5.6-sol",
    "sol": "gpt-5.6-sol",
    "terra": "gpt-5.6-terra",
    "luna": "gpt-5.6-luna",
}

raw_orch = os.environ.get("ORCHESTRATOR_MODEL", "gpt-5.6-sol")
raw_worker = os.environ.get("WORKER_MODEL", "gpt-5.6-terra")

ORCHESTRATOR_MODEL = MODEL_ALIASES.get(raw_orch.lower(), raw_orch)
WORKER_MODEL = MODEL_ALIASES.get(raw_worker.lower(), raw_worker)
FALLBACK_ORCH_MODEL = os.environ.get("FALLBACK_ORCHESTRATOR_MODEL", "gpt-4o")
FALLBACK_WORKER_MODEL = os.environ.get("FALLBACK_WORKER_MODEL", "gpt-4o-mini")

def check_modal_cli():
    print("\n[Step 1] Checking Modal AI CLI & Environment...")
    modal_bin = shutil.which("modal")
    if not modal_bin:
        print("  [!] Modal CLI is not installed in the active path.")
        print("      To install: pip install modal")
        print("      To authenticate: modal setup")
        return False
    try:
        ver_output = subprocess.check_output(["modal", "--version"], text=True).strip()
        print(f"  [✓] Found Modal CLI: {ver_output}")
        return True
    except Exception as e:
        print(f"  [!] Modal CLI error: {e}")
        return False

def check_openai_connection():
    print("\n[Step 2] Testing OpenAI API Key...")
    if not API_KEY:
        print("  [!] No OPENAI_API_KEY found in prototype-modal-cloud-orchestrator/.env")
        print("      Please open .env and set: OPENAI_API_KEY=\"sk-proj-...\"")
        return False

    try:
        from openai import OpenAI
    except ImportError:
        print("  [!] Python package 'openai' is not installed.")
        print("      Run: pip install openai")
        return False

    client = OpenAI(api_key=API_KEY)

    # 1. Test Orchestrator Model
    active_orch = ORCHESTRATOR_MODEL
    print(f"\n  Testing Orchestrator Model: '{active_orch}'...")
    try:
        t0 = time.time()
        resp = client.chat.completions.create(
            model=active_orch,
            messages=[{"role": "user", "content": "Respond with 'OK'."}],
            max_completion_tokens=25,
        )
        latency = int((time.time() - t0) * 1000)
        print(f"  [✓] Connected to '{active_orch}' in {latency}ms (Response: {resp.choices[0].message.content.strip()})")
    except Exception as e:
        print(f"  [!] Model '{active_orch}' failed: {e}")
        print(f"      Attempting fallback to '{FALLBACK_ORCH_MODEL}'...")
        active_orch = FALLBACK_ORCH_MODEL
        try:
            t0 = time.time()
            resp = client.chat.completions.create(
                model=active_orch,
                messages=[{"role": "user", "content": "Respond with 'OK'."}],
                max_completion_tokens=25,
            )
            latency = int((time.time() - t0) * 1000)
            print(f"  [✓] Connected to fallback '{active_orch}' in {latency}ms")
        except Exception as e2:
            print(f"  [x] Fallback failed: {e2}")
            return False

    # 2. Test Worker Model
    active_worker = WORKER_MODEL
    print(f"\n  Testing Worker Model: '{active_worker}'...")
    try:
        t0 = time.time()
        resp = client.chat.completions.create(
            model=active_worker,
            messages=[{"role": "user", "content": "Respond with 'OK'."}],
            max_completion_tokens=25,
        )
        latency = int((time.time() - t0) * 1000)
        print(f"  [✓] Connected to '{active_worker}' in {latency}ms")
    except Exception as e:
        print(f"  [!] Worker model '{active_worker}' failed: {e}")
        print(f"      Attempting fallback to '{FALLBACK_WORKER_MODEL}'...")
        active_worker = FALLBACK_WORKER_MODEL
        try:
            t0 = time.time()
            resp = client.chat.completions.create(
                model=active_worker,
                messages=[{"role": "user", "content": "Respond with 'OK'."}],
                max_completion_tokens=25,
            )
            latency = int((time.time() - t0) * 1000)
            print(f"  [✓] Connected to fallback worker '{active_worker}' in {latency}ms")
        except Exception as e2:
            print(f"  [x] Worker fallback failed: {e2}")
            return False

    # 3. Test Structured Output
    print(f"\n  Testing Structured JSON Output on '{active_orch}'...")
    test_schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "CorridorTriage",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "corridor_name": {"type": "string"},
                    "pre_feasibility_score": {"type": "integer"},
                    "recommendation": {"type": "string"}
                },
                "required": ["corridor_name", "pre_feasibility_score", "recommendation"],
                "additionalProperties": False
            }
        }
    }
    try:
        t0 = time.time()
        resp = client.chat.completions.create(
            model=active_orch,
            response_format=test_schema,
            messages=[
                {"role": "system", "content": "You are a transit intelligence agent. Output strictly compliant JSON."},
                {"role": "user", "content": "Score Silk Board to Sarjapur corridor."}
            ]
        )
        latency = int((time.time() - t0) * 1000)
        parsed = json.loads(resp.choices[0].message.content)
        print(f"  [✓] Structured output succeeded in {latency}ms:")
        print(f"      Score: {parsed.get('pre_feasibility_score')}/100 | Recommendation: {parsed.get('recommendation')}")
    except Exception as e:
        print(f"  [!] Structured output failed: {e}")
        return False

    print("\n[✓] OpenAI API authentication and capabilities verified successfully!")
    print(f"    Recommended Config: ORCHESTRATOR={active_orch}, WORKER={active_worker}")
    return True

def main():
    print("=" * 70)
    print("   DYAD: OpenAI & Modal Cloud Environment Verification")
    print("=" * 70)

    modal_ok = check_modal_cli()
    openai_ok = check_openai_connection()

    print("\n" + "=" * 70)
    if openai_ok:
        print("   Ready to deploy multi-agent cloud orchestrator to Modal!")
        print("   Deploy command: modal deploy app.py")
    else:
        print("   Please populate your OPENAI_API_KEY in .env and rerun this check.")
    print("=" * 70)

if __name__ == "__main__":
    main()
