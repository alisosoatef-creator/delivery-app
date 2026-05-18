import { WEST_BANK_CITIES } from "./westBankCities.js";

export const fallbackCities = WEST_BANK_CITIES.map(({ id, ar, en, demand, baseFare }) => ({ id, ar, en, demand, baseFare }));

export const fallbackDrivers = [
  {
    id: "drv_ahmad",
    nameAr: "أحمد ناصر",
    nameEn: "Ahmad Naser",
    cityId: "nablus",
    vehicle: "Hyundai Ioniq",
    plate: "12-3847",
    rating: 4.9,
    online: true,
    distanceKm: 1.2,
    etaMinutes: 4,
    lat: 32.222,
    lng: 35.262
  },
  {
    id: "drv_laith",
    nameAr: "ليث عودة",
    nameEn: "Laith Odeh",
    cityId: "nablus",
    vehicle: "Kia Niro",
    plate: "45-9021",
    rating: 4.8,
    online: true,
    distanceKm: 2.1,
    etaMinutes: 6,
    lat: 32.216,
    lng: 35.271
  }
];

export const NABLUS_CENTER = { lat: 32.2211, lng: 35.2544 };

export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_ATTRIBUTION = "&copy; OpenStreetMap contributors";
