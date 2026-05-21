import { appConfig, normalizeApiPath } from "../config/appConfig";

export class ApiError extends Error {
  constructor(message, status = 0, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.code = payload?.error || payload?.code || "";
    this.kind = !status ? "network_error" : status === 401 || status === 403 ? "auth_error" : status >= 500 ? "server_error" : "api_error";
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text ? { message: text } : null;
}

export async function apiRequest(path, { method = "GET", body, token = "", role = "", driverId = "", phone = "", headers = {} } = {}) {
  const url = `${appConfig.apiBaseUrl}${normalizeApiPath(path)}`;
  const hasBody = typeof body !== "undefined";
  let response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(role ? { "X-Dev-Role": role } : {}),
        ...(driverId ? { "X-Dev-Driver-Id": driverId } : {}),
        ...(phone ? { "X-Dev-Phone": phone } : {}),
        ...headers
      },
      ...(hasBody ? { body: JSON.stringify(body) } : {})
    });
  } catch (error) {
    throw new ApiError("تعذر الاتصال بالـ Backend المحلي. تحقق من API URL والشبكة.", 0, { cause: error?.message });
  }

  const payload = await parseResponse(response).catch(() => null);
  if (!response.ok) {
    throw new ApiError(payload?.messageAr || payload?.message || payload?.error || `API ${response.status}`, response.status, payload);
  }
  return payload;
}

export function apiGet(path, options) {
  return apiRequest(path, { ...options, method: "GET" });
}

export function apiPost(path, body, options) {
  return apiRequest(path, { ...options, method: "POST", body });
}

export function apiPatch(path, body, options) {
  return apiRequest(path, { ...options, method: "PATCH", body });
}
