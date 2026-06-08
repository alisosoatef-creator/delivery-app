import { StyleSheet, View } from "react-native";
import { V3Badge, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Shadows, v3Spacing } from "../../theme/v3";

export function DriverEarningsScreen() {
  const todayEarnings = 0;
  const totalEarnings = 0;
  const completedRides = 0;
  const stats = [
    { label: "أرباح اليوم", value: money(todayEarnings), hint: "اليوم", tone: "primary" },
    { label: "رحلات مكتملة", value: String(completedRides), hint: "حتى الآن", tone: "success" },
    { label: "قيد التحويل", value: money(0), hint: "قريبا", tone: "blue" },
    { label: "متوسط الرحلة", value: money(0), hint: "تقديري", tone: "warning" }
  ];

  return (
    <V3Screen contentStyle={styles.screen}>
      <V3SectionHeader
        meta="محفظة الكابتن"
        title="الأرباح"
        subtitle="ملخص سريع لأداء اليوم والعمليات المالية."
      />

      <V3Card tone="raised" style={styles.heroShell} contentStyle={styles.hero}>
        <View style={styles.heroHeader}>
          <V3Badge label="قيد الربط" tone="blue" />
          <V3Text variant="label" tone="muted">إجمالي الأرباح</V3Text>
        </View>
        <V3Text selectable variant="title" tone="success" style={styles.total}>
          {money(totalEarnings)}
        </V3Text>
        <V3Text tone="muted" numberOfLines={2}>تظهر التسويات المالية هنا عند تفعيل الربط الكامل.</V3Text>
      </V3Card>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <V3Card key={item.label} compact tone="quiet" style={styles.statCard}>
            <V3Badge label={item.hint} tone={item.tone} />
            <V3Text selectable variant="subtitle" style={styles.statValue}>{item.value}</V3Text>
            <V3Text variant="caption" tone="muted">{item.label}</V3Text>
          </V3Card>
        ))}
      </View>

      <V3Card tone="raised" contentStyle={styles.ledger}>
        <V3SectionHeader title="سجل العمليات" subtitle="آخر عمليات المحفظة والتسويات عند توفرها." />
        <View style={styles.ledgerRow}>
          <V3Text variant="caption" tone="muted">طريقة الحساب</V3Text>
          <V3Badge label="قيد التفعيل" tone="blue" />
        </View>
        <View style={styles.ledgerRow}>
          <V3Text variant="caption" tone="muted">الدفع النقدي</V3Text>
          <V3Text variant="caption" tone="soft">يظهر بعد إنهاء الرحلات</V3Text>
        </View>
        <View style={styles.emptyState}>
          <V3Badge label="لا توجد عمليات" tone="dark" />
          <V3Text variant="subtitle">لا توجد عمليات أرباح بعد</V3Text>
          <V3Text tone="muted">عند إنهاء الرحلات ستظهر العمليات هنا بشكل مختصر.</V3Text>
        </View>
      </V3Card>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: v3Spacing.sm
  },
  heroShell: {
    borderColor: "rgba(69, 224, 164, 0.16)",
    boxShadow: v3Shadows.soft
  },
  hero: {
    gap: v3Spacing.sm
  },
  heroHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm
  },
  total: {
    fontSize: 36,
    lineHeight: 42,
    fontVariant: ["tabular-nums"]
  },
  statsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.sm
  },
  statCard: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 132
  },
  statValue: {
    fontVariant: ["tabular-nums"]
  },
  ledger: {
    gap: v3Spacing.sm
  },
  ledgerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm,
    padding: v3Spacing.sm,
    borderRadius: v3Radius.md,
    backgroundColor: v3Alpha.blackScrim
  },
  emptyState: {
    alignItems: "flex-end",
    gap: v3Spacing.xs,
    borderRadius: v3Radius.md,
    backgroundColor: v3Alpha.blackScrim,
    padding: v3Spacing.sm
  }
});
