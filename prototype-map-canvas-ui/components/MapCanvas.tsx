'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Map, NavigationControl, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import * as turf from '@turf/turf';

// The CARTO Dark Matter vector tile style URL
const BASEMAP_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
// Center Bengaluru so Rajajinagar (West), Indiranagar (East), and Bellandur (East-South) are all visible
const BENGALURU_OVERVIEW_CENTER: [number, number] = [77.6500, 12.9350];
const SILK_BOARD_COORDS: [number, number] = [77.6245, 12.9176];
const BELLANDUR_COORDS: [number, number] = [77.6820, 12.9290];

// Candidate metro viaduct is a direct straight-line corridor zone from Silk Board to placed End Node
function generateViaductCoordinates(target: [number, number]): [number, number][] {
  return [SILK_BOARD_COORDS, target];
}

// Helper to compute 2.0 km geodesic radial catchment buffer
function computeBufferGeoJSON(coords: [number, number][], radiusKm: number = 2.0): any {
  try {
    const line = turf.lineString(coords);
    const buffered = turf.buffer(line, radiusKm, { units: 'kilometers' });
    return buffered || { type: 'FeatureCollection', features: [] };
  } catch (err) {
    console.error("Error computing catchment buffer:", err);
    return { type: 'FeatureCollection', features: [] };
  }
}

// Centroids and telemetry for Benefited Area Labels
const BENEFITED_AREAS_CENTROIDS: any = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'zone-rajajinagar',
      properties: {
        id: 'zone-rajajinagar',
        name: 'Rajajinagar',
        role: 'West Industrial & Commercial Hub',
        tier: 'Network Beneficiary',
        tierCode: 'network',
        color: '#c084fc',
        benefitScore: 91,
        timeSavedMin: 42,
        commuteRoad: '68 mins',
        commuteMetro: '26 mins',
        commuterCount: '118,000',
        modalShift: '39.2%',
        howBenefited: 'Green Line interchange via RV Road connects directly to Silk Board viaduct, bypassing severe central city gridlock and saving 42 mins each way to the tech corridor.'
      },
      geometry: { type: 'Point', coordinates: [77.5535, 12.9975] }
    },
    {
      type: 'Feature',
      id: 'zone-indiranagar',
      properties: {
        id: 'zone-indiranagar',
        name: 'Indiranagar',
        role: 'East-Central Tech & Residential Hub',
        tier: 'Interchange Beneficiary',
        tierCode: 'interchange',
        color: '#38bdf8',
        benefitScore: 93,
        timeSavedMin: 38,
        commuteRoad: '54 mins',
        commuteMetro: '16 mins',
        commuterCount: '145,000',
        modalShift: '44.5%',
        howBenefited: 'Direct interchange from Purple Line via KR Puram / Silk Board feeder, eliminating the choke points along Old Airport Road and 100 Feet Road.'
      },
      geometry: { type: 'Point', coordinates: [77.6405, 12.9735] }
    },
    {
      type: 'Feature',
      id: 'zone-bellandur',
      properties: {
        id: 'zone-bellandur',
        name: 'Bellandur & ORR',
        role: 'Primary Corridor Tech Spine',
        tier: 'Direct Corridor Catchment',
        tierCode: 'direct',
        color: '#0ab1ba',
        benefitScore: 98,
        timeSavedMin: 44,
        commuteRoad: '58 mins',
        commuteMetro: '14 mins',
        commuterCount: '342,800',
        modalShift: '52.8%',
        howBenefited: 'The primary viaduct alignment directly serves 84 tech parks (Ecospace, Cessna, Prestige), relieving 18,450 PPHPD and cutting daily travel time by 44 mins.'
      },
      geometry: { type: 'Point', coordinates: [77.6815, 12.9295] }
    },
    {
      type: 'Feature',
      id: 'zone-hsr',
      properties: {
        id: 'zone-hsr',
        name: 'HSR Layout',
        role: 'Surrounding Catchment Buffer Area',
        tier: 'Direct Catchment',
        tierCode: 'direct',
        color: '#0ab1ba',
        benefitScore: 96,
        timeSavedMin: 32,
        commuteRoad: '42 mins',
        commuteMetro: '10 mins',
        commuterCount: '195,000',
        modalShift: '48.0%',
        howBenefited: 'Located immediately in the surrounding catchment of the viaduct; residents get walkable access to 14th Main & Agara stations, slashing private vehicle use by 48%.'
      },
      geometry: { type: 'Point', coordinates: [77.6435, 12.9115] }
    },
    {
      type: 'Feature',
      id: 'zone-koramangala',
      properties: {
        id: 'zone-koramangala',
        name: 'Koramangala',
        role: 'Surrounding Catchment Buffer Area',
        tier: 'Surrounding Feeder Hub',
        tierCode: 'interchange',
        color: '#38bdf8',
        benefitScore: 92,
        timeSavedMin: 30,
        commuteRoad: '46 mins',
        commuteMetro: '16 mins',
        commuterCount: '168,000',
        modalShift: '41.6%',
        howBenefited: 'Surrounding area immediately adjacent to Silk Board; traffic that previously choked Sony World signal transfers to metro viaduct, saving 30 mins.'
      },
      geometry: { type: 'Point', coordinates: [77.6225, 12.9340] }
    },
    {
      type: 'Feature',
      id: 'zone-btm',
      properties: {
        id: 'zone-btm',
        name: 'BTM & Jayanagar',
        role: 'Surrounding Catchment Buffer Area',
        tier: 'Surrounding Feeder Hub',
        tierCode: 'interchange',
        color: '#38bdf8',
        benefitScore: 90,
        timeSavedMin: 34,
        commuteRoad: '48 mins',
        commuteMetro: '14 mins',
        commuterCount: '152,000',
        modalShift: '43.1%',
        howBenefited: 'Feeds directly into Silk Board junction from Bannerghatta & Jayanagar corridors; eliminates severe bottlenecks at Udupi Garden & Silk Board surface crossings.'
      },
      geometry: { type: 'Point', coordinates: [77.6050, 12.9160] }
    },
    {
      type: 'Feature',
      id: 'zone-marathahalli',
      properties: {
        id: 'zone-marathahalli',
        name: 'Marathahalli',
        role: 'Surrounding Catchment Buffer Area',
        tier: 'Surrounding Feeder Hub',
        tierCode: 'network',
        color: '#c084fc',
        benefitScore: 89,
        timeSavedMin: 36,
        commuteRoad: '52 mins',
        commuteMetro: '16 mins',
        commuterCount: '132,000',
        modalShift: '40.8%',
        howBenefited: 'Acts as the eastern convergence node connecting Whitefield commuters to the Bellandur tech corridor viaduct.'
      },
      geometry: { type: 'Point', coordinates: [77.6980, 12.9550] }
    }
  ]
};

export interface BufferStats {
  total: number;
  byCategory: {
    corporate: number;
    hospital: number;
    education: number;
    civic: number;
  };
}

interface MapCanvasProps {
  targetCoords?: [number, number] | null;
  onMapClick?: (coords: [number, number]) => void;
  activePOIFilters?: string[];
  showBenefitedAreas?: boolean;
  showCatchmentBuffer?: boolean;
  showMetroLines?: boolean;
  showAreaLabels?: boolean;
  bufferRadiusKm?: number;
  focusedAreaCoords?: [number, number] | null;
  onAreaSelect?: (area: any) => void;
  onBufferStatsChange?: (stats: BufferStats) => void;
  className?: string;
}

export function MapCanvas({ 
  targetCoords = BELLANDUR_COORDS, 
  onMapClick, 
  activePOIFilters = ['corporate', 'hospital', 'education', 'civic'], 
  showBenefitedAreas = true,
  showCatchmentBuffer = true,
  showMetroLines = true,
  showAreaLabels = true,
  bufferRadiusKm = 2.0,
  focusedAreaCoords = null,
  onAreaSelect,
  onBufferStatsChange,
  className = '' 
}: MapCanvasProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const targetMarkerRef = useRef<Marker | null>(null);
  const originMarkerRef = useRef<Marker | null>(null);
  const allPOIsRef = useRef<any>(null);
  const onBufferStatsChangeRef = useRef(onBufferStatsChange);
  onBufferStatsChangeRef.current = onBufferStatsChange;
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
  const [isLoaded, setIsLoaded] = useState(false);
  const [originCoords, setOriginCoords] = useState<[number, number]>(SILK_BOARD_COORDS);

  // Helper to update straight line track, catchment buffer, and filter POIs inside buffer
  const updateCorridorAndFilterPOIs = (target: [number, number], radius: number = bufferRadiusKm) => {
    const m = mapRef.current;
    if (!m) return;

    // 1. Straight line corridor connecting Silk Board to target
    const lineCoords: [number, number][] = [SILK_BOARD_COORDS, target];
    const trackSource = m.getSource('corridor-track') as maplibregl.GeoJSONSource;
    if (trackSource) {
      trackSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: lineCoords
        }
      });
    }

    // 2. Catchment Buffer around the straight line corridor
    const bufferGeo = computeBufferGeoJSON(lineCoords, radius);
    const bufferSource = m.getSource('corridor-buffer-source') as maplibregl.GeoJSONSource;
    if (bufferSource && bufferGeo) {
      bufferSource.setData(bufferGeo as any);
    }

    // 3. Identify and reflect ONLY POIs within the 2.0 km catchment buffer
    const poiSource = m.getSource('pois') as maplibregl.GeoJSONSource;
    if (poiSource && allPOIsRef.current && bufferGeo) {
      try {
        const filtered = turf.pointsWithinPolygon(allPOIsRef.current, bufferGeo);
        poiSource.setData(filtered);

        if (onBufferStatsChangeRef.current) {
          const catCounts = { corporate: 0, hospital: 0, education: 0, civic: 0 };
          filtered.features.forEach((f: any) => {
            const cat = f.properties?.category as keyof typeof catCounts;
            if (cat && catCounts[cat] !== undefined) {
              catCounts[cat]++;
            }
          });
          onBufferStatsChangeRef.current({
            total: filtered.features.length,
            byCategory: catCounts
          });
        }
      } catch (err) {
        console.error('Error filtering POIs within catchment buffer:', err);
      }
    }
  };

  // Initialize Map
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    try {
      const m = new Map({
        container: mapContainer.current,
        style: BASEMAP_URL,
        center: BENGALURU_OVERVIEW_CENTER,
        zoom: 12.5,
        pitch: 34,
        bearing: -8,
        maxTileCacheSize: 200,
        attributionControl: false, 
      });

      mapRef.current = m;

      m.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

      const handleMapLoad = () => {
        try {
          // 1. Add Silk Board Origin Marker
          const originEl = document.createElement('div');
          originEl.style.width = '16px';
          originEl.style.height = '16px';
          originEl.style.background = '#eab308';
          originEl.style.borderRadius = '50%';
          originEl.style.border = '2.5px solid #ffffff';
          originEl.style.boxShadow = '0 0 16px #eab308';
          
          originEl.addEventListener('click', (ev) => {
            ev.stopPropagation();
          });

          originMarkerRef.current = new Marker({ element: originEl })
            .setLngLat(SILK_BOARD_COORDS)
            .setPopup(
              new Popup({ offset: 12, className: 'dark-popup' }).setHTML(
                '<div style="background:rgba(15, 23, 42, 0.96); backdrop-filter: blur(16px); color:#fff; padding:8px 12px; border-radius:8px; border: 1px solid rgba(234, 179, 8, 0.5);"><strong>Central Silk Board Node</strong><br/><span style="color:#eab308;font-size:11px;font-family:monospace;">Phase-2A Origin Interchange</span></div>'
              )
            )
            .addTo(m);

          // 2. BENEFITED AREA BOUNDARIES (Multi-tier Sleek Holographic Shaders)
          m.addSource('benefited-areas-source', {
            type: 'geojson',
            data: '/data/benefited_areas.geojson'
          });

          // Layer 1: Semi-transparent glassmorphic base infill (unobtrusive, keeps underlying streets sharp)
          m.addLayer({
            id: 'benefited-areas-fill',
            type: 'fill',
            source: 'benefited-areas-source',
            paint: {
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.08
            }
          });

          // Layer 2: Subtle soft edge glow
          m.addLayer({
            id: 'benefited-areas-glow',
            type: 'line',
            source: 'benefited-areas-source',
            paint: {
              'line-color': ['get', 'color'],
              'line-width': 5,
              'line-opacity': 0.35,
              'line-blur': 3
            }
          });

          // Layer 3: Crisp, sleek boundary line
          m.addLayer({
            id: 'benefited-areas-line',
            type: 'line',
            source: 'benefited-areas-source',
            paint: {
              'line-color': ['get', 'color'],
              'line-width': 2
            }
          });

          // Layer 4: Benefit Zone Names (Crisp uppercase labels centered in each zone)
          m.addSource('benefited-areas-labels-source', {
            type: 'geojson',
            data: BENEFITED_AREAS_CENTROIDS
          });

          m.addLayer({
            id: 'benefited-areas-labels',
            type: 'symbol',
            source: 'benefited-areas-labels-source',
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Bold'],
              'text-size': ['interpolate', ['linear'], ['zoom'], 10, 11, 13, 13.5, 16, 16],
              'text-letter-spacing': 0.08,
              'text-transform': 'uppercase',
              'text-allow-overlap': true,
              'text-ignore-placement': true,
              'text-justify': 'center'
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#020617',
              'text-halo-width': 3,
              'text-halo-blur': 1,
              'text-opacity': 0.95
            }
          });

          // Hover interaction on boundary polygons & labels
          m.on('mouseenter', 'benefited-areas-fill', () => {
            m.getCanvas().style.cursor = 'pointer';
            m.setPaintProperty('benefited-areas-fill', 'fill-opacity', 0.22);
            m.setPaintProperty('benefited-areas-line', 'line-width', 2.8);
          });
          m.on('mouseleave', 'benefited-areas-fill', () => {
            m.getCanvas().style.cursor = '';
            m.setPaintProperty('benefited-areas-fill', 'fill-opacity', 0.08);
            m.setPaintProperty('benefited-areas-line', 'line-width', 2);
          });

          m.on('mouseenter', 'benefited-areas-labels', () => {
            m.getCanvas().style.cursor = 'pointer';
          });
          m.on('mouseleave', 'benefited-areas-labels', () => {
            m.getCanvas().style.cursor = '';
          });

          // 4. Existing Metro Lines (Green, Purple, Yellow)
          m.addSource('metro-lines', {
            type: 'geojson',
            data: '/data/metro_lines.geojson'
          });

          m.addLayer({
            id: 'metro-casing',
            type: 'line',
            source: 'metro-lines',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': [
                'case',
                ['==', ['get', 'colour'], 'green'], '#16a34a',
                ['==', ['get', 'colour'], 'purple'], '#9333ea',
                ['==', ['get', 'colour'], 'yellow'], '#ca8a04',
                '#0ab1ba'
              ],
              'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 8],
              'line-opacity': 0.45,
              'line-blur': 2
            }
          });

          m.addLayer({
            id: 'metro-core',
            type: 'line',
            source: 'metro-lines',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': [
                'case',
                ['==', ['get', 'colour'], 'green'], '#22c55e',
                ['==', ['get', 'colour'], 'purple'], '#c084fc',
                ['==', ['get', 'colour'], 'yellow'], '#eab308',
                '#38bdf8'
              ],
              'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 15, 5]
            }
          });

          // 5. Existing Metro Stations (Nodes)
          m.addSource('metro-stations-source', {
            type: 'geojson',
            data: '/data/metro_stations.geojson'
          });

          m.addLayer({
            id: 'metro-stations',
            type: 'circle',
            source: 'metro-stations-source',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3.5, 15, 7],
              'circle-color': '#020617',
              'circle-stroke-width': 2,
              'circle-stroke-color': [
                'case',
                ['==', ['get', 'color'], 'green'], '#22c55e',
                ['==', ['get', 'color'], 'purple'], '#c084fc',
                ['==', ['get', 'color'], 'yellow'], '#eab308',
                '#ffffff'
              ]
            }
          });

          m.addLayer({
            id: 'metro-stations-labels',
            type: 'symbol',
            source: 'metro-stations-source',
            minzoom: 12.5,
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
              'text-size': 11,
              'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
              'text-radial-offset': 0.8,
              'text-justify': 'auto'
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#020617',
              'text-halo-width': 2
            }
          });

          // 6. 2.0 KM CATCHMENT BUFFER (Geodesic buffer surrounding the candidate alignment)
          const initialTarget = targetCoords || BELLANDUR_COORDS;
          const initialViaductCoords = generateViaductCoordinates(initialTarget);
          const initialBuffer = computeBufferGeoJSON(initialViaductCoords, 2.0);

          m.addSource('corridor-buffer-source', {
            type: 'geojson',
            data: initialBuffer
          });

          m.addLayer({
            id: 'corridor-buffer-fill',
            type: 'fill',
            source: 'corridor-buffer-source',
            paint: {
              'fill-color': '#0ab1ba',
              'fill-opacity': 0.12
            }
          });

          m.addLayer({
            id: 'corridor-buffer-glow',
            type: 'line',
            source: 'corridor-buffer-source',
            paint: {
              'line-color': '#00F5D4',
              'line-width': 6,
              'line-opacity': 0.35,
              'line-blur': 4
            }
          });

          m.addLayer({
            id: 'corridor-buffer-line',
            type: 'line',
            source: 'corridor-buffer-source',
            paint: {
              'line-color': '#00F5D4',
              'line-width': 2,
              'line-dasharray': [4, 2]
            }
          });

          // 7. PROPOSED CANDIDATE METRO VIADUCT LINE (Track line layers removed per user request; only 2.0 km catchment buffer zone is displayed)
          m.addSource('corridor-track', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: initialViaductCoords
              }
            }
          });

          // 8. POIs Data (Corporate, Hospitals, Education, Civic)
          m.addSource('pois', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
          });
          
          fetch('/data/bangalore_pois.geojson')
            .then(res => res.json())
            .then(data => {
              allPOIsRef.current = data;
              const currentTarget = targetCoords || BELLANDUR_COORDS;
              updateCorridorAndFilterPOIs(currentTarget);
            })
            .catch(err => console.error('Failed to load POIs:', err));

          m.addLayer({
            id: 'poi-glow',
            type: 'circle',
            source: 'pois',
            minzoom: 10,
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4.5, 14, 8, 16, 12],
              'circle-color': [
                'match', ['get', 'category'],
                'corporate', '#22d3ee',
                'hospital', '#ef4444',
                'education', '#f59e0b',
                'civic', '#94a3b8',
                '#0ab1ba'
              ],
              'circle-opacity': 0.35,
              'circle-blur': 1
            }
          });

          m.addLayer({
            id: 'poi-layer',
            type: 'circle',
            source: 'pois',
            minzoom: 10,
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3.5, 14, 5.5, 16, 8],
              'circle-color': [
                'match', ['get', 'category'],
                'corporate', '#22d3ee',
                'hospital', '#ef4444',
                'education', '#f59e0b',
                'civic', '#94a3b8',
                '#0ab1ba'
              ],
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#020617'
            }
          });

          // POI Click & Hover Interactions
          m.on('mouseenter', 'poi-layer', () => {
            m.getCanvas().style.cursor = 'pointer';
          });
          m.on('mouseleave', 'poi-layer', () => {
            m.getCanvas().style.cursor = '';
          });

          m.on('click', 'poi-layer', (e) => {
            if (!e.features || e.features.length === 0) return;
            const p = e.features[0].properties as any;
            const catColor = p.category === 'corporate' ? '#22d3ee' : p.category === 'hospital' ? '#ef4444' : p.category === 'education' ? '#f59e0b' : '#94a3b8';
            
            new Popup({ offset: 12, className: 'dark-popup' })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="background: rgba(8, 14, 28, 0.96); backdrop-filter: blur(16px); color:#fff; padding:12px 14px; border-radius:12px; border: 1px solid ${catColor}77; box-shadow: 0 10px 30px rgba(0,0,0,0.7); min-width: 220px;">
                  <div style="font-size: 13px; font-weight: 700; color: #fff;">${p.name || 'Anchor Facility'}</div>
                  <div style="display:flex; align-items:center; gap:6px; margin-top: 4px;">
                    <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:${catColor};"></span>
                    <span style="font-size: 10.5px; font-family: monospace; text-transform: uppercase; color: ${catColor}; font-weight: 600;">${p.category}</span>
                  </div>
                  <div style="font-size: 10px; color: #94a3b8; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px;">
                    ${p.agent || 'Mapped within regional transit zone'}
                  </div>
                </div>
              `)
              .addTo(m);
          });

          // Handle Map Click for Placing Candidate End Node & Inspecting Areas
          m.on('click', (e) => {
            // If clicked directly on a station or POI, let their handlers take precedence
            const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
              [e.point.x - 10, e.point.y - 10],
              [e.point.x + 10, e.point.y + 10]
            ];
            const features = m.queryRenderedFeatures(bbox, { 
              layers: ['metro-stations', 'poi-layer'] 
            });
            if (features && features.length > 0) return;

            // Check if clicked inside a benefited area boundary or on its label to show its info
            const areaFeatures = m.queryRenderedFeatures(e.point, {
              layers: ['benefited-areas-fill', 'benefited-areas-labels']
            });
            if (areaFeatures && areaFeatures.length > 0) {
              const props = areaFeatures[0].properties as any;
              if (onAreaSelect) {
                onAreaSelect(props);
              }
              return; // Do NOT transport or move the candidate End Node when clicking on a benefit area!
            }

            // Clicking anywhere outside benefit areas places or moves the candidate End Node!
            if (onMapClick) {
              onMapClick([e.lngLat.lng, e.lngLat.lat]);
            }
          });

          setIsLoaded(true);
        } catch (error) {
          console.error("Error setting up map layers:", error);
          setIsLoaded(true); 
        }
      };

      if (m.loaded() || m.isStyleLoaded()) {
        handleMapLoad();
      } else {
        m.on('load', handleMapLoad);
      }
    } catch (err) {
      console.error("MapLibre initialization failed", err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle Benefited Areas Visibility Toggle
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;
    const visibility = showBenefitedAreas ? 'visible' : 'none';
    [
      'benefited-areas-fill', 
      'benefited-areas-glow', 
      'benefited-areas-line'
    ].forEach(layerId => {
      if (m.getLayer(layerId)) {
        m.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  }, [showBenefitedAreas, isLoaded]);

  // Handle Area Labels Visibility Toggle
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;
    const visibility = (showBenefitedAreas && showAreaLabels) ? 'visible' : 'none';
    if (m.getLayer('benefited-areas-labels')) {
      m.setLayoutProperty('benefited-areas-labels', 'visibility', visibility);
    }
  }, [showBenefitedAreas, showAreaLabels, isLoaded]);

  // Handle Catchment Buffer Visibility Toggle
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;
    const visibility = showCatchmentBuffer ? 'visible' : 'none';
    [
      'corridor-buffer-fill',
      'corridor-buffer-glow',
      'corridor-buffer-line'
    ].forEach(layerId => {
      if (m.getLayer(layerId)) {
        m.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  }, [showCatchmentBuffer, isLoaded]);

  // Handle Existing Metro Lines & Stations Visibility Toggle
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;
    const visibility = showMetroLines ? 'visible' : 'none';
    [
      'metro-casing',
      'metro-core',
      'metro-stations',
      'metro-stations-labels'
    ].forEach(layerId => {
      if (m.getLayer(layerId)) {
        m.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  }, [showMetroLines, isLoaded]);

  // Handle Buffer Radius Km Personalization Changes
  useEffect(() => {
    if (!isLoaded || !targetCoords) return;
    updateCorridorAndFilterPOIs(targetCoords, bufferRadiusKm);
  }, [bufferRadiusKm]);

  // Handle Focused Area Fly-To
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded || !focusedAreaCoords) return;

    const isOverview = Math.abs(focusedAreaCoords[0] - BENGALURU_OVERVIEW_CENTER[0]) < 0.05 && Math.abs(focusedAreaCoords[1] - BENGALURU_OVERVIEW_CENTER[1]) < 0.05;
    m.flyTo({
      center: focusedAreaCoords,
      zoom: isOverview ? 12.5 : 13.5,
      pitch: isOverview ? 34 : 45,
      bearing: isOverview ? -8 : 15,
      duration: 1800,
      essential: true
    });
  }, [focusedAreaCoords, isLoaded]);

  // Handle Filter Changes
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;
    
    if (activePOIFilters && activePOIFilters.length > 0) {
      const filterExpr: any = ['in', 'category', ...activePOIFilters];
      if (m.getLayer('poi-layer')) m.setFilter('poi-layer', filterExpr);
      if (m.getLayer('poi-glow')) m.setFilter('poi-glow', filterExpr);
    } else {
      const noneExpr: any = ['in', 'category', 'NONE'];
      if (m.getLayer('poi-layer')) m.setFilter('poi-layer', noneExpr);
      if (m.getLayer('poi-glow')) m.setFilter('poi-glow', noneExpr);
    }
  }, [activePOIFilters, isLoaded]);

  // Handle Target Coords Changes (End Node Placement, Viaduct Line, & Catchment Buffer)
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded || !targetCoords) return;

    // 1. Update Candidate Viaduct Track Line, Catchment Buffer, & Filter POIs within buffer
    updateCorridorAndFilterPOIs(targetCoords, bufferRadiusKm);

    // 2. Update or Create End Node (Terminus Marker)
    const terminusPopupHTML = `
      <div style="background: rgba(8, 14, 28, 0.96); backdrop-filter: blur(16px); color:#fff; padding:10px 14px; border-radius:12px; border: 1px solid rgba(0,245,212,0.6); box-shadow: 0 10px 25px rgba(0,0,0,0.7);">
        <strong style="font-size: 13px; color: #00F5D4; display:block; margin-bottom: 2px;">Proposed Candidate Terminus</strong>
        <span style="color:#94a3b8; font-size:11px; font-family:monospace;">Coords: ${targetCoords[1].toFixed(4)}, ${targetCoords[0].toFixed(4)}</span>
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #4ade80; font-family: monospace; font-weight: 700;">
          ✓ ${bufferRadiusKm.toFixed(1)} km Catchment Buffer Active (Phase-2A)
        </div>
      </div>
    `;

    if (!targetMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center cursor-grab active:cursor-grabbing group select-none';
      el.innerHTML = `
        <span style="position:absolute; width: 28px; height: 28px; border-radius: 9999px; background: rgba(0, 245, 212, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position:absolute; width: 20px; height: 20px; border-radius: 9999px; border: 1.5px solid rgba(0, 245, 212, 0.7); box-shadow: 0 0 10px rgba(0, 245, 212, 0.5);"></span>
        <span style="width: 13px; height: 13px; border-radius: 9999px; background: #00F5D4; border: 2.5px solid #ffffff; box-shadow: 0 0 14px #00F5D4;"></span>
      `;

      targetMarkerRef.current = new Marker({ element: el, draggable: true })
        .setLngLat(targetCoords)
        .setPopup(new Popup({ offset: 14, className: 'dark-popup' }).setHTML(terminusPopupHTML))
        .addTo(m);

      targetMarkerRef.current.on('drag', () => {
        const pos = targetMarkerRef.current?.getLngLat();
        if (pos) {
          updateCorridorAndFilterPOIs([pos.lng, pos.lat], bufferRadiusKm);
        }
      });

      targetMarkerRef.current.on('dragend', () => {
        const pos = targetMarkerRef.current?.getLngLat();
        if (pos && onMapClickRef.current) {
          onMapClickRef.current([pos.lng, pos.lat]);
        }
      });
    } else {
      targetMarkerRef.current.setLngLat(targetCoords);
      const popup = targetMarkerRef.current.getPopup();
      if (popup) {
        popup.setHTML(terminusPopupHTML);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCoords, bufferRadiusKm, isLoaded]);

  return (
    <div className={`relative w-full h-full bg-background overflow-hidden ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full [&_.maplibregl-popup-content]:!p-0 [&_.maplibregl-popup-content]:!bg-transparent [&_.maplibregl-popup-tip]:!border-t-[#0f172a]" />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/85 backdrop-blur-xl z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin"></div>
            <span className="font-mono text-sm text-primary animate-pulse">Initializing City Transit Engine...</span>
          </div>
        </div>
      )}
    </div>
  );
}
