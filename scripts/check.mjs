import fs from "node:fs";
import { execFileSync } from "node:child_process";

const requiredFiles = [
  "index.html",
  "src/main.jsx",
  "src/App.jsx",
  "src/styles.css",
  "backend/server.mjs",
  "backend/data.mjs",
  "backend/schema.sql",
  "backend/api-contract.md"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const script of ["dev", "api", "build", "check"]) {
  if (!packageJson.scripts?.[script]) {
    throw new Error(`Missing npm script: ${script}`);
  }
}

const sourceOrder = [
  "src/utils/rideUtils.js",
  "src/App.jsx",
  "src/routes/guards.jsx",
  "src/routes/routeConfig.js",
  "src/routes/index.js",
  "src/features/auth/AuthScreen.jsx",
  "src/features/auth/AuthField.jsx",
  "src/components/layout/Shell.jsx",
  "src/features/customer/CustomerShell.jsx",
  "src/components/ui/SettingsIcon.jsx",
  "src/features/customer/CustomerPanel.jsx",
  "src/features/driver/DriverPanel.jsx",
  "src/features/rides/PhaseTwoExperience.jsx",
  "src/features/rides/RideTimeline.jsx",
  "src/features/rides/RideHistoryPanel.jsx",
  "src/features/rides/RideDetailPage.jsx",
  "src/features/support/CustomerSupportPanel.jsx",
  "src/features/customer/AccountProfilePanel.jsx",
  "src/features/payments/WalletPaymentPanel.jsx",
  "src/features/customer/AccountSettingsPanel.jsx",
  "src/features/admin/AdminPanel.jsx",
  "src/features/rides/RouteSearchCard.jsx",
  "src/components/layout/TopBar.jsx",
  "src/features/rides/MapBoard.jsx",
  "src/features/rides/LegacyMapBoard.jsx",
  "src/components/ui/Field.jsx",
  "src/components/ui/PanelTitle.jsx",
  "src/components/ui/StatusBadge.jsx",
  "src/components/ui/QuoteStrip.jsx",
  "src/components/ui/Metric.jsx",
  "src/components/ui/Avatar.jsx",
  "src/components/ui/Toast.jsx",
  "src/features/auth/LegacyAuthScreen.jsx",
  "src/utils/constants.js",
  "src/utils/mapUtils.js",
  "src/utils/paymentUtils.js",
  "src/utils/i18n.js",
  "src/store/appState.js",
  "src/services/api.js",
  "src/services/rides.js"
];

const appSource = sourceOrder
  .filter((file) => fs.existsSync(file))
  .map((file) => `\n/* ${file} */\n${fs.readFileSync(file, "utf8")}`)
  .join("\n");
const stylesSource = fs.readFileSync("src/styles.css", "utf8");
const routeGuardSource = fs.existsSync("src/routes/guards.jsx")
  ? fs.readFileSync("src/routes/guards.jsx", "utf8")
  : "";
const routeConfigSource = fs.existsSync("src/routes/routeConfig.js")
  ? fs.readFileSync("src/routes/routeConfig.js", "utf8")
  : "";

for (const routeFile of [
  "src/routes/guards.jsx",
  "src/routes/routeConfig.js",
  "src/routes/index.js"
]) {
  if (!fs.existsSync(routeFile)) {
    throw new Error(`Missing route organization file: ${routeFile}`);
  }
}

for (const guardToken of [
  "function GuestRoute",
  "function ProtectedRoute",
  "function CustomerRoute",
  "function DriverRoute",
  "function AdminRoute",
  "allowedRole",
  "state.session",
  "state.role"
]) {
  if (!routeGuardSource.includes(guardToken)) {
    throw new Error(`Route guard is missing role/session token: ${guardToken}`);
  }
}

for (const routeToken of [
  '"/login"',
  '"/register"',
  '"/verify-otp"',
  '"/customer"',
  '"/customer/home"',
  '"/customer/request-ride"',
  '"/customer/rides"',
  '"/customer/settings"',
  '"/customer/support"',
  '"/driver/apply"',
  '"/driver/dashboard"',
  '"/admin/dashboard"',
  '"/admin/customers"',
  '"/admin/drivers"',
  '"/admin/driver-applications"',
  '"/admin/rides"',
  '"/admin/payments"',
  '"/admin/support"',
  '"/admin/settings"'
]) {
  if (!routeConfigSource.includes(routeToken)) {
    throw new Error(`Route registry is missing path: ${routeToken}`);
  }
}

for (const appRoutingToken of [
  "<GuestRoute",
  "<CustomerRoute",
  "<DriverRoute",
  "<AdminRoute",
  "roleRouteFallback",
  "APP_ROUTE_PATHS"
]) {
  if (!appSource.includes(appRoutingToken)) {
    throw new Error(`App must render through route guards: ${appRoutingToken}`);
  }
}
const authStart = appSource.indexOf("function AuthScreen");
const shellStart = appSource.indexOf("function Shell", authStart);

if (authStart === -1 || shellStart === -1) {
  throw new Error("Unable to locate AuthScreen boundary in src/App.jsx");
}

const authSource = appSource.slice(authStart, shellStart);
for (const blocked of ["<RouteSearchCard", "<MapBoard", "home-map-panel", "route-search-card"]) {
  if (authSource.includes(blocked)) {
    throw new Error(`AuthScreen must not expose ride booking or map UI before login: ${blocked}`);
  }
}

for (const fieldName of ["fullName", "age", "birthDate", "city", "phone", "password", "confirmPassword"]) {
  if (!appSource.includes(`name="${fieldName}"`)) {
    throw new Error(`Register form is missing required field: ${fieldName}`);
  }
}

for (const requiredAuthToken of ["auth-mode-login", "auth-mode-register", "auth-mode-otp", "1234"]) {
  if (!appSource.includes(requiredAuthToken)) {
    throw new Error(`Customer auth flow is missing: ${requiredAuthToken}`);
  }
}

for (const blockedDriverSignupToken of ['login("driver")', 'role: "driver"', "setAuthMode(\"driver\")"]) {
  if (authSource.includes(blockedDriverSignupToken)) {
    throw new Error(`AuthScreen must not grant direct driver access: ${blockedDriverSignupToken}`);
  }
}

for (const blockedCaptainApplicationToken of [
  "auth-mode-captain",
  "captainRequestSubmitted",
  "captainForm",
  "handleCaptainRequest",
  "captain-request-card",
  "name=\"captainFullName\"",
  "name=\"captainPhone\"",
  "name=\"captainCity\"",
  "name=\"captainAge\"",
  "name=\"captainVehicleType\"",
  "name=\"captainVehicleNumber\"",
  "name=\"captainNotes\""
]) {
  if (authSource.includes(blockedCaptainApplicationToken)) {
    throw new Error(`AuthScreen must keep captain signup as a placeholder for this phase: ${blockedCaptainApplicationToken}`);
  }
}

for (const authPhaseThreeToken of [
  "const DEMO_OTP = \"1234\"",
  "isReasonableAge",
  "pendingUser",
  "verifiedUser",
  "handleCaptainPlaceholder",
  "captainPlaceholder"
]) {
  if (!appSource.includes(authPhaseThreeToken)) {
    throw new Error(`Customer auth phase three is missing: ${authPhaseThreeToken}`);
  }
}

if (!stylesSource.includes(".welcome-auth")) {
  throw new Error("Welcome/auth screen styles are missing");
}

if (!stylesSource.includes(".welcome-auth-support")) {
  throw new Error("Auth support placeholder styles are missing");
}

const customerShellStart = appSource.indexOf("function CustomerShell");
const customerPanelStart = appSource.indexOf("function CustomerPanel");
if (customerShellStart === -1 || customerPanelStart === -1 || customerPanelStart < customerShellStart) {
  throw new Error("Customer experience must use a dedicated CustomerShell before CustomerPanel");
}

const customerShellSource = appSource.slice(customerShellStart, customerPanelStart);
const shellSource = appSource.slice(shellStart, customerShellStart);
for (const customerToken of [
  "customer-app-layout",
  "customer-navbar",
  "customer-nav",
  "customer-bottom-nav",
  "customer-settings-button",
  "طلب مشوار",
  "رحلاتي",
  "المحفظة",
  "الدعم",
  "حسابي"
]) {
  if (!customerShellSource.includes(customerToken)) {
    throw new Error(`CustomerShell is missing customer navigation token: ${customerToken}`);
  }
}

for (const blockedCustomerShellToken of [
  'role: "driver"',
  'role: "admin"',
  "backendLive",
  "liveTicks",
  "nav-stack",
  "sidebar"
]) {
  if (customerShellSource.includes(blockedCustomerShellToken)) {
    throw new Error(`CustomerShell must not expose experimental/admin controls: ${blockedCustomerShellToken}`);
  }
}

for (const blockedShellRoleSwitcher of [
  'role: "customer"',
  'role: "driver"',
  'role: "admin"',
  "nav-stack"
]) {
  if (shellSource.includes(blockedShellRoleSwitcher)) {
    throw new Error(`Role shell must not expose manual role switching: ${blockedShellRoleSwitcher}`);
  }
}

if (!appSource.includes('if (state.role === "customer")') || !appSource.includes("<CustomerShell")) {
  throw new Error("Logged-in customers must render through CustomerShell");
}

if (!stylesSource.includes(".customer-app-layout") || !stylesSource.includes(".customer-bottom-nav")) {
  throw new Error("Customer-only responsive layout styles are missing");
}

const customerPanelEnd = appSource.indexOf("function DriverPanel", customerPanelStart);
if (customerPanelEnd === -1) {
  throw new Error("Unable to locate CustomerPanel boundary for settings checks");
}

const customerPanelSource = appSource.slice(customerPanelStart, customerPanelEnd);
if (customerPanelSource.includes('activeView === "settings"') || customerPanelSource.includes("<AccountSettingsPanel")) {
  throw new Error("Account settings must open from the navbar as a separate panel, not as a large customer page section");
}

for (const settingsShellToken of [
  "settingsPanelOpen",
  "settings-panel-backdrop",
  "account-settings-drawer",
  'aria-modal="true"',
  "setSettingsPanelOpen(true)"
]) {
  if (!customerShellSource.includes(settingsShellToken)) {
    throw new Error(`Customer settings drawer must be launched from the navbar: ${settingsShellToken}`);
  }
}

const accountSettingsStart = appSource.indexOf("function AccountSettingsPanel");
const adminPanelStart = appSource.indexOf("function AdminPanel", accountSettingsStart);
if (accountSettingsStart === -1 || adminPanelStart === -1) {
  throw new Error("Unable to locate AccountSettingsPanel for settings checks");
}

const accountSettingsSource = appSource.slice(accountSettingsStart, adminPanelStart);
for (const settingsToken of [
  "account-settings-panel",
  "settings-section account-info-section",
  "settings-section location-addresses-section",
  "settings-section payment-settings-section",
  "settings-section app-settings-section",
  "settings-section support-settings-section",
  'name="settingsFullName"',
  'name="settingsPhone"',
  'name="settingsAvatar"',
  'name="settingsPassword"',
  'name="homeAddress"',
  'name="workAddress"',
  'name="universityAddress"',
  "update-current-location",
  "default-payment-choice",
  "settings-visa-placeholder",
  "settings-local-note"
]) {
  if (!accountSettingsSource.includes(settingsToken)) {
    throw new Error(`Account settings panel is missing required section/control: ${settingsToken}`);
  }
}

if (!stylesSource.includes(".account-settings-drawer") || !stylesSource.includes(".settings-section")) {
  throw new Error("Detached account settings panel styles are missing");
}

const requestRideStart = appSource.indexOf("async function requestRide");
const updateRideStatusStart = appSource.indexOf("async function updateRideStatus", requestRideStart);
const phaseTwoStart = appSource.indexOf("function PhaseTwoExperience");
const rideTimelineStart = appSource.indexOf("function RideTimeline", phaseTwoStart);

if (requestRideStart === -1 || updateRideStatusStart === -1 || phaseTwoStart === -1 || rideTimelineStart === -1) {
  throw new Error("Unable to locate ride request or driver search flow");
}

const requestRideSource = appSource.slice(requestRideStart, updateRideStatusStart);
const phaseTwoSource = appSource.slice(phaseTwoStart, rideTimelineStart);

for (const backendAcceptanceToken of ["backendAcceptedRide", "visibleRide", "pendingAcceptanceTimerRef"]) {
  if (!requestRideSource.includes(backendAcceptanceToken)) {
    throw new Error(`Backend-immediate accepted rides must be normalized before showing driver details: ${backendAcceptanceToken}`);
  }
}

if (requestRideSource.includes("ride: result.ride,")) {
  throw new Error("Backend ride responses must not be shown directly before the customer sees the searching state");
}

for (const searchFlowToken of [
  "hasAcceptedDriver",
  "captain-search-card",
  "captain-pending-card",
  "accepted-driver-card",
  "جاري البحث عن كابتن قريب"
]) {
  if (!phaseTwoSource.includes(searchFlowToken)) {
    throw new Error(`Driver search flow is missing: ${searchFlowToken}`);
  }
}

for (const blockedPreAcceptanceToken of [
  "selectedDriver || state.drivers[0]",
  "driverName = isArabic ? driver.nameAr",
  "driver.vehicle ||"
]) {
  if (phaseTwoSource.includes(blockedPreAcceptanceToken)) {
    throw new Error(`Driver details must not be derived before acceptance: ${blockedPreAcceptanceToken}`);
  }
}

const buildRideHistoryStart = appSource.indexOf("function buildRideHistory");
const appStart = appSource.indexOf("function App", buildRideHistoryStart);
if (buildRideHistoryStart === -1 || appStart === -1) {
  throw new Error("Unable to locate ride history builder");
}

const buildRideHistorySource = appSource.slice(buildRideHistoryStart, appStart);
for (const historyDriverToken of ["rideHasAcceptedDriver", "hasAcceptedDriver", "Pending captain acceptance"]) {
  if (!buildRideHistorySource.includes(historyDriverToken)) {
    throw new Error(`Ride history must not reveal captain details before acceptance: ${historyDriverToken}`);
  }
}

const routeSearchStart = appSource.indexOf("function RouteSearchCard");
const topBarStart = appSource.indexOf("function TopBar", routeSearchStart);
if (routeSearchStart === -1 || topBarStart === -1) {
  throw new Error("Unable to locate RouteSearchCard for payment checks");
}

const routeSearchSource = appSource.slice(routeSearchStart, topBarStart);
for (const paymentToken of [
  'paymentMethod: "visa"',
  'state.paymentMethod === "visa"',
  "visa-payment-panel",
  "visa-card-form",
  'name="cardHolderName"',
  'name="cardNumber"',
  'name="cardExpiry"',
  'name="cardCvv"',
  'name="saveVisaCardDemo"',
  "use-demo-visa-card",
  "secure-payment-note"
]) {
  if (!routeSearchSource.includes(paymentToken)) {
    throw new Error(`VISA placeholder payment UI is missing: ${paymentToken}`);
  }
}

for (const blockedPaymentToken of [
  'paymentMethod: "wallet"',
  "state.paymentMethod === \"wallet\""
]) {
  if (routeSearchSource.includes(blockedPaymentToken)) {
    throw new Error(`Ride request payment choices must be cash and VISA only: ${blockedPaymentToken}`);
  }
}

for (const blockedCardPayloadToken of [
  "cardHolderName",
  "cardNumber",
  "cardExpiry",
  "cardCvv",
  "saveVisaCardDemo"
]) {
  if (requestRideSource.includes(blockedCardPayloadToken)) {
    throw new Error(`Card details must not be sent through ride request payload: ${blockedCardPayloadToken}`);
  }
}

if (!stylesSource.includes(".visa-payment-panel") || !stylesSource.includes(".payment-card-preview")) {
  throw new Error("VISA placeholder payment styles are missing");
}

if (!packageJson.dependencies?.leaflet) {
  throw new Error("Real map integration must add the leaflet dependency");
}

for (const mapToken of [
  'import L from "leaflet"',
  'import "leaflet/dist/leaflet.css"',
  "const NABLUS_CENTER",
  "navigator.geolocation.getCurrentPosition",
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "L.map",
  "L.tileLayer",
  "customer-location-marker",
  "driver-location-marker",
  "haversineKm",
  "locationStatus"
]) {
  if (!appSource.includes(mapToken)) {
    throw new Error(`Real Leaflet map integration is missing: ${mapToken}`);
  }
}

const mapBoardStart = appSource.indexOf("function MapBoard");
const fieldStart = appSource.indexOf("function Field", mapBoardStart);
if (mapBoardStart === -1 || fieldStart === -1) {
  throw new Error("Unable to locate MapBoard for real map checks");
}

const mapBoardSource = appSource.slice(mapBoardStart, fieldStart);
for (const mapBoardToken of [
  "nablus-live-map",
  "mapRef",
  "mapInstanceRef",
  "customerMarkerRef",
  "driverMarkerRef",
  "driverDistanceKm",
  "showDrivers && driverLocation",
  "const driver = showDrivers ? selectedDriver : null"
]) {
  if (!mapBoardSource.includes(mapBoardToken)) {
    throw new Error(`MapBoard must render a real responsive customer/driver map: ${mapBoardToken}`);
  }
}

for (const premiumStyleToken of [
  "/* phase-8-premium-polish */",
  "--premium-ink",
  "--premium-gold",
  "--premium-ease",
  "--shadow-premium",
  ".premium-surface",
  ".premium-interactive",
  ".welcome-auth::after",
  ".auth-panel",
  ".route-search-card::after",
  ".real-map-board .leaflet-tile",
  ".captain-search-card.is-searching",
  ".tracking-card .real-map-board",
  ".customer-support-card",
  ".account-settings-drawer",
  ".detail-empty",
  ".auth-error",
  ".toast",
  "@media (hover: hover)",
  "@media (prefers-reduced-motion: reduce)"
]) {
  if (!stylesSource.includes(premiumStyleToken)) {
    throw new Error(`Premium visual polish is missing: ${premiumStyleToken}`);
  }
}

for (const premiumMotionToken of [
  "button::after",
  "transform: translateY(-2px)",
  "filter: saturate(1.08)",
  "animation: shimmer",
  "animation: softFloat",
  "outline: none",
  "focus-visible"
]) {
  if (!stylesSource.includes(premiumMotionToken)) {
    throw new Error(`Premium micro-interaction/focus polish is missing: ${premiumMotionToken}`);
  }
}

execFileSync(process.execPath, ["--check", "backend/server.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/data.mjs"], { stdio: "inherit" });

console.log("project-check-ok");
