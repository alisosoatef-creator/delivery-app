import { StyleSheet, Text } from "react-native";
import { InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, SectionHeader } from "../../components/ui";
import { logoutCustomer } from "../../services/authApi";
import { clearMobileSession } from "../../services/sessionStorage";
import { disconnectMobileSocket } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function AccountScreen() {
  const { state, dispatch } = useMobileApp();

  async function logout() {
    try {
      await logoutCustomer(state.token);
    } catch {
      // Local cleanup remains required even when the development backend is offline.
    }
    disconnectMobileSocket();
    await clearMobileSession();
    dispatch({ type: "logout", toast: "تم تسجيل الخروج." });
  }

  return (
    <ScreenContainer eyebrow="الملف الشخصي" title="حسابي" subtitle="بيانات حسابك وخيارات الخروج الآمن من التطبيق.">
      <MobileCard tone="gold">
        <MobileBadge label="Customer" tone="success" />
        <Text selectable style={styles.name}>{state.currentUser?.fullName || state.currentUser?.name || "زبون"}</Text>
        <Text selectable style={styles.phone}>{state.currentUser?.phone || "-"}</Text>
      </MobileCard>
      <MobileCard>
        <SectionHeader title="تفاصيل الحساب" subtitle="لا يتم حفظ كلمة السر على الجهاز." />
        <InfoRow label="الدور" value={state.role} />
        <InfoRow label="المدينة" value={state.currentUser?.city || state.selectedCity || "-"} />
        <InfoRow label="حالة الدخول" value={state.token ? "محفوظة" : "غير محفوظة"} />
      </MobileCard>
      <MobileButton title="تسجيل الخروج" variant="danger" onPress={logout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontWeight: "900", fontSize: 24, textAlign: "right" },
  phone: { color: colors.muted, textAlign: "right", fontWeight: "800" }
});
