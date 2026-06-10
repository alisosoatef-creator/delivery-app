import { describe, expect, it } from "@jest/globals";

import { createInitialMockSession, mockSessionReducer } from "@/state/mock-app-session";

describe("mock app session state", () => {
  it("keeps entry mode and active role transitions explicit", () => {
    let state = createInitialMockSession();

    expect(state).toEqual({ activeRole: "guest", entryMode: "welcome" });

    state = mockSessionReducer(state, { type: "open-customer-login" });
    expect(state).toEqual({ activeRole: "guest", entryMode: "customer-login" });

    state = mockSessionReducer(state, { type: "complete-customer-auth" });
    expect(state).toEqual({ activeRole: "customer", entryMode: "customer-home" });

    state = mockSessionReducer(state, { type: "back-to-welcome" });
    expect(state).toEqual({ activeRole: "guest", entryMode: "welcome" });

    state = mockSessionReducer(state, { type: "open-captain-auth" });
    expect(state).toEqual({ activeRole: "guest", entryMode: "captain-auth" });

    state = mockSessionReducer(state, { type: "complete-captain-auth" });
    expect(state).toEqual({ activeRole: "captain", entryMode: "captain-home" });
  });

  it("keeps the register path separate from login before entering customer app", () => {
    let state = createInitialMockSession();

    state = mockSessionReducer(state, { type: "open-customer-register" });
    expect(state).toEqual({ activeRole: "guest", entryMode: "customer-register" });

    state = mockSessionReducer(state, { type: "complete-customer-auth" });
    expect(state).toEqual({ activeRole: "customer", entryMode: "customer-home" });
  });
});
