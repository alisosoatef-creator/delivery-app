import { describe, expect, it } from "@jest/globals";

import {
  appendMockRealtimeEvent,
  createInitialMockRealtimeState,
  getMockRealtimeConnectionSummary,
  getRecentMockRealtimeEvents,
  updateMockRealtimeConnectionStatus,
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

  it("summarizes connection health with the latest audience-visible event", () => {
    let realtime = createInitialMockRealtimeState();

    expect(getMockRealtimeConnectionSummary(realtime, "customer")).toEqual({
      detail: "بانتظار أول تحديث",
      eventCount: 0,
      label: "متصل مباشر",
      tone: "connected",
    });

    realtime = appendMockRealtimeEvent(realtime, {
      audience: "both",
      detail: "first",
      kind: "customer-request-created",
      requestId: "request-1",
      title: "طلب مباشر جديد",
    });
    realtime = appendMockRealtimeEvent(realtime, {
      audience: "captain",
      detail: "captain only",
      kind: "customer-feedback-submitted",
      requestId: "request-1",
      title: "تقييم جديد من العميل",
    });

    expect(getMockRealtimeConnectionSummary(realtime, "customer")).toEqual({
      detail: "آخر تحديث #1",
      eventCount: 1,
      label: "متصل مباشر",
      tone: "connected",
    });

    realtime = updateMockRealtimeConnectionStatus(realtime, "offline");

    expect(getMockRealtimeConnectionSummary(realtime, "captain")).toEqual({
      detail: "آخر تحديث محفوظ #2",
      eventCount: 2,
      label: "غير متصل مؤقتًا",
      tone: "offline",
    });
  });
});
