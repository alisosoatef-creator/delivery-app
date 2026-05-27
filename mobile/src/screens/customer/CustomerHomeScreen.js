import { StyleSheet, Text, View } from "react-native";
import { BrandMark, InfoRow, MobileBadge, MobileButton, MobileCard, PressableScale, ScreenContainer, StatCard } from "../../components/ui";
import { useCustomerActiveRide } from "../../hooks/useCustomerActiveRide";
import { useMobileApp } from "../../store/mobileStore";
import { colors, depth, money, radii, shadows, spacing } from "../../utils/mobileTheme";
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

  const shortcuts = [
    ["رحلاتي", "rides", "سجل المشاوير"],
    ["المحفظة", "wallet", "الدفع والبطاقات"],
    ["الدعم", "support", "مساعدة سريعة"],
    ["الحساب", "account", "بياناتك"]
  ];

  return (
    <ScreenContainer showHeader={false}>
      <MobileCard tone="glass" style={styles.heroSystem}>
        <View style={styles.heroTop}>
          <BrandMark title="وصل" subtitle="تحكم بمشوارك من أول لمسة" />
          <MobileBadge label="مباشر" tone="info" />
        </View>
        <View style={styles.heroCopy}>
          <Text selectable style={styles.greeting}>أهلًا {firstName}</Text>
          <Text selectable style={styles.title}>جاهز لمشوارك القادم؟</Text>
          <Text selectable style={styles.subtitle}>اختر الوجهة، شاهد السعر، واطلب كابتن قريب بتجربة سريعة ونظيفة.</Text>
        </View>
        <View style={styles.heroActions}>
          <MobileButton title="اطلب رحلة" variant="accent" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} />
          <MobileButton title="رحلاتي" variant="secondary" compact onPress={() => dispatch({ type: "navigate", area: "customer", screen: "rides" })} />
        </View>
      </MobileCard>

      {activeRide ? (
        <MobileCard tone="hero" style={styles.activeRideCard}>
          <View style={styles.rowBetween}>
            <MobileBadge label={statusLabel(activeRide.status)} tone="warning" />
            <Text selectable style={styles.cardTitle}>رحلة نشطة</Text>
          </View>
          <InfoRow label="المسار" value={`${activeRide.pickup || "-"} ← ${activeRide.destination || "-"}`} accent />
          <View style={styles.activeFooter}>
            <Text selectable style={styles.activePrice}>{money(activeRide.price || activeRide.fareIls)}</Text>
            {driverName ? <Text selectable style={styles.muted}>الكابتن: {driverName}</Text> : <Text selectable style={styles.muted}>بانتظار قبول كابتن</Text>}
          </View>
          <MobileButton title="متابعة الرحلة" compact variant="accent" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "ride-status" })} />
        </MobileCard>
      ) : null}

      <View style={styles.statDeck}>
        <StatCard label="الرحلات" value="جاهزة" hint="اطلب وتابع" tone="blue" />
        <StatCard label="الدفع" value="مرن" hint="نقدًا أو تجريبي" />
      </View>

      <View style={styles.quickActionGrid}>
        {shortcuts.map(([label, screen, hint]) => (
          <PressableScale
            key={screen}
            accessibilityLabel={label}
            onPress={() => dispatch({ type: "navigate", area: "customer", screen })}
            style={styles.quickAction}
            pressedStyle={styles.quickPressed}
          >
            <Text selectable={false} style={styles.quickMark}>{label.slice(0, 1)}</Text>
            <View style={styles.quickCopy}>
              <Text selectable style={styles.quickLabel}>{label}</Text>
              <Text selectable style={styles.quickHint}>{hint}</Text>
            </View>
          </PressableScale>
        ))}
      </View>

      <MobileButton title="تحديث الرحلة النشطة" variant="ghost" compact onPress={refreshActiveRide} />
      {state.activeRideStatus === "loading" ? <Text selectable style={styles.muted}>جاري فحص الرحلة النشطة...</Text> : null}
      {state.activeRideError ? <Text selectable style={styles.error}>{state.activeRideError}</Text> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroSystem: { gap: spacing.md, paddingVertical: spacing.lg, borderColor: depth.tealLine },
  heroTop: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  heroCopy: { alignItems: "flex-end", gap: 4 },
  greeting: { color: colors.primary, fontSize: 14, fontWeight: "900", textAlign: "right" },
  title: { color: colors.text, fontSize: 30, lineHeight: 36, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.textSoft, fontSize: 13.5, lineHeight: 21, textAlign: "right" },
  heroActions: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.xs, flexWrap: "wrap" },
  activeRideCard: { gap: spacing.xs, borderColor: depth.tealLine },
  rowBetween: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "right" },
  activeFooter: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  activePrice: { color: colors.primary, fontSize: 21, fontWeight: "900" },
  statDeck: { flexDirection: "row-reverse", gap: spacing.sm },
  quickActionGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm },
  quickAction: {
    width: "47.5%",
    minHeight: 84,
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255, 255, 255, 0.052)",
    borderWidth: 1,
    borderColor: depth.hairline,
    boxShadow: shadows.soft
  },
  quickPressed: { opacity: 0.9 },
  quickMark: { color: colors.primary, fontSize: 18, fontWeight: "900" },
  quickCopy: { alignItems: "flex-end", gap: 2 },
  quickLabel: { color: colors.text, fontSize: 14.5, fontWeight: "900", textAlign: "right" },
  quickHint: { color: colors.muted, fontSize: 11.5, fontWeight: "700", textAlign: "right" },
  muted: { color: colors.muted, textAlign: "right", fontWeight: "700" },
  error: { color: colors.red, textAlign: "right", fontWeight: "800" }
});
