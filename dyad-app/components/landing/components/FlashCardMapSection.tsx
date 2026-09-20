'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CITIES_CONFIG, CityConfig } from '../data/citiesConfig';
import { CITY_BOUNDARIES } from '../data/cityBoundaries';
import { HYDERABAD_METRO_LINES } from '../data/hyderabadMetroLines';
import { DELHI_METRO_LINES } from '../data/delhiMetroLines';
import { BENGALURU_METRO_LINES } from '../data/bengaluruMetroLines';
import { motionSprings } from '../../../lib/motion';
import { Layers, ArrowUpRight } from 'lucide-react';

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const CITIES_TABS = [
  { id: 'bengaluru', label: 'Bengaluru', tag: 'Metropolitan Boundary' },
  { id: 'delhi', label: 'Delhi-NCR', tag: 'National Capital Territory' },
  { id: 'hyderabad', label: 'Hyderabad', tag: 'GHMC Metropolitan Area' },
];

const NATIONAL_HUBS = [
  { id: 'bengaluru', name: 'Bengaluru', coords: [77.6350, 12.9350] as [number, number] },
  { id: 'delhi', name: 'Delhi-NCR', coords: [77.2167, 28.6270] as [number, number] },
  { id: 'hyderabad', name: 'Hyderabad', coords: [78.4600, 17.3950] as [number, number] },
  { id: 'mumbai', name: 'Mumbai', coords: [72.8777, 19.0760] as [number, number] },
  { id: 'chennai', name: 'Chennai', coords: [80.2707, 13.0827] as [number, number] },
  { id: 'kolkata', name: 'Kolkata', coords: [88.3639, 22.5726] as [number, number] }
];

export function FlashCardMapSection() {
  const [selectedCityId, setSelectedCityId] = useState<string>('bengaluru');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const currentCity = CITIES_CONFIG[selectedCityId] || CITIES_CONFIG.bengaluru;

  // Initialize MapLibre GL map inside the flashcard directly focused on Bengaluru
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCity = CITIES_CONFIG.bengaluru;
    const initialBoundary = CITY_BOUNDARIES.bengaluru;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASEMAP_STYLE,
      center: initialCity.center,
      zoom: initialCity.zoom,
      pitch: initialCity.pitch,
      bearing: initialCity.bearing,
      attributionControl: false,
      interactive: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      // 1. ADD CITY BOUNDARY SOURCE & HIGHLIGHT LAYERS
      map.addSource('city-boundary-source', {
        type: 'geojson',
        data: initialBoundary as any,
      });

      // Luminous interior tint of the city boundary (subtle turquoise wash)
      map.addLayer({
        id: 'city-boundary-fill',
        type: 'fill',
        source: 'city-boundary-source',
        paint: {
          'fill-color': '#0ab1ba',
          'fill-opacity': 0.05,
        },
      });

      // Outer boundary iconic turquoise soft neon glow
      map.addLayer({
        id: 'city-boundary-glow',
        type: 'line',
        source: 'city-boundary-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#0ab1ba',
          'line-width': 8,
          'line-blur': 6,
          'line-opacity': 0.6,
        },
      });

      // Sharp outer boundary perimeter line (electric turquoise)
      map.addLayer({
        id: 'city-boundary-line',
        type: 'line',
        source: 'city-boundary-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#00f5d4',
          'line-width': 2.2,
          'line-opacity': 0.95,
        },
      });

      // Inner specular rail boundary line
      map.addLayer({
        id: 'city-boundary-core',
        type: 'line',
        source: 'city-boundary-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.8,
          'line-opacity': 0.9,
        },
      });

      // 2. ADD TRANSIT CORRIDORS SOURCE & NEON LINE LAYERS (IDENTICAL TO HYDERABAD STYLE)
      map.addSource('corridors-source', {
        type: 'geojson',
        data: BENGALURU_METRO_LINES as any,
      });

      const corridorColorExpr = [
        'coalesce',
        ['get', 'color'],
        ['get', 'hex_color'],
        [
          'match',
          ['get', 'colour'],
          'green', '#22c55e',
          'purple', '#c084fc',
          'yellow', '#eab308',
          'blue', '#0284c7',
          'red', '#ef4444',
          'violet', '#9333ea',
          'orange', '#f97316',
          '#0ab1ba'
        ],
        '#0ab1ba'
      ] as any;

      // Corridor glow layer (cyan/neon bloom)
      map.addLayer({
        id: 'corridors-glow',
        type: 'line',
        source: 'corridors-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': corridorColorExpr,
          'line-width': 10,
          'line-blur': 8,
          'line-opacity': 0.75,
        },
      });

      // Core crisp line
      map.addLayer({
        id: 'corridors-line',
        type: 'line',
        source: 'corridors-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': corridorColorExpr,
          'line-width': 3,
          'line-opacity': 0.95,
        },
      });

      // Specular highlight rail core
      map.addLayer({
        id: 'corridors-core',
        type: 'line',
        source: 'corridors-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.0,
          'line-opacity': 0.85,
        },
      });

      setMapLoaded(true);
      map.resize();
      requestAnimationFrame(() => map.resize());
      setTimeout(() => map.resize(), 300);
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update camera, highlighted boundary & corridors on city select
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const targetCity = CITIES_CONFIG[selectedCityId] || CITIES_CONFIG.bengaluru;
    const targetBoundary = CITY_BOUNDARIES[selectedCityId] || CITY_BOUNDARIES.bengaluru;

    // 1. TOP-VIEW ANGLED 3D PERSPECTIVE FLIGHT (SHOWING FULL CITY BOUNDARY)
    map.flyTo({
      center: targetCity.center,
      zoom: targetCity.zoom,
      pitch: targetCity.pitch,
      bearing: targetCity.bearing,
      duration: 2200,
      essential: true,
    });

    // 2. UPDATE HIGHLIGHTED CITY BOUNDARY
    const boundarySource = map.getSource('city-boundary-source') as maplibregl.GeoJSONSource;
    if (boundarySource) {
      boundarySource.setData(targetBoundary as any);
    }

    // 3. UPDATE TRANSIT CORRIDORS (ONLY THE LINES, CLEAN & PRECISE)
    const corridorSource = map.getSource('corridors-source') as maplibregl.GeoJSONSource;
    if (corridorSource) {
      if (selectedCityId === 'bengaluru') {
        corridorSource.setData(BENGALURU_METRO_LINES as any);
      } else if (selectedCityId === 'delhi') {
        corridorSource.setData(DELHI_METRO_LINES as any);
      } else if (selectedCityId === 'hyderabad') {
        corridorSource.setData(HYDERABAD_METRO_LINES as any);
      } else {
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
        corridorSource.setData(corridorsGeoJSON as any);
      }
    }

    // 4. CLEAN AND UPDATE TERMINAL MARKERS (CLEAN WHITE DOTS AT LINE ENDS, EXACTLY LIKE HYDERABAD)
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (selectedCityId === 'india') {
      NATIONAL_HUBS.forEach(hub => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer select-none group';
        el.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffffff; border: 2px solid #000000; box-shadow: 0 0 10px rgba(255,255,255,0.6);"></div>
            <div style="margin-top: 4px; background: rgba(10, 10, 12, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); padding: 2px 7px; border-radius: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.9); white-space: nowrap;">
              <span style="font-family: -apple-system, sans-serif; font-size: 10.5px; font-weight: 600; color: #ffffff;">${hub.name}</span>
            </div>
          </div>
        `;
        el.onclick = () => {
          if (hub.id === 'bengaluru' || hub.id === 'delhi' || hub.id === 'hyderabad') {
            setSelectedCityId(hub.id);
          }
        };
        const marker = new maplibregl.Marker({ element: el }).setLngLat(hub.coords).addTo(map);
        markersRef.current.push(marker);
      });
    } else {
      let linesToMark: readonly any[] = [];
      if (selectedCityId === 'bengaluru') {
        linesToMark = BENGALURU_METRO_LINES.features;
      } else if (selectedCityId === 'delhi') {
        linesToMark = DELHI_METRO_LINES.features;
      } else if (selectedCityId === 'hyderabad') {
        linesToMark = HYDERABAD_METRO_LINES.features;
      } else {
        linesToMark = (targetCity.highlightCorridors || []).map(c => ({
          geometry: { coordinates: c.coords }
        }));
      }

      linesToMark.forEach(feat => {
        const coords = feat.geometry?.coordinates;
        if (coords && coords.length > 0) {
          [coords[0], coords[coords.length - 1]].forEach(coord => {
            const el = document.createElement('div');
            el.innerHTML = `
              <div style="width: 9px; height: 9px; border-radius: 50%; background: #ffffff; border: 2px solid #000000; box-shadow: 0 0 8px rgba(255,255,255,0.6);"></div>
            `;
            const marker = new maplibregl.Marker({ element: el }).setLngLat(coord).addTo(map);
            markersRef.current.push(marker);
          });
        }
      });
    }
  }, [selectedCityId, mapLoaded]);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 pt-4 pb-16">
      
      {/* =========================================================================
          1. CITY SELECTION OPTIONS (DIRECTLY ABOVE THE FLASHCARD)
          - Sleek dark pill with subtle black shadow experience
          ========================================================================= */}
      <div className="flex flex-col items-center mb-6">
        <div className="inline-flex items-center p-1.5 rounded-full bg-[#09090b] border border-white/[0.08] shadow-[0_20px_45px_rgba(0,0,0,0.95)] ring-1 ring-white/5 select-none">
          {CITIES_TABS.map((city) => {
            const isActive = selectedCityId === city.id;
            return (
              <button
                key={city.id}
                onClick={() => setSelectedCityId(city.id)}
                className={`relative px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none ${
                  isActive ? 'text-black font-extrabold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {/* ACTIVE PILL GLIDE: ICONIC DYAD TURQUOISE */}
                {isActive && (
                  <motion.div
                    layoutId="above-flashcard-active-pill"
                    className="absolute inset-0 rounded-full bg-[#00f5d4] shadow-[0_0_24px_rgba(0,245,212,0.45)]"
                    transition={motionSprings.snappy}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? 'font-black text-black' : 'font-medium'}`}>
                  {city.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          2. THE MAIN FLASH CARD (ANGLED TOP VIEW WITH CITY BOUNDARY HIGHLIGHTED)
          - Layered subtle black shadow experience
          - Clean vector map with seamless dark edge vignetting
          ========================================================================= */}
      <div className="relative w-full h-[540px] sm:h-[620px] rounded-[32px] overflow-hidden bg-[#030305] border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,1),0_15px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] select-none">
        
        {/* MAP CANVAS (POINTER-EVENTS-NONE ENSURES ZERO MOUSE INTERACTION) */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* SUBTLE INNER VIGNETTE FOR SEAMLESS PITCH BLACK FADE */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_90px_rgba(0,0,0,0.85)]" />

        {/* SLEEK FLOATING CITY BOUNDARY HUD CHIP (TOP-LEFT OF FLASHCARD) */}
        <div className="absolute top-5 left-6 z-20 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#09090b]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_25px_rgba(0,0,0,0.9)] pointer-events-auto">
          <span className="size-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            {currentCity.name}
          </span>
          <span className="text-zinc-500">•</span>
          <span className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
            <Layers className="size-3 text-zinc-400" />
            <span>Boundary Highlight Active</span>
          </span>
        </div>

        {/* BOTTOM-RIGHT DASHBOARD BUTTON */}
        <div className="absolute bottom-5 right-6 z-20 pointer-events-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(255,255,255,0.12)] border border-white/80 transition-all cursor-pointer select-none hover:scale-105 active:scale-95 group"
          >
            <span>Open Bengaluru Dashboard</span>
            <ArrowUpRight className="size-3.5 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

      </div>

    </section>
  );
}

export default FlashCardMapSection;
