import { captainHomeMock, type CaptainAvailableRequest } from "@/mock/captain-home";
import {
  appendMockRealtimeEvent,
  createInitialMockRealtimeState,
  updateMockRealtimeConnectionStatus,
  type MockRealtimeEventInput,
  type MockRealtimeConnectionStatus,
  type MockRealtimeState
} from "@/realtime/mock-realtime";
import type { CaptainTripStep } from "@/state/mock-trip-flow";

export type CustomerRideFeedback = {
  note: string;
  rating: number;
  requestId: string;
};

export type MockRideRequestsState = {
  acceptedRequest: CaptainAvailableRequest | null;
  acceptedTripStep: CaptainTripStep | null;
  availableRequests: CaptainAvailableRequest[];
  completedRequests: CaptainAvailableRequest[];
  customerFeedback: CustomerRideFeedback | null;
  declinedRequests: CaptainAvailableRequest[];
  realtime: MockRealtimeState;
};

export type MockRideRequestsAction =
  | { request: CaptainAvailableRequest; type: "submit-customer-request" }
  | { requestId: string; type: "accept-request" }
  | { requestId: string; type: "decline-request" }
  | { requestId: string; step: CaptainTripStep; type: "update-accepted-trip-step" }
  | { feedback: CustomerRideFeedback; type: "submit-customer-feedback" }
  | { status: MockRealtimeConnectionStatus; type: "set-realtime-connection-status" }
  | { type: "clear-accepted-request" }
  | { type: "reset-requests" };

export function createInitialMockRideRequests(): MockRideRequestsState {
  return {
    acceptedRequest: null,
    acceptedTripStep: null,
    availableRequests: [...captainHomeMock.availableRequests],
    completedRequests: [],
    customerFeedback: null,
    declinedRequests: [],
    realtime: createInitialMockRealtimeState(),
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
        customerFeedback: state.customerFeedback?.requestId === action.request.id ? null : state.customerFeedback,
        declinedRequests: state.declinedRequests.filter((request) => request.id !== action.request.id),
        realtime: appendMockRealtimeEvent(state.realtime, {
          audience: "both",
          detail: "تم إرسال طلبك للكباتن القريبين",
          kind: "customer-request-created",
          requestId: action.request.id,
          title: "طلب مباشر جديد",
        }),
      };
    }
    case "accept-request": {
      const acceptedRequest = state.availableRequests.find((request) => request.id === action.requestId);

      return {
        acceptedRequest: acceptedRequest ?? state.acceptedRequest,
        acceptedTripStep: acceptedRequest ? "pickup" : state.acceptedTripStep,
        availableRequests: state.availableRequests.filter((request) => request.id !== action.requestId),
        completedRequests: state.completedRequests,
        customerFeedback: state.customerFeedback,
        declinedRequests: state.declinedRequests,
        realtime: acceptedRequest
          ? appendMockRealtimeEvent(state.realtime, {
              audience: "both",
              detail: "الكابتن في الطريق إلى نقطة الانطلاق",
              kind: "captain-request-accepted",
              requestId: acceptedRequest.id,
              title: "تم قبول الطلب",
            })
          : state.realtime,
      };
    }
    case "decline-request": {
      const declinedRequest = state.availableRequests.find((request) => request.id === action.requestId);

      if (!declinedRequest) {
        return state;
      }

      return {
        ...state,
        availableRequests: state.availableRequests.filter((request) => request.id !== action.requestId),
        declinedRequests: [
          declinedRequest,
          ...state.declinedRequests.filter((request) => request.id !== action.requestId),
        ],
        realtime: appendMockRealtimeEvent(state.realtime, {
          audience: "both",
          detail: "نبحث عن كابتن بديل يناسب رحلتك",
          kind: "captain-request-declined",
          requestId: declinedRequest.id,
          title: "الكابتن اعتذر عن الطلب",
        }),
      };
    }
    case "update-accepted-trip-step":
      if (state.acceptedRequest?.id !== action.requestId) {
        return state;
      }

      return {
        ...state,
        acceptedTripStep: action.step,
        realtime: appendMockRealtimeEvent(state.realtime, createTripStepRealtimeEvent(action.requestId, action.step)),
      };
    case "submit-customer-feedback":
      return {
        ...state,
        customerFeedback: action.feedback,
        realtime: appendMockRealtimeEvent(state.realtime, {
          audience: "captain",
          detail: action.feedback.note
            ? `${action.feedback.rating} نجوم • ${action.feedback.note}`
            : `${action.feedback.rating} نجوم`,
          kind: "customer-feedback-submitted",
          requestId: action.feedback.requestId,
          title: "تقييم جديد من العميل",
        }),
      };
    case "set-realtime-connection-status":
      return {
        ...state,
        realtime: updateMockRealtimeConnectionStatus(state.realtime, action.status),
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

function createTripStepRealtimeEvent(requestId: string, step: CaptainTripStep): MockRealtimeEventInput {
  switch (step) {
    case "arrived":
      return {
        audience: "both",
        detail: "الكابتن وصل إلى نقطة الانطلاق",
        kind: "captain-arrived",
        requestId,
        title: "الكابتن وصل للعميل",
      };
    case "driving":
      return {
        audience: "both",
        detail: "الرحلة بدأت ويتم تحديث الحالة مباشرة",
        kind: "trip-started",
        requestId,
        title: "بدأت الرحلة",
      };
    case "completed":
      return {
        audience: "both",
        detail: "تم إنهاء الرحلة وتحديث السجل",
        kind: "trip-completed",
        requestId,
        title: "اكتملت الرحلة",
      };
    case "pickup":
      return {
        audience: "both",
        detail: "الكابتن في الطريق إلى العميل",
        kind: "captain-request-accepted",
        requestId,
        title: "تم قبول الطلب",
      };
    default: {
      const exhaustiveStep: never = step;
      return exhaustiveStep;
    }
  }
}
