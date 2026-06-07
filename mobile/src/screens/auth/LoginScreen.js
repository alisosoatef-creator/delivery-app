import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Input, V3Screen, V3Text } from "../../components/v3/ui";
import { useCustomerLogin } from "../../hooks/useCustomerLogin";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

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
    <V3Screen>
      <V3Card tone="accent" contentStyle={styles.hero}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <V3Text variant="title" align="center" style={styles.brandLetter}>W</V3Text>
          </View>
          <V3Badge label="تطبيق الزبون" tone="blue" />
        </View>
        <V3Text variant="title" numberOfLines={2}>مشوارك التالي يبدأ بواجهة أوضح.</V3Text>
        <V3Text tone="muted" numberOfLines={3}>
          دخول سريع، طلب واضح، وتتبع مباشر للكابتن.
        </V3Text>
      </V3Card>

      <V3Card tone="raised" contentStyle={styles.form}>
        <V3Text variant="subtitle">تسجيل الدخول</V3Text>
        <V3Input
          label="الاسم أو رقم الهاتف"
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="+970..."
        />
        <V3Input
          label="كلمة السر"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
        {error ? <V3Text selectable tone="danger">{error}</V3Text> : null}
        <V3Button
          title={status === "loading" ? "جاري الدخول..." : "دخول الزبون"}
          onPress={submit}
          loading={status === "loading"}
        />
        <View style={styles.links}>
          <V3Button title="حساب جديد" size="sm" fullWidth={false} variant="secondary" onPress={goToRegister} />
          {isDev ? (
            <V3Button title="كابتن تجريبي" size="sm" fullWidth={false} variant="ghost" onPress={goToDevDriverLogin} />
          ) : null}
        </View>
      </V3Card>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "flex-end",
    gap: v3Spacing.md
  },
  brandRow: {
    alignSelf: "stretch",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.sm
  },
  brandMark: {
    width: 58,
    height: 58,
    borderRadius: v3Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: v3Alpha.purpleWash,
    borderWidth: 1,
    borderColor: v3Colors.borderStrong
  },
  brandLetter: {
    color: v3Colors.purpleLight,
    lineHeight: 34
  },
  form: {
    gap: v3Spacing.md
  },
  links: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  }
});
