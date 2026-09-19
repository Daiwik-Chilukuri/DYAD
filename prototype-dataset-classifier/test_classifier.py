#!/usr/bin/env python3
"""
DYAD: TypeSafe AI (Jev System One) Dataset Classifier Test Runner (Python)
Zero-dependency implementation using Python 3 standard library (urllib.request).
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from pathlib import Path

# Auto-load .env
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
                    if k not in os.environ:
                        os.environ[k] = v

load_env()
API_KEY = os.environ.get("TYPESAFE_API_KEY") or os.environ.get("JEV_API_KEY") or ""
ENDPOINT = "https://api.typesafe.ai/v1/systemone"

TEST_DATASETS = [
    {
        "name": "tomtom_bengaluru_peak_congestion.csv",
        "headers": ["corridor_segment", "rush_hour_speed_kmh", "free_flow_speed_kmh", "delay_index", "avg_commute_minutes"],
        "sample": {"corridor_segment": "Silk Board to Agara", "rush_hour_speed_kmh": 11.2, "free_flow_speed_kmh": 32.0}
    },
    {
        "name": "bbmp_wards_demographics_census.csv",
        "headers": ["ward_no", "ward_name", "total_population", "working_class_pct", "transit_dependency_score"],
        "sample": {"ward_no": 150, "ward_name": "Bellandur", "total_population": 80180, "working_class_pct": 0.58}
    },
    {
        "name": "bengaluru_tech_parks_and_hospitals.csv",
        "headers": ["facility_name", "facility_type", "lat", "lon", "employee_capacity"],
        "sample": {"facility_name": "RMZ Ecospace", "facility_type": "corporate_tech_park", "lat": 12.926, "lon": 77.6833}
    },
    {
        "name": "bengaluru_water_bodies_ngt_buffers.geojson",
        "headers": ["lake_id", "lake_name", "water_spread_area_sqm", "ngt_statutory_buffer_meters", "latitude", "longitude"],
        "sample": {"lake_id": "LAK_001", "lake_name": "Bellandur Lake", "ngt_statutory_buffer_meters": 75, "latitude": 12.9344}
    }
]

def evaluate(state, questions):
    if not API_KEY:
        raise ValueError("Missing TYPESAFE_API_KEY. Please add it to prototype-dataset-classifier/.env")
    
    payload = {
        "state": state,
        "model": "jev-latest",
        "questions": questions
    }
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {API_KEY.strip()}",
            "Content-Type": "application/json"
        }
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            elapsed = int((time.time() - t0) * 1000)
            data = json.loads(resp.read().decode("utf-8"))
            data["latency_ms"] = elapsed
            return data
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {e.code}: {body}")

def ping():
    try:
        res = evaluate("ping test", {
            "test": {"type": "noul", "instructions": "Is this connection operational?"}
        })
        return True, res.get("latency_ms", 0), f"Connected to {res.get('model')} in {res.get('latency_ms')}ms"
    except Exception as e:
        return False, 0, str(e)

def classify(dataset):
    col_criteria = {"none": "No coordinate column found"}
    for h in dataset["headers"]:
        col_criteria[h] = f"Column: {h}"

    questions = {
        "domain": {
            "type": "choice",
            "instructions": "What urban planning category best describes this dataset?",
            "criteria": {
                "mobility_traffic": "Road traffic congestion, speed deltas, commute delays",
                "census_demographics": "Municipal ward census, population, socio-economic weights",
                "poi_amenities": "Tech parks, hospitals, universities, transit stations",
                "environmental_water": "Lakes, water bodies, stormwater drains, environmental buffers",
                "unsupported": "Irrelevant or corrupt data"
            }
        },
        "has_coordinates": {
            "type": "noul",
            "instructions": "Does this dataset contain geographic coordinates (lat/lng)?"
        },
        "lat_col": {
            "type": "choice",
            "instructions": "Which column represents Latitude?",
            "criteria": col_criteria
        },
        "lng_col": {
            "type": "choice",
            "instructions": "Which column represents Longitude?",
            "criteria": col_criteria
        }
    }
    state = {
        "dataset_name": dataset["name"],
        "headers": dataset["headers"],
        "sample": dataset["sample"]
    }
    return evaluate(state, questions)

def main():
    print("=" * 65)
    print("   DYAD: TypeSafe Jev Dataset Classifier Test Runner (Python)")
    print("=" * 65)

    if not API_KEY:
        print("\n[!] No TYPESAFE_API_KEY detected in .env.")
        print("    Add your key in prototype-dataset-classifier/.env to run live tests.")
        print("\nPre-configured test cases ready to execute:")
        for i, ds in enumerate(TEST_DATASETS, 1):
            print(f"  {i}. {ds['name']} -> Headers: {ds['headers']}")
        return

    print("\n[1] Pinging TypeSafe API...")
    ok, latency, msg = ping()
    if not ok:
        print(f"[x] Ping failed: {msg}")
        return
    print(f"[✓] {msg}\n")

    print("[2] Running classification on 4 Bengaluru datasets:\n")
    for ds in TEST_DATASETS:
        print(f"--- Dataset: {ds['name']} ---")
        try:
            res = classify(ds)
            answers = res["answers"]
            domain = answers["domain"]["choice"]
            conf = answers["domain"]["confidence"]
            has_coords = answers["has_coordinates"]["noul"] >= 0.5
            lat = answers["lat_col"]["choice"]
            lng = answers["lng_col"]["choice"]
            print(f"  Domain:          {domain.upper()} (Confidence: {conf*100:.1f}%)")
            print(f"  Has Coordinates: {'YES' if has_coords else 'NO'}")
            print(f"  Lat/Lng:         lat='{lat}', lng='{lng}'")
            print(f"  Latency:         {res['latency_ms']}ms | Tokens: in={res['usage']['input_tokens']}, out={res['usage']['output_tokens']}\n")
        except Exception as e:
            print(f"  [x] Failed: {e}\n")

if __name__ == "__main__":
    main()
