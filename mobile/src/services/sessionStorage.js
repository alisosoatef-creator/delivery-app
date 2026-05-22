import * as SecureStore from "expo-secure-store";
import { devLogStartup } from "../utils/startupDiagnostics";

const SESSION_KEY = "wasel_mobile_session_v1";
let memorySession = null;

async function secureStoreAvailable() {
  try {
    return Boolean(SecureStore?.isAvailableAsync && await SecureStore.isAvailableAsync());
  } catch (error) {
    devLogStartup("secure store unavailable", { reason: error?.message });
    return false;
  }
}

export function sanitizeSession(session = {}) {
  const role = session.role || session.user?.role || "customer";
  const currentUser = session.currentUser || session.user || null;
  const driverSession = session.driverSession || session.driver || session.session?.driver || null;
  const token = session.token || session.session?.token || "";

  return {
    token,
    role,
    currentUser,
    session: session.session || currentUser || null,
    driverSession,
    phone: session.phone || currentUser?.phone || driverSession?.phone || "",
    userId: session.userId || currentUser?.id || "",
    driverId: session.driverId || currentUser?.driverId || driverSession?.id || ""
  };
}

export function isValidMobileSession(session = null) {
  if (!session || typeof session !== "object") return false;
  if (!session.token || !session.role) return false;
  if (!["customer", "driver"].includes(session.role)) return false;
  if (session.role === "driver") return Boolean(session.driverId && session.phone);
  return Boolean(session.currentUser?.id || session.userId || session.phone);
}

export async function saveMobileSession(session = {}) {
  const clean = sanitizeSession(session);
  if (!isValidMobileSession(clean)) {
    devLogStartup("session save skipped", { role: clean.role, reason: "invalid-session" });
    return null;
  }
  const serialized = JSON.stringify(clean);
  memorySession = clean;
  if (await secureStoreAvailable()) {
    await SecureStore.setItemAsync(SESSION_KEY, serialized);
  }
  devLogStartup("secure store save completed", { role: clean.role });
  return clean;
}

export async function loadMobileSession() {
  devLogStartup("secure store load started");
  if (await secureStoreAvailable()) {
    const value = await SecureStore.getItemAsync(SESSION_KEY);
    if (!value) {
      devLogStartup("secure store load completed", { restored: false });
      return null;
    }
    try {
      const session = sanitizeSession(JSON.parse(value));
      if (!isValidMobileSession(session)) {
        await clearMobileSession();
        devLogStartup("secure store load completed", { restored: false, reason: "invalid-session" });
        return null;
      }
      devLogStartup("secure store load completed", { restored: true, role: session.role });
      return session;
    } catch (error) {
      await clearMobileSession();
      devLogStartup("secure store load completed", { restored: false, reason: error?.message || "parse-error" });
      return null;
    }
  }
  const fallback = isValidMobileSession(memorySession) ? memorySession : null;
  devLogStartup("secure store load completed", { restored: Boolean(fallback), source: "memory" });
  return fallback;
}

export async function clearMobileSession() {
  memorySession = null;
  if (await secureStoreAvailable()) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
  devLogStartup("secure store cleared");
}

export function saveDriverSession({ token = "", user = {}, driver = {} } = {}) {
  return saveMobileSession({
    token,
    role: "driver",
    currentUser: { ...user, driverId: driver.id, phone: driver.phone, fullName: driver.fullName },
    session: { ...user, token, driver, driverId: driver.id, phone: driver.phone },
    driverSession: driver,
    driverId: driver.id,
    phone: driver.phone,
    userId: user.id
  });
}

export async function loadDriverSession() {
  const session = await loadMobileSession();
  return session?.role === "driver" ? session : null;
}
