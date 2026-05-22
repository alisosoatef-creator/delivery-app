import { StyleSheet, Text, View } from "react-native";
import { InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, SectionHeader, StatCard } from "../../components/ui";
import { clearMobileSession } from "../../services/sessionStorage";
import { disconnectMobileSocket } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { colors, spacing } from "../../utils/mobileTheme";

export function DriverHomeScreen() {
  const { state, dispatch } = useMobileApp();
  const driver = state.session?.driver || {};

  async function logout() {
    disconnectMobileSocket();
    await clearMobileSession();
    dispatch({ type: "logout", toast: "تم تسجيل خروج الكابتن." });
  }

  return (
    <ScreenContainer eyebrow="لوحة الكابتن" title="جاهز تستقبل الرحلات؟" subtitle="واجهة موبايل للكابتن مرتبطة بنفس الـ Backend ونفس جلسة التطوير.">
      <MobileCard tone="gold">
        <MobileBadge label={driver.status || "active"} tone="success" />
        <Text selectable style={styles.name}>{driver.fullName || state.currentUser?.fullName || "كابتن وصل"}</Text>
        <Text selectable style={styles.vehicle}>{driver.vehicleType || driver.vehicle || "مركبة"} · {driver.vehiclePlate || driver.plate || "بدون لوحة"}</Text>
        <InfoRow label="الجلسة" value="محفوظة محليًا" />
      </MobileCard>

      <View style={styles.stats}>
        <StatCard label="الحالة" value="نشط" hint="Development" />
        <StatCard label="التحديث" value={state.socketStatus === "connected" ? "مباشر" : "يدوي"} hint="Socket.IO" tone="blue" />
      </View>

      <MobileCard>
        <SectionHeader title="إجراءات الكابتن" subtitle="انتقل سريعًا للطلبات، الرحلة الحالية، الأرباح أو الدعم." />
        <View style={styles.actions}>
          <MobileButton title="الرحلات المتاحة" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "available" })} />
          <MobileButton title="رحلتي الحالية" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "current" })} />
          <MobileButton title="الأرباح" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "earnings" })} />
          <MobileButton title="الدعم" variant="ghost" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "support" })} />
          <MobileButton title="تسجيل خروج الكابتن" variant="danger" onPress={logout} />
        </View>
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontWeight: "900", fontSize: 25, textAlign: "right" },
  vehicle: { color: colors.muted, textAlign: "right", fontWeight: "800" },
  stats: { flexDirection: "row-reverse", gap: spacing.sm },
  actions: { gap: spacing.sm }
});
