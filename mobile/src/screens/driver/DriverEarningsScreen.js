import { Text } from "react-native";
import { MobileBadge, MobileCard, ScreenContainer } from "../../components/ui";
import { colors } from "../../utils/mobileTheme";

export function DriverEarningsScreen() {
  return (
    <ScreenContainer title="أرباح الكابتن" subtitle="واجهة مبدئية. الربط التفصيلي بمحفظة الكابتن موجود في الويب وسيكتمل للموبايل لاحقًا.">
      <MobileCard>
        <MobileBadge label="Foundation" tone="warning" />
        <Text selectable style={{ color: colors.text, fontSize: 22, fontWeight: "900" }}>0 ₪</Text>
        <Text selectable style={{ color: colors.muted }}>TODO: ربط `/api/driver/earnings` بواجهة كاملة في المرحلة القادمة.</Text>
      </MobileCard>
    </ScreenContainer>
  );
}
