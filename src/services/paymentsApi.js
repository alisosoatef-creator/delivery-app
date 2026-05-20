import { apiDelete, apiGet, apiPatch, apiPost } from "./apiClient.js";

function customerQuery({ userId = "", phone = "", customerId = "", customerPhone = "" } = {}) {
  const params = new URLSearchParams();
  const resolvedUserId = userId || customerId;
  const resolvedPhone = phone || customerPhone;
  if (resolvedUserId) params.set("userId", resolvedUserId);
  if (resolvedPhone) params.set("phone", resolvedPhone);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchCustomerWallet(identity = {}) {
  const payload = await apiGet(`/customer/wallet${customerQuery(identity)}`);
  return payload?.wallet || { balance: 0, balanceIls: 0, transactions: [], currency: "ILS" };
}

export async function fetchCustomerPayments(identity = {}) {
  const payload = await apiGet(`/customer/payments${customerQuery(identity)}`);
  return payload?.payments || [];
}

export async function fetchPaymentMethods(identity = {}) {
  const payload = await apiGet(`/customer/payment-methods${customerQuery(identity)}`);
  return payload?.methods || [];
}

export function addPaymentMethod(payload) {
  return apiPost("/customer/payment-methods", payload);
}

export function deletePaymentMethod(methodId, identity = {}) {
  return apiDelete(`/customer/payment-methods/${methodId}${customerQuery(identity)}`);
}

export function payRide({ rideId, method = "cash", paymentMethodId = "" }) {
  return apiPost(`/rides/${rideId}/pay`, { method, paymentMethodId });
}

export async function fetchAdminPayments() {
  const payload = await apiGet("/admin/payments");
  return payload || { payments: [], walletTransactions: [], summary: null };
}

export async function fetchAdminWalletTransactions() {
  const payload = await apiGet("/admin/wallet-transactions");
  return payload?.transactions || [];
}

export function updateAdminPaymentStatus(paymentId, status) {
  return apiPatch(`/admin/payments/${paymentId}/status`, { status });
}

export async function fetchDriverEarnings({ driverId = "", phone = "" } = {}) {
  const params = new URLSearchParams();
  if (driverId) params.set("driverId", driverId);
  if (phone) params.set("phone", phone);
  const query = params.toString();
  const payload = await apiGet(`/driver/earnings${query ? `?${query}` : ""}`);
  return payload || { summary: null, payments: [], transactions: [] };
}

export async function fetchDriverWalletTransactions({ driverId = "", phone = "" } = {}) {
  const params = new URLSearchParams();
  if (driverId) params.set("driverId", driverId);
  if (phone) params.set("phone", phone);
  const query = params.toString();
  const payload = await apiGet(`/driver/wallet-transactions${query ? `?${query}` : ""}`);
  return payload?.transactions || [];
}
