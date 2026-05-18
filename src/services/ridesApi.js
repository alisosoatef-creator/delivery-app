import { apiGet, apiPatch, apiPost } from "./apiClient.js";

export function requestRideQuote(payload) {
  return apiPost("/rides/quote", payload);
}

export async function fetchRides() {
  const payload = await apiGet("/rides");
  return payload?.rides || [];
}

export function createRide(payload) {
  return apiPost("/rides", payload);
}

export function patchRideStatus(rideId, status) {
  return apiPatch(`/rides/${rideId}/status`, { status });
}
