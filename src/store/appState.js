import { fallbackCities, fallbackDrivers, NABLUS_CENTER } from "../utils/constants.js";
import { statusText } from "../utils/i18n.js";

export const initialState = {
  language: "ar",
  role: "guest",
  session: null,
  currentUser: null,
  authStatus: "guest",
  token: "",
  otpRequestId: null,
  phone: "+970 59 000 0000",
  otp: "1234",
  cityId: "nablus",
  pickup: "جامعة النجاح - نابلس",
  dropoff: "رفيديا - نابلس",
  paymentMethod: "cash",
  visaCardReady: false,
  visaCardPreview: "",
  saveVisaCardDemo: false,
  profileAvatar: "",
  savedAddresses: { home: "", work: "", university: "" },
  notificationsEnabled: true,
  themeMode: "system",
  cities: fallbackCities,
  drivers: fallbackDrivers,
  selectedDriverId: "drv_ahmad",
  ride: null,
  customerRides: [],
  rideRequestStatus: "idle",
  rideRequestError: "",
  quote: { fareIls: 24, distanceKm: 5.8, etaMinutes: 7 },
  customerLocation: { ...NABLUS_CENTER },
  pickupLocation: null,
  destinationLocation: null,
  routeInfo: null,
  routeStatus: "idle",
  routeError: "",
  locationStatus: "default",
  driverOnline: false,
  pendingCaptainApplications: [],
  approvedCaptains: [],
  adminStats: {
    customers: 3,
    captains: fallbackDrivers.length,
    pendingCaptainApplications: 0,
    todayRides: 3,
    activeRides: 3,
    estimatedRevenueIls: 83,
    openSupportTickets: 2
  },
  supportTickets: [
    {
      id: "support_001",
      userName: "ليان سمارة",
      type: "تأخير كابتن",
      message: "الكابتن تأخر عن موعد الوصول المتوقع.",
      status: "open",
      createdAt: "2026-05-18T08:20:00.000Z"
    },
    {
      id: "support_002",
      userName: "Omar Khalil",
      type: "Payment",
      message: "VISA payment is still a placeholder in this build.",
      status: "open",
      createdAt: "2026-05-18T09:05:00.000Z"
    },
    {
      id: "support_003",
      userName: "سارة عودة",
      type: "تحديث بيانات",
      message: "طلب تعديل رقم الهاتف.",
      status: "closed",
      createdAt: "2026-05-17T16:30:00.000Z"
    }
  ],
  pricingRules: fallbackCities.map((city) => ({
    id: `pricing_${city.id}`,
    cityId: city.id,
    baseFareIls: city.baseFare,
    perKmIls: 3,
    minimumFareIls: city.baseFare + 4,
    updatedAt: "2026-05-18T00:00:00.000Z"
  })),
  systemSettings: {
    appName: "Wasel",
    appStatus: "active",
    adminSupportPhone: "+970 59 000 1111",
    welcomeMessage: "أهلًا بك في وصل"
  },
  admin: { activeRides: 3, onlineDrivers: 2, todayRevenueIls: 83, recentRides: [] },
  backendLive: false,
  liveTicks: 0,
  toast: ""
};

function mergeCities(localCities, backendCities = []) {
  const merged = new Map(localCities.map((city) => [city.id, city]));
  for (const city of backendCities) {
    if (city?.id) merged.set(city.id, { ...(merged.get(city.id) || {}), ...city });
  }
  return [...merged.values()];
}

export function reducer(state, action) {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch };
    case "bootstrap":
      return {
        ...state,
        backendLive: true,
        cities: mergeCities(fallbackCities, action.payload.cities || state.cities),
        drivers: action.payload.drivers || state.drivers,
        pricingRules: action.payload.pricingRules || state.pricingRules,
        systemSettings: action.payload.settings || state.systemSettings,
        admin: action.payload.admin || state.admin
      };
    case "driverLocation":
      return {
        ...state,
        liveTicks: state.liveTicks + 1,
        drivers: state.drivers.map((driver) =>
          driver.id === action.payload.driverId
            ? { ...driver, lat: action.payload.lat, lng: action.payload.lng }
            : driver
        )
      };
    case "rideStatus":
      return {
        ...state,
        ride: state.ride?.id === action.payload.ride.id ? action.payload.ride : state.ride,
        selectedDriverId: action.payload.ride.driverId || state.selectedDriverId,
        customerRides: (state.customerRides || []).map((ride) =>
          ride.id === action.payload.ride.id ? action.payload.ride : ride
        ),
        toast: statusText[state.language][action.payload.ride.status] || ""
      };
    case "toast":
      return { ...state, toast: action.message };
    default:
      return state;
  }
}
