import { useMemo } from "react";
import { StyleSheet, Text, UIManager, View } from "react-native";
import { normalizeCoordinate, safeDistanceKm } from "../../utils/locationUtils";
import { colors, radii, shadows, spacing } from "../../utils/mobileTheme";
import { devLogStartup } from "../../utils/startupDiagnostics";

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
  return colors.primary;
}

function markerSpec(type) {
  if (type === "driver") return { label: "ك", title: "الكابتن", color: colors.green, halo: "rgba(66, 231, 156, 0.18)" };
  if (type === "destination") return { label: "و", title: "الوجهة", color: colors.red, halo: "rgba(255, 111, 124, 0.18)" };
  if (type === "user") return { label: "م", title: "موقعي", color: colors.blue, halo: "rgba(117, 167, 255, 0.18)" };
  return { label: "ا", title: "الانطلاق", color: colors.primary, halo: "rgba(49, 228, 214, 0.18)" };
}

function CustomMarker({ type }) {
  const spec = markerSpec(type);
  return (
    <View style={[styles.markerHalo, { backgroundColor: spec.halo }]}>
      <View style={[styles.markerPin, { backgroundColor: spec.color }]}>
        <Text selectable={false} style={styles.markerText}>{spec.label}</Text>
      </View>
    </View>
  );
}

function MapPoint({ type, point }) {
  if (!point || !Marker) return null;
  const spec = markerSpec(type);
  const coordinate = { latitude: point.lat, longitude: point.lng };
  return (
    <Marker coordinate={coordinate} title={markerTitle(type)} pinColor={mapPinColor(type)} tracksViewChanges={false}>
      <CustomMarker type={type} />
      {Callout ? (
        <Callout tooltip>
          <View style={styles.callout}>
            <Text selectable={false} style={styles.calloutText}>{spec.title}</Text>
          </View>
        </Callout>
      ) : null}
    </Marker>
  );
}

function FallbackMap({ points, distanceKm, distanceLabel, height, title = "معاينة الخريطة" }) {
  return (
    <View style={[styles.fallback, { minHeight: height }]}>
      <View style={styles.fallbackGrid} />
      <View style={styles.routeLine} />
      <View style={styles.pinA} />
      <View style={styles.pinB} />
      {points.driver ? <View style={styles.driverPin} /> : null}
      <View style={styles.fallbackCopy}>
        <Text selectable style={styles.fallbackTitle}>{title}</Text>
        <Text selectable style={styles.fallbackText}>من: {points.pickup?.label || "-"}</Text>
        <Text selectable style={styles.fallbackText}>إلى: {points.destination?.label || "-"}</Text>
        {points.driver ? <Text selectable style={styles.fallbackText}>موقع الكابتن متاح</Text> : null}
      </View>
      {distanceKm ? (
        <Text selectable style={styles.badge}>
          {distanceLabel}: {distanceKm} كم
        </Text>
      ) : null}
    </View>
  );
}

export function MobileRideMap({ pickup, destination, driverLocation, userLocation, rideStatus = "searching", height = 300 }) {
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

  if (!points.pickup && !points.destination && !points.driver && !points.user) {
    return <FallbackMap points={points} distanceKm={0} distanceLabel={distanceLabel} height={height} title="الخريطة غير جاهزة بعد" />;
  }

  if (!loadNativeMap()) {
    return <FallbackMap points={points} distanceKm={distanceKm} distanceLabel={distanceLabel} height={height} title="معاينة الخريطة غير متاحة في هذه البيئة" />;
  }

  return (
    <View style={[styles.wrapper, { height }]}>
      <View pointerEvents="none" style={styles.mapShade} />
      <MapView style={StyleSheet.absoluteFillObject} initialRegion={initialRegion} region={initialRegion}>
        {routePoints.length === 2 ? (
          <Polyline
            coordinates={routePoints.map((point) => ({ latitude: point.lat, longitude: point.lng }))}
            strokeColor={driverToPickup ? colors.green : colors.primary}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        ) : null}
        <MapPoint type="pickup" point={points.pickup} />
        <MapPoint type="destination" point={points.destination} />
        <MapPoint type="driver" point={points.driver} />
        <MapPoint type="user" point={points.user} />
      </MapView>
      <View pointerEvents="none" style={styles.legend}>
        {points.pickup ? <Text selectable={false} style={styles.legendText}>الانطلاق</Text> : null}
        {points.destination ? <Text selectable={false} style={styles.legendText}>الوجهة</Text> : null}
        {points.driver ? <Text selectable={false} style={styles.legendText}>الكابتن</Text> : null}
      </View>
      {distanceKm ? (
        <Text selectable style={styles.badge}>
          {distanceLabel}: {distanceKm} كم
        </Text>
      ) : null}
      {waitingForDriverLocation ? <Text selectable style={styles.locationHint}>بانتظار تفعيل موقع الكابتن المباشر.</Text> : null}
      <View pointerEvents="none" style={styles.mapChrome} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(41, 213, 201, 0.22)",
    backgroundColor: colors.surfaceStrong,
    boxShadow: shadows.lift
  },
  mapShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 9, 12, 0.04)",
    zIndex: 1
  },
  mapChrome: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)"
  },
  badge: {
    position: "absolute",
    left: spacing.sm,
    bottom: spacing.sm,
    color: colors.black,
    backgroundColor: "rgba(41, 213, 201, 0.94)",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontWeight: "900",
    fontSize: 12
  },
  legend: {
    position: "absolute",
    right: spacing.sm,
    bottom: spacing.sm,
    flexDirection: "row-reverse",
    gap: spacing.xs,
    maxWidth: "54%",
    flexWrap: "wrap"
  },
  legendText: {
    color: colors.text,
    backgroundColor: "rgba(7, 12, 16, 0.72)",
    borderRadius: radii.pill,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    fontSize: 9.5,
    fontWeight: "800"
  },
  markerHalo: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  markerPin: {
    width: 25,
    height: 25,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(7, 10, 13, 0.9)"
  },
  markerText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: "900"
  },
  callout: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  calloutText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800"
  },
  locationHint: {
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
    maxWidth: "76%",
    color: colors.text,
    backgroundColor: "rgba(7, 12, 16, 0.76)",
    borderRadius: radii.pill,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontWeight: "800",
    fontSize: 11,
    textAlign: "right"
  },
  fallback: {
    gap: spacing.sm,
    justifyContent: "flex-end",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(41, 213, 201, 0.22)",
    backgroundColor: colors.surfaceStrong,
    padding: spacing.md,
    overflow: "hidden",
    boxShadow: shadows.soft
  },
  fallbackGrid: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "rgba(41, 213, 201, 0.045)"
  },
  routeLine: {
    position: "absolute",
    width: "76%",
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.primary,
    top: "44%",
    left: "12%",
    transform: [{ rotate: "-16deg" }]
  },
  pinA: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: colors.primary,
    top: "39%",
    right: "18%"
  },
  pinB: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: colors.red,
    top: "49%",
    left: "18%"
  },
  driverPin: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: colors.green,
    top: "28%",
    right: "42%"
  },
  fallbackCopy: {
    gap: spacing.xs,
    maxWidth: "78%"
  },
  fallbackTitle: { color: colors.text, fontWeight: "900", fontSize: 16, textAlign: "right" },
  fallbackText: { color: colors.muted, textAlign: "right", fontWeight: "700", fontSize: 12 }
});
