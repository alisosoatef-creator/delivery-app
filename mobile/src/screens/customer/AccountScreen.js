import { StyleSheet, Text, View } from "react-native";
import { InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, SectionHeader } from "../../components/ui";
import { logoutCustomer } from "../../services/authApi";
import { clearMobileSession } from "../../services/sessionStorage";
import { disconnectMobileSocket } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { colors, depth, radii, shadows } from "../../utils/mobileTheme";

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
    <ScreenContainer eyebrow="الملف الشخصي" title="حسابي" subtitle="بيانات الدخول وخيارات الحساب بشكل مختصر.">
      <MobileCard tone="glass" style={styles.profileCard}>
        <View style={styles.profileTop}>
          <View style={styles.avatar}><Text selectable={false} style={styles.avatarText}>ز</Text></View>
          <MobileBadge label="زبون" tone="success" />
        </View>
        <Text selectable style={styles.name}>{user.fullName || user.name || "زبون"}</Text>
        <Text selectable style={styles.phone}>{user.phone || "-"}</Text>
      </MobileCard>

      <MobileCard tone="glass">
        <SectionHeader title="تفاصيل الحساب" subtitle="معلومات أساسية دون أي بيانات حساسة." />
        <InfoRow label="المدينة" value={user.city || state.selectedCity || "-"} accent />
        <InfoRow label="العمر" value={user.age ? String(user.age) : "-"} />
        <InfoRow label="نوع الحساب" value="زبون" />
      </MobileCard>

      <MobileButton title="تسجيل الخروج" variant="danger" onPress={logout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: { gap: 7, borderColor: depth.violetLine, boxShadow: shadows.glow },
  profileTop: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  avatar: { width: 42, height: 42, borderRadius: radii.lg, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", boxShadow: shadows.glow },
  avatarText: { color: colors.black, fontWeight: "900", fontSize: 17 },
  name: { color: colors.text, fontWeight: "900", fontSize: 20, textAlign: "right" },
  phone: { color: colors.muted, textAlign: "right", fontWeight: "800", fontSize: 12 }
});
