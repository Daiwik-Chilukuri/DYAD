"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Feature, Polygon } from "geojson";
import {
  metroLines,
  metroStations,
  pois,
  poiCategoryColor,
} from "@/data/network";
import type { LngLat, MetroStation } from "@/types/contracts";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export interface FlyTarget {
  coordinates: LngLat;
  zoom: number;
  pitch: number;
  bearing?: number;
  nonce: number;
}

interface MapCanvasProps {
  origin: MetroStation | null;
  terminus: LngLat | null;
  buffer: Feature<Polygon> | null;
  flyTarget: FlyTarget | null;
  onStationClick: (station: MetroStation) => void;
  onMapClick: (coords: LngLat) => void;
  onReady?: () => void;
}

function lineFeatureCollection() {
  return {
    type: "FeatureCollection" as const,
    features: metroLines.map((line) => ({
      type: "Feature" as const,
      properties: { id: line.id, core: line.core, glow: line.glow },
      geometry: { type: "LineString" as const, coordinates: line.path },
    })),
  };
}

function stationFeatureCollection() {
  return {
    type: "FeatureCollection" as const,
    features: metroStations.map((s) => ({
      type: "Feature" as const,
      properties: {
        id: s.id,
        name: s.name,
        line: s.line,
        interchange: s.isInterchange,
      },
      geometry: { type: "Point" as const, coordinates: s.coordinates },
    })),
  };
}

function poiFeatureCollection() {
  return {
    type: "FeatureCollection" as const,
    features: pois.map((p) => ({
      type: "Feature" as const,
      properties: {
        id: p.id,
        name: p.name,
        category: p.category,
        color: poiCategoryColor[p.category],
      },
      geometry: { type: "Point" as const, coordinates: p.coordinates },
    })),
  };
}

const lineColorExpr: maplibregl.ExpressionSpecification = [
  "match",
  ["get", "id"],
  "purple",
  "#9D4EDD",
  "green",
  "#00F5D4",
  "yellow",
  "#FFD166",
  "blue",
  "#00BBF9",
  "#94A3B8",
];

const lineGlowExpr: maplibregl.ExpressionSpecification = [
  "match",
  ["get", "id"],
  "purple",
  "#7B2CBF",
  "green",
  "#06B6A4",
  "yellow",
  "#E0A800",
  "blue",
  "#0284C7",
  "#475569",
];

export function MapCanvas({
  origin,
  terminus,
  buffer,
  flyTarget,
  onStationClick,
  onMapClick,
  onReady,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const readyRef = useRef(false);
  const terminusMarkerRef = useRef<maplibregl.Marker | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Keep latest callbacks without re-initializing the map.
  const stationCb = useRef(onStationClick);
  const mapCb = useRef(onMapClick);
  stationCb.current = onStationClick;
  mapCb.current = onMapClick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [77.62, 12.955],
      zoom: 10.6,
      pitch: 44,
      bearing: -12,
      maxTileCacheSize: 200,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");

    map.on("load", () => {
      // --- Metro line glow (casing) ---
      map.addSource("metro-lines", { type: "geojson", data: lineFeatureCollection() });
      map.addLayer({
        id: "metro-glow",
        type: "line",
        source: "metro-lines",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": lineGlowExpr,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 6, 15, 14],
          "line-opacity": 0.4,
          "line-blur": 3,
        },
      });
      map.addLayer({
        id: "metro-core",
        type: "line",
        source: "metro-lines",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": lineColorExpr,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2.5, 15, 5],
        },
      });

      // --- Catchment buffer (empty until a corridor is drawn) ---
      const emptyFC = { type: "FeatureCollection" as const, features: [] };
      map.addSource("corridor-buffer", { type: "geojson", data: emptyFC });
      map.addLayer({
        id: "corridor-buffer-fill",
        type: "fill",
        source: "corridor-buffer",
        paint: { "fill-color": "#38BDF8", "fill-opacity": 0.12 },
      });
      map.addLayer({
        id: "corridor-buffer-line",
        type: "line",
        source: "corridor-buffer",
        paint: {
          "line-color": "#38BDF8",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });

      // --- Proposed corridor line ---
      map.addSource("corridor-line", { type: "geojson", data: emptyFC });
      map.addLayer({
        id: "corridor-line-layer",
        type: "line",
        source: "corridor-line",
        layout: { "line-cap": "round" },
        paint: {
          "line-color": "#F43F5E",
          "line-width": 4,
          "line-dasharray": [1.5, 1],
        },
      });

      // --- POIs (glow halo + solid core) ---
      map.addSource("pois", { type: "geojson", data: poiFeatureCollection() });
      map.addLayer({
        id: "poi-halo",
        type: "circle",
        source: "pois",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 6, 15, 16],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.18,
          "circle-blur": 0.6,
        },
      });
      map.addLayer({
        id: "poi-core",
        type: "circle",
        source: "pois",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 3, 15, 6],
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#08090C",
          "circle-stroke-width": 1.5,
        },
      });

      // --- Stations ---
      map.addSource("stations", { type: "geojson", data: stationFeatureCollection() });
      map.addLayer({
        id: "station-halo",
        type: "circle",
        source: "stations",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 7, 15, 15],
          "circle-color": "#E2E8F0",
          "circle-opacity": 0.12,
          "circle-blur": 0.5,
        },
      });
      map.addLayer({
        id: "station-core",
        type: "circle",
        source: "stations",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            ["case", ["get", "interchange"], 5, 3.5],
            15,
            ["case", ["get", "interchange"], 9, 6.5],
          ],
          "circle-color": "#F8FAFC",
          "circle-stroke-color": "#0EA5E9",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "station-label",
        type: "symbol",
        source: "stations",
        minzoom: 11,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, 1.4],
          "text-anchor": "top",
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        },
        paint: {
          "text-color": "#CBD5E1",
          "text-halo-color": "#08090C",
          "text-halo-width": 1.4,
        },
      });

      const clickableStation = (e: maplibregl.MapLayerMouseEvent) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (!id) return;
        const station = metroStations.find((s) => s.id === id);
        if (station) stationCb.current(station);
      };
      map.on("click", "station-core", clickableStation);
      map.on("click", "station-halo", clickableStation);

      for (const layer of ["station-core", "station-halo", "poi-core"]) {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      }

      // Generic map click => terminus (unless a station was hit).
      map.on("click", (e) => {
        const hits = map.queryRenderedFeatures(e.point, {
          layers: ["station-core", "station-halo"],
        });
        if (hits.length > 0) return;
        mapCb.current([e.lngLat.lng, e.lngLat.lat]);
      });

      readyRef.current = true;
      onReady?.();
    });

    return () => {
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update buffer + corridor line when the selection changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    const bufferSource = map.getSource("corridor-buffer") as
      | maplibregl.GeoJSONSource
      | undefined;
    const lineSource = map.getSource("corridor-line") as
      | maplibregl.GeoJSONSource
      | undefined;

    if (buffer && bufferSource) {
      bufferSource.setData(buffer as unknown as GeoJSON.GeoJSON);
    } else if (bufferSource) {
      bufferSource.setData({ type: "FeatureCollection", features: [] });
    }

    if (origin && terminus && lineSource) {
      lineSource.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [origin.coordinates, terminus],
            },
          },
        ],
      });
    } else if (lineSource) {
      lineSource.setData({ type: "FeatureCollection", features: [] });
    }
  }, [origin, terminus, buffer]);

  // Origin highlight marker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    originMarkerRef.current?.remove();
    originMarkerRef.current = null;
    if (!origin) return;

    const el = document.createElement("div");
    el.style.cssText =
      "width:16px;height:16px;border-radius:9999px;background:#38BDF8;box-shadow:0 0 0 4px rgba(56,189,248,0.25),0 0 12px rgba(56,189,248,0.8);border:2px solid #E0F2FE;";
    originMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat(origin.coordinates)
      .addTo(map);
  }, [origin]);

  // Terminus pin marker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    terminusMarkerRef.current?.remove();
    terminusMarkerRef.current = null;
    if (!terminus) return;

    const el = document.createElement("div");
    el.style.cssText =
      "width:18px;height:18px;border-radius:9999px 9999px 9999px 2px;transform:rotate(45deg);background:#F43F5E;box-shadow:0 0 0 4px rgba(244,63,94,0.25),0 0 14px rgba(244,63,94,0.85);border:2px solid #FFE4E6;";
    terminusMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat(terminus)
      .addTo(map);
  }, [terminus]);

  // Fit bounds to corridor when both endpoints exist.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || !origin || !terminus) return;
    const bounds = new maplibregl.LngLatBounds();
    bounds.extend(origin.coordinates);
    bounds.extend(terminus);
    map.fitBounds(bounds, {
      padding: { top: 140, bottom: 140, left: 100, right: 480 },
      pitch: 48,
      bearing: -14,
      duration: 2200,
      maxZoom: 13.8,
      essential: true,
    });
  }, [origin, terminus]);

  // Imperative flyTo from the dossier focal points.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || !flyTarget) return;
    map.flyTo({
      center: flyTarget.coordinates,
      zoom: flyTarget.zoom,
      pitch: flyTarget.pitch,
      bearing: flyTarget.bearing ?? 20,
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });
  }, [flyTarget]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
