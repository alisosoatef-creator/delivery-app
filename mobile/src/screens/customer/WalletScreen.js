import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
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
    <ScreenContainer title="الدفع" subtitle="محفظة وتجربة VISA مؤقتة بدون حفظ بيانات حساسة." compact>
      {status === "loading" ? <LoadingState /> : null}
      <MobileCard tone="soft" style={styles.balanceCard}>
        <MobileBadge label="دفع إلكتروني تجريبي" tone="info" />
        <Text selectable style={styles.label}>رصيد المحفظة</Text>
        <Text selectable style={styles.balance}>{money(wallet?.balanceIls ?? wallet?.balance)}</Text>
        <Text selectable style={styles.caption}>لا يتم حفظ CVV أو رقم بطاقة كامل. يتم حفظ آخر 4 أرقام فقط عند الحاجة.</Text>
      </MobileCard>
      <MobileCard tone="flat">
        <Text selectable style={styles.sectionTitle}>آخر العمليات</Text>
        {!wallet?.transactions?.length ? <EmptyState title="لا توجد عمليات" message="ستظهر عمليات الدفع أو الاسترداد هنا." /> : null}
        {wallet?.transactions?.map((item) => (
          <InfoRow key={item.id} label={item.type} value={money(item.amount)} />
        ))}
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  balanceCard: { gap: spacing.xs },
  label: { color: colors.muted, textAlign: "right", fontSize: 13, fontWeight: "700" },
  balance: { color: colors.primary, fontSize: 36, fontWeight: "800", textAlign: "right" },
  caption: { color: colors.muted, textAlign: "right", lineHeight: 21, fontWeight: "600" },
  sectionTitle: { color: colors.text, textAlign: "right", fontSize: 16, fontWeight: "800" }
});
