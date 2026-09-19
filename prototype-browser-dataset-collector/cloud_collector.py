"""
DYAD: Browser Use Cloud Agent V4 Runner.
Dispatches autonomous dataset collection runs to the Browser Use Cloud,
persists files in a city-specific cloud workspace, and downloads verified
GeoJSON/CSV datasets to local storage.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional

from prompt_generator import generate_city_collection_prompt


def load_env():
    """Loads environment variables from local or parent directory."""
    from dotenv import load_dotenv
    search_paths = [
        Path(__file__).parent / ".env",
        Path(__file__).parent.parent / ".env",
    ]
    for p in search_paths:
        if p.exists():
            load_dotenv(p)
            break


load_env()


def slugify(text: str) -> str:
    """Converts city string to clean lowercase directory slug."""
    return re.sub(r"[^\w\-]+", "_", text.strip().lower()).strip("_")


class BrowserUseCloudCollector:
    """
    Manages Browser Use Cloud Agent V4 sessions for autonomous city dataset collection.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.environ.get("BROWSER_USE_API_KEY")
        self.model = model or os.environ.get("BROWSER_USE_MODEL", "deepseek-v4-flash-vision")
        self.base_url = "https://api.browser-use.com/api/v4"

    def is_configured(self) -> bool:
        """Checks if a valid Browser Use API key is configured."""
        return bool(self.api_key and self.api_key.strip() and not self.api_key.startswith("your_"))

    def run_collection(
        self,
        city_name: str,
        focus_corridor: Optional[str] = None,
        output_dir: Optional[Path] = None,
        dry_run: bool = False,
    ) -> Dict[str, Any]:
        """
        Executes a dataset collection run for a target city.
        """
        city_slug = slugify(city_name)
        target_dir = output_dir or (Path(__file__).parent / "downloads" / city_slug / "raw")
        target_dir.mkdir(parents=True, exist_ok=True)

        print("=" * 76)
        print(f"   DYAD: BROWSER USE CLOUD COLLECTOR ➔ {city_name.upper()}")
        print(f"   Model: {self.model} | Destination: {target_dir}")
        print("=" * 76)

        prompt = generate_city_collection_prompt(city_name, focus_corridor=focus_corridor)

        # Save generated prompt locally for inspection
        prompt_save_path = Path(__file__).parent / "prompts" / f"{city_slug}_generated_prompt.md"
        prompt_save_path.parent.mkdir(parents=True, exist_ok=True)
        prompt_save_path.write_text(prompt, encoding="utf-8")
        print(f"\n[1] City Prompt Generated & Saved: {prompt_save_path.name}")
        print(f"    Task Prompt Length: {len(prompt)} characters")

        if dry_run or not self.is_configured():
            print("\n[Dry Run / Key Check]")
            if not self.is_configured():
                print("    [!] BROWSER_USE_API_KEY is not configured in .env.")
                print(f"    Please add your API key to: {Path(__file__).parent / '.env'}")
            else:
                print("    [✓] API key detected. Dry-run mode requested.")

            return {
                "status": "dry_run_completed",
                "city": city_name,
                "city_slug": city_slug,
                "model": self.model,
                "prompt_path": str(prompt_save_path),
                "downloads_target": str(target_dir),
                "generated_prompt_sample": prompt[:300] + "...",
            }

        # Live Execution via Browser Use Cloud SDK / API V4
        print(f"\n[2] Connecting to Browser Use Cloud API V4...")
        try:
            from browser_use_sdk.v4 import BrowserUse

            client = BrowserUse(api_key=self.api_key)
            
            # Step A: Create or locate city workspace
            workspace_name = f"dyad-{city_slug}"
            print(f"    Creating persistent Cloud Workspace: '{workspace_name}'...")
            workspace = client.workspaces.create(name=workspace_name)
            workspace_id = workspace.id
            print(f"    Workspace Minted: {workspace_id}")

            # Step B: Launch Cloud Agent Run
            print(f"    Dispatching Cloud Agent Run (Model: {self.model})...")
            try:
                run = client.runs.create(
                    task=prompt,
                    model=self.model,
                    workspace_id=workspace_id,
                )
            except Exception as exc:
                if "not available on the free plan" in str(exc) or "403" in str(exc):
                    print(f"    [Notice] Model '{self.model}' is restricted on this plan tier.")
                    print("    Switching to Cloud default model (gpt-5.6-luna)...")
                    run = client.runs.create(
                        task=prompt,
                        model=None,  # Default gpt-5.6-luna
                        workspace_id=workspace_id,
                    )
                else:
                    raise exc

            run_id = run.id
            active_model = getattr(run, "model", self.model)
            print(f"    Run Created: {run_id} (Active Model: {active_model})")
            print(f"    Live Preview URL: https://cloud.browser-use.com/runs/{run_id}")

            # Step C: Wait for Completion
            print("\n[3] Awaiting Cloud Agent Navigation & Data Harvesting...")
            print("    (You can watch the live session at the Preview URL above)")
            result = client.runs.wait_for_completion(run_id)
            print(f"    Agent Run Status: {result.status}")
            print(f"    Result Summary:\n{result.result}\n")

            # Step D: Download Workspace Files
            print(f"[4] Downloading Acquired Spatial Datasets to {target_dir.name}/...")
            workspace_files = client.workspaces.files(workspace_id, include_urls=True)
            downloaded_files = []

            for f in getattr(workspace_files, "files", []):
                fname = Path(f.path).name
                dest = target_dir / fname
                if getattr(f, "url", None):
                    urllib.request.urlretrieve(str(f.url), dest)
                    downloaded_files.append(fname)
                    print(f"    [✓] Downloaded: {fname} ({dest.stat().st_size:,} bytes)")

            return {
                "status": "success",
                "run_id": run_id,
                "workspace_id": workspace_id,
                "city": city_name,
                "downloaded_files": downloaded_files,
                "result": result.result,
            }

        except Exception as e:
            print(f"[!] Error during Browser Use Cloud run: {e}")
            return {
                "status": "error",
                "error": str(e),
                "city": city_name,
            }
