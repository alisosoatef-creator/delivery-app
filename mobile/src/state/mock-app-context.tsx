import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from "react";

import {
  createInitialMockSession,
  mockSessionReducer,
  type MockAppSession,
  type MockSessionAction
} from "@/state/mock-app-session";
import {
  createInitialMockRideRequests,
  mockRideRequestsReducer,
  type MockRideRequestsAction,
  type MockRideRequestsState
} from "@/state/mock-ride-requests";

type MockAppContextValue = {
  dispatchRideRequests: Dispatch<MockRideRequestsAction>;
  dispatchSession: Dispatch<MockSessionAction>;
  rideRequests: MockRideRequestsState;
  session: MockAppSession;
};

const MockAppContext = createContext<MockAppContextValue | null>(null);

export function MockAppProvider({ children }: { children: ReactNode }) {
  const [session, dispatchSession] = useReducer(mockSessionReducer, createInitialMockSession());
  const [rideRequests, dispatchRideRequests] = useReducer(
    mockRideRequestsReducer,
    createInitialMockRideRequests()
  );
  const contextValue = useMemo(
    () => ({
      dispatchRideRequests,
      dispatchSession,
      rideRequests,
      session,
    }),
    [rideRequests, session]
  );

  return <MockAppContext.Provider value={contextValue}>{children}</MockAppContext.Provider>;
}

export function useMockAppSession() {
  const contextValue = useContext(MockAppContext);

  if (!contextValue) {
    throw new Error("useMockAppSession must be used within MockAppProvider");
  }

  return [contextValue.session, contextValue.dispatchSession] as const;
}

export function useMockRideRequests() {
  const contextValue = useContext(MockAppContext);

  if (!contextValue) {
    throw new Error("useMockRideRequests must be used within MockAppProvider");
  }

  return [contextValue.rideRequests, contextValue.dispatchRideRequests] as const;
}
