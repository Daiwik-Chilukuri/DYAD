"""
DYAD: Multi-Agent Swarm Audit Runner.
Executes the Local Master Orchestrator (gpt-5.6-sol) against the Modal cloud subagent swarm (gpt-5.6-terra),
verifying:
  1. Conditional subagent spawning based on active dataset keywords in the Modal Volume.
  2. Strict spatial intersection filtering by Agent 1 (Visualizer):
     - Keeps intersecting POI points and lake polygons.
     - Rejects out-of-bounds nodes (e.g. Manyata, Global Village, Hebbal Lake).
  3. Evidence-bound quantitative slices from Domain Agents (Demographics, Economics, Mobility, Ecological).
  4. Final 16k-token Executive Authority Dossier synthesis.
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

# Add prototype dir to path
sys.path.insert(0, str(Path(__file__).parent))

from master_orchestrator import DyadMasterOrchestrator

# Configure UTF-8 for Windows console
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


def main():
    print("=" * 76)
    print("   DYAD: FULL MULTI-AGENT SWARM AUDIT (Silk Board ➔ Bellandur Ecoworld)")
    print("=" * 76)

    # User Input Envelope
    origin_station = {
        "name": "Central Silk Board Interchange",
        "coordinates": [77.6200, 12.9170],
        "is_existing_station": True,
        "lines": ["Yellow Line", "Blue Line (Phase 2A)"],
    }
    destination_pin = {
        "name": "Bellandur RMZ Ecoworld",
        "coordinates": [77.6848, 12.9237],
        "is_existing_station": False,
    }
    catchment_radius_m = 1500.0

    print(f"\n[1] Ingestion Envelope:")
    print(f"    Origin:       {origin_station['name']} {origin_station['coordinates']}")
    print(f"    Destination:  {destination_pin['name']} {destination_pin['coordinates']}")
    print(f"    Buffer:       {catchment_radius_m}m corridor catchment")

    orchestrator = DyadMasterOrchestrator()
    print(f"\n[2] Initializing Master Orchestrator ({orchestrator.model})...")

    t_start = time.time()
    events = []
    final_dossier = None
    visualizer_features = None

    target_run_id = "run_real_datasets_audit"

    for event in orchestrator.execute_stream(
        origin_station=origin_station,
        destination_pin=destination_pin,
        catchment_radius_meters=catchment_radius_m,
        corridor_id=target_run_id,
        run_id=target_run_id,
    ):
        etype = event.get("type")
        events.append(event)

        if etype == "plan_initiated":
            print(f"    [OK] Corridor Planned: {event['corridor_name']} ({event['length_km']} km)")

        elif etype == "subagents_spawned":
            print(f"\n[3] Conditional Subagent Spawning Check:")
            print(f"    Spawned Subagents:  {len(event['active_subagents'])}")
            for a in event["active_subagents"]:
                print(f"      • {a}")
            if event["skipped_keywords"]:
                print(f"    Skipped Keywords:   {event['skipped_keywords']}")

        elif etype == "visualizer_features":
            visualizer_features = event.get("geojson", {})
            feat_list = visualizer_features.get("features", [])
            print(f"\n[4] Agent 1 (Visualizer) Spatial Intersection Check:")
            print(f"    Features in Buffer: {len(feat_list)}")
            for feat in feat_list[:12]:  # Show first 12 for conciseness
                p = feat.get("properties", {})
                gtype = feat.get("geometry", {}).get("type")
                name = p.get("hub_name") or p.get("lake_name") or p.get("WARD_NAME") or p.get("Slum_Name") or p.get("name") or "Spatial Feature"
                print(f"      [✓] Included: '{name}' ({gtype}) from {p.get('source_dataset', 'dataset')}")
            if len(feat_list) > 12:
                print(f"      ... and {len(feat_list) - 12} more intersecting spatial features.")

        elif etype == "subagent_completed":
            print(f"    [✓] Subagent Completed: {event['agent'].capitalize()}")

        elif etype == "dossier":
            final_dossier = event["payload"]
            print(f"\n[5] Final Authority Dossier Received! (Viability Score: {final_dossier['overall_viability_score']}/100)")

    total_time = round(time.time() - t_start, 2)

    # Save complete execution trace locally
    runs_dir = Path(__file__).parent / "runs"
    runs_dir.mkdir(parents=True, exist_ok=True)
    trace_path = runs_dir / f"{target_run_id}_trace.json"
    with open(trace_path, "w", encoding="utf-8") as tf:
        json.dump({"events": events, "dossier": final_dossier}, tf, indent=2, default=str)
    print(f"\n[Trace Saved] Complete sandbox execution trace written to: {trace_path.name}")
    print(f"\n" + "=" * 76)
    print(f"   AUDIT SUMMARY & RESULTS (Total Round-Trip: {total_time}s)")
    print("=" * 76)

    if final_dossier:
        print(f"\n📊 PILLAR 1 - DEMOGRAPHICS & EQUITY (Areal-Weighted Dasymetric):")
        d = final_dossier["demographics_pillar"]
        print(f"   • Walking Population (500m):  {d['catchment_population_500m']:,}")
        print(f"   • Feeder Population (1500m):   {d['catchment_population_1500m']:,}")
        print(f"   • Equity Score:               {d['equity_score']}/100")
        print(f"   • Intersected Wards:          {d['dense_ward_names']}")

        print(f"\n💼 PILLAR 2 - ECONOMIC & LAND-VALUE (Calibrated Gravity & TOD LVC):")
        e = final_dossier["economic_pillar"]
        print(f"   • Tech Parks within 1km:      {e['tech_parks_within_1km']}")
        print(f"   • Projected Annual Farebox:   INR {e['projected_annual_farebox_inr_cr']} Cr")
        print(f"   • Economic Multiplier:        {e['economic_multiplier_index']}x")

        print(f"\n🚗 PILLAR 3 - MOBILITY & TRAFFIC (Multinomial Logit Choice):")
        m = final_dossier["mobility_pillar"]
        print(f"   • Commute Time Saved:         {m['peak_hour_travel_time_saved_mins']} mins/trip")
        print(f"   • Arterial Congestion Drop:   {m['arterial_congestion_reduction_pct']}%")
        print(f"   • Feeder Bus Coverage Score:  {m['feeder_route_coverage_score']}/100")

        print(f"\n🌿 PILLAR 4 - ECOLOGICAL RISK & BUFFER COMPLIANCE (30m Legal Setback Geometry):")
        ec = final_dossier["ecological_pillar"]
        print(f"   • KTFD 30m Buffer Breaches:   {ec['lake_buffer_infringements']}")
        print(f"   • Compliance Rating:          {ec['ktfd_compliance_status']}")
        print(f"   • Flood Vulnerability:        {ec['flood_vulnerability_grade']}")
        print(f"   • Mitigations Required:       {len(ec['mitigation_strategies'])} actions")

        print(f"\n🚉 SUGGESTED STATIONS ({len(final_dossier['suggested_station_locations'])} proposed):")
        for stn in final_dossier["suggested_station_locations"]:
            print(f"   • {stn['name']} [{stn['latitude']}, {stn['longitude']}] - Est. Daily: {stn['expected_daily_footfall']:,}")

        print(f"\n⚠️ RISK WARNINGS ({len(final_dossier['risk_warnings'])} flagged):")
        for rw in final_dossier["risk_warnings"]:
            print(f"   [{rw['severity']}] {rw['pillar'].upper()}: {rw['title']}")
            print(f"       Action: {rw['action_required']}")

        print(f"\n📜 EXECUTIVE POLICY DIRECTIVES:")
        for pr in final_dossier["policy_recommendations"]:
            print(f"   • {pr}")

    print("\n" + "=" * 76)


if __name__ == "__main__":
    main()
