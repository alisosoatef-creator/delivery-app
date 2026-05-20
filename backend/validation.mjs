export const ADMIN_ROLES = new Set(["owner", "admin", "support"]);
export const APP_ROLES = new Set(["guest", "customer", "driver", "owner", "admin", "support"]);
export const PAYMENT_METHODS = new Set(["cash", "visa", "visa-placeholder", "wallet"]);
export const PAYMENT_STATUSES = new Set(["pending", "paid", "failed", "refunded"]);
export const ACCOUNT_STATUSES = new Set(["active", "suspended"]);
export const SUPPORT_STATUSES = new Set(["open", "closed"]);
export const RIDE_STATUSES = new Set([
  "draft",
  "searching",
  "accepted",
  "driver_arriving",
  "arrived",
  "in_progress",
  "completed",
  "cancelled"
]);

export function cleanString(value, maxLength = 240) {
  return String(value || "").trim().slice(0, maxLength);
}

export function isNonEmpty(value) {
  return cleanString(value).length > 0;
}

export function isPhoneLike(value) {
  const phone = cleanString(value, 40);
  return /^\+?[0-9\s-]{7,20}$/.test(phone);
}

export function isReasonableAge(value) {
  const age = Number(value);
  return Number.isInteger(age) && age >= 16 && age <= 85;
}

export function isFiniteNumber(value, { min = -Infinity, max = Infinity } = {}) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}

export function isAllowedStatus(status, allowedSet) {
  return allowedSet.has(cleanString(status, 80));
}

export function requiredFields(body, fields) {
  return fields.filter((field) => !isNonEmpty(body?.[field]));
}

export function requireValidPhone(body, field = "phone") {
  return !body?.[field] || isPhoneLike(body[field]);
}

export function hasOnlyAllowedRole(role, allowedSet = APP_ROLES) {
  return allowedSet.has(cleanString(role, 80));
}

export function normalizePaymentMethod(method) {
  const value = cleanString(method, 40);
  return value === "visa-placeholder" ? "visa" : value;
}
