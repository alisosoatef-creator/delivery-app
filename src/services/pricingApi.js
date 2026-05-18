import { apiGet, apiPatch } from "./apiClient.js";

export async function fetchPricingRules() {
  const payload = await apiGet("/admin/pricing");
  return payload?.pricingRules || [];
}

export function updatePricingRule(cityId, patch) {
  return apiPatch(`/admin/pricing/${cityId}`, patch);
}
