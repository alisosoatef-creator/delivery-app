import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { haversineKm } from "../../utils/locationUtils";
import { colors, radii, spacing } from "../../utils/mobileTheme";

let MapView = null;
let Marker = null;
let Polyline = null;

try {
  const Maps = require("react-native-maps");
  MapView = Maps.default || Maps;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} catch {
  MapView = null;
}

function cleanPoint(point) {
  if (!point) return null;
  const lat = Number(point.lat ?? point.latitude);
  const lng = Number(point.lng ?? point.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { ...point, lat, lng, latitude: lat, longitude: lng };
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

function markerTitle(type) {
  if (type === "pickup") return "نقطة الانطلاق";
  if (type === "destination") return "الوجهة";
  if (type === "driver") return "موقع الكابتن";
  return "موقعي";
}

function mapPinColor(type) {
  if (type === "driver") return colors.green;
  if (type === "destination") return colors.red;
  if (type === "user") return colors.blue;
  return colors.gold;
}

export function MobileRideMap({ pickup, destination, driverLocation, userLocation, rideStatus = "searching", height = 280 }) {
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
  const routePoints = driverToPickup
    ? [points.driver, points.pickup]
    : points.pickup && points.destination
      ? [points.pickup, points.destination]
      : [];
  const distanceKm = driverToPickup ? haversineKm(points.driver, points.pickup) : haversineKm(points.pickup, points.destination);
  const distanceLabel = driverToPickup ? "المسافة إلى الزبون" : "مسافة الرحلة";
  const initialRegion = regionFor([points.pickup, points.destination, points.driver, points.user]);

  if (!MapView || !Marker || !Polyline) {
    return (
      <View style={[styles.fallback, { minHeight: height }]}>
        <Text selectable style={styles.fallbackTitle}>معاينة الخريطة غير متاحة في هذه البيئة</Text>
        <Text selectable style={styles.fallbackText}>نقطة الانطلاق: {points.pickup?.label || "-"}</Text>
        <Text selectable style={styles.fallbackText}>الوجهة: {points.destination?.label || "-"}</Text>
        {points.driver ? <Text selectable style={styles.fallbackText}>موقع الكابتن متاح</Text> : null}
        {distanceKm ? <Text selectable style={styles.fallbackBadge}>{distanceLabel}: {distanceKm} كم</Text> : null}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { height }]}>
      <MapView style={StyleSheet.absoluteFillObject} initialRegion={initialRegion} region={initialRegion}>
        {routePoints.length === 2 ? (
          <Polyline
            coordinates={routePoints.map((point) => ({ latitude: point.lat, longitude: point.lng }))}
            strokeColor={driverToPickup ? colors.green : colors.gold}
            strokeWidth={4}
          />
        ) : null}
        {points.pickup ? <Marker coordinate={{ latitude: points.pickup.lat, longitude: points.pickup.lng }} title={markerTitle("pickup")} pinColor={mapPinColor("pickup")} /> : null}
        {points.destination ? <Marker coordinate={{ latitude: points.destination.lat, longitude: points.destination.lng }} title={markerTitle("destination")} pinColor={mapPinColor("destination")} /> : null}
        {points.driver ? <Marker coordinate={{ latitude: points.driver.lat, longitude: points.driver.lng }} title={markerTitle("driver")} pinColor={mapPinColor("driver")} /> : null}
        {points.user ? <Marker coordinate={{ latitude: points.user.lat, longitude: points.user.lng }} title={markerTitle("user")} pinColor={mapPinColor("user")} /> : null}
      </MapView>
      {distanceKm ? <Text selectable style={styles.badge}>{distanceLabel}: {distanceKm} كم</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft
  },
  badge: {
    position: "absolute",
    left: spacing.sm,
    bottom: spacing.sm,
    color: "#14100a",
    backgroundColor: colors.gold,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontWeight: "900"
  },
  fallbackBadge: {
    alignSelf: "flex-start",
    color: "#14100a",
    backgroundColor: colors.gold,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontWeight: "900"
  },
  fallback: {
    gap: spacing.sm,
    justifyContent: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md
  },
  fallbackTitle: { color: colors.text, fontWeight: "900", fontSize: 16 },
  fallbackText: { color: colors.muted }
});
