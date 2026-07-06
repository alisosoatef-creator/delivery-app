import { describe, expect, it } from "@jest/globals";

import {
  createCaptainRouteMapSnapshot,
  createCustomerRouteMapSnapshot
} from "@/maps/route-map-readiness";
import type { CaptainAvailableRequest } from "@/mock/captain-home";
import { customerHomeMock } from "@/mock/customer-home";

const request: CaptainAvailableRequest = {
  id: "request-map-readiness",
  customerName: "علي محمد",
  customerPhone: "+970 59 111 2222",
  destinationArea: "نابلس - رفيديا",
  destinationDetail: "مطعم شورما عكيفك",
  distance: "2.4 كم",
  etaToPickup: "3 د",
  paymentMethod: "كاش عند الاستلام",
  pickup: "زواتا",
  price: "25 شيكل",
  serviceLabel: "رحلة داخل المدينة"
};

describe("route map readiness contract", () => {
  it("normalizes the customer mock map into replaceable native map props", () => {
    const snapshot = createCustomerRouteMapSnapshot({
      destinationArea: request.destinationArea,
      destinationDetail: request.destinationDetail,
      phase: "pickup",
      pickupLabel: request.pickup
    });

    expect(snapshot.routeContract).toMatchObject({
      phase: "pickup",
      provider: snapshot.provider,
      customerLocation: {
        detail: "نقطة انطلاق العميل",
        label: request.pickup,
        role: "customer"
      },
      captainLocation: {
        label: customerHomeMock.captain.name,
        role: "captain"
      },
      destination: {
        detail: request.destinationDetail,
        label: request.destinationArea,
        role: "destination"
      },
      eta: {
        captainArrival: customerHomeMock.eta,
        tripEstimate: customerHomeMock.eta
      },
      replacement: {
        coordinateMode: "mock-coordinates",
        readyForNative: true,
        requiredPackages: ["expo-location", "react-native-maps"]
      },
      route: {
        activeLegId: "captain-to-customer",
        distance: customerHomeMock.tripDistance,
        statusLabel: "الكابتن يتحرك الآن"
      }
    });
    expect(snapshot.routeContract.route.legs.map((leg) => leg.id)).toEqual([
      "captain-to-customer",
      "customer-to-destination"
    ]);
    expect(snapshot.routeContract.route.polyline.length).toBeGreaterThanOrEqual(3);
  });

  it("normalizes the captain mock map with the same route contract shape", () => {
    const snapshot = createCaptainRouteMapSnapshot({ request, step: "driving" });

    expect(snapshot.routeContract).toMatchObject({
      phase: "driving",
      provider: snapshot.provider,
      customerLocation: {
        detail: request.customerName,
        label: request.pickup,
        role: "customer"
      },
      captainLocation: {
        label: "أحمد",
        role: "captain"
      },
      destination: {
        detail: request.destinationDetail,
        label: request.destinationArea,
        role: "destination"
      },
      eta: {
        captainArrival: request.etaToPickup,
        tripEstimate: request.etaToPickup
      },
      route: {
        activeLegId: "customer-to-destination",
        distance: request.distance,
        statusLabel: "من العميل إلى الوجهة"
      }
    });
    expect(snapshot.routeContract.route.legs.map((leg) => leg.status)).toEqual([
      "complete",
      "active"
    ]);
    expect(snapshot.routeContract.replacement.nativeProvider).toBe("react-native-maps");
  });
});
