import { getSessionRole, getSessionToken } from "./sessionToken.js";

export const API_BASE = "/api";

export class ApiError extends Error {
  constructor(message, status = 0, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
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

export async function apiRequest(path, options = {}) {
  const { body, headers, ...requestOptions } = options;
  const hasBody = typeof body !== "undefined";
  const token = getSessionToken();
  const role = getSessionRole();

  let response;
  try {
    response = await fetch(`${API_BASE}${normalizePath(path)}`, {
      ...requestOptions,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(role ? { "X-Dev-Role": role } : {}),
        ...(headers || {})
      },
      ...(hasBody ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {})
    });
  } catch (error) {
    throw new ApiError("Unable to reach the local Backend API.", 0, { cause: error?.message });
  }

  const payload = await parseResponse(response).catch(() => null);
  if (!response.ok) {
    throw new ApiError(payload?.message || payload?.error || `API ${response.status}`, response.status, payload);
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
