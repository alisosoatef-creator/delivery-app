import { StyleSheet, Text, View } from "react-native";
import { BrandMark, InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, StatCard } from "../../components/ui";
import { useCustomerActiveRide } from "../../hooks/useCustomerActiveRide";
import { useMobileApp } from "../../store/mobileStore";
import { colors, money, spacing } from "../../utils/mobileTheme";
import { isActiveRide, statusLabel } from "../../utils/rideStatus";

function acceptedDriverName(ride) {
  const visible = ["accepted", "driver_arriving", "arrived", "in_progress"].includes(ride?.status);
  return visible ? ride?.driver?.fullName || ride?.driverName || "" : "";
}

export function CustomerHomeScreen() {
  const { state, dispatch } = useMobileApp();
  const { refreshActiveRide } = useCustomerActiveRide();
  const activeRide = isActiveRide(state.currentRide) ? state.currentRide : null;
  const driverName = acceptedDriverName(activeRide);
  const firstName = state.currentUser?.fullName?.split(" ")?.[0] || "علي";

  return (
    <ScreenContainer showHeader={false}>
      <View style={styles.top}>
        <BrandMark compact />
        <Text selectable style={styles.greeting}>أهلًا {firstName}</Text>
        <Text selectable style={styles.title}>جاهز لمشوارك القادم؟</Text>
        <Text selectable style={styles.subtitle}>حدد وجهتك، شاهد السعر، واطلب كابتن قريب خلال لحظات.</Text>
        <MobileButton title="اطلب رحلة" variant="accent" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} />
      </View>

      {activeRide ? (
        <MobileCard tone="soft" style={styles.activeRide}>
          <View style={styles.rowBetween}>
            <MobileBadge label={statusLabel(activeRide.status)} tone="warning" />
            <Text selectable style={styles.cardTitle}>رحلة نشطة</Text>
          </View>
          <InfoRow label="المسار" value={`${activeRide.pickup} ← ${activeRide.destination}`} accent />
          <InfoRow label="السعر" value={money(activeRide.price || activeRide.fareIls)} />
          {driverName ? <InfoRow label="الكابتن" value={driverName} /> : null}
          <MobileButton title="متابعة الرحلة" compact onPress={() => dispatch({ type: "navigate", area: "customer", screen: "ride-status" })} />
        </MobileCard>
      ) : null}

      <View style={styles.stats}>
        <StatCard label="الرحلات" value="سجل" hint="تابع رحلاتك" tone="blue" />
        <StatCard label="الدفع" value="كاش" hint="أساسي" />
      </View>

      <MobileCard tone="flat" style={styles.shortcuts}>
        <Text selectable style={styles.sectionTitle}>اختصارات</Text>
        <View style={styles.actions}>
          <MobileButton title="تحديث النشطة" variant="secondary" compact onPress={refreshActiveRide} />
          <MobileButton title="رحلاتي" variant="secondary" compact onPress={() => dispatch({ type: "navigate", area: "customer", screen: "rides" })} />
          <MobileButton title="الدفع" variant="secondary" compact onPress={() => dispatch({ type: "navigate", area: "customer", screen: "wallet" })} />
          <MobileButton title="الدعم" variant="ghost" compact onPress={() => dispatch({ type: "navigate", area: "customer", screen: "support" })} />
        </View>
      </MobileCard>
      {state.activeRideStatus === "loading" ? <Text selectable style={styles.muted}>جاري فحص الرحلة النشطة...</Text> : null}
      {state.activeRideError ? <Text selectable style={styles.error}>{state.activeRideError}</Text> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: { gap: spacing.sm, alignItems: "flex-end", paddingTop: spacing.sm },
  greeting: { color: colors.primary, fontSize: 14, fontWeight: "700", textAlign: "right" },
  title: { color: colors.text, fontSize: 30, lineHeight: 38, fontWeight: "800", textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: "right" },
  activeRide: { gap: spacing.xs },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "800", textAlign: "right" },
  stats: { flexDirection: "row-reverse", gap: spacing.sm },
  shortcuts: { gap: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800", textAlign: "right" },
  actions: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs },
  muted: { color: colors.muted, textAlign: "right", fontWeight: "700" },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" }
});
