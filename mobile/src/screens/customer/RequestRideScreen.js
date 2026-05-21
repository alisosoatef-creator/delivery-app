import { useState } from "react";
import { Text } from "react-native";
import { MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { createRide, quoteRide } from "../../services/ridesApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function RequestRideScreen() {
  const { state, dispatch } = useMobileApp();
  const [form, setForm] = useState({ cityId: "nablus", pickup: "موقعي الحالي", destination: "", distanceKm: "5" });
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const session = { token: state.token, role: "customer", phone: state.currentUser?.phone };

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function getQuote() {
    setError("");
    try {
      const payload = await quoteRide({ cityId: form.cityId, distanceKm: Number(form.distanceKm || 5) });
      setQuote(payload);
    } catch (requestError) {
      setError(requestError.message || "تعذر حساب السعر.");
    }
  }

  async function submitRide() {
    setError("");
    if (!form.destination.trim()) {
      setError("اكتب الوجهة أولًا.");
      return;
    }
    try {
      const ride = await createRide({
        customerId: state.currentUser?.id,
        customerName: state.currentUser?.fullName,
        customerPhone: state.currentUser?.phone,
        cityId: form.cityId,
        pickup: form.pickup,
        destination: form.destination,
        distanceKm: Number(form.distanceKm || quote?.distanceKm || 5),
        routeDistanceKm: quote?.distanceKm,
        durationMinutes: quote?.etaMinutes,
        paymentMethod: "cash"
      }, session);
      dispatch({ type: "toast", message: `تم إنشاء الرحلة ${ride.ride?.id || ""}` });
    } catch (requestError) {
      setError(requestError.message || "تعذر طلب الرحلة.");
    }
  }

  return (
    <ScreenContainer title="طلب رحلة" subtitle="Foundation للموبايل. خريطة GPS وRoute للموبايل مؤجلة للمرحلة 26.">
      <MobileCard>
        <MobileBadge label="خريطة الموبايل: TODO المرحلة 26" tone="warning" />
        <MobileInput label="المدينة" value={form.cityId} onChangeText={(value) => update("cityId", value)} />
        <MobileInput label="نقطة الانطلاق" value={form.pickup} onChangeText={(value) => update("pickup", value)} />
        <MobileInput label="الوجهة" value={form.destination} onChangeText={(value) => update("destination", value)} placeholder="إلى أين تريد الذهاب؟" />
        <MobileInput label="المسافة التقديرية كم" value={form.distanceKm} onChangeText={(value) => update("distanceKm", value)} keyboardType="numeric" />
        {quote ? <Text selectable style={{ color: colors.text }}>السعر التقريبي: {quote.fareIls} ₪ - {quote.etaMinutes} دقيقة</Text> : null}
        {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
        <MobileButton title="احسب السعر" variant="secondary" onPress={getQuote} />
        <MobileButton title="طلب الرحلة" onPress={submitRide} />
      </MobileCard>
    </ScreenContainer>
  );
}
