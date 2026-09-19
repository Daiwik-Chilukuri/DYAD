"""
DYAD: Browser-Use Dataset Collector Evaluation Runner.
Demonstrates autonomous city prompt generation, cloud agent dispatch,
and dataset harvesting verification.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from cloud_collector import BrowserUseCloudCollector, slugify
from prompt_generator import CITY_KNOWLEDGE_BASE, generate_city_collection_prompt

# Configure stdout encoding
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


def run_prompt_benchmark_eval():
    """
    Evaluates that the generic prompt generator correctly parameterizes
    different metro cities without any manual prompt writing.
    """
    print("=" * 76)
    print("   DYAD EVALUATION 1: GENERIC CITY-PARAMETRIC PROMPT GENERATION")
    print("=" * 76)

    test_cities = [
        ("Hyderabad", "Raidurg to Kokapet Neopolis via Financial District"),
        ("Pune", "Hinjawadi Infotech Park Phase 1-3 to Shivajinagar"),
        ("Chennai", "OMR IT Expressway to Siruseri SIPCOT"),
        ("Kolkata", "Sector V Salt Lake to New Town Financial Hub"),
    ]

    for city, corridor in test_cities:
        prompt = generate_city_collection_prompt(city, focus_corridor=corridor)
        assert city in prompt, f"Failed to include {city} in prompt"
        assert "PILLAR 1: DEMOGRAPHICS" in prompt
        assert "PILLAR 2: ECONOMIC" in prompt
        assert "PILLAR 3: MOBILITY" in prompt
        assert "PILLAR 4: ECOLOGICAL" in prompt
        assert "PILLAR 5: MAP CANVAS" in prompt
        print(f"  [✓] Verified Prompt for '{city}': {len(prompt):,} chars | Focus: {corridor[:35]}...")

    print("\n[Result] All city prompts successfully generated and validated across 5 pillars.")


def run_single_city_eval(city_name: str, corridor: str | None = None, dry_run: bool = False):
    """
    Runs the collector evaluation for a specific city.
    """
    print("\n" + "=" * 76)
    print(f"   DYAD EVALUATION 2: CLOUD AGENT DISPATCH ({city_name.upper()})")
    print("=" * 76)

    collector = BrowserUseCloudCollector()
    res = collector.run_collection(
        city_name=city_name,
        focus_corridor=corridor,
        dry_run=dry_run,
    )

    print("\n[Evaluation Output]")
    print(json.dumps(res, indent=2, default=str))

    return res


def main():
    parser = argparse.ArgumentParser(description="Evaluate Browser Use Cloud Dataset Collector")
    parser.add_argument("--city", default="Hyderabad", help="City name to evaluate")
    parser.add_argument("--corridor", default="Raidurg to Kokapet Neopolis", help="Optional corridor hint")
    parser.add_argument("--dry-run", action="store_true", help="Force dry run even if key is present")
    args = parser.parse_args()

    # Part 1: Verify generic city parameterization
    run_prompt_benchmark_eval()

    # Part 2: Execute single city run (checks cloud agent and outputs)
    run_single_city_eval(city_name=args.city, corridor=args.corridor, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
