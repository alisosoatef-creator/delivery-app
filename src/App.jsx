import { useEffect, useMemo, useReducer } from "react";
import { Shell } from "./components/layout/Shell.jsx";
import { AccessDenied } from "./components/ui/AccessDenied.jsx";
import { AdminPanel } from "./features/admin/AdminPanel.jsx";
import { AdminDevLogin } from "./features/auth/AdminDevLogin.jsx";
import { AuthScreen } from "./features/auth/AuthScreen.jsx";
import { DriverDevLogin } from "./features/auth/DriverDevLogin.jsx";
import { CustomerShell } from "./features/customer/CustomerShell.jsx";
import { DriverPanel } from "./features/driver/DriverPanel.jsx";
import { useBootstrap } from "./hooks/useBootstrap.js";
import { AdminRoute, APP_ROUTE_PATHS, CustomerRoute, DriverRoute, GuestRoute, roleRouteFallback } from "./routes/index.js";
import { api } from "./services/api.js";
import { localQuote } from "./services/rides.js";
import { createRide, fetchCustomerRide, patchRideStatus, requestRideQuote } from "./services/ridesApi.js";
import { initialState, reducer } from "./store/appState.js";
import { text } from "./utils/i18n.js";
import { estimatePickupDestinationDistance } from "./utils/mapUtils.js";
import { RIDE_STATUSES } from "./utils/rideStatus.js";
import { ROLES, canAccessAdmin, canAccessDriver, currentRole, homePathForRole } from "./utils/roles.js";

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const bootstrapQuery = useBootstrap();
  const t = text[state.language];
  const isArabic = state.language === "ar";
  const activeRole = currentRole(state);
  const currentPath = window.location.pathname;
  const isAdminDevLoginRoute = currentPath === APP_ROUTE_PATHS.admin.devLogin;
  const isDriverDevLoginRoute = currentPath === APP_ROUTE_PATHS.driver.devLogin;

  useEffect(() => {
    document.documentElement.lang = state.language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    if (state.themeMode === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = state.themeMode;
    }
  }, [isArabic, state.language, state.themeMode]);

  useEffect(() => {
    if (bootstrapQuery.data) {
      dispatch({ type: "bootstrap", payload: bootstrapQuery.data });
    }
  }, [bootstrapQuery.data]);

  useEffect(() => {
    if (bootstrapQuery.isError) {
      dispatch({ type: "patch", patch: { backendLive: false } });
    }
  }, [bootstrapQuery.isError]);

  useEffect(() => {
    const events = new EventSource("/api/events");
    events.addEventListener("driver.location.updated", (event) => {
      dispatch({ type: "driverLocation", payload: JSON.parse(event.data) });
    });
    events.addEventListener("ride.status.changed", (event) => {
      dispatch({ type: "rideStatus", payload: JSON.parse(event.data) });
    });
    events.addEventListener("admin.metrics.updated", (event) => {
      dispatch({ type: "patch", patch: { admin: JSON.parse(event.data), backendLive: true } });
    });
    events.onerror = () => dispatch({ type: "patch", patch: { backendLive: false } });
    return () => events.close();
  }, []);

  useEffect(() => {
    const mapDistanceKm = state.routeInfo?.routeDistanceKm || estimatePickupDestinationDistance(state);
    requestRideQuote({ cityId: state.cityId, distanceKm: mapDistanceKm || 5.8 })
      .then((quote) => dispatch({ type: "patch", patch: { quote, backendLive: true } }))
      .catch(() => dispatch({ type: "patch", patch: { quote: localQuote(state), backendLive: false } }));
  }, [state.cityId, state.pickupLocation, state.destinationLocation, state.routeInfo?.routeDistanceKm]);

  useEffect(() => {
    if (!state.toast) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: "toast", message: "" }), 3000);
    return () => window.clearTimeout(timer);
  }, [state.toast]);

  const selectedDriver = useMemo(
    () => state.drivers.find((driver) => driver.id === state.selectedDriverId) || state.drivers[0],
    [state.drivers, state.selectedDriverId]
  );

  async function requestOtp() {
    try {
      const payload = await api("/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ phone: state.phone, role: state.role })
      });
      dispatch({ type: "patch", patch: { otpRequestId: payload.requestId, backendLive: true } });
      dispatch({ type: "toast", message: t.demoCode });
    } catch {
      dispatch({ type: "patch", patch: { otpRequestId: "local_otp", backendLive: false } });
      dispatch({ type: "toast", message: t.demoCode });
    }
  }

  async function login(role = state.role) {
    if (role === "admin") {
      dispatch({ type: "patch", patch: { role: "admin", session: { role: "admin" } } });
      return;
    }
    if (state.otp !== "1234") {
      dispatch({ type: "toast", message: isArabic ? "رمز OTP غير صحيح" : "Wrong OTP code" });
      return;
    }
    try {
      const payload = await api("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ requestId: state.otpRequestId || "local_otp", code: state.otp })
      });
      dispatch({ type: "patch", patch: { role, session: payload.user, backendLive: true } });
    } catch {
      dispatch({ type: "patch", patch: { role, session: { role }, backendLive: false } });
    }
  }

  async function requestRide() {
    if (state.paymentMethod === "visa" && !state.visaCardReady) {
      dispatch({
        type: "toast",
        message: isArabic
          ? "أدخل بطاقة VISA التجريبية واضغط استخدام هذه البطاقة قبل طلب المشوار."
          : "Add the demo VISA card and choose Use this card before requesting the ride."
      });
      return;
    }

    if (!state.pickupLocation || !state.destinationLocation) {
      dispatch({
        type: "toast",
        message: isArabic ? "حدد نقطة الانطلاق والوجهة من الخريطة قبل طلب المشوار." : "Select pickup and destination on the map before requesting a ride."
      });
      return;
    }

    if (!state.quote?.fareIls) {
      dispatch({
        type: "toast",
        message: isArabic ? "انتظر لحظة حتى يتم حساب السعر ثم حاول مرة أخرى." : "Wait for the fare quote, then try again."
      });
      return;
    }

    const customer = state.currentUser || state.session || {};
    const routeDistanceKm = state.routeInfo?.routeDistanceKm || state.quote.distanceKm || estimatePickupDestinationDistance(state);
    const durationMinutes = state.routeInfo?.durationMinutes || state.quote.etaMinutes || null;
    const payload = {
      customerId: customer.id || "",
      customerName: customer.fullName || customer.name || (isArabic ? "زبون واصل" : "Wasel customer"),
      customerPhone: customer.phone || state.phone || "",
      cityId: state.cityId,
      pickup: state.pickup,
      destination: state.dropoff,
      pickupLat: state.pickupLocation.lat,
      pickupLng: state.pickupLocation.lng,
      destinationLat: state.destinationLocation.lat,
      destinationLng: state.destinationLocation.lng,
      paymentMethod: state.paymentMethod,
      distanceKm: state.quote.distanceKm || routeDistanceKm,
      routeDistanceKm,
      durationMinutes,
      price: state.quote.fareIls
    };
    dispatch({ type: "patch", patch: { rideRequestStatus: "loading", rideRequestError: "" } });
    try {
      const result = await createRide(payload);
      const visibleRide = { ...result.ride, status: RIDE_STATUSES.searching, driverId: null };
      dispatch({
        type: "patch",
        patch: {
          ride: visibleRide,
          customerRides: [visibleRide, ...(state.customerRides || []).filter((ride) => ride.id !== visibleRide.id)],
          backendLive: true,
          rideRequestStatus: "success",
          rideRequestError: "",
          toast: isArabic ? "جاري البحث عن كابتن قريب..." : "Searching for a nearby captain..."
        }
      });
    } catch (error) {
      dispatch({
        type: "patch",
        patch: {
          backendLive: false,
          rideRequestStatus: "error",
          rideRequestError: error?.message || "Backend unavailable",
          toast: isArabic ? "تعذر إرسال طلب المشوار. تأكد أن السيرفر يعمل ثم حاول مرة أخرى." : "Could not create the ride. Make sure the Backend is running, then try again."
        }
      });
    }
  }

  async function updateRideStatus(status) {
    if (!state.ride) return;
    try {
      const payload = await patchRideStatus(state.ride.id, status);
      dispatch({
        type: "patch",
        patch: {
          ride: payload.ride,
          customerRides: (state.customerRides || []).map((ride) => (ride.id === payload.ride.id ? payload.ride : ride)),
          backendLive: true,
          rideRequestStatus: status === RIDE_STATUSES.cancelled ? "cancelled" : state.rideRequestStatus,
          toast: status === RIDE_STATUSES.cancelled ? (isArabic ? "تم إلغاء الرحلة." : "Ride cancelled.") : ""
        }
      });
    } catch {
      const localRide = { ...state.ride, status };
      dispatch({
        type: "patch",
        patch: {
          ride: localRide,
          customerRides: (state.customerRides || []).map((ride) => (ride.id === localRide.id ? localRide : ride)),
          backendLive: false,
          rideRequestStatus: status === RIDE_STATUSES.cancelled ? "cancelled" : state.rideRequestStatus
        }
      });
    }
  }

  async function refreshCurrentRide() {
    if (!state.ride?.id) return;
    const customer = state.currentUser || state.session || {};
    try {
      const ride = await fetchCustomerRide(state.ride.id, {
        customerId: customer.id || "",
        customerPhone: customer.phone || state.phone || ""
      });
      if (!ride) return;
      dispatch({
        type: "patch",
        patch: {
          ride,
          selectedDriverId: ride.driverId || state.selectedDriverId,
          customerRides: [ride, ...(state.customerRides || []).filter((item) => item.id !== ride.id)],
          backendLive: true,
          toast: isArabic ? "تم تحديث حالة الرحلة." : "Ride status refreshed."
        }
      });
    } catch {
      dispatch({
        type: "patch",
        patch: {
          backendLive: false,
          toast: isArabic ? "تعذر تحديث حالة الرحلة الآن." : "Unable to refresh the ride status now."
        }
      });
    }
  }

  async function toggleDriverStatus() {
    const online = !state.driverOnline;
    dispatch({ type: "patch", patch: { driverOnline: online } });
    try {
      await api("/api/drivers/status", {
        method: "POST",
        body: JSON.stringify({ driverId: selectedDriver.id, online })
      });
      dispatch({ type: "patch", patch: { backendLive: true } });
    } catch {
      dispatch({ type: "patch", patch: { backendLive: false } });
    }
  }

  async function logout() {
    try {
      await api("/api/auth/logout", { method: "POST", body: JSON.stringify({ token: state.token }) });
    } catch {
      dispatch({ type: "patch", patch: { backendLive: false } });
    } finally {
      dispatch({
        type: "patch",
        patch: {
          session: null,
          currentUser: null,
          token: "",
          authStatus: "guest",
          role: ROLES.guest
        }
      });
    }
  }

  const sharedProps = { state, dispatch, t, isArabic, selectedDriver, requestRide, updateRideStatus, refreshCurrentRide, toggleDriverStatus, login, requestOtp, logout };
  const activeRoutePath = roleRouteFallback(state);
  const accessDenied = (
    <AccessDenied
      state={state}
      isArabic={isArabic}
      onNavigateHome={() => {
        window.history.replaceState(null, "", homePathForRole(state));
        dispatch({ type: "patch", patch: { toast: "" } });
      }}
    />
  );

  if (isAdminDevLoginRoute && import.meta.env.DEV) {
    return (
      <GuestRoute state={state} fallback={accessDenied}>
        <AdminDevLogin {...sharedProps} />
      </GuestRoute>
    );
  }

  if (isDriverDevLoginRoute && import.meta.env.DEV) {
    return (
      <GuestRoute state={state} fallback={accessDenied}>
        <DriverDevLogin {...sharedProps} />
      </GuestRoute>
    );
  }

  if (!state.session) {
    return (
      <GuestRoute state={state}>
        <AuthScreen {...sharedProps} routePath={APP_ROUTE_PATHS.login} />
      </GuestRoute>
    );
  }

  if (activeRole === ROLES.customer) {
    return (
      <CustomerRoute state={state} fallback={accessDenied}>
        <CustomerShell {...sharedProps} routePath={activeRoutePath} />
      </CustomerRoute>
    );
  }

  if (activeRole === ROLES.driver) {
    return (
      <DriverRoute state={state} fallback={accessDenied}>
        <Shell {...sharedProps} routePath={APP_ROUTE_PATHS.driver.dashboard}>
          <DriverPanel {...sharedProps} />
        </Shell>
      </DriverRoute>
    );
  }

  if (canAccessAdmin(state)) {
    return (
      <AdminRoute state={state} fallback={accessDenied}>
        <AdminPanel {...sharedProps} routePath={APP_ROUTE_PATHS.admin.dashboard} />
      </AdminRoute>
    );
  }

  if (canAccessDriver(state)) {
    return (
      <DriverRoute state={state} fallback={accessDenied}>
        <Shell {...sharedProps} routePath={APP_ROUTE_PATHS.driver.dashboard}>
          <DriverPanel {...sharedProps} />
        </Shell>
      </DriverRoute>
    );
  }

  return accessDenied;
}

export default App;
