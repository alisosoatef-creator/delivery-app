import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, StatCard } from "../../components/ui";
import { clearMobileSession } from "../../services/sessionStorage";
import { disconnectMobileSocket } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { colors, money, spacing } from "../../utils/mobileTheme";

export function DriverHomeScreen() {
  const { state, dispatch } = useMobileApp();
  const driver = state.session?.driver || {};
  const [available, setAvailable] = useState((driver.onlineStatus || state.currentUser?.onlineStatus || "online") !== "offline");
  const availableCount = state.availableRides?.length || 0;
  const currentRide = state.currentRide;

  async function logout() {
    disconnectMobileSocket();
    await clearMobileSession();
    dispatch({ type: "logout", toast: "تم تسجيل خروج الكابتن." });
  }

  return (
    <ScreenContainer showHeader={false}>
      <View style={styles.header}>
        <MobileBadge label={available ? "متاح لاستقبال الطلبات" : "غير متاح"} tone={available ? "success" : "warning"} />
        <Text selectable style={styles.title}>لوحة الكابتن</Text>
        <Text selectable style={styles.name}>{driver.fullName || state.currentUser?.fullName || "كابتن وصل"}</Text>
        <Text selectable style={styles.vehicle}>{driver.vehicleType || driver.vehicle || "مركبة"} · {driver.vehiclePlate || driver.plate || "بدون لوحة"}</Text>
      </View>

      <View style={styles.stats}>
        <StatCard label="طلبات متاحة" value={String(availableCount)} hint={available ? "جاهز" : "متوقف"} tone={available ? "green" : "warning"} />
        <StatCard label="اليوم" value={money(0)} hint="أرباح تجريبية" />
      </View>

      <MobileCard tone={available ? "soft" : "flat"} style={styles.availabilityCard}>
        <View style={styles.availabilityHeader}>
          <View style={styles.availabilityCopy}>
            <Text selectable style={styles.sectionTitle}>حالة التوفر</Text>
            <Text selectable style={styles.helper}>{available ? "أنت متاح الآن، ويمكنك متابعة الطلبات الجديدة." : "أنت غير متاح. استقبال الطلبات قد يتوقف مؤقتًا."}</Text>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: available }}
            accessibilityLabel="تبديل حالة توفر الكابتن"
            onPress={() => setAvailable((value) => !value)}
            style={[styles.toggle, available && styles.toggleOn]}
          >
            <View style={[styles.toggleKnob, available && styles.toggleKnobOn]} />
          </Pressable>
        </View>
      </MobileCard>

      {currentRide ? (
        <MobileCard tone="soft" style={styles.currentRideCard}>
          <Text selectable style={styles.sectionTitle}>رحلتي الحالية</Text>
          <Text selectable numberOfLines={1} style={styles.helper}>{currentRide.pickup || "-"} ← {currentRide.destination || "-"}</Text>
          <InfoRow label="الحالة" value={currentRide.status || "-"} accent />
          <MobileButton title="فتح الرحلة" compact variant="accent" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "current" })} />
        </MobileCard>
      ) : null}

      <MobileCard tone="soft">
        <Text selectable style={styles.sectionTitle}>إجراءات سريعة</Text>
        <View style={styles.actions}>
          <MobileButton title="عرض الطلبات" variant="accent" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "available" })} />
          <MobileButton title="رحلتي الحالية" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "current" })} />
        </View>
        <InfoRow label="التحديث المباشر" value={state.socketStatus === "connected" ? "متصل" : "يدوي"} />
      </MobileCard>

      <View style={styles.secondaryActions}>
        <MobileButton title="الأرباح" compact variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "earnings" })} />
        <MobileButton title="الدعم" compact variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "support" })} />
        <MobileButton title="خروج" compact variant="danger" onPress={logout} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "flex-end", gap: spacing.xs, paddingTop: spacing.sm },
  title: { color: colors.primary, fontSize: 14, fontWeight: "700", textAlign: "right" },
  name: { color: colors.text, fontWeight: "800", fontSize: 28, textAlign: "right" },
  vehicle: { color: colors.muted, textAlign: "right", fontWeight: "600" },
  stats: { flexDirection: "row-reverse", gap: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800", textAlign: "right" },
  helper: { color: colors.muted, textAlign: "right", lineHeight: 20, fontWeight: "700" },
  availabilityCard: { gap: spacing.xs },
  availabilityHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  availabilityCopy: { flex: 1, alignItems: "flex-end", gap: 3 },
  toggle: {
    width: 58,
    height: 34,
    borderRadius: 999,
    padding: 4,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.border
  },
  toggleOn: {
    alignItems: "flex-end",
    backgroundColor: "rgba(66, 231, 156, 0.16)",
    borderColor: "rgba(66, 231, 156, 0.4)"
  },
  toggleKnob: { width: 24, height: 24, borderRadius: 999, backgroundColor: colors.muted },
  toggleKnobOn: { backgroundColor: colors.green },
  currentRideCard: { gap: spacing.xs },
  actions: { gap: spacing.sm },
  secondaryActions: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs }
});
