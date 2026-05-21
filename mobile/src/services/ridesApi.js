import { apiGet, apiPatch, apiPost } from "./apiClient";

export function quoteRide(payload) {
  return apiPost("/rides/quote", payload);
}

export function createRide(payload, session = {}) {
  return apiPost("/rides", payload, { token: session.token, role: session.role || "customer", phone: session.phone });
}

export async function fetchCustomerRides({ phone = "", userId = "", token = "" } = {}) {
  const params = new URLSearchParams();
  if (phone) params.set("phone", phone);
  if (userId) params.set("customerId", userId);
  const payload = await apiGet(`/customer/rides${params.toString() ? `?${params}` : ""}`, { token, role: "customer", phone });
  return payload?.rides || [];
}

export function cancelRide(rideId, session = {}) {
  return apiPatch(`/rides/${rideId}/status`, { status: "cancelled" }, { token: session.token, role: session.role || "customer", phone: session.phone });
}
