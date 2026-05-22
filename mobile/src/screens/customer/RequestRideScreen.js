import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChoiceChip, InfoRow, MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer, SectionHeader } from "../../components/ui";
import { requestCurrentLocation } from "../../services/locationService";
import { searchPlaces } from "../../services/placesApi";
import { createRide, quoteRide } from "../../services/ridesApi";
import { useMobileApp } from "../../store/mobileStore";
import { pointFromCity, pointFromPlace, safeDistanceKm } from "../../utils/locationUtils";
import { colors, km, money, spacing } from "../../utils/mobileTheme";
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
    <ScreenContainer
      eyebrow="طلب مشوار"
      title="حدد وجهتك"
      subtitle="اختر المدينة، فعّل موقعك أو استخدم مركز المدينة، ثم ابحث عن وجهتك."
    >
      <MobileCard tone="gold">
        <MobileBadge label={state.locationStatus === "gps" ? "GPS مفعل" : "موقع افتراضي جاهز"} tone={state.locationStatus === "gps" ? "success" : "warning"} />
        <Text selectable style={styles.steps}>1. اختر المدينة  2. استخدم موقعي  3. ابحث عن الوجهة  4. اطلب الرحلة</Text>
      </MobileCard>

      <MobileCard>
        <SectionHeader title="المدينة ونقطة الانطلاق" subtitle="يمكنك تغيير المدينة أو استخدام موقعك الحالي." />
        <View style={styles.chips}>
          {cityOptions().map((city) => (
            <ChoiceChip key={city.value} label={city.label} selected={cityId === city.value} onPress={() => useCityFallback(city.value)} />
          ))}
        </View>
        <InfoRow label="نقطة الانطلاق" value={pickup?.label || "-"} accent />
        <MobileButton title={status === "location" ? "جاري تحديد الموقع..." : "استخدم موقعي الحالي"} onPress={useGpsLocation} disabled={status === "location"} />
      </MobileCard>

      <MobileCard>
        <SectionHeader title="الوجهة" subtitle="اكتب اسم المكان واختر من النتائج القريبة." />
        <MobileInput label="إلى أين تريد الذهاب؟" value={destinationQuery} onChangeText={searchDestination} placeholder="مثال: جامعة النجاح، المنارة، رفيديا" />
        {suggestions.map((place) => (
          <Pressable key={`${place.city}-${place.label}`} onPress={() => chooseDestination(place)} style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
            <Text selectable style={styles.suggestionTitle}>{place.label}</Text>
            <Text selectable style={styles.suggestionMeta}>{place.category || "مكان"} · {place.city}</Text>
          </Pressable>
        ))}
        {destination ? <InfoRow label="الوجهة المختارة" value={destination.label} accent /> : null}
      </MobileCard>

      <MobileCard tone={quote ? "gold" : "soft"}>
        <SectionHeader title="التسعير والدفع" subtitle="السعر يحسب من المسافة الحالية حسب المدينة." />
        {quote ? (
          <>
            <Text selectable style={styles.price}>{money(quote.fareIls)}</Text>
            <InfoRow label="المسافة" value={km(quote.distanceKm)} />
            <InfoRow label="الوقت المتوقع" value={`${quote.etaMinutes || "-"} دقيقة`} />
          </>
        ) : (
          <Text selectable style={styles.muted}>اختر وجهة لحساب السعر تلقائيًا.</Text>
        )}
        <View style={styles.chips}>
          {["cash", "visa", "wallet"].map((method) => (
            <ChoiceChip
              key={method}
              label={method === "cash" ? "كاش" : method === "visa" ? "VISA تجريبي" : "محفظة"}
              selected={paymentMethod === method}
              onPress={() => setPaymentMethod(method)}
            />
          ))}
        </View>
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title={status === "create" ? "جاري طلب الرحلة..." : "طلب الرحلة"} onPress={submitRide} disabled={status === "create"} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  steps: { color: colors.text, fontWeight: "900", lineHeight: 24, textAlign: "right" },
  chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs },
  suggestion: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  pressed: { transform: [{ scale: 0.99 }] },
  suggestionTitle: { color: colors.text, fontWeight: "900", textAlign: "right" },
  suggestionMeta: { color: colors.muted, textAlign: "right", marginTop: 3 },
  price: { color: colors.text, fontSize: 36, fontWeight: "900", textAlign: "right" },
  muted: { color: colors.muted, textAlign: "right", fontWeight: "800" },
  error: { color: colors.red, textAlign: "right", fontWeight: "800" }
});
