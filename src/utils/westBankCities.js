export const WEST_BANK_CITIES = [
  { id: "nablus", ar: "نابلس", en: "Nablus", lat: 32.2211, lng: 35.2544, demand: 82, baseFare: 12, zoom: 14 },
  { id: "ramallah", ar: "رام الله", en: "Ramallah", lat: 31.9038, lng: 35.2034, demand: 91, baseFare: 14, zoom: 14 },
  { id: "hebron", ar: "الخليل", en: "Hebron", lat: 31.5326, lng: 35.0998, demand: 76, baseFare: 13, zoom: 14 },
  { id: "jenin", ar: "جنين", en: "Jenin", lat: 32.4594, lng: 35.3009, demand: 64, baseFare: 11, zoom: 14 },
  { id: "tulkarm", ar: "طولكرم", en: "Tulkarm", lat: 32.3104, lng: 35.0286, demand: 58, baseFare: 11, zoom: 14 },
  { id: "bethlehem", ar: "بيت لحم", en: "Bethlehem", lat: 31.7054, lng: 35.2024, demand: 58, baseFare: 12, zoom: 14 },
  { id: "qalqilya", ar: "قلقيلية", en: "Qalqilya", lat: 32.196, lng: 34.9812, demand: 48, baseFare: 10, zoom: 14 },
  { id: "jericho", ar: "أريحا", en: "Jericho", lat: 31.856, lng: 35.4689, demand: 45, baseFare: 10, zoom: 14 },
  { id: "salfit", ar: "سلفيت", en: "Salfit", lat: 32.0837, lng: 35.1808, demand: 42, baseFare: 10, zoom: 14 },
  { id: "tubas", ar: "طوباس", en: "Tubas", lat: 32.3209, lng: 35.3699, demand: 40, baseFare: 10, zoom: 14 }
];

export function getWestBankCity(cityId = "nablus") {
  return WEST_BANK_CITIES.find((city) => city.id === cityId) || WEST_BANK_CITIES[0];
}

export function getWestBankCityCenter(cityId = "nablus") {
  const city = getWestBankCity(cityId);
  return { lat: city.lat, lng: city.lng, zoom: city.zoom, id: city.id, ar: city.ar, en: city.en };
}

export function westBankCityName(cityId, isArabic) {
  const city = getWestBankCity(cityId);
  return isArabic ? city.ar : city.en;
}
