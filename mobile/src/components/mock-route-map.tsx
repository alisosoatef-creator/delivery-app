import { LinearGradient } from "expo-linear-gradient";
import { Car, MapPin, Navigation } from "lucide-react-native";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  colors,
  controlSurfaces,
  glass,
  gradients,
  mapStyle,
  radii,
  shadows,
  spacing
} from "@/design/tokens";
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

export type MockRouteMapPhase =
  | "idle"
  | "searching"
  | "pickup"
  | "arrived"
  | "driving"
  | "completed";

type MockRouteMapProps = {
  destinationArea?: string | null;
  destinationDetail?: string | null;
  phase?: MockRouteMapPhase;
  pickupLabel?: string;
};

const captainPositions: Record<MockRouteMapPhase, { left: number; top: number }> = {
  idle: { top: 126, left: 164 },
  searching: { top: 126, left: 164 },
  pickup: { top: 126, left: 164 },
  arrived: { top: 150, left: 92 },
  driving: { top: 92, left: 206 },
  completed: { top: 62, left: 238 }
};

const phaseLabels: Record<MockRouteMapPhase, string> = {
  idle: "مسار تجريبي جاهز",
  searching: "نبحث عن أقرب كابتن",
  pickup: "الكابتن يتحرك الآن",
  arrived: "الكابتن عند نقطة الانطلاق",
  driving: "الرحلة بدأت",
  completed: "تم الوصول"
};

function getCaptainTracking(
  phase: MockRouteMapPhase,
  pickupLabel: string,
  destinationLabel: string,
  detailLabel?: string
) {
  if (phase === "pickup") {
    return {
      coordinates: "32.2257, 35.2396",
      distance: "1.2 كم",
      location: customerHomeMock.captain.locationLabel,
      reached: `في الطريق إلى ${pickupLabel}`
    };
  }

  if (phase === "arrived") {
    return {
      coordinates: "32.2220, 35.2442",
      distance: "0.0 كم",
      location: `عند ${pickupLabel}`,
      reached: "نقطة الانطلاق"
    };
  }

  if (phase === "driving") {
    return {
      coordinates: "32.2214, 35.2479",
      distance: "2.1 كم",
      location: `على مسار ${destinationLabel}`,
      reached: "باتجاه الوجهة"
    };
  }

  if (phase === "completed") {
    return {
      coordinates: "32.2199, 35.2513",
      distance: "0.0 كم",
      location: detailLabel ?? destinationLabel,
      reached: "الوجهة"
    };
  }

  return null;
}

function MockRouteMapComponent({
  destinationArea,
  destinationDetail,
  phase = "idle",
  pickupLabel = customerHomeMock.pickup
}: MockRouteMapProps) {
  const destinationLabel = destinationArea ?? "اختر وجهتك";
  const detailLabel = destinationDetail?.trim();
  const captainTracking = getCaptainTracking(phase, pickupLabel, destinationLabel, detailLabel);

  return (
    <View
      accessibilityLabel={`خريطة الرحلة: من ${pickupLabel} إلى ${destinationLabel}. ${phaseLabels[phase]}`}
      accessibilityRole="image"
      accessible
      testID="mock-route-map"
      style={styles.mapShell}
    >
      <LinearGradient colors={mapStyle.background} style={StyleSheet.absoluteFill} />
      <View style={styles.gridLayer}>
        {roads.map((road, index) => (
          <View
            key={`${road.top}-${index}`}
            testID={
              index === 0
                ? "mock-map-primary-road"
                : index === roads.length - 1
                  ? "mock-map-secondary-road"
                  : undefined
            }
            style={[
              styles.road,
              index < 4 ? styles.roadPrimary : styles.roadSecondary,
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

      <View testID="mock-map-active-route" style={[styles.routeSegment, styles.routeSegmentOne]} />
      <View style={[styles.routeSegment, styles.routeSegmentTwo]} />
      <View style={[styles.routeSegment, styles.routeSegmentThree]} />

      <View testID="mock-map-origin-marker" style={[styles.marker, styles.originMarker]}>
        <Navigation color={colors.text} size={18} fill={colors.blue} />
      </View>
      <View style={[styles.marker, styles.destinationMarker]}>
        <MapPin color={colors.text} size={18} fill={colors.violet} />
      </View>

      <View testID="mock-map-captain-marker" style={[styles.driverPulse, captainPositions[phase]]}>
        <View style={styles.driverDot} />
      </View>

      <View style={styles.mapBadge}>
        <Text selectable style={styles.badgeValue}>
          {customerHomeMock.eta}
        </Text>
        <Text selectable style={styles.badgeLabel}>
          {phaseLabels[phase]}
        </Text>
      </View>

      <View testID="mock-map-route-panel" style={styles.routePanel}>
        <Text selectable style={styles.routePanelTitle}>
          الخريطة الحية
        </Text>
        <Text selectable style={styles.routePanelText}>
          {`انطلاق: ${pickupLabel}`}
        </Text>
        <Text selectable style={styles.routePanelText}>
          {`وجهة: ${destinationLabel}`}
        </Text>
        {detailLabel ? (
          <Text selectable style={styles.routePanelDetail}>
            {`تفصيل: ${detailLabel}`}
          </Text>
        ) : null}
        {captainTracking ? (
          <View style={styles.trackingPanel}>
            <View style={styles.trackingHeader}>
              <View style={styles.trackingIcon}>
                <Car color={colors.text} size={14} />
              </View>
              <Text selectable style={styles.trackingTitle}>
                تتبع الكابتن
              </Text>
            </View>
            <Text selectable style={styles.trackingText}>
              {`موقع الكابتن الآن: ${captainTracking.location}`}
            </Text>
            <Text selectable style={styles.trackingMeta}>
              {`إحداثيات الكابتن: ${captainTracking.coordinates}`}
            </Text>
            <View style={styles.trackingMetrics}>
              <View style={styles.trackingMetric}>
                <Text selectable style={styles.trackingMetricText}>
                  {`المسافة بينكم: ${captainTracking.distance}`}
                </Text>
              </View>
              <View style={styles.trackingMetric}>
                <Text selectable style={styles.trackingMetricText}>
                  {`وصل إلى: ${captainTracking.reached}`}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      <LinearGradient colors={gradients.cyanGlow} style={styles.bottomGlow} />
    </View>
  );
}

export function areMockRouteMapPropsEqual(
  previous: Readonly<MockRouteMapProps>,
  next: Readonly<MockRouteMapProps>
) {
  return (
    (previous.destinationArea ?? null) === (next.destinationArea ?? null) &&
    normalizeOptionalDetail(previous.destinationDetail) ===
      normalizeOptionalDetail(next.destinationDetail) &&
    (previous.phase ?? "idle") === (next.phase ?? "idle") &&
    (previous.pickupLabel ?? customerHomeMock.pickup) ===
      (next.pickupLabel ?? customerHomeMock.pickup)
  );
}

function normalizeOptionalDetail(value?: string | null) {
  return value?.trim() || null;
}

export const MockRouteMap = memo(MockRouteMapComponent, areMockRouteMapPropsEqual);
MockRouteMap.displayName = "MockRouteMap";

const styles = StyleSheet.create({
  mapShell: {
    height: 390,
    overflow: "hidden",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: glass.floating.borderColor,
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
    borderRadius: radii.pill,
    backgroundColor: mapStyle.road
  },
  roadPrimary: {
    height: 3
  },
  roadSecondary: {
    height: 1
  },
  routeSegment: {
    position: "absolute",
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: mapStyle.route,
    boxShadow: `0 0 18px ${mapStyle.routeGlow}`
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
    borderColor: glass.floating.borderColor,
    borderRadius: radii.pill,
    backgroundColor: mapStyle.markerSurface,
    boxShadow: shadows.cardSubtle
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
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.34)",
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.08)",
    boxShadow: `0 0 18px ${mapStyle.routeGlow}`
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
    borderColor: glass.floating.borderColor,
    backgroundColor: glass.floating.backgroundColor,
    boxShadow: shadows.cardSubtle
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
  routePanel: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    left: spacing.md,
    alignItems: "flex-end",
    gap: 3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: glass.floating.borderColor,
    backgroundColor: glass.floating.backgroundColor,
    boxShadow: shadows.card
  },
  routePanelTitle: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl"
  },
  routePanelText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
    writingDirection: "rtl"
  },
  routePanelDetail: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
    writingDirection: "rtl"
  },
  trackingPanel: {
    alignSelf: "stretch",
    gap: spacing.xs,
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor
  },
  trackingHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs
  },
  trackingIcon: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.16)"
  },
  trackingTitle: {
    flex: 1,
    color: colors.cyan,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl"
  },
  trackingText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl"
  },
  trackingMeta: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "right",
    writingDirection: "rtl"
  },
  trackingMetrics: {
    flexDirection: "row-reverse",
    gap: spacing.xs
  },
  trackingMetric: {
    flex: 1,
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    borderRadius: radii.xs,
    backgroundColor: controlSurfaces.secondary.backgroundColor
  },
  trackingMetricText: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: "900",
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
