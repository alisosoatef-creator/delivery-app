import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { requestCurrentLocation } from "../../services/locationService";
import { searchPlaces } from "../../services/placesApi";
import { createRide, quoteRide } from "../../services/ridesApi";
import { useMobileApp } from "../../store/mobileStore";
import { pointFromCity, pointFromPlace, safeDistanceKm } from "../../utils/locationUtils";
import { colors } from "../../utils/mobileTheme";
import { cityOptions } from "../../utils/westBankCities";

export function RequestRideScreen() {
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
      setError(requestError.message || "تعذر قراءة GPS. تم استخدام موقع افتراضي.");
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
      setError("حدد نقطة الانطلاق أو استخدم موقع المدينة الافتراضي.");
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

  return (
    <ScreenContainer title="طلب رحلة" subtitle="اختر المدينة، استخدم GPS أو مركز المدينة، ثم ابحث عن وجهتك.">
      <MobileCard>
        <MobileBadge label={state.locationStatus === "gps" ? "GPS مفعل" : "GPS أو موقع افتراضي"} tone={state.locationStatus === "gps" ? "success" : "warning"} />
        <Text selectable style={{ color: colors.muted }}>1. اختر المدينة  2. استخدم موقعي  3. ابحث عن الوجهة  4. اطلب الرحلة</Text>
        <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }}>
          {cityOptions().map((city) => (
            <Pressable key={city.value} onPress={() => useCityFallback(city.value)} style={{ padding: 8, borderRadius: 999, backgroundColor: cityId === city.value ? colors.gold : colors.surfaceSoft }}>
              <Text selectable style={{ color: cityId === city.value ? "#14100a" : colors.text, fontWeight: "800" }}>{city.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text selectable style={{ color: colors.text, fontWeight: "800" }}>نقطة الانطلاق: {pickup?.label || "-"}</Text>
        <MobileButton title={status === "location" ? "جاري تحديد الموقع..." : "استخدم موقعي الحالي"} onPress={useGpsLocation} disabled={status === "location"} />
      </MobileCard>

      <MobileCard>
        <MobileInput label="إلى أين تريد الذهاب؟" value={destinationQuery} onChangeText={searchDestination} placeholder="مثال: جامعة النجاح، المنارة، رفيديا" />
        {suggestions.map((place) => (
          <Pressable key={`${place.city}-${place.label}`} onPress={() => chooseDestination(place)} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text selectable style={{ color: colors.text, fontWeight: "800" }}>{place.label}</Text>
            <Text selectable style={{ color: colors.muted }}>{place.category || "مكان"} · {place.city}</Text>
          </Pressable>
        ))}
        {destination ? <Text selectable style={{ color: colors.text }}>الوجهة المختارة: {destination.label}</Text> : null}
        {quote ? (
          <MobileCard tone="soft">
            <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>{quote.fareIls} ₪</Text>
            <Text selectable style={{ color: colors.muted }}>المسافة: {quote.distanceKm} كم · الوقت المتوقع: {quote.etaMinutes} دقيقة · الدفع: {paymentMethod}</Text>
          </MobileCard>
        ) : null}
        <View style={{ flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" }}>
          {["cash", "visa", "wallet"].map((method) => (
            <Pressable key={method} onPress={() => setPaymentMethod(method)} style={{ padding: 8, borderRadius: 999, backgroundColor: paymentMethod === method ? colors.gold : colors.surfaceSoft }}>
              <Text selectable style={{ color: paymentMethod === method ? "#14100a" : colors.text, fontWeight: "800" }}>{method === "cash" ? "كاش" : method === "visa" ? "VISA تجريبي" : "محفظة"}</Text>
            </Pressable>
          ))}
        </View>
        {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
        <MobileButton title={status === "create" ? "جاري طلب الرحلة..." : "طلب الرحلة"} onPress={submitRide} disabled={status === "create"} />
      </MobileCard>
    </ScreenContainer>
  );
}
