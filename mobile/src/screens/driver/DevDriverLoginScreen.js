import { StyleSheet, Text } from "react-native";
import { BrandMark, MobileBadge, MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { useDevDriverLogin } from "../../hooks/useDevDriverLogin";
import { colors, depth, shadows, spacing } from "../../utils/mobileTheme";

export function DevDriverLoginScreen() {
  const { drivers, driverId, setDriverId, phone, setPhone, error, submit, goToCustomerLogin } = useDevDriverLogin();

  return (
    <ScreenContainer showHeader={false}>
      <MobileCard tone="glass" style={styles.hero}>
        <BrandMark />
        <MobileBadge label="مدخل تجريبي" tone="warning" />
        <Text selectable style={styles.title}>مدخل الكابتن</Text>
        <Text selectable style={styles.subtitle}>هذا المدخل للتطوير فقط، ولا يفعّل طلبات الانضمام قبل موافقة الإدارة.</Text>
        <MobileInput label="Driver ID" value={driverId} onChangeText={setDriverId} placeholder={drivers[0]?.id || "driver_..."} />
        <MobileInput label="رقم الهاتف" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title="دخول لوحة الكابتن" onPress={submit} disabled={!driverId && !phone} />
        <MobileButton title="رجوع إلى دخول الزبون" compact variant="secondary" onPress={goToCustomerLogin} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "flex-end", borderColor: depth.violetLine, boxShadow: shadows.glow },
  title: { color: colors.text, fontSize: 21, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.muted, lineHeight: 20, textAlign: "right", marginBottom: spacing.xs, fontSize: 12 },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" }
});
