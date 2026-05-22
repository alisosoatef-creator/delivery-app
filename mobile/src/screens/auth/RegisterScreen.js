import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BrandMark, MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { registerCustomer } from "../../services/authApi";
import { useMobileApp } from "../../store/mobileStore";
import { colors, spacing } from "../../utils/mobileTheme";

export function RegisterScreen() {
  const { dispatch } = useMobileApp();
  const [form, setForm] = useState({ fullName: "", phone: "", city: "nablus", age: "", birthDate: "", password: "", confirmPassword: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    setError("");
    if (!form.fullName || !form.phone || !form.city || !form.age || !form.birthDate || !form.password) {
      setError("أكمل الحقول المطلوبة.");
      return;
    }
    if (Number(form.age) < 16 || Number(form.age) > 90) {
      setError("العمر غير منطقي.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("كلمتا السر غير متطابقتين.");
      return;
    }
    setStatus("loading");
    try {
      await registerCustomer({ ...form, age: Number(form.age) });
      dispatch({ type: "pendingPhone", phone: form.phone });
      dispatch({ type: "navigate", area: "auth", screen: "otp" });
    } catch (requestError) {
      setError(requestError.message || "تعذر إنشاء الحساب.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <ScreenContainer showHeader={false}>
      <View style={styles.header}>
        <BrandMark compact />
        <Text selectable style={styles.title}>حساب زبون جديد</Text>
        <Text selectable style={styles.subtitle}>املأ البيانات الأساسية ثم فعّل الحساب برمز OTP التجريبي.</Text>
      </View>
      <MobileCard tone="flat" style={styles.form}>
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
        <MobileButton title="رجوع إلى الدخول" compact variant="secondary" onPress={() => dispatch({ type: "navigate", area: "auth", screen: "login" })} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, alignItems: "flex-end", paddingTop: spacing.sm },
  title: { color: colors.text, fontSize: 25, fontWeight: "800", textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "right" },
  form: { gap: spacing.sm },
  row: { flexDirection: "row-reverse", gap: spacing.sm },
  flex: { flex: 1 },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" }
});
