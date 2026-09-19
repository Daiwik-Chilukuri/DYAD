from __future__ import annotations

import csv
import json
import re
import zipfile
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable
from xml.etree import ElementTree as ET

from .catalog import ROOT

def _feature_collection(features: Iterable[dict[str, Any]]) -> dict[str, Any]:
    return {"type": "FeatureCollection", "features": list(features)}


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


def _normal_key(value: object) -> str:
    return re.sub(r"[^a-z0-9]", "", str(value).casefold())


def _normal_ward_number(value: object) -> str:
    try:
        return str(int(float(str(value).strip())))
    except ValueError:
        return _normal_key(value)


def _first_value(properties: dict[str, Any], candidates: set[str]) -> Any:
    for key, value in properties.items():
        if _normal_key(key) in candidates and value not in (None, ""):
            return value
    return None


def normalize_gtfs(
    source: Path | None = None, output_directory: Path | None = None
) -> list[Path]:
    source = source or ROOT / "raw/metro/bmrcl.zip"
    output_directory = output_directory or ROOT / "normalized/metro"
    if not source.exists():
        raise FileNotFoundError(source)
    output_directory.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(source) as archive:
        required = {"stops.txt", "routes.txt", "trips.txt", "shapes.txt", "stop_times.txt"}
        missing = required - set(archive.namelist())
        if missing:
            raise ValueError(f"GTFS is missing required tables: {sorted(missing)}")

        def read_table(name: str) -> list[dict[str, str]]:
            with archive.open(name) as raw:
                text = (line.decode("utf-8-sig") for line in raw)
                return list(csv.DictReader(text))

        stops = read_table("stops.txt")
        routes = {row["route_id"]: row for row in read_table("routes.txt")}
        trips = read_table("trips.txt")
        shapes = read_table("shapes.txt")
        stop_times = read_table("stop_times.txt")

    station_features = []
    stop_parent = {
        stop["stop_id"]: stop.get("parent_station") or stop["stop_id"] for stop in stops
    }
    for stop in stops:
        if stop.get("location_type") != "1":
            continue
        if not stop.get("stop_lat") or not stop.get("stop_lon"):
            continue
        properties = {
            "source_id": stop["stop_id"],
            "station_name": stop.get("stop_name", "").strip(),
            "station_code": stop.get("stop_code", "").strip() or None,
            "source_name": "bmrcl_gtfs_unofficial",
        }
        station_features.append(
            {
                "type": "Feature",
                "id": stop["stop_id"],
                "properties": properties,
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(stop["stop_lon"]), float(stop["stop_lat"])],
                },
            }
        )

    shape_points: dict[str, list[tuple[int, list[float]]]] = defaultdict(list)
    for row in shapes:
        shape_points[row["shape_id"]].append(
            (
                int(row["shape_pt_sequence"]),
                [float(row["shape_pt_lon"]), float(row["shape_pt_lat"])],
            )
        )
    shape_routes: dict[str, str] = {}
    for trip in trips:
        if trip.get("shape_id"):
            shape_routes.setdefault(trip["shape_id"], trip["route_id"])

    line_features = []
    for shape_id, points in shape_points.items():
        route = routes.get(shape_routes.get(shape_id, ""), {})
        coordinates = [coordinate for _, coordinate in sorted(points)]
        if len(coordinates) < 2:
            continue
        line_features.append(
            {
                "type": "Feature",
                "id": shape_id,
                "properties": {
                    "source_id": shape_id,
                    "route_id": route.get("route_id"),
                    "route_name": route.get("route_long_name")
                    or route.get("route_short_name"),
                    "route_color": route.get("route_color") or None,
                    "source_name": "bmrcl_gtfs_unofficial",
                },
                "geometry": {"type": "LineString", "coordinates": coordinates},
            }
        )

    trip_routes = {row["trip_id"]: row["route_id"] for row in trips}
    ordered_stops: dict[str, list[tuple[int, str]]] = defaultdict(list)
    for row in stop_times:
        ordered_stops[row["trip_id"]].append(
            (int(row["stop_sequence"]), row["stop_id"])
        )
    unique_edges: set[tuple[str, str, str]] = set()
    for trip_id, sequence in ordered_stops.items():
        route_id = trip_routes.get(trip_id, "")
        stop_ids = [stop_parent.get(stop_id, stop_id) for _, stop_id in sorted(sequence)]
        for origin, destination in zip(stop_ids, stop_ids[1:]):
            if origin != destination:
                unique_edges.add((route_id, origin, destination))

    stations_path = output_directory / "stations.geojson"
    lines_path = output_directory / "lines.geojson"
    edges_path = output_directory / "network_edges.csv"
    _write_json(stations_path, _feature_collection(station_features))
    _write_json(lines_path, _feature_collection(line_features))
    with edges_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["route_id", "origin_stop_id", "destination_stop_id"])
        writer.writerows(sorted(unique_edges))
    return [stations_path, lines_path, edges_path]


def normalize_wards_and_census(
    wards_path: Path | None = None,
    census_path: Path | None = None,
    output_path: Path | None = None,
) -> Path:
    wards_path = wards_path or ROOT / "raw/demographics/bbmp_wards_198.geojson"
    census_path = census_path or ROOT / "raw/demographics/bengaluru_ward_census_2011.csv"
    output_path = output_path or ROOT / "normalized/demographics/wards_with_census.geojson"
    if not wards_path.exists():
        raise FileNotFoundError(wards_path)
    if not census_path.exists():
        raise FileNotFoundError(census_path)

    wards = json.loads(wards_path.read_text(encoding="utf-8-sig"))
    with census_path.open(encoding="utf-8-sig", newline="") as handle:
        census_rows = list(csv.DictReader(handle))

    census_by_number: dict[str, dict[str, str]] = {}
    census_by_name: dict[str, dict[str, str]] = {}
    for row in census_rows:
        number = _first_value(row, {"wardnum", "wardnumber", "wardno"})
        name = _first_value(row, {"wardname", "name"})
        if number is not None:
            census_by_number[_normal_ward_number(number)] = row
        if name:
            census_by_name[_normal_key(name)] = row

    matched = 0
    for feature in wards.get("features", []):
        properties = feature.setdefault("properties", {})
        number = _first_value(
            properties, {"wardno", "wardnum", "wardnumber", "wardid"}
        )
        name = _first_value(properties, {"wardname", "name"})
        row = None
        if number is not None:
            row = census_by_number.get(_normal_ward_number(number))
        if row is None and name:
            row = census_by_name.get(_normal_key(name))
        if row is not None:
            matched += 1
            population = _first_value(row, {"population", "totalpopulation"})
            male = _first_value(row, {"male", "malepopulation"})
            female = _first_value(row, {"female", "femalepopulation"})
            sc_population = _first_value(row, {"scpopulation"})
            st_population = _first_value(row, {"stpopulation"})
            for target_key, value in {
                "population_2011": population,
                "male_2011": male,
                "female_2011": female,
                "sc_population_2011": sc_population,
                "st_population_2011": st_population,
            }.items():
                try:
                    properties[target_key] = int(str(value).replace(",", ""))
                except (TypeError, ValueError):
                    properties[target_key] = None
            properties["census_join_status"] = "matched"
        else:
            properties["census_join_status"] = "unmatched"
        properties["source_name"] = "bbmp_wards_198+bengaluru_ward_census_2011"

    wards.setdefault("metadata", {})["census_rows_matched"] = matched
    wards["metadata"]["census_rows_total"] = len(census_rows)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    _write_json(output_path, wards)
    return output_path


def normalize_geojson(source: Path, output: Path, source_name: str) -> Path:
    text = source.read_text(encoding="utf-8-sig")
    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        features = [json.loads(line) for line in text.splitlines() if line.strip()]
        if not all(feature.get("type") == "Feature" for feature in features):
            raise ValueError(f"{source} is neither GeoJSON nor GeoJSON Lines")
        payload = _feature_collection(features)
    if payload.get("type") == "Feature":
        payload = _feature_collection([payload])
    if payload.get("type") != "FeatureCollection":
        raise ValueError(f"{source} is not a GeoJSON FeatureCollection")
    for index, feature in enumerate(payload.get("features", [])):
        properties = feature.setdefault("properties", {})
        properties.setdefault("source_id", str(feature.get("id", index)))
        properties["source_name"] = source_name
    _write_json(output, payload)
    return output


def _poi_category(tags: dict[str, Any]) -> str:
    amenity = tags.get("amenity")
    if amenity in {"hospital", "clinic", "doctors", "pharmacy"}:
        return "healthcare"
    if amenity in {"college", "university", "school", "kindergarten"}:
        return "education"
    if amenity in {"government", "townhall"} or tags.get("office") == "government":
        return "civic"
    if tags.get("railway") == "station" or tags.get("public_transport") == "station":
        return "public_transit"
    if tags.get("office"):
        return "corporate"
    if tags.get("shop") in {"mall", "department_store"}:
        return "commercial"
    return "other"


def normalize_overpass_pois(
    source: Path | None = None, output: Path | None = None
) -> Path:
    source = source or ROOT / "raw/poi/osm_bengaluru_pois.json"
    output = output or ROOT / "normalized/poi/pois.geojson"
    if not source.exists():
        raise FileNotFoundError(source)
    payload = json.loads(source.read_text(encoding="utf-8"))
    features: list[dict[str, Any]] = []
    seen: set[tuple[str, int]] = set()
    for element in payload.get("elements", []):
        element_key = (str(element.get("type")), int(element.get("id", 0)))
        if element_key in seen:
            continue
        seen.add(element_key)
        latitude = element.get("lat") or element.get("center", {}).get("lat")
        longitude = element.get("lon") or element.get("center", {}).get("lon")
        if latitude is None or longitude is None:
            continue
        tags = element.get("tags", {})
        category = _poi_category(tags)
        if category == "other":
            continue
        source_id = f"{element_key[0]}/{element_key[1]}"
        features.append(
            {
                "type": "Feature",
                "id": source_id,
                "properties": {
                    "source_id": source_id,
                    "source_name": "osm_bengaluru_pois",
                    "name": tags.get("name") or tags.get("name:en"),
                    "category": category,
                    "amenity": tags.get("amenity"),
                    "office": tags.get("office"),
                    "railway": tags.get("railway"),
                    "public_transport": tags.get("public_transport"),
                    "osm_type": element_key[0],
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(longitude), float(latitude)],
                },
            }
        )
    _write_json(output, _feature_collection(features))
    return output


def normalize_mobility_indicators(
    source: Path | None = None, output: Path | None = None
) -> Path:
    source = source or ROOT / "raw/mobility/bengaluru_mobility_indicators_2011.csv"
    output = output or ROOT / "normalized/mobility/mobility_indicators_2011.json"
    if not source.exists():
        raise FileNotFoundError(source)
    with source.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    normalized = []
    for row in rows:
        item: dict[str, Any] = {}
        for key, value in row.items():
            normalized_key = _snake_case(key)
            if normalized_key == "zone":
                item[normalized_key] = value.strip()
                continue
            cleaned = value.strip().replace(",", "")
            if cleaned.endswith("%"):
                item[f"{normalized_key}_pct"] = float(cleaned[:-1])
            else:
                item[normalized_key] = _coerce_scalar(cleaned)
        normalized.append(item)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(normalized, indent=2) + "\n", encoding="utf-8")
    return output


def _local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _snake_case(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9]+", "_", value).strip("_")
    return value.casefold()


def _coerce_scalar(value: str | None) -> Any:
    if value is None:
        return None
    value = value.strip()
    if not value:
        return None
    try:
        return int(value)
    except ValueError:
        try:
            return float(value)
        except ValueError:
            return value


def _parse_coordinate_text(text: str | None) -> list[list[float]]:
    coordinates: list[list[float]] = []
    for token in (text or "").split():
        values = token.split(",")
        if len(values) >= 2:
            coordinates.append([float(values[0]), float(values[1])])
    return coordinates


def _geometry_from_element(element: ET.Element) -> dict[str, Any] | None:
    kind = _local_name(element.tag)
    if kind == "Point":
        coordinate_element = next(
            (child for child in element.iter() if _local_name(child.tag) == "coordinates"),
            None,
        )
        coordinates = _parse_coordinate_text(
            coordinate_element.text if coordinate_element is not None else None
        )
        return {"type": "Point", "coordinates": coordinates[0]} if coordinates else None
    if kind == "LineString":
        coordinate_element = next(
            (child for child in element.iter() if _local_name(child.tag) == "coordinates"),
            None,
        )
        coordinates = _parse_coordinate_text(
            coordinate_element.text if coordinate_element is not None else None
        )
        return (
            {"type": "LineString", "coordinates": coordinates}
            if len(coordinates) >= 2
            else None
        )
    if kind == "Polygon":
        rings: list[list[list[float]]] = []
        for boundary in element:
            boundary_kind = _local_name(boundary.tag)
            if boundary_kind not in {"outerBoundaryIs", "innerBoundaryIs"}:
                continue
            coordinate_element = next(
                (child for child in boundary.iter() if _local_name(child.tag) == "coordinates"),
                None,
            )
            ring = _parse_coordinate_text(
                coordinate_element.text if coordinate_element is not None else None
            )
            if len(ring) >= 4:
                rings.append(ring)
        return {"type": "Polygon", "coordinates": rings} if rings else None
    if kind == "MultiGeometry":
        geometries = [
            geometry
            for child in element
            if (geometry := _geometry_from_element(child)) is not None
        ]
        if not geometries:
            return None
        types = {geometry["type"] for geometry in geometries}
        if types == {"Point"}:
            return {
                "type": "MultiPoint",
                "coordinates": [geometry["coordinates"] for geometry in geometries],
            }
        if types == {"LineString"}:
            return {
                "type": "MultiLineString",
                "coordinates": [geometry["coordinates"] for geometry in geometries],
            }
        if types == {"Polygon"}:
            return {
                "type": "MultiPolygon",
                "coordinates": [geometry["coordinates"] for geometry in geometries],
            }
        return {"type": "GeometryCollection", "geometries": geometries}
    return None


def _placemark_geometry(placemark: ET.Element) -> dict[str, Any] | None:
    for child in placemark:
        if _local_name(child.tag) in {"Point", "LineString", "Polygon", "MultiGeometry"}:
            return _geometry_from_element(child)
    return None


def normalize_kml(source: Path, output: Path, source_name: str) -> Path:
    if not source.exists():
        raise FileNotFoundError(source)
    features: list[dict[str, Any]] = []
    for _, element in ET.iterparse(source, events=("end",)):
        if _local_name(element.tag) != "Placemark":
            continue
        properties: dict[str, Any] = {}
        for child in element:
            if _local_name(child.tag) == "name" and child.text:
                properties["name"] = child.text.strip()
        for child in element.iter():
            if _local_name(child.tag) == "SimpleData" and child.get("name"):
                properties[_snake_case(child.get("name", ""))] = _coerce_scalar(child.text)
        geometry = _placemark_geometry(element)
        if geometry is not None:
            source_id = (
                properties.get("objectid")
                or properties.get("uniqueid")
                or properties.get("name")
                or len(features)
            )
            properties["source_id"] = str(source_id)
            properties["source_name"] = source_name
            features.append(
                {
                    "type": "Feature",
                    "id": str(source_id),
                    "properties": properties,
                    "geometry": geometry,
                }
            )
        element.clear()
    _write_json(output, _feature_collection(features))
    return output


def normalize_available() -> dict[str, str]:
    jobs = {
        "metro": lambda: normalize_gtfs(),
        "wards_census": lambda: normalize_wards_and_census(),
        "slums": lambda: normalize_geojson(
            ROOT / "raw/demographics/bengaluru_urban_slums.geojsonl",
            ROOT / "normalized/demographics/underserved_areas.geojson",
            "bengaluru_urban_slums",
        ),
        "pois": lambda: normalize_overpass_pois(),
        "mobility_indicators": lambda: normalize_mobility_indicators(),
        "road_widths": lambda: normalize_kml(
            ROOT / "raw/roads/bengaluru_road_widths.kml",
            ROOT / "normalized/roads/road_widths.geojson",
            "bengaluru_road_widths",
        ),
        "lakes_streams": lambda: normalize_kml(
            ROOT / "raw/environment/atree_lakes_streams.kml",
            ROOT / "normalized/environment/lakes_streams.geojson",
            "atree_lakes_streams",
        ),
    }
    results: dict[str, str] = {}
    for name, job in jobs.items():
        try:
            outputs = job()
            if isinstance(outputs, list):
                results[name] = ", ".join(
                    str(path.relative_to(ROOT)) for path in outputs
                )
            else:
                results[name] = str(outputs.relative_to(ROOT))
        except FileNotFoundError as error:
            missing = Path(error.filename or error.args[0])
            results[name] = f"skipped: missing {missing.relative_to(ROOT)}"
    return results
