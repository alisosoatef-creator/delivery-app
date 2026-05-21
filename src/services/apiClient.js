import { appConfig } from "../config/appConfig.js";
import { getSessionContext, getSessionRole, getSessionToken } from "./sessionToken.js";

export const API_BASE = appConfig.apiBaseUrl;

export class ApiError extends Error {
  constructor(message, status = 0, payload = null, kind = "api_error") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.kind = kind;
    this.code = payload?.error || payload?.code || "";
    this.isNetworkError = kind === "network_error";
    this.isAuthError = kind === "auth_error";
  }
}

function normalizePath(path) {
  const rawPath = String(path || "");
  const withoutApiPrefix = rawPath === "/api" ? "" : rawPath.startsWith("/api/") ? rawPath.slice(4) : rawPath;
  return withoutApiPrefix.startsWith("/") ? withoutApiPrefix : `/${withoutApiPrefix}`;
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text ? { message: text } : null;
}

export function classifyApiError(status) {
  if (!status) return "network_error";
  if (status === 401 || status === 403) return "auth_error";
  if (status === 404) return "not_found";
  if (status >= 500) return "server_error";
  if (status === 400 || status === 409 || status === 422) return "validation_error";
  return "api_error";
}

export function isNetworkApiError(error) {
  return error?.kind === "network_error" || error?.status === 0;
}

export function isAuthApiError(error) {
  return error?.kind === "auth_error" || error?.status === 401 || error?.status === 403;
}

export function apiErrorMessage(error, { ar = "", en = "" } = {}) {
  if (isNetworkApiError(error)) {
    return ar || en || "Unable to reach the local Backend API.";
  }
  if (isAuthApiError(error)) {
    return ar || en || "Session permission is invalid.";
  }
  return error?.payload?.messageAr || error?.payload?.message || error?.message || ar || en || "API request failed.";
}

export async function apiRequest(path, options = {}) {
  const { body, headers, ...requestOptions } = options;
  const hasBody = typeof body !== "undefined";
  const token = getSessionToken();
  const role = getSessionRole();
  const context = getSessionContext();

  let response;
  try {
    response = await fetch(`${API_BASE}${normalizePath(path)}`, {
      ...requestOptions,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(role ? { "X-Dev-Role": role } : {}),
        ...(context.userId ? { "X-Dev-User-Id": context.userId } : {}),
        ...(context.customerId ? { "X-Dev-Customer-Id": context.customerId } : {}),
        ...(context.driverId ? { "X-Dev-Driver-Id": context.driverId } : {}),
        ...(context.phone ? { "X-Dev-Phone": context.phone } : {}),
        ...(headers || {})
      },
      ...(hasBody ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {})
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[apiClient] network_error", path, error?.message || error);
    }
    throw new ApiError("Unable to reach the local Backend API.", 0, { cause: error?.message }, "network_error");
  }

  const payload = await parseResponse(response).catch(() => null);
  if (!response.ok) {
    const kind = classifyApiError(response.status);
    const message = payload?.message || payload?.messageAr || payload?.error || `API ${response.status}`;
    if (import.meta.env.DEV) {
      console.warn("[apiClient]", kind, response.status, path, payload);
    }
    throw new ApiError(message, response.status, payload, kind);
  }

  return payload;
}

export function apiGet(path, options = {}) {
  return apiRequest(path, { ...options, method: "GET" });
}

export function apiPost(path, body, options = {}) {
  return apiRequest(path, { ...options, method: "POST", body });
}

export function apiPatch(path, body, options = {}) {
  return apiRequest(path, { ...options, method: "PATCH", body });
}

export function apiDelete(path, options = {}) {
  return apiRequest(path, { ...options, method: "DELETE" });
}
