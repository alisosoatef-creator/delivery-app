import { Text, View } from "react-native";
import { MobileBadge, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function CustomerHomeScreen() {
  const { state, dispatch } = useMobileApp();
  return (
    <ScreenContainer title="واجهة الزبون" subtitle="أساس موبايل مرتبط بنفس Backend. الخريطة الأصلية ستأتي في المرحلة 26.">
      <MobileCard>
        <MobileBadge label="Customer" tone="success" />
        <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>{state.currentUser?.fullName || "زبون وصل"}</Text>
        <Text selectable style={{ color: colors.muted }}>اطلب رحلة، تابع سجل رحلاتك، وأرسل تذاكر الدعم من التطبيق.</Text>
      </MobileCard>
      <View style={{ gap: 10 }}>
        <MobileButton title="طلب رحلة" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} />
        {state.currentRide ? <MobileButton title="حالة الرحلة الحالية" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "ride-status" })} /> : null}
        <MobileButton title="رحلاتي" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "rides" })} />
        <MobileButton title="المحفظة والدفع" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "wallet" })} />
        <MobileButton title="الدعم" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "support" })} />
      </View>
    </ScreenContainer>
  );
}
