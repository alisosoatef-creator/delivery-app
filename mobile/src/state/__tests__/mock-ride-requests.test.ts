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
  });

  it("adds a customer request at the top and replaces duplicate ids", () => {
    let state = createInitialMockRideRequests();
    const request = createRequest();

    state = mockRideRequestsReducer(state, { request, type: "submit-customer-request" });

    expect(state.availableRequests[0]).toEqual(request);
    expect(state.availableRequests).toHaveLength(captainHomeMock.availableRequests.length + 1);

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
  });
});
