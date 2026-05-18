import { haversineKm, normalizeLocation } from "./mapUtils.js";

export const OSRM_PUBLIC_DEMO_URL = "https://router.project-osrm.org/route/v1/driving";
// TODO production routing: replace the public OSRM demo with a stable paid/free provider or self-hosted OSRM/GraphHopper.

function roundDistance(value) {
  const distance = Number(value);
  if (!Number.isFinite(distance)) return null;
  return Math.max(0.1, Math.round(distance * 10) / 10);
}

function normalizeRoutePoint(point) {
  return normalizeLocation(point, null);
}

function osrmCoordinate(point) {
  return `${point.lng},${point.lat}`;
}

export function fallbackToHaversine(pickup, destination, error = "") {
  const from = normalizeRoutePoint(pickup);
  const to = normalizeRoutePoint(destination);
  const routeDistanceKm = roundDistance(haversineKm(from, to) || 0);
  const durationMinutes = Math.max(3, Math.round((routeDistanceKm || 1) * 2.4 + 4));

  return {
    routeDistanceKm,
    durationMinutes,
    routeCoordinates: from && to ? [from, to] : [],
    routeSource: "haversine",
    source: "fallback",
    isFallback: true,
    error
  };
}

export function normalizeRouteResponse(payload, pickup, destination) {
  const route = payload?.routes?.[0];
  const geometry = route?.geometry?.coordinates;
  if (!route || !Array.isArray(geometry) || geometry.length < 2) {
    return fallbackToHaversine(pickup, destination, "missing_route_geometry");
  }
  if (!Number.isFinite(Number(route.distance)) || !Number.isFinite(Number(route.duration))) {
    return fallbackToHaversine(pickup, destination, "invalid_route_metrics");
  }

  const routeCoordinates = geometry
    .map(([lng, lat]) => normalizeRoutePoint({ lat, lng }))
    .filter(Boolean);

  if (routeCoordinates.length < 2) {
    return fallbackToHaversine(pickup, destination, "invalid_route_geometry");
  }

  return {
    routeDistanceKm: roundDistance(route.distance / 1000),
    durationMinutes: Math.max(1, Math.round(route.duration / 60)),
    routeCoordinates,
    routeSource: "osrm",
    source: "road",
    isFallback: false,
    error: ""
  };
}

export async function fetchRoute(pickup, destination, options = {}) {
  const from = normalizeRoutePoint(pickup);
  const to = normalizeRoutePoint(destination);
  if (!from || !to) return fallbackToHaversine(pickup, destination, "missing_route_points");

  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") return fallbackToHaversine(from, to, "fetch_unavailable");

  const timeoutMs = options.timeoutMs ?? 8000;
  const localController = options.signal ? null : new AbortController();
  const signal = options.signal || localController.signal;
  const timer = localController ? globalThis.setTimeout(() => localController.abort(), timeoutMs) : null;
  const url = `${OSRM_PUBLIC_DEMO_URL}/${osrmCoordinate(from)};${osrmCoordinate(to)}?overview=full&geometries=geojson&steps=false`;

  try {
    const response = await fetchImpl(url, { signal });
    if (!response.ok) {
      return fallbackToHaversine(from, to, `osrm_http_${response.status}`);
    }
    const payload = await response.json();
    return normalizeRouteResponse(payload, from, to);
  } catch (error) {
    return fallbackToHaversine(from, to, error?.name || "osrm_unavailable");
  } finally {
    if (timer) globalThis.clearTimeout(timer);
  }
}
