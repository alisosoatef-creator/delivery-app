import { apiGet, apiPost } from "./apiClient";

export async function fetchCustomerWallet({ phone = "", userId = "", token = "" } = {}) {
  const params = new URLSearchParams();
  if (phone) params.set("phone", phone);
  if (userId) params.set("userId", userId);
  const payload = await apiGet(`/customer/wallet${params.toString() ? `?${params}` : ""}`, { token, role: "customer", phone });
  return payload?.wallet || { balance: 0, transactions: [] };
}

export function addVisaPlaceholder(payload, session = {}) {
  return apiPost("/customer/payment-methods", payload, { token: session.token, role: "customer", phone: session.phone });
}
