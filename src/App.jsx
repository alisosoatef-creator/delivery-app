import { useEffect, useMemo, useReducer, useState } from "react";

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
  cities: fallbackCities,
  drivers: fallbackDrivers,
  selectedDriverId: "drv_ahmad",
  ride: null,
  quote: { fareIls: 24, distanceKm: 5.8, etaMinutes: 7 },
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

function findRideDriver(ride, state, selectedDriver) {
  return state.drivers.find((driver) => driver.id === ride?.driverId) || selectedDriver || state.drivers[0] || {};
}

function driverDisplayName(driver, isArabic) {
  if (!driver) return isArabic ? "سائق واصل" : "Wasel driver";
  return isArabic ? driver.nameAr || driver.nameEn || "سائق واصل" : driver.nameEn || driver.nameAr || "Wasel driver";
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
      const driver = findRideDriver(ride, state, selectedDriver);
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
        driver,
        driverName: driverDisplayName(driver, isArabic),
        paymentMethod,
        paymentLabel: paymentMethod === "wallet" ? (isArabic ? "محفظة" : "Wallet") : (isArabic ? "كاش" : "Cash")
      };
    });
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const t = text[state.language];
  const isArabic = state.language === "ar";

  useEffect(() => {
    document.documentElement.lang = state.language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic, state.language]);

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
    const payload = {
      cityId: state.cityId,
      pickup: state.pickup,
      dropoff: state.dropoff,
      paymentMethod: state.paymentMethod,
      distanceKm: state.quote.distanceKm
    };
    try {
      const result = await api("/api/rides", { method: "POST", body: JSON.stringify(payload) });
      dispatch({
        type: "patch",
        patch: {
          ride: result.ride,
          selectedDriverId: result.driver?.id || state.selectedDriverId,
          backendLive: true,
          toast: isArabic ? "تم إنشاء الطلب" : "Ride requested"
        }
      });
    } catch {
      dispatch({
        type: "patch",
        patch: {
          ride: {
            id: "local_ride",
            status: "accepted",
            pickup: state.pickup,
            dropoff: state.dropoff,
            fareIls: state.quote.fareIls,
            distanceKm: state.quote.distanceKm,
            etaMinutes: selectedDriver?.etaMinutes || state.quote.etaMinutes,
            driverId: selectedDriver?.id
          },
          toast: isArabic ? "تم إنشاء طلب محلي" : "Local ride created"
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

  return (
    <Shell {...sharedProps}>
      {state.role === "admin" && <AdminPanel {...sharedProps} />}
      {state.role === "driver" && <DriverPanel {...sharedProps} />}
      {state.role === "customer" && <CustomerPanel {...sharedProps} />}
    </Shell>
  );
}

function AuthScreen({ state, dispatch, t, isArabic, requestOtp, login }) {
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
        <MapBoard state={state} selectedDriver={state.drivers[0]} t={t} isArabic={isArabic} />
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

function CustomerPanel(props) {
  const { state, dispatch, t, isArabic, selectedDriver, requestRide, updateRideStatus } = props;
  const nextStatus = state.ride?.status === "accepted" ? "arriving" : state.ride?.status === "arriving" ? "picked_up" : "completed";
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

  return (
    <div className="stage-one-grid">
      <section className="stage-one-copy">
        <h1>{isArabic ? "اختَر وجهتك ودع واصل يرتب المشوار" : "Choose your route and let Wasel arrange the ride"}</h1>
        <p>
          {isArabic
            ? "هذه هي واجهة المرحلة الأولى: نقطة الانطلاق، الوجهة، تقدير السعر، وخريطة واضحة قبل إرسال الطلب."
            : "This is the phase-one ride flow: pickup, dropoff, fare estimate, and a clear map preview before request."}
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
        <MapBoard state={state} selectedDriver={selectedDriver} t={t} isArabic={isArabic} />
      </section>

      <section className="panel support-panel">
        <PanelTitle title={t.nearbyDrivers} meta={`${state.drivers.length}`} />
        <div className="list">
          {state.drivers.map((driver) => (
            <button
              className={`driver-card ${state.selectedDriverId === driver.id ? "selected" : ""}`}
              key={driver.id}
              onClick={() => dispatch({ type: "patch", patch: { selectedDriverId: driver.id } })}
            >
              <Avatar label={(isArabic ? driver.nameAr : driver.nameEn).slice(0, 1)} />
              <span>
                <strong>{isArabic ? driver.nameAr : driver.nameEn}</strong>
                <small>{driver.vehicle} · {driver.distanceKm} km</small>
              </span>
              <b>{driver.rating}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="phase-two-panel">
        <PhaseTwoExperience
          state={state}
          dispatch={dispatch}
          t={t}
          isArabic={isArabic}
          selectedDriver={selectedDriver}
          nextStatus={nextStatus}
          updateRideStatus={updateRideStatus}
        />
      </section>

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
        <RideDetailPage ride={selectedHistoryRide} state={state} t={t} isArabic={isArabic} />
      </section>

      <section className="profile-panel">
        <AccountProfilePanel
          state={state}
          dispatch={dispatch}
          t={t}
          isArabic={isArabic}
          rideHistory={rideHistory}
          selectedDriver={selectedDriver}
        />
      </section>

      <section className="wallet-panel">
        <WalletPaymentPanel
          state={state}
          dispatch={dispatch}
          t={t}
          isArabic={isArabic}
          rideHistory={rideHistory}
        />
      </section>

      <section className="settings-panel">
        <AccountSettingsPanel state={state} dispatch={dispatch} t={t} isArabic={isArabic} />
      </section>
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
    paymentLabel: state.paymentMethod === "wallet" ? t.wallet : t.cash
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
        <MapBoard state={state} selectedDriver={selectedDriver} t={t} isArabic={isArabic} />
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
        <MapBoard state={state} selectedDriver={selectedDriver} t={t} isArabic={isArabic} />
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

function PhaseTwoExperience({ state, dispatch, t, isArabic, selectedDriver, nextStatus, updateRideStatus }) {
  const ride = state.ride;
  const driver = selectedDriver || state.drivers[0] || {};
  const rideStatus = ride?.status || "searching";
  const statusLabel = ride ? statusText[state.language][rideStatus] || rideStatus : isArabic ? "جاهز للبحث" : "Ready to search";
  const driverName = isArabic ? driver.nameAr || "سائق واصل" : driver.nameEn || "Wasel driver";
  const vehicle = driver.vehicle || (isArabic ? "مركبة مريحة" : "Comfort vehicle");
  const plate = driver.plate || (isArabic ? "غير متاح" : "Not available");
  const rating = driver.rating || "4.9";
  const eta = ride?.etaMinutes || state.quote.etaMinutes;
  const fare = ride?.fareIls || state.quote.fareIls;
  const distance = ride?.distanceKm || state.quote.distanceKm;
  const isSearching = !ride || rideStatus === "searching";
  const rideCode = ride ? `R-${ride.id.replace("ride_", "").slice(0, 6).toUpperCase()}` : "-";

  function notify(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  return (
    <div className="phase-two-stack">
      <section className={`phase-two-card searching-driver ${isSearching ? "is-searching" : "is-matched"}`}>
        <div className="search-visual" aria-hidden="true">
          <span />
          <i />
        </div>
        <div className="phase-two-copy">
          <span>{isArabic ? "البحث عن سائق" : "Searching driver"}</span>
          <h3>{isSearching ? (isArabic ? "نبحث عن أفضل سائق قريب" : "Finding the best nearby driver") : (isArabic ? "تم العثور على السائق" : "Driver matched")}</h3>
          <p>
            {isSearching
              ? (isArabic ? "سيظهر السائق هنا فور قبول الطلب." : "The driver will appear here as soon as the request is accepted.")
              : (isArabic ? `${driverName} في طريقه إليك خلال ${eta} دقائق.` : `${driverName} is heading your way in ${eta} minutes.`)}
          </p>
        </div>
        <StatusBadge status={rideStatus} label={statusLabel} />
      </section>

      <section className="phase-two-card driver-match-card">
        <div className="driver-card-top">
          <Avatar label={driverName.slice(0, 1)} />
          <div>
            <span>{isArabic ? "السائق" : "Driver"}</span>
            <strong>{driverName}</strong>
          </div>
          <b>{rating}</b>
        </div>
        <div className="driver-meta-grid">
          <span><small>{isArabic ? "السيارة" : "Vehicle"}</small><strong>{vehicle}</strong></span>
          <span><small>{isArabic ? "رقم اللوحة" : "Plate"}</small><strong>{plate}</strong></span>
          <span><small>{t.eta}</small><strong>{eta} min</strong></span>
        </div>
        <div className="ride-action-row">
          <button className="secondary danger-soft" disabled={!ride} onClick={() => notify("الإلغاء غير مفعل في هذه النسخة", "Cancel is not enabled in this build")}>
            {isArabic ? "إلغاء الرحلة" : "Cancel ride"}
          </button>
          <button className="secondary" disabled={!ride} onClick={() => notify("سيتم فتح الاتصال عند ربط الهاتف", "Calling will be enabled when phone data is connected")}>
            {isArabic ? "اتصال" : "Call"}
          </button>
          <button className="secondary" disabled={!ride} onClick={() => notify("الرسائل ستظهر عند تفعيل المحادثة", "Messages will appear when chat is enabled")}>
            {isArabic ? "رسالة" : "Message"}
          </button>
        </div>
      </section>

      <section className="phase-two-card tracking-card">
        <PanelTitle title={isArabic ? "تتبع السائق" : "Driver tracking"} meta={<StatusBadge status={rideStatus} label={statusLabel} />} />
        <div className="tracking-map-shell">
          <MapBoard state={state} selectedDriver={driver} t={t} isArabic={isArabic} />
        </div>
      </section>

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
        <button className="secondary" disabled={!ride || rideStatus === "completed"} onClick={() => updateRideStatus(nextStatus)}>
          {rideStatus === "completed" ? statusText[state.language].completed : t.status}
        </button>
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

function RideDetailPage({ ride, state, t, isArabic }) {
  if (!ride) {
    return (
      <div className="ride-detail-card">
        <PanelTitle title={isArabic ? "تفاصيل الرحلة" : "Ride details"} meta="-" />
        <div className="detail-empty">{isArabic ? "اختر رحلة لعرض التفاصيل" : "Select a ride to view details"}</div>
      </div>
    );
  }

  const driver = ride.driver || {};
  const driverName = ride.driverName || driverDisplayName(driver, isArabic);
  const vehicle = driver.vehicle || (isArabic ? "مركبة مريحة" : "Comfort vehicle");
  const plate = driver.plate || (isArabic ? "غير متاح" : "Not available");
  const rating = driver.rating || "4.9";
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

      <div className="detail-driver-card">
        <Avatar label={driverName.slice(0, 1)} />
        <div>
          <span>{isArabic ? "بيانات السائق" : "Driver details"}</span>
          <strong>{driverName}</strong>
          <small>{vehicle} · {plate}</small>
        </div>
        <b>{rating}</b>
      </div>

      <div className="detail-map-shell">
        <MapBoard state={mapState} selectedDriver={driver} t={t} isArabic={isArabic} />
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
          <strong>{state.paymentMethod === "wallet" ? t.wallet : t.cash}</strong>
        </span>
      </div>

      <div className="account-stats-grid">
        <span><small>{isArabic ? "كل الرحلات" : "All rides"}</small><strong>{rideHistory.length}</strong></span>
        <span><small>{isArabic ? "مكتملة" : "Completed"}</small><strong>{completedRides}</strong></span>
        <span><small>{isArabic ? "قيد التنفيذ" : "Active"}</small><strong>{activeRides}</strong></span>
        <span><small>{isArabic ? "إجمالي ظاهر" : "Visible spend"}</small><strong>{totalSpent} ₪</strong></span>
        <span><small>{isArabic ? "تقييم الخدمة" : "Service rating"}</small><strong>{rating}</strong></span>
      </div>

      <div className="account-action-row">
        <button className="secondary" onClick={() => notify("تعديل الحساب غير مفعل في هذه النسخة", "Profile editing is not enabled in this build")}>
          {isArabic ? "تعديل الحساب" : "Edit profile"}
        </button>
        <button className="secondary danger-soft" onClick={() => dispatch({ type: "patch", patch: { session: null, role: "customer" } })}>
          {t.logout}
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
      <PanelTitle title={isArabic ? "المحفظة والدفع" : "Wallet and payment"} meta={isArabic ? "واجهة آمنة" : "Safe UI"} />
      <div className="wallet-card-visual">
        <div>
          <span>{isArabic ? "Wasel Wallet" : "Wasel Wallet"}</span>
          <strong>{isArabic ? "محفظة تجريبية" : "Demo wallet"}</strong>
          <small>{isArabic ? "لا يوجد شحن أو دفع حقيقي هنا" : "No real charging or payment is connected"}</small>
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
          className={state.paymentMethod === "wallet" ? "selected" : ""}
          onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "wallet" } })}
        >
          <span>{isArabic ? "محفظة" : "Wallet"}</span>
          <small>{isArabic ? "Placeholder آمن فقط" : "Safe placeholder only"}</small>
        </button>
      </div>

      <div className="payment-activity">
        <div className="section-mini-title">
          <strong>{isArabic ? "سجل عمليات الدفع" : "Payment activity"}</strong>
          <small>{paymentRows.length ? (isArabic ? "حسب الرحلات الظاهرة" : "Based on visible rides") : (isArabic ? "لا توجد عمليات" : "No activity")}</small>
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

function AccountSettingsPanel({ state, dispatch, t, isArabic }) {
  function notify(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  return (
    <div className="account-card settings-card">
      <PanelTitle title={isArabic ? "إعدادات الحساب" : "Account settings"} meta={isArabic ? "بسيطة وآمنة" : "Simple and safe"} />
      <div className="settings-grid">
        <label className="settings-row field">
          <span>{t.city}</span>
          <select value={state.cityId} onChange={(event) => dispatch({ type: "patch", patch: { cityId: event.target.value } })}>
            {state.cities.map((city) => (
              <option key={city.id} value={city.id}>{isArabic ? city.ar : city.en}</option>
            ))}
          </select>
        </label>
        <div className="settings-row">
          <span>
            <small>{isArabic ? "لغة التطبيق" : "App language"}</small>
            <strong>{isArabic ? "العربية" : "English"}</strong>
          </span>
          <button className="secondary" onClick={() => dispatch({ type: "patch", patch: { language: state.language === "ar" ? "en" : "ar" } })}>
            {t.language}
          </button>
        </div>
        <div className="settings-row">
          <span>
            <small>{isArabic ? "التنبيهات" : "Notifications"}</small>
            <strong>{isArabic ? "جاهزة للربط لاحقًا" : "Ready to connect later"}</strong>
          </span>
          <button className="secondary" onClick={() => notify("إعدادات التنبيهات غير مرتبطة بعد", "Notification settings are not connected yet")}>
            {isArabic ? "إدارة" : "Manage"}
          </button>
        </div>
      </div>
    </div>
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
        <div className="segmented">
          <button className={state.paymentMethod === "cash" ? "active" : ""} onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "cash" } })}>{t.cash}</button>
          <button className={state.paymentMethod === "wallet" ? "active" : ""} onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "wallet" } })}>{t.wallet}</button>
        </div>
      </div>
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

function MapBoard({ state, selectedDriver, t, isArabic }) {
  const driver = selectedDriver || state.drivers[0];
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
      {state.drivers.map((item, index) => (
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
        <strong>{driver ? (isArabic ? driver.nameAr : driver.nameEn) : t.nearbyDrivers}</strong>
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
