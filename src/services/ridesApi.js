import { apiGet, apiPatch, apiPost } from "./apiClient.js";

export function requestRideQuote(payload) {
  return apiPost("/rides/quote", payload);
}

export async function fetchRides() {
  const payload = await apiGet("/rides");
  return payload?.rides || [];
}

export async function fetchCustomerRides({ customerId = "", customerPhone = "" } = {}) {
  const params = new URLSearchParams();
  if (customerId) params.set("customerId", customerId);
  if (customerPhone) params.set("phone", customerPhone);
  const query = params.toString();
  const payload = await apiGet(`/customer/rides${query ? `?${query}` : ""}`);
  return payload?.rides || [];
}

export async function fetchCustomerRide(rideId, { customerId = "", customerPhone = "" } = {}) {
  const params = new URLSearchParams();
  if (customerId) params.set("customerId", customerId);
  if (customerPhone) params.set("phone", customerPhone);
  const query = params.toString();
  const payload = await apiGet(`/customer/rides/${rideId}${query ? `?${query}` : ""}`);
  return payload?.ride || null;
}

export function createRide(payload) {
  return apiPost("/rides", payload);
}

export function patchRideStatus(rideId, status) {
  return apiPatch(`/rides/${rideId}/status`, { status });
}

export function cancelRide(rideId) {
  return patchRideStatus(rideId, "cancelled");
}

export function acceptRide(rideId, driverId) {
  return apiPatch(`/rides/${rideId}/accept`, { driverId });
}
