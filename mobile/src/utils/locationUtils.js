import { getCityCenter } from "./westBankCities";

function toRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

export function haversineKm(pointA, pointB) {
  if (!pointA || !pointB) return 0;
  const earthRadiusKm = 6371;
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const latA = toRadians(pointA.lat);
  const latB = toRadians(pointB.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(latA) * Math.cos(latB) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Number((earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
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
