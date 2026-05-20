const TOKEN_KEY = "wasel.dev.sessionToken";
const ROLE_KEY = "wasel.dev.sessionRole";

export function setSessionToken(token, role = "") {
  const safeToken = String(token || "");
  if (!safeToken) {
    clearSessionToken();
    return;
  }
  localStorage.setItem(TOKEN_KEY, safeToken);
  if (role) localStorage.setItem(ROLE_KEY, String(role));
}

export function getSessionToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getSessionRole() {
  return localStorage.getItem(ROLE_KEY) || "";
}

export function clearSessionToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}
