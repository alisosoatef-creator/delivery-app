import { fallbackCities, fallbackDrivers, NABLUS_CENTER } from "../utils/constants.js";
import { statusText } from "../utils/i18n.js";

export const initialState = {
  language: "ar",
  role: "customer",
  session: null,
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
  quote: { fareIls: 24, distanceKm: 5.8, etaMinutes: 7 },
  customerLocation: { ...NABLUS_CENTER },
  locationStatus: "default",
  driverOnline: false,
  admin: { activeRides: 3, onlineDrivers: 2, todayRevenueIls: 83, recentRides: [] },
  backendLive: false,
  liveTicks: 0,
  toast: ""
};

export function reducer(state, action) {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch };
    case "bootstrap":
      return {
        ...state,
        backendLive: true,
        cities: action.payload.cities,
        drivers: action.payload.drivers,
        admin: action.payload.admin
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
      return { ...state, ride: action.payload.ride, toast: statusText[state.language][action.payload.ride.status] };
    case "toast":
      return { ...state, toast: action.message };
    default:
      return state;
  }
}
