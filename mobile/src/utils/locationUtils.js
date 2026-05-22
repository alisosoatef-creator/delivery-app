import { getCityCenter } from "./westBankCities";

function toRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

export function isValidCoordinate(point) {
  if (!point) return false;
  const lat = Number(point.lat ?? point.latitude);
  const lng = Number(point.lng ?? point.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function normalizeCoordinate(point) {
  if (!isValidCoordinate(point)) return null;
  const lat = Number(point.lat ?? point.latitude);
  const lng = Number(point.lng ?? point.longitude);
  return { ...point, lat, lng, latitude: lat, longitude: lng };
}

export function haversineKm(pointA, pointB) {
  const aPoint = normalizeCoordinate(pointA);
  const bPoint = normalizeCoordinate(pointB);
  if (!aPoint || !bPoint) return 0;
  const earthRadiusKm = 6371;
  const dLat = toRadians(bPoint.lat - aPoint.lat);
  const dLng = toRadians(bPoint.lng - aPoint.lng);
  const latA = toRadians(aPoint.lat);
  const latB = toRadians(bPoint.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(latA) * Math.cos(latB) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Number((earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}

export function safeDistanceKm(pointA, pointB) {
  return isValidCoordinate(pointA) && isValidCoordinate(pointB) ? haversineKm(pointA, pointB) : 0;
}

export function pointFromCity(cityId) {
  const city = getCityCenter(cityId);
  return {
    label: `مركز ${city.arName}`,
    cityId: city.id,
    lat: city.lat,
    lng: city.lng,
    source: "city-fallback"
  };
}

export function pointFromPlace(place) {
  if (!place) return null;
  return {
    label: place.label,
    cityId: place.city || place.cityId,
    lat: Number(place.lat),
    lng: Number(place.lng),
    category: place.category || "place",
    source: "place-search"
  };
}
