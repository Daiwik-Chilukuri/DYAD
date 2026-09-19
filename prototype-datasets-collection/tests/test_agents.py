from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from experiments.run_corridor_experiment import run_experiment  # noqa: E402
from presentation import build_ui_payload  # noqa: E402
from agents.mobility_traffic_aggent import run_mobility_traffic_aggent  # noqa: E402
from agents.traffic_sensus_agent import run_traffic_sensus_agent  # noqa: E402

REQUIRED_INPUT = ROOT / "normalized/poi/pois.geojson"


@unittest.skipUnless(REQUIRED_INPUT.exists(), "run download and normalize first")
class AgentIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.results = run_experiment()["agents"]

    def test_all_four_agents_run(self) -> None:
        self.assertEqual(
            set(self.results),
            {
                "poi_agent",
                "traffic_census_agent",
                "water_bodies_agent",
                "mobility_traffic_agent",
            },
        )

    def test_brief_name_compatibility_aliases(self) -> None:
        from agents import run_mobility_traffic_agent, run_traffic_census_agent

        self.assertIs(run_traffic_sensus_agent, run_traffic_census_agent)
        self.assertIs(run_mobility_traffic_aggent, run_mobility_traffic_agent)

    def test_poi_agent_produces_clusters(self) -> None:
        result = self.results["poi_agent"]
        self.assertGreater(result["poi_count"], 0)
        self.assertGreater(result["cluster_count"], 0)

    def test_census_agent_has_complete_join(self) -> None:
        result = self.results["traffic_census_agent"]
        self.assertGreater(result["intersected_ward_count"], 0)
        self.assertGreater(result["area_weighted_population_reached_2011"], 0)

    def test_water_agent_scans_features(self) -> None:
        result = self.results["water_bodies_agent"]
        self.assertGreater(result["features_scanned"], 0)

    def test_mobility_model_is_sane(self) -> None:
        result = self.results["mobility_traffic_agent"]
        model = result["gtfs_schedule_model"]
        self.assertGreater(model["training_examples"], 5)
        self.assertGreaterEqual(model["coefficients"]["distance_km"], 0)
        self.assertGreaterEqual(model["coefficients"]["stop_count"], 0)
        self.assertGreater(model["projected_metro_minutes"], 0)

    def test_ui_payload_has_map_ready_coordinates(self) -> None:
        payload = build_ui_payload({
            "experiment": {
                "id": "test",
                "name": "Test corridor",
                "coordinates": [[77.6, 12.9], [77.7, 13.0]],
            },
            "generated_at": "2026-01-01T00:00:00+00:00",
            "agents": self.results,
        })
        self.assertEqual(payload["schema_version"], "1.0.0")
        self.assertEqual(
            payload["coordinate_reference_system"]["geojson_coordinate_order"],
            ["longitude", "latitude"],
        )
        self.assertEqual(payload["map"]["layers"][0]["geojson"]["type"], "FeatureCollection")
        self.assertGreater(len(payload["map"]["focus_points"]), 0)
        for focus in payload["map"]["focus_points"]:
            self.assertIn("longitude", focus["coordinate"])
            self.assertIn("latitude", focus["coordinate"])


if __name__ == "__main__":
    unittest.main()
