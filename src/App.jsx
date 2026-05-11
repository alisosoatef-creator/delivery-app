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
    completed: "مكتمل"
  },
  en: {
    searching: "Searching",
    accepted: "Accepted",
    arriving: "Driver arriving",
    picked_up: "Picked up",
    completed: "Completed"
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
    <main className="auth-layout">
      <section className="auth-card">
        <TopBar state={state} dispatch={dispatch} t={t} />
        <div className="hero-copy">
          <h1>{t.headline}</h1>
          <p>{t.subhead}</p>
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
      <section className="map-showcase">
        <MapBoard state={state} selectedDriver={state.drivers[0]} t={t} isArabic={isArabic} />
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
  return (
    <div className="content-grid">
      <section className="panel">
        <PanelTitle title={t.requestRide} meta={isArabic ? "مطابقة حسب أقرب سائق" : "Nearest driver matching"} />
        <div className="form-grid">
          <Field label={t.pickup} value={state.pickup} onChange={(pickup) => dispatch({ type: "patch", patch: { pickup } })} />
          <Field label={t.dropoff} value={state.dropoff} onChange={(dropoff) => dispatch({ type: "patch", patch: { dropoff } })} />
          <div className="segmented">
            <button className={state.paymentMethod === "cash" ? "active" : ""} onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "cash" } })}>{t.cash}</button>
            <button className={state.paymentMethod === "wallet" ? "active" : ""} onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "wallet" } })}>{t.wallet}</button>
          </div>
          <button className="primary" onClick={requestRide}>{t.requestRide}</button>
        </div>
        <QuoteStrip state={state} t={t} />
      </section>

      <section className="panel wide">
        <MapBoard state={state} selectedDriver={selectedDriver} t={t} isArabic={isArabic} />
      </section>

      <section className="panel">
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

      <section className="panel">
        <PanelTitle title={t.activeRide} meta={state.ride ? statusText[state.language][state.ride.status] : "-"} />
        {state.ride ? (
          <div className="ride-card">
            <strong>{state.ride.pickup}</strong>
            <small>{state.ride.dropoff}</small>
            <QuoteStrip state={{ ...state, quote: state.ride }} t={t} compact />
            <button className="secondary" disabled={state.ride.status === "completed"} onClick={() => updateRideStatus(nextStatus)}>
              {state.ride.status === "completed" ? statusText[state.language].completed : t.status}
            </button>
          </div>
        ) : (
          <div className="empty">{t.noRide}</div>
        )}
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
        <PanelTitle title={isArabic ? "طلب قريب" : "Nearby request"} meta={state.driverOnline ? "Live" : t.offline} />
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
              <small>{statusText[state.language][ride.status] || ride.status}</small>
              <b>{ride.fareIls} ₪</b>
            </div>
          ))}
        </div>
      </section>
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
      <div className="road road-a" />
      <div className="road road-b" />
      <div className="route-line" />
      <div className="pin pickup">C</div>
      <div className="pin drop">D</div>
      {state.drivers.map((item, index) => (
        <div
          className={`car-pin ${item.id === driver?.id ? "selected" : ""}`}
          key={item.id}
          style={{ insetInlineStart: `${25 + index * 24}%`, top: `${36 + index * 13}%` }}
        >
          {item.nameEn.slice(0, 1)}
        </div>
      ))}
      <div className="map-sheet">
        <span>{isArabic ? "تتبع مباشر" : "Live tracking"}</span>
        <strong>{driver ? (isArabic ? driver.nameAr : driver.nameEn) : t.nearbyDrivers}</strong>
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
      <span>{meta}</span>
    </div>
  );
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
