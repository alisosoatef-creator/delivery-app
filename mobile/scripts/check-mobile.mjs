import fs from "node:fs";
import path from "node:path";

const required = [
  "app/_layout.js",
  "app/index.js",
  "components/wasel-mobile-app.js",
  "data/fallback.js",
  "lib/api.js",
  "src/App.js",
  "src/components/ErrorBoundary.js",
  "src/config/appConfig.js",
  "src/services/apiClient.js",
  "src/services/authApi.js",
  "src/services/driverApi.js",
  "src/services/locationService.js",
  "src/services/placesApi.js",
  "src/services/ridesApi.js",
  "src/services/sessionStorage.js",
  "src/services/socketClient.js",
  "src/hooks/useCustomerActiveRide.js",
  "src/hooks/useCustomerRideRealtime.js",
  "src/store/mobileStore.js",
  "src/navigation/AppNavigator.js",
  "src/screens/auth/LoginScreen.js",
  "src/screens/auth/RegisterScreen.js",
  "src/screens/auth/OtpScreen.js",
  "src/screens/customer/CustomerHomeScreen.js",
  "src/screens/customer/RequestRideScreen.js",
  "src/screens/customer/CustomerRideStatusScreen.js",
  "src/screens/customer/MyRidesScreen.js",
  "src/screens/customer/WalletScreen.js",
  "src/screens/customer/SupportScreen.js",
  "src/screens/customer/AccountScreen.js",
  "src/screens/driver/DevDriverLoginScreen.js",
  "src/screens/driver/DriverHomeScreen.js",
  "src/screens/driver/AvailableRidesScreen.js",
  "src/screens/driver/CurrentRideScreen.js",
  "src/screens/driver/DriverEarningsScreen.js",
  "src/screens/driver/DriverSupportScreen.js",
  "src/components/ui/MobileButton.js",
  "src/components/ui/MobileCard.js",
  "src/components/ui/MobileInput.js",
  "src/components/ui/MobileBadge.js",
  "src/components/ui/ScreenContainer.js",
  "src/components/ui/LoadingState.js",
  "src/components/ui/EmptyState.js",
  "src/components/ui/SectionHeader.js",
  "src/components/ui/StatCard.js",
  "src/components/ui/InfoRow.js",
  "src/components/ui/ChoiceChip.js",
  "src/components/ui/BrandMark.js",
  "src/components/ui/ErrorState.js",
  "src/components/ui/StatusTimeline.js",
  "src/components/map/MobileRideMap.js",
  "src/utils/locationUtils.js",
  "src/utils/errorUtils.js",
  "src/utils/startupDiagnostics.js",
  "src/utils/rideStatus.js",
  "src/utils/mobileTheme.js",
  "src/utils/westBankCities.js",
  "docs/mobile-qa-notes.md",
  "app.json",
  "eas.json"
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}`);
  }
}

const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
if (appJson.expo.slug !== "wasel-delivery") {
  throw new Error("Unexpected Expo slug");
}
if (appJson.expo.scheme !== "wasel") {
  throw new Error("Expo scheme is required for stable linking");
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const dependency of ["expo-location", "socket.io-client", "react-native-maps", "expo-secure-store"]) {
  if (!packageJson.dependencies[dependency]) {
    throw new Error(`${dependency} dependency is required`);
  }
}

function collectJsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectJsFiles(full);
    if (entry.isFile() && entry.name.endsWith(".js")) return [full.replace(/\\/g, "/")];
    return [];
  });
}

const sourceFiles = collectJsFiles("src");
const source = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");

for (const token of [
  "EXPO_PUBLIC_API_BASE_URL",
  "http://10.0.2.2:3001/api",
  "/auth/register",
  "/auth/verify-otp",
  "/auth/login",
  "requestForegroundPermissionsAsync",
  "watchPositionAsync",
  "connectMobileSocket",
  "subscribeToRideEvents",
  "subscribeToDriverEvents",
  "subscribeToLocationEvents",
  "emitDriverLocation",
  "driver:location-updated",
  "driver:location-unavailable",
  "react-native-maps",
  "MobileRideMap",
  "EXPO_PUBLIC_SOCKET_URL",
  "expo-secure-store",
  "ErrorBoundary",
  "saveMobileSession",
  "loadMobileSession",
  "clearMobileSession",
  "saveDriverSession",
  "isValidMobileSession",
  "restoreSession",
  "restoreStatus",
  "try",
  "catch",
  "disconnectMobileSocket",
  "classifyApiError",
  "network_error",
  "auth_error",
  "validation_error",
  "server_error",
  "not_found",
  "reconnectionAttempts",
  "reconnect_attempt",
  "socket init skipped",
  "map component loaded",
  "map component skipped",
  "isValidCoordinate",
  "normalizeCoordinate",
  "safeDistanceKm",
  "haversineKm",
  "/places/search",
  "createRide",
  "fetchCustomerRideDetails",
  "fetchActiveCustomerRide",
  "ACTIVE_RIDE_STATUSES",
  "findActiveRide",
  "isActiveRide",
  "setActiveRide",
  "activeRideStatus",
  "/driver/available-rides",
  "/driver/my-rides",
  "acceptRide",
  "updateDriverRideStatus",
  "X-Dev-Driver-Id",
  "X-Dev-Phone",
  "X-Dev-User-Id",
  "fallback",
  "Development Only",
  "CustomerHomeScreen",
  "DriverHomeScreen",
  "surfaceGlass",
  "boxShadow",
  "SectionHeader",
  "StatCard",
  "ChoiceChip",
  "BrandMark",
  "StatusTimeline",
  "ErrorState",
  "pressed",
  "focused",
  "useSafeAreaInsets"
]) {
  if (!source.includes(token)) {
    throw new Error(`Missing mobile foundation token: ${token}`);
  }
}

for (const token of [
  "bottomNavHeight",
  "screenBottomPadding",
  "screenBottomPadding: 122",
  "layout.bottomNavHeight",
  "جاهز لمشوارك القادم؟",
  "اطلب رحلة",
  "الخريطة أولًا",
  "height={255}",
  "تتبع الرحلة",
  "height={300}",
  "طلبات الرحلات",
  "رحلتي الحالية",
  "عرض الطلبات",
  "دفع إلكتروني تجريبي",
  "معاينة الخريطة",
  "المسافة إلى الزبون",
  "جاري البحث عن كابتن قريب...",
  "ملخص الرحلة المنتهية",
  "ملخص الرحلة الملغية",
  "بانتظار تفعيل موقع الكابتن المباشر.",
  "تقييم",
  "التتبع مباشر",
  "تم إنهاء الرحلة",
  "markerSpec",
  "CustomMarker",
  "MapPoint",
  "lineCap=\"round\"",
  "locationHint",
  "التحديث المباشر غير متاح مؤقتًا",
  "trackingLabel",
  "إيقاف التتبع",
  "آخر تحديث للموقع"
]) {
  if (!source.includes(token)) {
    throw new Error(`Missing 29.6 real-product UI token: ${token}`);
  }
}

const appNavigator = fs.readFileSync("src/navigation/AppNavigator.js", "utf8");
if (!appNavigator.includes("layout.bottomNavHeight") || !appNavigator.includes("minHeight: layout.bottomNavHeight")) {
  throw new Error("Bottom navigation must be compact and token-driven");
}
if (!appNavigator.includes("useSafeAreaInsets") || !appNavigator.includes("insets.bottom")) {
  throw new Error("Bottom navigation must account for mobile safe area");
}
if (appNavigator.includes("ScrollView") || appNavigator.includes("horizontal")) {
  throw new Error("Bottom navigation should not rely on horizontal scrolling");
}

const screenContainer = fs.readFileSync("src/components/ui/ScreenContainer.js", "utf8");
if (!screenContainer.includes("layout.screenBottomPadding")) {
  throw new Error("Screens need bottom padding so navigation does not cover content");
}
const mobileTheme = fs.readFileSync("src/utils/mobileTheme.js", "utf8");
const bottomPaddingMatch = mobileTheme.match(/screenBottomPadding:\s*(\d+)/);
if (!bottomPaddingMatch || Number(bottomPaddingMatch[1]) < 110) {
  throw new Error("Mobile screens need generous bottom padding above compact navigation");
}

const loginScreen = fs.readFileSync("src/screens/auth/LoginScreen.js", "utf8");
if (!loginScreen.includes("typeof __DEV__") || !loginScreen.includes("isDev ? <MobileButton title=\"كابتن DEV\"")) {
  throw new Error("Driver dev login entry must be hidden outside DEV");
}

const requestRide = fs.readFileSync("src/screens/customer/RequestRideScreen.js", "utf8");
if (requestRide.indexOf("MobileRideMap") > requestRide.lastIndexOf("طلب الرحلة")) {
  throw new Error("Request Ride must be map-first before the final action");
}

const rideStatus = fs.readFileSync("src/screens/customer/CustomerRideStatusScreen.js", "utf8");
if (rideStatus.indexOf("MobileRideMap") > rideStatus.indexOf("StatusTimeline")) {
  throw new Error("Ride Status must be tracking-first with the map before details");
}
for (const token of ["mapNotice", "lastDriverLocationAt", "آخر تحديث للموقع", "التحديث المباشر غير متاح مؤقتًا"]) {
  if (!rideStatus.includes(token)) {
    throw new Error(`Customer map/tracking UX is missing: ${token}`);
  }
}
for (const token of [
  "searchingCard",
  "جاري البحث عن كابتن قريب...",
  "hasAcceptedDriver",
  "driverMeta",
  "ملخص الرحلة المنتهية",
  "ملخص الرحلة الملغية",
  "طلب رحلة جديدة",
  "عرض رحلاتي"
]) {
  if (!rideStatus.includes(token)) {
    throw new Error(`Ride Status experience is missing: ${token}`);
  }
}
if (rideStatus.indexOf("hasAcceptedDriver") > rideStatus.indexOf("driverCard")) {
  throw new Error("Captain card must be gated by accepted ride state");
}

const driverCurrent = fs.readFileSync("src/screens/driver/CurrentRideScreen.js", "utf8");
if (driverCurrent.indexOf("MobileRideMap") > driverCurrent.indexOf("StatusTimeline")) {
  throw new Error("Driver current ride must show the route/map before state details");
}
for (const token of [
  "accepted: [\"driver_arriving\", \"أنا بالطريق\"]",
  "driver_arriving: [\"arrived\", \"وصلت\"]",
  "arrived: [\"in_progress\", \"بدأت الرحلة\"]",
  "in_progress: [\"completed\", \"إنهاء الرحلة\"]"
]) {
  if (!driverCurrent.includes(token)) {
    throw new Error(`Driver status sequence is missing: ${token}`);
  }
}
if (!driverCurrent.includes("completedCard") || !driverCurrent.includes("!completed ?")) {
  throw new Error("Driver current ride needs a completed summary and no update action after completion");
}
for (const token of ["trackingLabel", "trackingTone", "تفعيل موقعي المباشر", "إيقاف التتبع", "آخر تحديث للموقع", "mapNotice"]) {
  if (!driverCurrent.includes(token)) {
    throw new Error(`Driver map/tracking UX is missing: ${token}`);
  }
}
for (const token of ["routeCard", "مسار الرحلة", "الخطوة التالية", "nextActionCard", "paymentLabel"]) {
  if (!driverCurrent.includes(token)) {
    throw new Error(`33A Current Ride pro mode is missing: ${token}`);
  }
}

const mobileRideMap = fs.readFileSync("src/components/map/MobileRideMap.js", "utf8");
for (const token of [
  "normalizeCoordinate",
  "safeDistanceKm",
  "markerSpec",
  "CustomMarker",
  "MapPoint",
  "Polyline",
  "routePoints.length === 2",
  "lineCap=\"round\"",
  "الانطلاق",
  "الوجهة",
  "الكابتن",
  "locationHint",
  "FallbackMap"
]) {
  if (!mobileRideMap.includes(token)) {
    throw new Error(`Mobile map pro feature is missing: ${token}`);
  }
}
for (const forbiddenMapToken of ["googleMapsApiKey", "maps.googleapis.com", "GoogleMaps"]) {
  if (source.includes(forbiddenMapToken)) {
    throw new Error(`Forbidden paid Google Maps API usage in mobile source: ${forbiddenMapToken}`);
  }
}

const availableRides = fs.readFileSync("src/screens/driver/AvailableRidesScreen.js", "utf8");
for (const token of ["من {ride.pickup", "إلى {ride.destination", "acceptRide", "ride:created"]) {
  if (!availableRides.includes(token)) {
    throw new Error(`Available rides should expose compact request details and realtime refetch: ${token}`);
  }
}
for (const token of ["requestHeader", "قبول الرحلة", "statusLabel", "paymentLabel", "بطاقة تجريبية"]) {
  if (!availableRides.includes(token)) {
    throw new Error(`33A Available Rides compact UI is missing: ${token}`);
  }
}
for (const token of ["availableStatus", "dispatchReason", "driverDispatchStatus", "driverDispatchReason", "لا توجد طلبات مناسبة لحالتك الحالية"]) {
  if (!availableRides.includes(token) && !fs.readFileSync("src/services/driverApi.js", "utf8").includes(token)) {
    throw new Error(`36A mobile driver dispatch UX is missing: ${token}`);
  }
}

const driverHome = fs.readFileSync("src/screens/driver/DriverHomeScreen.js", "utf8");
for (const token of ["حالة التوفر", "متاح لاستقبال الطلبات", "غير متاح", "طلبات متاحة", "availableCount", "currentRideCard", "accessibilityRole=\"switch\""]) {
  if (!driverHome.includes(token)) {
    throw new Error(`33A Driver dashboard is missing: ${token}`);
  }
}

const qaNotes = fs.readFileSync("docs/mobile-qa-notes.md", "utf8");
if (!qaNotes.includes("31A Ride Experience QA") || !qaNotes.includes("Completed") || !qaNotes.includes("Cancelled")) {
  throw new Error("Mobile QA notes need the 31A ride experience checklist");
}
if (!qaNotes.includes("32A Map & Tracking QA") || !qaNotes.includes("Socket disconnected") || !qaNotes.includes("Invalid coordinates")) {
  throw new Error("Mobile QA notes need the 32A map and tracking checklist");
}
if (!qaNotes.includes("33A Driver App Pro Mode QA") || !qaNotes.includes("تفعيل/إيقاف التتبع") || !qaNotes.includes("الأرباح") || !qaNotes.includes("الدعم")) {
  throw new Error("Mobile QA notes need the 33A driver pro mode checklist");
}
if (!qaNotes.includes("34A Customer App Pro Mode QA") || !qaNotes.includes("ملخص الطلب") || !qaNotes.includes("رحلاتي") || !qaNotes.includes("المحفظة")) {
  throw new Error("Mobile QA notes need the 34A customer pro mode checklist");
}
if (!qaNotes.includes("36A Smart Dispatch QA") || !qaNotes.includes("Busy driver") || !qaNotes.includes("Race safety")) {
  throw new Error("Mobile QA notes need the 36A smart dispatch checklist");
}

const driverEarnings = fs.readFileSync("src/screens/driver/DriverEarningsScreen.js", "utf8");
for (const token of ["أرباح اليوم", "إجمالي الأرباح", "رحلات مكتملة", "سجل العمليات", "لا توجد عمليات أرباح بعد"]) {
  if (!driverEarnings.includes(token)) {
    throw new Error(`33A Driver earnings UI is missing: ${token}`);
  }
}

const driverSupport = fs.readFileSync("src/screens/driver/DriverSupportScreen.js", "utf8");
for (const token of ["issueTypes", "ChoiceChip", "fetchMySupportTickets", "تذاكري السابقة", "تم إرسال طلب الدعم بنجاح", "لا توجد تذاكر دعم"]) {
  if (!driverSupport.includes(token)) {
    throw new Error(`33A Driver support UI is missing: ${token}`);
  }
}

const customerHome = fs.readFileSync("src/screens/customer/CustomerHomeScreen.js", "utf8");
for (const token of ["customerHero", "اطلب رحلة", "لديك رحلة نشطة", "متابعة الرحلة", "quickActionGrid", "المحفظة", "الحساب"]) {
  if (!customerHome.includes(token)) {
    throw new Error(`34A Customer Home pro mode is missing: ${token}`);
  }
}

const customerRequestRide = fs.readFileSync("src/screens/customer/RequestRideScreen.js", "utf8");
for (const token of ["summarySticky", "ملخص الطلب", "نقطة الانطلاق", "paymentLabel", "بطاقة تجريبية", "تعذر قراءة موقعك"]) {
  if (!customerRequestRide.includes(token)) {
    throw new Error(`34A Request Ride pro mode is missing: ${token}`);
  }
}

const customerRideStatus = fs.readFileSync("src/screens/customer/CustomerRideStatusScreen.js", "utf8");
for (const token of ["customerStatusSummary", "hasAcceptedDriver", "ملخص الرحلة المنتهية", "ملخص الرحلة الملغية", "paymentLabel", "بطاقة تجريبية"]) {
  if (!customerRideStatus.includes(token)) {
    throw new Error(`34A Ride Status pro mode is missing: ${token}`);
  }
}

const myRides = fs.readFileSync("src/screens/customer/MyRidesScreen.js", "utf8");
for (const token of ["paymentLabel", "متابعة", "statusLabel", "completed", "cancelled"]) {
  if (!myRides.includes(token)) {
    throw new Error(`34A My Rides polish is missing: ${token}`);
  }
}

const customerWallet = fs.readFileSync("src/screens/customer/WalletScreen.js", "utf8");
for (const token of ["balanceOverview", "دفع إلكتروني تجريبي", "آخر العمليات", "لا توجد عمليات", "بطاقة"]) {
  if (!customerWallet.includes(token)) {
    throw new Error(`34A Wallet polish is missing: ${token}`);
  }
}

const customerSupport = fs.readFileSync("src/screens/customer/SupportScreen.js", "utf8");
for (const token of ["issueTypes", "ChoiceChip", "تذاكري السابقة", "تم إرسال تذكرة الدعم بنجاح", "لا توجد تذاكر بعد"]) {
  if (!customerSupport.includes(token)) {
    throw new Error(`34A Customer support polish is missing: ${token}`);
  }
}

const customerAccount = fs.readFileSync("src/screens/customer/AccountScreen.js", "utf8");
for (const token of ["profileCard", "زبون", "تسجيل الخروج", "نوع الحساب"]) {
  if (!customerAccount.includes(token)) {
    throw new Error(`34A Account polish is missing: ${token}`);
  }
}
for (const forbiddenAccountText of ["Token", "Backend", "Foundation"]) {
  if (customerAccount.includes(forbiddenAccountText)) {
    throw new Error(`Technical customer account copy should not appear: ${forbiddenAccountText}`);
  }
}

const sessionStorageSource = fs.readFileSync("src/services/sessionStorage.js", "utf8");
if (/\bpassword\b/i.test(sessionStorageSource)) {
  throw new Error("sessionStorage must not persist passwords");
}

for (const forbidden of ["react-dom", "leaflet", "react-leaflet", "document.", "window."]) {
  if (source.includes(forbidden)) {
    throw new Error(`Forbidden web-only mobile import or global: ${forbidden}`);
  }
}

for (const forbiddenText of ["دلفري", "مطاعم", "منتجات"]) {
  if (source.includes(forbiddenText)) {
    throw new Error(`Forbidden non-ride mobile copy: ${forbiddenText}`);
  }
}

for (const technicalText of ["allDemoData", "driver_not_found", "missing_driver_context"]) {
  if (source.includes(technicalText)) {
    throw new Error(`Technical backend/debug copy should not appear in mobile UI: ${technicalText}`);
  }
}

const mojibakePattern = new RegExp(`[${String.fromCharCode(0x00d8)}${String.fromCharCode(0x00d9)}${String.fromCharCode(0x00c2)}${String.fromCharCode(0x00e2)}]`);
if (mojibakePattern.test(source)) {
  throw new Error("Broken mojibake text found in mobile source");
}

console.log("mobile-check-ok");
