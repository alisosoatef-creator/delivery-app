import { StyleSheet, View } from "react-native";
import { V3Badge, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

export function DriverEarningsScreen() {
  const todayEarnings = 0;
  const totalEarnings = 0;
  const completedRides = 0;
  const stats = [
    { label: "أرباح اليوم", value: money(todayEarnings), hint: "تجريبي", tone: "primary" },
    { label: "رحلات مكتملة", value: String(completedRides), hint: "حتى الآن", tone: "success" },
    { label: "قيد التحويل", value: money(0), hint: "لاحقا", tone: "blue" },
    { label: "متوسط الرحلة", value: money(0), hint: "تقديري", tone: "warning" }
  ];

  return (
    <V3Screen>
      <V3SectionHeader
        meta="محفظة الكابتن"
        title="الأرباح"
        subtitle="ملخص سريع لأداء اليوم والعمليات المالية."
      />

      <V3Card tone="blue" contentStyle={styles.hero}>
        <View style={styles.heroHeader}>
          <V3Badge label="تجريبي" tone="warning" />
          <V3Text variant="label" tone="muted">إجمالي الأرباح</V3Text>
        </View>
        <V3Text selectable variant="title" tone="success" style={styles.total}>
          {money(totalEarnings)}
        </V3Text>
        <V3Text tone="muted">
          الأرقام الحالية للتجربة وسيتم ربط التسويات المالية لاحقا.
        </V3Text>
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

      <V3Card tone="raised">
        <V3SectionHeader
          title="سجل العمليات"
          subtitle="آخر عمليات المحفظة والتسويات عند توفرها."
        />
        <View style={styles.ledgerRow}>
          <V3Text variant="caption" tone="muted">طريقة الحساب</V3Text>
          <V3Badge label="تجريبية الآن" tone="blue" />
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
  hero: {
    gap: v3Spacing.md
  },
  heroHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm
  },
  total: {
    fontSize: 42,
    lineHeight: 48,
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
  ledgerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm,
    padding: v3Spacing.sm,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.whiteSoft
  },
  emptyState: {
    alignItems: "flex-end",
    gap: v3Spacing.xs,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.whiteSoft,
    padding: v3Spacing.md
  }
});
