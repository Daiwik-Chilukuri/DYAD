"""
DYAD: Real Datasets Ingestion, Classification & Modal Run-Upload Script.
Extracts authentic city datasets from prototype-datasets-collection/raw/,
normalizes spatial formats (KML/GeoJSONL -> GeoJSON), classifies them with TypeSafe Jev,
and batch-uploads them to Modal Volume under /runs/run_real_datasets_audit/.
"""

from __future__ import annotations

import json
import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

# Add classifier src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from classifier import JevDatasetClassifier
from modal_uploader import stage_locally, upload_to_modal_volume
from sniffer import sniff_dataset

# Ensure UTF-8 output on Windows
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


def convert_kml_to_geojson(kml_path: Path, output_geojson: Path) -> Path:
    """Converts ATREE lakes KML Placemark polygons into standard GeoJSON."""
    print(f"  [Converting] {kml_path.name} -> {output_geojson.name}...")
    tree = ET.parse(kml_path)
    root = tree.getroot()
    ns = {"kml": "http://www.opengis.net/kml/2.2"}
    placemarks = root.findall(".//kml:Placemark", ns)

    features = []
    for p in placemarks:
        name_el = p.find("kml:name", ns)
        lake_name = name_el.text.strip() if (name_el is not None and name_el.text) else "Protected Waterbody"
        
        props = {
            "lake_name": lake_name,
            "ktfd_buffer_meters": 30,
            "flood_vulnerability": "HIGH" if "amanikere" in lake_name.lower() or "lake" in lake_name.lower() else "MODERATE",
        }
        for sd in p.findall(".//kml:SimpleData", ns):
            attr_name = sd.attrib.get("name")
            if attr_name and sd.text:
                props[attr_name] = sd.text.strip()

        coord_el = p.find(".//kml:coordinates", ns)
        if coord_el is not None and coord_el.text:
            coords_raw = coord_el.text.strip().split()
            poly_coords = []
            for c in coords_raw:
                parts = c.split(",")
                if len(parts) >= 2:
                    try:
                        poly_coords.append([float(parts[0]), float(parts[1])])
                    except ValueError:
                        pass
            if len(poly_coords) >= 3:
                # Close the polygon ring if not closed
                if poly_coords[0] != poly_coords[-1]:
                    poly_coords.append(poly_coords[0])
                features.append({
                    "type": "Feature",
                    "properties": props,
                    "geometry": {"type": "Polygon", "coordinates": [poly_coords]},
                })

    fc = {
        "type": "FeatureCollection",
        "name": "atree_bengaluru_lakes_and_wetlands",
        "features": features,
    }
    with open(output_geojson, "w", encoding="utf-8") as f:
        json.dump(fc, f)

    print(f"  [Converted] {len(features):,} lake/stream polygons saved to {output_geojson.name}")
    return output_geojson


def convert_geojsonl_to_geojson(geojsonl_path: Path, output_geojson: Path) -> Path:
    """Converts GeoJSONL (line-delimited features) into standard GeoJSON FeatureCollection."""
    print(f"  [Converting] {geojsonl_path.name} -> {output_geojson.name}...")
    features = []
    with open(geojsonl_path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                feat = json.loads(line)
                if feat.get("type") == "Feature":
                    features.append(feat)
            except Exception:
                pass

    fc = {
        "type": "FeatureCollection",
        "name": "bengaluru_urban_slums",
        "features": features,
    }
    with open(output_geojson, "w", encoding="utf-8") as f:
        json.dump(fc, f)

    print(f"  [Converted] {len(features):,} urban slum polygons saved to {output_geojson.name}")
    return output_geojson


def main():
    target_run_id = "run_real_datasets_audit"
    print("=" * 76)
    print(f"   DYAD: REAL DATASETS INGESTION & UPLOAD (Target Run: '{target_run_id}')")
    print("=" * 76)

    root_dir = Path(__file__).parent.parent
    raw_dir = root_dir / "prototype-datasets-collection" / "raw"

    # Step 1: Normalize formats
    atree_kml = raw_dir / "environment" / "atree_lakes_streams.kml"
    atree_geojson = raw_dir / "environment" / "atree_lakes_streams.geojson"
    if not atree_geojson.exists() or atree_geojson.stat().st_size == 0:
        convert_kml_to_geojson(atree_kml, atree_geojson)

    slums_geojsonl = raw_dir / "demographics" / "bengaluru_urban_slums.geojsonl"
    slums_geojson = raw_dir / "demographics" / "bengaluru_urban_slums.geojson"
    if not slums_geojson.exists() or slums_geojson.stat().st_size == 0:
        convert_geojsonl_to_geojson(slums_geojsonl, slums_geojson)

    datasets_to_process = [
        raw_dir / "demographics" / "bbmp_wards_198.geojson",
        slums_geojson,
        atree_geojson,
        raw_dir / "poi" / "osm_bengaluru_pois.json",
        raw_dir / "mobility" / "bengaluru_mobility_indicators_2011.csv",
    ]

    classifier = JevDatasetClassifier()
    print(f"\n[Classifier Mode] Jev System One Available: {classifier.is_available()}")

    staged_results = []

    for fpath in datasets_to_process:
        print(f"\n---> Processing: {fpath.name}")
        fp = sniff_dataset(fpath)
        print(f"     Format: {fp['file_format']}, Geom: {fp['geometry_type']}, Coords: {fp['has_coordinates']}")

        classification = classifier.classify_fingerprint(fp)
        category = classification["category"]
        topic = classification["subtopic"]
        renamed = classification["renamed_filename"]
        is_viz = classification.get("is_visualizer_dataset", False)

        print(f"     Option A Name: {renamed}")
        print(f"     Assigned Agents: {classification['target_agents']}")

        # Stage locally
        staged_file = stage_locally(fpath, renamed, classification)

        # Upload to Modal volume under /runs/<target_run_id>/
        upload_res = upload_to_modal_volume(
            local_file=staged_file,
            remote_filename=renamed,
            volume_name="dyad-datasets-volume",
            run_id=target_run_id,
        )

        if upload_res.get("success"):
            print(f"     [✓] Uploaded to Modal Cloud: {upload_res['cloud_path']} ({upload_res['bytes_uploaded']:,} bytes)")
        else:
            print(f"     [!] Upload error: {upload_res.get('error')}")

        staged_results.append({
            "original": fpath.name,
            "renamed": renamed,
            "cloud_path": upload_res.get("cloud_path"),
            "category": category,
            "has_coords": is_viz,
        })

    print("\n" + "=" * 76)
    print(f"   COMPLETED: {len(staged_results)} REAL DATASETS UPLOADED TO MODAL STORAGE")
    print("=" * 76)
    for r in staged_results:
        print(f"   • {r['renamed']} (from {r['original']})")


if __name__ == "__main__":
    main()
