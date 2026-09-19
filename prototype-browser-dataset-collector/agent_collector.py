"""
DYAD: Browser-Use Dataset Collector Agent (Hyderabad).
Uses browser-use with DeepSeek V4.1 Flash to automate the discovery and
download of municipal, census, economic, mobility, and lake datasets.
"""

from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path

# Load environment variables
def load_environment():
    from dotenv import load_dotenv
    search_paths = [
        Path(__file__).parent / ".env",
        Path(__file__).parent.parent / ".env",
    ]
    for p in search_paths:
        if p.exists():
            load_dotenv(p)
            break

load_environment()

PROMPT_FILE = Path(__file__).parent / "prompts" / "hyderabad_collector_prompt.md"
DOWNLOADS_DIR = Path(__file__).parent / "downloads" / "hyderabad" / "raw"


def get_llm():
    """
    Initializes the LLM client.
    Configured for DeepSeek V4.1 Flash via ChatOpenAI / ChatDeepSeek.
    """
    from browser_use import ChatOpenAI

    deepseek_api_key = os.environ.get("DEEPSEEK_API_KEY") or os.environ.get("OPENAI_API_KEY")
    base_url = os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
    model_name = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")  # Or deepseek-v4.1-flash

    if not deepseek_api_key:
        print("[Warning] DEEPSEEK_API_KEY not found in environment. Please set DEEPSEEK_API_KEY.")

    return ChatOpenAI(
        model=model_name,
        base_url=base_url,
        api_key=deepseek_api_key or "dummy-key",
        temperature=0.2,
    )


def load_task_prompt() -> str:
    """Reads the crafted task prompt for the browser collector agent."""
    if not PROMPT_FILE.exists():
        raise FileNotFoundError(f"Prompt file not found at {PROMPT_FILE}")
    content = PROMPT_FILE.read_text(encoding="utf-8")
    # Extract content inside the triple backticks if present
    if "```text" in content and "```" in content:
        prompt_body = content.split("```text", 1)[1].split("```", 1)[0].strip()
        return prompt_body
    return content


async def run_collector(headless: bool = False):
    """
    Runs the Browser-Use Agent to collect Hyderabad datasets.
    """
    from browser_use import Agent, Browser, BrowserConfig

    DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
    prompt = load_task_prompt()

    print("=" * 76)
    print("   DYAD: BROWSER-USE DATASET COLLECTOR (HYDERABAD)")
    print(f"   Model: DeepSeek V4.1 Flash | Downloads: {DOWNLOADS_DIR}")
    print("=" * 76)

    # Configure browser session with download directory
    browser_config = BrowserConfig(
        headless=headless,
        disable_security=True,
    )
    browser = Browser(config=browser_config)

    llm = get_llm()
    agent = Agent(
        task=prompt,
        llm=llm,
        browser=browser,
        max_actions_per_step=3,
        use_vision=True,
    )

    print("\n[Starting Browser Agent Execution...]")
    history = await agent.run(max_steps=25)

    print("\n[Execution Completed]")
    print(f"Agent Final Result: {history.final_result()}")
    
    # List downloaded files
    collected_files = list(DOWNLOADS_DIR.glob("*"))
    print(f"\n[Verification] Files in {DOWNLOADS_DIR.name}: {len(collected_files)}")
    for f in collected_files:
        print(f"  • {f.name} ({f.stat().st_size:,} bytes)")


if __name__ == "__main__":
    import sys
    is_headless = "--headless" in sys.argv
    asyncio.run(run_collector(headless=is_headless))
