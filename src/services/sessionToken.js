const TOKEN_KEY = "wasel.dev.sessionToken";
const ROLE_KEY = "wasel.dev.sessionRole";
const CONTEXT_KEY = "wasel.dev.sessionContext";

export function setSessionToken(token, role = "", context = {}) {
  const safeToken = String(token || "");
  if (!safeToken) {
    clearSessionToken();
    return;
  }
  localStorage.setItem(TOKEN_KEY, safeToken);
  if (role) localStorage.setItem(ROLE_KEY, String(role));
  const safeContext = {
    userId: context.userId || context.id || "",
    customerId: context.customerId || "",
    driverId: context.driverId || "",
    phone: context.phone || ""
  };
  if (Object.values(safeContext).some(Boolean)) {
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(safeContext));
  } else {
    localStorage.removeItem(CONTEXT_KEY);
  }
}

export function getSessionToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getSessionRole() {
  return localStorage.getItem(ROLE_KEY) || "";
}

export function getSessionContext() {
  try {
    return JSON.parse(localStorage.getItem(CONTEXT_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function clearSessionToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(CONTEXT_KEY);
}
