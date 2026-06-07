import { StyleSheet, Text, View } from "react-native";
import { BrandMark, MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { useRegisterCustomer } from "../../hooks/useRegisterCustomer";
import { colors, depth, shadows, spacing } from "../../utils/mobileTheme";

export function RegisterScreen() {
  const { form, update, status, error, submit, goToLogin } = useRegisterCustomer();

  return (
    <ScreenContainer showHeader={false}>
      <View style={styles.header}>
        <BrandMark compact />
        <Text selectable style={styles.title}>حساب زبون جديد</Text>
        <Text selectable style={styles.subtitle}>بيانات أساسية ثم تفعيل سريع برمز OTP التجريبي.</Text>
      </View>
      <MobileCard tone="glass" style={styles.form}>
        <MobileInput label="الاسم الكامل" value={form.fullName} onChangeText={(value) => update("fullName", value)} />
        <MobileInput label="رقم الهاتف" value={form.phone} onChangeText={(value) => update("phone", value)} keyboardType="phone-pad" />
        <MobileInput label="المدينة" value={form.city} onChangeText={(value) => update("city", value)} placeholder="nablus" />
        <View style={styles.row}>
          <View style={styles.flex}><MobileInput label="العمر" value={form.age} onChangeText={(value) => update("age", value)} keyboardType="numeric" /></View>
          <View style={styles.flex}><MobileInput label="تاريخ الميلاد" value={form.birthDate} onChangeText={(value) => update("birthDate", value)} placeholder="1996-01-01" /></View>
        </View>
        <MobileInput label="كلمة السر" value={form.password} onChangeText={(value) => update("password", value)} secureTextEntry />
        <MobileInput label="تأكيد كلمة السر" value={form.confirmPassword} onChangeText={(value) => update("confirmPassword", value)} secureTextEntry />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري الإنشاء..." : "إنشاء الحساب"} onPress={submit} loading={status === "loading"} />
        <MobileButton title="رجوع إلى الدخول" compact variant="secondary" onPress={goToLogin} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, alignItems: "flex-end", paddingTop: spacing.md },
  title: { color: colors.text, fontSize: 23, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "right" },
  form: { gap: spacing.sm, backgroundColor: "rgba(255,255,255,0.052)", borderColor: depth.violetLine, boxShadow: shadows.glow },
  row: { flexDirection: "row-reverse", gap: spacing.sm },
  flex: { flex: 1 },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" }
});
