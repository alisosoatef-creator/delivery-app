import { StyleSheet, Text, View } from "react-native";
import { EmptyState, InfoRow, MobileBadge, MobileCard, ScreenContainer, SectionHeader, StatCard } from "../../components/ui";
import { money } from "../../utils/formatters";
import { colors, depth, shadows, spacing } from "../../utils/mobileTheme";

export function DriverEarningsScreen() {
  const todayEarnings = 0;
  const totalEarnings = 0;
  const completedRides = 0;

  return (
    <ScreenContainer eyebrow="محفظة الكابتن" title="الأرباح" subtitle="ملخص سريع لأداء اليوم والعمليات المالية.">
      <MobileCard tone="command" style={styles.hero}>
        <View style={styles.heroHeader}>
          <MobileBadge label="تجريبي" tone="warning" />
          <Text selectable style={styles.heroLabel}>إجمالي الأرباح</Text>
        </View>
        <Text selectable style={styles.total}>{money(totalEarnings)}</Text>
        <Text selectable style={styles.caption}>الأرقام الحالية للتجربة وسيتم ربط التسويات المالية لاحقا.</Text>
      </MobileCard>

      <View style={styles.stats}>
        <StatCard label="أرباح اليوم" value={money(todayEarnings)} hint="تجريبي" />
        <StatCard label="رحلات مكتملة" value={String(completedRides)} hint="حتى الآن" tone="green" />
      </View>
      <View style={styles.stats}>
        <StatCard label="قيد التحويل" value={money(0)} hint="لاحقا" tone="blue" />
        <StatCard label="متوسط الرحلة" value={money(0)} hint="تقديري" tone="gold" />
      </View>

      <MobileCard tone="glass">
        <SectionHeader title="سجل العمليات" subtitle="آخر عمليات المحفظة والتسويات عند توفرها." />
        <InfoRow label="طريقة الحساب" value="تجريبية الآن" accent />
        <InfoRow label="الدفع النقدي" value="يظهر بعد إنهاء الرحلات" />
        <EmptyState title="لا توجد عمليات أرباح بعد" message="عند إنهاء الرحلات ستظهر العمليات هنا بشكل مختصر." />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm, borderColor: depth.greenLine, boxShadow: shadows.glow },
  heroHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  heroLabel: { color: colors.text, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  total: { color: colors.green, fontSize: 40, fontWeight: "900", textAlign: "right" },
  caption: { color: colors.muted, textAlign: "right", lineHeight: 20, fontWeight: "800", fontSize: 12, writingDirection: "rtl" },
  stats: { flexDirection: "row-reverse", gap: spacing.sm }
});
