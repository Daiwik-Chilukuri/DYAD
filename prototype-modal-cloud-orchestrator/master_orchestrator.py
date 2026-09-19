"""
DYAD: Local Master Orchestrator Engine.
Runs locally / in the web backend on 'gpt-5.6-sol' (16k max completion tokens).
Oversees and coordinates the entire multi-agent workflow:
  1. Snaps origin & destination coordinates and generates corridor catchment buffer.
  2. Inspects active datasets in Modal Volume ('dyad-datasets-volume').
  3. CONDITIONAL DISPATCH RULE: Only spawns a subagent IF its corresponding keyword
     dataset exists in the volume.
  4. Executes active subagents in parallel across Modal cloud microVMs.
  5. Emits real-time SSE streaming telemetry and yields MapLibre GeoJSON features.
  6. Synthesizes the final comprehensive 16k-token Executive Authority Dossier.
"""

from __future__ import annotations

import asyncio
import json
import math
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Tuple

from openai import OpenAI
from pydantic import BaseModel, Field

# Ensure local .env is loaded
def load_local_env():
    search_paths = [
        Path(__file__).parent / ".env",
        Path(__file__).parent.parent / ".env",
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


load_local_env()

# Import schemas
try:
    from .schemas.dossier import (
        AuthorityDossier,
        DemographicsPillarMetrics,
        EcologicalPillarMetrics,
        EconomicPillarMetrics,
        MobilityPillarMetrics,
        RiskWarning,
        StationProposal,
        TelemetryEvent,
    )
except ImportError:
    from schemas.dossier import (
        AuthorityDossier,
        DemographicsPillarMetrics,
        EcologicalPillarMetrics,
        EconomicPillarMetrics,
        MobilityPillarMetrics,
        RiskWarning,
        StationProposal,
        TelemetryEvent,
    )


def haversine_km(coord1: List[float], coord2: List[float]) -> float:
    """Computes great-circle distance in kilometers between [lng, lat] points."""
    lng1, lat1 = coord1
    lng2, lat2 = coord2
    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return round(r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)


def generate_corridor_buffer_polygon(
    origin_coords: List[float],
    dest_coords: List[float],
    radius_meters: float = 1500.0,
) -> Tuple[Dict[str, Any], float]:
    """Generates a Shapely corridor buffer polygon in WGS84 GeoJSON format."""
    from shapely.geometry import LineString, mapping

    length_km = haversine_km(origin_coords, dest_coords)
    # Approximate degree buffer based on reference latitude (~12.97 deg N)
    ref_lat = origin_coords[1]
    deg_per_meter = 1.0 / (111139.0 * math.cos(math.radians(ref_lat)))
    buffer_deg = radius_meters * deg_per_meter

    line = LineString([origin_coords, dest_coords])
    poly = line.buffer(buffer_deg, cap_style="round")

    geojson_geom = mapping(poly)
    return geojson_geom, length_km


def compute_composite_viability_score(
    corridor_meta: Dict[str, Any],
    demog: Dict[str, Any],
    econ: Dict[str, Any],
    mob: Dict[str, Any],
    ecol: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Computes a deterministic, MoHUA & BMRCL-aligned composite feasibility score (0–100)
    across actively evaluated pillars, incorporating:
      - Transit physics spacing penalty for inter-station distances < 800m
      - Multi-modal network interchange bonus (+5.0 pts)
      - Explicit statutory KTFD lake setback and rajakaluve friction penalties
      - ZERO-OUT & ADAPTIVE RE-WEIGHTING: Skipped subagents evaluate to 0.0 and are
        excluded from the denominator so the final score accurately reflects available evidence.
    """
    length_km = max(0.05, float(corridor_meta.get("length_km", 1.0)))

    # Detect which pillars actually ran with empirical data
    has_demog = bool(demog and any(k in demog for k in ("catchment_population_500m", "equity_score", "dense_ward_names")))
    has_econ = bool(econ and any(k in econ for k in ("tech_parks_within_1km", "hospitals_within_1km", "commercial_centers_within_1km", "gravity_model_daily_trips", "projected_annual_farebox_inr_cr")))
    has_mob = bool(mob and any(k in mob for k in ("peak_hour_travel_time_saved_mins", "arterial_congestion_reduction_pct", "feeder_route_coverage_score")))
    has_ecol = bool(ecol and any(k in ecol for k in ("lake_buffer_infringements", "rajakaluve_buffer_infringements", "ktfd_compliance_status", "flood_vulnerability_grade")))

    # Pillar 1: Demographics
    if has_demog:
        pop_500m = int(demog.get("catchment_population_500m", int(length_km * 8500)))
        equity_score = float(demog.get("equity_score", 75.0))
        pop_density_per_km = pop_500m / max(0.5, length_km)
        pop_score = min(100.0, (pop_density_per_km / 12000.0) * 100.0)
        demog_score = round(max(20.0, min(100.0, 0.60 * pop_score + 0.40 * equity_score)), 1)
    else:
        demog_score = 0.0

    # Pillar 2: Economic & TOD
    if has_econ:
        tech_parks = int(econ.get("tech_parks_within_1km", 0))
        workforce = int(econ.get("total_tech_workforce_catchment", 0))
        hospitals = int(econ.get("hospitals_within_1km", 0))
        commercial = int(econ.get("commercial_centers_within_1km", 0))
        multiplier = float(econ.get("economic_multiplier_index", 1.0))
        activity_score = min(100.0, tech_parks * 22.0 + (workforce / 2500.0) + hospitals * 8.0 + commercial * 8.0)
        multiplier_score = min(100.0, (multiplier / 3.0) * 100.0)
        econ_score = round(max(20.0, min(100.0, 0.65 * activity_score + 0.35 * multiplier_score)), 1)
    else:
        econ_score = 0.0

    # Pillar 3: Mobility & Traffic
    if has_mob:
        time_saved = float(mob.get("peak_hour_travel_time_saved_mins", 0.0))
        congestion_red = float(mob.get("arterial_congestion_reduction_pct", 0.0))
        feeder_score = float(mob.get("feeder_route_coverage_score", 0.0))
        time_score = min(100.0, (time_saved / 30.0) * 100.0)
        cong_score = min(100.0, (congestion_red / 35.0) * 100.0)
        mob_score = round(max(20.0, min(100.0, 0.45 * time_score + 0.30 * cong_score + 0.25 * feeder_score)), 1)
    else:
        mob_score = 0.0

    # Pillar 4: Ecological Risk Friction
    if has_ecol:
        lake_infringements = int(ecol.get("lake_buffer_infringements", 0))
        kaluve_infringements = int(ecol.get("rajakaluve_buffer_infringements", 0))
        flood_grade = str(ecol.get("flood_vulnerability_grade", "LOW")).upper()
        flood_deduction = 15.0 if flood_grade in ("HIGH", "CRITICAL") else (5.0 if flood_grade == "MODERATE" else 0.0)
        ecol_score = round(max(10.0, min(100.0, 100.0 - (lake_infringements * 25.0) - (kaluve_infringements * 15.0) - flood_deduction)), 1)
    else:
        ecol_score = 0.0

    # Adaptive Re-weighted Active Pillars Average
    active_pillar_scores = []
    if has_demog:
        active_pillar_scores.append(demog_score)
    if has_econ:
        active_pillar_scores.append(econ_score)
    if has_mob:
        active_pillar_scores.append(mob_score)
    if has_ecol:
        active_pillar_scores.append(ecol_score)

    if active_pillar_scores:
        raw_score = round(sum(active_pillar_scores) / len(active_pillar_scores), 1)
    else:
        raw_score = 0.0

    # Spacing Penalty: Transit physics for heavy rail (< 800m)
    spacing_penalty = 0.0
    spacing_risk: Optional[RiskWarning] = None
    if length_km < 0.8:
        spacing_penalty = round((1.0 - (length_km / 0.8)) * 35.0, 1)
        dist_m = int(length_km * 1000)
        spacing_risk = RiskWarning(
            severity="CRITICAL",
            pillar="mobility",
            title=f"Sub-Optimal Station Spacing ({dist_m}m < 800m MoHUA Threshold)",
            description=(
                f"Corridor length of {dist_m}m is below the statutory MoHUA minimum spacing threshold (800m). "
                "Rapid heavy metro rolling stock cannot achieve operating cruise velocity (60–80 km/h) before braking, "
                "causing severe traction energy inefficiency, brake fade, and 28% higher fleet lifecycle costs."
            ),
            action_required="Extend corridor length to standard inter-station distance (>=800m) or consider Light Rail Transit (LRT) / Automated People Mover (APM) technology.",
        )

    # Interchange Bonus (+5.0 pts if origin/destination is an existing station)
    origin_name = corridor_meta.get("origin", {}).get("name", "").lower()
    dest_name = corridor_meta.get("destination", {}).get("name", "").lower()
    is_interchange = any(k in origin_name or k in dest_name for k in ("station", "terminal", "junction"))
    interchange_bonus = 5.0 if is_interchange else 0.0

    # Final composite score clamped to [15.0, 98.0] if active pillars exist
    if active_pillar_scores:
        final_score = round(max(15.0, min(98.0, raw_score - spacing_penalty + interchange_bonus)), 1)
    else:
        final_score = 0.0

    return {
        "final_score": final_score,
        "raw_score": raw_score,
        "demog_score": demog_score,
        "econ_score": econ_score,
        "mob_score": mob_score,
        "ecol_score": ecol_score,
        "active_pillars_count": len(active_pillar_scores),
        "has_demog": has_demog,
        "has_econ": has_econ,
        "has_mob": has_mob,
        "has_ecol": has_ecol,
        "spacing_penalty": spacing_penalty,
        "interchange_bonus": interchange_bonus,
        "spacing_risk": spacing_risk,
    }


class DyadMasterOrchestrator:
    """
    Local Master Orchestrator controlling the Modal cloud subagent swarm.
    """

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.environ.get("OPENAI_API_KEY")
        if not key:
            raise ValueError("OPENAI_API_KEY is required for the Local Master Orchestrator.")
        self.client = OpenAI(api_key=key)
        self.model = os.environ.get("ORCHESTRATOR_MODEL", "gpt-5.6-sol")
        if self.model in ("sol-medium", "sol", "sol-med"):
            self.model = "gpt-5.6-sol"

    def execute_stream(
        self,
        origin_station: Dict[str, Any],
        destination_pin: Dict[str, Any],
        catchment_radius_meters: float = 1500.0,
        corridor_id: Optional[str] = None,
        run_id: Optional[str] = None,
    ) -> Iterator[Dict[str, Any]]:
        """
        Main multi-agent execution pipeline. Yields real-time SSE events:
          - plan_initiated
          - subagents_spawned (only for keywords that exist in storage!)
          - visualizer_features (GeoJSON for Map Canvas)
          - telemetry (subagent progress)
          - dossier (final 16k AuthorityDossier)
          - done
        """
        start_time = time.time()
        c_id = corridor_id or f"corridor-{int(start_time)}"
        active_run_id = run_id or c_id
        origin_name = origin_station.get("name", "Origin Station")
        dest_name = destination_pin.get("name", "Destination Pin")
        corridor_name = f"{origin_name} to {dest_name}"

        # Step 1: Geometry & Catchment Buffer Generation
        buffer_geojson, length_km = generate_corridor_buffer_polygon(
            origin_station["coordinates"],
            destination_pin["coordinates"],
            radius_meters=catchment_radius_meters,
        )

        corridor_meta = {
            "corridor_id": c_id,
            "run_id": active_run_id,
            "corridor_name": corridor_name,
            "length_km": length_km,
            "radius_meters": catchment_radius_meters,
            "origin": origin_station,
            "destination": destination_pin,
        }

        yield {
            "type": "plan_initiated",
            "timestamp": time.time(),
            "corridor_id": c_id,
            "run_id": active_run_id,
            "corridor_name": corridor_name,
            "length_km": length_km,
            "catchment_radius_meters": catchment_radius_meters,
            "message": f"Planned corridor '{corridor_name}' ({length_km} km, radius: {catchment_radius_meters}m).",
        }

        # Step 2: Discover Active Datasets in Modal Volume
        yield {
            "type": "telemetry",
            "agent": "master_orchestrator",
            "status": "inspecting_storage",
            "message": f"Inspecting classified datasets in Modal Cloud Volume for run '{active_run_id}'...",
        }

        available_datasets = self._get_available_datasets(run_id=active_run_id)

        # Step 3: Conditional Spawning Rule
        # "there is no need for the master agent to spawn an agent if the <*keyword> doesnt exist"
        active_subagents = []
        has_visualizer = any("visualizer-" in f for f in available_datasets)
        has_demographics = any("demographics" in f for f in available_datasets)
        has_economic = any("economic_poi" in f for f in available_datasets)
        has_mobility = any("mobility" in f for f in available_datasets)
        has_ecological = any("ecological" in f for f in available_datasets)

        if has_visualizer:
            active_subagents.append("Agent 1: Structured Output Spatial Visualizer")
        if has_demographics:
            active_subagents.append("Agent 2: Demographics & Equity Specialist")
        if has_economic:
            active_subagents.append("Agent 3: Economic & Land-Value Specialist")
        if has_mobility:
            active_subagents.append("Agent 4: Mobility & Congestion Specialist")
        if has_ecological:
            active_subagents.append("Agent 5: Ecological Risk Specialist")

        yield {
            "type": "subagents_spawned",
            "timestamp": time.time(),
            "active_subagents": active_subagents,
            "skipped_keywords": [
                kw for kw, active in [
                    ("visualizer", has_visualizer),
                    ("demographics", has_demographics),
                    ("economic_poi", has_economic),
                    ("mobility", has_mobility),
                    ("ecological", has_ecological),
                ] if not active
            ],
            "message": f"Conditionally spawned {len(active_subagents)} subagents based on existing dataset keywords.",
        }

        # Step 4: Dispatch Active Subagents Concurrently
        swarm_results: Dict[str, Any] = {}

        def run_task(agent_key: str):
            import modal
            fn_map = {
                "visualizer": "agent_visualizer",
                "demographics": "agent_demographics",
                "economic": "agent_economic_poi",
                "mobility": "agent_mobility",
                "ecological": "agent_ecological",
            }
            fn = modal.Function.from_name("dyad-subagents-swarm", fn_map[agent_key])
            return agent_key, fn.remote(buffer_geojson, corridor_meta)

        tasks_to_run = []
        if has_visualizer: tasks_to_run.append("visualizer")
        if has_demographics: tasks_to_run.append("demographics")
        if has_economic: tasks_to_run.append("economic")
        if has_mobility: tasks_to_run.append("mobility")
        if has_ecological: tasks_to_run.append("ecological")

        # Execute in parallel with ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=max(1, len(tasks_to_run))) as pool:
            futures = [pool.submit(run_task, k) for k in tasks_to_run]
            for fut in as_completed(futures):
                agent_k, res = fut.result()
                swarm_results[agent_k] = res

                # Immediately stream Visualizer features if available so Map Canvas lights up
                if agent_k == "visualizer":
                    yield {
                        "type": "visualizer_features",
                        "timestamp": time.time(),
                        "features_count": res.get("features_count", 0),
                        "geojson": res.get("geojson", {}),
                        "message": f"Extracted {res.get('features_count', 0)} spatial features intersecting corridor buffer.",
                    }
                else:
                    yield {
                        "type": "subagent_completed",
                        "timestamp": time.time(),
                        "agent": agent_k,
                        "status": "success",
                        "message": f"{agent_k.capitalize()} subagent delivered quantitative slice.",
                    }

        # Step 5: Synthesize 16k-Token Authority Dossier
        yield {
            "type": "telemetry",
            "agent": "master_orchestrator",
            "status": "synthesizing",
            "message": f"Master Orchestrator ({self.model}) synthesizing Executive Authority Dossier...",
        }

        dossier = self._synthesize_final_dossier(
            corridor_meta=corridor_meta,
            swarm_results=swarm_results,
        )

        yield {
            "type": "dossier",
            "timestamp": time.time(),
            "payload": dossier.model_dump(),
            "total_elapsed_seconds": round(time.time() - start_time, 2),
            "message": f"Authority Dossier synthesized (Viability Score: {dossier.overall_viability_score}/100).",
        }

        yield {
            "type": "done",
            "timestamp": time.time(),
            "message": "[DONE]",
        }

    def _get_available_datasets(self, run_id: Optional[str] = None) -> List[str]:
        """Discovers files directly from Modal Volume API (0 container cold starts)."""
        try:
            import modal
            vol = modal.Volume.from_name("dyad-datasets-volume")
            prefix = f"runs/{run_id}" if run_id else ""
            entries = vol.listdir(prefix, recursive=True)
            filenames = []
            for e in entries:
                if not e.path.endswith(".meta.json"):
                    fname = Path(e.path).name
                    if fname and "." in fname and fname not in filenames:
                        filenames.append(fname)
            if filenames:
                return sorted(filenames)
        except Exception as e:
            print(f"[Master Orchestrator] Warning: Failed to query Modal volume: {e}", file=sys.stderr)

        # Scan local storage directory exclusively from dyad-app/public/data
        filenames = []
        dyad_data_dir = (Path(__file__).parent.parent / "dyad-app" / "public" / "data").resolve()
        if dyad_data_dir.exists():
            for f in dyad_data_dir.iterdir():
                if f.is_file() and not f.name.endswith(".meta.json") and not f.name.startswith("."):
                    try:
                        from run_stream_bridge import map_to_canonical_dataset_name
                        cname, _, _ = map_to_canonical_dataset_name(f)
                        filenames.append(cname)
                    except Exception:
                        filenames.append(f.name)
        return sorted(filenames)

    def _synthesize_final_dossier(
        self,
        corridor_meta: Dict[str, Any],
        swarm_results: Dict[str, Any],
    ) -> AuthorityDossier:
        """Synthesizes the comprehensive Authority Dossier via gpt-5.6-sol with 16k token limit."""
        length_km = corridor_meta["length_km"]
        demog = swarm_results.get("demographics", {}).get("metrics", {})
        econ = swarm_results.get("economic", {}).get("metrics", {})
        mob = swarm_results.get("mobility", {}).get("metrics", {})
        ecol = swarm_results.get("ecological", {}).get("metrics", {})

        # Compute deterministic MoHUA/BMRCL composite score with adaptive re-weighting
        score_info = compute_composite_viability_score(corridor_meta, demog, econ, mob, ecol)
        final_score = score_info["final_score"]

        # Build prompt sections: Active vs Skipped
        if score_info["has_demog"]:
            demog_section = f"""1. DEMOGRAPHICS PILLAR (Areal-Weighted Dasymetric Interpolation):
- 500m Walking Catchment Pop: {demog.get('catchment_population_500m', 0):,} citizens
- 1500m Feeder Catchment Pop: {demog.get('catchment_population_1500m', 0):,} citizens
- Identified Vulnerable Informal Settlement Population: {demog.get('vulnerable_slum_population', 0):,} residents
- Spatial Equity Score: {demog.get('equity_score', 0.0)}/100
- Underserved Demographic Ratio: {demog.get('underserved_demographic_ratio', 0.0)}
- Intersected BBMP Wards: {demog.get('dense_ward_names', [])}
- Specialist Brief: {swarm_results.get('demographics', {}).get('analysis', 'Demographic density assessed.')}"""
        else:
            demog_section = """1. DEMOGRAPHICS PILLAR (SUBAGENT SKIPPED - NO DATASET PROVIDED):
- STATUS: UNASSESSED (No demographics dataset was uploaded to cloud volume)
- All demographic metrics MUST be 0 (catchment_population_500m: 0, catchment_population_1500m: 0, equity_score: 0.0, underserved_demographic_ratio: 0.0, dense_ward_names: []).
- Specialist Brief: "No demographics dataset provided. Demographics & Spatial Equity pillar was unassessed." """

        if score_info["has_econ"]:
            econ_section = f"""2. ECONOMIC & LAND-VALUE PILLAR (Calibrated Exponential Gravity & TOD LVC):
- Tech Parks / Office Hubs within 1km: {econ.get('tech_parks_within_1km', 0)}
- Total Tech Workforce Catchment: {econ.get('total_tech_workforce_catchment', 0):,} employees
- Hospitals within 1km: {econ.get('hospitals_within_1km', 0)}
- Commercial Centers in 1km: {econ.get('commercial_centers_within_1km', 0)}
- Calibrated Gravity Model Projected Daily Trips: {econ.get('gravity_model_daily_trips', 0):,} trips/day
- Projected Annual Farebox Revenue: INR {econ.get('projected_annual_farebox_inr_cr', 0.0)} Crores
- Transit-Oriented Development (TOD) Land-Value Capture Yield: INR {econ.get('tod_land_value_capture_inr_cr', 0.0)} Crores
- Economic Multiplier Index: {econ.get('economic_multiplier_index', 1.0)}x
- Specialist Brief: {swarm_results.get('economic', {}).get('analysis', 'Commercial land-value yield assessed.')}"""
        else:
            econ_section = """2. ECONOMIC & LAND-VALUE PILLAR (SUBAGENT SKIPPED - NO DATASET PROVIDED):
- STATUS: UNASSESSED (No economic/commercial dataset was uploaded to cloud volume)
- All economic metrics MUST be 0 (tech_parks_within_1km: 0, hospitals_within_1km: 0, commercial_centers_within_1km: 0, projected_annual_farebox_inr_cr: 0.0, estimated_tod_yield_inr_cr: 0.0, economic_multiplier_index: 0.0).
- Specialist Brief: "No economic or commercial dataset provided. Economic & TOD pillar was unassessed." """

        if score_info["has_mob"]:
            mob_section = f"""3. MOBILITY & TRAFFIC PILLAR (Multinomial Logit Discrete Choice):
- Peak-Hour Commute Time Saved per Trip: {mob.get('peak_hour_travel_time_saved_mins', 0.0)} minutes
- Discrete Choice Mode Shares: {mob.get('mnl_mode_shares', {})}
- Arterial Road Congestion Reduction: {mob.get('arterial_congestion_reduction_pct', 0.0)}%
- Feeder Bus Coverage Score: {mob.get('feeder_route_coverage_score', 0.0)}/100
- First/Last Mile Gap Flagged: {mob.get('first_last_mile_gap_detected', False)}
- Specialist Brief: {swarm_results.get('mobility', {}).get('analysis', 'Peak hour road relief assessed.')}"""
        else:
            mob_section = """3. MOBILITY & TRAFFIC PILLAR (SUBAGENT SKIPPED - NO DATASET PROVIDED):
- STATUS: UNASSESSED (No mobility/traffic dataset was uploaded to cloud volume)
- All mobility metrics MUST be 0 (peak_hour_travel_time_saved_mins: 0.0, arterial_congestion_reduction_pct: 0.0, feeder_route_coverage_score: 0.0, first_last_mile_gap_detected: false).
- Specialist Brief: "No mobility or traffic dataset provided. Mobility & Congestion pillar was unassessed." """

        if score_info["has_ecol"]:
            ecol_section = f"""4. ECOLOGICAL RISK PILLAR (Explicit 30m Legal Buffer Geometry):
- KTFD Act 30m Lake Buffer Encroachments: {ecol.get('lake_buffer_infringements', 0)}
- Flagged Lakes: {ecol.get('flagged_lakes', [])}
- Total Legal Setback Encroachment Area: {ecol.get('total_encroachment_sqm', 0.0):,.1f} sq.meters
- Total Direct Waterbody Footprint: {ecol.get('total_direct_water_sqm', 0.0):,.1f} sq.meters
- Stormwater Rajakaluve Crossings: {ecol.get('rajakaluve_buffer_infringements', 0)}
- KTFD Compliance Status: {ecol.get('ktfd_compliance_status', 'COMPLIANT')}
- Flood Vulnerability Grade: {ecol.get('flood_vulnerability_grade', 'LOW')}
- Mandatory Engineering Mitigations: {ecol.get('mitigation_strategies', [])}
- Specialist Brief: {swarm_results.get('ecological', {}).get('analysis', 'Ecological setbacks assessed.')}"""
        else:
            ecol_section = """4. ECOLOGICAL RISK PILLAR (SUBAGENT SKIPPED - NO DATASET PROVIDED):
- STATUS: UNASSESSED (No ecological/waterbody dataset was uploaded to cloud volume)
- All ecological metrics MUST be compliant/zero (lake_buffer_infringements: 0, rajakaluve_buffer_infringements: 0, ktfd_compliance_status: "COMPLIANT", flood_vulnerability_grade: "LOW", mitigation_strategies: []).
- Specialist Brief: "No ecological or wetland dataset provided. Ecological Risk pillar was unassessed." """

        synthesis_prompt = f"""
You are the Chief Urban Transit Architect for DYAD (Bengaluru Urban Mobility Synthesis Platform).
Review the empirical evidence compiled by the cloud subagents for transit corridor '{corridor_meta['corridor_name']}' ({length_km} km) and synthesize the definitive Executive Authority Dossier.

ORIGIN: {corridor_meta['origin']['name']} ({corridor_meta['origin']['coordinates']})
DESTINATION: {corridor_meta['destination']['name']} ({corridor_meta['destination']['coordinates']})
BUFFER RADIUS: {corridor_meta['radius_meters']} meters

DETERMINISTIC COMPOSITE VIABILITY SCORING (MOHUA / BMRCL TRANSIT STANDARDS):
- Active Evaluated Pillars: {score_info['active_pillars_count']}/4
- Demographics Pillar Score ({'ACTIVE' if score_info['has_demog'] else 'SKIPPED (0.0)'}): {score_info['demog_score']}/100
- Economic & TOD Pillar Score ({'ACTIVE' if score_info['has_econ'] else 'SKIPPED (0.0)'}): {score_info['econ_score']}/100
- Mobility & Congestion Pillar Score ({'ACTIVE' if score_info['has_mob'] else 'SKIPPED (0.0)'}): {score_info['mob_score']}/100
- Ecological & KTFD Pillar Score ({'ACTIVE' if score_info['has_ecol'] else 'SKIPPED (0.0)'}): {score_info['ecol_score']}/100
- Adaptive Multi-Criteria Average (Active Pillars Only): {score_info['raw_score']}/100
- Heavy Rail Station Spacing Penalty (<800m physics): -{score_info['spacing_penalty']} pts
- Network Interchange Integration Bonus: +{score_info['interchange_bonus']} pts
- MANDATORY DETERMINISTIC OVERALL VIABILITY SCORE: {final_score}/100

EMPIRICAL FINDINGS FROM PRODUCTION SUBAGENT SWARM:
{demog_section}

{econ_section}

{mob_section}

{ecol_section}

CRITICAL DIRECTIVES:
1. STRICT ZERO-OUT RULE: For any pillar marked as SKIPPED / UNASSESSED, all corresponding numerical metrics in AuthorityDossier MUST be set to 0 or 0.0, and strings should note that no dataset was provided. Never hallucinate placeholder numbers for unassessed subagents.
2. Incorporate empirical findings only from active evaluated pillars into your operational synthesis.
3. MANDATORY OVERALL VIABILITY SCORE ENFORCEMENT: Your synthesized dossier MUST set 'overall_viability_score' to EXACTLY {final_score}.
4. Produce 3-5 strategic, realistic station proposals with precise coordinates along the alignment.
5. Formulate prioritized Risk Warnings only for empirical risks detected by active subagents.
6. Provide authoritative, executive-level policy directives for municipal sanctioning.
"""

        try:
            completion = self.client.beta.chat.completions.parse(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are DYAD's Chief Urban Transit Architect. You synthesize cloud subagent telemetry "
                            "into authoritative, quantitative municipal authority dossiers. Output only strictly valid JSON matching AuthorityDossier."
                        ),
                    },
                    {"role": "user", "content": synthesis_prompt},
                ],
                response_format=AuthorityDossier,
                max_completion_tokens=16000,
            )
            parsed = completion.choices[0].message.parsed
            if parsed:
                # Guarantee deterministic score consistency
                parsed.overall_viability_score = final_score

                # Enforce strict zero-out on skipped pillars programmatically
                if not score_info["has_demog"]:
                    parsed.demographics_pillar.catchment_population_500m = 0
                    parsed.demographics_pillar.catchment_population_1500m = 0
                    parsed.demographics_pillar.equity_score = 0.0
                    parsed.demographics_pillar.underserved_demographic_ratio = 0.0
                    parsed.demographics_pillar.dense_ward_names = []
                    parsed.demographics_pillar.analysis_summary = "No demographics dataset provided. Demographics & Spatial Equity pillar unassessed."

                if not score_info["has_econ"]:
                    parsed.economic_pillar.tech_parks_within_1km = 0
                    parsed.economic_pillar.hospitals_within_1km = 0
                    parsed.economic_pillar.commercial_centers_within_1km = 0
                    parsed.economic_pillar.projected_annual_farebox_inr_cr = 0.0
                    parsed.economic_pillar.estimated_tod_yield_inr_cr = 0.0
                    parsed.economic_pillar.economic_multiplier_index = 0.0
                    parsed.economic_pillar.analysis_summary = "No economic or commercial dataset provided. Economic & TOD pillar unassessed."

                if not score_info["has_mob"]:
                    parsed.mobility_pillar.peak_hour_travel_time_saved_mins = 0.0
                    parsed.mobility_pillar.arterial_congestion_reduction_pct = 0.0
                    parsed.mobility_pillar.feeder_route_coverage_score = 0.0
                    parsed.mobility_pillar.first_last_mile_gap_detected = False
                    parsed.mobility_pillar.analysis_summary = "No mobility or traffic dataset provided. Mobility & Congestion pillar unassessed."

                if not score_info["has_ecol"]:
                    parsed.ecological_pillar.lake_buffer_infringements = 0
                    parsed.ecological_pillar.rajakaluve_buffer_infringements = 0
                    parsed.ecological_pillar.ktfd_compliance_status = "COMPLIANT"
                    parsed.ecological_pillar.flood_vulnerability_grade = "LOW"
                    parsed.ecological_pillar.mitigation_strategies = []
                    parsed.ecological_pillar.analysis_summary = "No ecological or wetland dataset provided. Ecological Risk pillar unassessed."

                # Inject spacing risk warning if inter-station distance is sub-optimal (<800m)
                if score_info.get("spacing_risk"):
                    if not any("spacing" in r.title.lower() for r in parsed.risk_warnings):
                        parsed.risk_warnings.insert(0, score_info["spacing_risk"])
                return parsed
        except Exception as exc:
            print(f"[Master Orchestrator] Warning: LLM parse error ({exc}). Generating deterministic fallback dossier.", file=sys.stderr)

        # Fallback compilation if OpenAI parse encounters issue
        return self._create_deterministic_fallback(corridor_meta, demog, econ, mob, ecol, score_info)

    def _create_deterministic_fallback(
        self,
        corridor_meta: Dict[str, Any],
        demog: Dict[str, Any],
        econ: Dict[str, Any],
        mob: Dict[str, Any],
        ecol: Dict[str, Any],
        score_info: Optional[Dict[str, Any]] = None,
    ) -> AuthorityDossier:
        """Deterministic mathematical fallback dossier aligned with MoHUA standards."""
        length_km = corridor_meta["length_km"]
        if score_info is None:
            score_info = compute_composite_viability_score(corridor_meta, demog, econ, mob, ecol)
        viability = score_info["final_score"]

        # Demographics pillar
        if score_info["has_demog"]:
            pop = int(demog.get("catchment_population_500m", int(length_km * 9500)))
            demog_pillar = DemographicsPillarMetrics(
                catchment_population_500m=pop,
                catchment_population_1500m=demog.get("catchment_population_1500m", pop * 2),
                equity_score=float(demog.get("equity_score", 76.0)),
                underserved_demographic_ratio=float(demog.get("underserved_demographic_ratio", 0.26)),
                dense_ward_names=demog.get("dense_ward_names", ["Bellandur", "HSR Layout"]),
                analysis_summary=f"Serves an immediate walking catchment of {pop:,} citizens with an equity rating of {demog.get('equity_score', 76.0)}/100.",
            )
        else:
            pop = 0
            demog_pillar = DemographicsPillarMetrics(
                catchment_population_500m=0,
                catchment_population_1500m=0,
                equity_score=0.0,
                underserved_demographic_ratio=0.0,
                dense_ward_names=[],
                analysis_summary="No demographics dataset provided. Demographics & Spatial Equity pillar unassessed.",
            )

        # Economic pillar
        if score_info["has_econ"]:
            wf = int(econ.get("total_tech_workforce_catchment", 0))
            fb = float(econ.get("projected_annual_farebox_inr_cr", 0.0))
            tod_yield = float(econ.get("estimated_tod_yield_inr_cr") or econ.get("tod_land_value_capture_inr_cr") or (fb * 0.26))
            econ_pillar = EconomicPillarMetrics(
                tech_parks_within_1km=int(econ.get("tech_parks_within_1km", 0)),
                hospitals_within_1km=int(econ.get("hospitals_within_1km", 0)),
                commercial_centers_within_1km=int(econ.get("commercial_centers_within_1km", 0)),
                projected_annual_farebox_inr_cr=fb,
                estimated_tod_yield_inr_cr=round(tod_yield, 2),
                economic_multiplier_index=float(econ.get("economic_multiplier_index", 1.0)),
                analysis_summary=f"Projected annual farebox reaches INR {fb} Cr with {econ.get('tech_parks_within_1km', 0)} major tech parks.",
            )
        else:
            wf = 0
            econ_pillar = EconomicPillarMetrics(
                tech_parks_within_1km=0,
                hospitals_within_1km=0,
                commercial_centers_within_1km=0,
                projected_annual_farebox_inr_cr=0.0,
                estimated_tod_yield_inr_cr=0.0,
                economic_multiplier_index=0.0,
                analysis_summary="No economic or commercial dataset provided. Economic & TOD pillar unassessed.",
            )

        # Mobility pillar
        if score_info["has_mob"]:
            mob_pillar = MobilityPillarMetrics(
                peak_hour_travel_time_saved_mins=float(mob.get("peak_hour_travel_time_saved_mins", 0.0)),
                arterial_congestion_reduction_pct=float(mob.get("arterial_congestion_reduction_pct", 0.0)),
                feeder_route_coverage_score=float(mob.get("feeder_route_coverage_score", 0.0)),
                first_last_mile_gap_detected=bool(mob.get("first_last_mile_gap_detected", False)),
                analysis_summary=f"Commuters save an estimated {mob.get('peak_hour_travel_time_saved_mins', 0.0)} minutes per trip, reducing peak arterial congestion by {mob.get('arterial_congestion_reduction_pct', 0.0)}%.",
            )
        else:
            mob_pillar = MobilityPillarMetrics(
                peak_hour_travel_time_saved_mins=0.0,
                arterial_congestion_reduction_pct=0.0,
                feeder_route_coverage_score=0.0,
                first_last_mile_gap_detected=False,
                analysis_summary="No mobility or traffic dataset provided. Mobility & Congestion pillar unassessed.",
            )

        # Ecological pillar
        if score_info["has_ecol"]:
            ecol_pillar = EcologicalPillarMetrics(
                lake_buffer_infringements=int(ecol.get("lake_buffer_infringements", 0)),
                rajakaluve_buffer_infringements=int(ecol.get("rajakaluve_buffer_infringements", 0)),
                ktfd_compliance_status=str(ecol.get("ktfd_compliance_status", "COMPLIANT")),
                flood_vulnerability_grade=str(ecol.get("flood_vulnerability_grade", "LOW")),
                mitigation_strategies=ecol.get("mitigation_strategies", []),
                analysis_summary=f"Compliance status is '{ecol.get('ktfd_compliance_status', 'COMPLIANT')}' with flood vulnerability classified as '{ecol.get('flood_vulnerability_grade', 'LOW')}'.",
            )
        else:
            ecol_pillar = EcologicalPillarMetrics(
                lake_buffer_infringements=0,
                rajakaluve_buffer_infringements=0,
                ktfd_compliance_status="COMPLIANT",
                flood_vulnerability_grade="LOW",
                mitigation_strategies=[],
                analysis_summary="No ecological or wetland dataset provided. Ecological Risk pillar unassessed.",
            )

        daily_riders = int(pop * 0.20 + wf * 0.35) if (pop or wf) else int(length_km * 4200)

        stations = [
            StationProposal(
                name=corridor_meta["origin"]["name"],
                latitude=corridor_meta["origin"]["coordinates"][1],
                longitude=corridor_meta["origin"]["coordinates"][0],
                rationale="Intermodal terminal connecting to existing metro network",
                expected_daily_footfall=int(daily_riders * 0.4),
                interchange_potential=True,
            ),
            StationProposal(
                name=f"{corridor_meta['corridor_name']} Midpoint Junction",
                latitude=round((corridor_meta["origin"]["coordinates"][1] + corridor_meta["destination"]["coordinates"][1]) / 2, 4),
                longitude=round((corridor_meta["origin"]["coordinates"][0] + corridor_meta["destination"]["coordinates"][0]) / 2, 4),
                rationale="Intermediate station serving local commercial and transit catchment",
                expected_daily_footfall=int(daily_riders * 0.35),
                interchange_potential=False,
            ),
            StationProposal(
                name=corridor_meta["destination"]["name"],
                latitude=corridor_meta["destination"]["coordinates"][1],
                longitude=corridor_meta["destination"]["coordinates"][0],
                rationale="Terminus station serving residential and employment hub",
                expected_daily_footfall=int(daily_riders * 0.25),
                interchange_potential=False,
            ),
        ]

        risks = []
        if score_info.get("spacing_risk"):
            risks.append(score_info["spacing_risk"])

        if ecol.get("lake_buffer_infringements", 0) > 0:
            risks.append(
                RiskWarning(
                    severity="HIGH",
                    pillar="ecological",
                    title="KTFD Act 30m Lake Buffer Violation Identified",
                    description="Corridor alignment intersects statutory 30m non-construction setback zone of protected water body.",
                    action_required="Re-align pier placement to maintain minimum 30m setback or deploy portal viaduct frames.",
                )
            )

        return AuthorityDossier(
            corridor_id=corridor_meta["corridor_id"],
            corridor_name=corridor_meta["corridor_name"],
            total_length_km=max(0.0, length_km),
            estimated_ridership_daily=daily_riders,
            overall_viability_score=viability,
            demographics_pillar=demog_pillar,
            economic_pillar=econ_pillar,
            mobility_pillar=mob_pillar,
            ecological_pillar=ecol_pillar,
            risk_warnings=risks,
            policy_recommendations=[
                "Expedite statutory KTFD compliance clearance for water body buffers.",
                "Execute TOD land-pooling agreements with major commercial corridor consortiums.",
                "Synchronize BMTC feeder bus services at commercial commissioning.",
            ],
            suggested_station_locations=stations,
        )
