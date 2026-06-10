import { describe, expect, it } from "@jest/globals";

import {
  captainTripFlowReducer,
  createInitialCaptainTripFlow,
  createInitialCustomerTripFlow,
  customerTripFlowReducer
} from "@/state/mock-trip-flow";

describe("mock trip flow state", () => {
  it("keeps the customer request lifecycle explicit", () => {
    let state = createInitialCustomerTripFlow();

    expect(state).toEqual({ showConfirmation: false, stage: "idle" });

    state = customerTripFlowReducer(state, { type: "review-request" });
    expect(state).toEqual({ showConfirmation: true, stage: "idle" });

    state = customerTripFlowReducer(state, { type: "confirm-request" });
    expect(state).toEqual({ showConfirmation: false, stage: "searching" });

    state = customerTripFlowReducer(state, { type: "assign-captain" });
    expect(state).toEqual({ showConfirmation: false, stage: "captain" });

    state = customerTripFlowReducer(state, { type: "start-trip" });
    expect(state).toEqual({ showConfirmation: false, stage: "active" });

    state = customerTripFlowReducer(state, { type: "complete-trip" });
    expect(state).toEqual({ showConfirmation: false, stage: "completed" });

    state = customerTripFlowReducer(state, { type: "reset" });
    expect(state).toEqual({ showConfirmation: false, stage: "idle" });
  });

  it("cancels customer search without leaving stale confirmation state", () => {
    let state = createInitialCustomerTripFlow();

    state = customerTripFlowReducer(state, { type: "review-request" });
    state = customerTripFlowReducer(state, { type: "confirm-request" });
    state = customerTripFlowReducer(state, { type: "cancel-search" });

    expect(state).toEqual({ showConfirmation: false, stage: "idle" });
  });

  it("keeps the captain active trip lifecycle explicit", () => {
    let state = createInitialCaptainTripFlow();

    expect(state).toEqual({ step: "pickup" });

    state = captainTripFlowReducer(state, { type: "arrive-to-customer" });
    expect(state).toEqual({ step: "arrived" });

    state = captainTripFlowReducer(state, { type: "start-trip" });
    expect(state).toEqual({ step: "driving" });

    state = captainTripFlowReducer(state, { type: "complete-trip" });
    expect(state).toEqual({ step: "completed" });

    state = captainTripFlowReducer(state, { type: "reset" });
    expect(state).toEqual({ step: "pickup" });
  });
});
