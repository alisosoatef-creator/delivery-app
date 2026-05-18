export const cities = [
  { id: "nablus", ar: "نابلس", en: "Nablus", demand: 82, baseFare: 12 },
  { id: "ramallah", ar: "رام الله", en: "Ramallah", demand: 91, baseFare: 14 },
  { id: "jenin", ar: "جنين", en: "Jenin", demand: 64, baseFare: 11 },
  { id: "qalqilya", ar: "قلقيلية", en: "Qalqilya", demand: 48, baseFare: 10 },
  { id: "hebron", ar: "الخليل", en: "Hebron", demand: 76, baseFare: 13 },
  { id: "bethlehem", ar: "بيت لحم", en: "Bethlehem", demand: 58, baseFare: 12 },
  { id: "tulkarm", ar: "طولكرم", en: "Tulkarm", demand: 55, baseFare: 11 },
  { id: "jericho", ar: "أريحا", en: "Jericho", demand: 42, baseFare: 10 },
  { id: "salfit", ar: "سلفيت", en: "Salfit", demand: 34, baseFare: 10 },
  { id: "tubas", ar: "طوباس", en: "Tubas", demand: 29, baseFare: 9 },
  { id: "albireh", ar: "البيرة", en: "Al-Bireh", demand: 73, baseFare: 12 }
];

export const drivers = [
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
  },
  {
    id: "drv_maha",
    nameAr: "مها خليل",
    nameEn: "Maha Khalil",
    cityId: "ramallah",
    vehicle: "Toyota Corolla",
    plate: "73-1180",
    rating: 4.7,
    online: true,
    distanceKm: 1.8,
    etaMinutes: 5,
    lat: 31.903,
    lng: 35.203
  }
];

export const adminRides = [
  { id: "ride_1048", cityId: "nablus", status: "arriving", fareIls: 24, driverId: "drv_ahmad" },
  { id: "ride_1049", cityId: "ramallah", status: "searching", fareIls: 31, driverId: null },
  { id: "ride_1050", cityId: "hebron", status: "picked_up", fareIls: 28, driverId: "drv_laith" }
];

export const users = [];

export const captainApplications = [];

export const approvedCaptains = [];

export const customers = [
  { id: "cust_001", fullName: "Lian Samara", phone: "+970 59 111 2200", cityId: "nablus", trips: 18, status: "active" },
  { id: "cust_002", fullName: "Omar Khalil", phone: "+970 59 221 3100", cityId: "ramallah", trips: 9, status: "active" },
  { id: "cust_003", fullName: "Sara Odeh", phone: "+970 59 411 8800", cityId: "hebron", trips: 4, status: "suspended" }
];

export const supportTickets = [
  {
    id: "support_001",
    userName: "Lian Samara",
    type: "captain_delay",
    message: "Captain was later than the estimated arrival.",
    status: "open",
    createdAt: "2026-05-18T08:20:00.000Z"
  },
  {
    id: "support_002",
    userName: "Omar Khalil",
    type: "payment",
    message: "VISA is still a placeholder in this build.",
    status: "open",
    createdAt: "2026-05-18T09:05:00.000Z"
  }
];

export const pricingRules = cities.map((city) => ({
  id: `pricing_${city.id}`,
  cityId: city.id,
  baseFareIls: city.baseFare,
  perKmIls: 3,
  minimumFareIls: city.baseFare + 4,
  updatedAt: "2026-05-18T00:00:00.000Z"
}));

export const systemSettings = {
  appName: "Wasel",
  appStatus: "active",
  adminSupportPhone: "+970 59 000 1111",
  welcomeMessage: "Welcome to Wasel",
  notificationsPlaceholder: true
};
