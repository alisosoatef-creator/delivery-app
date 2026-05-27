import fs from "node:fs";
import { execFileSync } from "node:child_process";

const requiredFiles = [
  ".env.example",
  "backend/.env.example",
  "index.html",
  "README.md",
  "src/main.jsx",
  "src/App.jsx",
  "src/styles.css",
  "src/config/appConfig.js",
  "src/utils/rideStatus.js",
  "src/utils/roles.js",
  "src/components/ui/AccessDenied.jsx",
  "src/features/auth/AdminDevLogin.jsx",
  "src/features/auth/DriverDevLogin.jsx",
  "backend/config.mjs",
  "backend/server.mjs",
  "backend/realtime.mjs",
  "backend/security.mjs",
  "backend/validation.mjs",
  "backend/rideStatus.mjs",
  "backend/places.mjs",
  "backend/data.mjs",
  "backend/auth/passwords.mjs",
  "backend/db/database.mjs",
  "backend/db/schema.mjs",
  "backend/db/seed.mjs",
  "backend/schema.sql",
  "backend/api-contract.md",
  "scripts/backend-smoke.mjs",
  "vite.config.js",
  "src/services/sessionToken.js",
  "src/services/socketClient.js",
  "src/hooks/useSupportTickets.js",
  "src/services/paymentsApi.js",
  "src/hooks/usePayments.js",
  "src/hooks/useAdminNotifications.js",
  "src/components/ui/Button.jsx",
  "src/components/ui/Card.jsx",
  "src/components/ui/Input.jsx",
  "src/components/ui/Select.jsx",
  "src/components/ui/Badge.jsx",
  "src/components/ui/ModalDrawer.jsx",
  "src/components/ui/EmptyState.jsx",
  "src/components/ui/ErrorState.jsx",
  "src/components/ui/LoadingSkeleton.jsx",
  "src/components/ui/StatCard.jsx",
  "src/components/ui/SectionHeader.jsx",
  "src/components/ui/DataTable.jsx",
  "src/features/admin/AdminDetailDrawer.jsx",
  "src/features/admin/adminFormatters.js",
  "docs/qa-checklist.md",
  "docs/security-notes.md",
  "docs/local-development.md",
  "docs/production-readiness.md",
  "docs/deployment-plan.md"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const script of ["dev", "api", "db:init", "db:seed", "build", "check", "api:check", "verify"]) {
  if (!packageJson.scripts?.[script]) {
    throw new Error(`Missing npm script: ${script}`);
  }
}

const sourceOrder = [
  "src/utils/rideStatus.js",
  "src/utils/rideUtils.js",
  "src/App.jsx",
  "src/routes/guards.jsx",
  "src/routes/routeConfig.js",
  "src/routes/index.js",
  "src/utils/roles.js",
  "src/config/appConfig.js",
  "src/components/ui/AccessDenied.jsx",
  "src/features/auth/AuthScreen.jsx",
  "src/features/auth/AdminDevLogin.jsx",
  "src/features/auth/DriverDevLogin.jsx",
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
  "src/features/admin/AdminDetailDrawer.jsx",
  "src/features/admin/adminFormatters.js",
  "src/features/admin/adminMockData.js",
  "src/features/rides/RouteSearchCard.jsx",
  "src/features/rides/RideMap.jsx",
  "src/features/rides/LocationPicker.jsx",
  "src/components/layout/TopBar.jsx",
  "src/features/rides/MapBoard.jsx",
  "src/features/rides/LegacyMapBoard.jsx",
  "src/components/ui/Field.jsx",
  "src/components/ui/Button.jsx",
  "src/components/ui/Card.jsx",
  "src/components/ui/Input.jsx",
  "src/components/ui/Select.jsx",
  "src/components/ui/Badge.jsx",
  "src/components/ui/ModalDrawer.jsx",
  "src/components/ui/EmptyState.jsx",
  "src/components/ui/ErrorState.jsx",
  "src/components/ui/LoadingSkeleton.jsx",
  "src/components/ui/StatCard.jsx",
  "src/components/ui/SectionHeader.jsx",
  "src/components/ui/DataTable.jsx",
  "src/components/ui/PanelTitle.jsx",
  "src/components/ui/StatusBadge.jsx",
  "src/components/ui/QuoteStrip.jsx",
  "src/components/ui/Metric.jsx",
  "src/components/ui/Avatar.jsx",
  "src/components/ui/Toast.jsx",
  "src/features/auth/LegacyAuthScreen.jsx",
  "src/utils/constants.js",
  "src/utils/westBankCities.js",
  "src/utils/routeUtils.js",
  "src/utils/mapUtils.js",
  "src/utils/localPlaces.js",
  "src/utils/paymentUtils.js",
  "src/utils/i18n.js",
  "src/store/appState.js",
  "src/services/sessionToken.js",
  "src/services/apiClient.js",
  "src/services/api.js",
  "src/services/socketClient.js",
  "src/services/rides.js",
  "src/services/authApi.js",
  "src/services/captainApplicationsApi.js",
  "src/services/adminApi.js",
  "src/services/ridesApi.js",
  "src/services/driverApi.js",
  "src/services/placesApi.js",
  "src/services/supportApi.js",
  "src/services/paymentsApi.js",
  "src/services/pricingApi.js",
  "src/services/bootstrapApi.js",
  "src/hooks/useAuthApi.js",
  "src/hooks/useCaptainApplications.js",
  "src/hooks/useAdminData.js",
  "src/hooks/useAdminNotifications.js",
  "src/hooks/useRidesApi.js",
  "src/hooks/useDriverData.js",
  "src/hooks/useSupportTickets.js",
  "src/hooks/usePayments.js",
  "src/hooks/useBootstrap.js"
];

const appSource = sourceOrder
  .filter((file) => fs.existsSync(file))
  .map((file) => `\n/* ${file} */\n${fs.readFileSync(file, "utf8")}`)
  .join("\n");
const mainSource = fs.readFileSync("src/main.jsx", "utf8");
const stylesSource = fs.readFileSync("src/styles.css", "utf8");
const backendSource = fs.readFileSync("backend/server.mjs", "utf8");
const backendConfigSource = fs.readFileSync("backend/config.mjs", "utf8");
const backendRealtimeSource = fs.readFileSync("backend/realtime.mjs", "utf8");
const backendSecuritySource = fs.readFileSync("backend/security.mjs", "utf8");
const backendValidationSource = fs.readFileSync("backend/validation.mjs", "utf8");
const backendDataSource = fs.readFileSync("backend/data.mjs", "utf8");
const backendAuthSource = fs.readFileSync("backend/auth/passwords.mjs", "utf8");
const backendDatabaseSource = fs.readFileSync("backend/db/database.mjs", "utf8");
const backendSchemaSource = fs.readFileSync("backend/db/schema.mjs", "utf8");
const backendSeedSource = fs.readFileSync("backend/db/seed.mjs", "utf8");
const backendSmokeSource = fs.readFileSync("scripts/backend-smoke.mjs", "utf8");
const viteSource = fs.readFileSync("vite.config.js", "utf8");
const frontendConfigSource = fs.readFileSync("src/config/appConfig.js", "utf8");
const envExampleSource = fs.readFileSync(".env.example", "utf8");
const backendEnvExampleSource = fs.readFileSync("backend/.env.example", "utf8");
const readmeSource = fs.readFileSync("README.md", "utf8");
const gitignoreSource = fs.existsSync(".gitignore") ? fs.readFileSync(".gitignore", "utf8") : "";
const routeGuardSource = fs.existsSync("src/routes/guards.jsx")
  ? fs.readFileSync("src/routes/guards.jsx", "utf8")
  : "";
const routeConfigSource = fs.existsSync("src/routes/routeConfig.js")
  ? fs.readFileSync("src/routes/routeConfig.js", "utf8")
  : "";
const adminUiFiles = [
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
  "src/features/admin/AdminDetailDrawer.jsx",
  "src/features/admin/adminFormatters.js",
  "src/features/admin/adminMockData.js"
];
const adminUiSource = adminUiFiles
  .filter((file) => fs.existsSync(file))
  .map((file) => `\n/* ${file} */\n${fs.readFileSync(file, "utf8")}`)
  .join("\n");
const qaChecklistSource = fs.existsSync("docs/qa-checklist.md") ? fs.readFileSync("docs/qa-checklist.md", "utf8") : "";
const securityNotesSource = fs.existsSync("docs/security-notes.md") ? fs.readFileSync("docs/security-notes.md", "utf8") : "";
const localDevelopmentSource = fs.readFileSync("docs/local-development.md", "utf8");
const productionReadinessSource = fs.readFileSync("docs/production-readiness.md", "utf8");
const deploymentPlanSource = fs.readFileSync("docs/deployment-plan.md", "utf8");

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
  '"/driver/dev-login"',
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
  "<DriverDevLogin",
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

for (const designSystemToken of [
  "function Button",
  "function Card",
  "function Input",
  "function Select",
  "function Badge",
  "function ModalDrawer",
  "function EmptyState",
  "function ErrorState",
  "function LoadingSkeleton",
  "function StatCard",
  "function SectionHeader",
  "function DataTable",
  "ds-button",
  "ds-card",
  "ds-field",
  "ds-badge",
  "ds-data-table"
]) {
  if (!appSource.includes(designSystemToken) && !stylesSource.includes(designSystemToken)) {
    throw new Error(`Design system surface is missing: ${designSystemToken}`);
  }
}

for (const advancedAdminToken of [
  "function AdminDetailDrawer",
  "function AdminTimeline",
  "function DrawerPlaceholder",
  "exportRowsToCsv",
  "Export CSV",
  "admin-settings-tabs",
  "SETTINGS_TABS",
  "\"general\"",
  "\"pricing\"",
  "\"payments\"",
  "\"support\"",
  "\"security\"",
  "\"team\"",
  "ADMIN_TEAM_ROLES",
  "\"owner\"",
  "\"admin\"",
  "\"support\"",
  "admin-timeline",
  "admin-detail-grid",
  "advanced-admin-table"
]) {
  if (!appSource.includes(advancedAdminToken) && !stylesSource.includes(advancedAdminToken)) {
    throw new Error(`Advanced Admin UX is missing: ${advancedAdminToken}`);
  }
}

for (const adminSuperControlToken of [
  "phase-35A-admin-super-control",
  "admin-super-control-dashboard",
  "admin-control-ribbon",
  "admin-super-summary",
  "admin-status-badge-ar",
  "paymentMethodLabel",
  "adminStatusTone",
  "cityFilter",
  "إعادة ضبط بيانات التجربة",
  "RESET_DEMO_DATA"
]) {
  if (!appSource.includes(adminSuperControlToken) && !stylesSource.includes(adminSuperControlToken)) {
    throw new Error(`Admin Super Control is missing: ${adminSuperControlToken}`);
  }
}

for (const adminNotificationToken of [
  "function useAdminNotifications",
  "ADMIN_NOTIFICATION_CATEGORIES",
  "EVENT_TO_NOTIFICATION_CATEGORY",
  "subscribeToAdminEvents",
  "adminNotifications",
  "notificationCounts",
  "admin-nav-badge",
  "admin-notifications-center",
  "admin-notification-card",
  "تنبيهات تحتاج انتباه",
  "تذاكر دعم مفتوحة",
  "طلبات كباتن جديدة",
  "رحلات تحتاج متابعة",
  "مدفوعات تحتاج مراجعة",
  "Admin Notifications QA"
]) {
  const combinedAdminNotificationSource = `${appSource}\n${stylesSource}\n${qaChecklistSource}`;
  if (!combinedAdminNotificationSource.includes(adminNotificationToken)) {
    throw new Error(`Admin Notifications Center is missing: ${adminNotificationToken}`);
  }
}

for (const adminSupportProToken of [
  "ticketPerson",
  "linkedRideForTicket",
  "support-ticket-drawer",
  "support-person-card",
  "support-linked-ride-card",
  "Complaint message",
  "Linked ride",
  "Customer quick info",
  "Captain quick info",
  "AdminTimeline",
  "Admin Support & Complaints QA"
]) {
  const combinedAdminSupportProSource = `${adminUiSource}\n${stylesSource}\n${qaChecklistSource}`;
  if (!combinedAdminSupportProSource.includes(adminSupportProToken)) {
    throw new Error(`Admin Support & Complaints Pro is missing: ${adminSupportProToken}`);
  }
}

for (const adminSensitiveToken of ["passwordHash", "full card number", "CVV", "token"]) {
  if (adminUiSource.includes(adminSensitiveToken) && !adminUiSource.includes("لا تخزن رقم بطاقة كامل أو CVV") && adminSensitiveToken !== "token") {
    throw new Error(`Admin UI must not expose sensitive data token: ${adminSensitiveToken}`);
  }
}

if (!qaChecklistSource.includes("Admin Super Control QA") || !qaChecklistSource.includes("RESET_DEMO_DATA")) {
  throw new Error("QA checklist must include Admin Super Control QA and records cleanup confirmation.");
}
if (!qaChecklistSource.includes("Smart Dispatch QA") || !qaChecklistSource.includes("driver_offline") && !qaChecklistSource.includes("offline")) {
  throw new Error("QA checklist must include Smart Dispatch QA coverage.");
}

for (const blockedAdminRoleToken of ["Operations", "Finance", "Dispatcher", "operations dashboard", "finance dashboard", "dispatcher"]) {
  if (adminUiSource.includes(blockedAdminRoleToken)) {
    throw new Error(`Admin UI must not expose deferred admin role: ${blockedAdminRoleToken}`);
  }
}

for (const blockedRideProductTerm of ["دلفري", "مطعم", "مطاعم", "منتج", "منتجات", "وجبة", "طعام", "طلب طعام", "Delivery captain application", "delivery vehicle"]) {
  if (appSource.includes(blockedRideProductTerm)) {
    throw new Error(`Core ride UI must use people-ride language, not product/food delivery wording: ${blockedRideProductTerm}`);
  }
}

if (/[ÃØÙâ€™€]/.test(appSource)) {
  throw new Error("Core frontend source still contains mojibake-like encoded Arabic text.");
}

for (const finalUxPolishToken of [
  "phase-24-final-ux-polish",
  "تطبيق واحد للزبون والكابتن والإدارة",
  "نقطة الانطلاق",
  "جاري البحث عن كابتن",
  "تم قبول الرحلة",
  "الكابتن بالطريق",
  "بدأت الرحلة",
  "انتهت الرحلة",
  "Socket غير متاح",
  "GPS مرفوض",
  "مباشر",
  "touch-action: manipulation",
  "button:focus-visible",
  "live-driver-tracking-card.active",
  "advanced-admin-table"
]) {
  if (!appSource.includes(finalUxPolishToken) && !stylesSource.includes(finalUxPolishToken)) {
    throw new Error(`Final UX polish is missing: ${finalUxPolishToken}`);
  }
}

for (const qaChecklistToken of [
  "Manual Test Checklist",
  "npm.cmd run api",
  "npm.cmd run dev",
  "Customer",
  "Driver",
  "Admin",
  "GPS",
  "CSV"
]) {
  if (!qaChecklistSource.includes(qaChecklistToken)) {
    throw new Error(`QA checklist is missing: ${qaChecklistToken}`);
  }
}

for (const envToken of [
  "NODE_ENV",
  "PORT",
  "VITE_API_BASE_URL",
  "VITE_SOCKET_URL",
  "SQLITE_DB_PATH",
  "DATABASE_URL",
  "APP_NAME",
  "DEV_ADMIN_ENABLED",
  "DEV_DRIVER_ENABLED",
  "OTP_MODE",
  "PAYMENT_MODE",
  "ROUTING_PROVIDER"
]) {
  const combinedEnvExamples = `${envExampleSource}\n${backendEnvExampleSource}`;
  if (!combinedEnvExamples.includes(envToken)) {
    throw new Error(`Environment example is missing: ${envToken}`);
  }
}

for (const configToken of [
  "backendConfig",
  "sqliteDbPath",
  "allowedOrigins",
  "demoOtpCode",
  "appConfig",
  "apiBaseUrl",
  "socketUrl",
  "devAdminEnabled",
  "devDriverEnabled"
]) {
  if (!backendConfigSource.includes(configToken) && !frontendConfigSource.includes(configToken) && !appSource.includes(configToken)) {
    throw new Error(`Production-readiness config layer is missing: ${configToken}`);
  }
}

for (const localDocToken of [
  "Local Development",
  "npm.cmd install",
  "npm.cmd run api",
  "npm.cmd run dev",
  "npm.cmd run build",
  "npm.cmd run check",
  "npm.cmd run api:check",
  "Customer window",
  "Driver window",
  "Admin window",
  "backend/dev.sqlite",
  "OTP is a fixed development code"
]) {
  if (!localDevelopmentSource.includes(localDocToken) && !readmeSource.includes(localDocToken)) {
    throw new Error(`Local development docs are missing: ${localDocToken}`);
  }
}

for (const productionChecklistToken of [
  "Move from SQLite to PostgreSQL",
  "Replace dev tokens",
  "Disable `AdminDevLogin` and `DriverDevLogin`",
  "Enable HTTPS",
  "production CORS",
  "SMS OTP provider",
  "real payment gateway",
  "production routing",
  "Socket.IO authentication",
  "privacy policy",
  "terms of service"
]) {
  if (!productionReadinessSource.includes(productionChecklistToken)) {
    throw new Error(`Production readiness checklist is missing: ${productionChecklistToken}`);
  }
}

for (const deploymentPlanToken of [
  "Vercel",
  "Netlify",
  "Render",
  "Railway",
  "VPS",
  "Supabase PostgreSQL",
  "Neon PostgreSQL",
  "self-hosted OSRM",
  "GraphHopper",
  "Mapbox",
  "No deployment is performed"
]) {
  if (!deploymentPlanSource.includes(deploymentPlanToken)) {
    throw new Error(`Deployment plan is missing: ${deploymentPlanToken}`);
  }
}

for (const gitignoreToken of [
  ".env",
  ".env.*",
  "!.env.example",
  "!backend/.env.example",
  "node_modules/",
  "dist/",
  "*.log",
  "backend/*.sqlite",
  "backend/*.sqlite-shm",
  "backend/*.sqlite-wal"
]) {
  if (!gitignoreSource.includes(gitignoreToken)) {
    throw new Error(`Git hygiene ignore rule is missing: ${gitignoreToken}`);
  }
}

for (const forbiddenSecretToken of ["sk-", "ghp_", "AKIA", "BEGIN PRIVATE KEY", "payment_secret", "sms_secret"]) {
  if (envExampleSource.includes(forbiddenSecretToken) || backendEnvExampleSource.includes(forbiddenSecretToken)) {
    throw new Error(`Environment examples must not include obvious secret material: ${forbiddenSecretToken}`);
  }
}

for (const securityNotesToken of [
  "JWT or secure server-side sessions",
  "HTTPS",
  "Lock CORS",
  "Socket.IO authentication",
  "Payment gateway",
  "PostgreSQL",
  "backups",
  "Dev-Only Behavior"
]) {
  if (!securityNotesSource.includes(securityNotesToken)) {
    throw new Error(`Security notes are missing production hardening item: ${securityNotesToken}`);
  }
}

for (const securityHelperToken of [
  "securityHeaders",
  "requireAuthDev",
  "requireAdminDev",
  "requireDriverDev",
  "requireCustomerDev",
  "checkRateLimit",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Cache-Control",
  "TODO production-auth",
  "TODO production-cors",
  "TODO production-rate-limit"
]) {
  if (!backendSecuritySource.includes(securityHelperToken) && !backendSource.includes(securityHelperToken)) {
    throw new Error(`Security helper surface is missing: ${securityHelperToken}`);
  }
}

for (const validationHelperToken of [
  "ADMIN_ROLES",
  "PAYMENT_METHODS",
  "PAYMENT_STATUSES",
  "ACCOUNT_STATUSES",
  "SUPPORT_STATUSES",
  "RIDE_STATUSES",
  "requiredFields",
  "isPhoneLike",
  "isReasonableAge",
  "isAllowedStatus",
  "normalizePaymentMethod"
]) {
  if (!backendValidationSource.includes(validationHelperToken)) {
    throw new Error(`Backend validation helper is missing: ${validationHelperToken}`);
  }
}

for (const sessionTokenToken of [
  "setSessionToken",
  "getSessionToken",
  "getSessionRole",
  "clearSessionToken",
  "wasel.dev.sessionToken",
  "Authorization",
  "X-Dev-Role",
  "socket.auth",
  "handshake.auth"
]) {
  if (!appSource.includes(sessionTokenToken) && !backendRealtimeSource.includes(sessionTokenToken)) {
    throw new Error(`Session/token hardening integration is missing: ${sessionTokenToken}`);
  }
}

for (const devLoginSecurityToken of [
  "import.meta.env.DEV",
  "Development Only",
  "setSessionToken",
  "dev-admin-session-token",
  "dev-driver-session-token"
]) {
  if (!appSource.includes(devLoginSecurityToken) && !backendSource.includes(devLoginSecurityToken)) {
    throw new Error(`Development login protection is missing: ${devLoginSecurityToken}`);
  }
}

for (const socketSecurityToken of [
  "socketSession",
  "canJoin",
  "join:customer",
  "join:driver",
  "join:admin",
  "join:ride",
  "TODO production-socket-auth",
  "driver:location-updated"
]) {
  if (!backendRealtimeSource.includes(socketSecurityToken)) {
    throw new Error(`Socket.IO security hardening is missing: ${socketSecurityToken}`);
  }
}

for (const sensitiveDataToken of [
  "passwordHash",
  "const { password, passwordHash",
  "cardNumber",
  "cvv",
  "saved VISA placeholder must not expose card number or CVV"
]) {
  if (!appSource.includes(sensitiveDataToken) && !backendDatabaseSource.includes(sensitiveDataToken) && !backendSmokeSource.includes(sensitiveDataToken)) {
    throw new Error(`Sensitive data guard/check is missing: ${sensitiveDataToken}`);
  }
}

if (!packageJson.dependencies?.["@tanstack/react-query"]) {
  throw new Error("Phase 7A must install @tanstack/react-query");
}

if (!packageJson.dependencies?.bcryptjs) {
  throw new Error("Phase 8 auth must install bcryptjs for password hashing");
}

if (!packageJson.dependencies?.["socket.io"]) {
  throw new Error("Phase 14 realtime must install socket.io");
}

if (!packageJson.dependencies?.["socket.io-client"]) {
  throw new Error("Phase 14 realtime must install socket.io-client");
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
  "API_BASE = appConfig.apiBaseUrl",
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
  "fetchCustomerWallet",
  "fetchCustomerPayments",
  "fetchPaymentMethods",
  "addPaymentMethod",
  "payRide",
  "fetchAdminPayments",
  "fetchDriverEarnings",
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

for (const realtimeFrontendToken of [
  "connectSocket",
  "disconnectSocket",
  "subscribeToRideEvents",
  "subscribeToAdminEvents",
  "subscribeToDriverEvents",
  "subscribeToDriverLocationEvents",
  "sendDriverLocationUpdate",
  "sendDriverLocationUnavailable",
  "join:customer",
  "join:driver",
  "join:admin",
  "join:ride",
  "ride:created",
  "ride:accepted",
  "ride:status-updated",
  "ride:cancelled",
  "ride:completed",
  "driver:online-status-updated",
  "driver:location-updated",
  "driver:location-unavailable",
  "support:ticket-created",
  "support:ticket-updated",
  "payment:created",
  "payment:updated",
  "wallet:updated",
  "queryClient.invalidateQueries",
  "realtimeConnected",
  "realtimeStatus",
  "driverLocation",
  "liveTrackingStatus",
  "lastDriverLocationAt"
]) {
  if (!appSource.includes(realtimeFrontendToken)) {
    throw new Error(`Phase 14 frontend realtime integration is missing: ${realtimeFrontendToken}`);
  }
}

for (const supportSystemToken of [
  "useSupportTickets",
  "fetchMySupportTickets",
  "createSupportTicket",
  "updateSupportTicketStatus",
  "support-ticket-form",
  "support-ticket-list",
  "support-ticket-card",
  "support-ticket-filters",
  "roleFilter",
  "statusFilter",
  "rideId",
  "customer-support-card",
  "driver-support-card"
]) {
  if (!appSource.includes(supportSystemToken)) {
    throw new Error(`Phase 16 support system is missing: ${supportSystemToken}`);
  }
}

for (const realtimeStyleToken of [
  ".realtime-status-pill",
  ".realtime-status-pill.live",
  ".realtime-status-pill.fallback",
  ".live-driver-tracking-card",
  ".driver-tracking-panel",
  ".admin-live-location-note"
]) {
  if (!stylesSource.includes(realtimeStyleToken)) {
    throw new Error(`Phase 14 realtime status styles are missing: ${realtimeStyleToken}`);
  }
}

for (const viteRealtimeToken of [
  '"/socket.io"',
  "ws: true",
  "http://127.0.0.1:3001"
]) {
  if (!viteSource.includes(viteRealtimeToken)) {
    throw new Error(`Vite Socket.IO proxy is missing: ${viteRealtimeToken}`);
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

for (const rideLifecycleToken of [
  "RIDE_STATUSES.searching",
  "state.pickupLocation",
  "state.destinationLocation",
  "routeDistanceKm",
  "durationMinutes",
  "createRide(payload)",
  "customerRides",
  "rideRequestStatus"
]) {
  if (!requestRideSource.includes(rideLifecycleToken)) {
    throw new Error(`Phase 12 ride creation flow is missing: ${rideLifecycleToken}`);
  }
}

if (requestRideSource.includes("result.driver") || requestRideSource.includes("backendAcceptedRide")) {
  throw new Error("Customer ride creation must not expose or normalize an immediate captain match");
}

for (const searchFlowToken of [
  "hasAcceptedDriver",
  "captain-search-card",
  "captain-pending-card",
  "accepted-driver-card",
  "جاري البحث عن كابتن قريب",
  "بانتظار قبول أحد الكباتن",
  "cancelRide"
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

for (const routeToken of [
  "OSRM_PUBLIC_DEMO_URL",
  "router.project-osrm.org/route/v1/driving",
  "TODO production routing",
  "fetchRoute",
  "normalizeRouteResponse",
  "fallbackToHaversine",
  "routeDistanceKm",
  "durationMinutes",
  "routeCoordinates",
  "routeStatus",
  "routeSource",
  "road-route-polyline",
  "fallback-route-polyline",
  "routeInfo",
  "state.routeInfo?.routeDistanceKm"
]) {
  if (!appSource.includes(routeToken)) {
    throw new Error(`Phase 11B road routing integration is missing: ${routeToken}`);
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

for (const fixRideMapUxToken of [
  "destination-location-search",
  "searchPlaces",
  "searchFallbackPlaces",
  "LOCAL_WEST_BANK_PLACES",
  "إلى أين تريد الذهاب؟",
  "/api/places/search",
  "driverOperationError",
  "ride_not_searching",
  "driver_ride_mismatch",
  "driverAnchorLocation",
  "driver-to-pickup-line",
  "بانتظار تفعيل موقع الكابتن المباشر",
  "fix-ride-map-ux",
  "location-result-card",
  "place search endpoint should return local West Bank fallback places",
  "customer ride contains driver after accept",
  "driver dev login should return a development driver token"
]) {
  const combinedFixSource = `${appSource}\n${stylesSource}\n${backendSource}\n${backendSmokeSource}`;
  if (!combinedFixSource.includes(fixRideMapUxToken)) {
    throw new Error(`Ride scenario/map UX fix is missing: ${fixRideMapUxToken}`);
  }
}

for (const driverFlowCleanupToken of [
  "queryError",
  "mutationError",
  "nextStatusAction",
  "driver-completed-note",
  "Only searching rides can be accepted",
  "compact-map-distance-badge",
  "بانتظار تفعيل موقع الكابتن المباشر",
  "cleanupAdminRecords",
  'url.pathname === "/api/admin/maintenance/cleanup"',
  "RESET_DEMO_DATA",
  "AdminSettings",
  "إدارة السجلات",
  "records-cleanup-card",
  "cleanup cancelled rides should succeed",
  "cleanup completed rides should succeed",
  "cleanup should not delete users or approved drivers"
]) {
  const combinedDriverCleanupSource = `${appSource}\n${stylesSource}\n${backendSource}\n${backendDatabaseSource}\n${backendSmokeSource}`;
  if (!combinedDriverCleanupSource.includes(driverFlowCleanupToken)) {
    throw new Error(`Driver flow/map/admin cleanup fix is missing: ${driverFlowCleanupToken}`);
  }
}

for (const fullScenarioDebugToken of [
  "classifyApiError",
  "network_error",
  "auth_error",
  "validation_error",
  "server_error",
  "not_found",
  "getSessionContext",
  "X-Dev-Driver-Id",
  "X-Dev-Phone",
  "requestDriverId",
  "availableByDriverHeaders",
  "driver available rides should use driver headers and normalized city when query city is omitted",
  "driver dev login should normalize captain city to a city id",
  "liveTrackingStatus: isGracefulStop ? \"idle\"",
  "driver-stopped-tracking",
  "driver-debug-panel",
  "cleanupBadgeLabel",
  "إعادة ضبط بيانات التجربة",
  "all demo data cleanup should work with strong confirmation",
  "all demo data cleanup should not delete approved drivers",
  "all demo data cleanup should not delete customers"
]) {
  const combinedFullScenarioSource = `${appSource}\n${stylesSource}\n${backendSource}\n${backendDatabaseSource}\n${backendSmokeSource}`;
  if (!combinedFullScenarioSource.includes(fullScenarioDebugToken)) {
    throw new Error(`Full app scenario debug fix is missing: ${fullScenarioDebugToken}`);
  }
}

for (const driverUnauthorizedFixToken of [
  "safeDriverContext",
  "validateDriverRequest",
  "rejectDriverAccess",
  "auth_required",
  "driver_role_required",
  "missing_driver_context",
  "driver_not_found",
  "request.driverContext",
  "debugDriverRequest",
  "backendDriver",
  "availableStatus",
  "myRidesStatus",
  "setSessionToken(state.token, \"driver\"",
  "driver available rides should reject missing driver context clearly",
  "driver endpoints should work with dev driver token and real driver context",
  "Access-Control-Allow-Headers\": \"Content-Type, Authorization, X-Dev-Role, X-Dev-User-Id, X-Dev-Customer-Id, X-Dev-Driver-Id, X-Dev-Phone\""
]) {
  const combinedDriverUnauthorizedSource = `${appSource}\n${backendSource}\n${backendSecuritySource}\n${backendSmokeSource}`;
  if (!combinedDriverUnauthorizedSource.includes(driverUnauthorizedFixToken)) {
    throw new Error(`Driver unauthorized/available-rides fix is missing: ${driverUnauthorizedFixToken}`);
  }
}

for (const smartDispatchToken of [
  "driverDispatchEligibility",
  "normalizeDispatchCityId",
  "listDriverActiveRides",
  "driver_offline",
  "driver_inactive",
  "driver_busy",
  "ride_not_available",
  "city_not_supported",
  "dispatchReason",
  "dispatchSort",
  "dispatchDistanceKm",
  "active online driver should be eligible for available rides",
  "offline active driver should not receive available rides",
  "inactive driver should not receive available rides",
  "busy driver should be blocked from accepting a second active ride",
  "ride accepted by one driver should not be accepted by another driver"
]) {
  const combinedSmartDispatchSource = `${appSource}\n${backendSource}\n${backendDatabaseSource}\n${backendSmokeSource}`;
  if (!combinedSmartDispatchSource.includes(smartDispatchToken)) {
    throw new Error(`Smart dispatch logic is missing: ${smartDispatchToken}`);
  }
}

for (const driverOnlineSyncToken of [
  "requestedOnline",
  "driver.onlineStatus !== \"online\"",
  "driverOnlinePatch",
  "driver status endpoint should persist online status",
  "inactive driver should not be allowed to become online",
  "driver:online-status-updated",
  "updateDriverOnlineStatus",
  "currentDriverOnline",
  "Driver Online Status Sync QA"
]) {
  const combinedDriverOnlineSyncSource = `${appSource}\n${backendSource}\n${backendDatabaseSource}\n${backendSmokeSource}\n${qaChecklistSource}`;
  if (!combinedDriverOnlineSyncSource.includes(driverOnlineSyncToken)) {
    throw new Error(`Driver online status sync is missing: ${driverOnlineSyncToken}`);
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
execFileSync(process.execPath, ["--check", "backend/config.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/realtime.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/security.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/validation.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/places.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/data.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/rideStatus.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/auth/passwords.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/db/database.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/db/schema.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/db/seed.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "src/config/appConfig.js"], { stdio: "inherit" });

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
  'url.pathname === "/api/driver/dev-drivers"',
  'url.pathname === "/api/driver/dev-login"',
  'url.pathname === "/api/rides"',
  'url.pathname === "/api/driver/available-rides"',
  'url.pathname === "/api/driver/my-rides"',
  'url.pathname === "/api/customer/rides"',
  'url.pathname === "/api/admin/rides"',
  'url.pathname === "/api/customer/wallet"',
  'url.pathname === "/api/customer/payments"',
  'url.pathname === "/api/customer/payment-methods"',
  'url.pathname === "/api/admin/payments"',
  'url.pathname === "/api/admin/wallet-transactions"',
  'url.pathname === "/api/driver/earnings"',
  'url.pathname === "/api/driver/wallet-transactions"',
  'url.pathname === "/api/support/tickets"',
  'url.pathname === "/api/support/my-tickets"',
  'url.pathname === "/api/admin/support/tickets"',
  'url.pathname === "/api/admin/pricing"',
  'url.pathname === "/api/admin/settings"',
  'url.pathname === "/api/admin/maintenance/cleanup"',
  'url.pathname === "/api/bootstrap"',
  'url.pathname === "/api/places/search"',
  'url.pathname === "/api/events"',
  'captainApplicationApproveMatch',
  'captainApplicationRejectMatch',
  'customerStatusMatch',
  'driverStatusMatch',
  'rideStatusMatch',
  'customerRideDetailsMatch',
  'rideAcceptMatch',
  'driverRideStatusMatch',
  'ridePayMatch',
  'paymentMethodDeleteMatch',
  'adminPaymentStatusMatch',
  'supportTicketStatusMatch',
  'pricingPatchMatch',
  'approvedCaptains',
  'demoOtpCode',
  'Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS"'
]) {
  if (!backendSource.includes(backendEndpointToken) && !backendSecuritySource.includes(backendEndpointToken) && !backendConfigSource.includes(backendEndpointToken)) {
    throw new Error(`Backend API surface is missing: ${backendEndpointToken}`);
  }
}

for (const backendRealtimeToken of [
  "setupRealtime(server)",
  "new Server(server",
  "io.on(\"connection\"",
  "join:customer",
  "join:driver",
  "join:admin",
  "join:ride",
  "emitRideEvent",
  "emitDriverEvent",
  "emitDriverLocationUpdated",
  "emitDriverLocationUnavailable",
  "realtimeInfo",
  "ride:created",
  "ride:accepted",
  "ride:status-updated",
  "ride:cancelled",
  "ride:completed",
  "driver:online-status-updated",
  "driver:location-updated",
  "driver:location-unavailable",
  "support:ticket-created",
  "support:ticket-updated",
  "payment:created",
  "payment:updated",
  "wallet:updated",
  "emitPaymentEvent",
  "admin:captain-application-created",
  "admin:captain-application-reviewed"
]) {
  if (!backendRealtimeSource.includes(backendRealtimeToken) && !backendSource.includes(backendRealtimeToken)) {
    throw new Error(`Phase 14 backend realtime integration is missing: ${backendRealtimeToken}`);
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
  "listCustomerRides",
  "listAvailableRides",
  "listDriverRides",
  "acceptRide",
  "updateDriverRideStatus",
  "insertSupportTicket",
  "updatePricingRule"
]) {
  if (!backendDatabaseSource.includes(sqliteToken) && !backendSource.includes(sqliteToken) && !backendConfigSource.includes(sqliteToken)) {
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
  "customerId TEXT",
  "routeDistanceKm REAL",
  "durationMinutes INTEGER",
  "CREATE TABLE IF NOT EXISTS support_tickets",
  "CREATE TABLE IF NOT EXISTS payments",
  "CREATE TABLE IF NOT EXISTS wallet_transactions",
  "CREATE TABLE IF NOT EXISTS saved_payment_methods",
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
  "new customer ride should start searching",
  "customer rides should include the newly created ride",
  "driver available rides should include searching rides",
  "ride accept endpoint should set accepted status",
  "accepted ride should appear in driver my-rides",
  "driver should update ride to driver_arriving",
  "driver should update ride to arrived",
  "driver should update ride to in_progress",
  "socket.io should connect to the backend",
  "ride:created should emit the created ride",
  "ride:cancelled should emit the cancelled ride",
  "ride:accepted should emit the accepted ride",
  "driver:location-updated should include ride id",
  "driver:location-updated should include driver id",
  "driver:location-updated should include driver latitude",
  "driver:location-updated should include driver longitude",
  "ride:status-updated should emit driver_arriving",
  "ride:completed should emit the completed ride",
  "completed cash ride should emit payment:created",
  "saved VISA placeholder must not expose card number or CVV",
  "admin payments should include completed cash ride payment",
  "driver wallet transactions should include completed ride credit",
  "ride pay should normalize VISA placeholder to visa method",
  "customer support ticket should persist customer role",
  "customer support ticket should persist linked ride id",
  "support:ticket-created should emit new support ticket",
  "customer support tickets should include the customer's ticket",
  "driver support ticket should persist driver role",
  "driver support tickets should include the driver's ticket",
  "support:ticket-updated should emit closed support ticket",
  "support ticket should persist after server restart",
  "pricing update should persist after server restart",
  "settings update should persist after server restart",
  "admin endpoints should work with dev admin token",
  "driver endpoints should work with dev driver token",
  "customer endpoints should work with dev customer token"
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

for (const rideRatingToken of [
  "rating INTEGER",
  "review TEXT",
  "ratedAt TEXT",
  "createRideRating",
  "rating_already_exists",
  "ride_not_completed",
  "invalid_rating",
  "/api/customer/rides",
  "ride:rating-created",
  "ratingValue",
  "ratingCount",
  "Ride Rating QA",
  "completed ride can be rated",
  "customer should not rate the same ride twice",
  "admin rides should include submitted ride rating"
]) {
  const rideRatingSource = `${backendSchemaSource}\n${backendDatabaseSource}\n${backendSource}\n${backendSmokeSource}\n${appSource}\n${qaChecklistSource}`;
  if (!rideRatingSource.includes(rideRatingToken)) {
    throw new Error(`37C ride rating system is missing: ${rideRatingToken}`);
  }
}

console.log("project-check-ok");
