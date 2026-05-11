import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { fallbackCities, fallbackDrivers } from "../data/fallback";
import { apiFetch, defaultApiBase } from "../lib/api";

const copy = {
  ar: {
    brand: "واصل",
    subtitle: "تطبيق توصيل فعلي عبر Expo",
    customer: "زبون",
    driver: "دلفري",
    admin: "إدارة",
    phone: "رقم الهاتف",
    otp: "رمز OTP",
    api: "رابط API",
    code: "رمز التجربة 1234",
    login: "دخول",
    send: "إرسال الرمز",
    city: "المدينة",
    pickup: "الاستلام",
    dropoff: "التسليم",
    request: "اطلب سائق",
    cash: "كاش",
    wallet: "محفظة",
    fare: "السعر",
    distance: "المسافة",
    eta: "الوصول",
    nearby: "السائقين القريبين",
    active: "الطلب الحالي",
    noRide: "لا يوجد طلب فعال الآن",
    online: "أونلاين",
    offline: "أوفلاين",
    complete: "إنهاء الرحلة",
    live: "متصل",
    local: "محلي",
    revenue: "إيراد اليوم",
    activeRides: "طلبات فعالة",
    onlineDrivers: "سائقين أونلاين",
    language: "EN",
    logout: "خروج"
  },
  en: {
    brand: "Wasel",
    subtitle: "Real mobile app through Expo",
    customer: "Customer",
    driver: "Driver",
    admin: "Admin",
    phone: "Phone",
    otp: "OTP",
    api: "API URL",
    code: "Demo code 1234",
    login: "Login",
    send: "Send code",
    city: "City",
    pickup: "Pickup",
    dropoff: "Dropoff",
    request: "Request driver",
    cash: "Cash",
    wallet: "Wallet",
    fare: "Fare",
    distance: "Distance",
    eta: "ETA",
    nearby: "Nearby drivers",
    active: "Active ride",
    noRide: "No active ride now",
    online: "Online",
    offline: "Offline",
    complete: "Complete ride",
    live: "Live",
    local: "Local",
    revenue: "Today revenue",
    activeRides: "Active rides",
    onlineDrivers: "Online drivers",
    language: "عربي",
    logout: "Logout"
  }
};

const initialQuote = { fareIls: 24, distanceKm: 5.8, etaMinutes: 7 };

export default function WaselMobileApp() {
  const [language, setLanguage] = useState("ar");
  const [role, setRole] = useState("customer");
  const [session, setSession] = useState(null);
  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [phone, setPhone] = useState("+970 59 000 0000");
  const [otp, setOtp] = useState("1234");
  const [otpRequestId, setOtpRequestId] = useState("");
  const [cityId, setCityId] = useState("nablus");
  const [cities, setCities] = useState(fallbackCities);
  const [drivers, setDrivers] = useState(fallbackDrivers);
  const [selectedDriverId, setSelectedDriverId] = useState("drv_ahmad");
  const [pickup, setPickup] = useState("جامعة النجاح - نابلس");
  const [dropoff, setDropoff] = useState("رفيديا - نابلس");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [quote, setQuote] = useState(initialQuote);
  const [ride, setRide] = useState(null);
  const [driverOnline, setDriverOnline] = useState(false);
  const [admin, setAdmin] = useState({ activeRides: 3, onlineDrivers: 2, todayRevenueIls: 83 });
  const [backendLive, setBackendLive] = useState(false);
  const [message, setMessage] = useState("");

  const t = copy[language];
  const isArabic = language === "ar";
  const selectedDriver = useMemo(
    () => drivers.find((driver) => driver.id === selectedDriverId) || drivers[0],
    [drivers, selectedDriverId]
  );

  useEffect(() => {
    let cancelled = false;
    apiFetch(apiBase, "/api/bootstrap")
      .then((payload) => {
        if (cancelled) return;
        setCities(payload.cities);
        setDrivers(payload.drivers);
        setAdmin(payload.admin);
        setBackendLive(true);
      })
      .catch(() => setBackendLive(false));
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  useEffect(() => {
    apiFetch(apiBase, "/api/rides/quote", {
      method: "POST",
      body: JSON.stringify({ cityId, distanceKm: 5.8 })
    })
      .then((payload) => {
        setQuote(payload);
        setBackendLive(true);
      })
      .catch(() => {
        const city = cities.find((item) => item.id === cityId) || cities[0];
        setQuote({
          fareIls: Math.round(city.baseFare + 5.8 * 2.35),
          distanceKm: 5.8,
          etaMinutes: 7
        });
        setBackendLive(false);
      });
  }, [apiBase, cityId]);

  async function requestOtp() {
    try {
      const payload = await apiFetch(apiBase, "/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ phone, role })
      });
      setOtpRequestId(payload.requestId);
      setBackendLive(true);
      setMessage(t.code);
    } catch {
      setOtpRequestId("local_otp");
      setBackendLive(false);
      setMessage(t.code);
    }
  }

  async function login(targetRole = role) {
    if (targetRole === "admin") {
      setRole("admin");
      setSession({ role: "admin" });
      return;
    }

    if (otp !== "1234") {
      setMessage(isArabic ? "رمز OTP غير صحيح" : "Wrong OTP code");
      return;
    }

    try {
      const payload = await apiFetch(apiBase, "/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ requestId: otpRequestId || "local_otp", code: otp })
      });
      setSession(payload.user);
      setRole(targetRole);
      setBackendLive(true);
    } catch {
      setSession({ role: targetRole });
      setRole(targetRole);
      setBackendLive(false);
    }
  }

  async function requestRide() {
    const body = {
      cityId,
      pickup,
      dropoff,
      paymentMethod,
      distanceKm: quote.distanceKm
    };

    try {
      const payload = await apiFetch(apiBase, "/api/rides", {
        method: "POST",
        body: JSON.stringify(body)
      });
      setRide(payload.ride);
      if (payload.driver) setSelectedDriverId(payload.driver.id);
      setBackendLive(true);
    } catch {
      setRide({
        id: "local_ride",
        pickup,
        dropoff,
        status: "accepted",
        fareIls: quote.fareIls,
        distanceKm: quote.distanceKm,
        etaMinutes: quote.etaMinutes
      });
      setBackendLive(false);
    }
  }

  async function completeRide() {
    if (!ride) return;
    try {
      const payload = await apiFetch(apiBase, `/api/rides/${ride.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: "completed" })
      });
      setRide(payload.ride);
      setBackendLive(true);
    } catch {
      setRide({ ...ride, status: "completed" });
      setBackendLive(false);
    }
  }

  async function toggleDriverOnline(value) {
    setDriverOnline(value);
    try {
      await apiFetch(apiBase, "/api/drivers/status", {
        method: "POST",
        body: JSON.stringify({ driverId: selectedDriver.id, online: value })
      });
      setBackendLive(true);
    } catch {
      setBackendLive(false);
    }
  }

  const shared = {
    t,
    isArabic,
    role,
    setRole,
    language,
    setLanguage,
    apiBase,
    setApiBase,
    phone,
    setPhone,
    otp,
    setOtp,
    cityId,
    setCityId,
    cities,
    drivers,
    selectedDriver,
    selectedDriverId,
    setSelectedDriverId,
    pickup,
    setPickup,
    dropoff,
    setDropoff,
    paymentMethod,
    setPaymentMethod,
    quote,
    ride,
    backendLive,
    admin,
    requestOtp,
    login,
    requestRide,
    driverOnline,
    toggleDriverOnline,
    completeRide,
    message,
    setSession
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="light" />
      {!session ? <LoginScreen {...shared} /> : <Dashboard {...shared} />}
    </ScrollView>
  );
}

function LoginScreen(props) {
  const { t, isArabic, role, setRole, language, setLanguage, apiBase, setApiBase, phone, setPhone, otp, setOtp, requestOtp, login, backendLive, message } = props;

  return (
    <View style={styles.stack}>
      <Header t={t} language={language} setLanguage={setLanguage} backendLive={backendLive} />
      <View style={styles.hero}>
        <Text selectable style={[styles.heroTitle, textAlign(isArabic)]}>{t.brand}</Text>
        <Text selectable style={[styles.subtitle, textAlign(isArabic)]}>{t.subtitle}</Text>
      </View>
      <View style={styles.roleGrid}>
        {["customer", "driver"].map((item) => (
          <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleCard, role === item && styles.selected]}>
            <Text selectable style={styles.roleIcon}>{item === "customer" ? "C" : "D"}</Text>
            <Text selectable style={[styles.cardTitle, textAlign(isArabic)]}>{item === "customer" ? t.customer : t.driver}</Text>
          </Pressable>
        ))}
      </View>
      <Field label={t.phone} value={phone} onChangeText={setPhone} isArabic={isArabic} keyboardType="phone-pad" />
      <Field label={t.otp} value={otp} onChangeText={setOtp} isArabic={isArabic} keyboardType="number-pad" />
      <Field label={t.api} value={apiBase} onChangeText={setApiBase} isArabic={isArabic} autoCapitalize="none" />
      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={requestOtp}><Text selectable style={styles.secondaryText}>{t.send}</Text></Pressable>
        <Pressable style={styles.primaryButton} onPress={() => login(role)}><Text selectable style={styles.primaryText}>{t.login}</Text></Pressable>
      </View>
      <Pressable style={styles.adminButton} onPress={() => login("admin")}><Text selectable style={styles.secondaryText}>{t.admin}</Text></Pressable>
      {!!message && <Text selectable style={[styles.message, textAlign(isArabic)]}>{message}</Text>}
    </View>
  );
}

function Dashboard(props) {
  const { t, isArabic, role, setRole, language, setLanguage, backendLive, setSession } = props;
  return (
    <View style={styles.stack}>
      <Header t={t} language={language} setLanguage={setLanguage} backendLive={backendLive} />
      <View style={styles.tabs}>
        {["customer", "driver", "admin"].map((item) => (
          <Pressable key={item} onPress={() => setRole(item)} style={[styles.tab, role === item && styles.tabActive]}>
            <Text selectable style={[styles.tabText, role === item && styles.tabTextActive]}>
              {item === "customer" ? t.customer : item === "driver" ? t.driver : t.admin}
            </Text>
          </Pressable>
        ))}
      </View>
      {role === "customer" && <CustomerView {...props} />}
      {role === "driver" && <DriverView {...props} />}
      {role === "admin" && <AdminView {...props} />}
      <Pressable style={styles.secondaryButton} onPress={() => setSession(null)}>
        <Text selectable style={[styles.secondaryText, textAlign(isArabic)]}>{t.logout}</Text>
      </Pressable>
    </View>
  );
}

function CustomerView(props) {
  const { t, isArabic, cities, cityId, setCityId, pickup, setPickup, dropoff, setDropoff, paymentMethod, setPaymentMethod, quote, drivers, selectedDriverId, setSelectedDriverId, selectedDriver, requestRide, ride, completeRide } = props;

  return (
    <View style={styles.stack}>
      <Panel title={t.request} isArabic={isArabic}>
        <CitySelector cities={cities} cityId={cityId} setCityId={setCityId} isArabic={isArabic} />
        <Field label={t.pickup} value={pickup} onChangeText={setPickup} isArabic={isArabic} />
        <Field label={t.dropoff} value={dropoff} onChangeText={setDropoff} isArabic={isArabic} />
        <View style={styles.segmented}>
          <Pressable style={[styles.segment, paymentMethod === "cash" && styles.segmentActive]} onPress={() => setPaymentMethod("cash")}><Text selectable style={styles.segmentText}>{t.cash}</Text></Pressable>
          <Pressable style={[styles.segment, paymentMethod === "wallet" && styles.segmentActive]} onPress={() => setPaymentMethod("wallet")}><Text selectable style={styles.segmentText}>{t.wallet}</Text></Pressable>
        </View>
        <QuoteStrip quote={quote} t={t} />
        <Pressable style={styles.primaryButton} onPress={requestRide}><Text selectable style={styles.primaryText}>{t.request}</Text></Pressable>
      </Panel>
      <MapCard selectedDriver={selectedDriver} isArabic={isArabic} />
      <Panel title={t.nearby} isArabic={isArabic}>
        {drivers.map((driver) => (
          <DriverRow key={driver.id} driver={driver} isArabic={isArabic} selected={driver.id === selectedDriverId} onPress={() => setSelectedDriverId(driver.id)} />
        ))}
      </Panel>
      <Panel title={t.active} isArabic={isArabic}>
        {ride ? (
          <View style={styles.stack}>
            <Text selectable style={[styles.cardTitle, textAlign(isArabic)]}>{ride.pickup}</Text>
            <Text selectable style={[styles.subtitle, textAlign(isArabic)]}>{ride.dropoff}</Text>
            <QuoteStrip quote={ride} t={t} />
            <Pressable style={styles.secondaryButton} onPress={completeRide}><Text selectable style={styles.secondaryText}>{t.complete}</Text></Pressable>
          </View>
        ) : (
          <Text selectable style={[styles.empty, textAlign(isArabic)]}>{t.noRide}</Text>
        )}
      </Panel>
    </View>
  );
}

function DriverView(props) {
  const { t, isArabic, selectedDriver, driverOnline, toggleDriverOnline, quote, ride, pickup, dropoff, setRole, completeRide } = props;
  const request = ride || { pickup, dropoff, fareIls: quote.fareIls, distanceKm: quote.distanceKm, etaMinutes: quote.etaMinutes };

  return (
    <View style={styles.stack}>
      <Panel title={t.driver} meta={driverOnline ? t.online : t.offline} isArabic={isArabic}>
        <DriverRow driver={selectedDriver} isArabic={isArabic} selected />
        <View style={styles.switchRow}>
          <Text selectable style={styles.label}>{driverOnline ? t.online : t.offline}</Text>
          <Switch value={driverOnline} onValueChange={toggleDriverOnline} />
        </View>
      </Panel>
      <MapCard selectedDriver={selectedDriver} isArabic={isArabic} />
      <Panel title={isArabic ? "طلب قريب" : "Nearby request"} isArabic={isArabic}>
        {driverOnline ? (
          <View style={styles.stack}>
            <Text selectable style={[styles.cardTitle, textAlign(isArabic)]}>{request.pickup}</Text>
            <Text selectable style={[styles.subtitle, textAlign(isArabic)]}>{request.dropoff}</Text>
            <QuoteStrip quote={request} t={t} />
            <Pressable style={styles.primaryButton} onPress={() => setRole("customer")}><Text selectable style={styles.primaryText}>{isArabic ? "عرض الطلب" : "View ride"}</Text></Pressable>
            <Pressable style={styles.secondaryButton} onPress={completeRide}><Text selectable style={styles.secondaryText}>{t.complete}</Text></Pressable>
          </View>
        ) : (
          <Text selectable style={[styles.empty, textAlign(isArabic)]}>{isArabic ? "افتح أونلاين حتى تظهر الطلبات" : "Go online to receive requests"}</Text>
        )}
      </Panel>
    </View>
  );
}

function AdminView({ t, isArabic, admin, cities }) {
  return (
    <View style={styles.stack}>
      <View style={styles.metrics}>
        <Metric label={t.activeRides} value={admin.activeRides} />
        <Metric label={t.onlineDrivers} value={admin.onlineDrivers} />
        <Metric label={t.revenue} value={`${admin.todayRevenueIls} ₪`} />
      </View>
      <Panel title={isArabic ? "الطلب حسب المدينة" : "Demand by city"} isArabic={isArabic}>
        {cities.map((city) => (
          <View style={styles.demandRow} key={city.id}>
            <Text selectable style={styles.demandName}>{isArabic ? city.ar : city.en}</Text>
            <View style={styles.demandTrack}><View style={[styles.demandFill, { width: `${city.demand}%` }]} /></View>
            <Text selectable style={styles.demandValue}>{city.demand}%</Text>
          </View>
        ))}
      </Panel>
    </View>
  );
}

function Header({ t, language, setLanguage, backendLive }) {
  return (
    <View style={styles.header}>
      <View style={styles.logo}><Text selectable style={styles.logoText}>W</Text></View>
      <View style={styles.headerText}>
        <Text selectable style={styles.brand}>{t.brand}</Text>
        <Text selectable style={styles.subtitle}>{backendLive ? t.live : t.local}</Text>
      </View>
      <Pressable style={styles.langButton} onPress={() => setLanguage(language === "ar" ? "en" : "ar")}>
        <Text selectable style={styles.secondaryText}>{t.language}</Text>
      </Pressable>
    </View>
  );
}

function Panel({ title, meta, isArabic, children }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text selectable style={[styles.panelTitle, textAlign(isArabic)]}>{title}</Text>
        {!!meta && <Text selectable style={styles.subtitle}>{meta}</Text>}
      </View>
      <View style={styles.stack}>{children}</View>
    </View>
  );
}

function Field({ label, isArabic, ...props }) {
  return (
    <View style={styles.field}>
      <Text selectable style={[styles.label, textAlign(isArabic)]}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#747b88"
        style={[styles.input, textAlign(isArabic)]}
      />
    </View>
  );
}

function CitySelector({ cities, cityId, setCityId, isArabic }) {
  return (
    <View style={styles.cityWrap}>
      {cities.map((city) => (
        <Pressable key={city.id} style={[styles.cityChip, cityId === city.id && styles.cityChipActive]} onPress={() => setCityId(city.id)}>
          <Text selectable style={[styles.cityText, textAlign(isArabic)]}>{isArabic ? city.ar : city.en}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function QuoteStrip({ quote, t }) {
  return (
    <View style={styles.quoteStrip}>
      <Metric label={t.fare} value={`${quote.fareIls} ₪`} small />
      <Metric label={t.distance} value={`${quote.distanceKm} km`} small />
      <Metric label={t.eta} value={`${quote.etaMinutes} min`} small />
    </View>
  );
}

function Metric({ label, value, small }) {
  return (
    <View style={[styles.metric, small && styles.metricSmall]}>
      <Text selectable style={styles.label}>{label}</Text>
      <Text selectable style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function DriverRow({ driver, isArabic, selected, onPress }) {
  const body = (
    <View style={[styles.driverRow, selected && styles.selected]}>
      <View style={styles.avatar}><Text selectable style={styles.avatarText}>{(isArabic ? driver.nameAr : driver.nameEn).slice(0, 1)}</Text></View>
      <View style={styles.driverInfo}>
        <Text selectable style={[styles.cardTitle, textAlign(isArabic)]}>{isArabic ? driver.nameAr : driver.nameEn}</Text>
        <Text selectable style={[styles.subtitle, textAlign(isArabic)]}>{driver.vehicle} · {driver.plate}</Text>
      </View>
      <Text selectable style={styles.rating}>{driver.rating}</Text>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

function MapCard({ selectedDriver, isArabic }) {
  return (
    <View style={styles.map}>
      <View style={[styles.road, styles.roadA]} />
      <View style={[styles.road, styles.roadB]} />
      <View style={styles.route} />
      <View style={[styles.pin, styles.pickupPin]}><Text selectable style={styles.pinText}>C</Text></View>
      <View style={[styles.pin, styles.dropPin]}><Text selectable style={styles.pinText}>D</Text></View>
      <View style={styles.carPin}><Text selectable style={styles.carText}>{selectedDriver?.nameEn?.slice(0, 1) || "W"}</Text></View>
      <View style={styles.mapSheet}>
        <Text selectable style={[styles.subtitle, textAlign(isArabic)]}>{isArabic ? "تتبع مباشر" : "Live tracking"}</Text>
        <Text selectable style={[styles.cardTitle, textAlign(isArabic)]}>{selectedDriver ? (isArabic ? selectedDriver.nameAr : selectedDriver.nameEn) : "Wasel"}</Text>
      </View>
    </View>
  );
}

function textAlign(isArabic) {
  return { textAlign: isArabic ? "right" : "left", writingDirection: isArabic ? "rtl" : "ltr" };
}

const colors = {
  bg: "#06070a",
  panel: "#11141a",
  panel2: "#171b23",
  text: "#f8f6ef",
  muted: "#a5a9b4",
  gold: "#f6c945",
  green: "#4bd487",
  border: "#2b303b"
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 14, paddingBottom: 36 },
  stack: { gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 42, height: 42, borderRadius: 10, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#151006", fontWeight: "900", fontSize: 18 },
  headerText: { flex: 1 },
  brand: { color: colors.text, fontSize: 22, fontWeight: "900" },
  hero: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 18, gap: 8 },
  heroTitle: { color: colors.text, fontSize: 42, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  roleGrid: { flexDirection: "row", gap: 10 },
  roleCard: { flex: 1, minHeight: 104, backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  selected: { borderColor: colors.gold, backgroundColor: "#1d1a12" },
  roleIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#332a12", color: colors.gold, textAlign: "center", paddingTop: 6, fontWeight: "900" },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  field: { gap: 7 },
  label: { color: colors.muted, fontSize: 12 },
  input: { minHeight: 46, borderColor: colors.border, borderWidth: 1, borderRadius: 10, backgroundColor: "#0b0e13", color: colors.text, paddingHorizontal: 12 },
  buttonRow: { flexDirection: "row", gap: 10 },
  primaryButton: { flex: 1, minHeight: 46, backgroundColor: colors.gold, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  primaryText: { color: "#151006", fontWeight: "900" },
  secondaryButton: { minHeight: 46, backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  secondaryText: { color: colors.text, fontWeight: "800" },
  adminButton: { minHeight: 44, backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  langButton: { minHeight: 38, minWidth: 58, backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  message: { color: colors.gold },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { flex: 1, minHeight: 42, borderColor: colors.border, borderWidth: 1, borderRadius: 10, backgroundColor: colors.panel2, alignItems: "center", justifyContent: "center" },
  tabActive: { borderColor: colors.gold, backgroundColor: "#1d1a12" },
  tabText: { color: colors.muted, fontWeight: "800" },
  tabTextActive: { color: colors.gold },
  panel: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 14, gap: 12 },
  panelHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  panelTitle: { color: colors.text, fontSize: 18, fontWeight: "900", flex: 1 },
  cityWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cityChip: { borderColor: colors.border, borderWidth: 1, backgroundColor: colors.panel2, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  cityChipActive: { borderColor: colors.gold, backgroundColor: "#1d1a12" },
  cityText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  segmented: { flexDirection: "row", borderColor: colors.border, borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  segment: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", backgroundColor: colors.panel2 },
  segmentActive: { backgroundColor: colors.gold },
  segmentText: { color: colors.text, fontWeight: "800" },
  quoteStrip: { flexDirection: "row", gap: 8 },
  metric: { flex: 1, backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 },
  metricSmall: { padding: 10 },
  metricValue: { color: colors.gold, fontSize: 20, fontWeight: "900" },
  metrics: { flexDirection: "row", gap: 8 },
  driverRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 10 },
  avatar: { width: 42, height: 42, borderRadius: 10, backgroundColor: "#332a12", alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.gold, fontWeight: "900" },
  driverInfo: { flex: 1 },
  rating: { color: colors.gold, fontWeight: "900" },
  empty: { minHeight: 90, color: colors.muted, textAlignVertical: "center" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.panel2, borderRadius: 12, padding: 12 },
  demandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  demandName: { color: colors.text, width: 76 },
  demandTrack: { flex: 1, height: 9, backgroundColor: "#0b0e13", borderRadius: 999, overflow: "hidden", borderColor: colors.border, borderWidth: 1 },
  demandFill: { height: "100%", backgroundColor: colors.gold },
  demandValue: { color: colors.gold, width: 44, fontWeight: "900" },
  map: { minHeight: 280, borderRadius: 16, overflow: "hidden", backgroundColor: "#0c1017", borderColor: colors.border, borderWidth: 1 },
  road: { position: "absolute", height: 2, backgroundColor: "rgba(255,255,255,.14)" },
  roadA: { width: "78%", top: "29%", left: "10%", transform: [{ rotate: "18deg" }] },
  roadB: { width: "82%", top: "64%", left: "8%", transform: [{ rotate: "-9deg" }] },
  route: { position: "absolute", width: "58%", top: "49%", left: "22%", borderTopWidth: 3, borderStyle: "dashed", borderTopColor: colors.gold, transform: [{ rotate: "-13deg" }] },
  pin: { position: "absolute", width: 36, height: 36, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  pickupPin: { left: "22%", top: "62%", backgroundColor: "#fff" },
  dropPin: { left: "78%", top: "38%", backgroundColor: colors.gold },
  pinText: { color: "#151006", fontWeight: "900" },
  carPin: { position: "absolute", left: "45%", top: "42%", width: 44, height: 44, borderRadius: 999, borderColor: colors.gold, borderWidth: 2, backgroundColor: colors.panel, alignItems: "center", justifyContent: "center" },
  carText: { color: colors.gold, fontWeight: "900" },
  mapSheet: { position: "absolute", left: 12, right: 12, bottom: 12, backgroundColor: "rgba(17,20,26,.94)", borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12 }
});
