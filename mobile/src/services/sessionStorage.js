import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "wasel_mobile_session_v1";
let memorySession = null;

async function secureStoreAvailable() {
  try {
    return Boolean(await SecureStore.isAvailableAsync());
  } catch {
    return false;
  }
}

function sanitizeSession(session = {}) {
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

export async function saveMobileSession(session = {}) {
  const clean = sanitizeSession(session);
  const serialized = JSON.stringify(clean);
  memorySession = clean;
  if (await secureStoreAvailable()) {
    await SecureStore.setItemAsync(SESSION_KEY, serialized);
  }
  return clean;
}

export async function loadMobileSession() {
  if (await secureStoreAvailable()) {
    const value = await SecureStore.getItemAsync(SESSION_KEY);
    if (!value) return null;
    try {
      return sanitizeSession(JSON.parse(value));
    } catch {
      await clearMobileSession();
      return null;
    }
  }
  return memorySession;
}

export async function clearMobileSession() {
  memorySession = null;
  if (await secureStoreAvailable()) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
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
