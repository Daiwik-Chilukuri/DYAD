from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.normalize import (  # noqa: E402
    _normal_ward_number,
    normalize_geojson,
    normalize_kml,
)


class NormalizeTests(unittest.TestCase):
    def test_normal_ward_number_handles_geojson_float(self) -> None:
        self.assertEqual(_normal_ward_number(119.0), "119")
        self.assertEqual(_normal_ward_number("119"), "119")

    def test_geojson_lines_becomes_feature_collection(self) -> None:
        feature = {
            "type": "Feature",
            "properties": {"name": "Example"},
            "geometry": {"type": "Point", "coordinates": [77.6, 13.0]},
        }
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "input.geojsonl"
            output = Path(directory) / "output.geojson"
            source.write_text(json.dumps(feature) + "\n", encoding="utf-8")
            normalize_geojson(source, output, "test_source")
            payload = json.loads(output.read_text(encoding="utf-8"))
        self.assertEqual(payload["type"], "FeatureCollection")
        self.assertEqual(len(payload["features"]), 1)
        self.assertEqual(
            payload["features"][0]["properties"]["source_name"], "test_source"
        )

    def test_kml_extended_data_and_line_are_preserved(self) -> None:
        kml = """<?xml version="1.0" encoding="UTF-8"?>
        <kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark>
          <ExtendedData><SchemaData><SimpleData name="RR_WIDTH_P">15</SimpleData>
          </SchemaData></ExtendedData><MultiGeometry><LineString><coordinates>
          77.5,12.9,0 77.6,13.0,0</coordinates></LineString></MultiGeometry>
        </Placemark></Document></kml>"""
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "input.kml"
            output = Path(directory) / "output.geojson"
            source.write_text(kml, encoding="utf-8")
            normalize_kml(source, output, "road_widths")
            payload = json.loads(output.read_text(encoding="utf-8"))
        feature = payload["features"][0]
        self.assertEqual(feature["geometry"]["type"], "MultiLineString")
        self.assertEqual(feature["properties"]["rr_width_p"], 15)


if __name__ == "__main__":
    unittest.main()
