import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmptyState, InfoRow, LoadingState, MobileBadge, MobileCard, ScreenContainer } from "../../components/ui";
import { fetchCustomerWallet } from "../../services/paymentsApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors, money, spacing } from "../../utils/mobileTheme";

export function WalletScreen() {
  const { state } = useMobileApp();
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchCustomerWallet({ phone: state.currentUser?.phone, userId: state.currentUser?.id, token: state.token })
      .then(setWallet)
      .catch(() => setWallet({ balance: 0, transactions: [] }))
      .finally(() => setStatus("idle"));
  }, [state.currentUser?.id, state.currentUser?.phone, state.token]);

  return (
    <ScreenContainer title="المحفظة" subtitle="رصيدك وطرق الدفع التجريبية داخل التطبيق." compact>
      {status === "loading" ? <LoadingState message="جاري تحميل المحفظة..." /> : null}

      <MobileCard tone="soft" style={styles.balanceOverview}>
        <View style={styles.balanceHeader}>
          <MobileBadge label="دفع إلكتروني تجريبي" tone="info" />
          <Text selectable style={styles.label}>رصيد المحفظة</Text>
        </View>
        <Text selectable style={styles.balance}>{money(wallet?.balanceIls ?? wallet?.balance)}</Text>
        <Text selectable style={styles.caption}>البطاقة داخل التطبيق للمعاينة فقط، وسيتم ربط الدفع الحقيقي لاحقًا بطريقة آمنة.</Text>
      </MobileCard>

      <MobileCard tone="flat">
        <Text selectable style={styles.sectionTitle}>آخر العمليات</Text>
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
  balanceOverview: { gap: spacing.xs },
  balanceHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  label: { color: colors.muted, textAlign: "right", fontSize: 13, fontWeight: "800" },
  balance: { color: colors.primary, fontSize: 36, fontWeight: "900", textAlign: "right" },
  caption: { color: colors.muted, textAlign: "right", lineHeight: 21, fontWeight: "600" },
  sectionTitle: { color: colors.text, textAlign: "right", fontSize: 16, fontWeight: "900" },
  transaction: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.xs }
});
