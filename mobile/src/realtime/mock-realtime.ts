export type MockRealtimeAudience = "both" | "captain" | "customer";

export type MockRealtimeConnectionStatus = "connected" | "offline" | "syncing";

export type MockRealtimeEventKind =
  | "captain-arrived"
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
