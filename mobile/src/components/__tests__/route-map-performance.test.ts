import { describe, expect, it } from "@jest/globals";

import { areCaptainRouteMapPropsEqual } from "@/components/captain-route-map";
import { areMockRouteMapPropsEqual } from "@/components/mock-route-map";
import type { CaptainAvailableRequest } from "@/mock/captain-home";

const request: CaptainAvailableRequest = {
  id: "request-performance",
  customerName: "عميل تجريبي",
  customerPhone: "0590000000",
  destinationArea: "رفيديا",
  destinationDetail: "قرب المستشفى",
  distance: "2.1 كم",
  etaToPickup: "5 د",
  paymentMethod: "كاش عند الاستلام",
  pickup: "زواتا",
  price: "25 شيكل",
  serviceLabel: "رحلة داخل المدينة"
};

describe("route map render isolation", () => {
  it("keeps the customer map stable until route inputs change", () => {
    const props = {
      destinationArea: "رفيديا",
      destinationDetail: "قرب المستشفى",
      phase: "driving" as const,
      pickupLabel: "زواتا"
    };

    expect(areMockRouteMapPropsEqual(props, { ...props })).toBe(true);
    expect(areMockRouteMapPropsEqual(props, { ...props, phase: "completed" })).toBe(false);
  });

  it("keeps the captain map stable until request or trip inputs change", () => {
    expect(
      areCaptainRouteMapPropsEqual(
        { request, step: "driving" },
        { request: { ...request }, step: "driving" }
      )
    ).toBe(true);
    expect(
      areCaptainRouteMapPropsEqual(
        { request, step: "driving" },
        { request: { ...request, distance: "1.4 كم" }, step: "driving" }
      )
    ).toBe(false);
  });
});
