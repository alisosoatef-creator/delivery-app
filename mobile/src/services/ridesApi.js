import { apiGet, apiPatch, apiPost } from "./apiClient";
import { findActiveRide } from "../utils/rideStatus";

export function quoteRide(payload) {
  return apiPost("/rides/quote", payload);
}

export function createRide(payload, session = {}) {
  return apiPost("/rides", payload, { token: session.token, role: session.role || "customer", phone: session.phone, userId: session.userId, customerId: session.userId });
}

export async function fetchCustomerRides({ phone = "", userId = "", token = "" } = {}) {
  const params = new URLSearchParams();
  if (phone) params.set("phone", phone);
  if (userId) params.set("customerId", userId);
  const payload = await apiGet(`/customer/rides${params.toString() ? `?${params}` : ""}`, { token, role: "customer", phone, userId, customerId: userId });
  return payload?.rides || [];
}

export async function fetchActiveCustomerRide(session = {}) {
  const rides = await fetchCustomerRides(session);
  return findActiveRide(rides);
}

export async function fetchCustomerRideDetails({ rideId, phone = "", userId = "", token = "" } = {}) {
  const params = new URLSearchParams();
  if (phone) params.set("phone", phone);
  if (userId) params.set("customerId", userId);
  const payload = await apiGet(`/customer/rides/${rideId}${params.toString() ? `?${params}` : ""}`, { token, role: "customer", phone, userId, customerId: userId });
  return payload?.ride || null;
}

export function cancelRide(rideId, session = {}) {
  return apiPatch(`/rides/${rideId}/status`, { status: "cancelled" }, { token: session.token, role: session.role || "customer", phone: session.phone, userId: session.userId, customerId: session.userId });
}
