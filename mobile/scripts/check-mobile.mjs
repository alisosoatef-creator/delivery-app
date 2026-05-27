import fs from "node:fs";
import path from "node:path";

const required = [
  "app/_layout.js",
  "app/index.js",
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
  "src/components/ui/BrandMark.js",
  "src/components/ui/ChoiceChip.js",
  "src/components/ui/EmptyState.js",
  "src/components/ui/ErrorState.js",
  "src/components/ui/InfoRow.js",
  "src/components/ui/LoadingState.js",
  "src/components/ui/MobileBadge.js",
  "src/components/ui/MobileButton.js",
  "src/components/ui/MobileCard.js",
  "src/components/ui/MobileInput.js",
  "src/components/ui/PressableScale.js",
  "src/components/ui/ScreenContainer.js",
  "src/components/ui/SectionHeader.js",
  "src/components/ui/StatCard.js",
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
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}

const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
if (appJson.expo.slug !== "wasel-delivery") throw new Error("Unexpected Expo slug");
if (appJson.expo.scheme !== "wasel") throw new Error("Expo scheme is required for stable linking");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const dependency of ["expo-location", "socket.io-client", "react-native-maps", "expo-secure-store"]) {
  if (!packageJson.dependencies[dependency]) throw new Error(`${dependency} dependency is required`);
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
const uiSource = [...collectJsFiles("src/screens"), ...collectJsFiles("src/components")]
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

for (const token of [
  "EXPO_PUBLIC_API_BASE_URL",
  "http://10.0.2.2:3001/api",
  "/auth/register",
  "/auth/verify-otp",
  "/auth/login",
  "expo-secure-store",
  "saveMobileSession",
  "loadMobileSession",
  "clearMobileSession",
  "restoreSession",
  "classifyApiError",
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
  "isValidCoordinate",
  "normalizeCoordinate",
  "safeDistanceKm",
  "/places/search",
  "createRide",
  "fetchCustomerRideDetails",
  "fetchActiveCustomerRide",
  "ACTIVE_RIDE_STATUSES",
  "setActiveRide",
  "/driver/available-rides",
  "/driver/my-rides",
  "acceptRide",
  "updateDriverRideStatus",
  "X-Dev-Driver-Id",
  "X-Dev-Phone",
  "X-Dev-User-Id",
  "submitRideRating",
  "rideRating",
  "/rating",
  "updateDriverOnlineStatus"
]) {
  if (!source.includes(token)) throw new Error(`Missing mobile behavior token: ${token}`);
}

const theme = fs.readFileSync("src/utils/mobileTheme.js", "utf8");
for (const token of [
  "background: \"#020508\"",
  "primary: \"#25f1e1\"",
  "accent: \"#f0b85f\"",
  "elevated",
  "nav",
  "map",
  "card",
  "button",
  "chip",
  "badge",
  "motion",
  "glowStrong",
  "bottomNavHeight: 48",
  "screenBottomPadding: 112"
]) {
  if (!theme.includes(token)) throw new Error(`37F theme token is missing: ${token}`);
}

const pressableScale = fs.readFileSync("src/components/ui/PressableScale.js", "utf8");
for (const token of ["Animated.spring", "useNativeDriver: true", "motion.pressScale", "onPressIn", "onPressOut"]) {
  if (!pressableScale.includes(token)) throw new Error(`37F motion system is missing: ${token}`);
}

const screenContainer = fs.readFileSync("src/components/ui/ScreenContainer.js", "utf8");
for (const token of ["Animated.timing", "Animated.spring", "backdrop", "gridLineA", "layout.screenBottomPadding", "<BrandMark compact />"]) {
  if (!screenContainer.includes(token)) throw new Error(`37F screen entrance/header system is missing: ${token}`);
}

const brandMark = fs.readFileSync("src/components/ui/BrandMark.js", "utf8");
for (const token of ["logoGlow", "signal", "title || brand.appName", "logoCompact", "nameCompact"]) {
  if (!brandMark.includes(token)) throw new Error(`37F brand mark is missing: ${token}`);
}

const mobileCard = fs.readFileSync("src/components/ui/MobileCard.js", "utf8");
for (const token of ["tone === \"action\"", "tone === \"glass\"", "PressableScale", "styles.hero", "styles.action"]) {
  if (!mobileCard.includes(token)) throw new Error(`37F card system is missing: ${token}`);
}

const mobileButton = fs.readFileSync("src/components/ui/MobileButton.js", "utf8");
for (const token of ["PressableScale", "beam", "variant === \"accent\"", "pressedStyle"]) {
  if (!mobileButton.includes(token)) throw new Error(`37F button system is missing: ${token}`);
}

const appNavigator = fs.readFileSync("src/navigation/AppNavigator.js", "utf8");
for (const token of ["PressableScale", "nav.dock", "tabMark", "tabDotActive", "useSafeAreaInsets", "insets.bottom", "layout.bottomNavHeight"]) {
  if (!appNavigator.includes(token)) throw new Error(`37F bottom navigation is missing: ${token}`);
}
if (appNavigator.includes("ScrollView") || appNavigator.includes("horizontal")) {
  throw new Error("Bottom navigation should not rely on horizontal scrolling");
}

const customerHome = fs.readFileSync("src/screens/customer/CustomerHomeScreen.js", "utf8");
for (const token of ["heroSystem", "quickActionGrid", "PressableScale", "activeRideCard", "heroActions"]) {
  if (!customerHome.includes(token)) throw new Error(`37F customer home redesign is missing: ${token}`);
}

const requestRide = fs.readFileSync("src/screens/customer/RequestRideScreen.js", "utf8");
for (const token of ["mapDeck", "composer", "summarySticky", "PressableScale", "height={246}", "mapPulse"]) {
  if (!requestRide.includes(token)) throw new Error(`37F request ride redesign is missing: ${token}`);
}
if (requestRide.indexOf("MobileRideMap") > requestRide.indexOf("composer")) {
  throw new Error("Request Ride must stay map-first before the journey composer");
}

const rideStatus = fs.readFileSync("src/screens/customer/CustomerRideStatusScreen.js", "utf8");
for (const token of ["trackingHero", "livePill", "searchingCard", "driverCard", "ratingCard", "starButtonActive", "StatusTimeline"]) {
  if (!rideStatus.includes(token)) throw new Error(`37F ride status redesign is missing: ${token}`);
}
if (rideStatus.indexOf("MobileRideMap") > rideStatus.indexOf("StatusTimeline")) {
  throw new Error("Ride Status must be tracking-first with the map before details");
}

const driverHome = fs.readFileSync("src/screens/driver/DriverHomeScreen.js", "utf8");
for (const token of ["cockpit", "availabilityStrip", "actionGrid", "PressableScale", "driver:online-status-updated"]) {
  if (!driverHome.includes(token)) throw new Error(`37F driver cockpit is missing: ${token}`);
}

const availableRides = fs.readFileSync("src/screens/driver/AvailableRidesScreen.js", "utf8");
for (const token of ["tone=\"glass\"", "acceptRide", "ride:created", "paymentLabel", "statusLabel"]) {
  if (!availableRides.includes(token)) throw new Error(`37F available rides flow is missing: ${token}`);
}

const driverCurrent = fs.readFileSync("src/screens/driver/CurrentRideScreen.js", "utf8");
for (const token of ["mapStage", "nextActionCard", "trackingLabel", "StatusTimeline", "height={270}"]) {
  if (!driverCurrent.includes(token)) throw new Error(`37F current ride redesign is missing: ${token}`);
}
for (const token of [
  "accepted: [\"driver_arriving\"",
  "driver_arriving: [\"arrived\"",
  "arrived: [\"in_progress\"",
  "in_progress: [\"completed\""
]) {
  if (!driverCurrent.includes(token)) throw new Error(`Driver status sequence is missing: ${token}`);
}

const mobileRideMap = fs.readFileSync("src/components/map/MobileRideMap.js", "utf8");
for (const token of ["normalizeCoordinate", "safeDistanceKm", "markerSpec", "CustomMarker", "MapPoint", "Polyline", "routePoints.length === 2", "lineCap=\"round\"", "locationHint", "mapShade", "FallbackMap", "map.frame", "map.overlay"]) {
  if (!mobileRideMap.includes(token)) throw new Error(`Mobile map pro feature is missing: ${token}`);
}

for (const forbiddenMapToken of ["googleMapsApiKey", "maps.googleapis.com", "GoogleMaps"]) {
  if (source.includes(forbiddenMapToken)) throw new Error(`Forbidden paid Google Maps API usage in mobile source: ${forbiddenMapToken}`);
}

const qaNotes = fs.readFileSync("docs/mobile-qa-notes.md", "utf8");
for (const section of [
  "31A Ride Experience QA",
  "32A Map & Tracking QA",
  "33A Driver App Pro Mode QA",
  "34A Customer App Pro Mode QA",
  "36A Smart Dispatch QA",
  "36B Mobile UI Reality QA",
  "37D Driver Online Status Sync QA",
  "37C Ride Rating QA",
  "37E Mobile Visual Identity Final QA",
  "37F Ultimate Mobile App Redesign QA"
]) {
  if (!qaNotes.includes(section)) throw new Error(`Mobile QA notes missing section: ${section}`);
}

const sessionStorageSource = fs.readFileSync("src/services/sessionStorage.js", "utf8");
if (/\bpassword\b/i.test(sessionStorageSource)) throw new Error("sessionStorage must not persist passwords");

for (const forbidden of ["react-dom", "leaflet", "react-leaflet", "document.", "window."]) {
  if (source.includes(forbidden)) throw new Error(`Forbidden web-only mobile import or global: ${forbidden}`);
}

for (const forbiddenText of ["Backend", "Token", "Foundation", "Placeholder"]) {
  if (uiSource.includes(forbiddenText)) throw new Error(`Technical copy should not appear in mobile UI: ${forbiddenText}`);
}

for (const technicalText of ["allDemoData", "driver_not_found", "missing_driver_context"]) {
  if (source.includes(technicalText)) throw new Error(`Technical backend/debug copy should not appear in mobile UI: ${technicalText}`);
}

const mojibakePattern = new RegExp(`[${String.fromCharCode(0x00d8)}${String.fromCharCode(0x00d9)}${String.fromCharCode(0x00c2)}${String.fromCharCode(0x00e2)}]`);
if (mojibakePattern.test(source)) throw new Error("Broken mojibake text found in mobile source");

console.log("mobile-check-ok");
