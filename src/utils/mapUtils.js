import { NABLUS_CENTER } from "./constants.js";
import { getWestBankCityCenter } from "./westBankCities.js";



export function toCoordinate(value) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

export function normalizeLocation(location, fallback = NABLUS_CENTER) {
  const lat = toCoordinate(location?.lat);
  const lng = toCoordinate(location?.lng);
  if (lat === null || lng === null) return fallback;
  return { lat, lng };
}

export function customerLocationFromState(state) {
  return normalizeLocation(state.customerLocation, getWestBankCityCenter(state.cityId));
}

export function pickupLocationFromState(state) {
  return normalizeLocation(state.pickupLocation, null);
}

export function destinationLocationFromState(state) {
  return normalizeLocation(state.destinationLocation, null);
}

export function driverLocationFromDriver(driver) {
  const lat = toCoordinate(driver?.lat);
  const lng = toCoordinate(driver?.lng);
  if (lat === null || lng === null) return null;
  return { lat, lng };
}

export function haversineKm(from, to) {
  if (!from || !to) return null;
  const earthRadiusKm = 6371;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) ** 2;
  const distance = 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(distance * 10) / 10;
}

export function estimatePickupDestinationDistance(stateOrPickup, destination) {
  const pickup = destination ? normalizeLocation(stateOrPickup, null) : pickupLocationFromState(stateOrPickup);
  const dropoff = destination ? normalizeLocation(destination, null) : destinationLocationFromState(stateOrPickup);
  return pickup && dropoff ? haversineKm(pickup, dropoff) : null;
}

export function formatDistanceKm(distance) {
  const value = Number(distance);
  if (!Number.isFinite(value)) return "";
  return value < 10 ? value.toFixed(1) : String(Math.round(value));
}

export function mapLocationCopy(locationStatus, isArabic) {
  if (locationStatus === "granted") {
    return isArabic ? "تم تحديد موقعك الحالي عبر GPS" : "Your current GPS location is active";
  }
  if (locationStatus === "requesting") {
    return isArabic ? "نطلب إذن الموقع لتحديد نقطة الانطلاق بدقة" : "Requesting location permission for a better pickup";
  }
  if (locationStatus === "denied") {
    return isArabic ? "استخدمنا موقعًا افتراضيًا في نابلس بعد رفض صلاحية الموقع" : "Using a default Nablus location after location permission was denied";
  }
  if (locationStatus === "unsupported") {
    return isArabic ? "المتصفح لا يدعم تحديد الموقع، لذلك نستخدم نابلس افتراضيًا" : "This browser does not support location, so Nablus is used by default";
  }
  return isArabic ? "الخريطة تبدأ من نابلس ويمكنك السماح بالموقع لتحسين الدقة" : "The map starts in Nablus; allow location for better accuracy";
}

export function safeMapLabel(label) {
  return String(label || "")
    .slice(0, 3)
    .replace(/[<>&"']/g, "");
}
