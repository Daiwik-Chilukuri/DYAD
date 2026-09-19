from __future__ import annotations

from typing import Any


def _metric(
    key: str,
    label: str,
    value: int | float | str | None,
    unit: str | None = None,
    precision: int | None = None,
) -> dict[str, Any]:
    metric: dict[str, Any] = {"key": key, "label": label, "value": value}
    if unit is not None:
        metric["unit"] = unit
    if precision is not None:
        metric["display_precision"] = precision
    return metric


def _point_feature(
    feature_id: str,
    coordinates: list[float],
    properties: dict[str, Any],
) -> dict[str, Any]:
    return {
        "type": "Feature",
        "id": feature_id,
        "geometry": {"type": "Point", "coordinates": coordinates},
        "properties": properties,
    }


def _feature_collection(features: list[dict[str, Any]]) -> dict[str, Any]:
    return {"type": "FeatureCollection", "features": features}


def _focus_point(
    *,
    focus_id: str,
    layer_id: str,
    feature_id: str,
    coordinates: list[float],
    title: str,
    subtitle: str,
    kind: str,
    severity: str = "info",
    zoom: float = 14.5,
) -> dict[str, Any]:
    longitude, latitude = coordinates
    return {
        "id": focus_id,
        "kind": kind,
        "title": title,
        "subtitle": subtitle,
        "severity": severity,
        "feature_ref": {"layer_id": layer_id, "feature_id": feature_id},
        "coordinate": {
            "longitude": longitude,
            "latitude": latitude,
        },
        "camera": {"zoom": zoom, "pitch": 45, "bearing": 0},
    }


def build_ui_payload(analysis: dict[str, Any]) -> dict[str, Any]:
    """Convert raw agent results into one stable, MapLibre-friendly response."""
    corridor = analysis["experiment"]
    agents = analysis["agents"]
    poi = agents["poi_agent"]
    census = agents["traffic_census_agent"]
    water = agents["water_bodies_agent"]
    mobility = agents["mobility_traffic_agent"]

    corridor_feature = {
        "type": "Feature",
        "id": "proposed-corridor",
        "geometry": {
            "type": "LineString",
            "coordinates": corridor["coordinates"],
        },
        "properties": {
            "name": corridor["name"],
            "kind": "proposed_corridor",
            "style_token": "corridor-proposed",
        },
    }

    poi_features = []
    ward_features = []
    water_features = []
    focus_points = []

    for cluster in poi["top_clusters"]:
        feature_id = f"poi-cluster-{cluster['cluster_id']}"
        title = cluster["examples"][0] if cluster["examples"] else "POI cluster"
        poi_features.append(
            _point_feature(
                feature_id,
                cluster["coordinates"],
                {
                    "kind": "poi_cluster",
                    "title": title,
                    "poi_count": cluster["poi_count"],
                    "category_counts": cluster["category_counts"],
                    "examples": cluster["examples"],
                    "style_token": "poi-cluster",
                    "source_agent": "poi_agent",
                },
            )
        )
        focus_points.append(
            _focus_point(
                focus_id=f"focus-{feature_id}",
                layer_id="poi-clusters",
                feature_id=feature_id,
                coordinates=cluster["coordinates"],
                title=title,
                subtitle=f"{cluster['poi_count']} POIs in this activity cluster",
                kind="poi_cluster",
            )
        )

    for ward in census["top_ward_impacts"]:
        ward_number = str(ward["ward_number"]).removesuffix(".0")
        feature_id = f"ward-{ward_number}"
        ward_features.append(
            _point_feature(
                feature_id,
                ward["coordinates"],
                {
                    "kind": "ward_impact",
                    "ward_number": ward["ward_number"],
                    "ward_name": ward["ward_name"],
                    "population_reached_2011": round(
                        ward["population_reached_2011"]
                    ),
                    "overlap_ratio": ward["overlap_ratio"],
                    "sc_st_share": ward["sc_st_share"],
                    "style_token": "ward-impact",
                    "source_agent": "traffic_census_agent",
                },
            )
        )
        focus_points.append(
            _focus_point(
                focus_id=f"focus-{feature_id}",
                layer_id="ward-impacts",
                feature_id=feature_id,
                coordinates=ward["coordinates"],
                title=ward["ward_name"],
                subtitle=(
                    f"Approximately {round(ward['population_reached_2011']):,} "
                    "Census-2011 residents in catchment"
                ),
                kind="ward_impact",
                zoom=13.5,
            )
        )

    for index, watchpoint in enumerate(water["watchpoints"]):
        source_id = watchpoint.get("source_id") or str(index)
        feature_id = f"water-watchpoint-{source_id}"
        title = watchpoint.get("name") or f"Unnamed {watchpoint['kind']}"
        severity = "critical" if watchpoint["intersects_alignment"] else "warning"
        water_features.append(
            _point_feature(
                feature_id,
                watchpoint["coordinates"],
                {
                    **watchpoint,
                    "kind": "water_watchpoint",
                    "water_kind": watchpoint["kind"],
                    "title": title,
                    "severity": severity,
                    "style_token": f"environment-{severity}",
                    "source_agent": "water_bodies_agent",
                },
            )
        )
        focus_points.append(
            _focus_point(
                focus_id=f"focus-{feature_id}",
                layer_id="water-watchpoints",
                feature_id=feature_id,
                coordinates=watchpoint["coordinates"],
                title=title,
                subtitle=(
                    "Alignment intersection"
                    if watchpoint["intersects_alignment"]
                    else f"{watchpoint['distance_m']:.1f} m from alignment"
                ),
                kind="water_watchpoint",
                severity=severity,
                zoom=15,
            )
        )

    metro_model = mobility["gtfs_schedule_model"]
    road = mobility["road_comparison"]
    agent_results = {
        "poi_agent": {
            "status": "success",
            "title": "Economic and social activity",
            "method": poi["algorithm"],
            "metrics": [
                _metric("poi_count", "POIs in catchment", poi["poi_count"], "count"),
                _metric("cluster_count", "Activity clusters", poi["cluster_count"], "count"),
                _metric("noise_poi_count", "Unclustered POIs", poi["noise_poi_count"], "count"),
            ],
            "breakdown": {"categories": poi["category_counts"]},
            "warnings": poi["limitations"],
        },
        "traffic_census_agent": {
            "status": "success",
            "title": "Population and equity catchment",
            "method": census["algorithm"],
            "metrics": [
                _metric("ward_count", "Intersected wards", census["intersected_ward_count"], "count"),
                _metric("population_reached_2011", "Population reached", census["area_weighted_population_reached_2011"], "people"),
                _metric("sc_st_share", "Population-weighted SC/ST share", census["population_weighted_sc_st_share"] * 100, "percent", 1),
            ],
            "breakdown": {"catchment_archetypes": census["catchment_archetypes"]},
            "warnings": census["limitations"],
        },
        "water_bodies_agent": {
            "status": "success",
            "title": "Water-body proximity screening",
            "method": water["algorithm"],
            "metrics": [
                _metric("watchpoint_count", "Environmental watchpoints", water["watchpoint_count"], "count"),
                _metric("intersection_count", "Alignment intersections", water["alignment_intersection_count"], "count"),
                _metric("watch_distance_m", "Screening distance", water["watch_distance_m"], "metres"),
            ],
            "warnings": water["limitations"],
        },
        "mobility_traffic_agent": {
            "status": "success",
            "title": "Mobility and road comparison",
            "method": {"model": metro_model["model"], "road_scenario": "BPR"},
            "metrics": [
                _metric("corridor_length_km", "Corridor length", mobility["corridor_length_km"], "kilometres", 2),
                _metric("projected_metro_minutes", "Projected metro time", metro_model["projected_metro_minutes"], "minutes", 1),
                _metric("road_minutes", "Road baseline", road["road_minutes_at_13_9_kmh"], "minutes", 1),
                _metric("minutes_saved", "Projected one-way time saved", road["projected_minutes_saved_one_way"], "minutes", 1),
            ],
            "breakdown": {
                "gtfs_model": metro_model,
                "road_comparison": road,
                "road_widths": mobility["road_widths"],
                "historical_city_context": mobility["historical_city_context"],
            },
            "warnings": mobility["limitations"],
        },
    }

    return {
        "$schema": "../../schemas/corridor-analysis-response.schema.json",
        "schema_version": "1.0.0",
        "analysis_id": corridor["id"],
        "status": "success",
        "generated_at": analysis["generated_at"],
        "coordinate_reference_system": {
            "name": "EPSG:4326",
            "geojson_coordinate_order": ["longitude", "latitude"],
        },
        "request": {
            "corridor": corridor_feature,
            "catchment_m": poi["catchment_m"],
        },
        "summary": {
            "corridor_length_km": mobility["corridor_length_km"],
            "population_reached_2011": census["area_weighted_population_reached_2011"],
            "poi_count": poi["poi_count"],
            "water_watchpoint_count": water["watchpoint_count"],
            "water_intersection_count": water["alignment_intersection_count"],
            "projected_metro_minutes": metro_model["projected_metro_minutes"],
            "projected_minutes_saved_one_way": road["projected_minutes_saved_one_way"],
        },
        "agents": agent_results,
        "map": {
            "layers": [
                {
                    "id": "proposed-corridor",
                    "source_agent": "request",
                    "render_as": "line",
                    "style_token": "corridor-proposed",
                    "geojson": _feature_collection([corridor_feature]),
                },
                {
                    "id": "poi-clusters",
                    "source_agent": "poi_agent",
                    "render_as": "circle",
                    "style_token": "poi-cluster",
                    "geojson": _feature_collection(poi_features),
                },
                {
                    "id": "ward-impacts",
                    "source_agent": "traffic_census_agent",
                    "render_as": "circle",
                    "style_token": "ward-impact",
                    "geojson": _feature_collection(ward_features),
                },
                {
                    "id": "water-watchpoints",
                    "source_agent": "water_bodies_agent",
                    "render_as": "circle",
                    "style_token": "environment-risk",
                    "geojson": _feature_collection(water_features),
                },
            ],
            "focus_points": focus_points,
        },
        "errors": [],
    }
