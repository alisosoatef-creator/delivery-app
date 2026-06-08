import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Input, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useRegisterCustomer } from "../../hooks/useRegisterCustomer";
import { v3Spacing } from "../../theme/v3";

export function RegisterScreen() {
  const { form, update, status, error, submit, goToLogin } = useRegisterCustomer();

  return (
    <V3Screen>
      <V3SectionHeader
        meta="حساب جديد"
        title="انضم إلى واصل"
        subtitle="بيانات أساسية ثم تفعيل سريع برمز OTP التجريبي."
        actionLabel="لدي حساب"
        onAction={goToLogin}
      />

      <V3Card tone="accent" contentStyle={styles.form}>
        <View style={styles.formTop}>
          <V3Badge label="تفعيل سريع" tone="blue" />
          <V3Text variant="subtitle">بيانات الزبون</V3Text>
        </View>

        <V3Input label="الاسم الكامل" value={form.fullName} onChangeText={(value) => update("fullName", value)} />
        <V3Input label="رقم الهاتف" value={form.phone} onChangeText={(value) => update("phone", value)} keyboardType="phone-pad" />
        <V3Input label="المدينة" value={form.city} onChangeText={(value) => update("city", value)} placeholder="nablus" />

        <View style={styles.row}>
          <View style={styles.flex}>
            <V3Input label="العمر" value={form.age} onChangeText={(value) => update("age", value)} keyboardType="numeric" />
          </View>
          <View style={styles.flex}>
            <V3Input label="تاريخ الميلاد" value={form.birthDate} onChangeText={(value) => update("birthDate", value)} placeholder="1996-01-01" />
          </View>
        </View>

        <V3Input label="كلمة السر" value={form.password} onChangeText={(value) => update("password", value)} secureTextEntry />
        <V3Input label="تأكيد كلمة السر" value={form.confirmPassword} onChangeText={(value) => update("confirmPassword", value)} secureTextEntry />

        {error ? <V3Text selectable tone="danger">{error}</V3Text> : null}
        <V3Button
          title={status === "loading" ? "جاري الإنشاء..." : "إنشاء الحساب"}
          onPress={submit}
          loading={status === "loading"}
        />
        <V3Button title="رجوع إلى الدخول" size="sm" variant="secondary" onPress={goToLogin} />
      </V3Card>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: v3Spacing.sm
  },
  formTop: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm
  },
  row: {
    flexDirection: "row-reverse",
    gap: v3Spacing.sm
  },
  flex: {
    flex: 1,
    minWidth: 0
  }
});
