import { useEffect, useMemo, useReducer, useRef } from "react";
import { Shell } from "./components/layout/Shell.jsx";
import { AdminPanel } from "./features/admin/AdminPanel.jsx";
import { AuthScreen } from "./features/auth/AuthScreen.jsx";
import { CustomerShell } from "./features/customer/CustomerShell.jsx";
import { DriverPanel } from "./features/driver/DriverPanel.jsx";
import { useBootstrap } from "./hooks/useBootstrap.js";
import { AdminRoute, APP_ROUTE_PATHS, CustomerRoute, DriverRoute, GuestRoute, roleRouteFallback } from "./routes/index.js";
import { api } from "./services/api.js";
import { localQuote } from "./services/rides.js";
import { createRide, patchRideStatus, requestRideQuote } from "./services/ridesApi.js";
import { initialState, reducer } from "./store/appState.js";
import { text } from "./utils/i18n.js";

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pendingAcceptanceTimerRef = useRef(null);
  const bootstrapQuery = useBootstrap();
  const t = text[state.language];
  const isArabic = state.language === "ar";

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
    requestRideQuote({ cityId: state.cityId, distanceKm: 5.8 })
      .then((quote) => dispatch({ type: "patch", patch: { quote, backendLive: true } }))
      .catch(() => dispatch({ type: "patch", patch: { quote: localQuote(state), backendLive: false } }));
  }, [state.cityId]);

  useEffect(() => {
    if (!state.toast) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: "toast", message: "" }), 3000);
    return () => window.clearTimeout(timer);
  }, [state.toast]);

  useEffect(() => () => {
    if (pendingAcceptanceTimerRef.current) {
      window.clearTimeout(pendingAcceptanceTimerRef.current);
    }
  }, []);

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
    if (pendingAcceptanceTimerRef.current) {
      window.clearTimeout(pendingAcceptanceTimerRef.current);
      pendingAcceptanceTimerRef.current = null;
    }

    if (state.paymentMethod === "visa" && !state.visaCardReady) {
      dispatch({
        type: "toast",
        message: isArabic
          ? "أدخل بطاقة VISA التجريبية واضغط استخدام هذه البطاقة قبل طلب المشوار."
          : "Add the demo VISA card and choose Use this card before requesting the ride."
      });
      return;
    }

    const payload = {
      cityId: state.cityId,
      pickup: state.pickup,
      dropoff: state.dropoff,
      paymentMethod: state.paymentMethod,
      distanceKm: state.quote.distanceKm
    };
    try {
      const result = await createRide(payload);
      const backendAcceptedRide =
        result.ride?.status !== "searching" && Boolean(result.ride?.driverId || result.driver?.id);
      const visibleRide = backendAcceptedRide
        ? { ...result.ride, status: "searching", driverId: null }
        : result.ride;
      dispatch({
        type: "patch",
        patch: {
          ride: visibleRide,
          selectedDriverId: backendAcceptedRide ? state.selectedDriverId : result.driver?.id || state.selectedDriverId,
          backendLive: true,
          toast: isArabic ? "جاري البحث عن كابتن قريب..." : "Searching for a nearby captain..."
        }
      });

      if (backendAcceptedRide) {
        pendingAcceptanceTimerRef.current = window.setTimeout(() => {
          pendingAcceptanceTimerRef.current = null;
          dispatch({
            type: "patch",
            patch: {
              ride: {
                ...result.ride,
                status: "accepted",
                driverId: result.ride.driverId || result.driver.id
              },
              selectedDriverId: result.driver?.id || result.ride.driverId || state.selectedDriverId,
              toast: isArabic ? "تم قبول الطلب من كابتن قريب." : "A nearby captain accepted your request."
            }
          });
        }, 3500);
      }
    } catch {
      dispatch({
        type: "patch",
        patch: {
          ride: {
            id: "local_ride",
            status: "searching",
            pickup: state.pickup,
            dropoff: state.dropoff,
            fareIls: state.quote.fareIls,
            distanceKm: state.quote.distanceKm,
            etaMinutes: state.quote.etaMinutes
          },
          toast: isArabic ? "جاري البحث عن كابتن قريب..." : "Searching for a nearby captain..."
        }
      });
    }
  }

  async function updateRideStatus(status) {
    if (!state.ride) return;
    try {
      const payload = await patchRideStatus(state.ride.id, status);
      dispatch({ type: "patch", patch: { ride: payload.ride, backendLive: true } });
    } catch {
      dispatch({ type: "patch", patch: { ride: { ...state.ride, status }, backendLive: false } });
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
          role: "customer"
        }
      });
    }
  }

  const sharedProps = { state, dispatch, t, isArabic, selectedDriver, requestRide, updateRideStatus, toggleDriverStatus, login, requestOtp, logout };
  const activeRoutePath = roleRouteFallback(state);

  if (!state.session) {
    return (
      <GuestRoute state={state}>
        <AuthScreen {...sharedProps} routePath={APP_ROUTE_PATHS.login} />
      </GuestRoute>
    );
  }

  if (state.role === "customer") {
    return (
      <CustomerRoute state={state}>
        <CustomerShell {...sharedProps} routePath={activeRoutePath} />
      </CustomerRoute>
    );
  }

  if (state.role === "driver") {
    return (
      <DriverRoute state={state}>
        <Shell {...sharedProps} routePath={APP_ROUTE_PATHS.driver.dashboard}>
          <DriverPanel {...sharedProps} />
        </Shell>
      </DriverRoute>
    );
  }

  return (
    <AdminRoute state={state}>
      <AdminPanel {...sharedProps} routePath={APP_ROUTE_PATHS.admin.dashboard} />
    </AdminRoute>
  );
}

export default App;
