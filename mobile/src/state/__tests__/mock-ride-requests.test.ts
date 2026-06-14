import { describe, expect, it } from "@jest/globals";

import { captainHomeMock, type CaptainAvailableRequest } from "@/mock/captain-home";
import { createInitialMockRideRequests, mockRideRequestsReducer } from "@/state/mock-ride-requests";

function createRequest(overrides: Partial<CaptainAvailableRequest> = {}): CaptainAvailableRequest {
  return {
    ...captainHomeMock.availableRequests[0],
    id: "request-live-customer",
    destinationDetail: "Mock shared destination",
    ...overrides,
  };
}

describe("mock ride requests state", () => {
  it("starts with the seeded captain request", () => {
    const state = createInitialMockRideRequests();

    expect(state.availableRequests).toEqual(captainHomeMock.availableRequests);
    expect(state.acceptedRequest).toBeNull();
    expect(state.completedRequests).toEqual([]);
    expect(state.declinedRequests).toEqual([]);
    expect(state.customerFeedback).toBeNull();
    expect(state.realtime.connectionStatus).toBe("connected");
    expect(state.realtime.events).toEqual([]);
  });

  it("adds a customer request at the top and replaces duplicate ids", () => {
    let state = createInitialMockRideRequests();
    const request = createRequest();

    state = mockRideRequestsReducer(state, { request, type: "submit-customer-request" });

    expect(state.availableRequests[0]).toEqual(request);
    expect(state.availableRequests).toHaveLength(captainHomeMock.availableRequests.length + 1);
    expect(state.realtime.events[0]).toMatchObject({
      kind: "customer-request-created",
      sequence: 1,
      title: "طلب مباشر جديد",
    });

    state = mockRideRequestsReducer(state, {
      request: createRequest({ price: "31 شيكل" }),
      type: "submit-customer-request",
    });

    expect(state.availableRequests[0].price).toBe("31 شيكل");
    expect(state.availableRequests).toHaveLength(captainHomeMock.availableRequests.length + 1);
  });

  it("stores an accepted request and removes it from the available list", () => {
    let state = createInitialMockRideRequests();
    const request = createRequest();

    state = mockRideRequestsReducer(state, { request, type: "submit-customer-request" });
    state = mockRideRequestsReducer(state, { requestId: request.id, type: "accept-request" });

    expect(state.availableRequests.some((availableRequest) => availableRequest.id === request.id)).toBe(false);
    expect(state.acceptedRequest).toEqual(request);
    expect(state.realtime.events[0]).toMatchObject({
      kind: "captain-request-accepted",
      requestId: request.id,
      title: "تم قبول الطلب",
    });
  });

  it("declines a request for the captain without accepting it", () => {
    let state = createInitialMockRideRequests();
    const request = createRequest();

    state = mockRideRequestsReducer(state, { request, type: "submit-customer-request" });
    state = mockRideRequestsReducer(state, { requestId: request.id, type: "decline-request" });

    expect(state.acceptedRequest).toBeNull();
    expect(state.acceptedTripStep).toBeNull();
    expect(state.availableRequests.some((availableRequest) => availableRequest.id === request.id)).toBe(false);
    expect(state.declinedRequests[0]).toEqual(request);
    expect(state.realtime.events[0]).toMatchObject({
      audience: "both",
      detail: "نبحث عن كابتن بديل يناسب رحلتك",
      kind: "captain-request-declined",
      requestId: request.id,
      title: "الكابتن اعتذر عن الطلب",
    });
  });

  it("tracks the shared progress step for the accepted request", () => {
    let state = createInitialMockRideRequests();
    const request = createRequest();

    state = mockRideRequestsReducer(state, { request, type: "submit-customer-request" });
    state = mockRideRequestsReducer(state, { requestId: request.id, type: "accept-request" });

    expect(state.acceptedTripStep).toBe("pickup");

    state = mockRideRequestsReducer(state, {
      requestId: request.id,
      step: "driving",
      type: "update-accepted-trip-step",
    });

    expect(state.acceptedTripStep).toBe("driving");
    expect(state.realtime.events[0]).toMatchObject({
      kind: "trip-started",
      requestId: request.id,
      title: "بدأت الرحلة",
    });
  });

  it("clears the accepted request without reseeding available requests", () => {
    let state = createInitialMockRideRequests();
    const request = createRequest();

    state = mockRideRequestsReducer(state, { request, type: "submit-customer-request" });
    state = mockRideRequestsReducer(state, { requestId: request.id, type: "accept-request" });
    state = mockRideRequestsReducer(state, {
      requestId: request.id,
      step: "completed",
      type: "update-accepted-trip-step",
    });
    state = mockRideRequestsReducer(state, { type: "clear-accepted-request" });

    expect(state.acceptedRequest).toBeNull();
    expect(state.acceptedTripStep).toBeNull();
    expect(state.availableRequests.some((availableRequest) => availableRequest.id === request.id)).toBe(false);
    expect(state.completedRequests[0]).toEqual(request);
  });

  it("stores the latest customer feedback for a completed request", () => {
    let state = createInitialMockRideRequests();
    const request = createRequest();

    state = mockRideRequestsReducer(state, { request, type: "submit-customer-request" });
    state = mockRideRequestsReducer(state, { requestId: request.id, type: "accept-request" });
    state = mockRideRequestsReducer(state, {
      requestId: request.id,
      step: "completed",
      type: "update-accepted-trip-step",
    });
    state = mockRideRequestsReducer(state, {
      feedback: {
        note: "الكابتن ممتاز",
        rating: 5,
        requestId: request.id,
      },
      type: "submit-customer-feedback",
    });

    expect(state.customerFeedback).toEqual({
      note: "الكابتن ممتاز",
      rating: 5,
      requestId: request.id,
    });
    expect(state.realtime.events[0]).toMatchObject({
      kind: "customer-feedback-submitted",
      requestId: request.id,
      title: "تقييم جديد من العميل",
    });
  });

  it("updates realtime connection status without clearing delivered events", () => {
    let state = createInitialMockRideRequests();
    const request = createRequest();

    state = mockRideRequestsReducer(state, { request, type: "submit-customer-request" });
    state = mockRideRequestsReducer(state, {
      status: "offline",
      type: "set-realtime-connection-status",
    });

    expect(state.realtime.connectionStatus).toBe("offline");
    expect(state.realtime.events[0]).toMatchObject({
      kind: "customer-request-created",
      title: "طلب مباشر جديد",
    });
  });
});
