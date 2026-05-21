import { apiGet, apiPost } from "./apiClient";

export function createSupportTicket(payload, session = {}) {
  return apiPost("/support/tickets", payload, { token: session.token, role: session.role, phone: session.phone });
}

export async function fetchMySupportTickets({ phone = "", role = "customer", token = "" } = {}) {
  const params = new URLSearchParams();
  if (phone) params.set("phone", phone);
  if (role) params.set("role", role);
  const payload = await apiGet(`/support/my-tickets${params.toString() ? `?${params}` : ""}`, { token, role, phone });
  return payload?.tickets || [];
}
