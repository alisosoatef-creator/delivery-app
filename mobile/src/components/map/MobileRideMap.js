import { StyleSheet, Text, View } from "react-native";
import { useMobileRideMapLogic } from "../../hooks/useMobileRideMapLogic";
import { v3Alpha, v3Colors, v3Radius, v3Shadows, v3Spacing } from "../../theme/v3";

const v3MapFrame = v3Colors.backgroundDeep;
const v3MapOverlay = "rgba(5, 5, 9, 0.82)";

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#171923" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#d7d0e8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0b10" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2a2c39" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#151722" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#181a25" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#242738" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#11131c" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#30344a" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1b1d29" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#090b12" }] }
];

function markerTitle(type) {
  if (type === "pickup") return "نقطة الانطلاق";
  if (type === "destination") return "الوجهة";
  if (type === "driver") return "موقع الكابتن";
  return "موقعي";
}

function mapPinColor(type) {
  if (type === "driver") return v3Colors.success;
  if (type === "destination") return v3Colors.danger;
  if (type === "user") return v3Colors.electricBlue;
  return v3Colors.purpleLight;
}

function markerSpec(type) {
  if (type === "driver") {
    return { label: "ك", title: "الكابتن", color: v3Colors.success, halo: "rgba(69, 224, 164, 0.2)" };
  }
  if (type === "destination") {
    return { label: "و", title: "الوجهة", color: v3Colors.danger, halo: "rgba(255, 97, 116, 0.2)" };
  }
  if (type === "user") {
    return { label: "م", title: "موقعي", color: v3Colors.electricBlue, halo: "rgba(34, 211, 238, 0.2)" };
  }
  return { label: "ا", title: "الانطلاق", color: v3Colors.purpleLight, halo: "rgba(196, 181, 253, 0.22)" };
}

function CustomMarker({ type }) {
  const spec = markerSpec(type);
  return (
    <View style={[styles.markerHalo, { backgroundColor: spec.halo }]}>
      <View style={[styles.markerBadge, { backgroundColor: spec.color }]}>
        <Text selectable={false} style={styles.markerText}>{spec.label}</Text>
      </View>
    </View>
  );
}

function MapPoint({ type, point, Marker, Callout }) {
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
      <View pointerEvents="none" style={styles.fallbackGrid}>
        <View style={styles.fallbackGridLine} />
        <View style={[styles.fallbackGridLine, styles.fallbackGridLineAlt]} />
        <View style={[styles.fallbackGridLine, styles.fallbackGridLineLow]} />
      </View>
      <View pointerEvents="none" style={styles.routeLine} />
      <View pointerEvents="none" style={styles.pinA} />
      <View pointerEvents="none" style={styles.pinB} />
      {points.driver ? <View pointerEvents="none" style={styles.driverPin} /> : null}
      <View style={styles.fallbackCopy}>
        <Text selectable style={styles.fallbackTitle}>{title}</Text>
        <Text selectable style={styles.fallbackText}>من: {points.pickup?.label || "-"}</Text>
        <Text selectable style={styles.fallbackText}>إلى: {points.destination?.label || "-"}</Text>
        {points.driver ? <Text selectable style={styles.fallbackText}>موقع الكابتن متاح</Text> : null}
      </View>
      {distanceKm ? (
        <Text selectable style={styles.distanceBadge}>
          {distanceLabel}: {distanceKm} كم
        </Text>
      ) : null}
      <View pointerEvents="none" style={styles.mapChrome} />
    </View>
  );
}

export function MobileRideMap({ pickup, destination, driverLocation, userLocation, rideStatus = "searching", height = 300 }) {
  const {
    points,
    driverToPickup,
    waitingForDriverLocation,
    routePoints,
    distanceKm,
    distanceLabel,
    initialRegion,
    hasAnyPoint,
    getNativeMapRuntime
  } = useMobileRideMapLogic({ pickup, destination, driverLocation, userLocation, rideStatus });

  if (!hasAnyPoint) {
    return <FallbackMap points={points} distanceKm={0} distanceLabel={distanceLabel} height={height} title="الخريطة غير جاهزة بعد" />;
  }

  const nativeMap = getNativeMapRuntime();
  if (!nativeMap.available) {
    return <FallbackMap points={points} distanceKm={distanceKm} distanceLabel={distanceLabel} height={height} title="معاينة الخريطة غير متاحة في هذه البيئة" />;
  }
  const { MapView, Marker, Polyline, Callout } = nativeMap;

  return (
    <View style={[styles.wrapper, { height }]}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        region={initialRegion}
        customMapStyle={darkMapStyle}
        toolbarEnabled={false}
        loadingEnabled
        loadingBackgroundColor={v3MapFrame}
        loadingIndicatorColor={v3Colors.purpleLight}
      >
        {routePoints.length === 2 ? (
          <Polyline
            coordinates={routePoints.map((point) => ({ latitude: point.lat, longitude: point.lng }))}
            strokeColor={driverToPickup ? v3Colors.success : v3Colors.purpleLight}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        ) : null}
        <MapPoint type="pickup" point={points.pickup} Marker={Marker} Callout={Callout} />
        <MapPoint type="destination" point={points.destination} Marker={Marker} Callout={Callout} />
        <MapPoint type="driver" point={points.driver} Marker={Marker} Callout={Callout} />
        <MapPoint type="user" point={points.user} Marker={Marker} Callout={Callout} />
      </MapView>
      <View pointerEvents="none" style={styles.mapShade} />
      <View pointerEvents="none" style={styles.legend}>
        {points.pickup ? <Text selectable={false} style={styles.legendText}>الانطلاق</Text> : null}
        {points.destination ? <Text selectable={false} style={styles.legendText}>الوجهة</Text> : null}
        {points.driver ? <Text selectable={false} style={styles.legendText}>الكابتن</Text> : null}
      </View>
      {distanceKm ? (
        <Text selectable style={styles.distanceBadge}>
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
    borderRadius: v3Radius.xl,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3MapFrame,
    boxShadow: v3Shadows.soft
  },
  mapShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 2, 5, 0.34)"
  },
  mapChrome: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: v3Radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.075)"
  },
  distanceBadge: {
    position: "absolute",
    left: v3Spacing.sm,
    bottom: v3Spacing.sm,
    color: v3Colors.white,
    backgroundColor: "rgba(139, 92, 246, 0.82)",
    borderRadius: v3Radius.pill,
    overflow: "hidden",
    paddingHorizontal: v3Spacing.sm,
    paddingVertical: v3Spacing.xs,
    fontWeight: "900",
    fontSize: 12,
    textAlign: "center",
    writingDirection: "rtl"
  },
  legend: {
    position: "absolute",
    right: v3Spacing.sm,
    bottom: v3Spacing.sm,
    flexDirection: "row-reverse",
    gap: v3Spacing.xs,
    maxWidth: "54%",
    flexWrap: "wrap"
  },
  legendText: {
    color: v3Colors.text,
    backgroundColor: v3MapOverlay,
    borderRadius: v3Radius.pill,
    overflow: "hidden",
    paddingHorizontal: v3Spacing.sm,
    paddingVertical: 5,
    fontSize: 9.5,
    fontWeight: "900",
    writingDirection: "rtl"
  },
  markerHalo: {
    width: 40,
    height: 40,
    borderRadius: v3Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.075)"
  },
  markerBadge: {
    width: 27,
    height: 27,
    borderRadius: v3Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: v3Colors.backgroundDeep,
    boxShadow: v3Shadows.none
  },
  markerText: {
    color: v3Colors.black,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center"
  },
  callout: {
    paddingHorizontal: v3Spacing.sm,
    paddingVertical: 6,
    borderRadius: v3Radius.pill,
    backgroundColor: v3MapOverlay,
    borderWidth: 1,
    borderColor: v3Colors.border
  },
  calloutText: {
    color: v3Colors.text,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl"
  },
  locationHint: {
    position: "absolute",
    right: v3Spacing.sm,
    top: v3Spacing.sm,
    maxWidth: "76%",
    color: v3Colors.text,
    backgroundColor: v3MapOverlay,
    borderRadius: v3Radius.pill,
    overflow: "hidden",
    paddingHorizontal: v3Spacing.sm,
    paddingVertical: v3Spacing.xs,
    fontWeight: "900",
    fontSize: 11,
    textAlign: "right",
    writingDirection: "rtl"
  },
  fallback: {
    gap: v3Spacing.sm,
    justifyContent: "flex-end",
    borderRadius: v3Radius.xl,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3MapFrame,
    padding: v3Spacing.md,
    overflow: "hidden",
    boxShadow: v3Shadows.soft
  },
  fallbackGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: v3Alpha.blueWash
  },
  fallbackGridLine: {
    position: "absolute",
    right: "-12%",
    top: "30%",
    width: "124%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    transform: [{ rotate: "-18deg" }]
  },
  fallbackGridLineAlt: {
    top: "50%",
    backgroundColor: "rgba(139, 92, 246, 0.16)"
  },
  fallbackGridLineLow: {
    top: "70%",
    backgroundColor: "rgba(34, 211, 238, 0.11)"
  },
  routeLine: {
    position: "absolute",
    width: "76%",
    height: 5,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.purpleLight,
    top: "44%",
    left: "12%",
    transform: [{ rotate: "-16deg" }]
  },
  pinA: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.purpleLight,
    top: "39%",
    right: "18%",
    borderWidth: 2,
    borderColor: v3Colors.backgroundDeep
  },
  pinB: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.danger,
    top: "49%",
    left: "18%",
    borderWidth: 2,
    borderColor: v3Colors.backgroundDeep
  },
  driverPin: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.success,
    top: "28%",
    right: "42%",
    borderWidth: 2,
    borderColor: v3Colors.backgroundDeep
  },
  fallbackCopy: {
    gap: v3Spacing.xs,
    maxWidth: "78%",
    alignItems: "flex-end"
  },
  fallbackTitle: {
    color: v3Colors.text,
    fontWeight: "900",
    fontSize: 16,
    textAlign: "right",
    writingDirection: "rtl"
  },
  fallbackText: {
    color: v3Colors.textMuted,
    textAlign: "right",
    fontWeight: "800",
    fontSize: 12,
    writingDirection: "rtl"
  }
});
