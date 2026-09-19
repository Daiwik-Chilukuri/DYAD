"""
DYAD: TypeSafe Jev Dataset Classifier & Normalizer Agent.
Wakes up when a dataset is added, evaluates its Schema Fingerprint using Jev System One,
categorizes it into the 5-agent system topology, and renames it to <class>-<whats_inside_dataset>.<ext>.
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Canonical Category Definitions
TARGET_CATEGORIES = {
    "demographics": "Municipal census, population density, socio-economic weights, ward boundaries, vulnerable communities, age/gender distributions",
    "economic_poi": "IT/Tech parks, commercial campuses, offices, hospitals, universities, retail hubs, employment figures, commercial land value",
    "mobility": "Road traffic congestion, TomTom speeds, travel time delay, BMTC bus routes/stops, vehicle counts, transit corridors, multimodal networks",
    "ecological": "Lakes, water bodies, wetlands, rajakaluves (stormwater drains), flood vulnerability, KTFD/NGT statutory buffers, green canopy",
    "other": "Administrative notes, generic non-spatial data, unclassifiable or corrupt datasets",
}

SUBTOPIC_CHOICES = {
    "ward_census": "BBMP ward demographics, census counts, population density, socio-economic indices",
    "tech_parks_and_jobs": "IT corridors, corporate tech parks, SEZs, employment centers, commercial offices",
    "healthcare_and_amenities": "Major hospitals, clinics, educational institutions, civic amenities",
    "traffic_and_congestion": "Road congestion, vehicle speeds, peak delay indexes, arterial travel times",
    "transit_and_feeder": "BMTC bus lines, stops, metro stations, first/last-mile networks, commuter routes",
    "lakes_and_wetlands": "Lakes, water bodies, tanks, wetlands, statutory conservation buffers (KTFD/NGT)",
    "stormwater_and_flooding": "Rajakaluves, stormwater channels, flood plains, low-lying inundation zones",
    "general_unclassified": "Unclassified, administrative, non-spatial, or miscellaneous content",
}

AGENT_ASSIGNMENTS = {
    "demographics": "Agent 2: Demographics & Equity Specialist Subagent",
    "economic_poi": "Agent 3: Economic & Land-Value Specialist Subagent",
    "mobility": "Agent 4: Mobility & Congestion Specialist Subagent",
    "ecological": "Agent 5: Ecological & Wetland Risk Specialist Subagent",
    "other": "None (Held in Staging)",
}


def load_env():
    """Auto-loads .env from prototype folder or project root."""
    search_paths = [
        Path(__file__).parent.parent / ".env",
        Path(__file__).parent.parent.parent / ".env",
    ]
    for p in search_paths:
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    v = v.strip().strip('"').strip("'")
                    if k not in os.environ and v:
                        os.environ[k] = v


load_env()


class JevDatasetClassifier:
    """TypeSafe Jev Dataset Classifier for DYAD."""

    def __init__(self, api_key: Optional[str] = None, endpoint: Optional[str] = None):
        self.api_key = api_key or os.environ.get("TYPESAFE_API_KEY") or os.environ.get("JEV_API_KEY") or ""
        self.endpoint = endpoint or "https://api.typesafe.ai/v1/systemone"

    def is_available(self) -> bool:
        return bool(self.api_key)

    def evaluate(self, state: Dict[str, Any], questions: Dict[str, Any]) -> Dict[str, Any]:
        """Calls TypeSafe System One API."""
        if not self.api_key:
            raise ValueError(
                "Missing TYPESAFE_API_KEY. Set it in prototype-dataset-classifier/.env"
            )

        payload = {
            "state": state,
            "model": "jev-latest",
            "questions": questions,
        }

        req = urllib.request.Request(
            self.endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key.strip()}",
                "Content-Type": "application/json",
            },
        )

        t0 = time.time()
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                elapsed_ms = int((time.time() - t0) * 1000)
                data = json.loads(resp.read().decode("utf-8"))
                data["latency_ms"] = elapsed_ms
                return data
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"TypeSafe HTTP Error {e.code}: {body}")

    def classify_fingerprint(self, fingerprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes a Schema Fingerprint (from sniffer.py) and executes Jev classification.
        """
        # Build dynamic column criteria for coordinate questions
        columns = fingerprint.get("columns", [])
        col_criteria = {"none": "No coordinate column found"}
        for col in columns[:30]:  # Cap at top 30 to stay concise
            col_criteria[col] = f"Column: {col}"

        questions = {
            "category": {
                "type": "choice",
                "instructions": "Which core urban planning category best describes this dataset?",
                "criteria": TARGET_CATEGORIES,
            },
            "subtopic": {
                "type": "choice",
                "instructions": "What specific domain entity or theme does this dataset primarily capture?",
                "criteria": SUBTOPIC_CHOICES,
            },
            "has_coordinates": {
                "type": "noul",
                "instructions": "Does this dataset contain spatial geometry, map polygons, or explicit latitude/longitude coordinates?",
            },
            "suitable_for_visualizer_agent": {
                "type": "noul",
                "instructions": "Can Agent 1 (Structured Output Spatial Visualizer) ingest this dataset to render points, lines, or polygons directly onto the Map Canvas?",
            },
            "lat_col": {
                "type": "choice",
                "instructions": "Which column contains Latitude coordinates (if any)?",
                "criteria": col_criteria,
            },
            "lng_col": {
                "type": "choice",
                "instructions": "Which column contains Longitude coordinates (if any)?",
                "criteria": col_criteria,
            },
        }

        state = {
            "filename": fingerprint.get("original_filename"),
            "file_format": fingerprint.get("file_format"),
            "geometry_type": fingerprint.get("geometry_type"),
            "columns": fingerprint.get("columns"),
            "sample_records": fingerprint.get("sample_records"),
        }

        # If API key is available, execute live TypeSafe Jev evaluation
        if self.is_available():
            api_res = self.evaluate(state, questions)
            answers = api_res.get("answers", {})

            cat = answers.get("category", {}).get("choice", "other")
            conf = answers.get("category", {}).get("confidence", 0.0)
            subtopic = answers.get("subtopic", {}).get("choice", "general_unclassified")
            has_coords = answers.get("has_coordinates", {}).get("noul", 0.0) >= 0.5
            viz_ready = answers.get("suitable_for_visualizer_agent", {}).get("noul", 0.0) >= 0.5
            lat_col = answers.get("lat_col", {}).get("choice", "none")
            lng_col = answers.get("lng_col", {}).get("choice", "none")
            latency_ms = api_res.get("latency_ms", 0)
        else:
            # Deterministic heuristic fallback when offline
            cat, subtopic, conf = self._fallback_classify(fingerprint)
            has_coords = fingerprint.get("has_coordinates", False)
            viz_ready = has_coords
            lat_col = fingerprint.get("lat_col") or "none"
            lng_col = fingerprint.get("lng_col") or "none"
            latency_ms = 0

        # Construct standardized downstream filename: <class>-<whats_inside_dataset>.<ext>
        clean_stem = fingerprint.get("clean_stem", "dataset")
        # Strip old category prefix if it already has one
        for c in TARGET_CATEGORIES.keys():
            if clean_stem.startswith(f"{c}_") or clean_stem.startswith(f"{c}-"):
                clean_stem = clean_stem[len(c) + 1 :]

        ext = fingerprint.get("file_extension", ".csv")
        whats_inside = f"{subtopic}_{clean_stem}" if subtopic != "general_unclassified" else clean_stem
        # Clean double underscores
        whats_inside = whats_inside.replace("__", "_").strip("_")
        renamed_filename = f"{cat}-{whats_inside}{ext}"

        return {
            "status": "success",
            "category": cat,
            "confidence": round(conf, 3),
            "subtopic": subtopic,
            "original_filename": fingerprint.get("original_filename"),
            "renamed_filename": renamed_filename,
            "primary_consumer": AGENT_ASSIGNMENTS.get(cat, "None (Other)"),
            "visualizer_agent_enabled": viz_ready,
            "spatial_metadata": {
                "file_format": fingerprint.get("file_format"),
                "geometry_type": fingerprint.get("geometry_type"),
                "has_coordinates": has_coords,
                "lat_column": lat_col if lat_col != "none" else None,
                "lng_column": lng_col if lng_col != "none" else None,
            },
            "columns": fingerprint.get("columns"),
            "sample_records": fingerprint.get("sample_records"),
            "jev_latency_ms": latency_ms,
        }

    def _fallback_classify(self, fp: Dict[str, Any]) -> Tuple[str, str, float]:
        """Heuristic classifier for offline development."""
        cols_text = " ".join([str(c).lower() for c in fp.get("columns", [])])
        fname = fp.get("original_filename", "").lower()
        combined = f"{fname} {cols_text}"

        if any(k in combined for k in ["ward", "census", "pop", "demograph", "sc_st"]):
            return "demographics", "ward_census", 0.95
        if any(k in combined for k in ["tech", "park", "hospital", "poi", "facility", "commercial", "office", "work"]):
            return "economic_poi", "tech_parks_and_jobs", 0.95
        if any(k in combined for k in ["speed", "delay", "traffic", "congestion", "tomtom", "bus", "route", "commute"]):
            return "mobility", "traffic_and_congestion", 0.95
        if any(k in combined for k in ["lake", "water", "wetland", "flood", "rain", "stormwater", "rajakaluve", "ngt", "ktfd"]):
            return "ecological", "lakes_and_wetlands", 0.95

        return "other", "general_unclassified", 0.70
