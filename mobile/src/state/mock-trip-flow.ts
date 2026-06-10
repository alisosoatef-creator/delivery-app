export type CustomerTripStage = "idle" | "searching" | "captain" | "active" | "completed";

export type CustomerTripFlow = {
  showConfirmation: boolean;
  stage: CustomerTripStage;
};

export type CustomerTripFlowAction =
  | { type: "review-request" }
  | { type: "confirm-request" }
  | { type: "assign-captain" }
  | { type: "start-trip" }
  | { type: "complete-trip" }
  | { type: "cancel-search" }
  | { type: "reset" };

export type CaptainTripStep = "pickup" | "arrived" | "driving" | "completed";

export type CaptainTripFlow = {
  step: CaptainTripStep;
};

export type CaptainTripFlowAction =
  | { type: "arrive-to-customer" }
  | { type: "start-trip" }
  | { type: "complete-trip" }
  | { type: "reset" };

export function createInitialCustomerTripFlow(): CustomerTripFlow {
  return {
    showConfirmation: false,
    stage: "idle",
  };
}

export function customerTripFlowReducer(
  _state: CustomerTripFlow,
  action: CustomerTripFlowAction
): CustomerTripFlow {
  switch (action.type) {
    case "review-request":
      return {
        showConfirmation: true,
        stage: "idle",
      };
    case "confirm-request":
      return {
        showConfirmation: false,
        stage: "searching",
      };
    case "assign-captain":
      return {
        showConfirmation: false,
        stage: "captain",
      };
    case "start-trip":
      return {
        showConfirmation: false,
        stage: "active",
      };
    case "complete-trip":
      return {
        showConfirmation: false,
        stage: "completed",
      };
    case "cancel-search":
    case "reset":
      return createInitialCustomerTripFlow();
    default: {
      const exhaustiveAction: never = action;
      return exhaustiveAction;
    }
  }
}

export function createInitialCaptainTripFlow(): CaptainTripFlow {
  return {
    step: "pickup",
  };
}

export function captainTripFlowReducer(
  _state: CaptainTripFlow,
  action: CaptainTripFlowAction
): CaptainTripFlow {
  switch (action.type) {
    case "arrive-to-customer":
      return {
        step: "arrived",
      };
    case "start-trip":
      return {
        step: "driving",
      };
    case "complete-trip":
      return {
        step: "completed",
      };
    case "reset":
      return createInitialCaptainTripFlow();
    default: {
      const exhaustiveAction: never = action;
      return exhaustiveAction;
    }
  }
}
