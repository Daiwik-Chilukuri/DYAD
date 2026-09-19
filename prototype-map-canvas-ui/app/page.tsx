"use client";

import { useCallback, useMemo, useState } from "react";
import type { Feature, Polygon } from "geojson";
import { MapCanvas, type FlyTarget } from "@/components/MapCanvas";
import { AuthorityDossier } from "@/components/AuthorityDossier";
import { TelemetryTicker } from "@/components/TelemetryTicker";
import { computeCorridorMetrics } from "@/lib/spatial";
import { metroStations, presetCorridors } from "@/data/network";
import type {
  CorridorMetrics,
  LngLat,
  MetroStation,
  PresetCorridor,
} from "@/types/contracts";

export default function WarRoom() {
  const [origin, setOrigin] = useState<MetroStation | null>(null);
  const [terminus, setTerminus] = useState<LngLat | null>(null);
  const [terminusName, setTerminusName] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);

  const { buffer, metrics } = useMemo<{
    buffer: Feature<Polygon> | null;
    metrics: CorridorMetrics | null;
  }>(() => {
    if (!origin || !terminus) return { buffer: null, metrics: null };
    const result = computeCorridorMetrics(origin.coordinates, terminus);
    return { buffer: result.buffer, metrics: result.metrics };
  }, [origin, terminus]);

  const handleStationClick = useCallback(
    (station: MetroStation) => {
      setOrigin(station);
      // Selecting a new origin restarts the corridor definition.
      setTerminus(null);
      setTerminusName(null);
    },
    [],
  );

  const handleMapClick = useCallback(
    (coords: LngLat) => {
      if (!origin) return; // Need an origin first.
      setTerminus(coords);
      setTerminusName(
        `${coords[1].toFixed(3)}, ${coords[0].toFixed(3)}`,
      );
    },
    [origin],
  );

  const handleSelectPreset = useCallback((preset: PresetCorridor) => {
    const station = metroStations.find(
      (s) => s.id === preset.originStationId,
    );
    if (!station) return;
    setOrigin(station);
    setTerminus(preset.terminusCoordinates);
    setTerminusName(preset.terminusName);
  }, []);

  const handleReset = useCallback(() => {
    setOrigin(null);
    setTerminus(null);
    setTerminusName(null);
  }, []);

  const handleFlyTo = useCallback(
    (target: {
      coordinates: LngLat;
      zoom: number;
      pitch: number;
      bearing?: number;
    }) => {
      setFlyTarget({ ...target, nonce: Date.now() });
    },
    [],
  );

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-canvas-base">
      <TelemetryTicker />
      <div className="relative flex-1">
        <MapCanvas
          origin={origin}
          terminus={terminus}
          buffer={buffer}
          flyTarget={flyTarget}
          onStationClick={handleStationClick}
          onMapClick={handleMapClick}
        />

        {/* Status pill (bottom-left) */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-20">
          <div className="dyad-glass flex items-center gap-3 rounded-full px-4 py-2">
            <span
              className={`h-2 w-2 rounded-full ${
                origin
                  ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                  : "bg-slate-500"
              }`}
            />
            <span className="text-[11px] text-slate-300">
              {!origin
                ? "Select an origin station"
                : !terminus
                  ? `Origin: ${origin.name} — now drop a terminus`
                  : `Corridor: ${origin.name} → ${terminusName}`}
            </span>
          </div>
        </div>

        <AuthorityDossier
          metrics={metrics}
          originName={origin?.name ?? null}
          terminusName={terminusName}
          presets={presetCorridors}
          onSelectPreset={handleSelectPreset}
          onReset={handleReset}
          onFlyTo={handleFlyTo}
        />
      </div>
    </main>
  );
}
