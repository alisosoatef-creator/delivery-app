import { Text } from "react-native";
import { MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function AccountScreen() {
  const { state, dispatch } = useMobileApp();
  return (
    <ScreenContainer title="حسابي" subtitle="إعدادات حساب الزبون الأساسية.">
      <MobileCard>
        <Text selectable style={{ color: colors.text, fontWeight: "900", fontSize: 18 }}>{state.currentUser?.fullName || state.currentUser?.name || "زبون"}</Text>
        <Text selectable style={{ color: colors.muted }}>{state.currentUser?.phone || "-"}</Text>
        <Text selectable style={{ color: colors.muted }}>الدور: {state.role}</Text>
      </MobileCard>
      <MobileButton title="تسجيل الخروج" variant="danger" onPress={() => dispatch({ type: "logout", toast: "تم تسجيل الخروج." })} />
    </ScreenContainer>
  );
}
