import { describe, expect, it } from "@jest/globals";

import {
  appendMockRealtimeEvent,
  createInitialMockRealtimeState,
  getRecentMockRealtimeEvents,
} from "@/realtime/mock-realtime";

describe("mock realtime stream", () => {
  it("keeps recent audience events in newest-first order", () => {
    let realtime = createInitialMockRealtimeState();

    realtime = appendMockRealtimeEvent(realtime, {
      audience: "both",
      detail: "first",
      kind: "customer-request-created",
      requestId: "request-1",
      title: "طلب مباشر جديد",
    });
    realtime = appendMockRealtimeEvent(realtime, {
      audience: "captain",
      detail: "second",
      kind: "customer-feedback-submitted",
      requestId: "request-1",
      title: "تقييم جديد من العميل",
    });
    realtime = appendMockRealtimeEvent(realtime, {
      audience: "customer",
      detail: "third",
      kind: "trip-completed",
      requestId: "request-1",
      title: "اكتملت الرحلة",
    });

    expect(getRecentMockRealtimeEvents(realtime, "customer", 2).map((event) => event.title)).toEqual([
      "اكتملت الرحلة",
      "طلب مباشر جديد",
    ]);
    expect(getRecentMockRealtimeEvents(realtime, "captain", 2).map((event) => event.title)).toEqual([
      "تقييم جديد من العميل",
      "طلب مباشر جديد",
    ]);
  });
});
