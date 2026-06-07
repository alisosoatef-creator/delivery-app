import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useLogout } from "../../hooks/useLogout";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

export function AccountScreen() {
  const { user, selectedCity, logout, navigateToWallet, navigateToSupport } = useLogout();
  const displayName = user.fullName || user.name || "زبون";

  return (
    <V3Screen>
      <V3SectionHeader
        meta="الملف الشخصي"
        title="حسابي"
        subtitle="بيانات الدخول وخيارات الحساب بشكل مختصر."
      />

      <V3Card tone="accent" contentStyle={styles.profileCard}>
        <View style={styles.profileTop}>
          <View style={styles.avatar}>
            <V3Text variant="subtitle" align="center" style={styles.avatarText}>
              {displayName.slice(0, 1)}
            </V3Text>
          </View>
          <View style={styles.profileCopy}>
            <V3Badge label="زبون" tone="success" />
            <V3Text selectable variant="subtitle" numberOfLines={1}>{displayName}</V3Text>
            <V3Text selectable variant="caption" tone="muted" numberOfLines={1}>{user.phone || "-"}</V3Text>
          </View>
        </View>
      </V3Card>

      <View style={styles.actionGrid}>
        <V3Card tone="raised" compact onPress={navigateToWallet} accessibilityLabel="المحفظة" style={styles.actionTile}>
          <V3Badge label="₪" tone="blue" />
          <V3Text variant="label">المحفظة</V3Text>
          <V3Text variant="caption" tone="muted">الرصيد والمدفوعات</V3Text>
        </V3Card>
        <V3Card tone="raised" compact onPress={navigateToSupport} accessibilityLabel="الدعم" style={styles.actionTile}>
          <V3Badge label="?" tone="primary" />
          <V3Text variant="label">الدعم</V3Text>
          <V3Text variant="caption" tone="muted">تذاكر ومساعدة</V3Text>
        </V3Card>
      </View>

      <V3Card tone="raised">
        <V3SectionHeader
          title="تفاصيل الحساب"
          subtitle="معلومات أساسية دون أي بيانات حساسة."
        />
        <View style={styles.infoRow}>
          <V3Text variant="caption" tone="muted">المدينة</V3Text>
          <V3Badge label={user.city || selectedCity || "-"} tone="blue" />
        </View>
        <View style={styles.infoRow}>
          <V3Text variant="caption" tone="muted">العمر</V3Text>
          <V3Text selectable variant="caption" tone="soft">{user.age ? String(user.age) : "-"}</V3Text>
        </View>
        <View style={styles.infoRow}>
          <V3Text variant="caption" tone="muted">نوع الحساب</V3Text>
          <V3Text variant="caption" tone="soft">زبون</V3Text>
        </View>
      </V3Card>

      <V3Button title="تسجيل الخروج" variant="danger" onPress={logout} />
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    gap: v3Spacing.md
  },
  profileTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: v3Spacing.md
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: v3Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: v3Alpha.purpleWash,
    borderWidth: 1,
    borderColor: v3Colors.borderStrong
  },
  avatarText: {
    color: v3Colors.purpleLight
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xs
  },
  actionGrid: {
    flexDirection: "row-reverse",
    gap: v3Spacing.sm
  },
  actionTile: {
    flex: 1,
    minHeight: 112
  },
  infoRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm,
    padding: v3Spacing.sm,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.whiteSoft
  }
});
