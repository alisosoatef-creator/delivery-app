import { createInitialMockRealtimeState } from "@/realtime/mock-realtime";

import { mockRealtimeConnectionStatusSchema, mockRealtimeEventKindSchema } from "../realtime";

describe("realtime API contracts", () => {
  it("documents every current realtime event kind and connection state", () => {
    expect(mockRealtimeConnectionStatusSchema.parse(createInitialMockRealtimeState().connectionStatus)).toBe(
      "connected"
    );
    expect(mockRealtimeEventKindSchema.options).toEqual([
      "captain-arrived",
      "captain-request-declined",
      "captain-request-accepted",
      "customer-feedback-submitted",
      "customer-request-created",
      "trip-completed",
      "trip-started"
    ]);
  });
});
