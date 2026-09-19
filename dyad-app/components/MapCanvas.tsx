'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Map, NavigationControl, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import type * as GeoJSON from 'geojson';
import {
  MapCanvasProps,
  OriginStation,
  SuggestedStation,
  BufferStats,
} from '../types/map';

export type { MapCanvasProps, OriginStation, SuggestedStation, BufferStats };

// The CARTO Dark Matter vector tile style URL
const BASEMAP_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
// Initial overview camera center for Bengaluru
const BENGALURU_OVERVIEW_CENTER: [number, number] = [77.6500, 12.9350];

export function MapCanvas({
  originStation,
  destinationCoords,
  targetCoords,
  onOriginSelect,
  onDestinationSelect,
  onMapClick,
  visualizerGeoJSON = null,
  suggestedStations = [],
  onSuggestedStationClick,
  activeStationFocus = null,
  activePOIFilters = ['corporate', 'hospital', 'education', 'civic'],
  showBenefitedAreas = true,
  showCatchmentBuffer = true,
  showMetroLines = true,
  showAreaLabels = true,
  bufferRadiusKm = 2.0,
  focusedAreaCoords = null,
  onAreaSelect,
  onBufferStatsChange,
  isDossierOpen = true,
  className = '',
}: MapCanvasProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const targetMarkerRef = useRef<Marker | null>(null);
  const originMarkerRef = useRef<Marker | null>(null);
  const suggestedMarkersRef = useRef<Marker[]>([]);

  // Uncontrolled fallback states if props are omitted
  const [internalOriginStation, setInternalOriginStation] = useState<OriginStation | null>(null);
  const [internalDestination, setInternalDestination] = useState<[number, number] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Synchronized callback refs to prevent listener teardowns
  const onOriginSelectRef = useRef(onOriginSelect);
  onOriginSelectRef.current = onOriginSelect;

  const onDestinationSelectRef = useRef(onDestinationSelect);
  onDestinationSelectRef.current = onDestinationSelect;

  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  const onSuggestedStationClickRef = useRef(onSuggestedStationClick);
  onSuggestedStationClickRef.current = onSuggestedStationClick;

  const onBufferStatsChangeRef = useRef(onBufferStatsChange);
  onBufferStatsChangeRef.current = onBufferStatsChange;

  const onAreaSelectRef = useRef(onAreaSelect);
  onAreaSelectRef.current = onAreaSelect;

  // Effective origin and destination (prioritizing explicit controlled props)
  const effectiveOrigin = originStation !== undefined ? originStation : internalOriginStation;
  const effectiveDest =
    destinationCoords !== undefined
      ? destinationCoords
      : targetCoords !== undefined
      ? targetCoords
      : internalDestination;

  // Helper to recompute viaduct line, Turf.js radial catchment buffer, and filter POIs
  const updateCorridorAndFilterPOIs = useCallback(
    (
      origin: [number, number] | null,
      dest: [number, number] | null,
      radius: number = bufferRadiusKm
    ) => {
      const m = mapRef.current;
      if (!m) return;

      let lineGeo: any = { type: 'FeatureCollection', features: [] };
      let bufferGeo: any = { type: 'FeatureCollection', features: [] };

      if (origin && dest && (origin[0] !== dest[0] || origin[1] !== dest[1])) {
        try {
          const line = turf.lineString([origin, dest]);
          const buffered = turf.buffer(line, radius, { units: 'kilometers' });
          if (line) lineGeo = line;
          if (buffered) bufferGeo = buffered;
        } catch (err) {
          console.error('Error computing corridor geometry with Turf.js:', err);
        }
      }

      // Update corridor-track (viaduct alignment line)
      const trackSource = m.getSource('corridor-track') as maplibregl.GeoJSONSource;
      if (trackSource) {
        trackSource.setData(lineGeo);
      }

      // Update both corridor-buffer-source and corridor-source for dynamic catchment
      const bufferSource = m.getSource('corridor-buffer-source') as maplibregl.GeoJSONSource;
      if (bufferSource) {
        bufferSource.setData(bufferGeo);
      }
      const corridorSource = m.getSource('corridor-source') as maplibregl.GeoJSONSource;
      if (corridorSource) {
        corridorSource.setData(bufferGeo);
      }

    },
    [bufferRadiusKm]
  );

  // Initialize MapLibre Canvas
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
      m.addControl(new NavigationControl({ visualizePitch: true }), 'bottom-right');

      const handleMapLoad = () => {
        try {
          const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

          // 1. DYNAMIC CATCHMENT BUFFER (Turf.js Radial Buffer - Bottom Layer)
          m.addSource('corridor-buffer-source', {
            type: 'geojson',
            data: emptyFC,
          });
          m.addSource('corridor-source', {
            type: 'geojson',
            data: emptyFC,
          });

          m.addLayer({
            id: 'corridor-buffer-fill',
            type: 'fill',
            source: 'corridor-buffer-source',
            paint: {
              'fill-color': '#0ab1ba',
              'fill-opacity': 0.12,
            },
          });

          m.addLayer({
            id: 'corridor-buffer-glow',
            type: 'line',
            source: 'corridor-buffer-source',
            paint: {
              'line-color': '#00F5D4',
              'line-width': 6,
              'line-opacity': 0.35,
              'line-blur': 4,
            },
          });

          m.addLayer({
            id: 'corridor-buffer-line',
            type: 'line',
            source: 'corridor-buffer-source',
            paint: {
              'line-color': '#00F5D4',
              'line-width': 2,
              'line-dasharray': [4, 2],
            },
          });

          // 2. DYNAMIC VISUALIZER GEOJSON LAYERING (Modal Swarm Agent 1 Output)
          // Polygons (BBMP Wards, Lakes, Wetlands, Slums) render strictly ON TOP of the buffer
          m.addSource('visualizer-features-source', {
            type: 'geojson',
            data: visualizerGeoJSON || emptyFC,
          });

          // Visualizer Polygons Fill (Lakes cyan #06b6d4, Slums amber #f59e0b, Wards purple #8b5cf6)
          m.addLayer({
            id: 'visualizer-polygons-fill',
            type: 'fill',
            source: 'visualizer-features-source',
            filter: [
              'all',
              ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
              ['!=', ['coalesce', ['get', 'type'], ''], 'CatchmentBuffer'],
            ],
            paint: {
              'fill-color': [
                'case',
                ['any', ['has', 'lake_name'], ['in', 'lake', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]]], '#06b6d4',
                ['in', 'wetland', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]], '#10b981',
                ['any', ['has', 'Slum_Name'], ['in', 'slum', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]]], '#f59e0b',
                ['any', ['has', 'WARD_NAME'], ['in', 'ward', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]]], '#8b5cf6',
                '#38bdf8',
              ],
              'fill-opacity': [
                'case',
                ['any', ['has', 'lake_name'], ['in', 'lake', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]]], 0.35,
                ['in', 'wetland', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]], 0.25,
                ['any', ['has', 'Slum_Name'], ['in', 'slum', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]]], 0.25,
                ['any', ['has', 'WARD_NAME'], ['in', 'ward', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]]], 0.22,
                0.20,
              ],
            },
          });

          // Visualizer Polygons Outline
          m.addLayer({
            id: 'visualizer-polygons-line',
            type: 'line',
            source: 'visualizer-features-source',
            filter: [
              'all',
              ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
              ['!=', ['coalesce', ['get', 'type'], ''], 'CatchmentBuffer'],
            ],
            paint: {
              'line-color': [
                'case',
                ['any', ['has', 'lake_name'], ['in', 'lake', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]]], '#00F5D4',
                ['in', 'wetland', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]], '#10b981',
                ['any', ['has', 'Slum_Name'], ['in', 'slum', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]]], '#f59e0b',
                ['any', ['has', 'WARD_NAME'], ['in', 'ward', ['downcase', ['coalesce', ['get', 'source_dataset'], ['get', 'type'], ['get', 'intersection_type'], '']]]], '#a855f7',
                '#38bdf8',
              ],
              'line-width': 2.0,
              'line-opacity': 0.85,
            },
          });

          // 3. Visualizer Linear Features (Rajakaluves, streams, feeder corridors)
          m.addLayer({
            id: 'visualizer-lines',
            type: 'line',
            source: 'visualizer-features-source',
            filter: ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]],
            paint: {
              'line-color': '#6366f1',
              'line-width': 2.5,
              'line-dasharray': [3, 2],
              'line-opacity': 0.85,
            },
          });

          // 5. Existing Metro Lines (Green, Purple, Yellow)
          m.addSource('metro-lines', {
            type: 'geojson',
            data: '/data/metro_lines.geojson',
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
                '#0ab1ba',
              ],
              'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 8],
              'line-opacity': 0.45,
              'line-blur': 2,
            },
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
                '#38bdf8',
              ],
              'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 15, 5],
            },
          });

          // 6. Proposed Candidate Viaduct Track Polyline
          m.addSource('corridor-track', {
            type: 'geojson',
            data: emptyFC,
          });

          m.addLayer({
            id: 'corridor-track-line',
            type: 'line',
            source: 'corridor-track',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#00F5D4',
              'line-width': 3,
              'line-dasharray': [2, 2],
              'line-opacity': 0.85,
            },
          });

          // 7. Existing Metro Stations (Snappable Nodes)
          m.addSource('metro-stations-source', {
            type: 'geojson',
            data: '/data/metro_stations.geojson',
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
                '#ffffff',
              ],
            },
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
              'text-justify': 'auto',
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#020617',
              'text-halo-width': 2,
            },
          });

          // 8. POIs Data (Populated solely based on structured output from Visualizer Agent)
          m.addSource('pois', {
            type: 'geojson',
            data: emptyFC,
          });

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
                '#0ab1ba',
              ],
              'circle-opacity': 0.35,
              'circle-blur': 1,
            },
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
                '#0ab1ba',
              ],
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#020617',
            },
          });


          // 10. Suggested Stations Proposals Layer (AI Swarm Dossier Proposals)
          m.addSource('suggested-stations-source', {
            type: 'geojson',
            data: emptyFC,
          });

          m.addLayer({
            id: 'suggested-stations-glow',
            type: 'circle',
            source: 'suggested-stations-source',
            paint: {
              'circle-radius': 14,
              'circle-color': '#10B981',
              'circle-opacity': 0.35,
              'circle-blur': 1,
            },
          });

          m.addLayer({
            id: 'suggested-stations-layer',
            type: 'circle',
            source: 'suggested-stations-source',
            paint: {
              'circle-radius': 8,
              'circle-color': '#10B981',
              'circle-stroke-width': 2.5,
              'circle-stroke-color': '#ffffff',
            },
          });

          m.addLayer({
            id: 'suggested-stations-labels',
            type: 'symbol',
            source: 'suggested-stations-source',
            minzoom: 11,
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
              'text-size': 11.5,
              'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
              'text-radial-offset': 1.0,
              'text-justify': 'auto',
            },
            paint: {
              'text-color': '#34d399',
              'text-halo-color': '#020617',
              'text-halo-width': 2.5,
            },
          });

          // Flags for event coordination
          let flagStationClicked = false;
          let flagSuggestedStationClicked = false;
          let flagPoiClicked = false;
          let flagVisualizerClicked = false;

          // 11. Dynamic Station Snapping: Listen for clicks on metro-stations
          const handleStationClick = (e: any) => {
            if (!e.features || e.features.length === 0) return;
            flagStationClicked = true;
            const feat = e.features[0];
            const props = feat.properties || {};
            const geom = feat.geometry as GeoJSON.Point;
            const coords: [number, number] = [geom.coordinates[0], geom.coordinates[1]];
            const stationName = props.name || 'Metro Station';
            const stationColor = props.color || props.colour || 'purple';

            const stationData: OriginStation = {
              name: stationName,
              coordinates: coords,
              line: stationColor,
            };

            setInternalOriginStation(stationData);
            if (onOriginSelectRef.current) {
              onOriginSelectRef.current(stationData);
            }
          };

          m.on('click', 'metro-stations', handleStationClick);
          m.on('click', 'metro-stations-labels', handleStationClick);

          m.on('mouseenter', 'metro-stations', () => {
            m.getCanvas().style.cursor = 'pointer';
          });
          m.on('mouseleave', 'metro-stations', () => {
            m.getCanvas().style.cursor = '';
          });
          m.on('mouseenter', 'metro-stations-labels', () => {
            m.getCanvas().style.cursor = 'pointer';
          });
          m.on('mouseleave', 'metro-stations-labels', () => {
            m.getCanvas().style.cursor = '';
          });

          // 12. Suggested Station Click Handler
          m.on('click', 'suggested-stations-layer', (e) => {
            if (!e.features || e.features.length === 0) return;
            flagSuggestedStationClicked = true;
            const p = e.features[0].properties || {};
            const sId = p.station_id || p.id || p.name;
            if (onSuggestedStationClickRef.current && sId) {
              onSuggestedStationClickRef.current(sId);
            }

            const geom = e.features[0].geometry as GeoJSON.Point;
            new Popup({ offset: 14, className: 'dark-popup' })
              .setLngLat(geom.coordinates as [number, number])
              .setHTML(`
                <div style="background: rgba(14, 17, 23, 0.95); backdrop-filter: blur(16px); color:#fff; padding:10px 14px; border-radius:12px; border: 1px solid rgba(16,185,129,0.5); min-width: 200px;">
                  <span style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #10B981; font-weight: 700; letter-spacing: 0.05em;">AI Proposed Station</span>
                  <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 2px;">${p.name}</div>
                  ${p.typology ? `<div style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 4px;">Typology: <span style="color: #e2e8f0;">${p.typology}</span></div>` : ''}
                  ${p.priority ? `<div style="font-size: 10px; color: #94a3b8; font-family: monospace;">Priority: <span style="color: #34d399;">${p.priority}</span></div>` : ''}
                </div>
              `)
              .addTo(m);
          });
          m.on('mouseenter', 'suggested-stations-layer', () => {
            m.getCanvas().style.cursor = 'pointer';
          });
          m.on('mouseleave', 'suggested-stations-layer', () => {
            m.getCanvas().style.cursor = '';
          });

          // 13. POI Click & Hover Interactions
          m.on('mouseenter', 'poi-layer', () => {
            m.getCanvas().style.cursor = 'pointer';
          });
          m.on('mouseleave', 'poi-layer', () => {
            m.getCanvas().style.cursor = '';
          });

          m.on('click', 'poi-layer', (e) => {
            if (!e.features || e.features.length === 0) return;
            flagPoiClicked = true;
            const p = e.features[0].properties as any;
            const catColor =
              p.category === 'corporate'
                ? '#22d3ee'
                : p.category === 'hospital'
                ? '#ef4444'
                : p.category === 'education'
                ? '#f59e0b'
                : '#94a3b8';

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

          // 14. Visualizer Features Click & Inspection Popup
          const handleVisualizerClick = (e: any) => {
            if (!e.features || e.features.length === 0) return;
            flagVisualizerClicked = true;
            const p = e.features[0].properties || {};
            const title =
              p.lake_name || p.Slum_Name || p.WARD_NAME || p.hub_name || p.name || 'Spatial Feature';
            const dataset = (p.source_dataset || p.intersection_type || '')
              .replace('visualizer-', '')
              .replace('.geojson', '');
            const overlap = p.overlap_pct !== undefined ? `${p.overlap_pct}% buffer overlap` : '';
            const area = p.intersection_area_sqm
              ? `${Math.round(p.intersection_area_sqm).toLocaleString()} m²`
              : '';

            new Popup({ offset: 12, className: 'dark-popup' })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="background: rgba(14, 17, 23, 0.95); backdrop-filter: blur(16px); color:#fff; padding:12px 14px; border-radius:12px; border: 1px solid rgba(255,255,255,0.1); font-family: sans-serif; min-width: 200px;">
                  <div style="font-size: 13px; font-weight: 700; color: #00F5D4;">${title}</div>
                  <div style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 2px;">${dataset}</div>
                  ${area ? `<div style="font-size: 11px; margin-top: 6px; font-family: monospace; color: #e2e8f0;">Intersected Area: <strong>${area}</strong></div>` : ''}
                  ${overlap ? `<div style="font-size: 10.5px; color: #4ade80; font-family: monospace;">${overlap}</div>` : ''}
                </div>
              `)
              .addTo(m);
          };

          m.on('click', 'visualizer-polygons-fill', handleVisualizerClick);
          m.on('mouseenter', 'visualizer-polygons-fill', () => {
            m.getCanvas().style.cursor = 'pointer';
          });
          m.on('mouseleave', 'visualizer-polygons-fill', () => {
            m.getCanvas().style.cursor = '';
          });

          // 15. Dynamic Terminus Pin Dropping: Handle Map Canvas Click
          m.on('click', (e) => {
            if (flagStationClicked) {
              flagStationClicked = false;
              return;
            }
            if (flagSuggestedStationClicked) {
              flagSuggestedStationClicked = false;
              return;
            }
            if (flagPoiClicked) {
              flagPoiClicked = false;
              return;
            }
            if (flagVisualizerClicked) {
              flagVisualizerClicked = false;
              return;
            }

            // Inspect Visualizer polygon if clicked (BBMP Ward, Lake, Slum, Wetland)
            if (m.getLayer('visualizer-polygons-fill')) {
              const areaFeatures = m.queryRenderedFeatures(e.point, {
                layers: ['visualizer-polygons-fill'],
              });
              if (areaFeatures && areaFeatures.length > 0) {
                const props = areaFeatures[0].properties as any;
                if (onAreaSelectRef.current) {
                  onAreaSelectRef.current(props);
                }
                return;
              }
            }

            // Dynamic Terminus Pin Dropping: Update destination coordinates
            const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            setInternalDestination(coords);
            if (onDestinationSelectRef.current) {
              onDestinationSelectRef.current(coords);
            }
            if (onMapClickRef.current) {
              onMapClickRef.current(coords);
            }
          });

          setIsLoaded(true);
        } catch (error) {
          console.error('Error setting up map layers:', error);
          setIsLoaded(true);
        }
      };

      if (m.loaded() || m.isStyleLoaded()) {
        handleMapLoad();
      } else {
        m.on('load', handleMapLoad);
      }
    } catch (err) {
      console.error('MapLibre initialization failed', err);
    }

    return () => {
      suggestedMarkersRef.current.forEach((marker) => marker.remove());
      suggestedMarkersRef.current = [];
      if (originMarkerRef.current) {
        originMarkerRef.current.remove();
        originMarkerRef.current = null;
      }
      if (targetMarkerRef.current) {
        targetMarkerRef.current.remove();
        targetMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);



  // Update Suggested Stations layer and DOM markers
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;

    // 1. Update MapLibre GeoJSON Source
    const source = m.getSource('suggested-stations-source') as maplibregl.GeoJSONSource;
    const features: GeoJSON.Feature<GeoJSON.Point>[] = (suggestedStations || []).map((s, idx) => {
      const stationId = s.station_id || (s as any).id || s.name || `suggested-${idx}`;
      const coords: [number, number] =
        s.coordinates && s.coordinates.length === 2
          ? s.coordinates
          : typeof (s as any).longitude === 'number' && typeof (s as any).latitude === 'number'
          ? [(s as any).longitude, (s as any).latitude]
          : [77.6, 12.9];

      return {
        type: 'Feature',
        properties: {
          station_id: stationId,
          name: s.name,
          typology: s.typology,
          priority: s.priority,
        },
        geometry: {
          type: 'Point',
          coordinates: coords,
        },
      };
    });

    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features,
      });
    }

    // 2. Manage DOM markers for suggested stations
    suggestedMarkersRef.current.forEach((marker) => marker.remove());
    suggestedMarkersRef.current = [];

    (suggestedStations || []).forEach((s, idx) => {
      const stationId = s.station_id || (s as any).id || s.name || `suggested-${idx}`;
      const coords: [number, number] | null =
        s.coordinates && s.coordinates.length === 2
          ? s.coordinates
          : typeof (s as any).longitude === 'number' && typeof (s as any).latitude === 'number'
          ? [(s as any).longitude, (s as any).latitude]
          : null;

      if (!coords) return;

      const el = document.createElement('div');
      el.className = 'suggested-station-dom-marker group cursor-pointer select-none';
      el.setAttribute('data-station-id', stationId);
      el.title = `Suggested Station: ${s.name}`;
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.position = 'relative';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.innerHTML = `
        <span style="position:absolute; width: 22px; height: 22px; border-radius: 9999px; background: rgba(16, 185, 129, 0.25); animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position:absolute; width: 16px; height: 16px; border-radius: 9999px; border: 1.5px solid rgba(16, 185, 129, 0.8); background: rgba(16, 185, 129, 0.15); box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);"></span>
        <span style="width: 8px; height: 8px; border-radius: 9999px; background: #10B981; border: 1.5px solid #ffffff; box-shadow: 0 0 8px #10B981;"></span>
      `;

      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        onSuggestedStationClickRef.current?.(stationId);
      });

      const marker = new Marker({ element: el })
        .setLngLat(coords)
        .addTo(m);

      suggestedMarkersRef.current.push(marker);
    });
  }, [suggestedStations, isLoaded]);

  // Handle Camera Animation when activeStationFocus changes
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded || !activeStationFocus) return;

    m.flyTo({
      center: activeStationFocus,
      zoom: 15,
      pitch: 45,
      duration: 1500,
      essential: true,
    });
  }, [activeStationFocus, isLoaded]);

  // Reactive Visualizer GeoJSON Layering & Filtered POIs Engine
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;

    // 1. Update visualizer-features-source with polygons, lines, and hubs
    const visualizerSource = m.getSource('visualizer-features-source') as maplibregl.GeoJSONSource;
    if (visualizerSource) {
      visualizerSource.setData(visualizerGeoJSON || { type: 'FeatureCollection', features: [] });
    }

    // 2. Extract Point features, map them to normalized categories, and filter by activePOIFilters
    const poiSource = m.getSource('pois') as maplibregl.GeoJSONSource;
    if (poiSource) {
      if (visualizerGeoJSON && Array.isArray(visualizerGeoJSON.features) && visualizerGeoJSON.features.length > 0) {
        const pointFeatures = visualizerGeoJSON.features
          .filter((f: any) => {
            const gType = f.geometry?.type;
            return gType === 'Point' || gType === 'MultiPoint';
          })
          .map((f: any) => {
            let category = f.properties?.category;
            const p = f.properties || {};

            if (!category) {
              const rawAmenity = (p.amenity || '').toLowerCase();
              const rawOffice = (p.office || '').toLowerCase();
              const rawHealthcare = (p.healthcare || '').toLowerCase();
              const rawBuilding = (p.building || '').toLowerCase();
              const rawType = (p.type || p.poi_type || '').toLowerCase();
              const rawName = (p.name || p.hub_name || p.hospital_name || p.title || '').toLowerCase();

              // 1. Healthcare / Hospital check
              if (
                rawAmenity.includes('hosp') || rawAmenity.includes('clinic') || rawAmenity.includes('health') || rawAmenity.includes('pharmacy') || rawAmenity.includes('doctor') ||
                rawHealthcare.includes('hosp') || rawHealthcare.includes('clinic') || rawHealthcare.includes('health') ||
                p.hospital_name || rawType.includes('hosp') ||
                rawName.includes('hospital') || rawName.includes('clinic') || rawName.includes('healthcare') || rawName.includes('medica')
              ) {
                category = 'hospital';
              }
              // 2. Education check
              else if (
                rawAmenity.includes('school') || rawAmenity.includes('college') || rawAmenity.includes('univ') || rawAmenity.includes('kindergarten') || rawAmenity.includes('education') ||
                rawOffice.includes('educational') ||
                rawName.includes('school') || rawName.includes('college') || rawName.includes('university') || rawName.includes('vidyalaya') || rawName.includes('institute') || rawName.includes('academy')
              ) {
                category = 'education';
              }
              // 3. Corporate / Tech Park / Commercial check
              else if (
                rawOffice.includes('company') || rawOffice.includes('it') || rawOffice.includes('coworking') || rawOffice.includes('commercial') ||
                rawAmenity.includes('coworking') ||
                p.hub_name || p.workforce || rawType.includes('tech') || rawType.includes('park') ||
                rawName.includes('tech') || rawName.includes('park') || rawName.includes('pvt ltd') || rawName.includes('ltd') || rawName.includes('corp') || rawName.includes('towers') || rawName.includes('sez') || rawName.includes('campus')
              ) {
                category = 'corporate';
              }
              // 4. Civic / Transit / Public Admin check
              else if (
                rawAmenity.includes('bus') || rawAmenity.includes('transit') || rawAmenity.includes('stop') || rawAmenity.includes('station') ||
                rawAmenity.includes('police') || rawAmenity.includes('post_office') || rawAmenity.includes('townhall') || rawAmenity.includes('court') ||
                rawOffice.includes('gov') || rawOffice.includes('ngo') || rawOffice.includes('association') ||
                rawType.includes('civic') || rawType.includes('transit') || rawType.includes('bus') ||
                rawName.includes('bus') || rawName.includes('station') || rawName.includes('police') || rawName.includes('post office') || rawName.includes('bbmp') || rawName.includes('bda')
              ) {
                category = 'civic';
              }
              // 5. Default fallback based on office/commercial vs general
              else if (rawOffice || rawBuilding.includes('commercial') || rawBuilding.includes('office')) {
                category = 'corporate';
              } else {
                category = 'civic';
              }
            } else {
              category = category.toLowerCase();
              if (!['corporate', 'hospital', 'education', 'civic'].includes(category)) {
                if (category.includes('hosp') || category.includes('health')) category = 'hospital';
                else if (category.includes('edu') || category.includes('school')) category = 'education';
                else if (category.includes('civic') || category.includes('transit') || category.includes('bus')) category = 'civic';
                else category = 'corporate';
              }
            }

            return {
              ...f,
              properties: {
                ...f.properties,
                name: f.properties?.name || f.properties?.hub_name || f.properties?.hospital_name || f.properties?.title || 'Anchor Facility',
                category,
                agent: f.properties?.source_dataset ? `Visualizer Agent: ${f.properties.source_dataset}` : 'Visualizer Agent Output',
              },
            };
          });

        // Compute total stats across all mapped points
        const stats: BufferStats = {
          total: pointFeatures.length,
          byCategory: {
            corporate: pointFeatures.filter((f: any) => f.properties?.category === 'corporate').length,
            hospital: pointFeatures.filter((f: any) => f.properties?.category === 'hospital').length,
            education: pointFeatures.filter((f: any) => f.properties?.category === 'education').length,
            civic: pointFeatures.filter((f: any) => f.properties?.category === 'civic').length,
          },
        };

        // Filter by active categories
        const filteredPointFeatures = pointFeatures.filter((f: any) => {
          if (!activePOIFilters || activePOIFilters.length === 0) return true;
          return activePOIFilters.includes(f.properties?.category);
        });

        // 3. Populates pois source and notifies onBufferStatsChange
        poiSource.setData({
          type: 'FeatureCollection',
          features: filteredPointFeatures,
        });

        if (onBufferStatsChangeRef.current) {
          onBufferStatsChangeRef.current(stats);
        }
      } else {
        poiSource.setData({ type: 'FeatureCollection', features: [] });
        if (onBufferStatsChangeRef.current) {
          onBufferStatsChangeRef.current({
            total: 0,
            byCategory: { corporate: 0, hospital: 0, education: 0, civic: 0 },
          });
        }
      }
    }
  }, [visualizerGeoJSON, activePOIFilters, isLoaded]);

  // Reactive Catchment Buffer & POI recalculation
  useEffect(() => {
    if (!isLoaded) return;
    const curOrigin = effectiveOrigin?.coordinates ?? null;
    const curDest = effectiveDest;
    updateCorridorAndFilterPOIs(curOrigin, curDest, bufferRadiusKm);
  }, [effectiveOrigin, effectiveDest, bufferRadiusKm, isLoaded, updateCorridorAndFilterPOIs]);

  // Origin Marker Management (Dynamic Placement & Popup)
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;

    if (effectiveOrigin && effectiveOrigin.coordinates) {
      const originPopupHTML = `
        <div style="background:rgba(15, 23, 42, 0.96); backdrop-filter: blur(16px); color:#fff; padding:10px 14px; border-radius:12px; border: 1px solid rgba(234, 179, 8, 0.6); box-shadow: 0 10px 25px rgba(0,0,0,0.7); min-width: 200px;">
          <span style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #eab308; font-weight: 700; letter-spacing: 0.05em;">Corridor Origin</span>
          <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 2px;">${effectiveOrigin.name}</div>
          ${effectiveOrigin.line ? `<div style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 4px;">Line: <span style="text-transform: capitalize; color: #facc15;">${effectiveOrigin.line}</span></div>` : ''}
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #4ade80; font-family: monospace;">
            ✓ Snapped Station Node
          </div>
        </div>
      `;

      if (!originMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'origin-station-marker select-none cursor-pointer';
        el.style.width = '18px';
        el.style.height = '18px';
        el.style.background = '#eab308';
        el.style.borderRadius = '50%';
        el.style.border = '2.5px solid #ffffff';
        el.style.boxShadow = '0 0 16px #eab308, 0 0 25px rgba(234, 179, 8, 0.4)';

        originMarkerRef.current = new Marker({ element: el })
          .setLngLat(effectiveOrigin.coordinates)
          .setPopup(new Popup({ offset: 14, className: 'dark-popup' }).setHTML(originPopupHTML))
          .addTo(m);
      } else {
        originMarkerRef.current.setLngLat(effectiveOrigin.coordinates);
        const popup = originMarkerRef.current.getPopup();
        if (popup) {
          popup.setHTML(originPopupHTML);
        }
      }
    } else {
      if (originMarkerRef.current) {
        originMarkerRef.current.remove();
        originMarkerRef.current = null;
      }
    }
  }, [effectiveOrigin, isLoaded]);

  // Terminus Marker Management (Dynamic Pin Placement & Dragging)
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;

    if (effectiveDest) {
      const terminusPopupHTML = `
        <div style="background: rgba(8, 14, 28, 0.96); backdrop-filter: blur(16px); color:#fff; padding:10px 14px; border-radius:12px; border: 1px solid rgba(0,245,212,0.6); box-shadow: 0 10px 25px rgba(0,0,0,0.7); min-width: 200px;">
          <span style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #00F5D4; font-weight: 700; letter-spacing: 0.05em;">Candidate Terminus</span>
          <div style="font-size: 12px; font-weight: 700; color: #fff; margin-top: 2px;">Dropped Terminus Pin</div>
          <div style="color:#94a3b8; font-size:10px; font-family:monospace; margin-top: 2px;">Coords: ${effectiveDest[1].toFixed(4)}, ${effectiveDest[0].toFixed(4)}</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #4ade80; font-family: monospace; font-weight: 700;">
            ✓ ${bufferRadiusKm.toFixed(1)} km Catchment Buffer Active
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
          .setLngLat(effectiveDest)
          .setPopup(new Popup({ offset: 14, className: 'dark-popup' }).setHTML(terminusPopupHTML))
          .addTo(m);

        targetMarkerRef.current.on('drag', () => {
          const pos = targetMarkerRef.current?.getLngLat();
          if (pos) {
            const curOrigin = effectiveOrigin?.coordinates ?? null;
            updateCorridorAndFilterPOIs(curOrigin, [pos.lng, pos.lat], bufferRadiusKm);
          }
        });

        targetMarkerRef.current.on('dragend', () => {
          const pos = targetMarkerRef.current?.getLngLat();
          if (pos) {
            const coords: [number, number] = [pos.lng, pos.lat];
            setInternalDestination(coords);
            if (onDestinationSelectRef.current) {
              onDestinationSelectRef.current(coords);
            }
            if (onMapClickRef.current) {
              onMapClickRef.current(coords);
            }
          }
        });
      } else {
        targetMarkerRef.current.setLngLat(effectiveDest);
        const popup = targetMarkerRef.current.getPopup();
        if (popup) {
          popup.setHTML(terminusPopupHTML);
        }
      }
    } else {
      if (targetMarkerRef.current) {
        targetMarkerRef.current.remove();
        targetMarkerRef.current = null;
      }
    }
  }, [effectiveDest, bufferRadiusKm, isLoaded, effectiveOrigin, updateCorridorAndFilterPOIs]);

  // Visibility Toggles
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;
    const visibility = showBenefitedAreas ? 'visible' : 'none';
    ['visualizer-polygons-fill', 'visualizer-polygons-line', 'visualizer-lines'].forEach((layerId) => {
      if (m.getLayer(layerId)) {
        m.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  }, [showBenefitedAreas, isLoaded]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;
    const visibility = showCatchmentBuffer ? 'visible' : 'none';
    [
      'corridor-buffer-fill',
      'corridor-buffer-glow',
      'corridor-buffer-line',
      'corridor-track-line',
    ].forEach((layerId) => {
      if (m.getLayer(layerId)) {
        m.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  }, [showCatchmentBuffer, isLoaded]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded) return;
    const visibility = showMetroLines ? 'visible' : 'none';
    ['metro-casing', 'metro-core', 'metro-stations', 'metro-stations-labels'].forEach((layerId) => {
      if (m.getLayer(layerId)) {
        m.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  }, [showMetroLines, isLoaded]);

  // Focused Area Fly-To
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !isLoaded || !focusedAreaCoords) return;

    const isOverview =
      Math.abs(focusedAreaCoords[0] - BENGALURU_OVERVIEW_CENTER[0]) < 0.05 &&
      Math.abs(focusedAreaCoords[1] - BENGALURU_OVERVIEW_CENTER[1]) < 0.05;

    m.flyTo({
      center: focusedAreaCoords,
      zoom: isOverview ? 12.5 : 13.5,
      pitch: isOverview ? 34 : 45,
      bearing: isOverview ? -8 : 15,
      duration: 1800,
      essential: true,
    });
  }, [focusedAreaCoords, isLoaded]);

  // POI Category Filtering
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

  return (
    <div className={`relative w-full h-full bg-background overflow-hidden ${isDossierOpen ? 'dossier-open' : 'dossier-closed'} ${className}`}>
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full [&_.maplibregl-popup-content]:!p-0 [&_.maplibregl-popup-content]:!bg-transparent [&_.maplibregl-popup-tip]:!border-t-[#0f172a]"
      />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/85 backdrop-blur-xl z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin"></div>
            <span className="font-mono text-sm text-primary animate-pulse">
              Initializing City Transit Engine...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
