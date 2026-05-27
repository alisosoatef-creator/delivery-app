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
      <MobileCard tone="hero" style={styles.customerHero}>
        <BrandMark compact />
        <View style={styles.heroCopy}>
          <Text selectable style={styles.greeting}>أهلًا {firstName}</Text>
          <Text selectable style={styles.title}>جاهز لمشوارك القادم؟</Text>
          <Text selectable style={styles.subtitle}>وجهتك، السعر، والكابتن القريب في تجربة واحدة سريعة.</Text>
        </View>
        <MobileButton title="اطلب رحلة" variant="accent" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} />
      </MobileCard>

      {activeRide ? (
        <MobileCard tone="soft" style={styles.activeRideCard}>
          <View style={styles.rowBetween}>
            <MobileBadge label={statusLabel(activeRide.status)} tone="warning" />
            <Text selectable style={styles.cardTitle}>لديك رحلة نشطة</Text>
          </View>
          <InfoRow label="المسار" value={`${activeRide.pickup || "-"} ← ${activeRide.destination || "-"}`} accent />
          <InfoRow label="السعر" value={money(activeRide.price || activeRide.fareIls)} />
          {driverName ? <InfoRow label="الكابتن" value={driverName} /> : null}
          <MobileButton title="متابعة الرحلة" compact variant="accent" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "ride-status" })} />
        </MobileCard>
      ) : null}

      <View style={styles.stats}>
        <StatCard label="رحلاتي" value="سجل" hint="نشطة وسابقة" tone="blue" />
        <StatCard label="الدفع" value="نقدًا" hint="أو بطاقة تجريبية" />
      </View>

      <MobileCard tone="flat" style={styles.shortcuts}>
        <Text selectable style={styles.sectionTitle}>اختصارات سريعة</Text>
        <View style={styles.quickActionGrid}>
          <MobileButton title="رحلاتي" variant="secondary" compact onPress={() => dispatch({ type: "navigate", area: "customer", screen: "rides" })} />
          <MobileButton title="المحفظة" variant="secondary" compact onPress={() => dispatch({ type: "navigate", area: "customer", screen: "wallet" })} />
          <MobileButton title="الدعم" variant="secondary" compact onPress={() => dispatch({ type: "navigate", area: "customer", screen: "support" })} />
          <MobileButton title="الحساب" variant="ghost" compact onPress={() => dispatch({ type: "navigate", area: "customer", screen: "account" })} />
        </View>
        <MobileButton title="تحديث الرحلة النشطة" variant="ghost" compact onPress={refreshActiveRide} />
      </MobileCard>

      {state.activeRideStatus === "loading" ? <Text selectable style={styles.muted}>جاري فحص الرحلة النشطة...</Text> : null}
      {state.activeRideError ? <Text selectable style={styles.error}>{state.activeRideError}</Text> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  customerHero: { gap: spacing.sm, alignItems: "flex-end", paddingVertical: spacing.lg },
  heroCopy: { alignItems: "flex-end", gap: 3 },
  greeting: { color: colors.primary, fontSize: 14, fontWeight: "800", textAlign: "right" },
  title: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "right" },
  activeRideCard: { gap: spacing.xs },
  rowBetween: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "right" },
  stats: { flexDirection: "row-reverse", gap: spacing.sm },
  shortcuts: { gap: spacing.sm, backgroundColor: "rgba(255,255,255,0.036)" },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "right" },
  quickActionGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs },
  muted: { color: colors.muted, textAlign: "right", fontWeight: "700" },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" }
});
