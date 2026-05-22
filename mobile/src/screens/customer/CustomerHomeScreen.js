import { Text, View } from "react-native";
import { MobileBadge, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { useCustomerActiveRide } from "../../hooks/useCustomerActiveRide";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";
import { isActiveRide, statusLabel } from "../../utils/rideStatus";

function acceptedDriverName(ride) {
  const visible = ["accepted", "driver_arriving", "arrived", "in_progress"].includes(ride?.status);
  return visible ? ride?.driver?.fullName || ride?.driverName || "" : "";
}

export function CustomerHomeScreen() {
  const { state, dispatch } = useMobileApp();
  const { refreshActiveRide } = useCustomerActiveRide();
  const activeRide = isActiveRide(state.currentRide) ? state.currentRide : null;
  const driverName = acceptedDriverName(activeRide);

  return (
    <ScreenContainer title="واجهة الزبون" subtitle="اطلب رحلة وتابع الرحلة النشطة من أي تبويب في التطبيق.">
      <MobileCard>
        <MobileBadge label="Customer" tone="success" />
        <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>{state.currentUser?.fullName || "زبون وصل"}</Text>
        <Text selectable style={{ color: colors.muted }}>اطلب رحلة، تابع سجل رحلاتك، وأرسل تذاكر الدعم من التطبيق.</Text>
      </MobileCard>

      {activeRide ? (
        <MobileCard tone="soft">
          <MobileBadge label={statusLabel(activeRide.status)} tone="warning" />
          <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>لديك رحلة نشطة</Text>
          <Text selectable style={{ color: colors.text, fontWeight: "800" }}>{activeRide.pickup} ← {activeRide.destination}</Text>
          <Text selectable style={{ color: colors.muted }}>السعر: {activeRide.price || activeRide.fareIls || 0} ₪</Text>
          {driverName ? <Text selectable style={{ color: colors.muted }}>الكابتن: {driverName}</Text> : null}
          <MobileButton title="متابعة الرحلة" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "ride-status" })} />
        </MobileCard>
      ) : null}

      {state.activeRideStatus === "loading" ? <Text selectable style={{ color: colors.muted }}>جاري فحص الرحلة النشطة...</Text> : null}
      {state.activeRideError ? <Text selectable style={{ color: colors.red }}>{state.activeRideError}</Text> : null}

      <View style={{ gap: 10 }}>
        <MobileButton title="طلب رحلة" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} />
        <MobileButton title="تحديث الرحلة النشطة" variant="secondary" onPress={refreshActiveRide} />
        <MobileButton title="رحلاتي" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "rides" })} />
        <MobileButton title="المحفظة والدفع" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "wallet" })} />
        <MobileButton title="الدعم" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "support" })} />
      </View>
    </ScreenContainer>
  );
}
