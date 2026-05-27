import { apiGet, apiPatch, apiPost } from "./apiClient.js";
import { getSessionContext } from "./sessionToken.js";

function driverContextHeaders({ driverId = "", phone = "", token = "", role = "driver", userId = "" } = {}) {
  const context = getSessionContext();
  const safeDriverId = driverId || context.driverId || "";
  const safePhone = phone || context.phone || "";
  const safeUserId = userId || context.userId || "";
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(role ? { "X-Dev-Role": role } : {}),
    ...(safeUserId ? { "X-Dev-User-Id": safeUserId } : {}),
    ...(safeDriverId ? { "X-Dev-Driver-Id": safeDriverId } : {}),
    ...(safePhone ? { "X-Dev-Phone": safePhone } : {})
  };
}

export async function fetchDriverDevDrivers() {
  const payload = await apiGet("/driver/dev-drivers");
  return payload?.drivers || [];
}

export function driverDevLogin(payload) {
  return apiPost("/driver/dev-login", payload);
}

export async function fetchAvailableDriverRides({ cityId = "", driverId = "", phone = "", token = "", role = "driver", userId = "" } = {}) {
  const params = new URLSearchParams();
  if (cityId) params.set("cityId", cityId);
  const query = params.toString();
  const payload = await apiGet(`/driver/available-rides${query ? `?${query}` : ""}`, {
    headers: driverContextHeaders({ driverId, phone, token, role, userId })
  });
  return {
    rides: payload?.rides || [],
    driver: payload?.driver || null,
    availableStatus: payload?.availableStatus || "ok",
    dispatchReason: payload?.dispatchReason || "",
    dispatchSort: payload?.dispatchSort || "",
    activeRide: payload?.activeRide || null
  };
}

export async function fetchDriverRides({ driverId = "", phone = "", token = "", role = "driver", userId = "" } = {}) {
  const params = new URLSearchParams();
  if (driverId) params.set("driverId", driverId);
  if (phone) params.set("phone", phone);
  const query = params.toString();
  const payload = await apiGet(`/driver/my-rides${query ? `?${query}` : ""}`, {
    headers: driverContextHeaders({ driverId, phone, token, role, userId })
  });
  return {
    rides: payload?.rides || [],
    driver: payload?.driver || null,
    myRidesStatus: payload?.myRidesStatus || "ok"
  };
}

export function acceptDriverRide({ rideId, driverId, phone = "", token = "", role = "driver", userId = "" }) {
  return apiPatch(`/rides/${rideId}/accept`, { driverId }, {
    headers: driverContextHeaders({ driverId, phone, token, role, userId })
  });
}

export function updateDriverRideStatus({ rideId, driverId, status, phone = "", token = "", role = "driver", userId = "" }) {
  return apiPatch(`/driver/rides/${rideId}/status`, { driverId, status }, {
    headers: driverContextHeaders({ driverId, phone, token, role, userId })
  });
}

export function updateDriverOnlineStatus({ driverId, online, phone = "", token = "", role = "driver", userId = "" }) {
  return apiPost("/drivers/status", { driverId, online }, {
    headers: driverContextHeaders({ driverId, phone, token, role, userId })
  });
}
