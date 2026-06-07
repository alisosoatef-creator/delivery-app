import { useEffect, useRef, useState } from "react";
import { startDriverLocationWatch } from "../services/locationService";
import { connectMobileSocket, emitDriverLocation, emitDriverLocationUnavailable } from "../services/socketClient";
import { useMobileApp } from "../store/mobileStore";

function trackingLabel(status) {
  if (status === "active") return "مباشر";
  if (status === "denied") return "مرفوض";
  if (status === "requesting") return "جاري التفعيل";
  if (status === "unavailable") return "غير متاح";
  return "غير مفعل";
}

function trackingTone(status) {
  if (status === "active") return "success";
  if (status === "denied" || status === "unavailable") return "danger";
  if (status === "requesting") return "info";
  return "warning";
}

function timeLabel(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function useDriverLiveTracking({ currentRide, session, setSocketStatus, clearRideError } = {}) {
  const { state, dispatch } = useMobileApp();
  const watchRef = useRef(null);
  const [trackingStatus, setTrackingStatus] = useState(state.liveTrackingStatus || "idle");
  const [driverLocation, setDriverLocation] = useState(state.driverLocation);
  const [error, setError] = useState("");
  const driverLocationTime = timeLabel(driverLocation?.timestamp || state.lastDriverLocationAt);

  useEffect(() => {
    return () => {
      if (watchRef.current?.remove) watchRef.current.remove();
    };
  }, []);

  async function startTracking() {
    if (!currentRide) return;
    clearRideError?.();
    setError("");
    setTrackingStatus("requesting");
    dispatch({ type: "patch", patch: { liveTrackingStatus: "requesting" } });
    connectMobileSocket({ ...session, rideId: currentRide.id }, { onConnectionChange: (connected, statusName) => setSocketStatus?.(statusName || (connected ? "connected" : "disconnected")) });

    try {
      const subscription = await startDriverLocationWatch(
        (location) => {
          setDriverLocation(location);
          setTrackingStatus("active");
          dispatch({ type: "patch", patch: { driverLocation: location, liveTrackingStatus: "active", lastDriverLocationAt: location.timestamp || new Date().toISOString(), toast: "تم تحديث موقع الكابتن مباشرًا." } });
          const sent = emitDriverLocation({ rideId: currentRide.id, driverId: session.driverId, lat: location.lat, lng: location.lng, timestamp: location.timestamp });
          if (!sent) setSocketStatus?.("offline");
        },
        () => {
          setTrackingStatus("denied");
          dispatch({ type: "patch", patch: { liveTrackingStatus: "denied" } });
          setError("لم يتم السماح بالوصول لموقع الكابتن.");
        }
      );
      watchRef.current = subscription;
      if (!subscription) setTrackingStatus("denied");
    } catch (requestError) {
      setTrackingStatus("denied");
      dispatch({ type: "patch", patch: { liveTrackingStatus: "denied" } });
      setError(requestError.message || "تعذر تفعيل موقع الكابتن.");
    }
  }

  function stopTracking(showToast = true) {
    if (watchRef.current?.remove) watchRef.current.remove();
    watchRef.current = null;
    setTrackingStatus("idle");
    dispatch({ type: "patch", patch: { liveTrackingStatus: "idle", toast: showToast ? "تم إيقاف تتبع موقع الكابتن." : state.toast } });
    if (currentRide?.id && session?.driverId) {
      emitDriverLocationUnavailable({ rideId: currentRide.id, driverId: session.driverId, reason: "driver-stopped-tracking" });
    }
  }

  return {
    trackingStatus,
    driverLocation,
    driverLocationTime,
    trackingError: error,
    trackingLabel,
    trackingTone,
    startTracking,
    stopTracking
  };
}
