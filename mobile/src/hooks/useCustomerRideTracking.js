import { useState, useMemo, useEffect } from "react";
import { cancelRide, fetchActiveCustomerRide, fetchCustomerRideDetails } from "../services/ridesApi";
import { connectMobileSocket, joinRideRoom, subscribeToLocationEvents, subscribeToRideEvents } from "../services/socketClient";
import { useMobileApp } from "../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../utils/errorUtils";
import { isActiveRide, isFinishedRide, statusLabel } from "../utils/rideStatus";

const acceptedStatuses = ["accepted", "driver_arriving", "arrived", "in_progress", "completed"];

function hasAcceptedDriver(ride) {
  return ride?.driver && acceptedStatuses.includes(ride.status);
}

function ridePoint(ride, type) {
  const prefix = type === "pickup" ? "pickup" : "destination";
  const lat = Number(ride?.[`${prefix}Lat`]);
  const lng = Number(ride?.[`${prefix}Lng`]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label: ride?.[prefix] || type };
}

function timeLabel(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function paymentLabel(method) {
  if (method === "visa" || method === "visa-placeholder") return "بطاقة تجريبية";
  if (method === "wallet") return "المحفظة";
  return "نقدًا";
}

export function useCustomerRideTracking() {
  const { state, dispatch } = useMobileApp();
  const [ride, setRide] = useState(state.currentRide);
  const [driverLocation, setDriverLocation] = useState(state.driverLocation);
  const [socketStatus, setSocketStatus] = useState(state.socketStatus || "offline");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const session = { token: state.token, role: "customer", phone: state.currentUser?.phone, userId: state.currentUser?.id };
  const pickupPoint = useMemo(() => ridePoint(ride, "pickup"), [ride]);
  const destinationPoint = useMemo(() => ridePoint(ride, "destination"), [ride]);

  function setCurrentRide(nextRide, extra = {}) {
    setRide(nextRide);
    dispatch({ type: "setCurrentRide", ride: nextRide, area: "customer", screen: "ride-status", ...extra });
  }

  useEffect(() => {
    let mounted = true;
    async function bootRide() {
      setStatus("loading");
      setError("");
      try {
        if (ride?.id) {
          const nextRide = await fetchCustomerRideDetails({ rideId: ride.id, phone: session.phone, userId: session.userId, token: session.token });
          if (mounted && nextRide) {
            setRide(nextRide);
            dispatch({ type: "setCurrentRide", ride: nextRide, area: "customer", screen: "ride-status" });
          }
        } else {
          const activeRide = await fetchActiveCustomerRide(session);
          if (mounted && activeRide) {
            setRide(activeRide);
            dispatch({ type: "setCurrentRide", ride: activeRide, area: "customer", screen: "ride-status" });
          }
        }
        dispatch({ type: "patch", patch: { connectionMessage: "" } });
      } catch (requestError) {
        if (mounted) {
          setError(apiErrorMessage(requestError, "تعذر جلب الرحلة النشطة."));
          dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
        }
      } finally {
        if (mounted) setStatus("idle");
      }
    }
    bootRide();
    return () => {
      mounted = false;
    };
  }, [state.currentUser?.id, state.currentUser?.phone, state.token]);

  useEffect(() => {
    if (!ride?.id) return undefined;
    const client = connectMobileSocket(
      { ...session, customerId: session.userId, customerPhone: session.phone, rideId: ride.id },
      {
        onConnectionChange: (connected, statusName) => {
          const nextStatus = statusName || (connected ? "connected" : "disconnected");
          setSocketStatus(nextStatus);
          dispatch({ type: "patch", patch: { socketStatus: nextStatus } });
          if (connected) joinRideRoom(ride.id);
        }
      }
    );

    const unsubscribeRide = subscribeToRideEvents((payload) => {
      const nextRide = payload?.ride;
      if (!nextRide || String(nextRide.id) !== String(ride.id)) return;
      setCurrentRide(nextRide);
    });

    const unsubscribeLocation = subscribeToLocationEvents((payload, eventName) => {
      if (String(payload?.rideId || "") !== String(ride.id)) return;
      if (eventName === "driver:location-unavailable") {
        dispatch({ type: "patch", patch: { liveTrackingStatus: "unavailable" } });
        return;
      }
      const location = payload?.location || { lat: payload?.lat, lng: payload?.lng };
      const nextLocation = {
        lat: Number(location.lat),
        lng: Number(location.lng),
        label: "موقع الكابتن",
        timestamp: payload?.timestamp || new Date().toISOString()
      };
      if (!Number.isFinite(nextLocation.lat) || !Number.isFinite(nextLocation.lng)) return;
      setDriverLocation(nextLocation);
      dispatch({ type: "patch", patch: { driverLocation: nextLocation, liveTrackingStatus: "active", lastDriverLocationAt: nextLocation.timestamp } });
    });

    if (client?.connected) joinRideRoom(ride.id);
    return () => {
      unsubscribeRide();
      unsubscribeLocation();
    };
  }, [ride?.id, session.phone, session.token, session.userId]);

  async function refresh() {
    if (!ride?.id) return;
    setStatus("loading");
    setError("");
    try {
      const nextRide = await fetchCustomerRideDetails({ rideId: ride.id, phone: session.phone, userId: session.userId, token: session.token });
      setCurrentRide(nextRide);
      dispatch({ type: "patch", patch: { connectionMessage: "" } });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر تحديث حالة الرحلة."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    } finally {
      setStatus("idle");
    }
  }

  async function cancel() {
    setStatus("cancel");
    setError("");
    try {
      const payload = await cancelRide(ride.id, session);
      setCurrentRide(payload.ride, { toast: "تم إلغاء الرحلة." });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر إلغاء الرحلة."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    } finally {
      setStatus("idle");
    }
  }

  function goToRequest() {
    dispatch({ type: "navigate", area: "customer", screen: "request" });
  }

  function goToRides() {
    dispatch({ type: "navigate", area: "customer", screen: "rides" });
  }

  const accepted = hasAcceptedDriver(ride);
  const finished = isFinishedRide(ride);
  const searching = ride?.status === "searching";
  const completed = ride?.status === "completed";
  const cancelled = ride?.status === "cancelled";
  const rideRating = ride?.rating || ride?.rideRating || null;
  const summaryTitle = completed ? "انتهت الرحلة" : cancelled ? "تم إلغاء الرحلة" : statusLabel(ride?.status);
  const liveUnavailable = accepted && socketStatus !== "connected";
  const driverLocationTime = timeLabel(driverLocation?.timestamp || state.lastDriverLocationAt);

  return {
    ride,
    setTrackedRide: setRide,
    driverLocation,
    socketStatus,
    status,
    error,
    currentLocation: state.currentLocation,
    pickupPoint,
    destinationPoint,
    accepted,
    finished,
    searching,
    completed,
    cancelled,
    rideRating,
    summaryTitle,
    liveUnavailable,
    driverLocationTime,
    showCancelAction: ["searching", "accepted"].includes(ride?.status),
    showRidesAction: !isActiveRide(ride),
    paymentLabel,
    statusLabel,
    refresh,
    cancel,
    goToRequest,
    goToRides
  };
}
