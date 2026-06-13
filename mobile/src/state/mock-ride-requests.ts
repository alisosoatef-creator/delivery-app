import { captainHomeMock, type CaptainAvailableRequest } from "@/mock/captain-home";

export type MockRideRequestsState = {
  acceptedRequest: CaptainAvailableRequest | null;
  availableRequests: CaptainAvailableRequest[];
};

export type MockRideRequestsAction =
  | { request: CaptainAvailableRequest; type: "submit-customer-request" }
  | { requestId: string; type: "accept-request" }
  | { type: "reset-requests" };

export function createInitialMockRideRequests(): MockRideRequestsState {
  return {
    acceptedRequest: null,
    availableRequests: [...captainHomeMock.availableRequests],
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
        availableRequests: [action.request, ...otherRequests],
      };
    }
    case "accept-request": {
      const acceptedRequest = state.availableRequests.find((request) => request.id === action.requestId);

      return {
        acceptedRequest: acceptedRequest ?? state.acceptedRequest,
        availableRequests: state.availableRequests.filter((request) => request.id !== action.requestId),
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
