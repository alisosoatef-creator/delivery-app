import { useEffect, useMemo, useState } from "react";
import { fetchDriverRides, updateDriverRideStatus } from "../services/driverApi";
import { connectMobileSocket, joinRideRoom, subscribeToDriverEvents } from "../services/socketClient";
import { useMobileApp } from "../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../utils/errorUtils";
import { statusLabel } from "../utils/rideStatus";

const nextActions = {
  accepted: ["driver_arriving", "أنا بالطريق"],
  driver_arriving: ["arrived", "وصلت"],
  arrived: ["in_progress", "بدأت الرحلة"],
  in_progress: ["completed", "إنهاء الرحلة"]
};

const visibleStatuses = ["accepted", "driver_arriving", "arrived", "in_progress", "completed"];
const activeStatuses = ["accepted", "driver_arriving", "arrived", "in_progress"];

function driverSessionFromState(state) {
  return {
    ...state.session,
    token: state.token,
    role: "driver",
    driverId: state.currentUser?.driverId || state.session?.driverId || state.session?.driver?.id,
    phone: state.currentUser?.phone || state.session?.phone || state.session?.driver?.phone,
    userId: state.currentUser?.id || state.session?.id
  };
}

function paymentLabel(method) {
  if (method === "visa" || method === "visa-placeholder") return "بطاقة تجريبية";
  if (method === "wallet") return "محفظة";
  return "نقدًا";
}

function ridePoint(ride, type) {
  const prefix = type === "pickup" ? "pickup" : "destination";
  const lat = Number(ride?.[`${prefix}Lat`]);
  const lng = Number(ride?.[`${prefix}Lng`]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label: ride?.[prefix] || type };
}

export function useDriverCurrentRide() {
  const { state, dispatch } = useMobileApp();
  const [rides, setRides] = useState(state.currentRide ? [state.currentRide] : []);
  const [error, setError] = useState("");
  const [socketStatus, setSocketStatus] = useState(state.socketStatus || "offline");
  const session = useMemo(() => driverSessionFromState(state), [state.currentUser, state.session, state.token]);
  const currentRide = useMemo(() => {
    const active = rides.find((ride) => activeStatuses.includes(ride.status));
    if (active) return active;
    if (visibleStatuses.includes(state.currentRide?.status)) return state.currentRide;
    return rides.find((ride) => visibleStatuses.includes(ride.status)) || null;
  }, [rides, state.currentRide]);
  const action = currentRide ? nextActions[currentRide.status] : null;
  const completed = currentRide?.status === "completed";
  const pickupPoint = useMemo(() => ridePoint(currentRide, "pickup"), [currentRide]);
  const destinationPoint = useMemo(() => ridePoint(currentRide, "destination"), [currentRide]);

  function load() {
    setError("");
    fetchDriverRides(session)
      .then((items) => {
        setRides(items);
        const active = items.find((ride) => activeStatuses.includes(ride.status)) || items.find((ride) => ride.id === state.currentRide?.id);
        if (active) dispatch({ type: "setCurrentRide", ride: active, area: "driver", screen: "current" });
        dispatch({ type: "patch", patch: { connectionMessage: "" } });
      })
      .catch((requestError) => {
        setError(apiErrorMessage(requestError, "تعذر تحميل رحلات الكابتن."));
        dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
      });
  }

  useEffect(load, [state.token, state.currentUser?.driverId]);

  useEffect(() => {
    if (!session.driverId) return undefined;
    connectMobileSocket(
      { ...session, rideId: currentRide?.id },
      {
        onConnectionChange: (connected, statusName) => {
          const nextStatus = statusName || (connected ? "connected" : "disconnected");
          setSocketStatus(nextStatus);
          dispatch({ type: "patch", patch: { socketStatus: nextStatus } });
          if (connected && currentRide?.id) joinRideRoom(currentRide.id);
        }
      }
    );
    const unsubscribe = subscribeToDriverEvents((payload, eventName) => {
      const nextRide = payload?.ride;
      if (eventName === "ride:created" || !nextRide || String(nextRide.driverId || "") === String(session.driverId) || String(nextRide.id || "") === String(currentRide?.id || "")) {
        load();
      }
    });
    return unsubscribe;
  }, [session.driverId, session.phone, session.token, currentRide?.id]);

  useEffect(() => {
    if (currentRide?.id) joinRideRoom(currentRide.id);
  }, [currentRide?.id]);

  async function update(status, { onCompleted } = {}) {
    if (!currentRide) return;
    setError("");
    try {
      const payload = await updateDriverRideStatus(currentRide.id, status, session);
      dispatch({ type: "setCurrentRide", ride: payload.ride, area: "driver", screen: "current", toast: payload.ride?.status === "completed" ? "تم إنهاء الرحلة." : "تم تحديث حالة الرحلة." });
      if (status === "completed") onCompleted?.();
      load();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر تحديث حالة الرحلة."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    }
  }

  function clearError() {
    setError("");
  }

  function goToAvailable() {
    dispatch({ type: "navigate", area: "driver", screen: "available" });
  }

  return {
    session,
    currentRide,
    action,
    completed,
    error,
    socketStatus,
    setSocketStatus,
    pickupPoint,
    destinationPoint,
    load,
    update,
    clearError,
    goToAvailable,
    paymentLabel,
    statusLabel
  };
}
