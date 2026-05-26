import { StyleSheet, Text, View } from "react-native";
import { MobileBadge, MobileCard, ScreenContainer, SectionHeader, StatCard } from "../../components/ui";
import { colors, money, spacing } from "../../utils/mobileTheme";

export function DriverEarningsScreen() {
  return (
    <ScreenContainer eyebrow="محفظة الكابتن" title="الأرباح" subtitle="ملخص سريع لأرباحك وعملياتك داخل التطبيق.">
      <MobileCard tone="gold">
        <MobileBadge label="تجريبي" tone="warning" />
        <Text selectable style={styles.total}>{money(0)}</Text>
        <Text selectable style={styles.caption}>الأرقام الحالية مبدئية للتجربة، وسيتم توسيع تفاصيل الأرباح لاحقًا.</Text>
      </MobileCard>
      <View style={styles.stats}>
        <StatCard label="اليوم" value={money(0)} hint="تجريبي" />
        <StatCard label="رحلات مكتملة" value="0" hint="حتى الآن" tone="green" />
      </View>
      <MobileCard>
        <SectionHeader title="سجل العمليات" subtitle="ستظهر عمليات المحفظة والتحويلات هنا عند اكتمال الربط المالي." />
        <Text selectable style={styles.caption}>لا توجد عمليات أرباح بعد.</Text>
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  total: { color: colors.text, fontSize: 42, fontWeight: "900", textAlign: "right" },
  caption: { color: colors.muted, textAlign: "right", lineHeight: 22, fontWeight: "800" },
  stats: { flexDirection: "row-reverse", gap: spacing.sm }
});
