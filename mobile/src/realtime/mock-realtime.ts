export type MockRealtimeAudience = "both" | "captain" | "customer";

export type MockRealtimeConnectionStatus = "connected" | "offline" | "syncing";

export type MockRealtimeEventKind =
  | "captain-arrived"
  | "captain-request-declined"
  | "captain-request-accepted"
  | "customer-feedback-submitted"
  | "customer-request-created"
  | "trip-completed"
  | "trip-started";

export type MockRealtimeEvent = {
  audience: MockRealtimeAudience;
  detail: string;
  id: string;
  kind: MockRealtimeEventKind;
  requestId: string;
  sequence: number;
  status: "delivered";
  title: string;
};

export type MockRealtimeState = {
  connectionStatus: MockRealtimeConnectionStatus;
  events: MockRealtimeEvent[];
};

export type MockRealtimeConnectionSummary = {
  detail: string;
  eventCount: number;
  label: string;
  tone: MockRealtimeConnectionStatus;
};

export type MockRealtimeEventInput = Omit<MockRealtimeEvent, "id" | "sequence" | "status">;

export function createInitialMockRealtimeState(): MockRealtimeState {
  return {
    connectionStatus: "connected",
    events: [],
  };
}

export function appendMockRealtimeEvent(
  realtime: MockRealtimeState,
  event: MockRealtimeEventInput
): MockRealtimeState {
  const sequence = (realtime.events[0]?.sequence ?? 0) + 1;
  const nextEvent: MockRealtimeEvent = {
    ...event,
    id: `mock-realtime-${sequence}-${event.kind}`,
    sequence,
    status: "delivered",
  };

  return {
    ...realtime,
    events: [nextEvent, ...realtime.events].slice(0, 12),
  };
}

export function getLatestMockRealtimeEvent(
  realtime: MockRealtimeState,
  audience: MockRealtimeAudience
): MockRealtimeEvent | null {
  return getRecentMockRealtimeEvents(realtime, audience, 1)[0] ?? null;
}

export function getRecentMockRealtimeEvents(
  realtime: MockRealtimeState,
  audience: MockRealtimeAudience,
  limit = 4
): MockRealtimeEvent[] {
  return realtime.events
    .filter((event) => event.audience === "both" || event.audience === audience)
    .slice(0, limit);
}

export function updateMockRealtimeConnectionStatus(
  realtime: MockRealtimeState,
  connectionStatus: MockRealtimeConnectionStatus
): MockRealtimeState {
  return {
    ...realtime,
    connectionStatus,
  };
}

export function getMockRealtimeConnectionSummary(
  realtime: MockRealtimeState,
  audience: MockRealtimeAudience
): MockRealtimeConnectionSummary {
  const visibleEvents = getRecentMockRealtimeEvents(realtime, audience, realtime.events.length);
  const latestEvent = visibleEvents[0] ?? null;

  return {
    detail: getMockRealtimeConnectionDetail(realtime.connectionStatus, latestEvent?.sequence ?? null),
    eventCount: visibleEvents.length,
    label: getMockRealtimeConnectionLabel(realtime.connectionStatus),
    tone: realtime.connectionStatus,
  };
}

function getMockRealtimeConnectionLabel(status: MockRealtimeConnectionStatus): string {
  switch (status) {
    case "connected":
      return "متصل مباشر";
    case "offline":
      return "غير متصل مؤقتًا";
    case "syncing":
      return "مزامنة مباشرة";
    default: {
      const exhaustiveStatus: never = status;
      return exhaustiveStatus;
    }
  }
}

function getMockRealtimeConnectionDetail(status: MockRealtimeConnectionStatus, latestSequence: number | null): string {
  if (!latestSequence) {
    return status === "offline" ? "لا يوجد تحديث محفوظ" : "بانتظار أول تحديث";
  }

  if (status === "offline") {
    return `آخر تحديث محفوظ #${latestSequence}`;
  }

  if (status === "syncing") {
    return `جاري مزامنة التحديث #${latestSequence}`;
  }

  return `آخر تحديث #${latestSequence}`;
}
