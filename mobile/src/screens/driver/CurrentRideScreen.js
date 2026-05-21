import { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { EmptyState, MobileBadge, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { fetchDriverRides, updateDriverRideStatus } from "../../services/driverApi";
import { startDriverLocationWatch } from "../../services/locationService";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

const nextActions = {
  accepted: ["driver_arriving", "أنا بالطريق"],
  driver_arriving: ["arrived", "وصلت"],
  arrived: ["in_progress", "بدأت الرحلة"],
  in_progress: ["completed", "إنهاء الرحلة"]
};

const activeStatuses = ["accepted", "driver_arriving", "arrived", "in_progress"];

export function CurrentRideScreen() {
  const { state, dispatch } = useMobileApp();
  const watchRef = useRef(null);
  const [rides, setRides] = useState(state.currentRide ? [state.currentRide] : []);
  const [error, setError] = useState("");
  const [trackingStatus, setTrackingStatus] = useState("idle");
  const session = { ...state.session, token: state.token, driverId: state.currentUser?.driverId, phone: state.currentUser?.phone, userId: state.currentUser?.id };
  const currentRide = useMemo(() => rides.find((ride) => activeStatuses.includes(ride.status)) || (activeStatuses.includes(state.currentRide?.status) ? state.currentRide : null), [rides, state.currentRide]);
  const action = currentRide ? nextActions[currentRide.status] : null;

  function load() {
    setError("");
    fetchDriverRides(session)
      .then((items) => {
        setRides(items);
        const active = items.find((ride) => activeStatuses.includes(ride.status));
        if (active) dispatch({ type: "setCurrentRide", ride: active, area: "driver", screen: "current" });
      })
      .catch((requestError) => setError(requestError.message || "تعذر تحميل رحلات الكابتن."));
  }

  useEffect(load, [state.token, state.currentUser?.driverId]);

  useEffect(() => {
    return () => {
      if (watchRef.current?.remove) watchRef.current.remove();
    };
  }, []);

  async function update(status) {
    if (!currentRide) return;
    setError("");
    try {
      const payload = await updateDriverRideStatus(currentRide.id, status, session);
      dispatch({ type: "setCurrentRide", ride: payload.ride, area: "driver", screen: "current", toast: payload.ride?.status === "completed" ? "تم إنهاء الرحلة." : "تم تحديث حالة الرحلة." });
      if (status === "completed" && watchRef.current?.remove) {
        watchRef.current.remove();
        watchRef.current = null;
        setTrackingStatus("idle");
      }
      load();
    } catch (requestError) {
      setError(requestError.message || "تعذر تحديث حالة الرحلة.");
    }
  }

  async function startTracking() {
    if (!currentRide) return;
    setError("");
    setTrackingStatus("requesting");
    try {
      const subscription = await startDriverLocationWatch(
        (location) => {
          dispatch({ type: "patch", patch: { driverLocation: location, toast: "تم تحديث موقع الكابتن محليًا." } });
          setTrackingStatus("active");
        },
        () => {
          setTrackingStatus("denied");
          setError("لم يتم السماح بالوصول لموقع الكابتن.");
        }
      );
      watchRef.current = subscription;
      if (!subscription) setTrackingStatus("denied");
    } catch (requestError) {
      setTrackingStatus("denied");
      setError(requestError.message || "تعذر تفعيل موقع الكابتن.");
    }
  }

  function stopTracking() {
    if (watchRef.current?.remove) watchRef.current.remove();
    watchRef.current = null;
    setTrackingStatus("idle");
    dispatch({ type: "patch", patch: { toast: "تم إيقاف تتبع موقع الكابتن." } });
  }

  return (
    <ScreenContainer title="رحلتي الحالية" subtitle="تابع رحلة الكابتن وحدّث الحالة بالتسلسل الصحيح.">
      {error ? <Text selectable style={{ color: colors.red }}>{error}</Text> : null}
      {!currentRide ? <EmptyState title="لا توجد رحلة نشطة" message="اقبل رحلة من شاشة الرحلات المتاحة." /> : null}
      {currentRide ? (
        <MobileCard>
          <MobileBadge label={currentRide.status} tone={currentRide.status === "completed" ? "success" : "warning"} />
          <Text selectable style={{ color: colors.text, fontWeight: "900", fontSize: 18 }}>{currentRide.pickup} ← {currentRide.destination}</Text>
          <Text selectable style={{ color: colors.muted }}>الزبون: {currentRide.customerName || "-"} · {currentRide.customerPhone || "-"}</Text>
          <Text selectable style={{ color: colors.muted }}>السعر: {currentRide.price || currentRide.fareIls || 0} ₪ · الدفع: {currentRide.paymentMethod || "cash"}</Text>
          <MobileCard tone="soft">
            <Text selectable style={{ color: colors.text, fontWeight: "800" }}>تتبع GPS للكابتن: {trackingStatus === "active" ? "مفعل" : trackingStatus === "requesting" ? "جاري الطلب" : trackingStatus === "denied" ? "مرفوض" : "غير مفعل"}</Text>
            <Text selectable style={{ color: colors.muted }}>Foundation فقط. ربط Socket.IO للموبايل سيكون في المرحلة 27.</Text>
            <View style={{ flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" }}>
              <MobileButton title="تفعيل موقعي المباشر" variant="secondary" onPress={startTracking} disabled={trackingStatus === "requesting"} />
              <MobileButton title="إيقاف التتبع" variant="danger" onPress={stopTracking} disabled={trackingStatus !== "active"} />
            </View>
          </MobileCard>
          {action ? <MobileButton title={action[1]} onPress={() => update(action[0])} /> : <Text selectable style={{ color: colors.muted }}>لا توجد خطوة تالية لهذه الحالة.</Text>}
        </MobileCard>
      ) : null}
      <MobileButton title="تحديث رحلاتي" variant="secondary" onPress={load} />
    </ScreenContainer>
  );
}
