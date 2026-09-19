import { Map, LngLatBounds } from 'maplibre-gl';

export function zoomToCorridor(
  map: Map,
  origin: [number, number],
  terminus: [number, number]
) {
  const bounds = new LngLatBounds();
  bounds.extend(origin);
  bounds.extend(terminus);

  map.fitBounds(bounds, {
    padding: { top: 120, bottom: 120, left: 100, right: 460 },
    pitch: 48,
    bearing: -14,
    duration: 2200,
    maxZoom: 14.5,
    essential: true
  });
}

export function flyToFocus(
  map: Map,
  lng: number,
  lat: number,
  zoom: number = 15.0
) {
  map.flyTo({
    center: [lng, lat],
    zoom: zoom,
    pitch: 52,
    bearing: 20,
    speed: 1.2,
    curve: 1.4,
    essential: true
  });
}
