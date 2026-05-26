import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmptyState, LoadingState, MobileBadge, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { fetchCustomerRides } from "../../services/ridesApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors, money, spacing } from "../../utils/mobileTheme";
import { isActiveRide, statusLabel } from "../../utils/rideStatus";

function paymentLabel(method) {
  if (method === "visa" || method === "visa-placeholder") return "بطاقة تجريبية";
  if (method === "wallet") return "المحفظة";
  return "نقدًا";
}

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
    <ScreenContainer title="رحلاتي" subtitle="قائمة مختصرة لكل المشاوير السابقة والنشطة." compact>
      {status === "loading" ? <LoadingState /> : null}
      {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      {status !== "loading" && !rides.length ? (
        <EmptyState title="لا توجد رحلات بعد" message="اطلب رحلة لتظهر هنا." actionTitle="طلب رحلة" onAction={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} />
      ) : null}
      {rides.map((ride) => (
        <MobileCard key={ride.id} tone={isActiveRide(ride) ? "soft" : "flat"} style={styles.rideCard}>
          <View style={styles.rideHeader}>
            <View style={styles.rideTitleWrap}>
              <Text selectable style={styles.rideTitle}>{ride.destination || "رحلة"}</Text>
              <Text selectable numberOfLines={1} style={styles.ridePath}>{ride.pickup ? `${ride.pickup} ← ${ride.destination}` : "تفاصيل الرحلة"}</Text>
            </View>
            <MobileBadge label={statusLabel(ride.status)} tone={ride.status === "completed" ? "success" : ride.status === "cancelled" ? "danger" : "warning"} />
          </View>
          <View style={styles.metaRow}>
            <Text selectable style={styles.meta}>{money(ride.price || ride.fareIls)}</Text>
            <Text selectable style={styles.meta}>{paymentLabel(ride.paymentMethod)}</Text>
            {isActiveRide(ride) ? <MobileButton title="متابعة" compact onPress={() => continueRide(ride)} /> : null}
          </View>
        </MobileCard>
      ))}
      <MobileButton title="تحديث الرحلات" compact variant="secondary" onPress={load} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.red, textAlign: "right", fontWeight: "700" },
  rideCard: { gap: spacing.xs },
  rideHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  rideTitleWrap: { flex: 1, alignItems: "flex-end", gap: 3 },
  rideTitle: { color: colors.text, fontSize: 16, fontWeight: "800", textAlign: "right" },
  ridePath: { color: colors.muted, fontSize: 12, textAlign: "right" },
  metaRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm, justifyContent: "space-between" },
  meta: { color: colors.textSoft, fontSize: 13, fontWeight: "700" }
});
