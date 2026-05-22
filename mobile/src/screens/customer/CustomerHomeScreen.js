import { StyleSheet, Text, View } from "react-native";
import { InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, SectionHeader, StatCard } from "../../components/ui";
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

  return (
    <ScreenContainer
      eyebrow="تجربة الزبون"
      title={`أهلًا ${state.currentUser?.fullName?.split(" ")?.[0] || "بك"}`}
      subtitle="كل شيء جاهز لطلب رحلة واضحة، متابعة مباشرة، ودعم سريع عند الحاجة."
    >
      <MobileCard tone="gold" style={styles.hero}>
        <MobileBadge label="جاهز للانطلاق" tone="success" />
        <Text selectable style={styles.heroTitle}>اطلب مشوارك بثقة وتابع الكابتن لحظة بلحظة.</Text>
        <View style={styles.stats}>
          <StatCard label="الحالة" value={activeRide ? "نشطة" : "جاهز"} hint="آخر رحلة" />
          <StatCard label="الدفع" value="كاش" hint="أساسي" tone="blue" />
        </View>
      </MobileCard>

      {activeRide ? (
        <MobileCard tone="soft">
          <SectionHeader eyebrow="رحلة نشطة" title="لديك رحلة نشطة" subtitle="يمكنك الرجوع إليها من أي مكان داخل التطبيق." />
          <MobileBadge label={statusLabel(activeRide.status)} tone="warning" />
          <InfoRow label="المسار" value={`${activeRide.pickup} ← ${activeRide.destination}`} accent />
          <InfoRow label="السعر" value={money(activeRide.price || activeRide.fareIls)} />
          {driverName ? <InfoRow label="الكابتن" value={driverName} /> : null}
          <MobileButton title="متابعة الرحلة" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "ride-status" })} />
        </MobileCard>
      ) : null}

      {state.activeRideStatus === "loading" ? <Text selectable style={styles.muted}>جاري فحص الرحلة النشطة...</Text> : null}
      {state.activeRideError ? <Text selectable style={styles.error}>{state.activeRideError}</Text> : null}

      <MobileCard>
        <SectionHeader title="اختصارات سريعة" subtitle="الوصول لأهم إجراءات الزبون بدون ازدحام." />
        <View style={styles.actions}>
          <MobileButton title="طلب رحلة" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} />
          <MobileButton title="تحديث الرحلة النشطة" variant="secondary" onPress={refreshActiveRide} />
          <MobileButton title="رحلاتي" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "rides" })} />
          <MobileButton title="المحفظة والدفع" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "wallet" })} />
          <MobileButton title="الدعم" variant="ghost" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "support" })} />
        </View>
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.md },
  heroTitle: { color: colors.text, fontSize: 24, lineHeight: 34, fontWeight: "900", textAlign: "right" },
  stats: { flexDirection: "row-reverse", gap: spacing.sm },
  actions: { gap: spacing.sm },
  muted: { color: colors.muted, textAlign: "right", fontWeight: "800" },
  error: { color: colors.red, textAlign: "right", fontWeight: "800" }
});
