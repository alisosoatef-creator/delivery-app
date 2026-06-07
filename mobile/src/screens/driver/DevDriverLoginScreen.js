import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Input, V3Screen, V3Text } from "../../components/v3/ui";
import { useDevDriverLogin } from "../../hooks/useDevDriverLogin";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

export function DevDriverLoginScreen() {
  const { drivers, driverId, setDriverId, phone, setPhone, error, submit, goToCustomerLogin } = useDevDriverLogin();

  return (
    <V3Screen>
      <V3Card tone="blue" contentStyle={styles.hero}>
        <View style={styles.headerRow}>
          <View style={styles.devMark}>
            <V3Text variant="label" tone="blue" align="center">DEV</V3Text>
          </View>
          <V3Badge label="مدخل تجريبي" tone="warning" />
        </View>

        <V3Text variant="title" numberOfLines={2}>مدخل الكابتن</V3Text>
        <V3Text tone="muted" numberOfLines={4}>
          هذا المدخل للتطوير فقط، ولا يفعّل طلبات الانضمام قبل موافقة الإدارة.
        </V3Text>

        <V3Input
          label="معرف الكابتن"
          value={driverId}
          onChangeText={setDriverId}
          placeholder={drivers[0]?.id || "driver_..."}
        />
        <V3Input
          label="رقم الهاتف"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        {error ? <V3Text selectable tone="danger">{error}</V3Text> : null}

        <V3Button title="دخول لوحة الكابتن" onPress={submit} disabled={!driverId && !phone} />
        <V3Button title="رجوع إلى دخول الزبون" size="sm" variant="secondary" onPress={goToCustomerLogin} />
      </V3Card>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "flex-end",
    gap: v3Spacing.md
  },
  headerRow: {
    alignSelf: "stretch",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.sm
  },
  devMark: {
    width: 56,
    height: 42,
    borderRadius: v3Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: v3Alpha.blueWash,
    borderWidth: 1,
    borderColor: v3Colors.borderBlue
  }
});
