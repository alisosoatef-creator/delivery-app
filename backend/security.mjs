import { ADMIN_ROLES } from "./validation.mjs";

const DEV_ORIGINS = new Set([
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
  "http://localhost:4173"
]);

const rateBuckets = new Map();

export function securityHeaders(request = null, extra = {}) {
  const origin = request?.headers?.origin || "";
  // TODO production-cors: replace the fallback with the exact deployed frontend origin.
  const allowOrigin = DEV_ORIGINS.has(origin) ? origin : process.env.NODE_ENV === "production" ? "null" : "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Dev-Role",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Max-Age": "600",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
    ...extra
  };
}

export function getBearerToken(request) {
  const header = request?.headers?.authorization || "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
}

export function devSessionFromRequest(request) {
  const token = getBearerToken(request);
  const devRole = String(request?.headers?.["x-dev-role"] || "").trim();
  if (token.startsWith("dev-admin-session-token")) return { token, role: "admin", dev: true };
  if (token.startsWith("dev-driver-session-token")) return { token, role: "driver", dev: true };
  if (token.startsWith("dev-session-token") || token.startsWith("demo_")) return { token, role: devRole || "customer", dev: true };
  return { token, role: devRole || "", dev: false };
}

export function requireAuthDev(request) {
  // TODO production-auth: replace dev token prefixes with signed sessions/JWT and server-side revocation.
  const session = devSessionFromRequest(request);
  return process.env.NODE_ENV !== "production" || Boolean(session.token);
}

export function requireAdminDev(request, allowedRoles = ADMIN_ROLES) {
  // Soft mode: development keeps old local workflows and api:check stable; production requires admin-like token context.
  const session = devSessionFromRequest(request);
  if (process.env.NODE_ENV !== "production" && (!session.token || ADMIN_ROLES.has(session.role))) return true;
  return Boolean(session.token) && allowedRoles.has(session.role);
}

export function requireDriverDev(request) {
  const session = devSessionFromRequest(request);
  if (process.env.NODE_ENV !== "production" && (!session.token || session.role === "driver")) return true;
  return Boolean(session.token) && session.role === "driver";
}

export function requireCustomerDev(request) {
  const session = devSessionFromRequest(request);
  if (process.env.NODE_ENV !== "production" && (!session.token || ["customer", "admin", "owner", "support"].includes(session.role))) return true;
  return Boolean(session.token) && ["customer", "admin", "owner", "support"].includes(session.role);
}

export function checkRateLimit(request, key, { limit = 20, windowMs = 60_000 } = {}) {
  // TODO production-rate-limit: replace in-memory limits with distributed store if the API is scaled horizontally.
  const ip = request?.socket?.remoteAddress || "local";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const current = rateBuckets.get(bucketKey) || { count: 0, resetAt: now + windowMs };
  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }
  current.count += 1;
  rateBuckets.set(bucketKey, current);
  return {
    ok: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt
  };
}
