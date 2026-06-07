import { useMemo } from "react";
import { UIManager } from "react-native";
import { normalizeCoordinate, safeDistanceKm } from "../utils/locationUtils";
import { devLogStartup } from "../utils/startupDiagnostics";

let MapView = null;
let Marker = null;
let Polyline = null;
let Callout = null;
let mapLoadAttempted = false;

function loadNativeMap() {
  if (mapLoadAttempted) return Boolean(MapView && Marker && Polyline);
  mapLoadAttempted = true;
  try {
    const hasNativeMap = Boolean(
      UIManager.getViewManagerConfig?.("AIRMap") ||
        UIManager.getViewManagerConfig?.("AIRGoogleMap")
    );
    if (!hasNativeMap) {
      devLogStartup("map component skipped", { reason: "native-map-view-unavailable" });
      return false;
    }
    const Maps = require("react-native-maps");
    MapView = Maps.default || Maps;
    Marker = Maps.Marker;
    Polyline = Maps.Polyline;
    Callout = Maps.Callout;
    devLogStartup("map component loaded");
  } catch (error) {
    MapView = null;
    Marker = null;
    Polyline = null;
    Callout = null;
    devLogStartup("map component skipped", { reason: error?.message || "react-native-maps unavailable" });
  }
  return Boolean(MapView && Marker && Polyline);
}

function cleanPoint(point) {
  return normalizeCoordinate(point);
}

function regionFor(points) {
  const valid = points.map(cleanPoint).filter(Boolean);
  if (!valid.length) {
    return { latitude: 32.2211, longitude: 35.2544, latitudeDelta: 0.08, longitudeDelta: 0.08 };
  }

  const avgLat = valid.reduce((sum, point) => sum + point.lat, 0) / valid.length;
  const avgLng = valid.reduce((sum, point) => sum + point.lng, 0) / valid.length;
  const maxLatDelta = Math.max(...valid.map((point) => Math.abs(point.lat - avgLat)), 0.02) * 3;
  const maxLngDelta = Math.max(...valid.map((point) => Math.abs(point.lng - avgLng)), 0.02) * 3;

  return {
    latitude: avgLat,
    longitude: avgLng,
    latitudeDelta: Math.max(maxLatDelta, 0.04),
    longitudeDelta: Math.max(maxLngDelta, 0.04)
  };
}

function getNativeMapRuntime() {
  return {
    available: loadNativeMap(),
    MapView,
    Marker,
    Polyline,
    Callout
  };
}

export function useMobileRideMapLogic({ pickup, destination, driverLocation, userLocation, rideStatus = "searching" } = {}) {
  const points = useMemo(
    () => ({
      pickup: cleanPoint(pickup),
      destination: cleanPoint(destination),
      driver: cleanPoint(driverLocation),
      user: cleanPoint(userLocation)
    }),
    [pickup, destination, driverLocation, userLocation]
  );

  const accepted = ["accepted", "driver_arriving", "arrived", "in_progress", "completed"].includes(rideStatus);
  const driverToPickup = accepted && points.driver && points.pickup;
  const waitingForDriverLocation = accepted && points.pickup && !points.driver;
  const routePoints = driverToPickup
    ? [points.driver, points.pickup]
    : points.pickup && points.destination
      ? [points.pickup, points.destination]
      : [];
  const distanceKm = driverToPickup ? safeDistanceKm(points.driver, points.pickup) : safeDistanceKm(points.pickup, points.destination);
  const distanceLabel = driverToPickup ? "المسافة إلى الزبون" : "مسافة الرحلة";
  const initialRegion = regionFor([points.pickup, points.destination, points.driver, points.user]);
  const hasAnyPoint = Boolean(points.pickup || points.destination || points.driver || points.user);

  return {
    points,
    accepted,
    driverToPickup,
    waitingForDriverLocation,
    routePoints,
    distanceKm,
    distanceLabel,
    initialRegion,
    hasAnyPoint,
    getNativeMapRuntime
  };
}
