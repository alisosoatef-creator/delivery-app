import { StyleSheet, Text, View } from "react-native";
import { BrandMark, InfoRow, MobileBadge, MobileButton, MobileCard, PressableScale, ScreenContainer, StatCard } from "../../components/ui";
import { useDriverAvailability } from "../../hooks/useDriverAvailability";
import { money } from "../../utils/formatters";
import { colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";

export function DriverHomeScreen() {
  const {
    driver,
    currentUser,
    available,
    status,
    error,
    availableCount,
    currentRide,
    socketStatus,
    toggleAvailability,
    logout,
    goToAvailable,
    goToCurrent,
    goToEarnings,
    goToSupport
  } = useDriverAvailability();

  return (
    <ScreenContainer showHeader={false} variant="driver" compact>
      <MobileCard tone="command" style={styles.cockpit}>
        <View style={styles.cockpitTop}>
          <BrandMark compact title="وصل كابتن" />
          <MobileBadge label={available ? "متاح" : "غير متاح"} tone={available ? "success" : "warning"} />
        </View>
        <View style={styles.identity}>
          <Text selectable style={styles.role}>لوحة التشغيل</Text>
          <Text selectable style={styles.name}>{driver.fullName || currentUser.fullName || "كابتن وصل"}</Text>
          <Text selectable style={styles.vehicle}>{driver.vehicleType || driver.vehicle || "مركبة"} · {driver.vehiclePlate || driver.plate || "بدون لوحة"}</Text>
        </View>
        <View style={styles.availabilityStrip}>
          <View style={styles.availabilityCopy}>
            <Text selectable style={styles.sectionTitle}>استقبال الطلبات</Text>
            <Text selectable style={styles.helper}>{available ? "القناة مفتوحة للطلبات المناسبة." : "الطلبات الجديدة متوقفة مؤقتا."}</Text>
          </View>
          <PressableScale
            accessibilityRole="switch"
            accessibilityLabel="تبديل حالة توفر الكابتن"
            disabled={status === "saving"}
            onPress={toggleAvailability}
            style={[styles.toggle, available && styles.toggleOn, status === "saving" && styles.toggleSaving]}
          >
            <View style={[styles.toggleKnob, available && styles.toggleKnobOn]} />
          </PressableScale>
        </View>
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      </MobileCard>

      <View style={styles.stats}>
        <StatCard label="طلبات متاحة" value={String(availableCount)} hint={available ? "جاهز" : "متوقف"} tone={available ? "green" : "warning"} />
        <StatCard label="اليوم" value={money(0)} hint="أرباح تجريبية" />
      </View>

      {currentRide ? (
        <MobileCard tone="hero" style={styles.currentRideCard}>
          <View style={styles.rowBetween}>
            <MobileBadge label={currentRide.status || "-"} tone="info" />
            <Text selectable style={styles.sectionTitle}>رحلتي الحالية</Text>
          </View>
          <InfoRow label="المسار" value={`${currentRide.pickup || "-"} ← ${currentRide.destination || "-"}`} accent />
          <MobileButton title="فتح الرحلة" compact variant="accent" onPress={goToCurrent} />
        </MobileCard>
      ) : null}

      <View style={styles.actionGrid}>
        <MobileCard tone="action" compact onPress={goToAvailable} style={styles.actionTile}>
          <Text selectable style={styles.actionNumber}>{availableCount}</Text>
          <Text selectable style={styles.actionLabel}>الطلبات</Text>
        </MobileCard>
        <MobileCard tone="flat" compact onPress={goToCurrent} style={styles.actionTile}>
          <Text selectable style={styles.actionNumber}>↗</Text>
          <Text selectable style={styles.actionLabel}>رحلتي</Text>
        </MobileCard>
        <MobileCard tone="flat" compact onPress={goToEarnings} style={styles.actionTile}>
          <Text selectable style={styles.actionNumber}>₪</Text>
          <Text selectable style={styles.actionLabel}>الأرباح</Text>
        </MobileCard>
        <MobileCard tone="flat" compact onPress={goToSupport} style={styles.actionTile}>
          <Text selectable style={styles.actionNumber}>?</Text>
          <Text selectable style={styles.actionLabel}>الدعم</Text>
        </MobileCard>
      </View>

      <MobileCard tone="glass">
        <InfoRow label="التحديث المباشر" value={socketStatus === "connected" ? "متصل" : "يدوي"} />
        <MobileButton title="خروج" compact variant="danger" onPress={logout} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cockpit: { gap: spacing.md, paddingVertical: spacing.lg, borderColor: depth.greenLine },
  cockpitTop: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  identity: { alignItems: "flex-end", gap: 3 },
  role: { color: colors.green, fontSize: 13, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  name: { color: colors.text, fontWeight: "900", fontSize: 27, textAlign: "right", writingDirection: "rtl" },
  vehicle: { color: colors.muted, textAlign: "right", fontWeight: "800", fontSize: 12, writingDirection: "rtl" },
  availabilityStrip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: depth.hairline,
    backgroundColor: "rgba(0, 0, 0, 0.16)"
  },
  availabilityCopy: { flex: 1, alignItems: "flex-end", gap: 3 },
  stats: { flexDirection: "row-reverse", gap: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  helper: { color: colors.muted, textAlign: "right", lineHeight: 19, fontWeight: "700", fontSize: 12, writingDirection: "rtl" },
  error: { color: colors.red, textAlign: "right", fontWeight: "800", fontSize: 12, writingDirection: "rtl" },
  toggle: {
    width: 60,
    height: 34,
    borderRadius: radii.pill,
    padding: 4,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.075)",
    borderWidth: 1,
    borderColor: depth.hairline
  },
  toggleOn: { alignItems: "flex-end", backgroundColor: "rgba(66, 231, 157, 0.16)", borderColor: "rgba(66, 231, 157, 0.4)", boxShadow: shadows.glow },
  toggleSaving: { opacity: 0.6 },
  toggleKnob: { width: 24, height: 24, borderRadius: radii.pill, backgroundColor: colors.muted },
  toggleKnobOn: { backgroundColor: colors.green },
  currentRideCard: { gap: spacing.xs },
  rowBetween: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  actionGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm },
  actionTile: { width: "47.5%", minHeight: 96, justifyContent: "space-between" },
  actionNumber: { color: colors.primary, fontSize: 23, fontWeight: "900", textAlign: "right" },
  actionLabel: { color: colors.text, fontSize: 14, fontWeight: "900", textAlign: "right", writingDirection: "rtl" }
});
