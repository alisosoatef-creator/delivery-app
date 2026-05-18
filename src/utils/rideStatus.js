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
export const ACTIVE_RIDE_STATUSES = Object.freeze([
  RIDE_STATUSES.searching,
  RIDE_STATUSES.accepted,
  RIDE_STATUSES.driverArriving,
  RIDE_STATUSES.arrived,
  RIDE_STATUSES.inProgress
]);

const legacyStatusAliases = Object.freeze({
  arriving: RIDE_STATUSES.driverArriving,
  picked_up: RIDE_STATUSES.inProgress,
  canceled: RIDE_STATUSES.cancelled
});

export function normalizeRideStatus(status) {
  const rawStatus = String(status || "").trim();
  return legacyStatusAliases[rawStatus] || rawStatus;
}

export function isAcceptedRideStatus(status) {
  return [
    RIDE_STATUSES.accepted,
    RIDE_STATUSES.driverArriving,
    RIDE_STATUSES.arrived,
    RIDE_STATUSES.inProgress,
    RIDE_STATUSES.completed
  ].includes(normalizeRideStatus(status));
}

export function isRideTerminal(status) {
  return [RIDE_STATUSES.completed, RIDE_STATUSES.cancelled].includes(normalizeRideStatus(status));
}
