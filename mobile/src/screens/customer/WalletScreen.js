import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { EmptyState, InfoRow, LoadingState, MobileBadge, MobileCard, ScreenContainer, SectionHeader, StatCard } from "../../components/ui";
import { fetchCustomerWallet } from "../../services/paymentsApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors, money } from "../../utils/mobileTheme";

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
    <ScreenContainer eyebrow="الدفع والمحفظة" title="المحفظة" subtitle="الدفع الإلكتروني تجريبي ولا يتم حفظ CVV أو رقم بطاقة كامل.">
      {status === "loading" ? <LoadingState /> : null}
      <MobileCard tone="gold">
        <MobileBadge label="VISA Placeholder" tone="warning" />
        <Text selectable style={styles.balance}>{money(wallet?.balanceIls ?? wallet?.balance)}</Text>
        <Text selectable style={styles.caption}>الرصيد مبدئي للتطوير فقط، وسيتم ربط الشحن والدفع الحقيقي لاحقًا.</Text>
      </MobileCard>
      <StatCard label="أمان البطاقة" value="last4 فقط" hint="لا يتم حفظ CVV" tone="blue" />
      <MobileCard>
        <SectionHeader title="آخر العمليات" subtitle="سجل المحفظة والمدفوعات يظهر هنا عند توفر بيانات." />
        {!wallet?.transactions?.length ? <EmptyState title="لا توجد عمليات محفظة" message="ستظهر عمليات الدفع أو الاسترداد هنا." /> : null}
        {wallet?.transactions?.map((item) => (
          <InfoRow key={item.id} label={item.type} value={money(item.amount)} />
        ))}
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  balance: { color: colors.text, fontSize: 42, fontWeight: "900", textAlign: "right" },
  caption: { color: colors.muted, textAlign: "right", lineHeight: 22, fontWeight: "800" }
});
