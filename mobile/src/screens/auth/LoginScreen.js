import { StyleSheet, Text, View } from "react-native";
import { BrandMark, MobileButton, MobileCard, MobileInput, ScreenContainer } from "../../components/ui";
import { useCustomerLogin } from "../../hooks/useCustomerLogin";
import { colors, depth, shadows, spacing } from "../../utils/mobileTheme";

export function LoginScreen() {
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
    status,
    error,
    isDev,
    submit,
    goToRegister,
    goToDevDriverLogin
  } = useCustomerLogin();

  return (
    <ScreenContainer showHeader={false}>
      <MobileCard tone="command" style={styles.hero}>
        <BrandMark />
        <Text selectable style={styles.title}>مشوارك التالي يبدأ بواجهة أوضح.</Text>
        <Text selectable style={styles.subtitle}>دخول سريع، طلب واضح، وتتبع مباشر للكابتن.</Text>
      </MobileCard>
      <MobileCard tone="glass" style={styles.form}>
        <MobileInput label="الاسم أو رقم الهاتف" value={identifier} onChangeText={setIdentifier} placeholder="+970..." />
        <MobileInput label="كلمة السر" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title={status === "loading" ? "جاري الدخول..." : "دخول الزبون"} onPress={submit} loading={status === "loading"} />
        <View style={styles.links}>
          <MobileButton title="حساب جديد" compact variant="secondary" onPress={goToRegister} />
          {isDev ? <MobileButton title="كابتن تجريبي" compact variant="ghost" onPress={goToDevDriverLogin} /> : null}
        </View>
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm, alignItems: "flex-end", paddingVertical: spacing.lg, borderColor: depth.violetLine, boxShadow: shadows.glow },
  title: { color: colors.text, fontSize: 25, lineHeight: 32, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "right", writingDirection: "rtl" },
  form: { gap: spacing.sm, backgroundColor: "rgba(255,255,255,0.052)" },
  links: { flexDirection: "row-reverse", gap: spacing.xs, flexWrap: "wrap" },
  error: { color: colors.red, textAlign: "right", fontWeight: "700", writingDirection: "rtl" }
});
