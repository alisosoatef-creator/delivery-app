import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Navigation } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, gradients, mapStyle, radii, shadows, spacing } from "@/design/tokens";
import { customerHomeMock } from "@/mock/customer-home";

const roads = [
  { top: "16%", left: "-10%", width: "72%", rotate: "-22deg", opacity: 0.42 },
  { top: "28%", left: "22%", width: "84%", rotate: "18deg", opacity: 0.36 },
  { top: "46%", left: "-18%", width: "88%", rotate: "10deg", opacity: 0.28 },
  { top: "62%", left: "14%", width: "78%", rotate: "-15deg", opacity: 0.34 },
  { top: "78%", left: "-6%", width: "96%", rotate: "7deg", opacity: 0.25 },
  { top: "8%", left: "42%", width: "80%", rotate: "75deg", opacity: 0.24 },
  { top: "36%", left: "6%", width: "86%", rotate: "69deg", opacity: 0.2 }
] as const;

export function MockRouteMap() {
  return (
    <View testID="mock-route-map" style={styles.mapShell}>
      <LinearGradient colors={mapStyle.background} style={StyleSheet.absoluteFill} />
      <View style={styles.gridLayer}>
        {roads.map((road, index) => (
          <View
            key={`${road.top}-${index}`}
            style={[
              styles.road,
              {
                top: road.top,
                left: road.left,
                width: road.width,
                opacity: road.opacity,
                transform: [{ rotate: road.rotate }]
              }
            ]}
          />
        ))}
      </View>

      <View style={[styles.routeSegment, styles.routeSegmentOne]} />
      <View style={[styles.routeSegment, styles.routeSegmentTwo]} />
      <View style={[styles.routeSegment, styles.routeSegmentThree]} />

      <View style={[styles.marker, styles.originMarker]}>
        <Navigation color={colors.text} size={18} fill={colors.blue} />
      </View>
      <View style={[styles.marker, styles.destinationMarker]}>
        <MapPin color={colors.text} size={18} fill={colors.violet} />
      </View>

      <View style={styles.driverPulse}>
        <View style={styles.driverDot} />
      </View>

      <View style={styles.mapBadge}>
        <Text selectable style={styles.badgeValue}>
          {customerHomeMock.eta}
        </Text>
        <Text selectable style={styles.badgeLabel}>
          أقرب وصول
        </Text>
      </View>

      <LinearGradient colors={gradients.cyanGlow} style={styles.bottomGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  mapShell: {
    height: 300,
    overflow: "hidden",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.graphite,
    boxShadow: shadows.floating
  },
  gridLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  road: {
    position: "absolute",
    height: 2,
    borderRadius: radii.pill,
    backgroundColor: mapStyle.road
  },
  routeSegment: {
    position: "absolute",
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: mapStyle.route,
    boxShadow: shadows.glowCyan
  },
  routeSegmentOne: {
    top: 154,
    left: 82,
    width: 78,
    transform: [{ rotate: "-34deg" }]
  },
  routeSegmentTwo: {
    top: 118,
    left: 144,
    width: 74,
    transform: [{ rotate: "42deg" }]
  },
  routeSegmentThree: {
    top: 93,
    left: 204,
    width: 54,
    transform: [{ rotate: "-45deg" }]
  },
  marker: {
    position: "absolute",
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.36)",
    borderRadius: radii.pill,
    backgroundColor: mapStyle.markerSurface
  },
  originMarker: {
    top: 158,
    left: 70
  },
  destinationMarker: {
    top: 62,
    left: 238
  },
  driverPulse: {
    position: "absolute",
    top: 126,
    left: 164,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.34)",
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  driverDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan
  },
  mapBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    alignItems: "flex-end",
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(7, 11, 20, 0.68)"
  },
  badgeValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    textAlign: "right",
    writingDirection: "rtl"
  },
  badgeLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
    writingDirection: "rtl"
  },
  bottomGlow: {
    position: "absolute",
    right: -20,
    bottom: -46,
    width: 220,
    height: 130,
    transform: [{ rotate: "-8deg" }]
  }
});
