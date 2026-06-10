import { LinearGradient } from "expo-linear-gradient";
import { Car, MapPin, ShieldCheck, Sparkles, User } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import { PremiumButton } from "@/components/premium-button";
import { colors, gradients, radii, shadows, spacing, typography } from "@/design/tokens";

type WelcomeScreenProps = {
  captainNotice?: string | null;
  onCaptainEntry: () => void;
  onCustomerLogin: () => void;
  onCustomerRegister: () => void;
};

export function WelcomeScreen({
  captainNotice,
  onCaptainEntry,
  onCustomerLogin,
  onCustomerRegister
}: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient pointerEvents="none" colors={gradients.app} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xxl
          }
        ]}
      >
        <View style={styles.hero}>
          <View testID="welcome-brand-mark" style={styles.logoHalo}>
            <LinearGradient colors={gradients.primary} style={styles.logoMark}>
              <Text selectable style={styles.logoLetter}>
                W
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.brandCopy}>
            <Text selectable style={styles.brandName}>
              واصل
            </Text>
            <Text selectable style={styles.brandSpaced}>
              W A S E L
            </Text>
          </View>

          <View style={styles.heroCopy}>
            <Text selectable style={styles.tagline}>
              واصل وجهتك بسهولة وثقة
            </Text>
            <Text selectable style={styles.description}>
              تجربة تنقل ذكية وآمنة مصممة من أجلك
            </Text>
          </View>
        </View>

        <GlassCard variant="strong" style={styles.promiseCard}>
          <View style={styles.promiseHeader}>
            <View style={styles.promiseIcon}>
              <MapPin color={colors.cyan} size={20} />
            </View>
            <View style={styles.promiseCopy}>
              <Text selectable style={styles.promiseTitle}>
                خريطة أولًا، طلب أسرع
              </Text>
              <Text selectable style={styles.promiseText}>
                واجهة عربية فاخرة تبدأ من موقعك ووجهتك
              </Text>
            </View>
          </View>

          <View style={styles.promiseMetrics}>
            <View style={styles.metric}>
              <Sparkles color={colors.cyan} size={17} />
              <Text selectable style={styles.metricValue}>
                8
              </Text>
              <Text selectable style={styles.metricLabel}>
                كباتن قريبون
              </Text>
            </View>
            <View style={styles.metric}>
              <ShieldCheck color={colors.success} size={17} />
              <Text selectable style={styles.metricValue}>
                25 شيكل
              </Text>
              <Text selectable style={styles.metricLabel}>
                سعر مقترح
              </Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard variant="subtle" style={styles.roleCard}>
          <Text selectable style={styles.roleTitle}>
            اختر نوع الحساب
          </Text>
          <View style={styles.roleGrid}>
            <View style={styles.roleTile}>
              <View style={styles.roleIcon}>
                <User color={colors.cyan} size={18} />
              </View>
              <View style={styles.roleCopy}>
                <Text selectable style={styles.roleName}>
                  تطبيق العميل
                </Text>
                <Text selectable style={styles.roleMeta}>
                  اطلب رحلتك من الخريطة
                </Text>
              </View>
            </View>

            <View style={styles.roleTile}>
              <View style={styles.roleIcon}>
                <Car color={colors.violetSoft} size={18} />
              </View>
              <View style={styles.roleCopy}>
                <Text selectable style={styles.roleName}>
                  تطبيق الكابتن
                </Text>
                <Text selectable style={styles.roleMeta}>
                  استقبل الطلبات وتابع الأرباح
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        <View style={styles.actions}>
          <PremiumButton
            accessibilityLabel="تسجيل الدخول"
            label="تسجيل الدخول"
            onPress={onCustomerLogin}
            style={styles.actionButton}
          >
            <User color={colors.text} size={18} />
          </PremiumButton>

          <PremiumButton
            accessibilityLabel="إنشاء حساب جديد"
            label="إنشاء حساب جديد"
            onPress={onCustomerRegister}
            style={styles.actionButton}
            variant="secondary"
          >
            <ShieldCheck color={colors.textSoft} size={18} />
          </PremiumButton>

          <PremiumButton
            accessibilityLabel="الدخول ككابتن"
            label="الدخول ككابتن"
            onPress={onCaptainEntry}
            style={styles.actionButton}
            variant="secondary"
          >
            <Car color={colors.textSoft} size={18} />
          </PremiumButton>
        </View>

        {captainNotice ? (
          <GlassCard variant="subtle" style={styles.noticeCard}>
            <Text selectable style={styles.noticeText}>
              {captainNotice}
            </Text>
          </GlassCard>
        ) : null}
      </ScrollView>
    </View>
  );
}

const rtlText = {
  textAlign: "right" as const,
  writingDirection: "rtl" as const
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg
  },
  hero: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg
  },
  logoHalo: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.08)",
    boxShadow: shadows.glowCyan
  },
  logoMark: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)"
  },
  logoLetter: {
    color: colors.text,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0
  },
  brandCopy: {
    alignItems: "center",
    gap: spacing.xxs
  },
  brandName: {
    color: colors.text,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
    writingDirection: "rtl"
  },
  brandSpaced: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center"
  },
  heroCopy: {
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.sm
  },
  tagline: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  description: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 24,
    textAlign: "center"
  },
  promiseCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg
  },
  promiseHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  promiseIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)"
  },
  promiseCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  promiseTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  promiseText: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  promiseMetrics: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  metric: {
    flex: 1,
    minHeight: 86,
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  metricValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  metricLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "700"
  },
  actions: {
    gap: spacing.sm
  },
  roleCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg
  },
  roleTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  roleGrid: {
    gap: spacing.sm
  },
  roleTile: {
    minHeight: 66,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  roleIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  roleCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  roleName: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  roleMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  actionButton: {
    minHeight: 56,
    borderRadius: radii.sm
  },
  noticeCard: {
    padding: spacing.md,
    alignItems: "flex-end"
  },
  noticeText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  }
});
