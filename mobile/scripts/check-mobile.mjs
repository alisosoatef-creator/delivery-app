import fs from "node:fs";

const required = [
  "app/_layout.js",
  "app/index.js",
  "components/wasel-mobile-app.js",
  "data/fallback.js",
  "lib/api.js",
  "src/App.js",
  "src/config/appConfig.js",
  "src/services/apiClient.js",
  "src/services/authApi.js",
  "src/services/driverApi.js",
  "src/services/ridesApi.js",
  "src/services/supportApi.js",
  "src/store/mobileStore.js",
  "src/navigation/AppNavigator.js",
  "src/screens/auth/LoginScreen.js",
  "src/screens/auth/RegisterScreen.js",
  "src/screens/auth/OtpScreen.js",
  "src/screens/customer/CustomerHomeScreen.js",
  "src/screens/customer/RequestRideScreen.js",
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

const source = [
  "src/config/appConfig.js",
  "src/services/apiClient.js",
  "src/services/authApi.js",
  "src/services/driverApi.js",
  "src/screens/auth/RegisterScreen.js",
  "src/screens/auth/OtpScreen.js",
  "src/screens/auth/LoginScreen.js",
  "src/screens/driver/DevDriverLoginScreen.js",
  "src/navigation/AppNavigator.js"
].map((file) => fs.readFileSync(file, "utf8")).join("\n");

for (const token of [
  "EXPO_PUBLIC_API_BASE_URL",
  "http://10.0.2.2:3001/api",
  "POST",
  "/auth/register",
  "/auth/verify-otp",
  "/auth/login",
  "/driver/available-rides",
  "Development Only",
  "CustomerHomeScreen",
  "DriverHomeScreen"
]) {
  if (!source.includes(token)) {
    throw new Error(`Missing mobile foundation token: ${token}`);
  }
}

console.log("mobile-check-ok");
