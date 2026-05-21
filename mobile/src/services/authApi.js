import { apiPost } from "./apiClient";

export function registerCustomer(payload) {
  return apiPost("/auth/register", { ...payload, role: "customer" });
}

export function verifyOtp(payload) {
  return apiPost("/auth/verify-otp", payload);
}

export function loginCustomer(payload) {
  return apiPost("/auth/login", payload);
}

export function logoutCustomer(token) {
  return apiPost("/auth/logout", {}, { token, role: "customer" });
}
