import { Text, View } from "react-native";
import { MobileBadge, MobileButton, MobileCard, ScreenContainer } from "../../components/ui";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

export function DriverHomeScreen() {
  const { state, dispatch } = useMobileApp();
  const driver = state.session?.driver || {};
  return (
    <ScreenContainer title="لوحة الكابتن" subtitle="Foundation موبايل للكابتن، مرتبطة بواجهات Backend نفسها.">
      <MobileCard>
        <MobileBadge label={driver.status || "active"} tone="success" />
        <Text selectable style={{ color: colors.text, fontWeight: "900", fontSize: 18 }}>{driver.fullName || state.currentUser?.fullName || "كابتن وصل"}</Text>
        <Text selectable style={{ color: colors.muted }}>{driver.vehicleType || driver.vehicle || "مركبة"} - {driver.vehiclePlate || driver.plate || "بدون لوحة"}</Text>
      </MobileCard>
      <View style={{ gap: 10 }}>
        <MobileButton title="الرحلات المتاحة" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "available" })} />
        <MobileButton title="رحلتي الحالية" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "current" })} />
        <MobileButton title="الأرباح" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "earnings" })} />
        <MobileButton title="الدعم" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "support" })} />
      </View>
    </ScreenContainer>
  );
}
