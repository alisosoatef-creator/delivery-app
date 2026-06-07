import { useMemo, useState } from "react";
import { requestCurrentLocation } from "../services/locationService";
import { searchPlaces } from "../services/placesApi";
import { createRide, quoteRide } from "../services/ridesApi";
import { useMobileApp } from "../store/mobileStore";
import { pointFromCity, pointFromPlace, safeDistanceKm } from "../utils/locationUtils";
import { cityOptions } from "../utils/westBankCities";

function paymentLabel(method) {
  if (method === "visa") return "بطاقة تجريبية";
  if (method === "wallet") return "محفظة";
  return "نقدا";
}

export function useRideRequestFlow() {
  const { state, dispatch } = useMobileApp();
  const [cityId, setCityId] = useState(state.selectedCity || "nablus");
  const [pickup, setPickup] = useState(state.pickup || pointFromCity(state.selectedCity || "nablus"));
  const [destination, setDestination] = useState(state.destination || null);
  const [destinationQuery, setDestinationQuery] = useState(state.destination?.label || "");
  const [suggestions, setSuggestions] = useState([]);
  const [quote, setQuote] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const distanceKm = useMemo(() => safeDistanceKm(pickup, destination), [pickup, destination]);
  const session = { token: state.token, role: "customer", phone: state.currentUser?.phone, userId: state.currentUser?.id };
  const cityChoices = useMemo(() => cityOptions().slice(0, 6), []);
  const paymentMethods = useMemo(() => ["cash", "visa", "wallet"].map((value) => ({ value, label: paymentLabel(value) })), []);

  async function useGpsLocation() {
    setError("");
    setStatus("location");
    try {
      const result = await requestCurrentLocation(cityId);
      const nextPickup = result.ok ? result.location : result.fallback;
      setPickup(nextPickup);
      dispatch({
        type: "setLocation",
        location: result.ok ? result.location : null,
        pickup: nextPickup,
        cityId,
        status: result.ok ? "gps" : "fallback",
        toast: result.ok ? "تم تحديد موقعك الحالي." : result.message
      });
    } catch (requestError) {
      const fallback = pointFromCity(cityId);
      setPickup(fallback);
      dispatch({ type: "setLocation", pickup: fallback, cityId, status: "fallback", toast: "تم استخدام موقع افتراضي للمدينة." });
      setError(requestError.message || "تعذر قراءة موقعك. تم استخدام موقع افتراضي.");
    } finally {
      setStatus("idle");
    }
  }

  function useCityFallback(nextCityId = cityId) {
    const fallback = pointFromCity(nextCityId);
    setCityId(nextCityId);
    setPickup(fallback);
    setQuote(null);
    dispatch({ type: "setLocation", pickup: fallback, cityId: nextCityId, status: "fallback", toast: "تم استخدام موقع افتراضي للمدينة." });
  }

  async function searchDestination(text) {
    setDestinationQuery(text);
    setError("");
    setDestination(null);
    setQuote(null);
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await searchPlaces({ city: cityId, q: text.trim() });
      setSuggestions(results);
    } catch (requestError) {
      setSuggestions([]);
      setError(requestError.message || "تعذر البحث عن الوجهة.");
    }
  }

  async function calculateQuote(nextDestination = destination) {
    if (!pickup || !nextDestination) return null;
    const nextDistanceKm = safeDistanceKm(pickup, nextDestination);
    const payload = await quoteRide({ cityId, distanceKm: nextDistanceKm });
    setQuote({ ...payload, distanceKm: nextDistanceKm });
    return { ...payload, distanceKm: nextDistanceKm };
  }

  async function chooseDestination(place) {
    const point = pointFromPlace(place);
    setDestination(point);
    setDestinationQuery(point.label);
    setSuggestions([]);
    dispatch({ type: "setDestination", destination: point });
    setStatus("quote");
    try {
      await calculateQuote(point);
    } catch (requestError) {
      setError(requestError.message || "تعذر حساب السعر.");
    } finally {
      setStatus("idle");
    }
  }

  async function submitRide() {
    setError("");
    if (!pickup) {
      setError("حدد نقطة الانطلاق أو استخدم موقع المدينة.");
      return;
    }
    if (!destination) {
      setError("اختر وجهة من نتائج البحث.");
      return;
    }
    setStatus("create");
    try {
      const activeQuote = quote || await calculateQuote(destination);
      if (!activeQuote) {
        setError("تعذر حساب السعر قبل طلب الرحلة.");
        return;
      }
      const payload = await createRide({
        customerId: state.currentUser?.id,
        customerName: state.currentUser?.fullName || state.currentUser?.name,
        customerPhone: state.currentUser?.phone,
        cityId,
        pickup: pickup.label,
        destination: destination.label,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        distanceKm: distanceKm || activeQuote.distanceKm,
        routeDistanceKm: activeQuote.distanceKm,
        durationMinutes: activeQuote.etaMinutes,
        paymentMethod
      }, session);
      dispatch({ type: "setCurrentRide", ride: payload.ride, area: "customer", screen: "ride-status", toast: "تم طلب الرحلة. جاري البحث عن كابتن..." });
    } catch (requestError) {
      setError(requestError.message || "تعذر طلب الرحلة من الموبايل.");
    } finally {
      setStatus("idle");
    }
  }

  return {
    cityId,
    pickup,
    destination,
    destinationQuery,
    suggestions,
    quote,
    paymentMethod,
    setPaymentMethod,
    status,
    error,
    cityChoices,
    paymentMethods,
    useGpsLocation,
    useCityFallback,
    searchDestination,
    chooseDestination,
    submitRide
  };
}
