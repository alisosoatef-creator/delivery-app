import { StyleSheet, Text } from "react-native";
import { InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, SectionHeader } from "../../components/ui";
import { logoutCustomer } from "../../services/authApi";
import { clearMobileSession } from "../../services/sessionStorage";
import { disconnectMobileSocket } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function AccountScreen() {
  const { state, dispatch } = useMobileApp();
  const user = state.currentUser || {};

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
    <ScreenContainer eyebrow="الملف الشخصي" title="حسابي" subtitle="بياناتك الأساسية وخيارات الخروج الآمن من التطبيق.">
      <MobileCard tone="gold" style={styles.profileCard}>
        <MobileBadge label="زبون" tone="success" />
        <Text selectable style={styles.name}>{user.fullName || user.name || "زبون"}</Text>
        <Text selectable style={styles.phone}>{user.phone || "-"}</Text>
      </MobileCard>

      <MobileCard tone="flat">
        <SectionHeader title="تفاصيل الحساب" subtitle="نحافظ على بيانات الدخول بدون عرض معلومات حساسة داخل الشاشة." />
        <InfoRow label="المدينة" value={user.city || state.selectedCity || "-"} accent />
        <InfoRow label="العمر" value={user.age ? String(user.age) : "-"} />
        <InfoRow label="نوع الحساب" value="زبون" />
      </MobileCard>

      <MobileButton title="تسجيل الخروج" variant="danger" onPress={logout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: { gap: 6 },
  name: { color: colors.text, fontWeight: "900", fontSize: 24, textAlign: "right" },
  phone: { color: colors.muted, textAlign: "right", fontWeight: "800" }
});
