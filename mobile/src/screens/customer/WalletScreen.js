import { useEffect, useState } from "react";
import { Text } from "react-native";
import { EmptyState, LoadingState, MobileBadge, MobileCard, ScreenContainer } from "../../components/ui";
import { fetchCustomerWallet } from "../../services/paymentsApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors } from "../../utils/mobileTheme";

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
    <ScreenContainer title="المحفظة" subtitle="الدفع الإلكتروني تجريبي ولا يتم حفظ CVV أو رقم بطاقة كامل.">
      {status === "loading" ? <LoadingState /> : null}
      <MobileCard>
        <MobileBadge label="VISA Placeholder" tone="warning" />
        <Text selectable style={{ color: colors.text, fontSize: 24, fontWeight: "900" }}>{wallet?.balanceIls ?? wallet?.balance ?? 0} ₪</Text>
        <Text selectable style={{ color: colors.muted }}>الرصيد مبدئي للتطوير فقط.</Text>
      </MobileCard>
      {!wallet?.transactions?.length ? <EmptyState title="لا توجد عمليات محفظة" /> : null}
    </ScreenContainer>
  );
}
