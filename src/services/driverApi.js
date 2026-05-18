import { apiGet, apiPatch, apiPost } from "./apiClient.js";

export async function fetchDriverDevDrivers() {
  const payload = await apiGet("/driver/dev-drivers");
  return payload?.drivers || [];
}

export function driverDevLogin(payload) {
  return apiPost("/driver/dev-login", payload);
}

export async function fetchAvailableDriverRides({ cityId = "" } = {}) {
  const params = new URLSearchParams();
  if (cityId) params.set("cityId", cityId);
  const query = params.toString();
  const payload = await apiGet(`/driver/available-rides${query ? `?${query}` : ""}`);
  return payload?.rides || [];
}

export async function fetchDriverRides({ driverId = "", phone = "" } = {}) {
  const params = new URLSearchParams();
  if (driverId) params.set("driverId", driverId);
  if (phone) params.set("phone", phone);
  const query = params.toString();
  const payload = await apiGet(`/driver/my-rides${query ? `?${query}` : ""}`);
  return payload?.rides || [];
}

export function acceptDriverRide({ rideId, driverId }) {
  return apiPatch(`/rides/${rideId}/accept`, { driverId });
}

export function updateDriverRideStatus({ rideId, driverId, status }) {
  return apiPatch(`/driver/rides/${rideId}/status`, { driverId, status });
}

export function updateDriverOnlineStatus({ driverId, online }) {
  return apiPost("/drivers/status", { driverId, online });
}
