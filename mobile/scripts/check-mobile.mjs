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
  "المسافة إلى الزبون"
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
