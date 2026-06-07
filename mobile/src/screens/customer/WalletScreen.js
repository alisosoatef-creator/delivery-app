import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useCustomerWallet } from "../../hooks/useCustomerWallet";
import { money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

export function WalletScreen() {
  const { wallet, status, error, load } = useCustomerWallet();
  const transactions = wallet?.transactions || [];

  return (
    <V3Screen>
      <V3SectionHeader
        meta="المحفظة"
        title="رصيدك وعمليات الدفع"
        subtitle="متابعة هادئة للرصيد والمدفوعات داخل واصل."
        actionLabel="تحديث"
        onAction={load}
      />

      {status === "loading" ? (
        <V3Card tone="quiet" compact>
          <V3Text tone="muted">جاري تحميل المحفظة...</V3Text>
        </V3Card>
      ) : null}

      {error ? (
        <V3Card tone="quiet" compact style={styles.errorCard}>
          <V3Text selectable tone="danger">{error}</V3Text>
        </V3Card>
      ) : null}

      <V3Card tone="accent" contentStyle={styles.balanceContent}>
        <View style={styles.balanceHeader}>
          <V3Badge label="دفع تجريبي" tone="primary" />
          <V3Text variant="label" tone="muted">الرصيد المتاح</V3Text>
        </View>

        <V3Text selectable variant="title" style={styles.balance}>
          {money(wallet?.balanceIls ?? wallet?.balance)}
        </V3Text>

        <View style={styles.walletRails}>
          <V3Badge label="نقدا" tone="dark" />
          <V3Badge label="بطاقة تجريبية" tone="blue" />
          <V3Badge label="محفظة" tone="primary" />
        </View>

        <V3Text tone="muted">
          الدفع الإلكتروني تجريبي الآن، ولا يتم حفظ بيانات بطاقة حساسة.
        </V3Text>

        <V3Button
          title={status === "loading" ? "جاري التحديث" : "تحديث المحفظة"}
          variant="secondary"
          loading={status === "loading"}
          onPress={load}
        />
      </V3Card>

      <V3Card tone="raised">
        <V3SectionHeader
          title="آخر العمليات"
          subtitle="تظهر المدفوعات والاستردادات هنا عند توفرها."
        />

        {!transactions.length ? (
          <View style={styles.emptyState}>
            <V3Text variant="subtitle">لا توجد عمليات</V3Text>
            <V3Text tone="muted">ستظهر عمليات الدفع أو الاسترداد هنا عند توفرها.</V3Text>
          </View>
        ) : null}

        {transactions.map((item) => (
          <View key={item.id} style={styles.transaction}>
            <View style={styles.transactionCopy}>
              <V3Text variant="label" numberOfLines={1}>{item.type || "عملية"}</V3Text>
              <V3Text variant="caption" tone="muted">تم تسجيلها في المحفظة</V3Text>
            </View>
            <V3Badge label={money(item.amount)} tone="blue" />
          </View>
        ))}
      </V3Card>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  balanceContent: {
    gap: v3Spacing.md
  },
  balanceHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm
  },
  balance: {
    fontSize: 42,
    lineHeight: 48,
    color: v3Colors.white,
    fontVariant: ["tabular-nums"]
  },
  walletRails: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  },
  errorCard: {
    borderColor: "rgba(255, 97, 116, 0.42)"
  },
  emptyState: {
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.whiteSoft,
    padding: v3Spacing.md,
    gap: v3Spacing.xs,
    alignItems: "flex-end"
  },
  transaction: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm,
    paddingTop: v3Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: v3Colors.border
  },
  transactionCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  }
});
