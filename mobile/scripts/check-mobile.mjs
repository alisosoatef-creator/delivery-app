import fs from "node:fs";

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
  "src/services/supportApi.js",
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

const sourceFiles = [
  "src/config/appConfig.js",
  "src/services/apiClient.js",
  "src/services/authApi.js",
  "src/services/driverApi.js",
  "src/services/locationService.js",
  "src/services/placesApi.js",
  "src/services/ridesApi.js",
  "src/services/sessionStorage.js",
  "src/services/socketClient.js",
  "src/store/mobileStore.js",
  "src/utils/locationUtils.js",
  "src/utils/errorUtils.js",
  "src/utils/startupDiagnostics.js",
  "src/utils/rideStatus.js",
  "src/utils/mobileTheme.js",
  "src/hooks/useCustomerActiveRide.js",
  "src/hooks/useCustomerRideRealtime.js",
  "src/components/ErrorBoundary.js",
  "src/components/map/MobileRideMap.js",
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
  "src/App.js",
  "src/screens/auth/RegisterScreen.js",
  "src/screens/auth/OtpScreen.js",
  "src/screens/auth/LoginScreen.js",
  "src/screens/customer/RequestRideScreen.js",
  "src/screens/customer/CustomerRideStatusScreen.js",
  "src/screens/customer/CustomerHomeScreen.js",
  "src/screens/customer/MyRidesScreen.js",
  "src/screens/customer/WalletScreen.js",
  "src/screens/customer/SupportScreen.js",
  "src/screens/customer/AccountScreen.js",
  "src/screens/driver/AvailableRidesScreen.js",
  "src/screens/driver/CurrentRideScreen.js",
  "src/screens/driver/DevDriverLoginScreen.js",
  "src/screens/driver/DriverHomeScreen.js",
  "src/screens/driver/DriverEarningsScreen.js",
  "src/screens/driver/DriverSupportScreen.js",
  "src/navigation/AppNavigator.js"
];

const source = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");

for (const token of [
  "EXPO_PUBLIC_API_BASE_URL",
  "http://10.0.2.2:3001/api",
  "POST",
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
  "حدث خطأ في تطبيق الموبايل",
  "تسجيل الخروج ومسح الجلسة",
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
  "الخريطة غير جاهزة بعد",
  "haversineKm",
  "/places/search",
  "إلى أين تريد الذهاب؟",
  "createRide",
  "fetchCustomerRideDetails",
  "fetchActiveCustomerRide",
  "ACTIVE_RIDE_STATUSES",
  "findActiveRide",
  "isActiveRide",
  "setActiveRide",
  "activeRideStatus",
  "لديك رحلة نشطة",
  "متابعة الرحلة",
  "متابعة",
  "لا توجد رحلة نشطة الآن",
  "/driver/available-rides",
  "/driver/my-rides",
  "acceptRide",
  "updateDriverRideStatus",
  "X-Dev-Driver-Id",
  "X-Dev-Phone",
  "X-Dev-User-Id",
  "fallback",
  "تفعيل موقعي المباشر",
  "بانتظار تفعيل موقع الكابتن المباشر",
  "Development Only",
  "CustomerHomeScreen",
  "DriverHomeScreen",
  "surfaceGlass",
  "boxShadow",
  "SectionHeader",
  "StatCard",
  "ChoiceChip",
  "Premium Ride Experience",
  "VISA Placeholder",
  "BrandMark",
  "StatusTimeline",
  "ErrorState",
  "مشاوير ذكية في الضفة الغربية",
  "معاينة المسار",
  "boxShadow",
  "pressed",
  "focused"
]) {
  if (!source.includes(token)) {
    throw new Error(`Missing mobile foundation token: ${token}`);
  }
}

const sessionStorageSource = fs.readFileSync("src/services/sessionStorage.js", "utf8");
if (/\bpassword\b/i.test(sessionStorageSource)) {
  throw new Error("sessionStorage must not persist passwords");
}

const mobileSourceFiles = fs.readdirSync("src", { recursive: true })
  .filter((file) => String(file).endsWith(".js"))
  .map((file) => `src/${String(file).replace(/\\/g, "/")}`);
const mobileSource = mobileSourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const forbidden of ["react-dom", "leaflet", "react-leaflet", "document.", "window."]) {
  if (mobileSource.includes(forbidden)) {
    throw new Error(`Forbidden web-only mobile import or global: ${forbidden}`);
  }
}

for (const forbiddenText of ["دلفري", "مطاعم", "منتجات"]) {
  if (mobileSource.includes(forbiddenText)) {
    throw new Error(`Forbidden non-ride mobile copy: ${forbiddenText}`);
  }
}

if (/[ØÙÂâ]/.test(mobileSource)) {
  throw new Error("Broken mojibake text found in mobile source");
}

console.log("mobile-check-ok");
