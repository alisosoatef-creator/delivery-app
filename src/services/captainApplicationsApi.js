import { apiGet, apiPatch, apiPost } from "./apiClient.js";

export function createCaptainApplication(payload) {
  return apiPost("/captain-applications", payload);
}

export async function fetchCaptainApplications() {
  const payload = await apiGet("/admin/captain-applications");
  return payload?.applications || [];
}

export function approveCaptainApplication(applicationId) {
  return apiPatch(`/admin/captain-applications/${applicationId}/approve`, {});
}

export function rejectCaptainApplication(applicationId) {
  return apiPatch(`/admin/captain-applications/${applicationId}/reject`, {});
}
