import fs from "node:fs";
import { execFileSync } from "node:child_process";

const requiredFiles = [
  "index.html",
  "src/main.jsx",
  "src/App.jsx",
  "src/styles.css",
  "src/utils/roles.js",
  "src/components/ui/AccessDenied.jsx",
  "src/features/auth/AdminDevLogin.jsx",
  "backend/server.mjs",
  "backend/data.mjs",
  "backend/auth/passwords.mjs",
  "backend/db/database.mjs",
  "backend/db/schema.mjs",
  "backend/db/seed.mjs",
  "backend/schema.sql",
  "backend/api-contract.md",
  "scripts/backend-smoke.mjs"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const script of ["dev", "api", "db:init", "db:seed", "build", "check", "api:check"]) {
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
  "src/utils/roles.js",
  "src/components/ui/AccessDenied.jsx",
  "src/features/auth/AuthScreen.jsx",
  "src/features/auth/AdminDevLogin.jsx",
  "src/features/auth/AuthField.jsx",
  "src/features/driver/CaptainApplicationPanel.jsx",
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
  "src/features/admin/AdminShell.jsx",
  "src/features/admin/AdminSidebar.jsx",
  "src/features/admin/AdminHeader.jsx",
  "src/features/admin/AdminStats.jsx",
  "src/features/admin/AdminDashboard.jsx",
  "src/features/admin/AdminDriverApplications.jsx",
  "src/features/admin/AdminCustomers.jsx",
  "src/features/admin/AdminDrivers.jsx",
  "src/features/admin/AdminRides.jsx",
  "src/features/admin/AdminPayments.jsx",
  "src/features/admin/AdminSupport.jsx",
  "src/features/admin/AdminPricing.jsx",
  "src/features/admin/AdminSettings.jsx",
  "src/features/admin/AdminPermissions.jsx",
  "src/features/admin/adminMockData.js",
  "src/features/rides/RouteSearchCard.jsx",
  "src/features/rides/RideMap.jsx",
  "src/features/rides/LocationPicker.jsx",
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
  "src/utils/westBankCities.js",
  "src/utils/mapUtils.js",
  "src/utils/paymentUtils.js",
  "src/utils/i18n.js",
  "src/store/appState.js",
  "src/services/apiClient.js",
  "src/services/api.js",
  "src/services/rides.js",
  "src/services/authApi.js",
  "src/services/captainApplicationsApi.js",
  "src/services/adminApi.js",
  "src/services/ridesApi.js",
  "src/services/supportApi.js",
  "src/services/pricingApi.js",
  "src/services/bootstrapApi.js",
  "src/hooks/useAuthApi.js",
  "src/hooks/useCaptainApplications.js",
  "src/hooks/useAdminData.js",
  "src/hooks/useRidesApi.js",
  "src/hooks/useBootstrap.js"
];

const appSource = sourceOrder
  .filter((file) => fs.existsSync(file))
  .map((file) => `\n/* ${file} */\n${fs.readFileSync(file, "utf8")}`)
  .join("\n");
const mainSource = fs.readFileSync("src/main.jsx", "utf8");
const stylesSource = fs.readFileSync("src/styles.css", "utf8");
const backendSource = fs.readFileSync("backend/server.mjs", "utf8");
const backendDataSource = fs.readFileSync("backend/data.mjs", "utf8");
const backendAuthSource = fs.readFileSync("backend/auth/passwords.mjs", "utf8");
const backendDatabaseSource = fs.readFileSync("backend/db/database.mjs", "utf8");
const backendSchemaSource = fs.readFileSync("backend/db/schema.mjs", "utf8");
const backendSeedSource = fs.readFileSync("backend/db/seed.mjs", "utf8");
const backendSmokeSource = fs.readFileSync("scripts/backend-smoke.mjs", "utf8");
const gitignoreSource = fs.existsSync(".gitignore") ? fs.readFileSync(".gitignore", "utf8") : "";
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
  '"/admin/dev-login"',
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
  "<AccessDenied",
  "<AdminDevLogin",
  "roleRouteFallback",
  "APP_ROUTE_PATHS"
]) {
  if (!appSource.includes(appRoutingToken)) {
    throw new Error(`App must render through route guards: ${appRoutingToken}`);
  }
}

for (const roleToken of [
  "export const ROLES",
  'guest: "guest"',
  'customer: "customer"',
  'driver: "driver"',
  'admin: "admin"',
  'owner: "owner"',
  'support: "support"',
  'operations: "operations"',
  "ADMIN_ROLES",
  "canAccessAdmin",
  "canAccessDriver",
  "homePathForRole",
  "function AccessDenied",
  "لا تملك صلاحية الوصول لهذه الصفحة",
  "function AdminDevLogin",
  "admin",
  "1234",
  "import.meta.env.DEV"
]) {
  if (!appSource.includes(roleToken)) {
    throw new Error(`Phase 9 role/permission system is missing: ${roleToken}`);
  }
}

for (const guardPermissionToken of [
  "allowedRoles",
  "canAccessAdmin(state)",
  "canAccessDriver(state)",
  "currentRole(state) === ROLES.customer",
  "AccessDenied",
  "onNavigateHome",
  "homePathForRole"
]) {
  if (!routeGuardSource.includes(guardPermissionToken) && !appSource.includes(guardPermissionToken)) {
    throw new Error(`Phase 9 route guard behavior is missing: ${guardPermissionToken}`);
  }
}

for (const adminFile of [
  "src/features/admin/AdminShell.jsx",
  "src/features/admin/AdminSidebar.jsx",
  "src/features/admin/AdminHeader.jsx",
  "src/features/admin/AdminStats.jsx",
  "src/features/admin/AdminDashboard.jsx",
  "src/features/admin/AdminDriverApplications.jsx",
  "src/features/admin/AdminCustomers.jsx",
  "src/features/admin/AdminDrivers.jsx",
  "src/features/admin/AdminRides.jsx",
  "src/features/admin/AdminPayments.jsx",
  "src/features/admin/AdminSupport.jsx",
  "src/features/admin/AdminPricing.jsx",
  "src/features/admin/AdminSettings.jsx",
  "src/features/admin/AdminPermissions.jsx"
]) {
  if (!fs.existsSync(adminFile)) {
    throw new Error(`Admin system file is missing: ${adminFile}`);
  }
}

for (const adminSystemToken of [
  "function AdminShell",
  "function AdminSidebar",
  "function AdminHeader",
  "function AdminStats",
  "function AdminDashboard",
  "function AdminDriverApplications",
  "function AdminCustomers",
  "function AdminDrivers",
  "function AdminRides",
  "function AdminPayments",
  "function AdminSupport",
  "function AdminPricing",
  "function AdminSettings",
  "function AdminPermissions",
  "pendingCaptainApplications",
  "approvedCaptains",
  "adminStats",
  "supportTickets",
  "pricingRules",
  "approveCaptainApplication",
  "rejectCaptainApplication",
  "status: \"approved\"",
  "status: \"rejected\"",
  "admin-app-layout",
  "admin-sidebar",
  "admin-header",
  "admin-stat-grid",
  "admin-data-table",
  "admin-permission-grid",
  "Placeholder"
]) {
  if (!appSource.includes(adminSystemToken)) {
    throw new Error(`Admin system is missing: ${adminSystemToken}`);
  }
}

if (appSource.includes("<Shell {...sharedProps} routePath={APP_ROUTE_PATHS.admin.dashboard}")) {
  throw new Error("Admin dashboard must render through the dedicated AdminShell, not the shared role Shell");
}

for (const adminStyleToken of [
  ".admin-app-layout",
  ".admin-sidebar",
  ".admin-header",
  ".admin-stat-grid",
  ".admin-data-table",
  ".admin-action-row",
  ".admin-permission-grid"
]) {
  if (!stylesSource.includes(adminStyleToken)) {
    throw new Error(`Admin system styles are missing: ${adminStyleToken}`);
  }
}

if (!packageJson.dependencies?.["@tanstack/react-query"]) {
  throw new Error("Phase 7A must install @tanstack/react-query");
}

if (!packageJson.dependencies?.bcryptjs) {
  throw new Error("Phase 8 auth must install bcryptjs for password hashing");
}

for (const queryProviderToken of [
  "QueryClient",
  "QueryClientProvider",
  "<QueryClientProvider client={queryClient}>"
]) {
  if (!mainSource.includes(queryProviderToken)) {
    throw new Error(`React Query provider is missing: ${queryProviderToken}`);
  }
}

for (const serviceLayerToken of [
  'API_BASE = "/api"',
  "apiGet",
  "apiPost",
  "apiPatch",
  "ApiError",
  "createCaptainApplication",
  "fetchCaptainApplications",
  "approveCaptainApplication",
  "rejectCaptainApplication",
  "fetchAdminCustomers",
  "fetchAdminDashboard",
  "fetchAdminDrivers",
  "fetchAdminRides",
  "fetchAdminSettings",
  "updateAdminCustomerStatus",
  "updateAdminDriverStatus",
  "updateAdminSettings",
  "fetchSupportTickets",
  "fetchPricingRules",
  "fetchBootstrap",
  "requestRideQuote",
  "useQuery",
  "useMutation",
  "useQueryClient",
  "invalidateQueries",
  "backendError"
]) {
  if (!appSource.includes(serviceLayerToken)) {
    throw new Error(`Phase 7A API/query integration is missing: ${serviceLayerToken}`);
  }
}

for (const frontendAuthToken of [
  "useAuthApi",
  "registerCustomer",
  "verifyOtp",
  "loginCustomer",
  "backendCopy.serverOffline",
  "authStatus",
  "currentUser",
  "token: result.token",
  "session: { ...user",
  "logout"
]) {
  if (!appSource.includes(frontendAuthToken)) {
    throw new Error(`Phase 8 frontend auth integration is missing: ${frontendAuthToken}`);
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

for (const blockedCaptainApplicationToken of ["role: \"driver\"", "session: { role: \"driver\"", "login(\"driver\")"]) {
  if (authSource.includes(blockedCaptainApplicationToken)) {
    throw new Error(`Captain application must not create direct driver access: ${blockedCaptainApplicationToken}`);
  }
}

for (const authPhaseThreeToken of [
  "const DEMO_OTP = \"1234\"",
  "isReasonableAge",
  "pendingUser",
  "verifiedUser",
  "setCaptainApplicationOpen(true)"
]) {
  if (!appSource.includes(authPhaseThreeToken)) {
    throw new Error(`Customer auth phase three is missing: ${authPhaseThreeToken}`);
  }
}

for (const captainApplicationToken of [
  "function CaptainApplicationPanel",
  "pendingCaptainApplications",
  "captainApplicationForm",
  "createCaptainApplication",
  "status: \"pending\"",
  "createdAt",
  "name=\"captainFullName\"",
  "name=\"captainPhone\"",
  "name=\"captainCity\"",
  "name=\"captainAge\"",
  "name=\"captainVehicleType\"",
  "name=\"captainVehiclePlate\"",
  "name=\"captainExperienceYears\"",
  "name=\"captainNotes\"",
  "captain-application-panel",
  "captain-application-modal",
  "تم إرسال طلبك بنجاح. سيتم مراجعة بياناتك من الإدارة والتواصل معك."
]) {
  if (!appSource.includes(captainApplicationToken)) {
    throw new Error(`Captain application flow is missing: ${captainApplicationToken}`);
  }
}

if (!stylesSource.includes(".welcome-auth")) {
  throw new Error("Welcome/auth screen styles are missing");
}

for (const captainStyleToken of [
  ".welcome-auth-support",
  ".captain-application-modal",
  ".captain-application-panel",
  ".captain-application-summary"
]) {
  if (!stylesSource.includes(captainStyleToken)) {
    throw new Error(`Captain application styles are missing: ${captainStyleToken}`);
  }
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

if (
  !appSource.includes('if (state.role === "customer")') &&
  !appSource.includes("activeRole === ROLES.customer")
) {
  throw new Error("Logged-in customers must be routed by the customer role");
}

if (!appSource.includes("<CustomerShell")) {
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

if (!packageJson.dependencies?.["react-leaflet"]) {
  throw new Error("Phase 11A map integration must add react-leaflet");
}

for (const mapToken of [
  'import L from "leaflet"',
  'import "leaflet/dist/leaflet.css"',
  'from "react-leaflet"',
  "WEST_BANK_CITIES",
  "getWestBankCityCenter",
  "Nablus",
  "Ramallah",
  "Hebron",
  "Jenin",
  "Tulkarm",
  "Bethlehem",
  "Qalqilya",
  "Jericho",
  "Salfit",
  "Tubas",
  "const NABLUS_CENTER",
  "navigator.geolocation.getCurrentPosition",
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "L.map",
  "L.tileLayer",
  "customer-location-marker",
  "pickup-location-marker",
  "destination-location-marker",
  "driver-location-marker",
  "haversineKm",
  "estimatePickupDestinationDistance",
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
  "west-bank-live-map",
  "mapRef",
  "mapInstanceRef",
  "customerMarkerRef",
  "pickupMarkerRef",
  "destinationMarkerRef",
  "driverMarkerRef",
  "cityCenter",
  "use-my-current-location",
  "set-map-point-pickup",
  "set-map-point-destination",
  "mapSelectionMode",
  "selectedMapPoint",
  "TileLayer",
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
execFileSync(process.execPath, ["--check", "backend/auth/passwords.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/db/database.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/db/schema.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/db/seed.mjs"], { stdio: "inherit" });

for (const backendEndpointToken of [
  'url.pathname === "/api/auth/register"',
  'url.pathname === "/api/auth/verify-otp"',
  'url.pathname === "/api/auth/login"',
  'url.pathname === "/api/auth/logout"',
  'url.pathname === "/api/captain-applications"',
  'url.pathname === "/api/admin/captain-applications"',
  'url.pathname === "/api/admin/dashboard"',
  'url.pathname === "/api/admin/customers"',
  'url.pathname === "/api/admin/drivers"',
  'url.pathname === "/api/rides"',
  'url.pathname === "/api/admin/rides"',
  'url.pathname === "/api/support/tickets"',
  'url.pathname === "/api/admin/support/tickets"',
  'url.pathname === "/api/admin/pricing"',
  'url.pathname === "/api/admin/settings"',
  'url.pathname === "/api/bootstrap"',
  'url.pathname === "/api/events"',
  'captainApplicationApproveMatch',
  'captainApplicationRejectMatch',
  'customerStatusMatch',
  'driverStatusMatch',
  'rideStatusMatch',
  'supportTicketStatusMatch',
  'pricingPatchMatch',
  'approvedCaptains',
  'demoOtpCode: "1234"',
  'Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS"'
]) {
  if (!backendSource.includes(backendEndpointToken)) {
    throw new Error(`Backend API surface is missing: ${backendEndpointToken}`);
  }
}

for (const backendDataToken of [
  "export const users",
  "export const captainApplications",
  "export const approvedCaptains",
  "export const customers",
  "export const supportTickets",
  "export const pricingRules",
  "export const systemSettings"
]) {
  if (!backendDataSource.includes(backendDataToken)) {
    throw new Error(`Backend in-memory data is missing: ${backendDataToken}`);
  }
}

for (const sqliteToken of [
  'import { DatabaseSync } from "node:sqlite"',
  "WASEL_DB_PATH",
  "backend/dev.sqlite",
  "createSchema(db)",
  "seedDatabase(db)",
  "databaseInfo",
  "createOrUpdateCustomerUser",
  "insertCaptainApplication",
  "createDriverFromApplication",
  "insertRide",
  "insertSupportTicket",
  "updatePricingRule"
]) {
  if (!backendDatabaseSource.includes(sqliteToken) && !backendSource.includes(sqliteToken)) {
    throw new Error(`SQLite backend integration is missing: ${sqliteToken}`);
  }
}

for (const sqliteTableToken of [
  "CREATE TABLE IF NOT EXISTS cities",
  "CREATE TABLE IF NOT EXISTS users",
  "CREATE TABLE IF NOT EXISTS otp_codes",
  "CREATE TABLE IF NOT EXISTS captain_applications",
  "CREATE TABLE IF NOT EXISTS drivers",
  "CREATE TABLE IF NOT EXISTS rides",
  "CREATE TABLE IF NOT EXISTS support_tickets",
  "CREATE TABLE IF NOT EXISTS pricing_rules",
  "CREATE TABLE IF NOT EXISTS system_settings"
]) {
  if (!backendSchemaSource.includes(sqliteTableToken)) {
    throw new Error(`SQLite schema is missing: ${sqliteTableToken}`);
  }
}

for (const sqliteSeedToken of [
  "seedDatabase",
  "pricing_rules",
  "system_settings",
  "drivers",
  "users",
  "support_tickets"
]) {
  if (!backendSeedSource.includes(sqliteSeedToken)) {
    throw new Error(`SQLite seed is missing: ${sqliteSeedToken}`);
  }
}

for (const persistenceSmokeToken of [
  "WASEL_DB_PATH",
  "health should report sqlite database",
  "captain application should persist after server restart",
  "approved captain should persist as driver after server restart",
  "ride should persist after server restart",
  "support ticket should persist after server restart",
  "pricing update should persist after server restart",
  "settings update should persist after server restart"
]) {
  if (!backendSmokeSource.includes(persistenceSmokeToken)) {
    throw new Error(`Backend smoke persistence check is missing: ${persistenceSmokeToken}`);
  }
}

for (const ignoredDatabaseToken of [
  "backend/*.sqlite",
  "backend/*.sqlite-shm",
  "backend/*.sqlite-wal"
]) {
  if (!gitignoreSource.includes(ignoredDatabaseToken)) {
    throw new Error(`SQLite database files must be ignored by git: ${ignoredDatabaseToken}`);
  }
}

for (const passwordHashingToken of [
  'import bcrypt from "bcryptjs"',
  "hashPassword",
  "verifyPassword",
  "PASSWORD_HASH_ROUNDS"
]) {
  if (!backendAuthSource.includes(passwordHashingToken)) {
    throw new Error(`Password hashing helper is missing: ${passwordHashingToken}`);
  }
}

for (const backendAuthToken of [
  "passwordHash TEXT",
  "ALTER TABLE users ADD COLUMN passwordHash TEXT",
  "password = ''",
  "findUserByPhone",
  "phone_already_registered",
  "otpRequired: true",
  "findOtpCodeByPhone",
  "verifyPassword(body.password, user.passwordHash)",
  "dev-session-token-",
  "user.status !== \"active\""
]) {
  if (!backendSchemaSource.includes(backendAuthToken) && !backendDatabaseSource.includes(backendAuthToken) && !backendSource.includes(backendAuthToken)) {
    throw new Error(`Phase 8 backend auth integration is missing: ${backendAuthToken}`);
  }
}

for (const authSmokeToken of [
  "login before OTP verification should be rejected",
  "duplicate phone should be blocked",
  "wrong password should be rejected",
  "user should store a bcrypt passwordHash",
  "database must not store the plain password"
]) {
  if (!backendSmokeSource.includes(authSmokeToken)) {
    throw new Error(`Phase 8 auth smoke check is missing: ${authSmokeToken}`);
  }
}

console.log("project-check-ok");
