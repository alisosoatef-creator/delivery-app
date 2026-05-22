export const ACTIVE_RIDE_STATUSES = ["searching", "accepted", "driver_arriving", "arrived", "in_progress"];
export const FINISHED_RIDE_STATUSES = ["completed", "cancelled"];

export function isActiveRide(ride) {
  return Boolean(ride?.id && ACTIVE_RIDE_STATUSES.includes(ride.status));
}

export function isFinishedRide(ride) {
  return Boolean(ride?.id && FINISHED_RIDE_STATUSES.includes(ride.status));
}

export function findActiveRide(rides = []) {
  return [...rides]
    .filter(isActiveRide)
    .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))[0] || null;
}

export function statusLabel(status) {
  const labels = {
    searching: "جاري البحث عن كابتن",
    accepted: "تم قبول الرحلة",
    driver_arriving: "الكابتن بالطريق",
    arrived: "وصل الكابتن",
    in_progress: "بدأت الرحلة",
    completed: "انتهت الرحلة",
    cancelled: "ألغيت الرحلة"
  };
  return labels[status] || status || "-";
}
