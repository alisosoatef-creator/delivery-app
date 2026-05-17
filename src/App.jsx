import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = "";

const fallbackCities = [
  { id: "nablus", ar: "نابلس", en: "Nablus", demand: 82, baseFare: 12 },
  { id: "ramallah", ar: "رام الله", en: "Ramallah", demand: 91, baseFare: 14 },
  { id: "jenin", ar: "جنين", en: "Jenin", demand: 64, baseFare: 11 },
  { id: "qalqilya", ar: "قلقيلية", en: "Qalqilya", demand: 48, baseFare: 10 },
  { id: "hebron", ar: "الخليل", en: "Hebron", demand: 76, baseFare: 13 },
  { id: "bethlehem", ar: "بيت لحم", en: "Bethlehem", demand: 58, baseFare: 12 }
];

const fallbackDrivers = [
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

const NABLUS_CENTER = { lat: 32.2211, lng: 35.2544 };
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = "&copy; OpenStreetMap contributors";

const text = {
  ar: {
    brand: "واصل",
    tagline: "توصيل ذكي في مدن الضفة",
    headline: "تطبيق واحد للزبون والسائق والإدارة",
    subhead: "نسخة React + Node محلية: OTP، مطابقة سائق، سعر بالشيكل، تتبع حي، محفظة، وتنبيهات.",
    customer: "زبون",
    driver: "دلفري",
    admin: "إدارة",
    phone: "رقم الهاتف",
    otp: "رمز OTP",
    city: "المدينة",
    login: "دخول",
    requestOtp: "إرسال رمز",
    demoCode: "رمز التجربة 1234",
    dashboard: "لوحة التحكم",
    requestRide: "طلب مشوار",
    pickup: "نقطة الاستلام",
    dropoff: "نقطة التسليم",
    payment: "طريقة الدفع",
    cash: "كاش",
    wallet: "محفظة",
    visa: "VISA",
    nearbyDrivers: "السائقين القريبين",
    activeRide: "الطلب الحالي",
    noRide: "لا يوجد طلب فعال الآن",
    fare: "السعر",
    distance: "المسافة",
    eta: "وقت الوصول",
    rating: "التقييم",
    online: "أونلاين",
    offline: "أوفلاين",
    goOnline: "ابدأ الشغل",
    goOffline: "إيقاف الشغل",
    acceptRide: "قبول الطلب",
    completeRide: "إنهاء الرحلة",
    adminPanel: "لوحة الإدارة",
    activeRides: "طلبات فعالة",
    onlineDrivers: "سائقين أونلاين",
    revenue: "إيراد اليوم",
    notifications: "التنبيهات",
    language: "EN",
    logout: "خروج",
    backendLive: "Backend متصل",
    backendOffline: "وضع محلي",
    status: "الحالة"
  },
  en: {
    brand: "Wasel",
    tagline: "Smart rides across West Bank cities",
    headline: "One app for customers, drivers, and admins",
    subhead: "Local React + Node MVP: OTP, driver matching, ILS fares, live tracking, wallet, and notifications.",
    customer: "Customer",
    driver: "Driver",
    admin: "Admin",
    phone: "Phone",
    otp: "OTP",
    city: "City",
    login: "Login",
    requestOtp: "Send code",
    demoCode: "Demo code 1234",
    dashboard: "Dashboard",
    requestRide: "Request ride",
    pickup: "Pickup",
    dropoff: "Dropoff",
    payment: "Payment",
    cash: "Cash",
    wallet: "Wallet",
    visa: "VISA",
    nearbyDrivers: "Nearby drivers",
    activeRide: "Active ride",
    noRide: "No active ride now",
    fare: "Fare",
    distance: "Distance",
    eta: "ETA",
    rating: "Rating",
    online: "Online",
    offline: "Offline",
    goOnline: "Start work",
    goOffline: "Stop work",
    acceptRide: "Accept ride",
    completeRide: "Complete ride",
    adminPanel: "Admin panel",
    activeRides: "Active rides",
    onlineDrivers: "Online drivers",
    revenue: "Today revenue",
    notifications: "Notifications",
    language: "عربي",
    logout: "Logout",
    backendLive: "Backend live",
    backendOffline: "Local mode",
    status: "Status"
  }
};

const statusText = {
  ar: {
    searching: "بحث عن سائق",
    accepted: "تم قبول الطلب",
    arriving: "السائق بالطريق",
    picked_up: "تم الاستلام",
    completed: "مكتمل",
    cancelled: "ملغية",
    canceled: "ملغية"
  },
  en: {
    searching: "Searching",
    accepted: "Accepted",
    arriving: "Driver arriving",
    picked_up: "Picked up",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled"
  }
};

const initialState = {
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

function reducer(state, action) {
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

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

function localQuote(state) {
  const city = state.cities.find((item) => item.id === state.cityId) || state.cities[0];
  const distanceKm = 5.8;
  const surge = city.demand > 85 ? 1.16 : city.demand > 70 ? 1.08 : 1;
  return {
    fareIls: Math.max(15, Math.round((city.baseFare + distanceKm * 2.35) * surge)),
    distanceKm,
    etaMinutes: 7
  };
}

function tripTimeline(isArabic) {
  return [
    { key: "searching", label: isArabic ? "طلب المشوار" : "Ride requested" },
    { key: "accepted", label: isArabic ? "تم قبول السائق" : "Driver accepted" },
    { key: "arriving", label: isArabic ? "السائق بالطريق" : "Driver on the way" },
    { key: "arrived", label: isArabic ? "وصل السائق" : "Driver arrived" },
    { key: "picked_up", label: isArabic ? "بدأت الرحلة" : "Trip started" },
    { key: "completed", label: isArabic ? "انتهت الرحلة" : "Trip completed" }
  ];
}

function tripTimelineIndex(status) {
  const indexes = {
    searching: 0,
    accepted: 1,
    arriving: 2,
    arrived: 3,
    picked_up: 4,
    completed: 5
  };
  return indexes[status] ?? 0;
}

function rideDisplayCode(ride) {
  if (!ride?.id) return "R-0000";
  return `R-${String(ride.id).replace("ride_", "").replace("local_", "").slice(0, 6).toUpperCase()}`;
}

function rideStatusGroup(status) {
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "canceled") return "cancelled";
  return "active";
}

function rideDateLabel(ride, index, isArabic) {
  const sourceDate = ride?.createdAt || ride?.completedAt || ride?.updatedAt || ride?.startedAt;
  const fallbackDate = new Date(Date.now() - (index + 1) * 86400000);
  const date = sourceDate ? new Date(sourceDate) : fallbackDate;
  const safeDate = Number.isNaN(date.getTime()) ? fallbackDate : date;
  return new Intl.DateTimeFormat(isArabic ? "ar" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(safeDate);
}

function cityNameById(cities, cityId, isArabic) {
  const city = cities.find((item) => item.id === cityId) || cities[0];
  return isArabic ? city?.ar || city?.en || "المدينة" : city?.en || city?.ar || "City";
}

function toCoordinate(value) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function normalizeLocation(location, fallback = NABLUS_CENTER) {
  const lat = toCoordinate(location?.lat);
  const lng = toCoordinate(location?.lng);
  if (lat === null || lng === null) return fallback;
  return { lat, lng };
}

function customerLocationFromState(state) {
  return normalizeLocation(state.customerLocation, NABLUS_CENTER);
}

function driverLocationFromDriver(driver) {
  const lat = toCoordinate(driver?.lat);
  const lng = toCoordinate(driver?.lng);
  if (lat === null || lng === null) return null;
  return { lat, lng };
}

function haversineKm(from, to) {
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

function formatDistanceKm(distance) {
  const value = Number(distance);
  if (!Number.isFinite(value)) return "";
  return value < 10 ? value.toFixed(1) : String(Math.round(value));
}

function mapLocationCopy(locationStatus, isArabic) {
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

function safeMapLabel(label) {
  return String(label || "")
    .slice(0, 3)
    .replace(/[<>&"']/g, "");
}

function createMapIcon(className, label) {
  return L.divIcon({
    className: `wasel-map-marker ${className}`,
    html: `<span>${safeMapLabel(label)}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

function findRideDriver(ride, state, selectedDriver) {
  const matchedDriver = state.drivers.find((driver) => driver.id === ride?.driverId);
  if (matchedDriver) return matchedDriver;
  if (ride?.driverId && selectedDriver?.id === ride.driverId) return selectedDriver;
  return null;
}

function rideHasAcceptedDriver(ride) {
  const status = ride?.status || "";
  return Boolean(ride?.driverId) && !["searching", "cancelled", "canceled"].includes(status);
}

function driverDisplayName(driver, isArabic) {
  if (!driver) return isArabic ? "سائق واصل" : "Wasel driver";
  return isArabic ? driver.nameAr || driver.nameEn || "سائق واصل" : driver.nameEn || driver.nameAr || "Wasel driver";
}

function paymentMethodLabel(paymentMethod, isArabic) {
  if (paymentMethod === "visa") return "VISA";
  if (paymentMethod === "wallet") return isArabic ? "محفظة" : "Wallet";
  return isArabic ? "كاش" : "Cash";
}

function formatCardNumberInput(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatCardExpiryInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function maskCardNumber(value) {
  const digits = value.replace(/\D/g, "");
  const suffix = digits.slice(-4) || "0000";
  return `•••• ${suffix}`;
}

function buildRideHistory(state, selectedDriver, isArabic) {
  const currentRide = state.ride ? [{ ...state.ride, isCurrent: true }] : [];
  const sourceRides = [...currentRide, ...(state.admin.recentRides || [])];
  const seen = new Set();

  return sourceRides
    .filter((ride) => {
      const id = ride?.id || `ride_${seen.size}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((ride, index) => {
      const cityName = cityNameById(state.cities, ride.cityId || state.cityId, isArabic);
      const hasAcceptedDriver = rideHasAcceptedDriver(ride);
      const driver = hasAcceptedDriver ? findRideDriver(ride, state, selectedDriver) : null;
      const pickupFallback = isArabic ? `مركز ${cityName}` : `${cityName} center`;
      const dropoffFallback = isArabic ? `وجهة داخل ${cityName}` : `${cityName} destination`;
      const paymentMethod = ride.paymentMethod || state.paymentMethod || "cash";
      const status = ride.status || "completed";

      return {
        id: ride.id || `ride_${index}`,
        raw: ride,
        code: rideDisplayCode(ride),
        pickup: ride.pickup || (ride.isCurrent ? state.pickup : pickupFallback),
        dropoff: ride.dropoff || (ride.isCurrent ? state.dropoff : dropoffFallback),
        dateLabel: rideDateLabel(ride, index, isArabic),
        fareIls: ride.fareIls || state.quote.fareIls,
        distanceKm: ride.distanceKm || state.quote.distanceKm,
        etaMinutes: ride.etaMinutes || state.quote.etaMinutes,
        status,
        statusGroup: rideStatusGroup(status),
        statusLabel: statusText[state.language][status] || status,
        cityName,
        hasAcceptedDriver,
        driver,
        driverName: hasAcceptedDriver
          ? driverDisplayName(driver, isArabic)
          : (isArabic ? "بانتظار قبول الكابتن" : "Pending captain acceptance"),
        paymentMethod,
        paymentLabel: paymentMethodLabel(paymentMethod, isArabic)
      };
    });
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pendingAcceptanceTimerRef = useRef(null);
  const t = text[state.language];
  const isArabic = state.language === "ar";

  useEffect(() => {
    document.documentElement.lang = state.language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    if (state.themeMode === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = state.themeMode;
    }
  }, [isArabic, state.language, state.themeMode]);

  useEffect(() => {
    api("/api/bootstrap")
      .then((payload) => dispatch({ type: "bootstrap", payload }))
      .catch(() => dispatch({ type: "patch", patch: { backendLive: false } }));
  }, []);

  useEffect(() => {
    const events = new EventSource("/api/events");
    events.addEventListener("driver.location.updated", (event) => {
      dispatch({ type: "driverLocation", payload: JSON.parse(event.data) });
    });
    events.addEventListener("ride.status.changed", (event) => {
      dispatch({ type: "rideStatus", payload: JSON.parse(event.data) });
    });
    events.addEventListener("admin.metrics.updated", (event) => {
      dispatch({ type: "patch", patch: { admin: JSON.parse(event.data), backendLive: true } });
    });
    events.onerror = () => dispatch({ type: "patch", patch: { backendLive: false } });
    return () => events.close();
  }, []);

  useEffect(() => {
    api("/api/rides/quote", {
      method: "POST",
      body: JSON.stringify({ cityId: state.cityId, distanceKm: 5.8 })
    })
      .then((quote) => dispatch({ type: "patch", patch: { quote, backendLive: true } }))
      .catch(() => dispatch({ type: "patch", patch: { quote: localQuote(state), backendLive: false } }));
  }, [state.cityId]);

  useEffect(() => {
    if (!state.toast) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: "toast", message: "" }), 3000);
    return () => window.clearTimeout(timer);
  }, [state.toast]);

  useEffect(() => () => {
    if (pendingAcceptanceTimerRef.current) {
      window.clearTimeout(pendingAcceptanceTimerRef.current);
    }
  }, []);

  const selectedDriver = useMemo(
    () => state.drivers.find((driver) => driver.id === state.selectedDriverId) || state.drivers[0],
    [state.drivers, state.selectedDriverId]
  );

  async function requestOtp() {
    try {
      const payload = await api("/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ phone: state.phone, role: state.role })
      });
      dispatch({ type: "patch", patch: { otpRequestId: payload.requestId, backendLive: true } });
      dispatch({ type: "toast", message: t.demoCode });
    } catch {
      dispatch({ type: "patch", patch: { otpRequestId: "local_otp", backendLive: false } });
      dispatch({ type: "toast", message: t.demoCode });
    }
  }

  async function login(role = state.role) {
    if (role === "admin") {
      dispatch({ type: "patch", patch: { role: "admin", session: { role: "admin" } } });
      return;
    }
    if (state.otp !== "1234") {
      dispatch({ type: "toast", message: isArabic ? "رمز OTP غير صحيح" : "Wrong OTP code" });
      return;
    }
    try {
      const payload = await api("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ requestId: state.otpRequestId || "local_otp", code: state.otp })
      });
      dispatch({ type: "patch", patch: { role, session: payload.user, backendLive: true } });
    } catch {
      dispatch({ type: "patch", patch: { role, session: { role }, backendLive: false } });
    }
  }

  async function requestRide() {
    if (pendingAcceptanceTimerRef.current) {
      window.clearTimeout(pendingAcceptanceTimerRef.current);
      pendingAcceptanceTimerRef.current = null;
    }

    if (state.paymentMethod === "visa" && !state.visaCardReady) {
      dispatch({
        type: "toast",
        message: isArabic
          ? "أدخل بطاقة VISA التجريبية واضغط استخدام هذه البطاقة قبل طلب المشوار."
          : "Add the demo VISA card and choose Use this card before requesting the ride."
      });
      return;
    }

    const payload = {
      cityId: state.cityId,
      pickup: state.pickup,
      dropoff: state.dropoff,
      paymentMethod: state.paymentMethod,
      distanceKm: state.quote.distanceKm
    };
    try {
      const result = await api("/api/rides", { method: "POST", body: JSON.stringify(payload) });
      const backendAcceptedRide =
        result.ride?.status !== "searching" && Boolean(result.ride?.driverId || result.driver?.id);
      const visibleRide = backendAcceptedRide
        ? { ...result.ride, status: "searching", driverId: null }
        : result.ride;
      dispatch({
        type: "patch",
        patch: {
          ride: visibleRide,
          selectedDriverId: backendAcceptedRide ? state.selectedDriverId : result.driver?.id || state.selectedDriverId,
          backendLive: true,
          toast: isArabic ? "جاري البحث عن كابتن قريب..." : "Searching for a nearby captain..."
        }
      });

      if (backendAcceptedRide) {
        pendingAcceptanceTimerRef.current = window.setTimeout(() => {
          pendingAcceptanceTimerRef.current = null;
          dispatch({
            type: "patch",
            patch: {
              ride: {
                ...result.ride,
                status: "accepted",
                driverId: result.ride.driverId || result.driver.id
              },
              selectedDriverId: result.driver?.id || result.ride.driverId || state.selectedDriverId,
              toast: isArabic ? "تم قبول الطلب من كابتن قريب." : "A nearby captain accepted your request."
            }
          });
        }, 3500);
      }
    } catch {
      dispatch({
        type: "patch",
        patch: {
          ride: {
            id: "local_ride",
            status: "searching",
            pickup: state.pickup,
            dropoff: state.dropoff,
            fareIls: state.quote.fareIls,
            distanceKm: state.quote.distanceKm,
            etaMinutes: state.quote.etaMinutes
          },
          toast: isArabic ? "جاري البحث عن كابتن قريب..." : "Searching for a nearby captain..."
        }
      });
    }
  }

  async function updateRideStatus(status) {
    if (!state.ride) return;
    try {
      const payload = await api(`/api/rides/${state.ride.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status })
      });
      dispatch({ type: "patch", patch: { ride: payload.ride, backendLive: true } });
    } catch {
      dispatch({ type: "patch", patch: { ride: { ...state.ride, status }, backendLive: false } });
    }
  }

  async function toggleDriverStatus() {
    const online = !state.driverOnline;
    dispatch({ type: "patch", patch: { driverOnline: online } });
    try {
      await api("/api/drivers/status", {
        method: "POST",
        body: JSON.stringify({ driverId: selectedDriver.id, online })
      });
      dispatch({ type: "patch", patch: { backendLive: true } });
    } catch {
      dispatch({ type: "patch", patch: { backendLive: false } });
    }
  }

  const sharedProps = { state, dispatch, t, isArabic, selectedDriver, requestRide, updateRideStatus, toggleDriverStatus, login, requestOtp };

  if (!state.session) {
    return <AuthScreen {...sharedProps} />;
  }

  if (state.role === "customer") {
    return <CustomerShell {...sharedProps} />;
  }

  return (
    <Shell {...sharedProps}>
      {state.role === "admin" && <AdminPanel {...sharedProps} />}
      {state.role === "driver" && <DriverPanel {...sharedProps} />}
    </Shell>
  );
}

function LegacyAuthScreen({ state, dispatch, t, isArabic, requestOtp, login }) {
  return (
    <main className="home-layout">
      <section className="home-hero">
        <TopBar state={state} dispatch={dispatch} t={t} />
        <div className="hero-copy">
          <h1>{isArabic ? "مشوارك جاهز قبل ما تتحرك" : "Your ride is ready before you move"}</h1>
          <p>
            {isArabic
              ? "واجهة حجز فخمة وبسيطة لاختيار نقطة الانطلاق والوجهة، رؤية السعر المتوقع، ثم الدخول وطلب المشوار بأمان."
              : "A premium first-step booking flow for choosing pickup and dropoff, previewing fare, and signing in safely."}
          </p>
        </div>
        <RouteSearchCard
          state={state}
          dispatch={dispatch}
          t={t}
          isArabic={isArabic}
          actionLabel={isArabic ? "ابدأ طلب مشوار" : "Start ride request"}
          onAction={requestOtp}
        />
      </section>

      <section className="home-map-panel">
        <MapBoard state={state} dispatch={dispatch} selectedDriver={state.drivers[0]} t={t} isArabic={isArabic} />
      </section>

      <section className="auth-card sign-in-card">
        <div className="auth-card-header">
          <span>{isArabic ? "تسجيل سريع" : "Quick sign in"}</span>
          <strong>{isArabic ? "ابدأ المرحلة الأولى" : "Start phase one"}</strong>
        </div>
        <div className="role-grid">
          {["customer", "driver"].map((role) => (
            <button
              className={`role-card ${state.role === role ? "selected" : ""}`}
              key={role}
              onClick={() => dispatch({ type: "patch", patch: { role } })}
            >
              <span className="role-icon">{role === "customer" ? "C" : "D"}</span>
              <strong>{role === "customer" ? t.customer : t.driver}</strong>
              <small>{role === "customer" ? (isArabic ? "احجز وراقب السائق" : "Book and track") : (isArabic ? "استقبل الطلبات" : "Receive requests")}</small>
            </button>
          ))}
        </div>
        <div className="form-grid">
          <Field label={t.phone} value={state.phone} onChange={(phone) => dispatch({ type: "patch", patch: { phone } })} />
          <Field label={t.otp} value={state.otp} onChange={(otp) => dispatch({ type: "patch", patch: { otp } })} />
          <label className="field">
            <span>{t.city}</span>
            <select value={state.cityId} onChange={(event) => dispatch({ type: "patch", patch: { cityId: event.target.value } })}>
              {state.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {isArabic ? city.ar : city.en}
                </option>
              ))}
            </select>
          </label>
          <div className="button-row">
            <button className="secondary" onClick={requestOtp}>{t.requestOtp}</button>
            <button className="primary" onClick={() => login(state.role)}>{t.login}</button>
          </div>
          <button className="admin-link" onClick={() => login("admin")}>{t.adminPanel}</button>
        </div>
      </section>
      <Toast message={state.toast} />
    </main>
  );
}

function AuthScreen({ state, dispatch, t, isArabic }) {
  const [authMode, setAuthMode] = useState("login");
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    age: "",
    birthDate: "",
    city: state.cityId,
    phone: state.phone,
    password: "",
    confirmPassword: ""
  });
  const [captainForm, setCaptainForm] = useState({
    fullName: "",
    phone: state.phone,
    city: state.cityId,
    age: "",
    vehicleType: "",
    vehicleNumber: "",
    notes: ""
  });
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [otpCode, setOtpCode] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [captainRequestSubmitted, setCaptainRequestSubmitted] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const copy = isArabic
    ? {
        description: "تنقل آمن وسريع داخل مدينتك، من طلب المشوار حتى متابعة السائق والدفع بطريقة واضحة.",
        trust: "واجهة الزبون",
        headline: "ابدأ رحلتك بعد تسجيل الدخول فقط",
        loginHelp: "ادخل باسمك أو رقم هاتفك للوصول إلى واجهة طلب المشوار.",
        registerHelp: "أنشئ حسابك ثم تحقق برمز OTP التجريبي قبل العودة لتسجيل الدخول.",
        otpHelp: "أدخل رمز التحقق المرسل. في هذه النسخة التجريبية استخدم 1234.",
        support: ["المساعدة والدعم", "تواصل مع الإدارة", "مشكلة في الدخول؟"],
        captainJoin: "طلب الانضمام للكباتن",
        captainTitle: "انضم ككابتن توصيل",
        captainIntro: "قدّم طلبك الآن وسيتم التواصل معك من الإدارة بعد مراجعة بياناتك.",
        captainReview: "حساب الكابتن لا يتم تفعيله إلا بعد موافقة الإدارة/صاحب التطبيق.",
        captainSuccess: "تم إرسال طلبك للإدارة وهو الآن قيد المراجعة.",
        captainCta: "إرسال الطلب للإدارة",
        captainMissing: "يرجى تعبئة بيانات طلب الكابتن الأساسية.",
        success: "تم التحقق من الحساب. يمكنك تسجيل الدخول الآن.",
        loginSuccess: "تم تسجيل الدخول بنجاح",
        missing: "يرجى تعبئة كل الحقول المطلوبة.",
        passwordMismatch: "كلمتا السر غير متطابقتين.",
        passwordShort: "كلمة السر يجب أن تكون 6 أحرف على الأقل.",
        wrongOtp: "رمز التحقق غير صحيح.",
        wrongLogin: "بيانات الدخول لا تطابق الحساب الذي تم إنشاؤه."
      }
    : {
        description: "Safe, fast rides in your city, from request to driver tracking and clear payment.",
        trust: "Customer app",
        headline: "Start your trip only after sign in",
        loginHelp: "Enter your name or phone number to access the ride request interface.",
        registerHelp: "Create your account, verify with the demo OTP, then return to login.",
        otpHelp: "Enter the verification code. In this demo build use 1234.",
        support: ["Help and support", "Contact management", "Having login trouble?"],
        captainJoin: "Join as delivery captain",
        captainTitle: "Apply as a delivery captain",
        captainIntro: "Apply now and management will contact you after reviewing your details.",
        captainReview: "Captain accounts are activated only after approval from management or the app owner.",
        captainSuccess: "Your request was sent to management and is now under review.",
        captainCta: "Send request to management",
        captainMissing: "Please fill the required captain request details.",
        success: "Account verified. You can log in now.",
        loginSuccess: "Logged in successfully",
        missing: "Please fill all required fields.",
        passwordMismatch: "Passwords do not match.",
        passwordShort: "Password must be at least 6 characters.",
        wrongOtp: "Wrong verification code.",
        wrongLogin: "Login details do not match the registered account."
      };

  function switchMode(mode) {
    setAuthMode(mode);
    setAuthError("");
    setAuthNotice("");
  }

  function updateRegister(field, value) {
    setRegisterForm((current) => ({ ...current, [field]: value }));
  }

  function updateLogin(field, value) {
    setLoginForm((current) => ({ ...current, [field]: value }));
  }

  function updateCaptain(field, value) {
    setCaptainForm((current) => ({ ...current, [field]: value }));
    setCaptainRequestSubmitted(false);
  }

  function handleRegister(event) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    const requiredFields = ["fullName", "age", "birthDate", "city", "phone", "password", "confirmPassword"];
    const hasMissingField = requiredFields.some((field) => !String(registerForm[field] || "").trim());
    if (hasMissingField) {
      setAuthError(copy.missing);
      return;
    }
    if (registerForm.password.length < 6) {
      setAuthError(copy.passwordShort);
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError(copy.passwordMismatch);
      return;
    }

    setPendingUser(registerForm);
    setOtpCode("");
    setAuthMode("otp");
    dispatch({ type: "toast", message: isArabic ? "رمز التحقق التجريبي 1234" : "Demo verification code 1234" });
  }

  function handleOtp(event) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    if (otpCode.trim() !== "1234") {
      setAuthError(copy.wrongOtp);
      return;
    }

    setVerifiedUser(pendingUser);
    setLoginForm({ identifier: pendingUser?.phone || "", password: "" });
    setAuthMode("login");
    setAuthNotice(copy.success);
  }

  function handleLogin(event) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    if (!loginForm.identifier.trim() || !loginForm.password.trim()) {
      setAuthError(copy.missing);
      return;
    }

    const normalizedIdentifier = loginForm.identifier.trim();
    if (
      verifiedUser &&
      (loginForm.password !== verifiedUser.password ||
        (normalizedIdentifier !== verifiedUser.phone && normalizedIdentifier !== verifiedUser.fullName))
    ) {
      setAuthError(copy.wrongLogin);
      return;
    }

    const sessionUser = verifiedUser || {
      fullName: normalizedIdentifier,
      phone: normalizedIdentifier,
      city: state.cityId
    };

    dispatch({
      type: "patch",
      patch: {
        role: "customer",
        session: {
          role: "customer",
          name: sessionUser.fullName,
          phone: sessionUser.phone,
          verified: Boolean(verifiedUser)
        },
        phone: sessionUser.phone,
        cityId: sessionUser.city || state.cityId,
        toast: copy.loginSuccess
      }
    });
  }

  function handleCaptainRequest(event) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    const requiredFields = ["fullName", "phone", "city", "age", "vehicleType"];
    const hasMissingField = requiredFields.some((field) => !String(captainForm[field] || "").trim());
    if (hasMissingField) {
      setAuthError(copy.captainMissing);
      return;
    }

    setCaptainRequestSubmitted(true);
    setAuthNotice(copy.captainSuccess);
    dispatch({ type: "toast", message: copy.captainSuccess });
  }

  function showSupportMessage(index) {
    const messages = isArabic
      ? [
          "الدعم جاهز لمساعدتك داخل التطبيق.",
          "سيتم تحويل طلبك إلى الإدارة في النسخة المتصلة.",
          "جرّب إنشاء حساب جديد أو استخدم كلمة السر التي سجلت بها."
        ]
      : [
          "Support is ready to help inside the app.",
          "Your request will be routed to management in the connected build.",
          "Try registering a new account or use the password you created."
        ];
    dispatch({ type: "toast", message: messages[index] });
  }

  const supportItems = [...copy.support, copy.captainJoin];

  return (
    <main className={`welcome-auth auth-mode-${authMode}`} data-auth-states="auth-mode-login auth-mode-register auth-mode-otp auth-mode-captain">
      <section className="welcome-auth-hero">
        <div className="welcome-auth-top">
          <div className="welcome-brand">
            <span className="brand-mark">W</span>
            <div>
              <strong>{t.brand}</strong>
              <small>{t.tagline}</small>
            </div>
          </div>
          <button className="icon-button" onClick={() => dispatch({ type: "patch", patch: { language: state.language === "ar" ? "en" : "ar" } })}>
            {t.language}
          </button>
        </div>

        <div className="welcome-copy">
          <span>{copy.trust}</span>
          <h1>{copy.headline}</h1>
          <p>{copy.description}</p>
        </div>

        <div className="welcome-auth-support">
          {supportItems.map((item, index) => (
            <button
              type="button"
              key={item}
              onClick={() => (index === copy.support.length ? switchMode("captain") : showSupportMessage(index))}
            >
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="auth-panel" aria-label={isArabic ? "تسجيل الدخول وإنشاء الحساب" : "Login and registration"}>
        <div className="auth-tabs" role="tablist" aria-label={isArabic ? "خيارات الحساب" : "Account options"}>
          <button
            type="button"
            className={authMode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
            aria-selected={authMode === "login"}
          >
            <strong>Login</strong>
            <span>{isArabic ? "تسجيل دخول" : "Sign in"}</span>
          </button>
          <button
            type="button"
            className={authMode === "register" ? "active" : ""}
            onClick={() => switchMode("register")}
            aria-selected={authMode === "register"}
          >
            <strong>Register</strong>
            <span>{isArabic ? "إنشاء حساب" : "Create account"}</span>
          </button>
        </div>

        {authMode === "login" && (
          <form className="auth-form auth-mode-login" onSubmit={handleLogin}>
            <div className="auth-form-title">
              <h2>{isArabic ? "مرحبًا بعودتك" : "Welcome back"}</h2>
              <p>{copy.loginHelp}</p>
            </div>
            <AuthField
              label={isArabic ? "الاسم أو رقم الهاتف" : "Name or phone"}
              name="identifier"
              value={loginForm.identifier}
              onChange={(value) => updateLogin("identifier", value)}
              autoComplete="username"
            />
            <AuthField
              label={isArabic ? "كلمة السر" : "Password"}
              name="loginPassword"
              type="password"
              value={loginForm.password}
              onChange={(value) => updateLogin("password", value)}
              autoComplete="current-password"
            />
            {authNotice && <p className="auth-notice">{authNotice}</p>}
            {authError && <p className="auth-error">{authError}</p>}
            <button className="primary auth-submit" type="submit">{isArabic ? "دخول إلى التطبيق" : "Enter app"}</button>
          </form>
        )}

        {authMode === "register" && (
          <form className="auth-form auth-mode-register" onSubmit={handleRegister}>
            <div className="auth-form-title">
              <h2>{isArabic ? "إنشاء حساب زبون" : "Create customer account"}</h2>
              <p>{copy.registerHelp}</p>
            </div>
            <div className="auth-field-grid">
              <AuthField label={isArabic ? "الاسم الكامل" : "Full name"} name="fullName" value={registerForm.fullName} onChange={(value) => updateRegister("fullName", value)} autoComplete="name" />
              <AuthField label={isArabic ? "العمر" : "Age"} name="age" type="number" min="1" value={registerForm.age} onChange={(value) => updateRegister("age", value)} inputMode="numeric" />
              <AuthField label={isArabic ? "تاريخ الميلاد" : "Birth date"} name="birthDate" type="date" value={registerForm.birthDate} onChange={(value) => updateRegister("birthDate", value)} />
              <label className="field auth-field">
                <span>{isArabic ? "المدينة" : "City"}</span>
                <select name="city" value={registerForm.city} onChange={(event) => updateRegister("city", event.target.value)}>
                  {state.cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {isArabic ? city.ar : city.en}
                    </option>
                  ))}
                </select>
              </label>
              <AuthField label={isArabic ? "رقم الهاتف" : "Phone number"} name="phone" type="tel" value={registerForm.phone} onChange={(value) => updateRegister("phone", value)} autoComplete="tel" />
              <AuthField label={isArabic ? "كلمة السر" : "Password"} name="password" type="password" value={registerForm.password} onChange={(value) => updateRegister("password", value)} autoComplete="new-password" />
              <AuthField label={isArabic ? "تأكيد كلمة السر" : "Confirm password"} name="confirmPassword" type="password" value={registerForm.confirmPassword} onChange={(value) => updateRegister("confirmPassword", value)} autoComplete="new-password" />
            </div>
            {authError && <p className="auth-error">{authError}</p>}
            <button className="primary auth-submit" type="submit">{isArabic ? "إنشاء الحساب" : "Create account"}</button>
          </form>
        )}

        {authMode === "otp" && (
          <form className="auth-form auth-mode-otp" onSubmit={handleOtp}>
            <div className="auth-form-title">
              <h2>{isArabic ? "رمز التحقق OTP" : "OTP verification"}</h2>
              <p>{copy.otpHelp}</p>
            </div>
            <div className="otp-preview">
              <span>{isArabic ? "رمز تجريبي آمن" : "Safe demo code"}</span>
              <strong>1234</strong>
            </div>
            <AuthField
              label={isArabic ? "أدخل رمز OTP" : "Enter OTP"}
              name="otp"
              value={otpCode}
              onChange={setOtpCode}
              inputMode="numeric"
              maxLength="4"
              autoComplete="one-time-code"
            />
            {authError && <p className="auth-error">{authError}</p>}
            <div className="auth-actions">
              <button className="secondary" type="button" onClick={() => switchMode("register")}>{isArabic ? "تعديل البيانات" : "Edit details"}</button>
              <button className="primary" type="submit">{isArabic ? "تحقق" : "Verify"}</button>
            </div>
          </form>
        )}

        {authMode === "captain" && (
          <form className="auth-form auth-mode-captain captain-request-card" onSubmit={handleCaptainRequest}>
            <div className="auth-form-title">
              <h2>{copy.captainTitle}</h2>
              <p>{copy.captainIntro}</p>
            </div>
            <div className="captain-review-note">
              <span>{isArabic ? "مراجعة إدارية" : "Management review"}</span>
              <strong>{copy.captainReview}</strong>
            </div>
            <div className="auth-field-grid">
              <AuthField label={isArabic ? "الاسم الكامل" : "Full name"} name="captainFullName" value={captainForm.fullName} onChange={(value) => updateCaptain("fullName", value)} autoComplete="name" />
              <AuthField label={isArabic ? "رقم الهاتف" : "Phone number"} name="captainPhone" type="tel" value={captainForm.phone} onChange={(value) => updateCaptain("phone", value)} autoComplete="tel" />
              <label className="field auth-field">
                <span>{isArabic ? "المدينة" : "City"}</span>
                <select name="captainCity" value={captainForm.city} onChange={(event) => updateCaptain("city", event.target.value)}>
                  {state.cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {isArabic ? city.ar : city.en}
                    </option>
                  ))}
                </select>
              </label>
              <AuthField label={isArabic ? "العمر" : "Age"} name="captainAge" type="number" min="18" value={captainForm.age} onChange={(value) => updateCaptain("age", value)} inputMode="numeric" />
              <label className="field auth-field">
                <span>{isArabic ? "نوع المركبة" : "Vehicle type"}</span>
                <select name="captainVehicleType" value={captainForm.vehicleType} onChange={(event) => updateCaptain("vehicleType", event.target.value)}>
                  <option value="">{isArabic ? "اختر نوع المركبة" : "Select vehicle type"}</option>
                  <option value="car">{isArabic ? "سيارة" : "Car"}</option>
                  <option value="motorcycle">{isArabic ? "دراجة نارية" : "Motorcycle"}</option>
                  <option value="van">{isArabic ? "فان / مركبة توصيل" : "Van / delivery vehicle"}</option>
                </select>
              </label>
              <AuthField label={isArabic ? "رقم المركبة إن وجد" : "Vehicle number if available"} name="captainVehicleNumber" value={captainForm.vehicleNumber} onChange={(value) => updateCaptain("vehicleNumber", value)} />
              <label className="field auth-field captain-notes-field">
                <span>{isArabic ? "ملاحظات اختيارية" : "Optional notes"}</span>
                <textarea
                  name="captainNotes"
                  value={captainForm.notes}
                  onChange={(event) => updateCaptain("notes", event.target.value)}
                  rows="4"
                />
              </label>
            </div>
            {authNotice && <p className="auth-notice">{authNotice}</p>}
            {authError && <p className="auth-error">{authError}</p>}
            {captainRequestSubmitted && (
              <div className="captain-success-card">
                <strong>{copy.captainSuccess}</strong>
                <span>{copy.captainReview}</span>
              </div>
            )}
            <div className="auth-actions">
              <button className="secondary" type="button" onClick={() => switchMode("login")}>{isArabic ? "العودة للدخول" : "Back to login"}</button>
              <button className="primary" type="submit">{copy.captainCta}</button>
            </div>
          </form>
        )}
      </section>
      <Toast message={state.toast} />
    </main>
  );
}

function AuthField({ label, name, value, onChange, type = "text", ...inputProps }) {
  return (
    <label className="field auth-field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    </label>
  );
}

function Shell({ children, state, dispatch, t, selectedDriver }) {
  const title = state.role === "driver" ? t.driver : state.role === "admin" ? t.adminPanel : t.dashboard;
  return (
    <main className="app-layout">
      <aside className="sidebar">
        <TopBar state={state} dispatch={dispatch} t={t} compact />
        <div className="nav-stack">
          <button className={state.role === "customer" ? "nav-item active" : "nav-item"} onClick={() => dispatch({ type: "patch", patch: { role: "customer" } })}>{t.customer}</button>
          <button className={state.role === "driver" ? "nav-item active" : "nav-item"} onClick={() => dispatch({ type: "patch", patch: { role: "driver" } })}>{t.driver}</button>
          <button className={state.role === "admin" ? "nav-item active" : "nav-item"} onClick={() => dispatch({ type: "patch", patch: { role: "admin" } })}>{t.admin}</button>
        </div>
        <div className="side-card">
          <span>{t.backendLive}</span>
          <strong className={state.backendLive ? "good" : "warn"}>{state.backendLive ? "Live" : "Local"}</strong>
        </div>
        <button className="secondary" onClick={() => dispatch({ type: "patch", patch: { session: null, role: "customer" } })}>{t.logout}</button>
      </aside>
      <section className="workspace">
        <header className="workspace-header">
          <div>
            <h2>{title}</h2>
            <p>{selectedDriver?.vehicle || t.tagline} · {state.liveTicks} live ticks</p>
          </div>
          <div className="header-actions">
            <select value={state.cityId} onChange={(event) => dispatch({ type: "patch", patch: { cityId: event.target.value } })}>
              {state.cities.map((city) => (
                <option key={city.id} value={city.id}>{state.language === "ar" ? city.ar : city.en}</option>
              ))}
            </select>
            <button className="icon-button" onClick={() => dispatch({ type: "patch", patch: { language: state.language === "ar" ? "en" : "ar" } })}>{t.language}</button>
          </div>
        </header>
        {children}
      </section>
      <Toast message={state.toast} />
    </main>
  );
}

function CustomerShell(props) {
  const { state, dispatch, t, isArabic } = props;
  const [activeView, setActiveView] = useState("ride");
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const customerName = state.session?.name || (isArabic ? "عميل واصل" : "Wasel rider");
  const navItems = [
    { key: "ride", label: isArabic ? "طلب مشوار" : "Request ride" },
    { key: "trips", label: isArabic ? "رحلاتي" : "My trips" },
    { key: "wallet", label: isArabic ? "المحفظة/الدفع" : "Wallet/payment" },
    { key: "support", label: isArabic ? "الدعم" : "Support" },
    { key: "account", label: isArabic ? "حسابي" : "Account" }
  ];

  return (
    <main className="customer-app-layout">
      <header className="customer-navbar">
        <div className="customer-brand">
          <span className="brand-mark">W</span>
          <div>
            <strong>{t.brand}</strong>
            <small>{customerName}</small>
          </div>
        </div>

        <nav className="customer-nav" aria-label={isArabic ? "تنقل الزبون" : "Customer navigation"}>
          {navItems.map((item) => (
            <button
              type="button"
              key={item.key}
              className={activeView === item.key ? "active" : ""}
              onClick={() => setActiveView(item.key)}
              aria-current={activeView === item.key ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="customer-actions">
          <button
            type="button"
            className={settingsPanelOpen ? "customer-settings-button active" : "customer-settings-button"}
            onClick={() => setSettingsPanelOpen(true)}
            aria-label={isArabic ? "الإعدادات" : "Settings"}
          >
            <SettingsIcon />
          </button>
          <button className="secondary customer-logout" onClick={() => dispatch({ type: "patch", patch: { session: null, role: "customer" } })}>
            {t.logout}
          </button>
        </div>
      </header>

      <section className="customer-main">
        <CustomerPanel {...props} activeView={activeView} setActiveView={setActiveView} />
      </section>

      <nav className="customer-bottom-nav" aria-label={isArabic ? "تنقل الزبون السريع" : "Customer quick navigation"}>
        {navItems.map((item) => (
          <button
            type="button"
            key={item.key}
            className={activeView === item.key ? "active" : ""}
            onClick={() => setActiveView(item.key)}
            aria-current={activeView === item.key ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {settingsPanelOpen && (
        <div
          className="settings-panel-backdrop account-settings-drawer-host"
          role="dialog"
          aria-modal="true"
          aria-label={isArabic ? "إعدادات الحساب" : "Account settings"}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSettingsPanelOpen(false);
          }}
        >
          <AccountSettingsPanel
            state={state}
            dispatch={dispatch}
            t={t}
            isArabic={isArabic}
            onClose={() => setSettingsPanelOpen(false)}
          />
        </div>
      )}
      <Toast message={state.toast} />
    </main>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.4-2.4 1a8.6 8.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.6A8.6 8.6 0 0 0 7 6.6l-2.4-1-2 3.4 2 1.5c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2 1.5 2 3.4 2.4-1a8.6 8.6 0 0 0 2.6 1.5l.4 2.6h4l.4-2.6a8.6 8.6 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5Z" />
    </svg>
  );
}

function CustomerPanel(props) {
  const { state, dispatch, t, isArabic, selectedDriver, requestRide, activeView, setActiveView } = props;
  const [historyFilter, setHistoryFilter] = useState("all");
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  const rideHistory = useMemo(
    () => buildRideHistory(state, selectedDriver, isArabic),
    [
      state.ride,
      state.admin.recentRides,
      state.drivers,
      state.pickup,
      state.dropoff,
      state.quote,
      state.paymentMethod,
      state.cityId,
      state.cities,
      state.language,
      selectedDriver,
      isArabic
    ]
  );
  const filteredRideHistory = useMemo(
    () => rideHistory.filter((ride) => historyFilter === "all" || ride.statusGroup === historyFilter),
    [historyFilter, rideHistory]
  );
  const selectedHistoryRide =
    filteredRideHistory.find((ride) => ride.id === selectedHistoryId) || filteredRideHistory[0] || rideHistory[0];
  const customerHasAcceptedDriver = rideHasAcceptedDriver(state.ride);

  if (activeView === "trips") {
    return (
      <div className="customer-view-shell trips-view">
        <section className="phase-three-panel">
          <RideHistoryPanel
            rides={filteredRideHistory}
            allRides={rideHistory}
            selectedRide={selectedHistoryRide}
            filter={historyFilter}
            setFilter={setHistoryFilter}
            setSelectedRideId={setSelectedHistoryId}
            isArabic={isArabic}
            language={state.language}
          />
        </section>
        <section className="ride-detail-page">
          <RideDetailPage ride={selectedHistoryRide} state={state} dispatch={dispatch} t={t} isArabic={isArabic} />
        </section>
      </div>
    );
  }

  if (activeView === "wallet") {
    return (
      <div className="customer-view-shell single-view">
        <WalletPaymentPanel state={state} dispatch={dispatch} t={t} isArabic={isArabic} rideHistory={rideHistory} />
      </div>
    );
  }

  if (activeView === "support") {
    return (
      <div className="customer-view-shell single-view">
        <CustomerSupportPanel state={state} dispatch={dispatch} isArabic={isArabic} setActiveView={setActiveView} />
      </div>
    );
  }

  if (activeView === "account") {
    return (
      <div className="customer-view-shell single-view">
        <AccountProfilePanel
          state={state}
          dispatch={dispatch}
          t={t}
          isArabic={isArabic}
          rideHistory={rideHistory}
          selectedDriver={selectedDriver}
        />
      </div>
    );
  }

  return (
    <div className="customer-view-shell ride-view">
      <section className="stage-one-copy customer-ride-hero">
        <h1>{isArabic ? "اختر وجهتك وابدأ مشوارك بثقة" : "Choose your route and ride with confidence"}</h1>
        <p>
          {isArabic
            ? "حدد نقطة الانطلاق والوجهة، راجع السعر المتوقع، ثم أرسل الطلب عندما تكون جاهزًا."
            : "Set your pickup and destination, review the expected fare, then request when you are ready."}
        </p>
      </section>

      <section className="booking-panel">
        <RouteSearchCard
          state={state}
          dispatch={dispatch}
          t={t}
          isArabic={isArabic}
          actionLabel={t.requestRide}
          onAction={requestRide}
        />
      </section>

      <section className="panel wide map-panel">
        <MapBoard
          state={state}
          dispatch={dispatch}
          selectedDriver={customerHasAcceptedDriver ? selectedDriver : null}
          t={t}
          isArabic={isArabic}
          showDrivers={customerHasAcceptedDriver}
        />
      </section>

      {state.ride && (
        <section className="phase-two-panel">
          <PhaseTwoExperience
            state={state}
            dispatch={dispatch}
            t={t}
            isArabic={isArabic}
            selectedDriver={selectedDriver}
          />
        </section>
      )}

    </div>
  );
}

function DriverPanel({ state, dispatch, t, isArabic, selectedDriver, toggleDriverStatus, updateRideStatus }) {
  const assignedRide = state.ride || {
    id: "demo_request",
    pickup: state.pickup,
    dropoff: state.dropoff,
    fareIls: state.quote.fareIls,
    distanceKm: state.quote.distanceKm,
    etaMinutes: state.quote.etaMinutes,
    status: "searching"
  };
  const driverName = isArabic ? selectedDriver.nameAr : selectedDriver.nameEn;
  const rideHistory = buildRideHistory(state, selectedDriver, isArabic);
  const currentRide = state.ride ? rideHistory.find((ride) => ride.id === state.ride.id) || rideHistory[0] : null;
  const requestFallback = {
    id: assignedRide.id,
    raw: assignedRide,
    code: rideDisplayCode(assignedRide),
    pickup: assignedRide.pickup,
    dropoff: assignedRide.dropoff,
    fareIls: assignedRide.fareIls,
    distanceKm: assignedRide.distanceKm,
    etaMinutes: assignedRide.etaMinutes,
    status: assignedRide.status,
    statusLabel: statusText[state.language][assignedRide.status] || assignedRide.status,
    paymentLabel: paymentMethodLabel(state.paymentMethod, isArabic)
  };
  const newRequests = rideHistory.filter((ride) => ride.status === "searching");
  const visibleRequests = newRequests.length ? newRequests : state.driverOnline && !state.ride ? [requestFallback] : [];
  const driverTrips = rideHistory.filter((ride) => ride.raw?.driverId === selectedDriver.id || ride.id === state.ride?.id);
  const visibleTrips = driverTrips.length ? driverTrips : rideHistory.slice(0, 4);
  const todayEarnings = visibleTrips.reduce((sum, ride) => sum + Number(ride.fareIls || 0), 0);
  const completedTrips = visibleTrips.filter((ride) => ride.statusGroup === "completed").length;

  function notify(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  function acceptRide(ride) {
    dispatch({
      type: "patch",
      patch: {
        ride: {
          ...ride.raw,
          id: ride.id,
          pickup: ride.pickup,
          dropoff: ride.dropoff,
          fareIls: ride.fareIls,
          distanceKm: ride.distanceKm,
          etaMinutes: ride.etaMinutes,
          status: "accepted",
          driverId: selectedDriver.id
        }
      }
    });
  }

  return (
    <div className="driver-dashboard">
      <section className="driver-hero-card">
        <div className="driver-hero-top">
          <Avatar label={driverName.slice(0, 1)} />
          <div>
            <span>{isArabic ? "لوحة السائق" : "Driver dashboard"}</span>
            <h2>{driverName}</h2>
            <p>{selectedDriver.vehicle} · {selectedDriver.plate}</p>
          </div>
          <span className={`driver-status-pill ${state.driverOnline ? "online" : "offline"}`}>
            {state.driverOnline ? t.online : t.offline}
          </span>
        </div>
        <div className="driver-hero-actions">
          <button className={state.driverOnline ? "secondary danger-soft" : "primary"} onClick={toggleDriverStatus}>
            {state.driverOnline ? t.goOffline : t.goOnline}
          </button>
          <button className="secondary" onClick={() => notify("الدعم غير مربوط بعد", "Support is not connected yet")}>
            {isArabic ? "الدعم" : "Support"}
          </button>
        </div>
      </section>

      <section className="driver-kpi-grid">
        <Metric label={isArabic ? "أرباح اليوم" : "Today earnings"} value={`${todayEarnings} ₪`} />
        <Metric label={isArabic ? "عدد الرحلات" : "Trips"} value={visibleTrips.length} />
        <Metric label={t.rating} value={selectedDriver.rating} />
        <Metric label={isArabic ? "مكتملة" : "Completed"} value={completedTrips} />
      </section>

      <section className="driver-map-card">
        <PanelTitle title={isArabic ? "نطاق العمل والخريطة" : "Work zone and map"} meta={cityNameById(state.cities, state.cityId, isArabic)} />
        <MapBoard state={state} dispatch={dispatch} selectedDriver={selectedDriver} t={t} isArabic={isArabic} />
      </section>

      <section className="driver-requests-card">
        <PanelTitle title={isArabic ? "طلبات الرحلات الجديدة" : "New ride requests"} meta={`${visibleRequests.length}`} />
        {state.driverOnline && visibleRequests.length ? (
          <div className="driver-request-list">
            {visibleRequests.slice(0, 3).map((ride) => (
              <div className="driver-request-card" key={ride.id}>
                <div className="driver-card-head">
                  <strong>{ride.code}</strong>
                  <StatusBadge status={ride.status} label={ride.statusLabel} />
                </div>
                <div className="driver-route-line">
                  <span><small>{t.pickup}</small><b>{ride.pickup}</b></span>
                  <span><small>{t.dropoff}</small><b>{ride.dropoff}</b></span>
                </div>
                <div className="driver-request-meta">
                  <span>{ride.distanceKm} km</span>
                  <span>{ride.etaMinutes} min</span>
                  <strong>{ride.fareIls} ₪</strong>
                </div>
                <div className="driver-action-row">
                  <button className="primary" onClick={() => acceptRide(ride)}>{t.acceptRide}</button>
                  <button className="secondary" onClick={() => notify("رفض الرحلة غير مفعل في هذه النسخة", "Reject ride is not enabled in this build")}>
                    {isArabic ? "رفض" : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            {state.driverOnline
              ? (isArabic ? "لا توجد طلبات جديدة الآن" : "No new requests right now")
              : (isArabic ? "افتح أونلاين حتى تظهر الطلبات" : "Go online to receive requests")}
          </div>
        )}
      </section>

      <section className="driver-current-card">
        <PanelTitle title={isArabic ? "الرحلة الحالية" : "Current ride"} meta={currentRide ? <StatusBadge status={currentRide.status} label={currentRide.statusLabel} /> : "-"} />
        {currentRide ? (
          <div className="driver-current-stack">
            <div className="driver-card-head">
              <strong>{currentRide.code}</strong>
              <b>{currentRide.fareIls} ₪</b>
            </div>
            <div className="driver-route-line">
              <span><small>{t.pickup}</small><b>{currentRide.pickup}</b></span>
              <span><small>{t.dropoff}</small><b>{currentRide.dropoff}</b></span>
            </div>
            <QuoteStrip state={{ ...state, quote: currentRide }} t={t} compact />
            <button className="secondary" disabled={state.ride?.status === "completed"} onClick={() => updateRideStatus("completed")}>
              {state.ride?.status === "completed" ? statusText[state.language].completed : t.completeRide}
            </button>
          </div>
        ) : (
          <div className="empty">{isArabic ? "لا توجد رحلة حالية" : "No current ride"}</div>
        )}
      </section>

      <section className="driver-history-card">
        <PanelTitle title={isArabic ? "رحلات السائق السابقة" : "Driver ride history"} meta={`${visibleTrips.length}`} />
        <div className="driver-history-list">
          {visibleTrips.length ? (
            visibleTrips.slice(0, 5).map((ride) => (
              <div className="driver-history-row" key={ride.id}>
                <span>
                  <strong>{ride.code}</strong>
                  <small>{ride.pickup} · {ride.dropoff}</small>
                </span>
                <StatusBadge status={ride.status} label={ride.statusLabel} />
                <b>{ride.fareIls} ₪</b>
              </div>
            ))
          ) : (
            <div className="detail-empty compact">{isArabic ? "ستظهر الرحلات هنا بعد قبول الطلبات" : "Trips will appear here after accepted requests"}</div>
          )}
        </div>
      </section>
    </div>
  );

  return (
    <div className="content-grid">
      <section className="panel">
        <PanelTitle title={t.driver} meta={state.driverOnline ? t.online : t.offline} />
        <div className="driver-profile">
          <Avatar label={(isArabic ? selectedDriver.nameAr : selectedDriver.nameEn).slice(0, 1)} />
          <div>
            <strong>{isArabic ? selectedDriver.nameAr : selectedDriver.nameEn}</strong>
            <small>{selectedDriver.vehicle} · {selectedDriver.plate}</small>
          </div>
        </div>
        <button className="primary" onClick={toggleDriverStatus}>{state.driverOnline ? t.goOffline : t.goOnline}</button>
        <div className="metrics">
          <Metric label={t.rating} value={selectedDriver.rating} />
          <Metric label={t.fare} value="186 ₪" />
          <Metric label={t.activeRides} value="9" />
        </div>
      </section>
      <section className="panel wide">
        <MapBoard state={state} dispatch={dispatch} selectedDriver={selectedDriver} t={t} isArabic={isArabic} />
      </section>
      <section className="panel">
        <PanelTitle
          title={isArabic ? "طلب قريب" : "Nearby request"}
          meta={
            state.driverOnline ? (
              <StatusBadge
                status={assignedRide.status}
                label={statusText[state.language][assignedRide.status] || assignedRide.status}
              />
            ) : (
              t.offline
            )
          }
        />
        {state.driverOnline ? (
          <div className="ride-card">
            <strong>{assignedRide.pickup}</strong>
            <small>{assignedRide.dropoff}</small>
            <QuoteStrip state={{ ...state, quote: assignedRide }} t={t} compact />
            <button className="primary" onClick={() => dispatch({ type: "patch", patch: { ride: { ...assignedRide, status: "accepted", driverId: selectedDriver.id } } })}>{t.acceptRide}</button>
            <button className="secondary" onClick={() => updateRideStatus("completed")}>{t.completeRide}</button>
          </div>
        ) : (
          <div className="empty">{isArabic ? "افتح أونلاين حتى تظهر الطلبات" : "Go online to receive requests"}</div>
        )}
      </section>
    </div>
  );
}

function PhaseTwoExperience({ state, dispatch, t, isArabic, selectedDriver }) {
  const ride = state.ride;
  const rideStatus = ride?.status || "searching";
  const hasAcceptedDriver = rideHasAcceptedDriver(ride);
  const driver = hasAcceptedDriver ? findRideDriver(ride, state, selectedDriver) : null;
  const statusLabel = statusText[state.language][rideStatus] || (isArabic ? "جاري البحث" : "Searching");
  const driverName = driver ? driverDisplayName(driver, isArabic) : "";
  const vehicle = driver?.vehicle || "";
  const plate = driver?.plate || "";
  const customerLocation = customerLocationFromState(state);
  const driverLocation = driverLocationFromDriver(driver);
  const liveDriverDistanceKm = hasAcceptedDriver && driverLocation ? haversineKm(customerLocation, driverLocation) : null;
  const driverDistance = liveDriverDistanceKm ?? driver?.distanceKm ?? ride?.driverDistanceKm ?? "";
  const driverDistanceLabel = formatDistanceKm(driverDistance);
  const eta = hasAcceptedDriver ? ride?.etaMinutes || driver?.etaMinutes || state.quote.etaMinutes : state.quote.etaMinutes;
  const fare = ride?.fareIls || state.quote.fareIls;
  const distance = ride?.distanceKm || state.quote.distanceKm;
  const rideCode = ride ? `R-${ride.id.replace("ride_", "").slice(0, 6).toUpperCase()}` : "-";

  function notify(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  return (
    <div className="phase-two-stack">
      <section className={`phase-two-card captain-search-card searching-driver ${hasAcceptedDriver ? "is-matched" : "is-searching"}`}>
        <div className="search-visual" aria-hidden="true">
          <span />
          <i />
        </div>
        <div className="phase-two-copy">
          <span>{isArabic ? "حالة الطلب" : "Request status"}</span>
          <h3>
            {hasAcceptedDriver
              ? (isArabic ? "الكابتن قبل طلبك" : "A captain accepted your request")
              : (isArabic ? "جاري البحث عن كابتن قريب..." : "Searching for a nearby captain...")}
          </h3>
          <p>
            {hasAcceptedDriver
              ? (isArabic ? "ظهرت بيانات الكابتن بعد قبول الطلب." : "Captain details are visible after acceptance.")
              : (isArabic ? "لن تظهر بيانات الكابتن أو المركبة إلا بعد قبول الطلب." : "Captain and vehicle details will appear only after acceptance.")}
          </p>
        </div>
        <StatusBadge status={rideStatus} label={statusLabel} />
      </section>

      {!hasAcceptedDriver && (
        <section className="phase-two-card captain-pending-card">
          <PanelTitle title={isArabic ? "طلبك قيد المطابقة" : "Your request is being matched"} meta={rideCode} />
          <div className="detail-empty compact">
            {isArabic ? "نبحث عن كابتن مناسب قريب منك. ستظهر التفاصيل فور قبول الطلب." : "We are looking for a suitable nearby captain. Details will appear once accepted."}
          </div>
        </section>
      )}

      {hasAcceptedDriver && (
        <section className="phase-two-card accepted-driver-card driver-match-card">
          <div className="driver-card-top">
            <Avatar label={driverName.slice(0, 1)} />
            <div>
              <span>{isArabic ? "الكابتن" : "Captain"}</span>
              <strong>{driverName}</strong>
            </div>
          </div>
          <div className="driver-meta-grid">
            {driverDistanceLabel && <span><small>{isArabic ? "المسافة عنك" : "Distance away"}</small><strong>{driverDistanceLabel} km</strong></span>}
            <span><small>{t.eta}</small><strong>{eta} min</strong></span>
            {vehicle && <span><small>{isArabic ? "السيارة" : "Vehicle"}</small><strong>{vehicle}</strong></span>}
            {plate && <span><small>{isArabic ? "رقم اللوحة" : "Plate"}</small><strong>{plate}</strong></span>}
          </div>
          <div className="ride-action-row">
            <button className="secondary danger-soft" onClick={() => notify("يمكنك طلب إلغاء الرحلة من الدعم.", "You can request ride cancellation from support.")}>
              {isArabic ? "إلغاء الرحلة" : "Cancel ride"}
            </button>
            <button className="secondary" onClick={() => notify("سيتم فتح الاتصال بالكابتن من بيانات الرحلة.", "Captain calling will open from trip details.")}>
              {isArabic ? "اتصال" : "Call"}
            </button>
            <button className="secondary" onClick={() => notify("سيتم فتح المحادثة الخاصة بالرحلة.", "Trip chat will open here.")}>
              {isArabic ? "رسالة" : "Message"}
            </button>
          </div>
        </section>
      )}

      {hasAcceptedDriver && (
        <section className="phase-two-card tracking-card">
          <PanelTitle title={isArabic ? "تتبع الكابتن" : "Captain tracking"} meta={<StatusBadge status={rideStatus} label={statusLabel} />} />
          <div className="tracking-map-shell">
            <MapBoard state={state} dispatch={dispatch} selectedDriver={driver} t={t} isArabic={isArabic} />
          </div>
        </section>
      )}

      <section className="phase-two-card trip-details-card">
        <PanelTitle title={isArabic ? "تفاصيل الرحلة الحالية" : "Current trip details"} meta={rideCode} />
        <div className="trip-route">
          <span><small>{t.pickup}</small><strong>{ride?.pickup || state.pickup}</strong></span>
          <span><small>{t.dropoff}</small><strong>{ride?.dropoff || state.dropoff}</strong></span>
        </div>
        <div className="detail-metrics">
          <Metric label={t.fare} value={`${fare} ₪`} />
          <Metric label={t.distance} value={`${distance} km`} />
          <Metric label={t.eta} value={`${eta} min`} />
        </div>
        <RideTimeline status={rideStatus} isArabic={isArabic} />
      </section>
    </div>
  );
}

function RideTimeline({ status, isArabic }) {
  const activeIndex = tripTimelineIndex(status);
  return (
    <ol className="ride-timeline">
      {tripTimeline(isArabic).map((item, index) => (
        <li className={index <= activeIndex ? "done" : ""} key={item.key}>
          <span>{index + 1}</span>
          <strong>{item.label}</strong>
        </li>
      ))}
    </ol>
  );
}

function RideHistoryPanel({ rides, allRides, selectedRide, filter, setFilter, setSelectedRideId, isArabic }) {
  const filters = [
    { key: "all", label: isArabic ? "الكل" : "All" },
    { key: "completed", label: isArabic ? "مكتملة" : "Completed" },
    { key: "cancelled", label: isArabic ? "ملغية" : "Cancelled" },
    { key: "active", label: isArabic ? "قيد التنفيذ" : "In progress" }
  ];

  function countFor(key) {
    if (key === "all") return allRides.length;
    return allRides.filter((ride) => ride.statusGroup === key).length;
  }

  return (
    <div className="history-panel">
      <PanelTitle
        title={isArabic ? "رحلاتي السابقة" : "My previous rides"}
        meta={isArabic ? `${allRides.length} رحلات` : `${allRides.length} rides`}
      />
      <div className="history-filter-row" aria-label={isArabic ? "فلترة الرحلات" : "Ride filters"}>
        {filters.map((item) => (
          <button
            className={filter === item.key ? "active" : ""}
            key={item.key}
            onClick={() => setFilter(item.key)}
            aria-pressed={filter === item.key}
          >
            <span>{item.label}</span>
            <b>{countFor(item.key)}</b>
          </button>
        ))}
      </div>
      <div className="history-trip-list">
        {rides.length ? (
          rides.map((ride) => (
            <button
              className={`history-trip-card ${selectedRide?.id === ride.id ? "selected" : ""}`}
              key={ride.id}
              onClick={() => setSelectedRideId(ride.id)}
            >
              <span className="history-card-head">
                <strong>{ride.code}</strong>
                <StatusBadge status={ride.status} label={ride.statusLabel} />
              </span>
              <span className="history-route">
                <span>
                  <small>{isArabic ? "من" : "From"}</small>
                  <b>{ride.pickup}</b>
                </span>
                <span>
                  <small>{isArabic ? "إلى" : "To"}</small>
                  <b>{ride.dropoff}</b>
                </span>
              </span>
              <span className="history-meta">
                <span>{ride.dateLabel}</span>
                <span>{ride.driverName}</span>
                <strong>{ride.fareIls} ₪</strong>
              </span>
            </button>
          ))
        ) : (
          <div className="detail-empty">
            {isArabic ? "لا توجد رحلات مطابقة لهذا الفلتر الآن" : "No rides match this filter yet"}
          </div>
        )}
      </div>
    </div>
  );
}

function RideDetailPage({ ride, state, dispatch, t, isArabic }) {
  if (!ride) {
    return (
      <div className="ride-detail-card">
        <PanelTitle title={isArabic ? "تفاصيل الرحلة" : "Ride details"} meta="-" />
        <div className="detail-empty">{isArabic ? "اختر رحلة لعرض التفاصيل" : "Select a ride to view details"}</div>
      </div>
    );
  }

  const hasAcceptedDriver = Boolean(ride.hasAcceptedDriver);
  const driver = hasAcceptedDriver ? ride.driver || {} : null;
  const driverName = hasAcceptedDriver ? ride.driverName || driverDisplayName(driver, isArabic) : "";
  const vehicle = driver?.vehicle || (isArabic ? "مركبة مريحة" : "Comfort vehicle");
  const plate = driver?.plate || (isArabic ? "غير متاح" : "Not available");
  const rating = driver?.rating || "4.9";
  const mapState = { ...state, pickup: ride.pickup, dropoff: ride.dropoff };

  return (
    <div className="ride-detail-card">
      <div className="detail-hero">
        <div>
          <span>{isArabic ? "تفاصيل الرحلة" : "Ride details"}</span>
          <h3>{isArabic ? "ملخص الرحلة" : "Trip summary"}</h3>
          <p>{ride.code} · {ride.dateLabel}</p>
        </div>
        <StatusBadge status={ride.status} label={ride.statusLabel} />
      </div>

      <div className="detail-route-grid">
        <span>
          <small>{t.pickup}</small>
          <strong>{ride.pickup}</strong>
        </span>
        <span>
          <small>{t.dropoff}</small>
          <strong>{ride.dropoff}</strong>
        </span>
      </div>

      <div className="detail-metrics">
        <Metric label={t.fare} value={`${ride.fareIls} ₪`} />
        <Metric label={t.distance} value={`${ride.distanceKm} km`} />
        <Metric label={t.eta} value={`${ride.etaMinutes} min`} />
        <Metric label={isArabic ? "طريقة الدفع" : "Payment"} value={ride.paymentLabel} />
      </div>

      {hasAcceptedDriver ? (
        <div className="detail-driver-card">
          <Avatar label={driverName.slice(0, 1)} />
          <div>
            <span>{isArabic ? "بيانات السائق" : "Driver details"}</span>
            <strong>{driverName}</strong>
            <small>{vehicle} · {plate}</small>
          </div>
          <b>{rating}</b>
        </div>
      ) : (
        <div className="detail-empty compact">
          {isArabic ? "بيانات الكابتن ستظهر بعد قبول الطلب فقط." : "Captain details will appear only after acceptance."}
        </div>
      )}

      <div className="detail-map-shell">
        <MapBoard state={mapState} dispatch={dispatch} selectedDriver={driver} t={t} isArabic={isArabic} showDrivers={hasAcceptedDriver} />
      </div>
    </div>
  );
}

function CustomerSupportPanel({ state, dispatch, isArabic, setActiveView }) {
  const cityName = cityNameById(state.cities, state.cityId, isArabic);
  const supportActions = isArabic
    ? [
        { title: "المساعدة والدعم", text: "تواصل معنا بخصوص أي مشكلة في المشوار أو الحساب." },
        { title: "تواصل مع الإدارة", text: "أرسل طلب متابعة وسيتم التعامل معه حسب الأولوية." },
        { title: "مشكلة في الدفع؟", text: "راجع طريقة الدفع أو المحفظة من قسم الدفع." }
      ]
    : [
        { title: "Help and support", text: "Reach us about any trip or account issue." },
        { title: "Contact management", text: "Send a follow-up request and it will be handled by priority." },
        { title: "Payment issue?", text: "Review payment method or wallet from the payment section." }
      ];

  function notify(title) {
    dispatch({
      type: "toast",
      message: isArabic ? `${title}: تم تسجيل طلبك وسيتابع معك الفريق.` : `${title}: your request was noted for follow-up.`
    });
  }

  return (
    <div className="account-card customer-support-card">
      <div className="support-hero">
        <span>{isArabic ? "مركز الدعم" : "Support center"}</span>
        <h3>{isArabic ? "نحن هنا لمساعدتك" : "We are here to help"}</h3>
        <p>{isArabic ? `خدمتك الحالية في ${cityName}. اختر نوع المساعدة المطلوبة.` : `Your current service city is ${cityName}. Choose the help you need.`}</p>
      </div>
      <div className="support-action-grid">
        {supportActions.map((item) => (
          <button className="support-action-card" type="button" key={item.title} onClick={() => notify(item.title)}>
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </button>
        ))}
      </div>
      <div className="account-action-row">
        <button className="secondary" onClick={() => setActiveView("ride")}>
          {isArabic ? "العودة لطلب مشوار" : "Back to ride request"}
        </button>
        <button className="secondary" onClick={() => setActiveView("wallet")}>
          {isArabic ? "المحفظة والدفع" : "Wallet and payment"}
        </button>
      </div>
    </div>
  );
}

function AccountProfilePanel({ state, dispatch, t, isArabic, rideHistory, selectedDriver }) {
  const phone = state.session?.phone || state.phone;
  const cityName = cityNameById(state.cities, state.cityId, isArabic);
  const completedRides = rideHistory.filter((ride) => ride.statusGroup === "completed").length;
  const activeRides = rideHistory.filter((ride) => ride.statusGroup === "active").length;
  const totalSpent = rideHistory.reduce((sum, ride) => sum + Number(ride.fareIls || 0), 0);
  const userName = isArabic ? "عميل واصل" : "Wasel rider";
  const rating = selectedDriver?.rating || "4.9";

  function notify(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  return (
    <div className="account-card profile-card">
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <Avatar label={userName.slice(0, 1)} />
          <span />
        </div>
        <div>
          <span>{isArabic ? "حساب المستخدم" : "User profile"}</span>
          <h3>{userName}</h3>
          <p>{phone}</p>
        </div>
        <StatusBadge status="accepted" label={isArabic ? "نشط" : "Active"} />
      </div>

      <div className="profile-info-grid">
        <span>
          <small>{t.city}</small>
          <strong>{cityName}</strong>
        </span>
        <span>
          <small>{isArabic ? "نوع الحساب" : "Account type"}</small>
          <strong>{t.customer}</strong>
        </span>
        <span>
          <small>{isArabic ? "طريقة الدفع" : "Payment"}</small>
          <strong>{paymentMethodLabel(state.paymentMethod, isArabic)}</strong>
        </span>
      </div>

      <div className="account-stats-grid">
        <span><small>{isArabic ? "كل الرحلات" : "All rides"}</small><strong>{rideHistory.length}</strong></span>
        <span><small>{isArabic ? "مكتملة" : "Completed"}</small><strong>{completedRides}</strong></span>
        <span><small>{isArabic ? "قيد التنفيذ" : "Active"}</small><strong>{activeRides}</strong></span>
        <span><small>{isArabic ? "إجمالي المدفوعات" : "Total spend"}</small><strong>{totalSpent} ₪</strong></span>
        <span><small>{isArabic ? "تقييم الخدمة" : "Service rating"}</small><strong>{rating}</strong></span>
      </div>

      <div className="account-action-row">
        <button className="secondary" onClick={() => notify("يمكنك تحديث بيانات الحساب من الإعدادات عند توفر التعديل.", "You can update account details from settings when editing is available.")}>
          {isArabic ? "تعديل الحساب" : "Edit profile"}
        </button>
      </div>
    </div>
  );
}

function WalletPaymentPanel({ state, dispatch, t, isArabic, rideHistory }) {
  const visibleSpend = rideHistory.reduce((sum, ride) => sum + Number(ride.fareIls || 0), 0);
  const paymentRows = rideHistory.slice(0, 4);

  return (
    <div className="account-card wallet-card-shell">
      <PanelTitle title={isArabic ? "المحفظة والدفع" : "Wallet and payment"} meta={isArabic ? "إدارة الدفع" : "Payment settings"} />
      <div className="wallet-card-visual">
        <div>
          <span>{isArabic ? "Wasel Wallet" : "Wasel Wallet"}</span>
          <strong>{isArabic ? "محفظة واصل" : "Wasel wallet"}</strong>
          <small>{isArabic ? "راجع رصيدك وطريقة الدفع المفضلة" : "Review your balance and preferred payment method"}</small>
        </div>
        <b>{visibleSpend} ₪</b>
      </div>

      <div className="payment-methods">
        <button
          className={state.paymentMethod === "cash" ? "selected" : ""}
          onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "cash" } })}
        >
          <span>{isArabic ? "كاش" : "Cash"}</span>
          <small>{isArabic ? "الدفع عند نهاية الرحلة" : "Pay after the ride"}</small>
        </button>
        <button
          className={state.paymentMethod === "visa" ? "selected" : ""}
          onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "visa" } })}
        >
          <span>VISA</span>
          <small>{isArabic ? "واجهة بطاقة تجريبية بدون دفع فعلي" : "Demo card interface without real payment"}</small>
        </button>
      </div>

      <div className="payment-activity">
        <div className="section-mini-title">
          <strong>{isArabic ? "سجل عمليات الدفع" : "Payment activity"}</strong>
          <small>{paymentRows.length ? (isArabic ? "حسب رحلاتك" : "Based on your trips") : (isArabic ? "لا توجد عمليات" : "No activity")}</small>
        </div>
        {paymentRows.length ? (
          paymentRows.map((ride) => (
            <div className="payment-row" key={ride.id}>
              <span>
                <strong>{ride.code}</strong>
                <small>{ride.dateLabel} · {ride.paymentLabel}</small>
              </span>
              <b>{ride.fareIls} ₪</b>
            </div>
          ))
        ) : (
          <div className="detail-empty compact">{isArabic ? "ستظهر عمليات الدفع بعد إنشاء الرحلات" : "Payment records will appear after rides exist"}</div>
        )}
      </div>
    </div>
  );
}

function AccountSettingsPanel({ state, dispatch, t, isArabic, onClose }) {
  function notify(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  const [settingsDraft, setSettingsDraft] = useState({
    fullName: state.session?.name || "",
    phone: state.session?.phone || state.phone || "",
    cityId: state.cityId,
    avatar: state.profileAvatar || "",
    password: "",
    homeAddress: state.savedAddresses?.home || "",
    workAddress: state.savedAddresses?.work || "",
    universityAddress: state.savedAddresses?.university || "",
    defaultPayment: state.paymentMethod === "visa" ? "visa" : "cash",
    notificationsEnabled: state.notificationsEnabled !== false,
    themeMode: state.themeMode || "system"
  });

  function updateDraft(field, value) {
    setSettingsDraft((draft) => ({ ...draft, [field]: value }));
  }

  function saveSettings() {
    dispatch({
      type: "patch",
      patch: {
        session: {
          ...(state.session || { role: "customer" }),
          name: settingsDraft.fullName.trim() || state.session?.name,
          phone: settingsDraft.phone.trim() || state.session?.phone || state.phone
        },
        phone: settingsDraft.phone.trim() || state.phone,
        cityId: settingsDraft.cityId,
        profileAvatar: settingsDraft.avatar.trim(),
        savedAddresses: {
          home: settingsDraft.homeAddress.trim(),
          work: settingsDraft.workAddress.trim(),
          university: settingsDraft.universityAddress.trim()
        },
        paymentMethod: settingsDraft.defaultPayment,
        notificationsEnabled: settingsDraft.notificationsEnabled,
        themeMode: settingsDraft.themeMode,
        toast: isArabic ? "تم حفظ الإعدادات محليًا داخل التطبيق." : "Settings saved locally in the app."
      }
    });
  }

  function updateCurrentLocation() {
    if (!("geolocation" in navigator)) {
      notify("المتصفح لا يدعم تحديث الموقع الحالي.", "This browser cannot update the current location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch({
          type: "patch",
          patch: {
            customerLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            locationStatus: "granted",
            toast: isArabic ? "تم تحديث موقعك الحالي محليًا." : "Current location updated locally."
          }
        });
      },
      () => notify("لم يتم السماح بتحديث الموقع، سنبقي موقع نابلس الافتراضي.", "Location permission was not granted, so the Nablus default remains.")
    );
  }

  return (
    <section className="account-settings-drawer account-settings-panel" onMouseDown={(event) => event.stopPropagation()}>
      <div className="settings-drawer-head">
        <div>
          <span>{isArabic ? "لوحة مستقلة" : "Separate panel"}</span>
          <h2>{isArabic ? "إعدادات الحساب" : "Account settings"}</h2>
          <p className="settings-local-note">
            {isArabic
              ? "هذه الإعدادات محفوظة مؤقتًا في الواجهة فقط حتى يتم ربط حفظ الحساب بالـ Backend."
              : "These settings are temporarily stored in local app state until account persistence is connected."}
          </p>
        </div>
        <button className="icon-button settings-close-button" type="button" onClick={onClose} aria-label={isArabic ? "إغلاق الإعدادات" : "Close settings"}>
          ×
        </button>
      </div>

      <div className="settings-section-stack">
        <section className="settings-section account-info-section">
          <div className="section-mini-title">
            <strong>{isArabic ? "معلومات الحساب" : "Account information"}</strong>
            <small>{isArabic ? "الاسم، الهاتف، الصورة، وكلمة المرور" : "Name, phone, avatar, and password"}</small>
          </div>
          <div className="settings-form-grid">
            <label className="field">
              <span>{isArabic ? "تعديل الاسم" : "Edit name"}</span>
              <input name="settingsFullName" value={settingsDraft.fullName} onChange={(event) => updateDraft("fullName", event.target.value)} />
            </label>
            <label className="field">
              <span>{isArabic ? "تعديل رقم الهاتف" : "Edit phone number"}</span>
              <input name="settingsPhone" value={settingsDraft.phone} onChange={(event) => updateDraft("phone", event.target.value)} />
            </label>
            <label className="field">
              <span>{isArabic ? "تعديل المدينة" : "Edit city"}</span>
              <select value={settingsDraft.cityId} onChange={(event) => updateDraft("cityId", event.target.value)}>
                {state.cities.map((city) => (
                  <option key={city.id} value={city.id}>{isArabic ? city.ar : city.en}</option>
                ))}
              </select>
            </label>
            <label className="field avatar-field">
              <span>{isArabic ? "تعديل الصورة الشخصية أو Avatar" : "Edit profile avatar"}</span>
              <input name="settingsAvatar" maxLength={2} value={settingsDraft.avatar} onChange={(event) => updateDraft("avatar", event.target.value)} placeholder={isArabic ? "حرفان" : "Initials"} />
            </label>
            <label className="field">
              <span>{isArabic ? "تغيير كلمة المرور" : "Change password"}</span>
              <input name="settingsPassword" type="password" value={settingsDraft.password} onChange={(event) => updateDraft("password", event.target.value)} placeholder={isArabic ? "واجهة محلية مؤقتة" : "Local placeholder"} />
            </label>
          </div>
        </section>

        <section className="settings-section location-addresses-section">
          <div className="section-mini-title">
            <strong>{isArabic ? "الموقع والعناوين" : "Location and addresses"}</strong>
            <small>{isArabic ? "الموقع الحالي والعناوين المحفوظة" : "Current location and saved addresses"}</small>
          </div>
          <button className="secondary update-current-location" type="button" onClick={updateCurrentLocation}>
            {isArabic ? "تحديث الموقع الحالي" : "Update current location"}
          </button>
          <div className="settings-form-grid">
            <label className="field">
              <span>{isArabic ? "البيت" : "Home"}</span>
              <input name="homeAddress" value={settingsDraft.homeAddress} onChange={(event) => updateDraft("homeAddress", event.target.value)} placeholder={isArabic ? "أضف عنوان البيت" : "Add home address"} />
            </label>
            <label className="field">
              <span>{isArabic ? "العمل" : "Work"}</span>
              <input name="workAddress" value={settingsDraft.workAddress} onChange={(event) => updateDraft("workAddress", event.target.value)} placeholder={isArabic ? "أضف عنوان العمل" : "Add work address"} />
            </label>
            <label className="field">
              <span>{isArabic ? "الجامعة" : "University"}</span>
              <input name="universityAddress" value={settingsDraft.universityAddress} onChange={(event) => updateDraft("universityAddress", event.target.value)} placeholder={isArabic ? "أضف عنوان الجامعة" : "Add university address"} />
            </label>
            <label className="field">
              <span>{isArabic ? "اختيار المدينة الافتراضية" : "Choose default city"}</span>
              <select value={settingsDraft.cityId} onChange={(event) => updateDraft("cityId", event.target.value)}>
                {state.cities.map((city) => (
                  <option key={city.id} value={city.id}>{isArabic ? city.ar : city.en}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="settings-section payment-settings-section">
          <div className="section-mini-title">
            <strong>{isArabic ? "الدفع" : "Payment"}</strong>
            <small>{isArabic ? "إدارة طرق الدفع الافتراضية" : "Manage default payment methods"}</small>
          </div>
          <div className="settings-payment-row">
            <div className="settings-visa-placeholder">
              <span>VISA</span>
              <strong>{state.visaCardPreview || "•••• 4582"}</strong>
              <small>{isArabic ? "إضافة بطاقة VISA كواجهة فقط بدون دفع حقيقي" : "Add VISA as a UI-only placeholder"}</small>
            </div>
            <div className="default-payment-choice segmented">
              <button type="button" className={settingsDraft.defaultPayment === "cash" ? "active" : ""} onClick={() => updateDraft("defaultPayment", "cash")}>{t.cash}</button>
              <button type="button" className={settingsDraft.defaultPayment === "visa" ? "active" : ""} onClick={() => updateDraft("defaultPayment", "visa")}>VISA</button>
            </div>
          </div>
        </section>

        <section className="settings-section app-settings-section">
          <div className="section-mini-title">
            <strong>{isArabic ? "التطبيق" : "App"}</strong>
            <small>{isArabic ? "اللغة، الإشعارات، والمظهر" : "Language, notifications, and appearance"}</small>
          </div>
          <div className="settings-row">
            <span><small>{isArabic ? "اللغة" : "Language"}</small><strong>{isArabic ? "عربي" : "English"}</strong></span>
            <button className="secondary" type="button" onClick={() => dispatch({ type: "patch", patch: { language: state.language === "ar" ? "en" : "ar" } })}>
              {state.language === "ar" ? "English" : "عربي"}
            </button>
          </div>
          <label className="settings-row settings-toggle-row">
            <span><small>{isArabic ? "الإشعارات" : "Notifications"}</small><strong>{settingsDraft.notificationsEnabled ? (isArabic ? "مفعلة" : "Enabled") : (isArabic ? "متوقفة" : "Disabled")}</strong></span>
            <input type="checkbox" checked={settingsDraft.notificationsEnabled} onChange={(event) => updateDraft("notificationsEnabled", event.target.checked)} />
          </label>
          <div className="settings-row">
            <span><small>{isArabic ? "الوضع الداكن/الفاتح" : "Dark/light mode"}</small><strong>{settingsDraft.themeMode === "dark" ? (isArabic ? "داكن" : "Dark") : settingsDraft.themeMode === "light" ? (isArabic ? "فاتح" : "Light") : (isArabic ? "حسب النظام" : "System")}</strong></span>
            <div className="theme-choice segmented">
              <button type="button" className={settingsDraft.themeMode === "light" ? "active" : ""} onClick={() => updateDraft("themeMode", "light")}>{isArabic ? "فاتح" : "Light"}</button>
              <button type="button" className={settingsDraft.themeMode === "dark" ? "active" : ""} onClick={() => updateDraft("themeMode", "dark")}>{isArabic ? "داكن" : "Dark"}</button>
            </div>
          </div>
        </section>

        <section className="settings-section support-settings-section">
          <div className="section-mini-title">
            <strong>{isArabic ? "الدعم" : "Support"}</strong>
            <small>{isArabic ? "تواصل، مساعدة، أو بلاغ" : "Contact, help, or report"}</small>
          </div>
          <div className="settings-support-actions">
            <button className="secondary" type="button" onClick={() => notify("سيتم توجيه طلبك للإدارة في النسخة المتصلة.", "Your request will be routed to management in the connected build.")}>{isArabic ? "تواصل مع الإدارة" : "Contact management"}</button>
            <button className="secondary" type="button" onClick={() => notify("مركز المساعدة قيد التجهيز داخل التطبيق.", "The help center is being prepared inside the app.")}>{isArabic ? "مركز المساعدة" : "Help center"}</button>
            <button className="secondary danger-soft" type="button" onClick={() => notify("تم تسجيل البلاغ محليًا للتجربة.", "Issue report saved locally for the demo.")}>{isArabic ? "الإبلاغ عن مشكلة" : "Report an issue"}</button>
          </div>
        </section>
      </div>

      <div className="settings-drawer-actions">
        <button className="secondary" type="button" onClick={onClose}>{isArabic ? "إغلاق" : "Close"}</button>
        <button className="primary" type="button" onClick={saveSettings}>{isArabic ? "حفظ الإعدادات" : "Save settings"}</button>
      </div>
    </section>
  );

}

function AdminPanel({ state, t, isArabic }) {
  return (
    <div className="content-grid admin-grid">
      <Metric label={t.activeRides} value={state.admin.activeRides} />
      <Metric label={t.onlineDrivers} value={state.admin.onlineDrivers} />
      <Metric label={t.revenue} value={`${state.admin.todayRevenueIls} ₪`} />
      <section className="panel wide">
        <PanelTitle title={isArabic ? "الطلب حسب المدينة" : "Demand by city"} meta="Live" />
        <div className="demand-list">
          {state.cities.map((city) => (
            <div className="demand-row" key={city.id}>
              <span>{isArabic ? city.ar : city.en}</span>
              <div><i style={{ width: `${city.demand}%` }} /></div>
              <strong>{city.demand}%</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <PanelTitle title={t.activeRide} meta={`${state.admin.recentRides?.length || 0}`} />
        <div className="list">
          {(state.admin.recentRides || []).map((ride) => (
            <div className="table-card" key={ride.id}>
              <strong>{ride.id.replace("ride_", "R-")}</strong>
              <StatusBadge status={ride.status} label={statusText[state.language][ride.status] || ride.status} />
              <b>{ride.fareIls} ₪</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function RouteSearchCard({ state, dispatch, t, isArabic, actionLabel, onAction }) {
  const [cardDraft, setCardDraft] = useState({
    cardHolderName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    saveVisaCardDemo: false
  });

  function updateCardDraft(field, value) {
    setCardDraft((draft) => ({
      ...draft,
      [field]:
        field === "cardNumber"
          ? formatCardNumberInput(value)
          : field === "cardExpiry"
            ? formatCardExpiryInput(value)
            : field === "cardCvv"
              ? value.replace(/\D/g, "").slice(0, 4)
              : value
    }));
  }

  function handleVisaCardSubmit(event) {
    event.preventDefault();
    const cardDigits = cardDraft.cardNumber.replace(/\D/g, "");
    const hasValidDemoCard =
      cardDraft.cardHolderName.trim().length >= 2 &&
      cardDigits.length >= 12 &&
      cardDraft.cardExpiry.length === 5 &&
      cardDraft.cardCvv.length >= 3;

    if (!hasValidDemoCard) {
      dispatch({
        type: "toast",
        message: isArabic ? "أكمل بيانات بطاقة VISA التجريبية أولًا." : "Complete the demo VISA card details first."
      });
      return;
    }

    dispatch({
      type: "patch",
      patch: {
        visaCardReady: true,
        visaCardPreview: maskCardNumber(cardDraft.cardNumber),
        saveVisaCardDemo: cardDraft.saveVisaCardDemo,
        toast: isArabic ? "تم اختيار بطاقة VISA للتجربة فقط." : "Demo VISA card selected."
      }
    });
  }

  return (
    <div className="route-search-card">
      <div className="route-search-head">
        <span>{isArabic ? "حجز مشوار" : "Book a ride"}</span>
        <strong>{isArabic ? "من / إلى" : "From / To"}</strong>
      </div>
      <div className="route-fields">
        <Field
          label={isArabic ? "From / من" : "From"}
          value={state.pickup}
          onChange={(pickup) => dispatch({ type: "patch", patch: { pickup } })}
        />
        <Field
          label={isArabic ? "To / إلى" : "To"}
          value={state.dropoff}
          onChange={(dropoff) => dispatch({ type: "patch", patch: { dropoff } })}
        />
      </div>
      <div className="route-options-row">
        <label className="field city-field">
          <span>{t.city}</span>
          <select value={state.cityId} onChange={(event) => dispatch({ type: "patch", patch: { cityId: event.target.value } })}>
            {state.cities.map((city) => (
              <option key={city.id} value={city.id}>
                {isArabic ? city.ar : city.en}
              </option>
            ))}
          </select>
        </label>
        <div className="segmented payment-choice-tabs" aria-label={t.payment}>
          <button
            className={state.paymentMethod === "cash" ? "active" : ""}
            type="button"
            aria-pressed={state.paymentMethod === "cash"}
            onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "cash" } })}
          >
            {t.cash}
          </button>
          <button
            className={state.paymentMethod === "visa" ? "active" : ""}
            type="button"
            aria-pressed={state.paymentMethod === "visa"}
            onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "visa" } })}
          >
            {t.visa}
          </button>
        </div>
      </div>
      {state.paymentMethod === "visa" && (
        <form className="visa-payment-panel visa-card-form" onSubmit={handleVisaCardSubmit}>
          <div className="payment-card-preview" aria-hidden="true">
            <span>VISA</span>
            <strong>{state.visaCardPreview || "•••• •••• •••• 4582"}</strong>
            <small>{cardDraft.cardHolderName || (isArabic ? "اسم صاحب البطاقة" : "CARD HOLDER")}</small>
          </div>
          <div className="visa-field-grid">
            <label className="field">
              <span>{isArabic ? "اسم صاحب البطاقة" : "Cardholder name"}</span>
              <input
                autoComplete="off"
                name="cardHolderName"
                value={cardDraft.cardHolderName}
                onChange={(event) => updateCardDraft("cardHolderName", event.target.value)}
                placeholder={isArabic ? "مثال: Ahmad Naser" : "Example: Ahmad Naser"}
              />
            </label>
            <label className="field">
              <span>{isArabic ? "رقم البطاقة" : "Card number"}</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                name="cardNumber"
                value={cardDraft.cardNumber}
                onChange={(event) => updateCardDraft("cardNumber", event.target.value)}
                placeholder="4242 4242 4242 4242"
              />
            </label>
            <label className="field">
              <span>{isArabic ? "تاريخ الانتهاء" : "Expiry"}</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                name="cardExpiry"
                value={cardDraft.cardExpiry}
                onChange={(event) => updateCardDraft("cardExpiry", event.target.value)}
                placeholder="MM/YY"
              />
            </label>
            <label className="field">
              <span>CVV</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                name="cardCvv"
                type="password"
                value={cardDraft.cardCvv}
                onChange={(event) => updateCardDraft("cardCvv", event.target.value)}
                placeholder="123"
              />
            </label>
          </div>
          <label className="save-card-toggle">
            <input
              checked={cardDraft.saveVisaCardDemo}
              name="saveVisaCardDemo"
              type="checkbox"
              onChange={(event) => updateCardDraft("saveVisaCardDemo", event.target.checked)}
            />
            <span>{isArabic ? "حفظ البطاقة للتجربة فقط" : "Save card for demo only"}</span>
          </label>
          <p className="secure-payment-note">
            {isArabic
              ? "الدفع الإلكتروني تجريبي حاليًا ولا يتم تنفيذ أي عملية دفع أو حفظ بيانات البطاقة في الخادم."
              : "Online payment is a safe placeholder. No real charge is made and card details are not stored on the backend."}
          </p>
          <button className="primary use-demo-visa-card" type="submit">
            {isArabic ? "استخدام هذه البطاقة" : "Use this card"}
          </button>
        </form>
      )}
      <QuoteStrip state={state} t={t} />
      <button className="primary ride-cta" onClick={onAction}>{actionLabel}</button>
    </div>
  );
}

function TopBar({ state, dispatch, t, compact }) {
  return (
    <div className="topbar">
      <div className="brand-mark">W</div>
      <div>
        <strong>{t.brand}</strong>
        {!compact && <small>{t.tagline}</small>}
      </div>
      <button className="icon-button" onClick={() => dispatch({ type: "patch", patch: { language: state.language === "ar" ? "en" : "ar" } })}>{t.language}</button>
    </div>
  );
}

function MapBoard({ state, dispatch = () => {}, selectedDriver, t, isArabic, showDrivers = true }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const driver = showDrivers ? selectedDriver : null;
  const customerLocation = customerLocationFromState(state);
  const driverLocation = driverLocationFromDriver(driver);
  const shouldShowDriverMarker = Boolean(showDrivers && driverLocation);
  const driverDistanceKm = shouldShowDriverMarker ? haversineKm(customerLocation, driverLocation) : null;
  const locationStatus = state.locationStatus || "default";
  const locationHint = mapLocationCopy(locationStatus, isArabic);

  useEffect(() => {
    if (state.role !== "customer" || locationStatus !== "default") return undefined;
    if (!("geolocation" in navigator)) {
      dispatch({
        type: "patch",
        patch: {
          customerLocation: { ...NABLUS_CENTER },
          locationStatus: "unsupported",
          toast: isArabic
            ? "المتصفح لا يدعم تحديد الموقع، سنستخدم نابلس افتراضيًا."
            : "Location is not supported, so Nablus is used by default."
        }
      });
      return undefined;
    }

    dispatch({ type: "patch", patch: { locationStatus: "requesting" } });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch({
          type: "patch",
          patch: {
            customerLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            locationStatus: "granted",
            toast: isArabic ? "تم تحديد موقعك الحالي." : "Your current location is set."
          }
        });
      },
      () => {
        dispatch({
          type: "patch",
          patch: {
            customerLocation: { ...NABLUS_CENTER },
            locationStatus: "denied",
            toast: isArabic
              ? "لا مشكلة، سنستخدم موقعًا افتراضيًا في نابلس."
              : "No problem, we will use a default location in Nablus."
          }
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );

    return undefined;
  }, [dispatch, isArabic, locationStatus, state.role]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return undefined;

    const map = L.map(mapRef.current, {
      center: [NABLUS_CENTER.lat, NABLUS_CENTER.lng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true
    });

    L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;
    window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      customerMarkerRef.current = null;
      driverMarkerRef.current = null;
      routeLineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapInstanceRef.current || !("ResizeObserver" in window)) return undefined;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const customerLatLng = [customerLocation.lat, customerLocation.lng];
    const customerIcon = createMapIcon("customer-location-marker", isArabic ? "أنت" : "You");

    if (!customerMarkerRef.current) {
      customerMarkerRef.current = L.marker(customerLatLng, { icon: customerIcon }).addTo(map);
    } else {
      customerMarkerRef.current.setLatLng(customerLatLng);
      customerMarkerRef.current.setIcon(customerIcon);
    }
    customerMarkerRef.current.bindPopup(isArabic ? "موقع الزبون" : "Customer location");

    if (shouldShowDriverMarker) {
      const driverLabel = driverDisplayName(driver, isArabic).slice(0, 1);
      const driverLatLng = [driverLocation.lat, driverLocation.lng];
      const driverIcon = createMapIcon("driver-location-marker", driverLabel);

      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker(driverLatLng, { icon: driverIcon }).addTo(map);
      } else {
        driverMarkerRef.current.setLatLng(driverLatLng);
        driverMarkerRef.current.setIcon(driverIcon);
      }
      driverMarkerRef.current.bindPopup(driverDisplayName(driver, isArabic));

      if (routeLineRef.current) routeLineRef.current.remove();
      routeLineRef.current = L.polyline([customerLatLng, driverLatLng], {
        color: "#c9912f",
        dashArray: "8 10",
        opacity: 0.9,
        weight: 4
      }).addTo(map);

      map.fitBounds(L.latLngBounds([customerLatLng, driverLatLng]), {
        padding: [48, 48],
        maxZoom: 15
      });
      return;
    }

    if (driverMarkerRef.current) {
      driverMarkerRef.current.remove();
      driverMarkerRef.current = null;
    }
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }
    map.setView(customerLatLng, Math.max(map.getZoom(), 14), { animate: true });
  }, [
    customerLocation.lat,
    customerLocation.lng,
    driver,
    driverLocation?.lat,
    driverLocation?.lng,
    isArabic,
    shouldShowDriverMarker
  ]);

  return (
    <div className="map-board real-map-board">
      <div
        className="nablus-live-map"
        ref={mapRef}
        aria-label={isArabic ? "خريطة نابلس الحية" : "Live Nablus map"}
      />
      <div className="map-compass">N</div>
      <div className="map-sheet real-map-sheet">
        <span>{showDrivers ? (isArabic ? "تتبع الكابتن" : "Captain tracking") : (isArabic ? "معاينة المسار" : "Route preview")}</span>
        <strong>{driver ? driverDisplayName(driver, isArabic) : (isArabic ? "موقعك في نابلس" : "Your Nablus location")}</strong>
        <div className="map-route-summary">
          <small>{state.pickup}</small>
          <small>{state.dropoff}</small>
          {driverDistanceKm !== null && (
            <small>{isArabic ? "المسافة بين الكابتن وموقعك" : "Captain to customer distance"}: {formatDistanceKm(driverDistanceKm)} km</small>
          )}
          <small className={`location-hint ${locationStatus}`}>{locationHint}</small>
        </div>
      </div>
    </div>
  );
}

function LegacyMapBoard({ state, selectedDriver, t, isArabic, showDrivers = true }) {
  const driver = showDrivers ? selectedDriver || state.drivers[0] : null;
  return (
    <div className="map-board">
      <div className="map-zone zone-a" />
      <div className="map-zone zone-b" />
      <div className="map-zone zone-c" />
      <div className="road road-a" />
      <div className="road road-b" />
      <div className="road road-c" />
      <div className="route-line" />
      <div className="pin pickup">
        <span>{isArabic ? "من" : "F"}</span>
      </div>
      <div className="pin drop">
        <span>{isArabic ? "إلى" : "T"}</span>
      </div>
      {showDrivers && state.drivers.map((item, index) => (
        <div
          className={`car-pin ${item.id === driver?.id ? "selected" : ""}`}
          key={item.id}
          style={{ insetInlineStart: `${25 + index * 24}%`, top: `${36 + index * 13}%` }}
        >
          {item.nameEn.slice(0, 1)}
        </div>
      ))}
      <div className="map-compass">N</div>
      <div className="map-sheet">
        <span>{isArabic ? "معاينة المسار" : "Route preview"}</span>
        <strong>{driver ? (isArabic ? driver.nameAr : driver.nameEn) : (isArabic ? "معاينة الرحلة" : "Trip preview")}</strong>
        <div className="map-route-summary">
          <small>{state.pickup}</small>
          <small>{state.dropoff}</small>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function PanelTitle({ title, meta }) {
  return (
    <div className="panel-title">
      <h3>{title}</h3>
      <span className="panel-meta">{meta}</span>
    </div>
  );
}

function StatusBadge({ status, label }) {
  return <span className={`status-badge status-${status}`}>{label}</span>;
}

function QuoteStrip({ state, t, compact }) {
  const quote = state.quote;
  return (
    <div className={`quote-strip ${compact ? "compact" : ""}`}>
      <span><small>{t.fare}</small><strong>{quote.fareIls} ₪</strong></span>
      <span><small>{t.distance}</small><strong>{quote.distanceKm} km</strong></span>
      <span><small>{t.eta}</small><strong>{quote.etaMinutes} min</strong></span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <section className="metric-card">
      <small>{label}</small>
      <strong>{value}</strong>
    </section>
  );
}

function Avatar({ label }) {
  return <span className="avatar">{label}</span>;
}

function Toast({ message }) {
  return message ? <div className="toast">{message}</div> : null;
}

export default App;
