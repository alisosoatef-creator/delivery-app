import { useEffect, useState } from "react";
import { acceptRide, fetchAvailableRides } from "../services/driverApi";
import { connectMobileSocket, subscribeToDriverEvents } from "../services/socketClient";
import { useMobileApp } from "../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../utils/errorUtils";
import { statusLabel } from "../utils/rideStatus";

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
  if (method === "wallet") return "المحفظة";
  return "نقدا";
}

export function useAvailableDriverRides() {
  const { state, dispatch } = useMobileApp();
  const [rides, setRides] = useState(state.availableRides || []);
  const [status, setStatus] = useState("loading");
  const [socketStatus, setSocketStatus] = useState(state.socketStatus || "offline");
  const [error, setError] = useState("");
  const [dispatchMessage, setDispatchMessage] = useState("");
  const session = driverSessionFromState(state);

  function load() {
    setStatus("loading");
    setError("");
    setDispatchMessage("");
    fetchAvailableRides(session)
      .then((payload) => {
        const items = Array.isArray(payload) ? payload : payload.rides || [];
        const nextDispatchMessage =
          !Array.isArray(payload) && payload.availableStatus && payload.availableStatus !== "ok"
            ? payload.dispatchReason || "لا توجد طلبات مناسبة لحالتك الحالية."
            : "";
        setRides(items);
        setDispatchMessage(nextDispatchMessage);
        dispatch({
          type: "patch",
          patch: {
            availableRides: items,
            driverDispatchStatus: Array.isArray(payload) ? "ok" : payload.availableStatus,
            driverDispatchReason: nextDispatchMessage,
            connectionMessage: ""
          }
        });
      })
      .catch((requestError) => {
        setError(apiErrorMessage(requestError, "تعذر تحميل الرحلات المتاحة."));
        dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
      })
      .finally(() => setStatus("idle"));
  }

  useEffect(load, [state.token, state.currentUser?.driverId]);

  useEffect(() => {
    if (!session.driverId) return undefined;
    connectMobileSocket(session, {
      onConnectionChange: (connected, statusName) => {
        const nextStatus = statusName || (connected ? "connected" : "disconnected");
        setSocketStatus(nextStatus);
        dispatch({ type: "patch", patch: { socketStatus: nextStatus } });
      }
    });
    const unsubscribe = subscribeToDriverEvents((payload, eventName) => {
      if (eventName === "ride:created") load();
      if (eventName === "ride:accepted" || eventName === "ride:status-updated" || eventName === "ride:cancelled") load();
    });
    return unsubscribe;
  }, [session.driverId, session.phone, session.token]);

  async function accept(rideId) {
    setError("");
    try {
      const payload = await acceptRide(rideId, session);
      dispatch({ type: "setCurrentRide", ride: payload.ride, area: "driver", screen: "current", toast: "تم قبول الرحلة." });
      load();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر قبول الرحلة."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    }
  }

  return {
    rides,
    status,
    socketStatus,
    error,
    dispatchMessage,
    load,
    accept,
    paymentLabel,
    statusLabel
  };
}
