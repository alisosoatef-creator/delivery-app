export type MockEntryMode =
  | "welcome"
  | "customer-login"
  | "customer-register"
  | "customer-home"
  | "captain-auth"
  | "captain-home";

export type MockActiveRole = "guest" | "customer" | "captain";

export type MockAppSession = {
  activeRole: MockActiveRole;
  entryMode: MockEntryMode;
};

export type MockSessionAction =
  | { type: "back-to-welcome" }
  | { type: "open-customer-login" }
  | { type: "open-customer-register" }
  | { type: "complete-customer-auth" }
  | { type: "open-captain-auth" }
  | { type: "complete-captain-auth" };

export function createInitialMockSession(): MockAppSession {
  return {
    activeRole: "guest",
    entryMode: "welcome",
  };
}

export function mockSessionReducer(_state: MockAppSession, action: MockSessionAction): MockAppSession {
  switch (action.type) {
    case "back-to-welcome":
      return {
        activeRole: "guest",
        entryMode: "welcome",
      };
    case "open-customer-login":
      return {
        activeRole: "guest",
        entryMode: "customer-login",
      };
    case "open-customer-register":
      return {
        activeRole: "guest",
        entryMode: "customer-register",
      };
    case "complete-customer-auth":
      return {
        activeRole: "customer",
        entryMode: "customer-home",
      };
    case "open-captain-auth":
      return {
        activeRole: "guest",
        entryMode: "captain-auth",
      };
    case "complete-captain-auth":
      return {
        activeRole: "captain",
        entryMode: "captain-home",
      };
    default: {
      const exhaustiveAction: never = action;
      return exhaustiveAction;
    }
  }
}
