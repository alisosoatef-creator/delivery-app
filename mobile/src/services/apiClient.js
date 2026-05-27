import { appConfig, normalizeApiPath } from "../config/appConfig";

export class ApiError extends Error {
  constructor(message, status = 0, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.code = payload?.error || payload?.code || "";
    this.kind = classifyApiError(status);
  }
}

export function classifyApiError(status) {
  if (!status) return "network_error";
  if (status === 401 || status === 403) return "auth_error";
  if (status === 404) return "not_found";
  if (status === 400 || status === 422) return "validation_error";
  if (status >= 500) return "server_error";
  return "api_error";
}

function fallbackMessage(status, payload = null) {
  if (!status) return "لا يمكن الاتصال بالخادم حاليًا. تحقق من الشبكة و API URL.";
  if (status === 401 || status === 403) return payload?.messageAr || payload?.message || "انتهت الجلسة أو لا تملك صلاحية لهذا الطلب.";
  if (status === 404) return "العنصر المطلوب غير موجود.";
  if (status === 400 || status === 422) return payload?.messageAr || "تحقق من البيانات المدخلة.";
  if (status >= 500) return "حدث خطأ في الخادم. حاول لاحقًا.";
  return payload?.messageAr || payload?.message || payload?.error || `API ${status}`;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text ? { message: text } : null;
}

export async function apiRequest(path, { method = "GET", body, token = "", role = "", driverId = "", phone = "", userId = "", customerId = "", headers = {} } = {}) {
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
        ...(userId ? { "X-Dev-User-Id": userId } : {}),
        ...(customerId ? { "X-Dev-Customer-Id": customerId } : {}),
        ...(driverId ? { "X-Dev-Driver-Id": driverId } : {}),
        ...(phone ? { "X-Dev-Phone": phone } : {}),
        ...headers
      },
      ...(hasBody ? { body: JSON.stringify(body) } : {})
    });
  } catch (error) {
    throw new ApiError(fallbackMessage(0), 0, { cause: error?.message });
  }

  const payload = await parseResponse(response).catch(() => null);
  if (!response.ok) {
    const message = response.status === 401 || response.status === 403
      ? fallbackMessage(response.status, payload)
      : payload?.messageAr || payload?.message || payload?.error || fallbackMessage(response.status, payload);
    throw new ApiError(message, response.status, payload);
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
