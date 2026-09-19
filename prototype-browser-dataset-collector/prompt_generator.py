"""
DYAD: Generic City-Parametric Dataset Collection Prompt Generator.
Transforms any user-provided city name into an autonomous, 5-pillar
geospatial search, download, and verification task for Browser Use Cloud Agent.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


CITY_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "hyderabad": {
        "municipal_body": "Greater Hyderabad Municipal Corporation (GHMC / HMDA)",
        "tech_corridors": "Cyberabad, Hitec City, Gachibowli, Financial District, Kokapet Neopolis, Raheja Mindspace",
        "metro_agency": "Hyderabad Metro Rail (HMR / HMRL)",
        "environmental_regulator": "HYDRAA (Hyderabad Disaster Response and Asset Protection Agency) enforcing 30m Full Tank Level (FTL) lake buffers",
        "key_waterbodies": "Durgam Cheruvu, Khajaguda Lake, Malkam Cheruvu, Kokapet Cheruvu, Osmansagar",
        "open_data_portal": "https://opencity.in/category/hyderabad, https://data.telangana.gov.in",
        "bounding_box": "[17.34, 78.30, 17.52, 78.55]",
    },
    "bengaluru": {
        "municipal_body": "Bruhat Bengaluru Mahanagara Palike (BBMP / BDA)",
        "tech_corridors": "Outer Ring Road (ORR), Whitefield, Electronic City, Manyata Tech Park, Bellandur Ecoworld",
        "metro_agency": "Namma Metro (BMRCL Phase 1, 2A/2B, 3)",
        "environmental_regulator": "KTFD (Karnataka Tank Conservation and Development Authority) enforcing statutory 30m lake setbacks and 50m Rajakaluve buffers",
        "key_waterbodies": "Bellandur Lake, Varthur Lake, Agara Lake, Hebbal Lake, Ulsoor Lake",
        "open_data_portal": "https://opencity.in/category/bengaluru, https://karnataka.data.gov.in",
        "bounding_box": "[12.82, 77.48, 13.12, 77.78]",
    },
    "pune": {
        "municipal_body": "Pune Municipal Corporation (PMC / PCMC / PMRDA)",
        "tech_corridors": "Hinjawadi Rajiv Gandhi Infotech Park (Phase 1-3), Kharadi EON Free Zone, Magarpatta Cybercity",
        "metro_agency": "MahaMetro Pune & PMRDA Line 3 (Hinjawadi-Shivajinagar)",
        "environmental_regulator": "Maharashtra Irrigation Department enforcing Mula-Mutha River Blue and Red flood-line buffers",
        "key_waterbodies": "Mula River, Mutha River, Pashan Lake, Katraj Lake, Khadakwasla Dam catchment",
        "open_data_portal": "https://opendata.punecorporation.org, https://opencity.in/category/pune",
        "bounding_box": "[18.42, 73.72, 18.66, 73.98]",
    },
    "chennai": {
        "municipal_body": "Greater Chennai Corporation (GCC / CMDA)",
        "tech_corridors": "Old Mahabalipuram Road (OMR IT Expressway), Tidel Park, Siruseri SIPCOT, Porur DLF IT Park",
        "metro_agency": "Chennai Metro Rail Limited (CMRL Phase 1 & Phase 2 118.9 km)",
        "environmental_regulator": "CRZ (Coastal Regulation Zone) and Tamil Nadu Wetland Authority protecting Pallikaranai Marshland",
        "key_waterbodies": "Pallikaranai Marsh, Buckingham Canal, Adyar River, Cooum River, Porur Lake",
        "open_data_portal": "https://opencity.in/category/chennai, https://data.gov.in",
        "bounding_box": "[12.88, 80.12, 13.20, 80.32]",
    },
    "mumbai": {
        "municipal_body": "Brihanmumbai Municipal Corporation (BMC / MMRDA)",
        "tech_corridors": "Bandra-Kurla Complex (BKC), Powai Hiranandani, Lower Parel, Mindspace Malad, Airoli Navi Mumbai",
        "metro_agency": "Maha Mumbai Metro (Lines 1 to 14)",
        "environmental_regulator": "MCZMA (Maharashtra Coastal Zone Management Authority) CRZ buffers and Sanjay Gandhi National Park eco-sensitive zone",
        "key_waterbodies": "Mithi River, Powai Lake, Vihar Lake, Thane Creek Flamingo Sanctuary",
        "open_data_portal": "https://opendata.mcgm.gov.in, https://opencity.in/category/mumbai",
        "bounding_box": "[18.90, 72.78, 19.30, 73.05]",
    },
}


def generate_city_collection_prompt(city_name: str, focus_corridor: Optional[str] = None) -> str:
    """
    Generates a production-ready, autonomous Browser-Use Cloud Agent prompt
    tailored to any target city.
    """
    city_clean = city_name.strip()
    city_key = city_clean.lower()
    meta = CITY_KNOWLEDGE_BASE.get(city_key, {})

    municipal_ref = meta.get("municipal_body", f"{city_clean} Municipal Corporation / Development Authority")
    tech_ref = meta.get("tech_corridors", f"Major IT parks, SEZs, and business commercial districts in {city_clean}")
    metro_ref = meta.get("metro_agency", f"{city_clean} Metro Rail / Public Transit Agency")
    eco_ref = meta.get("environmental_regulator", f"Statutory 30m lake, wetland, and river flood-line conservation buffers in {city_clean}")
    water_ref = meta.get("key_waterbodies", f"Prominent lakes, rivers, reservoirs, and stormwater canals in {city_clean}")
    portal_ref = meta.get("open_data_portal", f"OpenCity.in (https://opencity.in), national open data portals, or Overpass Turbo")
    bbox_ref = meta.get("bounding_box", f"the geographical bounding box of {city_clean}")

    corridor_instruction = f"Focus particularly on the corridor/region: '{focus_corridor}'." if focus_corridor else ""

    prompt = f"""You are the Autonomous Geospatial Dataset Collector Cloud Agent for DYAD (Urban Transit Evaluation Platform).

MISSION:
Your task is to autonomously search, locate, download, and verify real geospatial datasets for the city: '{city_clean}'.
{corridor_instruction}
All downloaded files must be saved directly into the workspace files.

----------------------------------------------------------------------
TARGET CITY CONTEXT:
----------------------------------------------------------------------
- City Name: {city_clean}
- Municipal Authority: {municipal_ref}
- Key Employment Nodes: {tech_ref}
- Mass Transit Agency: {metro_ref}
- Key Water Bodies: {water_ref}
- Environmental Regulations: {eco_ref}
- Recommended Search Portals: {portal_ref}
- Spatial Query Bounding Box: {bbox_ref}

----------------------------------------------------------------------
MANDATORY 5-PILLAR COLLECTION DIRECTIVES:
----------------------------------------------------------------------
Acquire at least 1 verified dataset for each of the 5 pillars below:

1. PILLAR 1: DEMOGRAPHICS & SPATIAL EQUITY
   - Search: "{city_clean} municipal ward boundary geojson", "{city_clean} ward census population", "{city_clean} urban slums geojson or csv".
   - Sources: OpenCity.in, Municipal GIS portals, State open data repository.
   - Format: .geojson or .csv with ward names and population numbers.

2. PILLAR 2: ECONOMIC & EMPLOYMENT HUBS (WORKFORCE POIs)
   - Search: Major tech parks, SEZs, corporate offices, and commercial hubs in {city_clean}.
   - Query Overpass Turbo (https://overpass-turbo.eu/) for {city_clean} bounding box:
     node["office"]; way["office"]; (Export as GeoJSON or CSV).
   - Format: .geojson or .csv containing name, workforce/capacity, lat, lon.

3. PILLAR 3: MOBILITY & CONGESTION
   - Search: {city_clean} Metro Rail existing and proposed station coordinates and route shapefiles.
   - Search TomTom Traffic Index for {city_clean} (https://www.tomtom.com/traffic-index/) to extract peak-hour arterial road commute speeds and congestion percentage.
   - Format: .geojson, .csv, or structured .json.

4. PILLAR 4: ECOLOGICAL RISK & STATUTORY WATERBODY BUFFERS
   - Search: Cadastral lake boundaries, tanks, river floodplains, and stormwater nalas in {city_clean}.
   - Key Regulatory Requirement: Map water bodies subject to {eco_ref}.
   - Format: .geojson with polygon boundaries.

5. PILLAR 5: MAP CANVAS BASELINE VISUALIZER
   - Search: Clean boundary GeoJSON of {city_clean} municipal limits.
   - Format: .geojson.

----------------------------------------------------------------------
BROWSER EXECUTION & VERIFICATION RULES:
----------------------------------------------------------------------
1. Autonomous Discovery: Use search engines (Google, DuckDuckGo) or direct portal navigation (OpenCity, Overpass Turbo, GitHub open data repos) to locate direct download links.
2. Formats: Accept only .geojson, .csv, or .json. If a file is downloaded as a .zip, ensure it contains the GIS layers.
3. Metadata Companion: For each downloaded dataset (e.g. `wards.geojson`), create a companion `wards.geojson.meta.json` recording:
   {{
     "city": "{city_clean}",
     "pillar": "demographics | economic_poi | mobility | ecological | visualizer",
     "source_url": "...",
     "geometry_type": "Polygon | Point | Tabular",
     "timestamp": "ISO-8601"
   }}
4. Completion: When at least 1 dataset per pillar is downloaded into the workspace, report a clean summary list of files and conclude the task.
"""
    return prompt.strip()
