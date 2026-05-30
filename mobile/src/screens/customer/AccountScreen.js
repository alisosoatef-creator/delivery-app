import { StyleSheet, Text, View } from "react-native";
import { InfoRow, MobileBadge, MobileButton, MobileCard, PressableScale, ScreenContainer, SectionHeader } from "../../components/ui";
import { logoutCustomer } from "../../services/authApi";
import { clearMobileSession } from "../../services/sessionStorage";
import { disconnectMobileSocket } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";

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
      <MobileCard tone="command" style={styles.profileCard}>
        <View style={styles.profileTop}>
          <View style={styles.avatar}><Text selectable={false} style={styles.avatarText}>ز</Text></View>
          <MobileBadge label="زبون" tone="success" />
        </View>
        <Text selectable style={styles.name}>{user.fullName || user.name || "زبون"}</Text>
        <Text selectable style={styles.phone}>{user.phone || "-"}</Text>
      </MobileCard>

      <View style={styles.actionGrid}>
        <PressableScale
          accessibilityLabel="المحفظة"
          onPress={() => dispatch({ type: "navigate", area: "customer", screen: "wallet" })}
          style={styles.actionTile}
          pressedStyle={styles.pressed}
        >
          <Text selectable={false} style={styles.actionGlyph}>₪</Text>
          <Text selectable style={styles.actionText}>المحفظة</Text>
        </PressableScale>
        <PressableScale
          accessibilityLabel="الدعم"
          onPress={() => dispatch({ type: "navigate", area: "customer", screen: "support" })}
          style={styles.actionTile}
          pressedStyle={styles.pressed}
        >
          <Text selectable={false} style={styles.actionGlyph}>?</Text>
          <Text selectable style={styles.actionText}>الدعم</Text>
        </PressableScale>
      </View>

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
  avatar: { width: 48, height: 48, borderRadius: radii.lg, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", boxShadow: shadows.glow },
  avatarText: { color: colors.black, fontWeight: "900", fontSize: 18 },
  name: { color: colors.text, fontWeight: "900", fontSize: 21, textAlign: "right", writingDirection: "rtl" },
  phone: { color: colors.muted, textAlign: "right", fontWeight: "800", fontSize: 12 },
  actionGrid: { flexDirection: "row-reverse", gap: spacing.sm },
  actionTile: {
    flex: 1,
    minHeight: 78,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: depth.hairline,
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    padding: spacing.md,
    alignItems: "flex-end",
    justifyContent: "space-between",
    boxShadow: shadows.soft
  },
  pressed: { opacity: 0.9 },
  actionGlyph: { color: colors.primary, fontSize: 18, fontWeight: "900" },
  actionText: { color: colors.text, fontWeight: "900", textAlign: "right", writingDirection: "rtl" }
});
