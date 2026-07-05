import type { CaptainAvailableRequest } from "@/mock/captain-home";
import { customerHomeMock } from "@/mock/customer-home";
import type { CaptainTripStep } from "@/state/mock-trip-flow";

export const REAL_MAP_READINESS_PACKAGES = ["expo-location", "react-native-maps"] as const;

export type RouteMapPhase =
  | "idle"
  | "searching"
  | "pickup"
  | "arrived"
  | "driving"
  | "completed";

export type RouteMapMarkerRole = "pickup" | "captain" | "destination";

export type RouteMapMarker = {
  coordinate: null;
  id: string;
  label: string;
  role: RouteMapMarkerRole;
};

export type RouteMapProviderReadiness = {
  installLater: typeof REAL_MAP_READINESS_PACKAGES;
  kind: "mock";
  locationProvider: "expo-location";
  nativeProvider: "react-native-maps";
  safeForExpoGo: true;
  status: "mock-ready";
};

export type CustomerCaptainTrackingSnapshot = {
  coordinates: string;
  distance: string;
  location: string;
  reached: string;
};

export type CustomerRouteMapSnapshot = {
  accessibilityHint: string;
  accessibilityLabel: string;
  captainTracking: CustomerCaptainTrackingSnapshot | null;
  destinationLabel: string;
  detailLabel: string | null;
  markers: RouteMapMarker[];
  phase: RouteMapPhase;
  phaseLabel: string;
  pickupLabel: string;
  provider: RouteMapProviderReadiness;
  telemetry: {
    distanceLabel: string;
    distanceValue: string;
    etaLabel: string;
    etaValue: string;
  };
};

export type CaptainRouteMapSnapshot = {
  accessibilityHint: string;
  accessibilityLabel: string;
  activeLabel: string;
  activePoint: string;
  completedSegments: number;
  driverPosition: {
    left: number;
    top: number;
  };
  markers: RouteMapMarker[];
  nextPoint: string;
  provider: RouteMapProviderReadiness;
  segment: number;
  statusMeta: string;
};

export const routeMapProviderReadiness: RouteMapProviderReadiness = {
  installLater: REAL_MAP_READINESS_PACKAGES,
  kind: "mock",
  locationProvider: "expo-location",
  nativeProvider: "react-native-maps",
  safeForExpoGo: true,
  status: "mock-ready"
};

const routeMapReadinessHint =
  "خريطة mock آمنة لـ Expo Go وجاهزة للاستبدال لاحقاً بخريطة حقيقية عند تركيب expo-location و react-native-maps.";

export const routeMapPhaseLabels: Record<RouteMapPhase, string> = {
  idle: "مسار تجريبي جاهز",
  searching: "نبحث عن أقرب كابتن",
  pickup: "الكابتن يتحرك الآن",
  arrived: "الكابتن عند نقطة الانطلاق",
  driving: "الرحلة بدأت",
  completed: "تم الوصول"
};

const captainStepConfig: Record<
  CaptainTripStep,
  Omit<CaptainRouteMapSnapshot, "accessibilityHint" | "accessibilityLabel" | "activePoint" | "markers" | "nextPoint" | "provider">
> = {
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

export function createCustomerRouteMapSnapshot({
  destinationArea,
  destinationDetail,
  phase = "idle",
  pickupLabel = customerHomeMock.pickup
}: {
  destinationArea?: string | null;
  destinationDetail?: string | null;
  phase?: RouteMapPhase;
  pickupLabel?: string;
}): CustomerRouteMapSnapshot {
  const resolvedPickupLabel = pickupLabel.trim() || customerHomeMock.pickup;
  const destinationLabel = destinationArea?.trim() || "اختر وجهتك";
  const detailLabel = destinationDetail?.trim() || null;
  const phaseLabel = routeMapPhaseLabels[phase];

  return {
    accessibilityHint: routeMapReadinessHint,
    accessibilityLabel: `خريطة الرحلة: من ${resolvedPickupLabel} إلى ${destinationLabel}. ${phaseLabel}`,
    captainTracking: getCustomerCaptainTracking(
      phase,
      resolvedPickupLabel,
      destinationLabel,
      detailLabel
    ),
    destinationLabel,
    detailLabel,
    markers: createRouteMapMarkers(resolvedPickupLabel, customerHomeMock.captain.name, destinationLabel),
    phase,
    phaseLabel,
    pickupLabel: resolvedPickupLabel,
    provider: routeMapProviderReadiness,
    telemetry: {
      distanceLabel: "مسافة الرحلة",
      distanceValue: customerHomeMock.tripDistance,
      etaLabel: "وصول الكابتن",
      etaValue: customerHomeMock.eta
    }
  };
}

export function createCaptainRouteMapSnapshot({
  request,
  step
}: {
  request: CaptainAvailableRequest;
  step: CaptainTripStep;
}): CaptainRouteMapSnapshot {
  const config = captainStepConfig[step];
  const isDestinationLeg = step === "driving" || step === "completed";

  return {
    ...config,
    accessibilityHint: routeMapReadinessHint,
    accessibilityLabel: `خط سير الكابتن: ${config.activeLabel}`,
    activePoint: isDestinationLeg ? request.destinationArea : request.pickup,
    markers: createRouteMapMarkers(request.pickup, request.customerName, request.destinationArea),
    nextPoint: isDestinationLeg ? request.destinationDetail : request.destinationArea,
    provider: routeMapProviderReadiness
  };
}

function createRouteMapMarkers(
  pickupLabel: string,
  captainLabel: string,
  destinationLabel: string
): RouteMapMarker[] {
  return [
    {
      coordinate: null,
      id: "pickup",
      label: pickupLabel,
      role: "pickup"
    },
    {
      coordinate: null,
      id: "captain",
      label: captainLabel,
      role: "captain"
    },
    {
      coordinate: null,
      id: "destination",
      label: destinationLabel,
      role: "destination"
    }
  ];
}

function getCustomerCaptainTracking(
  phase: RouteMapPhase,
  pickupLabel: string,
  destinationLabel: string,
  detailLabel: string | null
): CustomerCaptainTrackingSnapshot | null {
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
