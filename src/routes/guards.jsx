function currentRole(state) {
  return state.role || state.session?.role || "guest";
}

function RoleRoute({ state, allowedRole, children, fallback = null }) {
  if (!state.session) return fallback;
  return currentRole(state) === allowedRole ? children : fallback;
}

export function GuestRoute({ state, children, fallback = null }) {
  return state.session ? fallback : children;
}

export function ProtectedRoute({ state, children, fallback = null }) {
  return state.session ? children : fallback;
}

export function CustomerRoute({ state, children, fallback = null }) {
  return <RoleRoute state={state} allowedRole="customer" fallback={fallback}>{children}</RoleRoute>;
}

export function DriverRoute({ state, children, fallback = null }) {
  return <RoleRoute state={state} allowedRole="driver" fallback={fallback}>{children}</RoleRoute>;
}

export function AdminRoute({ state, children, fallback = null }) {
  return <RoleRoute state={state} allowedRole="admin" fallback={fallback}>{children}</RoleRoute>;
}
