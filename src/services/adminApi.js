import { apiGet, apiPatch } from "./apiClient.js";

export async function fetchAdminDashboard() {
  const payload = await apiGet("/admin/dashboard");
  return payload || { stats: null, recentRides: [], pricingRules: [], supportTickets: [] };
}

export async function fetchAdminCustomers() {
  const payload = await apiGet("/admin/customers");
  return payload?.customers || [];
}

export function updateAdminCustomerStatus(customerId, status) {
  return apiPatch(`/admin/customers/${customerId}/status`, { status });
}

export async function fetchAdminDrivers() {
  const payload = await apiGet("/admin/drivers");
  return payload?.drivers || [];
}

export function updateAdminDriverStatus(driverId, patch) {
  return apiPatch(`/admin/drivers/${driverId}/status`, patch);
}

export async function fetchAdminRides() {
  const payload = await apiGet("/admin/rides");
  return payload?.rides || [];
}

export async function fetchAdminSettings() {
  const payload = await apiGet("/admin/settings");
  return payload?.settings || null;
}

export function updateAdminSettings(patch) {
  return apiPatch("/admin/settings", patch);
}
