import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from "react";

import {
  createInitialMockSession,
  mockSessionReducer,
  type MockAppSession,
  type MockSessionAction
} from "@/state/mock-app-session";

type MockAppContextValue = {
  dispatchSession: Dispatch<MockSessionAction>;
  session: MockAppSession;
};

const MockAppContext = createContext<MockAppContextValue | null>(null);

export function MockAppProvider({ children }: { children: ReactNode }) {
  const [session, dispatchSession] = useReducer(mockSessionReducer, createInitialMockSession());
  const contextValue = useMemo(
    () => ({
      dispatchSession,
      session,
    }),
    [session]
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
