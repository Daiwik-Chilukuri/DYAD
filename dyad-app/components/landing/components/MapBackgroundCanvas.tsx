'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CITIES_CONFIG, CityConfig } from '../data/citiesConfig';

interface MapBackgroundCanvasProps {
  activeCityKey: string;
  onCityChange?: (cityKey: string) => void;
  interactive?: boolean;
}

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// National transit hubs for Country overview
const NATIONAL_HUBS = [
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', coords: [77.6350, 12.9350] as [number, number], tag: 'Namma Metro • Primary Hub' },
  { id: 'delhi', name: 'Delhi-NCR', state: 'Delhi', coords: [77.2167, 28.6270] as [number, number], tag: 'DMRC & RRTS RapidX' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', coords: [78.4600, 17.3950] as [number, number], tag: 'Phase-2 Airport Express' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', coords: [72.8777, 19.0760] as [number, number], tag: 'Metro Lines 2A & 7' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', coords: [80.2707, 13.0827] as [number, number], tag: 'CMRL Phase 2' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', coords: [88.3639, 22.5726] as [number, number], tag: 'Underwater East-West Line' }
];

export function MapBackgroundCanvas({
  activeCityKey,
  onCityChange,
  interactive = true,
}: MapBackgroundCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize clear MapLibre GL instance (no pixel blocks, no hex noise)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCity = CITIES_CONFIG[activeCityKey] || CITIES_CONFIG.india;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASEMAP_STYLE,
      center: initialCity.center,
      zoom: initialCity.zoom,
      pitch: initialCity.pitch,
      bearing: initialCity.bearing,
      attributionControl: false,
      dragRotate: true,
      touchPitch: true,
      maxPitch: 65,
    });

    mapRef.current = map;

    map.on('load', () => {
      // 1. ADD REAL TRANSIT CORRIDOR SOURCE
      const corridorsGeoJSON = {
        type: 'FeatureCollection',
        features: (initialCity.highlightCorridors || []).map((corridor, idx) => ({
          type: 'Feature',
          properties: {
            id: `corridor-${idx}`,
            name: corridor.name,
            color: corridor.color,
            status: corridor.status,
          },
          geometry: {
            type: 'LineString',
            coordinates: corridor.coords,
          },
        })),
      };

      map.addSource('corridors-source', {
        type: 'geojson',
        data: corridorsGeoJSON as any,
      });

      // Ambient corridor glow
      map.addLayer({
        id: 'corridors-glow',
        type: 'line',
        source: 'corridors-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 10,
          'line-blur': 8,
          'line-opacity': 0.7,
        },
      });

      // Sharp, crisp transit line
      map.addLayer({
        id: 'corridors-line',
        type: 'line',
        source: 'corridors-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4,
          'line-opacity': 0.95,
        },
      });

      // Inner specular rail line
      map.addLayer({
        id: 'corridors-core',
        type: 'line',
        source: 'corridors-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.2,
          'line-opacity': 0.8,
        },
      });

      setMapLoaded(true);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update camera, markers & corridors on activeCityKey change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const targetCity = CITIES_CONFIG[activeCityKey] || CITIES_CONFIG.bengaluru;

    // 1. SMOOTH CINEMATIC CAMERA FLIGHT
    map.flyTo({
      center: targetCity.center,
      zoom: targetCity.zoom,
      pitch: targetCity.pitch,
      bearing: targetCity.bearing,
      duration: 2400,
      essential: true,
    });

    // 2. UPDATE CRISP VECTOR CORRIDOR LINES
    const corridorsGeoJSON = {
      type: 'FeatureCollection',
      features: (targetCity.highlightCorridors || []).map((corridor, idx) => ({
        type: 'Feature',
        properties: {
          id: `corridor-${idx}`,
          name: corridor.name,
          color: corridor.color,
          status: corridor.status,
        },
        geometry: {
          type: 'LineString',
          coordinates: corridor.coords,
        },
      })),
    };

    const corridorSource = map.getSource('corridors-source') as maplibregl.GeoJSONSource;
    if (corridorSource) {
      corridorSource.setData(corridorsGeoJSON as any);
    }

    // 3. UPDATE STATION/HUB MARKERS
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (activeCityKey === 'india') {
      // Show national hubs with clean labels
      NATIONAL_HUBS.forEach(hub => {
        const el = document.createElement('div');
        el.className = 'group cursor-pointer select-none';
        el.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #0ab1ba; border: 2px solid #ffffff; box-shadow: 0 0 12px #0ab1ba; display: flex; align-items: center; justify-content: center;">
              <div style="width: 4px; height: 4px; border-radius: 50%; background: #ffffff;"></div>
            </div>
            <div style="margin-top: 4px; background: rgba(14, 17, 23, 0.9); border: 1px solid rgba(255, 255, 255, 0.15); padding: 3px 8px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.6); white-space: nowrap;">
              <span style="font-family: -apple-system, sans-serif; font-size: 11px; font-weight: 700; color: #ffffff;">${hub.name}</span>
            </div>
          </div>
        `;
        el.onclick = () => {
          if (onCityChange && (hub.id === 'bengaluru' || hub.id === 'delhi' || hub.id === 'hyderabad')) {
            onCityChange(hub.id);
          }
        };

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(hub.coords)
          .addTo(map);

        markersRef.current.push(marker);
      });
    } else {
      // In city view, place clean station origin/terminus markers along highlight corridors
      const corridors = targetCity.highlightCorridors || [];
      corridors.forEach(c => {
        if (c.coords.length > 0) {
          const originCoord = c.coords[0];
          const termCoord = c.coords[c.coords.length - 1];

          [originCoord, termCoord].forEach((coord, i) => {
            const el = document.createElement('div');
            el.innerHTML = `
              <div style="width: 12px; height: 12px; border-radius: 50%; background: ${c.color}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${c.color};"></div>
            `;
            const marker = new maplibregl.Marker({ element: el })
              .setLngLat(coord)
              .addTo(map);
            markersRef.current.push(marker);
          });
        }
      });
    }
  }, [activeCityKey, mapLoaded, onCityChange]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#08090C]">
      {/* CLEAR MAPLIBRE VECTOR CANVAS */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* SUBTLE CORNER VIGNETTE (NON-OBTRUSIVE, KEEPS MAP CRISP) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/30" />

      {/* BOTTOM-RIGHT MAP ENGINE BADGE */}
      <div className="absolute bottom-3 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0E1117]/85 backdrop-blur-md border border-white/[0.1] text-[10.5px] font-mono text-slate-300 shadow-md">
        <span className="w-2 h-2 rounded-full bg-[#0ab1ba] animate-pulse" />
        <span>MapLibre GL • CARTO Dark Vector Canvas</span>
      </div>
    </div>
  );
}

export default MapBackgroundCanvas;
