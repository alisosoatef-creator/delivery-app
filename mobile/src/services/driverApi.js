import { apiGet, apiPatch, apiPost } from "./apiClient";

function driverSession(session = {}) {
  return {
    token: session.token,
    role: "driver",
    driverId: session.driverId || session.driver?.id || "",
    phone: session.phone || session.driver?.phone || ""
  };
}

export async function fetchDriverDevDrivers() {
  const payload = await apiGet("/driver/dev-drivers");
  return payload?.drivers || [];
}

export function driverDevLogin(payload) {
  return apiPost("/driver/dev-login", payload);
}

export async function fetchAvailableRides(session = {}) {
  const payload = await apiGet("/driver/available-rides", driverSession(session));
  return payload?.rides || [];
}

export async function fetchDriverRides(session = {}) {
  const payload = await apiGet("/driver/my-rides", driverSession(session));
  return payload?.rides || [];
}

export function acceptRide(rideId, session = {}) {
  return apiPatch(`/rides/${rideId}/accept`, {}, driverSession(session));
}

export function updateDriverRideStatus(rideId, status, session = {}) {
  return apiPatch(`/driver/rides/${rideId}/status`, { status }, driverSession(session));
}
