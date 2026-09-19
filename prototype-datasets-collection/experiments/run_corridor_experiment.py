from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from agents import (
    run_demographics_specialist,
    run_ecological_specialist,
    run_economic_specialist,
    run_mobility_specialist,
)
from presentation import build_ui_payload
from scripts.catalog import ROOT

SILK_BOARD_SARJAPUR = {
    "id": "silk_board_sarjapur_exploratory",
    "name": "Silk Board to Sarjapur exploratory alignment",
    "coordinates": [
        [77.6235, 12.9177],
        [77.6506, 12.9235],
        [77.6804, 12.9128],
        [77.6974, 12.9045],
        [77.7275, 12.8950],
        [77.7852, 12.8600],
    ],
}


def run_experiment(
    corridor: dict[str, Any] = SILK_BOARD_SARJAPUR,
) -> dict[str, Any]:
    coordinates = corridor["coordinates"]
    results = {
        "experiment": corridor,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "agents": {
            "economic_specialist": run_economic_specialist(
                coordinates, ROOT / "normalized/poi/pois.geojson"
            ),
            "demographics_specialist": run_demographics_specialist(
                coordinates,
                ROOT / "normalized/demographics/wards_with_census.geojson",
            ),
            "ecological_specialist": run_ecological_specialist(
                coordinates,
                ROOT / "normalized/environment/lakes_streams.geojson",
            ),
            "mobility_specialist": run_mobility_specialist(
                coordinates,
                ROOT / "raw/metro/bmrcl.zip",
                ROOT / "normalized/roads/road_widths.geojson",
                ROOT / "normalized/mobility/mobility_indicators_2011.json",
            ),
        },
    }
    return results


def main() -> int:
    results = run_experiment()
    output = ROOT / "experiments/results/sarjapur_corridor.json"
    ui_output = ROOT / "experiments/results/sarjapur_corridor.ui.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    ui_output.write_text(
        json.dumps(build_ui_payload(results), indent=2) + "\n", encoding="utf-8"
    )
    print(output.relative_to(ROOT))
    print(ui_output.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
