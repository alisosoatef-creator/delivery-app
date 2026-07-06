import { captainHomeMock, type CaptainAvailableRequest } from "@/mock/captain-home";
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

export type RouteMapCoordinate = {
  latitude: number;
  longitude: number;
};

export type RouteMapMarker = {
  coordinate: null;
  id: string;
  label: string;
  role: RouteMapMarkerRole;
};

export type RouteMapLocationRole = "customer" | "captain" | "destination";

export type RouteMapLocation = {
  coordinate: RouteMapCoordinate;
  detail: string | null;
  id: string;
  label: string;
  role: RouteMapLocationRole;
};

export type RouteMapLegId = "captain-to-customer" | "customer-to-destination";

export type RouteMapLegStatus = "pending" | "active" | "complete";

export type RouteMapLeg = {
  distance: string;
  eta: string;
  from: RouteMapLocationRole;
  id: RouteMapLegId;
  status: RouteMapLegStatus;
  to: RouteMapLocationRole;
};

export type RouteMapProviderReadiness = {
  installLater: typeof REAL_MAP_READINESS_PACKAGES;
  kind: "mock";
  locationProvider: "expo-location";
  nativeProvider: "react-native-maps";
  safeForExpoGo: true;
  status: "mock-ready";
};

export type RouteMapReplacementReadiness = {
  coordinateMode: "mock-coordinates";
  locationProvider: "expo-location";
  nativeProvider: "react-native-maps";
  readyForNative: true;
  requiredPackages: typeof REAL_MAP_READINESS_PACKAGES;
};

export type RouteMapContract = {
  captainLocation: RouteMapLocation;
  customerLocation: RouteMapLocation;
  destination: RouteMapLocation;
  eta: {
    captainArrival: string;
    tripEstimate: string;
  };
  phase: RouteMapPhase;
  provider: RouteMapProviderReadiness;
  replacement: RouteMapReplacementReadiness;
  route: {
    activeLegId: RouteMapLegId;
    distance: string;
    legs: RouteMapLeg[];
    polyline: RouteMapCoordinate[];
    statusLabel: string;
  };
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
  routeContract: RouteMapContract;
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
  routeContract: RouteMapContract;
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
  "واجهة الخريطة جاهزة لتتبع المسار واستبدالها لاحقاً بخريطة حقيقية عند تركيب expo-location و react-native-maps.";

const mockRouteCoordinates = {
  captain: { latitude: 32.2257, longitude: 35.2396 },
  customer: { latitude: 32.222, longitude: 35.2442 },
  destination: { latitude: 32.2199, longitude: 35.2513 },
  waypointToCustomer: { latitude: 32.2237, longitude: 35.2421 },
  waypointToDestination: { latitude: 32.2214, longitude: 35.2479 }
} as const satisfies Record<string, RouteMapCoordinate>;

const routeMapReplacementReadiness: RouteMapReplacementReadiness = {
  coordinateMode: "mock-coordinates",
  locationProvider: "expo-location",
  nativeProvider: "react-native-maps",
  readyForNative: true,
  requiredPackages: REAL_MAP_READINESS_PACKAGES
};

export const routeMapPhaseLabels: Record<RouteMapPhase, string> = {
  idle: "مسار الرحلة جاهز",
  searching: "نبحث عن أقرب كابتن",
  pickup: "الكابتن يتحرك الآن",
  arrived: "الكابتن عند نقطة الانطلاق",
  driving: "الرحلة بدأت",
  completed: "تم الوصول"
};

const captainStepConfig: Record<
  CaptainTripStep,
  Omit<
    CaptainRouteMapSnapshot,
    | "accessibilityHint"
    | "accessibilityLabel"
    | "activePoint"
    | "markers"
    | "nextPoint"
    | "provider"
    | "routeContract"
  >
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
    routeContract: createRouteMapContract({
      captainDetail: customerHomeMock.captain.locationLabel,
      captainLabel: customerHomeMock.captain.name,
      customerDetail: "نقطة انطلاق العميل",
      destinationDetail: detailLabel,
      destinationLabel,
      distance: customerHomeMock.tripDistance,
      eta: customerHomeMock.eta,
      phase,
      pickupLabel: resolvedPickupLabel,
      statusLabel: phaseLabel
    }),
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
  const phase = captainStepToRoutePhase(step);

  return {
    ...config,
    accessibilityHint: routeMapReadinessHint,
    accessibilityLabel: `خط سير الكابتن: ${config.activeLabel}`,
    activePoint: isDestinationLeg ? request.destinationArea : request.pickup,
    markers: createRouteMapMarkers(request.pickup, captainHomeMock.captainName, request.destinationArea),
    nextPoint: isDestinationLeg ? request.destinationDetail : request.destinationArea,
    provider: routeMapProviderReadiness,
    routeContract: createRouteMapContract({
      captainDetail: captainHomeMock.profile.vehicle,
      captainLabel: captainHomeMock.captainName,
      customerDetail: request.customerName,
      destinationDetail: request.destinationDetail,
      destinationLabel: request.destinationArea,
      distance: request.distance,
      eta: request.etaToPickup,
      phase,
      pickupLabel: request.pickup,
      statusLabel: config.activeLabel
    })
  };
}

function createRouteMapContract({
  captainDetail,
  captainLabel,
  customerDetail,
  destinationDetail,
  destinationLabel,
  distance,
  eta,
  phase,
  pickupLabel,
  statusLabel
}: {
  captainDetail: string | null;
  captainLabel: string;
  customerDetail: string | null;
  destinationDetail: string | null;
  destinationLabel: string;
  distance: string;
  eta: string;
  phase: RouteMapPhase;
  pickupLabel: string;
  statusLabel: string;
}): RouteMapContract {
  const activeLegId = getActiveLegId(phase);

  return {
    captainLocation: createRouteMapLocation({
      coordinate: mockRouteCoordinates.captain,
      detail: captainDetail,
      id: "captain-location",
      label: captainLabel,
      role: "captain"
    }),
    customerLocation: createRouteMapLocation({
      coordinate: mockRouteCoordinates.customer,
      detail: customerDetail,
      id: "customer-location",
      label: pickupLabel,
      role: "customer"
    }),
    destination: createRouteMapLocation({
      coordinate: mockRouteCoordinates.destination,
      detail: destinationDetail,
      id: "destination-location",
      label: destinationLabel,
      role: "destination"
    }),
    eta: {
      captainArrival: eta,
      tripEstimate: eta
    },
    phase,
    provider: routeMapProviderReadiness,
    replacement: routeMapReplacementReadiness,
    route: {
      activeLegId,
      distance,
      legs: createRouteMapLegs(phase, distance, eta),
      polyline: [
        mockRouteCoordinates.captain,
        mockRouteCoordinates.waypointToCustomer,
        mockRouteCoordinates.customer,
        mockRouteCoordinates.waypointToDestination,
        mockRouteCoordinates.destination
      ],
      statusLabel
    }
  };
}

function createRouteMapLocation({
  coordinate,
  detail,
  id,
  label,
  role
}: RouteMapLocation): RouteMapLocation {
  return {
    coordinate,
    detail,
    id,
    label,
    role
  };
}

function createRouteMapLegs(
  phase: RouteMapPhase,
  distance: string,
  eta: string
): RouteMapLeg[] {
  return [
    {
      distance: phase === "driving" || phase === "completed" ? "0.0 كم" : "1.2 كم",
      eta,
      from: "captain",
      id: "captain-to-customer",
      status: getLegStatus(phase, "captain-to-customer"),
      to: "customer"
    },
    {
      distance,
      eta,
      from: "customer",
      id: "customer-to-destination",
      status: getLegStatus(phase, "customer-to-destination"),
      to: "destination"
    }
  ];
}

function getActiveLegId(phase: RouteMapPhase): RouteMapLegId {
  if (phase === "driving" || phase === "completed") {
    return "customer-to-destination";
  }

  return "captain-to-customer";
}

function getLegStatus(phase: RouteMapPhase, legId: RouteMapLegId): RouteMapLegStatus {
  if (phase === "completed") {
    return "complete";
  }

  if (legId === "captain-to-customer") {
    if (phase === "pickup") {
      return "active";
    }

    if (phase === "arrived" || phase === "driving") {
      return "complete";
    }

    return "pending";
  }

  if (phase === "driving") {
    return "active";
  }

  return "pending";
}

function captainStepToRoutePhase(step: CaptainTripStep): RouteMapPhase {
  if (step === "pickup") {
    return "pickup";
  }

  if (step === "arrived") {
    return "arrived";
  }

  if (step === "driving") {
    return "driving";
  }

  return "completed";
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
