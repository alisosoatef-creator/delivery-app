export const RIDE_STATUSES = Object.freeze({
  draft: "draft",
  searching: "searching",
  accepted: "accepted",
  driverArriving: "driver_arriving",
  arrived: "arrived",
  inProgress: "in_progress",
  completed: "completed",
  cancelled: "cancelled"
});

export const RIDE_STATUS_VALUES = Object.freeze(Object.values(RIDE_STATUSES));
export const TERMINAL_RIDE_STATUSES = Object.freeze([RIDE_STATUSES.completed, RIDE_STATUSES.cancelled]);

const legacyStatusAliases = Object.freeze({
  arriving: RIDE_STATUSES.driverArriving,
  picked_up: RIDE_STATUSES.inProgress,
  canceled: RIDE_STATUSES.cancelled
});

export function normalizeRideStatus(status) {
  const rawStatus = String(status || "").trim();
  return legacyStatusAliases[rawStatus] || rawStatus;
}

export function isValidRideStatus(status) {
  return RIDE_STATUS_VALUES.includes(normalizeRideStatus(status));
}

export function isTerminalRideStatus(status) {
  return TERMINAL_RIDE_STATUSES.includes(normalizeRideStatus(status));
}
