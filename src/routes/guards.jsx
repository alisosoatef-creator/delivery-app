import { AccessDenied } from "../components/ui/AccessDenied.jsx";
import { ROLES, canAccessAdmin, canAccessDriver, currentRole, homePathForRole } from "../utils/roles.js";

// state.role is normalized through currentRole so route checks stay centralized.
function RoleRoute({ state, allowedRole, allowedRoles, children, fallback = null }) {
  if (!state.session) return fallback;
  const roles = allowedRoles || [allowedRole];
  return roles.includes(currentRole(state)) ? children : fallback;
}

export function GuestRoute({ state, children, fallback = null }) {
  return state.session ? fallback : children;
}

export function ProtectedRoute({ state, children, fallback = null }) {
  return state.session ? children : fallback;
}

export function CustomerRoute({ state, children, fallback = null }) {
  return currentRole(state) === ROLES.customer ? children : fallback;
}

export function DriverRoute({ state, children, fallback = null }) {
  return canAccessDriver(state) ? children : fallback;
}

export function AdminRoute({ state, children, fallback = null }) {
  return canAccessAdmin(state) ? children : fallback;
}

export function DefaultAccessDenied({ state, isArabic, onNavigateHome }) {
  return (
    <AccessDenied
      state={state}
      isArabic={isArabic}
      onNavigateHome={onNavigateHome || (() => window.history.replaceState(null, "", homePathForRole(state)))}
    />
  );
}
