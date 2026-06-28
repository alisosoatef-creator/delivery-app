import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react-native";
import { createElement } from "react";
import { StyleSheet } from "react-native";

import { areCaptainRouteMapPropsEqual, CaptainRouteMap } from "@/components/captain-route-map";
import { areMockRouteMapPropsEqual, MockRouteMap } from "@/components/mock-route-map";
import { colors, glass, mapStyle, shadows } from "@/design/tokens";
import type { CaptainAvailableRequest } from "@/mock/captain-home";
import { customerHomeMock } from "@/mock/customer-home";

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
  it("keeps the customer map on the semantic surface hierarchy", async () => {
    const screen = await render(
      createElement(MockRouteMap, {
        destinationArea: request.destinationArea,
        destinationDetail: request.destinationDetail,
        phase: "driving",
        pickupLabel: request.pickup
      })
    );

    expect(StyleSheet.flatten(screen.getByTestId("mock-route-map").props.style)).toMatchObject({
      backgroundColor: colors.graphite,
      borderColor: glass.floating.borderColor,
      boxShadow: shadows.floating
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("mock-map-primary-road").props.style)
    ).toMatchObject({
      height: 3
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("mock-map-secondary-road").props.style)
    ).toMatchObject({
      height: 1
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("mock-map-active-route").props.style)
    ).toMatchObject({
      backgroundColor: mapStyle.route,
      boxShadow: `0 0 18px ${mapStyle.routeGlow}`
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("mock-map-origin-marker").props.style)
    ).toMatchObject({
      backgroundColor: mapStyle.markerSurface,
      borderColor: glass.floating.borderColor,
      boxShadow: shadows.cardSubtle
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("mock-map-route-panel").props.style)
    ).toMatchObject({
      backgroundColor: glass.floating.backgroundColor,
      borderColor: glass.floating.borderColor,
      boxShadow: shadows.card
    });
  });

  it("shows premium customer route telemetry without requiring a real map provider", async () => {
    const screen = await render(
      createElement(MockRouteMap, {
        destinationArea: request.destinationArea,
        destinationDetail: request.destinationDetail,
        phase: "driving",
        pickupLabel: request.pickup
      })
    );

    expect(screen.getByTestId("mock-map-route-telemetry")).toBeTruthy();
    expect(screen.getByText("المرحلة الحالية")).toBeTruthy();
    expect(screen.getByText("الرحلة بدأت")).toBeTruthy();
    expect(screen.getByText("مسافة الرحلة")).toBeTruthy();
    expect(screen.getByText(customerHomeMock.tripDistance)).toBeTruthy();
    expect(screen.getByText("وصول الكابتن")).toBeTruthy();
    expect(screen.getAllByText(customerHomeMock.eta).length).toBeGreaterThanOrEqual(1);
  });

  it("keeps the captain map route and overlays visually prioritized", async () => {
    const screen = await render(createElement(CaptainRouteMap, { request, step: "driving" }));

    expect(StyleSheet.flatten(screen.getByTestId("captain-route-map").props.style)).toMatchObject({
      backgroundColor: colors.graphite,
      borderColor: glass.floating.borderColor,
      boxShadow: shadows.floating
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("captain-map-primary-road").props.style)
    ).toMatchObject({
      height: 3
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("captain-map-secondary-road").props.style)
    ).toMatchObject({
      height: 1
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("captain-map-active-route").props.style)
    ).toMatchObject({
      backgroundColor: mapStyle.route,
      boxShadow: `0 0 18px ${mapStyle.routeGlow}`
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("captain-map-start-marker").props.style)
    ).toMatchObject({
      backgroundColor: mapStyle.markerSurface,
      borderColor: glass.floating.borderColor,
      boxShadow: shadows.cardSubtle
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("captain-map-route-panel").props.style)
    ).toMatchObject({
      backgroundColor: glass.floating.backgroundColor,
      borderColor: glass.floating.borderColor,
      boxShadow: shadows.card
    });
  });

  it("shows captain navigation waypoints and current guidance", async () => {
    const screen = await render(createElement(CaptainRouteMap, { request, step: "driving" }));

    expect(screen.getByTestId("captain-map-navigation-stack")).toBeTruthy();
    expect(screen.getByText("التوجيه الحالي")).toBeTruthy();
    expect(screen.getAllByText("من العميل إلى الوجهة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("نقطة الانطلاق")).toBeTruthy();
    expect(screen.getByText(`من: ${request.pickup}`)).toBeTruthy();
    expect(screen.getByText("نقطة الوصول")).toBeTruthy();
    expect(screen.getByText(`إلى: ${request.destinationArea}`)).toBeTruthy();
  });

  it("keeps the customer map stable until route inputs change", () => {
    const props = {
      destinationArea: request.destinationArea,
      destinationDetail: request.destinationDetail,
      phase: "driving" as const,
      pickupLabel: request.pickup
    };

    expect(areMockRouteMapPropsEqual(props, { ...props })).toBe(true);
    expect(areMockRouteMapPropsEqual(props, { ...props, phase: "completed" })).toBe(false);
    expect(
      areMockRouteMapPropsEqual(
        {},
        {
          destinationArea: null,
          destinationDetail: " ",
          phase: "idle",
          pickupLabel: customerHomeMock.pickup
        }
      )
    ).toBe(true);
  });

  it("keeps the captain map stable until rendered request or trip inputs change", () => {
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
    expect(
      areCaptainRouteMapPropsEqual(
        { request, step: "driving" },
        {
          request: { ...request, paymentMethod: "بطاقة محفوظة" },
          step: "driving"
        }
      )
    ).toBe(true);
  });
});
