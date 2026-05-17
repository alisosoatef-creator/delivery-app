export const APP_ROUTE_PATHS = {
  login: "/login",
  register: "/register",
  verifyOtp: "/verify-otp",
  customer: {
    root: "/customer",
    home: "/customer/home",
    requestRide: "/customer/request-ride",
    rides: "/customer/rides",
    settings: "/customer/settings",
    support: "/customer/support"
  },
  driver: {
    apply: "/driver/apply",
    dashboard: "/driver/dashboard"
  },
  admin: {
    dashboard: "/admin/dashboard",
    customers: "/admin/customers",
    drivers: "/admin/drivers",
    driverApplications: "/admin/driver-applications",
    rides: "/admin/rides",
    payments: "/admin/payments",
    support: "/admin/support",
    settings: "/admin/settings"
  }
};

export const GUEST_ROUTES = [
  { path: APP_ROUTE_PATHS.login, key: "login", role: "guest" },
  { path: APP_ROUTE_PATHS.register, key: "register", role: "guest" },
  { path: APP_ROUTE_PATHS.verifyOtp, key: "verify-otp", role: "guest" },
  { path: APP_ROUTE_PATHS.driver.apply, key: "driver-apply", role: "guest" }
];

export const CUSTOMER_ROUTES = [
  { path: APP_ROUTE_PATHS.customer.root, key: "customer-root", role: "customer" },
  { path: APP_ROUTE_PATHS.customer.home, key: "account", role: "customer", visibleInNav: true },
  { path: APP_ROUTE_PATHS.customer.requestRide, key: "ride", role: "customer", visibleInNav: true },
  { path: APP_ROUTE_PATHS.customer.rides, key: "trips", role: "customer", visibleInNav: true },
  { path: APP_ROUTE_PATHS.customer.settings, key: "wallet", role: "customer", visibleInNav: true },
  { path: APP_ROUTE_PATHS.customer.support, key: "support", role: "customer", visibleInNav: true }
];

export const DRIVER_ROUTES = [
  { path: APP_ROUTE_PATHS.driver.dashboard, key: "driver-dashboard", role: "driver" }
];

export const ADMIN_ROUTES = [
  { path: APP_ROUTE_PATHS.admin.dashboard, key: "admin-dashboard", role: "admin" },
  { path: APP_ROUTE_PATHS.admin.customers, key: "admin-customers", role: "admin" },
  { path: APP_ROUTE_PATHS.admin.drivers, key: "admin-drivers", role: "admin" },
  { path: APP_ROUTE_PATHS.admin.driverApplications, key: "admin-driver-applications", role: "admin" },
  { path: APP_ROUTE_PATHS.admin.rides, key: "admin-rides", role: "admin" },
  { path: APP_ROUTE_PATHS.admin.payments, key: "admin-payments", role: "admin" },
  { path: APP_ROUTE_PATHS.admin.support, key: "admin-support", role: "admin" },
  { path: APP_ROUTE_PATHS.admin.settings, key: "admin-settings", role: "admin" }
];

export const APP_ROUTES = [
  ...GUEST_ROUTES,
  ...CUSTOMER_ROUTES,
  ...DRIVER_ROUTES,
  ...ADMIN_ROUTES
];

export function routePathForCustomerView(view) {
  const route = CUSTOMER_ROUTES.find((item) => item.key === view);
  return route?.path || APP_ROUTE_PATHS.customer.requestRide;
}

export function roleRouteFallback(state) {
  if (!state?.session) return APP_ROUTE_PATHS.login;
  if (state.role === "driver") return APP_ROUTE_PATHS.driver.dashboard;
  if (state.role === "admin") return APP_ROUTE_PATHS.admin.dashboard;
  return APP_ROUTE_PATHS.customer.requestRide;
}
