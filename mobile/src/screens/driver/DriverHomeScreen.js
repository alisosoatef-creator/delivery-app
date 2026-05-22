import { StyleSheet, Text, View } from "react-native";
import { InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, StatCard } from "../../components/ui";
import { clearMobileSession } from "../../services/sessionStorage";
import { disconnectMobileSocket } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { colors, money, spacing } from "../../utils/mobileTheme";

export function DriverHomeScreen() {
  const { state, dispatch } = useMobileApp();
  const driver = state.session?.driver || {};

  async function logout() {
    disconnectMobileSocket();
    await clearMobileSession();
    dispatch({ type: "logout", toast: "تم تسجيل خروج الكابتن." });
  }

  return (
    <ScreenContainer showHeader={false}>
      <View style={styles.header}>
        <MobileBadge label={driver.status || "active"} tone="success" />
        <Text selectable style={styles.title}>أهلًا كابتن</Text>
        <Text selectable style={styles.name}>{driver.fullName || state.currentUser?.fullName || "كابتن وصل"}</Text>
        <Text selectable style={styles.vehicle}>{driver.vehicleType || driver.vehicle || "مركبة"} · {driver.vehiclePlate || driver.plate || "بدون لوحة"}</Text>
      </View>

      <View style={styles.stats}>
        <StatCard label="التوفر" value="نشط" hint="جاهز" tone="green" />
        <StatCard label="اليوم" value={money(0)} hint="أرباح" />
      </View>

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
  actions: { gap: spacing.sm },
  secondaryActions: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs }
});
