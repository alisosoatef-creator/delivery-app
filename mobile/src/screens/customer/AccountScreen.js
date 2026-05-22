import { Text } from "react-native";
import { MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
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
    <ScreenContainer title="حسابي" subtitle="إعدادات حساب الزبون الأساسية.">
      <MobileCard>
        <Text selectable style={{ color: colors.text, fontWeight: "900", fontSize: 18 }}>{state.currentUser?.fullName || state.currentUser?.name || "زبون"}</Text>
        <Text selectable style={{ color: colors.muted }}>{state.currentUser?.phone || "-"}</Text>
        <Text selectable style={{ color: colors.muted }}>الدور: {state.role}</Text>
      </MobileCard>
      <MobileButton title="تسجيل الخروج" variant="danger" onPress={logout} />
    </ScreenContainer>
  );
}
