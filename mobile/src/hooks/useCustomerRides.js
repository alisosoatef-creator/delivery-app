import { useEffect, useState } from "react";
import { fetchCustomerRides } from "../services/ridesApi";
import { useMobileApp } from "../store/mobileStore";
import { isActiveRide, statusLabel } from "../utils/rideStatus";

function paymentLabel(method) {
  if (method === "visa" || method === "visa-placeholder") return "بطاقة تجريبية";
  if (method === "wallet") return "المحفظة";
  return "نقدا";
}

function ratingLabel(ride) {
  const rating = ride.rating || ride.rideRating;
  const value = rating?.rating || rating?.value || ride.ratingValue;
  return value ? `تقييم ${value}/5` : "";
}

export function useCustomerRides() {
  const { state, dispatch } = useMobileApp();
  const [rides, setRides] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  function load() {
    setStatus("loading");
    setError("");
    fetchCustomerRides({ phone: state.currentUser?.phone, userId: state.currentUser?.id, token: state.token })
      .then((items) => {
        setRides(items);
        const active = items.find(isActiveRide);
        if (active) dispatch({ type: "setActiveRide", ride: active, status: "idle" });
      })
      .catch((requestError) => {
        setRides([]);
        setError(requestError.message || "تعذر تحميل الرحلات.");
      })
      .finally(() => setStatus("idle"));
  }

  useEffect(load, [state.currentUser?.id, state.currentUser?.phone, state.token]);

  function continueRide(ride) {
    dispatch({ type: "setCurrentRide", ride, area: "customer", screen: "ride-status" });
  }

  function goToRequest() {
    dispatch({ type: "navigate", area: "customer", screen: "request" });
  }

  return {
    rides,
    status,
    error,
    load,
    continueRide,
    goToRequest,
    isActiveRide,
    paymentLabel,
    ratingLabel,
    statusLabel
  };
}
