import { LinearGradient } from "expo-linear-gradient";
import { Car, CheckCircle, MapPin, Navigation, Route } from "lucide-react-native";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, gradients, mapStyle, radii, shadows, spacing, typography } from "@/design/tokens";
import type { CaptainAvailableRequest } from "@/mock/captain-home";
import type { CaptainTripStep } from "@/state/mock-trip-flow";

type CaptainRouteMapProps = {
  request: CaptainAvailableRequest;
  step: CaptainTripStep;
};

type RouteConfig = {
  activeLabel: string;
  activePoint: string;
  completedSegments: number;
  driverPosition: {
    left: number;
    top: number;
  };
  nextPoint: string;
  segment: number;
  statusMeta: string;
};

const roads = [
  { top: "14%", left: "-14%", width: "84%", rotate: "-20deg", opacity: 0.38 },
  { top: "25%", left: "22%", width: "88%", rotate: "18deg", opacity: 0.32 },
  { top: "41%", left: "-22%", width: "102%", rotate: "8deg", opacity: 0.24 },
  { top: "57%", left: "16%", width: "82%", rotate: "-14deg", opacity: 0.3 },
  { top: "74%", left: "-8%", width: "104%", rotate: "7deg", opacity: 0.22 },
  { top: "8%", left: "38%", width: "88%", rotate: "72deg", opacity: 0.22 },
  { top: "33%", left: "2%", width: "92%", rotate: "66deg", opacity: 0.18 }
] as const;

const stepConfig: Record<CaptainTripStep, Omit<RouteConfig, "activePoint" | "nextPoint">> = {
  pickup: {
    activeLabel: "إلى نقطة الانطلاق",
    completedSegments: 0,
    driverPosition: { top: 186, left: 62 },
    segment: 1,
    statusMeta: "GPS نشط"
  },
  arrived: {
    activeLabel: "تم الوصول لنقطة الانطلاق",
    completedSegments: 1,
    driverPosition: { top: 142, left: 122 },
    segment: 2,
    statusMeta: "جاهز لبدء الرحلة"
  },
  driving: {
    activeLabel: "من العميل إلى الوجهة",
    completedSegments: 2,
    driverPosition: { top: 104, left: 206 },
    segment: 3,
    statusMeta: "تتبع مباشر"
  },
  completed: {
    activeLabel: "تم إكمال خط السير",
    completedSegments: 3,
    driverPosition: { top: 62, left: 248 },
    segment: 3,
    statusMeta: "تم الوصول"
  }
};

function CaptainRouteMapComponent({ request, step }: CaptainRouteMapProps) {
  const config = {
    ...stepConfig[step],
    activePoint:
      step === "driving" || step === "completed" ? request.destinationArea : request.pickup,
    nextPoint:
      step === "driving" || step === "completed"
        ? request.destinationDetail
        : request.destinationArea
  };

  return (
    <View
      accessibilityLabel={`خط سير الكابتن: ${config.activeLabel}`}
      accessibilityRole="image"
      accessible
      testID="captain-route-map"
      style={styles.mapShell}
    >
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

      <View style={[styles.routeSegment, styles.routeSegmentOne, segmentTone(config, 1)]} />
      <View style={[styles.routeSegment, styles.routeSegmentTwo, segmentTone(config, 2)]} />
      <View style={[styles.routeSegment, styles.routeSegmentThree, segmentTone(config, 3)]} />

      <View style={[styles.marker, styles.startMarker]}>
        <Navigation color={colors.text} size={18} fill={colors.blue} />
      </View>
      <View style={[styles.marker, styles.pickupMarker]}>
        {step === "arrived" || step === "driving" || step === "completed" ? (
          <CheckCircle color={colors.text} size={18} />
        ) : (
          <MapPin color={colors.text} size={18} fill={colors.success} />
        )}
      </View>
      <View style={[styles.marker, styles.destinationMarker]}>
        <MapPin color={colors.text} size={18} fill={colors.violet} />
      </View>

      <View
        testID="captain-route-driver-marker"
        style={[styles.driverPulse, config.driverPosition]}
      >
        <View style={styles.driverHalo} />
        <Car color={colors.text} size={20} />
      </View>

      <View style={styles.headerBadge}>
        <View style={styles.headerIcon}>
          <Route color={colors.cyan} size={17} />
        </View>
        <View style={styles.headerCopy}>
          <Text selectable style={styles.headerTitle}>
            خط سير الكابتن
          </Text>
          <Text selectable style={styles.headerMeta}>
            {config.statusMeta}
          </Text>
        </View>
      </View>

      <View style={styles.distanceBadge}>
        <Text selectable style={styles.distanceValue}>
          {request.distance}
        </Text>
        <Text selectable style={styles.distanceLabel}>
          المسافة المتبقية
        </Text>
      </View>

      <View style={styles.routePanel}>
        <View style={styles.routePanelTop}>
          <Text selectable style={styles.panelStatus}>
            {config.activeLabel}
          </Text>
          <View style={styles.livePill}>
            <Text selectable style={styles.livePillText}>
              Live GPS
            </Text>
          </View>
        </View>
        <Text selectable style={styles.routePanelText}>
          {`المسار النشط: ${config.activePoint}`}
        </Text>
        <Text selectable style={styles.routePanelText}>
          {`الوجهة التالية: ${config.nextPoint}`}
        </Text>
        <Text selectable style={styles.routePanelDetail}>
          {request.destinationDetail}
        </Text>
        <View style={styles.metricRow}>
          <RouteMetric label="الوصول" value={request.etaToPickup} />
          <RouteMetric label="المسافة" value={request.distance} />
          <RouteMetric label="الأجرة" value={request.price} />
        </View>
      </View>

      <LinearGradient colors={gradients.cyanGlow} pointerEvents="none" style={styles.bottomGlow} />
    </View>
  );
}

export function areCaptainRouteMapPropsEqual(
  previous: Readonly<CaptainRouteMapProps>,
  next: Readonly<CaptainRouteMapProps>
) {
  return (
    previous.step === next.step &&
    previous.request.id === next.request.id &&
    previous.request.pickup === next.request.pickup &&
    previous.request.destinationArea === next.request.destinationArea &&
    previous.request.destinationDetail === next.request.destinationDetail &&
    previous.request.distance === next.request.distance &&
    previous.request.etaToPickup === next.request.etaToPickup &&
    previous.request.price === next.request.price
  );
}

export const CaptainRouteMap = memo(CaptainRouteMapComponent, areCaptainRouteMapPropsEqual);
CaptainRouteMap.displayName = "CaptainRouteMap";

function RouteMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.routeMetric}>
      <Text selectable style={styles.routeMetricValue}>
        {value}
      </Text>
      <Text selectable style={styles.routeMetricLabel}>
        {label}
      </Text>
    </View>
  );
}

function segmentTone(config: RouteConfig, segment: number) {
  if (segment <= config.completedSegments) {
    return styles.routeSegmentDone;
  }

  if (segment === config.segment) {
    return styles.routeSegmentActive;
  }

  return styles.routeSegmentPending;
}

const rtlText = {
  textAlign: "right" as const,
  writingDirection: "rtl" as const
};

const styles = StyleSheet.create({
  mapShell: {
    height: 360,
    overflow: "hidden",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
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
    height: 5,
    borderRadius: radii.pill
  },
  routeSegmentOne: {
    top: 198,
    left: 82,
    width: 74,
    transform: [{ rotate: "-35deg" }]
  },
  routeSegmentTwo: {
    top: 153,
    left: 138,
    width: 96,
    transform: [{ rotate: "38deg" }]
  },
  routeSegmentThree: {
    top: 112,
    left: 216,
    width: 68,
    transform: [{ rotate: "-45deg" }]
  },
  routeSegmentActive: {
    backgroundColor: mapStyle.route,
    boxShadow: shadows.glowCyan
  },
  routeSegmentDone: {
    backgroundColor: colors.violetSoft,
    boxShadow: "0 0 14px rgba(199, 183, 255, 0.58)"
  },
  routeSegmentPending: {
    backgroundColor: "rgba(147, 177, 255, 0.2)"
  },
  marker: {
    position: "absolute",
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.34)",
    backgroundColor: mapStyle.markerSurface
  },
  startMarker: {
    top: 192,
    left: 58
  },
  pickupMarker: {
    top: 132,
    left: 124
  },
  destinationMarker: {
    top: 54,
    left: 250
  },
  driverPulse: {
    position: "absolute",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.42)",
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    boxShadow: shadows.glowCyan
  },
  driverHalo: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.18)",
    backgroundColor: "rgba(0, 229, 255, 0.04)"
  },
  headerBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    left: spacing.md,
    minHeight: 54,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.18)",
    backgroundColor: "rgba(7, 11, 20, 0.68)"
  },
  headerIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  headerCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  headerTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  headerMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  distanceBadge: {
    position: "absolute",
    top: 84,
    right: spacing.md,
    alignItems: "flex-end",
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.2)",
    backgroundColor: "rgba(7, 11, 20, 0.72)"
  },
  distanceValue: {
    ...rtlText,
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  distanceLabel: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  routePanel: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    left: spacing.md,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.18)",
    backgroundColor: "rgba(7, 11, 20, 0.78)"
  },
  routePanelTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  panelStatus: {
    ...rtlText,
    flex: 1,
    color: colors.cyan,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  livePill: {
    minHeight: 26,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.26)",
    backgroundColor: "rgba(51, 231, 168, 0.12)"
  },
  livePillText: {
    color: colors.success,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  routePanelText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  routePanelDetail: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  metricRow: {
    flexDirection: "row-reverse",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  routeMetric: {
    flex: 1,
    minHeight: 52,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  routeMetricValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  routeMetricLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  bottomGlow: {
    position: "absolute",
    right: -26,
    bottom: -48,
    width: 230,
    height: 138,
    transform: [{ rotate: "-8deg" }]
  }
});
