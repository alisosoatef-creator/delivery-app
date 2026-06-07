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
  "src/hooks/useCustomerRideTracking.js",
  "src/hooks/useRideRating.js",
  "src/hooks/useCustomerLogin.js",
  "src/hooks/useRegisterCustomer.js",
  "src/hooks/useOtpVerification.js",
  "src/hooks/useLogout.js",
  "src/hooks/useDevDriverLogin.js",
  "src/hooks/useRideRequestFlow.js",
  "src/hooks/useDriverAvailability.js",
  "src/hooks/useAvailableDriverRides.js",
  "src/hooks/useDriverCurrentRide.js",
  "src/hooks/useDriverLiveTracking.js",
  "src/hooks/useCustomerRides.js",
  "src/hooks/useCustomerWallet.js",
  "src/hooks/useSupportTickets.js",
  "src/hooks/useMobileRideMapLogic.js",
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

const authSessionExtraction = [
  ["src/screens/auth/LoginScreen.js", "useCustomerLogin", ["loginCustomer", "saveMobileSession", "useMobileApp", "apiErrorMessage", "connectionMessageFor"]],
  ["src/screens/auth/RegisterScreen.js", "useRegisterCustomer", ["registerCustomer", "useMobileApp"]],
  ["src/screens/auth/OtpScreen.js", "useOtpVerification", ["verifyOtp", "useMobileApp"]],
  ["src/screens/customer/AccountScreen.js", "useLogout", ["logoutCustomer", "clearMobileSession", "disconnectMobileSocket", "useMobileApp"]],
  ["src/screens/driver/DevDriverLoginScreen.js", "useDevDriverLogin", ["driverDevLogin", "fetchDriverDevDrivers", "saveDriverSession", "useMobileApp", "apiErrorMessage", "connectionMessageFor"]]
];

for (const [file, hookName, forbiddenTokens] of authSessionExtraction) {
  const fileSource = fs.readFileSync(file, "utf8");
  if (!fileSource.includes(hookName)) throw new Error(`${file} must use ${hookName}`);
  for (const token of forbiddenTokens) {
    if (fileSource.includes(token)) throw new Error(`${file} still owns extracted auth/session logic: ${token}`);
  }
}

const requestRideSource = fs.readFileSync("src/screens/customer/RequestRideScreen.js", "utf8");
if (!requestRideSource.includes("useRideRequestFlow")) throw new Error("RequestRideScreen must use useRideRequestFlow");
for (const token of [
  "requestCurrentLocation",
  "searchPlaces",
  "quoteRide",
  "createRide",
  "useMobileApp",
  "pointFromCity",
  "pointFromPlace",
  "safeDistanceKm",
  "cityOptions",
  "paymentLabel"
]) {
  if (requestRideSource.includes(token)) throw new Error(`RequestRideScreen still owns extracted ride request logic: ${token}`);
}

const customerRideStatusSource = fs.readFileSync("src/screens/customer/CustomerRideStatusScreen.js", "utf8");
if (!customerRideStatusSource.includes("useCustomerRideTracking")) throw new Error("CustomerRideStatusScreen must use useCustomerRideTracking");
if (!customerRideStatusSource.includes("useRideRating")) throw new Error("CustomerRideStatusScreen must use useRideRating");
for (const token of [
  "cancelRide",
  "fetchActiveCustomerRide",
  "fetchCustomerRideDetails",
  "submitRideRating",
  "connectMobileSocket",
  "joinRideRoom",
  "subscribeToLocationEvents",
  "subscribeToRideEvents",
  "useMobileApp",
  "apiErrorMessage",
  "connectionMessageFor",
  "acceptedStatuses",
  "hasAcceptedDriver",
  "ridePoint",
  "timeLabel"
]) {
  if (customerRideStatusSource.includes(token)) throw new Error(`CustomerRideStatusScreen still owns extracted tracking/rating logic: ${token}`);
}

const driverHomeSource = fs.readFileSync("src/screens/driver/DriverHomeScreen.js", "utf8");
if (!driverHomeSource.includes("useDriverAvailability")) throw new Error("DriverHomeScreen must use useDriverAvailability");
for (const token of [
  "updateDriverOnlineStatus",
  "saveMobileSession",
  "clearMobileSession",
  "connectMobileSocket",
  "disconnectMobileSocket",
  "subscribeToDriverEvents",
  "useMobileApp",
  "apiErrorMessage",
  "driverSessionFromState",
  "applyDriverSession",
  "driver:online-status-updated"
]) {
  if (driverHomeSource.includes(token)) throw new Error(`DriverHomeScreen still owns extracted availability/session logic: ${token}`);
}

const availableRidesSource = fs.readFileSync("src/screens/driver/AvailableRidesScreen.js", "utf8");
if (!availableRidesSource.includes("useAvailableDriverRides")) throw new Error("AvailableRidesScreen must use useAvailableDriverRides");
for (const token of [
  "fetchAvailableRides",
  "acceptRide",
  "connectMobileSocket",
  "subscribeToDriverEvents",
  "useMobileApp",
  "apiErrorMessage",
  "connectionMessageFor",
  "driver:online-status-updated",
  "ride:created",
  "ride:accepted",
  "ride:status-updated",
  "ride:cancelled"
]) {
  if (availableRidesSource.includes(token)) throw new Error(`AvailableRidesScreen still owns extracted rides queue logic: ${token}`);
}

const currentRideSource = fs.readFileSync("src/screens/driver/CurrentRideScreen.js", "utf8");
if (!currentRideSource.includes("useDriverCurrentRide")) throw new Error("CurrentRideScreen must use useDriverCurrentRide");
if (!currentRideSource.includes("useDriverLiveTracking")) throw new Error("CurrentRideScreen must use useDriverLiveTracking");
for (const token of [
  "fetchDriverRides",
  "updateDriverRideStatus",
  "startDriverLocationWatch",
  "connectMobileSocket",
  "emitDriverLocation",
  "emitDriverLocationUnavailable",
  "joinRideRoom",
  "subscribeToDriverEvents",
  "useMobileApp",
  "apiErrorMessage",
  "connectionMessageFor",
  "useRef",
  "watchRef",
  "nextActions",
  "visibleStatuses",
  "ridePoint",
  "timeLabel"
]) {
  if (currentRideSource.includes(token)) throw new Error(`CurrentRideScreen still owns extracted current ride/tracking logic: ${token}`);
}

const customerRidesSource = fs.readFileSync("src/screens/customer/MyRidesScreen.js", "utf8");
if (!customerRidesSource.includes("useCustomerRides")) throw new Error("MyRidesScreen must use useCustomerRides");
for (const token of [
  "fetchCustomerRides",
  "useMobileApp",
  "useEffect",
  "useState"
]) {
  if (customerRidesSource.includes(token)) throw new Error(`MyRidesScreen still owns extracted customer rides logic: ${token}`);
}

const customerWalletSource = fs.readFileSync("src/screens/customer/WalletScreen.js", "utf8");
if (!customerWalletSource.includes("useCustomerWallet")) throw new Error("WalletScreen must use useCustomerWallet");
for (const token of [
  "fetchCustomerWallet",
  "useMobileApp",
  "useEffect",
  "useState"
]) {
  if (customerWalletSource.includes(token)) throw new Error(`WalletScreen still owns extracted wallet logic: ${token}`);
}

for (const [file, screenName] of [
  ["src/screens/customer/SupportScreen.js", "SupportScreen"],
  ["src/screens/driver/DriverSupportScreen.js", "DriverSupportScreen"]
]) {
  const supportSource = fs.readFileSync(file, "utf8");
  if (!supportSource.includes("useSupportTickets")) throw new Error(`${screenName} must use useSupportTickets`);
  for (const token of [
    "createSupportTicket",
    "fetchMySupportTickets",
    "useMobileApp",
    "apiErrorMessage",
    "useEffect",
    "useState"
  ]) {
    if (supportSource.includes(token)) throw new Error(`${screenName} still owns extracted support logic: ${token}`);
  }
}

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
  "background: \"#040308\"",
  "primary: \"#a682ff\"",
  "magenta: \"#ff6bd3\"",
  "green: \"#42e79d\"",
  "elevated",
  "nav",
  "map",
  "card",
  "button",
  "chip",
  "badge",
  "motion",
  "glowStrong",
  "bottomNavHeight: 58",
  "screenBottomPadding: 124"
]) {
  if (!theme.includes(token)) throw new Error(`v2 command theme token is missing: ${token}`);
}
for (const oldIdentity of ["#25f1e1", "37, 241, 225", "41, 213, 201", "tealLine"]) {
  if (source.includes(oldIdentity)) throw new Error(`Old teal identity token should not remain: ${oldIdentity}`);
}

const pressableScale = fs.readFileSync("src/components/ui/PressableScale.js", "utf8");
for (const token of ["Animated.spring", "useNativeDriver: true", "motion.pressScale", "onPressIn", "onPressOut"]) {
  if (!pressableScale.includes(token)) throw new Error(`motion system is missing: ${token}`);
}
for (const token of ["Animated.createAnimatedComponent(Pressable)", "AnimatedPressable", "const baseStyle = typeof style === \"function\"", "accessibilityState"]) {
  if (!pressableScale.includes(token)) throw new Error(`stable PressableScale is missing: ${token}`);
}
if (pressableScale.includes("<Animated.View") || pressableScale.includes("</Animated.View>")) {
  throw new Error("PressableScale must not wrap Pressable in Animated.View because it breaks flex layout");
}

const screenContainer = fs.readFileSync("src/components/ui/ScreenContainer.js", "utf8");
for (const token of ["Animated.timing", "Animated.spring", "stageLayer", "useSafeAreaInsets", "layout.screenBottomPadding", "<BrandMark compact />"]) {
  if (!screenContainer.includes(token)) throw new Error(`v2 screen shell is missing: ${token}`);
}

const brandMark = fs.readFileSync("src/components/ui/BrandMark.js", "utf8");
for (const token of ["logoGlow", "signal", "title || brand.appName", "logoCompact", "nameCompact"]) {
  if (!brandMark.includes(token)) throw new Error(`brand mark is missing: ${token}`);
}

const mobileCard = fs.readFileSync("src/components/ui/MobileCard.js", "utf8");
for (const token of ["tone === \"action\"", "tone === \"glass\"", "tone === \"command\"", "tone === \"map\"", "PressableScale"]) {
  if (!mobileCard.includes(token)) throw new Error(`v2 card system is missing: ${token}`);
}

const mobileButton = fs.readFileSync("src/components/ui/MobileButton.js", "utf8");
for (const token of ["PressableScale", "beam", "variant === \"accent\"", "pressedStyle"]) {
  if (!mobileButton.includes(token)) throw new Error(`button system is missing: ${token}`);
}

const appNavigator = fs.readFileSync("src/navigation/AppNavigator.js", "utf8");
for (const token of ["PressableScale", "nav.dock", "tabDotActive", "useSafeAreaInsets", "insets.bottom", "layout.bottomNavHeight"]) {
  if (!appNavigator.includes(token)) throw new Error(`bottom navigation is missing: ${token}`);
}
for (const token of ["numberOfLines={1}", "ellipsizeMode=\"tail\"", "flexBasis: 0", "minWidth: 58", "writingDirection: \"rtl\""]) {
  if (!appNavigator.includes(token)) throw new Error(`stable bottom navigation is missing: ${token}`);
}
for (const forbidden of ["tabMark", "minWidth: 0", "\"01\"", "\"02\"", "\"03\"", "\"04\"", "\"05\"", "\"06\"", "[\"wallet\", \"محفظة\"]", "[\"support\", \"دعم\"]"]) {
  if (appNavigator.includes(forbidden)) throw new Error(`bottom navigation regression found: ${forbidden}`);
}
if (appNavigator.includes("ScrollView") || appNavigator.includes("horizontal")) {
  throw new Error("Bottom navigation should not rely on horizontal scrolling");
}

const customerHome = fs.readFileSync("src/screens/customer/CustomerHomeScreen.js", "utf8");
for (const token of ["MobileRideMap", "mapHero", "heroSystem", "searchBar", "quickActionGrid", "activeRideCard", "heroActions"]) {
  if (!customerHome.includes(token)) throw new Error(`v2 customer home is missing: ${token}`);
}
for (const token of ["flexBasis: \"47.5%\"", "minWidth: 132", "maxWidth: \"48.5%\"", "numberOfLines={1}", "numberOfLines={2}", "alignSelf: \"stretch\""]) {
  if (!customerHome.includes(token)) throw new Error(`stable quick actions are missing: ${token}`);
}

const requestRide = fs.readFileSync("src/screens/customer/RequestRideScreen.js", "utf8");
for (const token of ["mapDeck", "composer", "summarySticky", "PressableScale", "height={246}", "mapPulse", "SectionHeader"]) {
  if (!requestRide.includes(token)) throw new Error(`v2 request ride is missing: ${token}`);
}
if (requestRide.indexOf("MobileRideMap") > requestRide.indexOf("composer")) {
  throw new Error("Request Ride must stay map-first before the journey composer");
}

const rideStatus = fs.readFileSync("src/screens/customer/CustomerRideStatusScreen.js", "utf8");
for (const token of ["statusCommand", "trackingHero", "livePill", "searchingCard", "driverCard", "ratingCard", "starButtonActive", "StatusTimeline"]) {
  if (!rideStatus.includes(token)) throw new Error(`v2 ride status is missing: ${token}`);
}
if (rideStatus.indexOf("MobileRideMap") > rideStatus.indexOf("StatusTimeline")) {
  throw new Error("Ride Status must be tracking-first with the map before details");
}

const driverHome = fs.readFileSync("src/screens/driver/DriverHomeScreen.js", "utf8");
for (const token of ["cockpit", "availabilityStrip", "actionGrid", "PressableScale", "useDriverAvailability"]) {
  if (!driverHome.includes(token)) throw new Error(`v2 driver cockpit is missing: ${token}`);
}

const availableRides = fs.readFileSync("src/screens/driver/AvailableRidesScreen.js", "utf8");
for (const token of ["tone=\"glass\"", "useAvailableDriverRides", "paymentLabel", "statusLabel"]) {
  if (!availableRides.includes(token)) throw new Error(`available rides flow is missing: ${token}`);
}

const driverCurrent = fs.readFileSync("src/screens/driver/CurrentRideScreen.js", "utf8");
const driverCurrentFlow = [
  driverCurrent,
  fs.readFileSync("src/hooks/useDriverCurrentRide.js", "utf8"),
  fs.readFileSync("src/hooks/useDriverLiveTracking.js", "utf8")
].join("\n");
for (const token of ["statusCommand", "mapStage", "nextActionCard", "trackingLabel", "StatusTimeline", "height={270}"]) {
  if (!driverCurrent.includes(token)) throw new Error(`v2 current ride is missing: ${token}`);
}
for (const token of [
  "accepted: [\"driver_arriving\"",
  "driver_arriving: [\"arrived\"",
  "arrived: [\"in_progress\"",
  "in_progress: [\"completed\""
]) {
  if (!driverCurrentFlow.includes(token)) throw new Error(`Driver status sequence is missing: ${token}`);
}

const mobileRideMap = fs.readFileSync("src/components/map/MobileRideMap.js", "utf8");
const mobileRideMapLogic = fs.readFileSync("src/hooks/useMobileRideMapLogic.js", "utf8");
if (!mobileRideMap.includes("useMobileRideMapLogic")) throw new Error("MobileRideMap must use useMobileRideMapLogic");
for (const token of [
  "UIManager",
  "normalizeCoordinate",
  "safeDistanceKm",
  "devLogStartup",
  "loadNativeMap",
  "regionFor",
  "cleanPoint"
]) {
  if (mobileRideMap.includes(token)) throw new Error(`MobileRideMap still owns extracted map runtime logic: ${token}`);
}
for (const token of ["normalizeCoordinate", "safeDistanceKm", "UIManager", "devLogStartup", "native-map-view-unavailable", "regionFor", "loadNativeMap"]) {
  if (!mobileRideMapLogic.includes(token)) throw new Error(`map runtime hook is missing: ${token}`);
}
for (const token of ["markerSpec", "CustomMarker", "MapPoint", "Polyline", "routePoints.length === 2", "lineCap=\"round\"", "locationHint", "mapShade", "FallbackMap", "map.frame", "map.overlay"]) {
  if (!mobileRideMap.includes(token)) throw new Error(`Mobile map feature is missing: ${token}`);
}

for (const forbiddenMapToken of ["googleMapsApiKey", "maps.googleapis.com", "GoogleMaps"]) {
  if (source.includes(forbiddenMapToken)) throw new Error(`Forbidden paid Google Maps API usage in mobile source: ${forbiddenMapToken}`);
}

for (const [label, file, tokens] of [
  ["My Rides", "src/screens/customer/MyRidesScreen.js", ["tone={isActiveRide(ride) ? \"hero\" : \"glass\"}", "ratingLabel", "metaRow"]],
  ["Wallet", "src/screens/customer/WalletScreen.js", ["balanceOverview", "walletRails", "transactionsCard"]],
  ["Customer Support", "src/screens/customer/SupportScreen.js", ["formCard", "tone=\"command\"", "ChoiceChip"]],
  ["Account", "src/screens/customer/AccountScreen.js", ["profileCard", "actionGrid", "logout"]],
  ["Driver Earnings", "src/screens/driver/DriverEarningsScreen.js", ["tone=\"command\"", "total", "StatCard"]],
  ["Driver Support", "src/screens/driver/DriverSupportScreen.js", ["tone=\"command\"", "ChoiceChip", "messageInput"]]
]) {
  const fileSource = fs.readFileSync(file, "utf8");
  for (const token of tokens) {
    if (!fileSource.includes(token)) throw new Error(`v2 ${label} token is missing: ${token}`);
  }
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
  "37H Mobile UI System Stabilization",
  "38A Mobile Command UI Rebuild QA"
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
