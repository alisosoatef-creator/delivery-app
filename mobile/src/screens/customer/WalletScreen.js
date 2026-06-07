import { StyleSheet, Text, View } from "react-native";
import { EmptyState, InfoRow, LoadingState, MobileBadge, MobileCard, ScreenContainer, SectionHeader } from "../../components/ui";
import { useCustomerWallet } from "../../hooks/useCustomerWallet";
import { money } from "../../utils/formatters";
import { colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";

export function WalletScreen() {
  const { wallet, status } = useCustomerWallet();

  return (
    <ScreenContainer title="المحفظة" subtitle="رصيد واضح وعمليات الدفع داخل التطبيق." compact>
      {status === "loading" ? <LoadingState message="جاري تحميل المحفظة..." /> : null}

      <MobileCard tone="command" style={styles.balanceOverview}>
        <View style={styles.balanceHeader}>
          <MobileBadge label="دفع تجريبي" tone="info" />
          <Text selectable style={styles.label}>الرصيد المتاح</Text>
        </View>
        <Text selectable style={styles.balance}>{money(wallet?.balanceIls ?? wallet?.balance)}</Text>
        <View style={styles.walletRails}>
          <Text selectable style={styles.walletRail}>نقدا</Text>
          <Text selectable style={styles.walletRail}>بطاقة تجريبية</Text>
          <Text selectable style={styles.walletRail}>محفظة</Text>
        </View>
        <Text selectable style={styles.caption}>الدفع الإلكتروني تجريبي الآن، ولا يتم حفظ بيانات بطاقة حساسة.</Text>
      </MobileCard>

      <MobileCard tone="glass" style={styles.transactionsCard}>
        <SectionHeader title="آخر العمليات" subtitle="تظهر المدفوعات والاستردادات هنا عند توفرها." />
        {!wallet?.transactions?.length ? <EmptyState title="لا توجد عمليات" message="ستظهر عمليات الدفع أو الاسترداد هنا عند توفرها." /> : null}
        {wallet?.transactions?.map((item) => (
          <View key={item.id} style={styles.transaction}>
            <InfoRow label={item.type || "عملية"} value={money(item.amount)} accent />
          </View>
        ))}
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  balanceOverview: { gap: spacing.sm, borderColor: depth.violetLine, boxShadow: shadows.glow },
  balanceHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  label: { color: colors.muted, textAlign: "right", fontSize: 13, fontWeight: "800", writingDirection: "rtl" },
  balance: { color: colors.text, fontSize: 40, fontWeight: "900", textAlign: "right" },
  walletRails: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs },
  walletRail: {
    color: colors.textSoft,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: depth.hairline,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    fontWeight: "900",
    fontSize: 11.5,
    overflow: "hidden"
  },
  caption: { color: colors.muted, textAlign: "right", lineHeight: 20, fontWeight: "700", fontSize: 12.5, writingDirection: "rtl" },
  transactionsCard: { gap: spacing.xs },
  transaction: { borderTopWidth: 1, borderTopColor: depth.hairline, paddingVertical: spacing.xs }
});
