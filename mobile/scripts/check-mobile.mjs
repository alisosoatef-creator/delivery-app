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
  "src/utils/formatters.js",
  "src/utils/mobileTheme.js",
  "src/theme/v3/colors.js",
  "src/theme/v3/spacing.js",
  "src/theme/v3/radius.js",
  "src/theme/v3/typography.js",
  "src/theme/v3/shadows.js",
  "src/theme/v3/index.js",
  "src/components/v3/V3DesignPreview.js",
  "src/components/v3/ui/V3Badge.js",
  "src/components/v3/ui/V3Button.js",
  "src/components/v3/ui/V3Card.js",
  "src/components/v3/ui/V3IconButton.js",
  "src/components/v3/ui/V3Input.js",
  "src/components/v3/ui/V3Screen.js",
  "src/components/v3/ui/V3SectionHeader.js",
  "src/components/v3/ui/V3Text.js",
  "src/components/v3/ui/index.js",
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
const formatters = fs.readFileSync("src/utils/formatters.js", "utf8");
for (const token of ["export function money", "export function km"]) {
  if (!formatters.includes(token)) throw new Error(`formatter helper is missing: ${token}`);
  if (theme.includes(token)) throw new Error(`functional formatter must not remain in mobileTheme: ${token}`);
}
for (const file of sourceFiles) {
  const fileSource = fs.readFileSync(file, "utf8");
  if (file !== "src/utils/mobileTheme.js" && fileSource.includes("../../utils/mobileTheme") && /\b(money|km)\b/.test(fileSource.split("../../utils/mobileTheme")[0].split("\n").pop() || "")) {
    throw new Error(`${file} imports formatter helpers from mobileTheme`);
  }
  if (fileSource.includes("from \"../../utils/mobileTheme\"") && fileSource.match(/import\s+\{[^}]*\b(money|km)\b[^}]*\}\s+from "\.\.\/\.\.\/utils\/mobileTheme"/)) {
    throw new Error(`${file} imports formatter helpers from mobileTheme`);
  }
  if (fileSource.includes("from \"../utils/mobileTheme\"") && fileSource.match(/import\s+\{[^}]*\b(money|km)\b[^}]*\}\s+from "\.\.\/utils\/mobileTheme"/)) {
    throw new Error(`${file} imports formatter helpers from mobileTheme`);
  }
}
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

const v3ThemeSource = [
  fs.readFileSync("src/theme/v3/colors.js", "utf8"),
  fs.readFileSync("src/theme/v3/spacing.js", "utf8"),
  fs.readFileSync("src/theme/v3/radius.js", "utf8"),
  fs.readFileSync("src/theme/v3/typography.js", "utf8"),
  fs.readFileSync("src/theme/v3/shadows.js", "utf8"),
  fs.readFileSync("src/theme/v3/index.js", "utf8")
].join("\n");
for (const token of ["v3Colors", "v3Spacing", "v3Radius", "v3Typography", "v3Shadows", "v3Theme", "#030306", "#8b5cf6", "#22d3ee"]) {
  if (!v3ThemeSource.includes(token)) throw new Error(`V3 theme token is missing: ${token}`);
}
const v3UiSource = collectJsFiles("src/components/v3").map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const token of ["V3Screen", "V3Text", "V3Button", "V3Card", "V3Input", "V3IconButton", "V3Badge", "V3SectionHeader", "V3DesignPreview"]) {
  if (!v3UiSource.includes(token)) throw new Error(`V3 UI primitive is missing: ${token}`);
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
if (!appNavigator.includes("../components/v3/ui")) {
  throw new Error("AppNavigator must use V3 UI primitives");
}
if (!appNavigator.includes("../theme/v3")) {
  throw new Error("AppNavigator must use V3 theme tokens");
}
if (appNavigator.includes("../components/ui")) {
  throw new Error("AppNavigator must not import old UI components after M0-D10");
}
if (appNavigator.includes("../utils/mobileTheme")) {
  throw new Error("AppNavigator must not import old mobileTheme after M0-D10");
}
for (const token of [
  "useMobileApp",
  "useSafeAreaInsets",
  "useCustomerActiveRide",
  "useCustomerRideRealtime",
  "I18nManager.allowRTL(true)",
  "state.restoreStatus === \"loading\"",
  "state.activeArea",
  "state.role === \"customer\"",
  "state.role === \"driver\"",
  "showConnectionBanner",
  "dispatch({ type: \"navigate\", area, screen })",
  "V3Text",
  "v3Colors",
  "v3Spacing",
  "v3Layout.bottomNavHeight",
  "bottomNavShell",
  "bottomNavDock",
  "tabActive",
  "tabIndicatorActive",
  "numberOfLines={1}",
  "ellipsizeMode=\"tail\"",
  "flexBasis: 0",
  "writingDirection: \"rtl\"",
  "home: CustomerHomeScreen",
  "request: RequestRideScreen",
  "\"ride-status\": CustomerRideStatusScreen",
  "rides: MyRidesScreen",
  "wallet: WalletScreen",
  "support: SupportScreen",
  "account: AccountScreen",
  "home: DriverHomeScreen",
  "available: AvailableRidesScreen",
  "current: CurrentRideScreen",
  "earnings: DriverEarningsScreen",
  "support: DriverSupportScreen",
  "\"dev-login\": DevDriverLoginScreen",
  "[\"home\",",
  "[\"request\",",
  "[\"rides\",",
  "[\"account\",",
  "[\"available\",",
  "[\"current\",",
  "[\"earnings\","
]) {
  if (!appNavigator.includes(token)) throw new Error(`M0-D10 AppNavigator token is missing: ${token}`);
}
for (const forbidden of ["tabMark", "\"01\"", "\"02\"", "\"03\"", "\"04\"", "\"05\"", "\"06\"", "[\"wallet\", \"محفظة\"]", "[\"support\", \"دعم\"]", "ScrollView", "horizontal"]) {
  if (appNavigator.includes(forbidden)) throw new Error(`bottom navigation regression found: ${forbidden}`);
}

const customerHome = fs.readFileSync("src/screens/customer/CustomerHomeScreen.js", "utf8");
if (!customerHome.includes("../../components/v3/ui")) throw new Error("CustomerHomeScreen must use V3 UI primitives");
if (!customerHome.includes("../../theme/v3")) throw new Error("CustomerHomeScreen must use V3 theme tokens");
if (customerHome.includes("../../components/ui")) throw new Error("CustomerHomeScreen must not import old UI components after M0-D4");
if (customerHome.includes("../../utils/mobileTheme")) throw new Error("CustomerHomeScreen must not import old mobileTheme after M0-D4");
for (const token of [
  "useCustomerActiveRide",
  "useMobileApp",
  "MobileRideMap",
  "V3Screen",
  "V3Card",
  "V3Button",
  "V3Badge",
  "V3SectionHeader",
  "V3Text",
  "activeRide = isActiveRide(state.currentRide)",
  "refreshActiveRide",
  "previewPickup",
  "previewDestination",
  "driverLocation={state.driverLocation}",
  "screen: \"request\"",
  "screen: \"ride-status\"",
  "\"wallet\"",
  "\"support\"",
  "\"account\"",
  "\"rides\"",
  "statusLabel(activeRide.status)",
  "money(activeRide.price || activeRide.fareIls)",
  "quickActionGrid",
  "activeRideCard"
]) {
  if (!customerHome.includes(token)) throw new Error(`M0-D4 CustomerHome token is missing: ${token}`);
}

const requestRide = fs.readFileSync("src/screens/customer/RequestRideScreen.js", "utf8");
if (!requestRide.includes("../../components/v3/ui")) throw new Error("RequestRideScreen must use V3 UI primitives");
if (!requestRide.includes("../../theme/v3")) throw new Error("RequestRideScreen must use V3 theme tokens");
if (requestRide.includes("../../components/ui")) throw new Error("RequestRideScreen must not import old UI components after M0-D5");
if (requestRide.includes("../../utils/mobileTheme")) throw new Error("RequestRideScreen must not import old mobileTheme after M0-D5");
for (const token of [
  "useRideRequestFlow",
  "MobileRideMap",
  "V3Screen",
  "V3Card",
  "V3Button",
  "V3Badge",
  "V3Input",
  "V3SectionHeader",
  "V3Text",
  "pickup",
  "destination",
  "destinationQuery",
  "suggestions.map",
  "chooseDestination(place)",
  "quote",
  "paymentMethod",
  "paymentMethods.map",
  "setPaymentMethod(method.value)",
  "cityChoices.map",
  "useCityFallback(city.value)",
  "useGpsLocation",
  "searchDestination",
  "submitRide",
  "status === \"location\"",
  "status === \"quote\"",
  "status === \"create\"",
  "height={286}",
  "bottomPanel"
]) {
  if (!requestRide.includes(token)) throw new Error(`M0-D5 Request Ride token is missing: ${token}`);
}
if (requestRide.indexOf("MobileRideMap") > requestRide.indexOf("bottomPanel")) {
  throw new Error("Request Ride must stay map-first before the request bottom panel");
}

const rideStatus = fs.readFileSync("src/screens/customer/CustomerRideStatusScreen.js", "utf8");
if (!rideStatus.includes("../../components/v3/ui")) throw new Error("CustomerRideStatusScreen must use V3 UI primitives");
if (!rideStatus.includes("../../theme/v3")) throw new Error("CustomerRideStatusScreen must use V3 theme tokens");
if (rideStatus.includes("../../components/ui")) throw new Error("CustomerRideStatusScreen must not import old UI components after M0-D6");
if (rideStatus.includes("../../utils/mobileTheme")) throw new Error("CustomerRideStatusScreen must not import old mobileTheme after M0-D6");
for (const token of [
  "useCustomerRideTracking",
  "useRideRating",
  "MobileRideMap",
  "V3Screen",
  "V3Card",
  "V3Button",
  "V3Badge",
  "V3SectionHeader",
  "V3Text",
  "setTrackedRide",
  "driverLocation={accepted ? driverLocation : null}",
  "userLocation={currentLocation}",
  "rideStatus={ride.status}",
  "height={292}",
  "statusPanel",
  "livePill",
  "statusTimeline",
  "searchingCard",
  "driverCard",
  "ratingCard",
  "starButtonActive",
  "setRatingDraft(star)",
  "setReviewDraft",
  "submitRating",
  "refresh",
  "cancel",
  "goToRequest",
  "goToRides",
  "showCancelAction",
  "showRidesAction",
  "paymentLabel(ride.paymentMethod)",
  "money(ride.price || ride.fareIls)",
  "km(ride.routeDistanceKm || ride.distanceKm)"
]) {
  if (!rideStatus.includes(token)) throw new Error(`M0-D6 Customer Ride Status token is missing: ${token}`);
}
if (rideStatus.indexOf("MobileRideMap") > rideStatus.indexOf("statusPanel")) {
  throw new Error("Ride Status must stay map-first before the status panel");
}

const driverHome = fs.readFileSync("src/screens/driver/DriverHomeScreen.js", "utf8");
if (!driverHome.includes("../../components/v3/ui")) {
  throw new Error("DriverHomeScreen must use V3 UI primitives");
}
if (!driverHome.includes("../../theme/v3")) {
  throw new Error("DriverHomeScreen must use V3 theme tokens");
}
if (driverHome.includes("../../components/ui")) {
  throw new Error("DriverHomeScreen must not import old UI components after M0-D7");
}
if (driverHome.includes("../../utils/mobileTheme")) {
  throw new Error("DriverHomeScreen must not import old mobileTheme after M0-D7");
}
for (const token of [
  "useDriverAvailability",
  "V3Screen",
  "V3Card",
  "V3Button",
  "V3Badge",
  "V3SectionHeader",
  "V3Text",
  "driver",
  "currentUser",
  "available",
  "status",
  "error",
  "availableCount",
  "currentRide",
  "socketStatus",
  "toggleAvailability",
  "logout",
  "goToAvailable",
  "goToCurrent",
  "goToEarnings",
  "goToSupport",
  "status === \"saving\"",
  "onPress={toggleAvailability}",
  "onPress={logout}",
  "onPress={goToAvailable}",
  "onPress={goToCurrent}",
  "onPress={goToEarnings}",
  "onPress={goToSupport}",
  "money(0)",
  "availabilityPanel",
  "actionGrid",
  "captainStats"
]) {
  if (!driverHome.includes(token)) throw new Error(`M0-D7 Driver Home token is missing: ${token}`);
}

const availableRides = fs.readFileSync("src/screens/driver/AvailableRidesScreen.js", "utf8");
if (!availableRides.includes("../../components/v3/ui")) {
  throw new Error("AvailableRidesScreen must use V3 UI primitives");
}
if (!availableRides.includes("../../theme/v3")) {
  throw new Error("AvailableRidesScreen must use V3 theme tokens");
}
if (availableRides.includes("../../components/ui")) {
  throw new Error("AvailableRidesScreen must not import old UI components after M0-D8");
}
if (availableRides.includes("../../utils/mobileTheme")) {
  throw new Error("AvailableRidesScreen must not import old mobileTheme after M0-D8");
}
for (const token of [
  "useAvailableDriverRides",
  "V3Screen",
  "V3Card",
  "V3Button",
  "V3Badge",
  "V3SectionHeader",
  "V3Text",
  "rides",
  "status",
  "socketStatus",
  "error",
  "dispatchMessage",
  "load",
  "accept",
  "paymentLabel",
  "statusLabel",
  "status === \"loading\"",
  "!rides.length",
  "onPress={load}",
  "accept(ride.id)",
  "requestQueue",
  "requestCard",
  "routeLine",
  "detailBadges"
]) {
  if (!availableRides.includes(token)) throw new Error(`M0-D8 Available Rides token is missing: ${token}`);
}

const driverCurrent = fs.readFileSync("src/screens/driver/CurrentRideScreen.js", "utf8");
const driverCurrentFlow = [
  driverCurrent,
  fs.readFileSync("src/hooks/useDriverCurrentRide.js", "utf8"),
  fs.readFileSync("src/hooks/useDriverLiveTracking.js", "utf8")
].join("\n");
if (!driverCurrent.includes("../../components/v3/ui")) {
  throw new Error("CurrentRideScreen must use V3 UI primitives");
}
if (!driverCurrent.includes("../../theme/v3")) {
  throw new Error("CurrentRideScreen must use V3 theme tokens");
}
if (driverCurrent.includes("../../components/ui")) {
  throw new Error("CurrentRideScreen must not import old UI components after M0-D9");
}
if (driverCurrent.includes("../../utils/mobileTheme")) {
  throw new Error("CurrentRideScreen must not import old mobileTheme after M0-D9");
}
for (const token of [
  "useDriverCurrentRide",
  "useDriverLiveTracking",
  "MobileRideMap",
  "V3Screen",
  "V3Card",
  "V3Button",
  "V3Badge",
  "V3SectionHeader",
  "V3Text",
  "currentRide",
  "action",
  "completed",
  "socketStatus",
  "pickupPoint",
  "destinationPoint",
  "driverLocation",
  "driverLocationTime",
  "trackingStatus",
  "trackingLabel",
  "trackingTone",
  "startTracking",
  "stopTracking",
  "goToAvailable",
  "paymentLabel",
  "statusLabel",
  "onPress={load}",
  "onPress={goToAvailable}",
  "onPress={startTracking}",
  "stopTracking(true)",
  "update(action[0], { onCompleted: () => stopTracking(false) })",
  "driverRideShell",
  "mapStage",
  "statusPanel",
  "routePanel",
  "trackingPanel",
  "nextActionPanel"
]) {
  if (!driverCurrent.includes(token)) throw new Error(`M0-D9 Current Ride token is missing: ${token}`);
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
if (!mobileRideMap.includes("../../theme/v3")) throw new Error("MobileRideMap must use V3 theme tokens");
if (mobileRideMap.includes("../../utils/mobileTheme")) throw new Error("MobileRideMap must not import old mobileTheme after M0-D11");
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
for (const token of [
  "markerSpec",
  "CustomMarker",
  "MapPoint",
  "Polyline",
  "routePoints.length === 2",
  "lineCap=\"round\"",
  "locationHint",
  "mapShade",
  "FallbackMap",
  "v3MapFrame",
  "v3MapOverlay",
  "markerBadge",
  "mapChrome",
  "fallbackGrid",
  "distanceBadge",
  "legendText",
  "strokeColor={driverToPickup ? v3Colors.success : v3Colors.purpleLight}"
]) {
  if (!mobileRideMap.includes(token)) throw new Error(`M0-D11 Mobile map feature is missing: ${token}`);
}

for (const forbiddenMapToken of ["googleMapsApiKey", "maps.googleapis.com", "GoogleMaps"]) {
  if (source.includes(forbiddenMapToken)) throw new Error(`Forbidden paid Google Maps API usage in mobile source: ${forbiddenMapToken}`);
}

for (const [label, file, tokens] of [
  ["My Rides", "src/screens/customer/MyRidesScreen.js", ["useCustomerRides", "V3Screen", "V3Card", "V3Badge", "V3Button", "continueRide(ride)", "goToRequest", "ratingLabel"]],
  ["Wallet", "src/screens/customer/WalletScreen.js", ["useCustomerWallet", "V3Screen", "V3Card", "V3Badge", "V3Button", "onPress={load}", "money(wallet?.balanceIls ?? wallet?.balance)"]],
  ["Customer Support", "src/screens/customer/SupportScreen.js", ["useSupportTickets", "V3Screen", "V3Input", "V3Button", "issueTypes.map", "setType(item.value)", "onPress={submit}", "disabled={!message.trim()}"]],
  ["Driver Earnings", "src/screens/driver/DriverEarningsScreen.js", ["V3Screen", "V3Card", "V3Badge", "V3SectionHeader", "money(totalEarnings)", "completedRides"]],
  ["Driver Support", "src/screens/driver/DriverSupportScreen.js", ["useSupportTickets", "V3Screen", "V3Input", "V3Button", "issueTypes.map", "setType(item.value)", "onPress={submit}", "disabled={!message.trim()}"]]
]) {
  const fileSource = fs.readFileSync(file, "utf8");
  if (!fileSource.includes("../../components/v3/ui")) throw new Error(`${label} must use V3 UI primitives`);
  if (!fileSource.includes("../../theme/v3")) throw new Error(`${label} must use V3 theme tokens`);
  if (fileSource.includes("../../components/ui")) throw new Error(`${label} must not import old UI components after M0-D2`);
  if (fileSource.includes("../../utils/mobileTheme")) throw new Error(`${label} must not import old mobileTheme after M0-D2`);
  for (const token of tokens) {
    if (!fileSource.includes(token)) throw new Error(`M0-D2 ${label} token is missing: ${token}`);
  }
}

for (const [label, file, tokens] of [
  ["Login", "src/screens/auth/LoginScreen.js", ["useCustomerLogin", "V3Screen", "V3Card", "V3Input", "V3Button", "setIdentifier", "setPassword", "onPress={submit}", "goToRegister", "goToDevDriverLogin"]],
  ["Register", "src/screens/auth/RegisterScreen.js", ["useRegisterCustomer", "V3Screen", "V3Card", "V3Input", "V3Button", "update(\"fullName\"", "update(\"phone\"", "update(\"password\"", "goToLogin"]],
  ["OTP", "src/screens/auth/OtpScreen.js", ["useOtpVerification", "V3Screen", "V3Card", "V3Input", "V3Button", "pendingPhone", "setCode", "onPress={submit}"]],
  ["Account", "src/screens/customer/AccountScreen.js", ["useLogout", "V3Screen", "V3Card", "V3Badge", "V3Button", "navigateToWallet", "navigateToSupport", "onPress={logout}"]],
  ["Dev Driver Login", "src/screens/driver/DevDriverLoginScreen.js", ["useDevDriverLogin", "V3Screen", "V3Card", "V3Input", "V3Button", "setDriverId", "setPhone", "goToCustomerLogin", "disabled={!driverId && !phone}"]]
]) {
  const fileSource = fs.readFileSync(file, "utf8");
  if (!fileSource.includes("../../components/v3/ui")) throw new Error(`${label} must use V3 UI primitives`);
  if (!fileSource.includes("../../theme/v3")) throw new Error(`${label} must use V3 theme tokens`);
  if (fileSource.includes("../../components/ui")) throw new Error(`${label} must not import old UI components after M0-D3`);
  if (fileSource.includes("../../utils/mobileTheme")) throw new Error(`${label} must not import old mobileTheme after M0-D3`);
  for (const token of tokens) {
    if (!fileSource.includes(token)) throw new Error(`M0-D3 ${label} token is missing: ${token}`);
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
