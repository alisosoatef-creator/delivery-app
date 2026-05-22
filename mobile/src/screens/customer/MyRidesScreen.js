import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { EmptyState, InfoRow, LoadingState, MobileBadge, MobileButton, MobileCard, ScreenContainer, SectionHeader } from "../../components/ui";
import { fetchCustomerRides } from "../../services/ridesApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors, money } from "../../utils/mobileTheme";
import { isActiveRide, statusLabel } from "../../utils/rideStatus";

export function MyRidesScreen() {
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

  return (
    <ScreenContainer eyebrow="سجل الرحلات" title="رحلاتي" subtitle="كل رحلاتك محفوظة من الـ Backend، والرحلات النشطة يمكن متابعتها مباشرة.">
      {status === "loading" ? <LoadingState /> : null}
      {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      {status !== "loading" && !rides.length ? (
        <EmptyState title="لا توجد رحلات بعد" message="اطلب رحلة من شاشة طلب الرحلة لتظهر هنا." actionTitle="طلب رحلة" onAction={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} />
      ) : null}
      {rides.map((ride) => (
        <MobileCard key={ride.id} tone={isActiveRide(ride) ? "gold" : "default"}>
          <SectionHeader title={ride.destination || "رحلة"} subtitle={ride.pickup ? `${ride.pickup} ← ${ride.destination}` : "تفاصيل الرحلة"} />
          <MobileBadge label={statusLabel(ride.status)} tone={ride.status === "completed" ? "success" : ride.status === "cancelled" ? "danger" : "warning"} />
          <InfoRow label="السعر" value={money(ride.price || ride.fareIls)} />
          <InfoRow label="الدفع" value={ride.paymentMethod || "cash"} />
          {isActiveRide(ride) ? <MobileButton title="متابعة" onPress={() => continueRide(ride)} /> : null}
        </MobileCard>
      ))}
      <MobileButton title="تحديث الرحلات" variant="secondary" onPress={load} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.red, textAlign: "right", fontWeight: "800" }
});
