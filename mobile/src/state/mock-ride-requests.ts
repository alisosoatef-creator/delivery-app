import { captainHomeMock, type CaptainAvailableRequest } from "@/mock/captain-home";
import type { CaptainTripStep } from "@/state/mock-trip-flow";

export type MockRideRequestsState = {
  acceptedRequest: CaptainAvailableRequest | null;
  acceptedTripStep: CaptainTripStep | null;
  availableRequests: CaptainAvailableRequest[];
  completedRequests: CaptainAvailableRequest[];
};

export type MockRideRequestsAction =
  | { request: CaptainAvailableRequest; type: "submit-customer-request" }
  | { requestId: string; type: "accept-request" }
  | { requestId: string; step: CaptainTripStep; type: "update-accepted-trip-step" }
  | { type: "clear-accepted-request" }
  | { type: "reset-requests" };

export function createInitialMockRideRequests(): MockRideRequestsState {
  return {
    acceptedRequest: null,
    acceptedTripStep: null,
    availableRequests: [...captainHomeMock.availableRequests],
    completedRequests: [],
  };
}

export function mockRideRequestsReducer(
  state: MockRideRequestsState,
  action: MockRideRequestsAction
): MockRideRequestsState {
  switch (action.type) {
    case "submit-customer-request": {
      const otherRequests = state.availableRequests.filter((request) => request.id !== action.request.id);

      return {
        acceptedRequest: state.acceptedRequest?.id === action.request.id ? null : state.acceptedRequest,
        acceptedTripStep: state.acceptedRequest?.id === action.request.id ? null : state.acceptedTripStep,
        availableRequests: [action.request, ...otherRequests],
        completedRequests: state.completedRequests,
      };
    }
    case "accept-request": {
      const acceptedRequest = state.availableRequests.find((request) => request.id === action.requestId);

      return {
        acceptedRequest: acceptedRequest ?? state.acceptedRequest,
        acceptedTripStep: acceptedRequest ? "pickup" : state.acceptedTripStep,
        availableRequests: state.availableRequests.filter((request) => request.id !== action.requestId),
        completedRequests: state.completedRequests,
      };
    }
    case "update-accepted-trip-step":
      if (state.acceptedRequest?.id !== action.requestId) {
        return state;
      }

      return {
        ...state,
        acceptedTripStep: action.step,
      };
    case "clear-accepted-request": {
      const completedRequests =
        state.acceptedRequest && state.acceptedTripStep === "completed"
          ? [
              state.acceptedRequest,
              ...state.completedRequests.filter((request) => request.id !== state.acceptedRequest?.id),
            ]
          : state.completedRequests;

      return {
        ...state,
        acceptedRequest: null,
        acceptedTripStep: null,
        completedRequests,
      };
    }
    case "reset-requests":
      return createInitialMockRideRequests();
    default: {
      const exhaustiveAction: never = action;
      return exhaustiveAction;
    }
  }
}
