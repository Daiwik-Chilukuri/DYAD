'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CITIES_CONFIG, CityConfig } from '../data/citiesConfig';
import { motionSprings } from '../../../lib/motion';
import { 
  ArrowRight, ArrowUpRight, Compass, Layers, 
  MapPin, Clock, Maximize2, Minimize2, Sparkles, Activity
} from 'lucide-react';

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const CITIES_TABS = [
  { id: 'india', label: 'Country (India)', badge: 'Overview' },
  { id: 'bengaluru', label: 'Bengaluru', badge: 'Active Target' },
  { id: 'delhi', label: 'Delhi-NCR', badge: 'DMRC & RRTS' },
  { id: 'hyderabad', label: 'Hyderabad', badge: 'Phase-2 IT' },
];

const NATIONAL_HUBS = [
  { id: 'bengaluru', name: 'Bengaluru', coords: [77.6350, 12.9350] as [number, number] },
  { id: 'delhi', name: 'Delhi-NCR', coords: [77.2167, 28.6270] as [number, number] },
  { id: 'hyderabad', name: 'Hyderabad', coords: [78.4600, 17.3950] as [number, number] },
  { id: 'mumbai', name: 'Mumbai', coords: [72.8777, 19.0760] as [number, number] },
  { id: 'chennai', name: 'Chennai', coords: [80.2707, 13.0827] as [number, number] },
  { id: 'kolkata', name: 'Kolkata', coords: [88.3639, 22.5726] as [number, number] }
];

export function InteractiveMapFlashCard() {
  const [selectedCityId, setSelectedCityId] = useState<string>('india');
  const [showIntelCard, setShowIntelCard] = useState<boolean>(true);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const activeCity = CITIES_CONFIG[selectedCityId] || CITIES_CONFIG.bengaluru;

  // Auto transition on initial entrance: Country view for 1.5s -> fly to Bengaluru
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedCityId('bengaluru');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize MapLibre GL map inside the flashcard
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCity = CITIES_CONFIG.india;

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
      // Transit corridors source
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

      // Corridor glow
      map.addLayer({
        id: 'corridors-glow',
        type: 'line',
        source: 'corridors-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 10,
          'line-blur': 8,
          'line-opacity': 0.7,
        },
      });

      // Sharp corridor line
      map.addLayer({
        id: 'corridors-line',
        type: 'line',
        source: 'corridors-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3.5,
          'line-opacity': 0.95,
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

  // Update camera and features on city select
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const targetCity = CITIES_CONFIG[selectedCityId] || CITIES_CONFIG.bengaluru;

    // Smooth cinematic flight
    map.flyTo({
      center: targetCity.center,
      zoom: targetCity.zoom,
      pitch: targetCity.pitch,
      bearing: targetCity.bearing,
      duration: 2200,
      essential: true,
    });

    // Update corridors
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

    // Clean markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (selectedCityId === 'india') {
      NATIONAL_HUBS.forEach(hub => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer select-none';
        el.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #0ab1ba; border: 2px solid #ffffff; box-shadow: 0 0 10px #0ab1ba;"></div>
            <div style="margin-top: 3px; background: rgba(14, 17, 23, 0.95); border: 1px solid rgba(255, 255, 255, 0.2); padding: 2px 6px; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.7); white-space: nowrap;">
              <span style="font-family: -apple-system, sans-serif; font-size: 10px; font-weight: 700; color: #ffffff;">${hub.name}</span>
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
      (targetCity.highlightCorridors || []).forEach(c => {
        if (c.coords.length > 0) {
          [c.coords[0], c.coords[c.coords.length - 1]].forEach(coord => {
            const el = document.createElement('div');
            el.innerHTML = `
              <div style="width: 12px; height: 12px; border-radius: 50%; background: ${c.color}; border: 2px solid #ffffff; box-shadow: 0 0 8px ${c.color};"></div>
            `;
            const marker = new maplibregl.Marker({ element: el }).setLngLat(coord).addTo(map);
            markersRef.current.push(marker);
          });
        }
      });
    }
  }, [selectedCityId, mapLoaded]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      
      {/* 1. FLASH CARD OUTER CONTAINER */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#0E1117] border border-white/[0.1] shadow-[0_30px_90px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
        
        {/* TOP SPECULAR HAIRLINE */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0ab1ba]/40 to-transparent z-30" />

        {/* 2. HORIZONTAL LIST ON TOP OF FLASH CARD (USER REQUIREMENT) */}
        <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-[#08090C]/95 border-b border-white/[0.08] backdrop-blur-xl">
          
          {/* LEFT: FLASH CARD STATUS TITLE */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded-xl bg-[#0ab1ba]/15 border border-[#0ab1ba]/30">
              <Compass className="size-4 text-[#0ab1ba] animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Urban Mobility Radar
                </span>
                <span className="size-1.5 rounded-full bg-[#10b981] animate-pulse" />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Select city to trigger cinematic vector transition
              </span>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE HORIZONTAL CITY SELECTION PILLS */}
          <div className="flex items-center p-1.5 rounded-full bg-[#161B22] border border-white/[0.08] shadow-inner">
            {CITIES_TABS.map((city) => {
              const isActive = selectedCityId === city.id;
              return (
                <button
                  key={city.id}
                  onClick={() => setSelectedCityId(city.id)}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {/* ACTIVE RED PILL GLIDE (MATCHING TOMTOM SCREENSHOT) */}
                  {isActive && (
                    <motion.div
                      layoutId="flashcard-city-pill"
                      className="absolute inset-0 rounded-full bg-[#E52020] shadow-md shadow-[#E52020]/40"
                      transition={motionSprings.snappy}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {city.label}
                    {city.id === 'bengaluru' && !isActive && (
                      <span className="size-1.5 rounded-full bg-[#0ab1ba] animate-ping" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* 3. FLASH CARD BODY: MAPLIBRE GL JS CANVAS */}
        <div className="relative w-full h-[520px] sm:h-[580px] bg-[#08090C] overflow-hidden">
          
          {/* MAP CANVAS */}
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

          {/* VIGNETTE GRADIENTS (SUBTLE) */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />

          {/* CONTROLS (TOP RIGHT OF CANVAS) */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setShowIntelCard(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-[#0E1117]/85 backdrop-blur-md border border-white/[0.1] text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
              title={showIntelCard ? "Minimize intel card" : "Show intel card"}
            >
              {showIntelCard ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              <span>{showIntelCard ? "Hide Intel" : "Show Intel"}</span>
            </button>
          </div>

          {/* 4. TOMTOM WHITE INTEL CARD (FLOATING INSIDE THE FLASH CARD) */}
          <AnimatePresence>
            {showIntelCard && (
              <motion.div
                key={activeCity.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                transition={motionSprings.smooth}
                className="absolute bottom-6 left-6 z-20 max-w-[420px] w-[calc(100%-3rem)] rounded-[24px] bg-white text-slate-950 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-200 select-none pointer-events-auto"
              >
                {/* HEADER ROW */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E52020] animate-pulse" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                      {activeCity.badge}
                    </span>
                  </div>
                  <span className="text-[10.5px] font-mono font-semibold text-slate-600 px-2 py-0.5 rounded-full bg-slate-100">
                    TomTom Traffic Index
                  </span>
                </div>

                {/* MAIN HEADLINE (100% READABILITY) */}
                <h3 className="font-sans text-xl sm:text-[22px] font-extrabold text-slate-950 leading-tight tracking-tight mb-2.5">
                  {activeCity.intelHeadline}
                </h3>

                {/* SUBTEXT */}
                <p className="text-slate-700 text-xs leading-relaxed mb-4 font-medium">
                  {activeCity.intelSubtext}
                </p>

                {/* METRICS ROW */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-5">
                  <div className="flex flex-col">
                    <span className="text-[9.5px] uppercase font-mono font-semibold text-slate-600">Peak Road</span>
                    <span className="font-mono text-sm font-extrabold text-[#E52020] tabular-nums">
                      {activeCity.metrics.peakSpeed}
                    </span>
                  </div>
                  <div className="flex flex-col border-x border-slate-200 px-2">
                    <span className="text-[9.5px] uppercase font-mono font-semibold text-slate-600">Annual Loss</span>
                    <span className="font-mono text-sm font-extrabold text-slate-900 tabular-nums">
                      {activeCity.metrics.annualLoss}
                    </span>
                  </div>
                  <div className="flex flex-col pl-1">
                    <span className="text-[9.5px] uppercase font-mono font-semibold text-slate-600">Peak Load</span>
                    <span className="font-mono text-sm font-extrabold text-[#0ab1ba] tabular-nums">
                      {activeCity.metrics.pphpd}
                    </span>
                  </div>
                </div>

                {/* ACTION CTA BUTTON */}
                <Link href="/" className="block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={motionSprings.snappy}
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#E52020] hover:bg-[#cc1818] text-white font-sans text-xs sm:text-sm font-bold tracking-wide shadow-md shadow-[#E52020]/30 transition-all cursor-pointer"
                  >
                    <span>{activeCity.buttonText}</span>
                    <ArrowRight className="size-4" />
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOTTOM-RIGHT BADGE */}
          <div className="absolute bottom-3 right-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E1117]/90 border border-white/[0.1] text-[10px] font-mono text-slate-400">
            <span className="size-1.5 rounded-full bg-[#0ab1ba]" />
            <span>MapLibre GL 3D Engine • High-Resolution Vector Basemap</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default InteractiveMapFlashCard;
