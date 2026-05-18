export const ROLES = {
  guest: "guest",
  customer: "customer",
  driver: "driver",
  admin: "admin",
  owner: "owner",
  support: "support",
  operations: "operations"
};

export const ADMIN_ROLES = [ROLES.admin, ROLES.owner];
export const DRIVER_ACCESS_STATUSES = ["active", "approved"];

export function currentRole(state) {
  if (!state?.session) return ROLES.guest;
  return state.currentUser?.role || state.session?.role || state.role || ROLES.guest;
}

export function canAccessCustomer(state) {
  return currentRole(state) === ROLES.customer;
}

export function canAccessDriver(state) {
  const role = currentRole(state);
  const status = state.currentUser?.status || state.session?.status || "active";
  return role === ROLES.driver && DRIVER_ACCESS_STATUSES.includes(status);
}

export function canAccessAdmin(state) {
  return ADMIN_ROLES.includes(currentRole(state));
}

export function homePathForRole(roleOrState) {
  const role = typeof roleOrState === "string" ? roleOrState : currentRole(roleOrState);
  if (role === ROLES.driver) return "/driver/dashboard";
  if (ADMIN_ROLES.includes(role)) return "/admin/dashboard";
  if (role === ROLES.customer) return "/customer/request-ride";
  return "/login";
}
