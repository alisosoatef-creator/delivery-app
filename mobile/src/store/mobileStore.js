import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { clearMobileSession, isValidMobileSession, loadMobileSession } from "../services/sessionStorage";
import { devLogStartup } from "../utils/startupDiagnostics";

const MobileStoreContext = createContext(null);

const initialState = {
  role: "guest",
  restoreStatus: "loading",
  token: "",
  currentUser: null,
  session: null,
  pendingPhone: "",
  activeArea: "auth",
  activeScreen: "login",
  selectedCity: "nablus",
  currentLocation: null,
  pickup: null,
  destination: null,
  currentRide: null,
  activeRideStatus: "idle",
  activeRideError: "",
  availableRides: [],
  driverOnlineStatus: "offline",
  driverLocation: null,
  socketStatus: "offline",
  liveTrackingStatus: "idle",
  lastDriverLocationAt: "",
  connectionMessage: "",
  locationStatus: "idle",
  rideRequestStatus: "idle",
  rideRequestError: "",
  toast: ""
};

function reducer(state, action) {
  switch (action.type) {
    case "navigate":
      return { ...state, activeArea: action.area || state.activeArea, activeScreen: action.screen || state.activeScreen, toast: "" };
    case "patch":
      return { ...state, ...action.patch };
    case "restoreSession": {
      const session = action.session;
      if (!isValidMobileSession(session)) {
        return { ...state, restoreStatus: "ready", role: "guest", activeArea: "auth", activeScreen: "login" };
      }
      const isDriver = session.role === "driver";
      const driver = session.driverSession || session.session?.driver || null;
      return {
        ...state,
        restoreStatus: "ready",
        role: session.role,
        token: session.token,
        currentUser: session.currentUser,
        session: isDriver ? { ...(session.session || session.currentUser || {}), token: session.token, driver, driverId: session.driverId, phone: session.phone } : { ...(session.session || session.currentUser || {}), token: session.token },
        driverOnlineStatus: isDriver ? (driver?.onlineStatus || session.currentUser?.onlineStatus || "offline") : state.driverOnlineStatus,
        activeArea: isDriver ? "driver" : "customer",
        activeScreen: "home",
        connectionMessage: "",
        toast: "تم استعادة الجلسة."
      };
    }
    case "restoreComplete":
      return { ...state, restoreStatus: "ready" };
    case "pendingPhone":
      return { ...state, pendingPhone: action.phone || "" };
    case "setLocation":
      return {
        ...state,
        currentLocation: action.location || state.currentLocation,
        pickup: action.pickup || state.pickup,
        selectedCity: action.cityId || state.selectedCity,
        locationStatus: action.status || state.locationStatus,
        toast: action.toast || state.toast
      };
    case "setDestination":
      return { ...state, destination: action.destination || null, toast: action.toast || state.toast };
    case "setCurrentRide":
      return {
        ...state,
        currentRide: action.ride || null,
        activeArea: action.area || state.activeArea,
        activeScreen: action.screen || state.activeScreen,
        toast: action.toast || state.toast
      };
    case "setActiveRide":
      return {
        ...state,
        currentRide: action.ride || state.currentRide,
        activeRideStatus: action.status || "idle",
        activeRideError: "",
        toast: action.toast || state.toast
      };
    case "activeRideStatus":
      return { ...state, activeRideStatus: action.status || "idle", activeRideError: action.error || "" };
    case "login":
      return {
        ...state,
        restoreStatus: "ready",
        role: action.role || action.user?.role || "customer",
        token: action.token || "",
        currentUser: action.user || null,
        session: action.session || action.user || null,
        driverOnlineStatus: action.session?.driver?.onlineStatus || action.user?.onlineStatus || state.driverOnlineStatus,
        selectedCity: action.user?.city || state.selectedCity,
        activeArea: action.role === "driver" || action.user?.role === "driver" ? "driver" : "customer",
        activeScreen: "home",
        connectionMessage: "",
        toast: action.toast || ""
      };
    case "logout":
      return { ...initialState, restoreStatus: "ready", toast: action.toast || "" };
    case "toast":
      return { ...state, toast: action.message || "" };
    default:
      return state;
  }
}

export function MobileAppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let mounted = true;
    loadMobileSession()
      .then((session) => {
        if (!mounted) return;
        if (isValidMobileSession(session)) {
          devLogStartup("session restored", { role: session.role });
          dispatch({ type: "restoreSession", session });
        } else {
          dispatch({ type: "restoreComplete" });
        }
      })
      .catch(async (error) => {
        devLogStartup("session restore failed", { reason: error?.message });
        await clearMobileSession().catch(() => {});
        if (mounted) dispatch({ type: "restoreComplete" });
      });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <MobileStoreContext.Provider value={value}>{children}</MobileStoreContext.Provider>;
}

export function useMobileApp() {
  const context = useContext(MobileStoreContext);
  if (!context) throw new Error("useMobileApp must be used within MobileAppProvider");
  return context;
}
