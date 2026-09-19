import * as turf from "@turf/turf";
import type { Feature, Polygon } from "geojson";
import type { CorridorMetrics, LngLat, POIItem } from "@/types/contracts";
import { pois } from "@/data/network";
import { computeMobility } from "@/lib/mobility";

export const BUFFER_RADIUS_KM = 2.0;

// Sensitive water bodies (NGT 75m buffer norms) as [lng, lat] with a rough radius (km).
const waterBodies: { name: string; center: LngLat; radiusKm: number }[] = [
  { name: "Bellandur Lake", center: [77.6674, 12.9269], radiusKm: 1.6 },
  { name: "Varthur Lake", center: [77.7407, 12.9407], radiusKm: 1.3 },
  { name: "Agara Lake", center: [77.6412, 12.9224], radiusKm: 0.7 },
  { name: "Ulsoor Lake", center: [77.6205, 12.9822], radiusKm: 0.6 },
];

const CATCHMENT_DENSITY_PER_KM2 = 15_000; // approximate BBMP urban density

export function buildCorridorBuffer(
  origin: LngLat,
  terminus: LngLat,
): Feature<Polygon> {
  const line = turf.lineString([origin, terminus]);
  return turf.buffer(line, BUFFER_RADIUS_KM, {
    units: "kilometers",
  }) as Feature<Polygon>;
}

export function computeCorridorMetrics(
  origin: LngLat,
  terminus: LngLat,
): { buffer: Feature<Polygon>; metrics: CorridorMetrics } {
  const buffer = buildCorridorBuffer(origin, terminus);
  const distanceKm = turf.distance(turf.point(origin), turf.point(terminus), {
    units: "kilometers",
  });

  const poisInCatchment: POIItem[] = pois.filter((poi) =>
    turf.booleanPointInPolygon(turf.point(poi.coordinates), buffer),
  );

  const techParksConnected = poisInCatchment.filter(
    (p) => p.category === "corporate",
  ).length;

  const areaKm2 = turf.area(buffer) / 1_000_000;
  const catchmentPopulation = Math.round(areaKm2 * CATCHMENT_DENSITY_PER_KM2);

  const stops = Math.max(2, Math.round(distanceKm / 1.2));
  const mobility = computeMobility(distanceKm, stops);

  const lakeWarnings = waterBodies
    .filter(
      (lake) =>
        turf.distance(turf.point(lake.center), turf.point(origin), {
          units: "kilometers",
        }) < lake.radiusKm + BUFFER_RADIUS_KM ||
        turf.distance(turf.point(lake.center), turf.point(terminus), {
          units: "kilometers",
        }) < lake.radiusKm + BUFFER_RADIUS_KM,
    )
    .map(
      (lake) =>
        `${lake.name}: corridor enters NGT 75m eco-buffer zone — expect elevated/underground alignment review.`,
    );

  const overallScore = scoreCorridor({
    techParksConnected,
    poisCount: poisInCatchment.length,
    timeSavedPct: mobility.timeSavedPct,
    catchmentPopulation,
    lakeWarnings: lakeWarnings.length,
  });

  const feasibilityRating =
    overallScore >= 78
      ? "Highly Recommended"
      : overallScore >= 60
        ? "Recommended with Caveats"
        : "High Friction / Review Needed";

  return {
    buffer,
    metrics: {
      distanceKm,
      catchmentPopulation,
      techParksConnected,
      poisInCatchment,
      peakRoadMins: mobility.peakRoadMins,
      metroMins: mobility.metroMins,
      timeSavedMins: mobility.timeSavedMins,
      timeSavedPct: mobility.timeSavedPct,
      annualHoursSaved: mobility.annualHoursSaved,
      dailyCarTripsEliminated: mobility.dailyCarTripsEliminated,
      annualCo2OffsetTons: mobility.annualCo2OffsetTons,
      lakeWarnings,
      overallScore,
      feasibilityRating,
    },
  };
}

function scoreCorridor(input: {
  techParksConnected: number;
  poisCount: number;
  timeSavedPct: number;
  catchmentPopulation: number;
  lakeWarnings: number;
}): number {
  const economic = Math.min(1, input.techParksConnected / 3) * 30;
  const connectivity = Math.min(1, input.poisCount / 6) * 20;
  const mobility = Math.min(1, input.timeSavedPct / 70) * 30;
  const equity = Math.min(1, input.catchmentPopulation / 350_000) * 20;
  const frictionPenalty = Math.min(input.lakeWarnings * 6, 18);

  return Math.max(
    0,
    Math.min(100, Math.round(economic + connectivity + mobility + equity - frictionPenalty)),
  );
}
