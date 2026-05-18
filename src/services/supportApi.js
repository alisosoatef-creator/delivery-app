import { apiGet, apiPatch, apiPost } from "./apiClient.js";

export function createSupportTicket(payload) {
  return apiPost("/support/tickets", payload);
}

export async function fetchSupportTickets() {
  const payload = await apiGet("/admin/support/tickets");
  return payload?.tickets || [];
}

export function updateSupportTicketStatus(ticketId, status = "closed") {
  return apiPatch(`/admin/support/tickets/${ticketId}/status`, { status });
}
