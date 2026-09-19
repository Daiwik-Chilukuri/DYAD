"""
Format-Agnostic Schema Sniffer for DYAD.
Extracts schema fingerprints, geometry types, and sample records from any dataset
format (.csv, .tsv, .json, .geojson, .parquet) without loading the full file into memory.
"""

from __future__ import annotations

import csv
import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


def sanitize_slug(name: str) -> str:
    """Converts a raw string/filename into a clean snake_case slug."""
    s = re.sub(r"[^\w\s-]", "", name).strip().lower()
    s = re.sub(r"[-\s]+", "_", s)
    return s.strip("_")


def detect_coordinate_columns(columns: List[str]) -> Tuple[Optional[str], Optional[str]]:
    """Detects likely latitude and longitude column names."""
    lat_candidates = {"latitude", "lat", "y", "geo_lat", "start_lat", "stop_lat", "wpt_lat"}
    lng_candidates = {"longitude", "lon", "lng", "long", "x", "geo_lon", "geo_lng", "start_lon", "stop_lon"}

    detected_lat = None
    detected_lng = None

    for col in columns:
        cleaned = col.strip().lower()
        if cleaned in lat_candidates and not detected_lat:
            detected_lat = col
        elif cleaned in lng_candidates and not detected_lng:
            detected_lng = col

    return detected_lat, detected_lng


def sniff_csv(filepath: Path) -> Dict[str, Any]:
    """Sniffs CSV/TSV headers and first 2 rows."""
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        # Detect delimiter using Sniffer
        sample_chunk = f.read(4096)
        delimiter = ","
        try:
            dialect = csv.Sniffer().sniff(sample_chunk)
            delimiter = dialect.delimiter
        except Exception:
            if "\t" in sample_chunk:
                delimiter = "\t"

        f.seek(0)
        reader = csv.reader(f, delimiter=delimiter)
        headers = [h.strip() for h in next(reader, []) if h.strip()]
        
        sample_rows = []
        for _ in range(2):
            row = next(reader, None)
            if row:
                sample_rows.append(dict(zip(headers, row)))

    lat_col, lng_col = detect_coordinate_columns(headers)
    geometry_type = "Point (tabular)" if (lat_col and lng_col) else "None (tabular)"

    return {
        "file_format": "CSV" if delimiter == "," else "TSV",
        "geometry_type": geometry_type,
        "columns": headers,
        "sample_records": sample_rows,
        "lat_col": lat_col,
        "lng_col": lng_col,
        "has_coordinates": bool(lat_col and lng_col),
    }


def sniff_geojson(filepath: Path) -> Dict[str, Any]:
    """Sniffs GeoJSON feature collection geometry and properties."""
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        data = json.load(f)

    geom_type = "Unknown GeoJSON"
    properties_keys: List[str] = []
    sample_records: List[Dict[str, Any]] = []

    if isinstance(data, dict):
        if data.get("type") == "FeatureCollection" and data.get("features"):
            first_feat = data["features"][0]
            geom = first_feat.get("geometry", {})
            geom_type = f"GeoJSON ({geom.get('type', 'Feature')})"
            props = first_feat.get("properties", {})
            properties_keys = list(props.keys()) if isinstance(props, dict) else []
            sample_records.append(props)
        elif data.get("type") == "Feature":
            geom = data.get("geometry", {})
            geom_type = f"GeoJSON ({geom.get('type', 'Feature')})"
            props = data.get("properties", {})
            properties_keys = list(props.keys()) if isinstance(props, dict) else []
            sample_records.append(props)

    lat_col, lng_col = detect_coordinate_columns(properties_keys)

    return {
        "file_format": "GeoJSON",
        "geometry_type": geom_type,
        "columns": properties_keys,
        "sample_records": sample_records,
        "lat_col": lat_col or "geometry.coordinates",
        "lng_col": lng_col or "geometry.coordinates",
        "has_coordinates": True,  # GeoJSON inherently carries spatial geometry
    }


def sniff_geojsonl(filepath: Path) -> Dict[str, Any]:
    """Sniffs GeoJSON Lines (.geojsonl) where each line is a GeoJSON Feature."""
    sample_records: List[Dict[str, Any]] = []
    properties_keys: List[str] = []
    geom_type = "GeoJSONL"

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        for _ in range(3):
            line = f.readline()
            if not line.strip():
                continue
            try:
                feat = json.loads(line)
                geom = feat.get("geometry", {})
                if geom and geom_type == "GeoJSONL":
                    geom_type = f"GeoJSONL ({geom.get('type', 'Feature')})"
                props = feat.get("properties", {})
                if isinstance(props, dict):
                    sample_records.append(props)
                    for k in props.keys():
                        if k not in properties_keys:
                            properties_keys.append(k)
            except Exception:
                pass

    lat_col, lng_col = detect_coordinate_columns(properties_keys)

    return {
        "file_format": "GeoJSONL",
        "geometry_type": geom_type,
        "columns": properties_keys,
        "sample_records": sample_records,
        "lat_col": lat_col or "geometry.coordinates",
        "lng_col": lng_col or "geometry.coordinates",
        "has_coordinates": True,
    }


def sniff_json(filepath: Path) -> Dict[str, Any]:
    """Sniffs arbitrary JSON (array of objects, Overpass API export, or key-value dictionary)."""
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        data = json.load(f)

    # Check if it's actually GeoJSON with a .json extension
    if isinstance(data, dict) and data.get("type") in ("FeatureCollection", "Feature"):
        return sniff_geojson(filepath)

    # Check if it's an OpenStreetMap Overpass JSON export
    if isinstance(data, dict) and "elements" in data and isinstance(data["elements"], list):
        elements = data["elements"]
        sample_records = []
        keys = ["id", "type", "lat", "lon"]
        for elem in elements[:3]:
            rec = {"id": elem.get("id"), "type": elem.get("type"), "lat": elem.get("lat"), "lon": elem.get("lon")}
            tags = elem.get("tags", {})
            if isinstance(tags, dict):
                for tk, tv in tags.items():
                    if tk not in keys:
                        keys.append(tk)
                    rec[tk] = tv
            sample_records.append(rec)

        return {
            "file_format": "OSM_JSON",
            "geometry_type": "Point (OSM Nodes)",
            "columns": keys,
            "sample_records": sample_records,
            "lat_col": "lat",
            "lng_col": "lon",
            "has_coordinates": True,
        }

    keys: List[str] = []
    sample_records: List[Dict[str, Any]] = []

    if isinstance(data, list) and data and isinstance(data[0], dict):
        keys = list(data[0].keys())
        sample_records = data[:2]
    elif isinstance(data, dict):
        keys = list(data.keys())
        sample_records = [data]

    lat_col, lng_col = detect_coordinate_columns(keys)
    geom_type = "Point (tabular JSON)" if (lat_col and lng_col) else "None (JSON)"

    return {
        "file_format": "JSON",
        "geometry_type": geom_type,
        "columns": keys,
        "sample_records": sample_records,
        "lat_col": lat_col,
        "lng_col": lng_col,
        "has_coordinates": bool(lat_col and lng_col),
    }


def sniff_kml(filepath: Path) -> Dict[str, Any]:
    """Sniffs KML files for Placemarks, geometry types, and SimpleField schema."""
    import xml.etree.ElementTree as ET
    columns = []
    sample_records = []
    geom_type = "KML"

    try:
        tree = ET.parse(filepath)
        root = tree.getroot()
        ns = {'kml': 'http://www.opengis.net/kml/2.2'}
        
        # Discover SimpleField definitions
        for sf in root.findall('.//kml:SimpleField', ns):
            name = sf.attrib.get('name')
            if name and name not in columns:
                columns.append(name)

        # Check Placemarks
        placemarks = root.findall('.//kml:Placemark', ns)
        if placemarks:
            p0 = placemarks[0]
            if p0.find('.//kml:Polygon', ns) is not None:
                geom_type = "KML (Polygon)"
            elif p0.find('.//kml:LineString', ns) is not None:
                geom_type = "KML (LineString)"
            elif p0.find('.//kml:Point', ns) is not None:
                geom_type = "KML (Point)"

            for p in placemarks[:2]:
                rec = {}
                name_el = p.find('kml:name', ns)
                if name_el is not None and name_el.text:
                    rec["name"] = name_el.text
                    if "name" not in columns:
                        columns.insert(0, "name")
                for sd in p.findall('.//kml:SimpleData', ns):
                    attr_name = sd.attrib.get('name')
                    if attr_name:
                        rec[attr_name] = sd.text
                sample_records.append(rec)
    except Exception as e:
        geom_type = f"KML (Parse Error: {e})"

    return {
        "file_format": "KML",
        "geometry_type": geom_type,
        "columns": columns or ["name", "geometry"],
        "sample_records": sample_records,
        "lat_col": "coordinates",
        "lng_col": "coordinates",
        "has_coordinates": True,
    }


def sniff_parquet(filepath: Path) -> Dict[str, Any]:
    """Sniffs Parquet file schema via pyarrow or fastparquet if available."""
    columns: List[str] = []
    sample_records: List[Dict[str, Any]] = []
    has_geom = False
    geom_type = "None (Parquet)"

    try:
        import pyarrow.parquet as pq
        table = pq.read_table(filepath)
        columns = table.column_names
        # Convert first 2 rows
        sample_df = table.slice(0, 2).to_pandas()
        sample_records = sample_df.to_dict(orient="records")
    except Exception:
        # Fallback if pyarrow is not installed
        try:
            import pandas as pd
            df = pd.read_parquet(filepath)
            columns = list(df.columns)
            sample_records = df.head(2).to_dict(orient="records")
        except Exception as e:
            columns = [f"parquet_binary_{filepath.name}"]

    lat_col, lng_col = detect_coordinate_columns(columns)
    if "geometry" in columns or (lat_col and lng_col):
        has_geom = True
        geom_type = "GeoParquet" if "geometry" in columns else "Point (Parquet)"

    return {
        "file_format": "Parquet",
        "geometry_type": geom_type,
        "columns": columns,
        "sample_records": sample_records,
        "lat_col": lat_col,
        "lng_col": lng_col,
        "has_coordinates": has_geom,
    }


def sniff_dataset(file_path: str | Path) -> Dict[str, Any]:
    """
    Main entry point: Inspects any dataset file and produces a standardized Schema Fingerprint
    ready for TypeSafe Jev evaluation.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found at: {path}")

    ext = path.suffix.lower()
    raw_name = path.name
    base_stem = path.stem

    if ext in (".csv", ".tsv", ".txt"):
        res = sniff_csv(path)
    elif ext == ".geojson":
        res = sniff_geojson(path)
    elif ext == ".geojsonl":
        res = sniff_geojsonl(path)
    elif ext == ".json":
        res = sniff_json(path)
    elif ext == ".kml":
        res = sniff_kml(path)
    elif ext in (".parquet", ".pq"):
        res = sniff_parquet(path)
    else:
        # Generic fallback
        res = {
            "file_format": ext.replace(".", "").upper() or "UNKNOWN",
            "geometry_type": "Unknown",
            "columns": [base_stem],
            "sample_records": [],
            "lat_col": None,
            "lng_col": None,
            "has_coordinates": False,
        }

    res["original_filename"] = raw_name
    res["file_extension"] = ext
    res["clean_stem"] = sanitize_slug(base_stem)
    res["file_size_bytes"] = path.stat().st_size
    return res
