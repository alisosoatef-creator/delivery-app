import { apiPost } from "./apiClient.js";

export function registerCustomer(payload) {
  return apiPost("/auth/register", payload);
}

export function verifyOtp(payload) {
  return apiPost("/auth/verify-otp", payload);
}

export function loginCustomer(payload) {
  return apiPost("/auth/login", payload);
}

export function logoutCustomer() {
  return apiPost("/auth/logout", {});
}
