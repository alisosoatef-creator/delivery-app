import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { BrandMark, ChoiceChip, InfoRow, MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { requestCurrentLocation } from "../../services/locationService";
import { searchPlaces } from "../../services/placesApi";
import { createRide, quoteRide } from "../../services/ridesApi";
import { useMobileApp } from "../../store/mobileStore";
import { pointFromCity, pointFromPlace, safeDistanceKm } from "../../utils/locationUtils";
import { colors, km, money, spacing } from "../../utils/mobileTheme";
import { cityOptions } from "../../utils/westBankCities";

function paymentLabel(method) {
  if (method === "visa") return "بطاقة تجريبية";
  if (method === "wallet") return "محفظة";
  return "نقدًا";
}

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
    <ScreenContainer showHeader={false} compact>
      <View style={styles.header}>
        <BrandMark compact />
        <View style={styles.headerCopy}>
          <Text selectable style={styles.title}>طلب رحلة</Text>
          <Text selectable style={styles.subtitle}>حدد الانطلاق والوجهة، وسنحسب السعر فورًا.</Text>
        </View>
      </View>

      <MobileRideMap pickup={pickup} destination={destination} rideStatus="searching" height={232} />

      <View style={styles.quickSteps}>
        <Text selectable style={[styles.quickStep, pickup && styles.quickStepDone]}>1. الانطلاق</Text>
        <Text selectable style={[styles.quickStep, destination && styles.quickStepDone]}>2. الوجهة</Text>
        <Text selectable style={[styles.quickStep, quote && styles.quickStepDone]}>3. السعر</Text>
      </View>

      <MobileCard tone="flat" style={styles.panel}>
        <View style={styles.stepHeader}>
          <Text selectable style={styles.stepTitle}>الانطلاق</Text>
          <MobileButton title={status === "location" ? "..." : "موقعي"} compact variant="secondary" onPress={useGpsLocation} loading={status === "location"} />
        </View>
        <View style={styles.chips}>
          {cityOptions().slice(0, 6).map((city) => (
            <ChoiceChip key={city.value} label={city.label} selected={cityId === city.value} onPress={() => useCityFallback(city.value)} />
          ))}
        </View>
        <InfoRow label="من" value={pickup?.label || "-"} accent />

        <Text selectable style={styles.stepTitle}>الوجهة</Text>
        <MobileInput label="" value={destinationQuery} onChangeText={searchDestination} placeholder="إلى أين تريد الذهاب؟" />
        {status === "quote" ? <Text selectable style={styles.muted}>جاري حساب السعر والمسافة...</Text> : null}
        {suggestions.map((place) => (
          <Pressable key={`${place.city}-${place.label}`} onPress={() => chooseDestination(place)} style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
            <Text selectable style={styles.suggestionTitle}>{place.label}</Text>
            <Text selectable style={styles.suggestionMeta}>{place.category || "مكان"} · {place.city}</Text>
          </Pressable>
        ))}
      </MobileCard>

      <MobileCard tone="hero" style={styles.summarySticky}>
        <Text selectable style={styles.stepTitle}>ملخص الطلب</Text>
        <InfoRow label="نقطة الانطلاق" value={pickup?.label || "-"} accent />
        <InfoRow label="الوجهة" value={destination?.label || "اختر وجهتك"} />
        {quote ? (
          <View style={styles.summaryRow}>
            <Text selectable style={styles.price}>{money(quote.fareIls)}</Text>
            <View style={styles.summaryMeta}>
              <Text selectable style={styles.meta}>{km(quote.distanceKm)}</Text>
              <Text selectable style={styles.meta}>{quote.etaMinutes || "-"} دقيقة</Text>
            </View>
          </View>
        ) : (
          <Text selectable style={styles.muted}>اختر وجهة لحساب السعر.</Text>
        )}
        <View style={styles.chips}>
          {["cash", "visa", "wallet"].map((method) => (
            <ChoiceChip
              key={method}
              label={paymentLabel(method)}
              selected={paymentMethod === method}
              onPress={() => setPaymentMethod(method)}
            />
          ))}
        </View>
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title={status === "create" ? "جاري الطلب..." : "طلب الرحلة"} variant="accent" onPress={submitRide} loading={status === "create"} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  headerCopy: { flex: 1, alignItems: "flex-end", gap: 2 },
  title: { color: colors.text, fontSize: 22, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 13, textAlign: "right" },
  panel: { gap: spacing.sm },
  quickSteps: {
    flexDirection: "row-reverse",
    gap: spacing.xs,
    flexWrap: "wrap"
  },
  quickStep: {
    flex: 1,
    minWidth: 86,
    color: colors.muted,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.052)",
    borderWidth: 1,
    borderColor: colors.border
  },
  quickStepDone: {
    color: colors.black,
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  stepHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  stepTitle: { color: colors.text, fontSize: 14.5, fontWeight: "900", textAlign: "right" },
  chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs },
  suggestion: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: colors.border
  },
  pressed: { transform: [{ scale: 0.99 }] },
  suggestionTitle: { color: colors.text, fontWeight: "800", textAlign: "right" },
  suggestionMeta: { color: colors.muted, textAlign: "right", marginTop: 2, fontSize: 12 },
  summarySticky: { gap: spacing.sm },
  summaryRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  price: { color: colors.primary, fontSize: 27, fontWeight: "900", textAlign: "right" },
  summaryMeta: { alignItems: "flex-start", gap: 3 },
  meta: { color: colors.textSoft, fontSize: 13, fontWeight: "700" },
  muted: { color: colors.muted, textAlign: "right" },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" }
});
