import { LinearGradient } from "expo-linear-gradient";
import { Car, ShieldCheck, User } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import { PremiumButton } from "@/components/premium-button";
import { useResponsiveLayout } from "@/design/responsive";
import {
  colors,
  controlSurfaces,
  gradients,
  layoutRhythm,
  radii,
  shadows,
  spacing,
  typography
} from "@/design/tokens";

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
  const responsive = useResponsiveLayout();

  return (
    <View style={styles.root}>
      <LinearGradient pointerEvents="none" colors={gradients.app} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        testID="welcome-scroll"
        contentContainerStyle={[
          styles.content,
          {
            alignSelf: "center",
            maxWidth: responsive.contentMaxWidth,
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xxl + spacing.md,
            paddingHorizontal: responsive.horizontalPadding,
            width: "100%"
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
            accessibilityLabel="الدخول ككابتن توصيل"
            label="الدخول ككابتن توصيل"
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
    gap: layoutRhythm.compactSectionGap
  },
  hero: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  logoHalo: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: controlSurfaces.activeNavigation.borderColor,
    backgroundColor: controlSurfaces.activeNavigation.backgroundColor,
    boxShadow: shadows.cardStrong
  },
  logoMark: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)"
  },
  logoLetter: {
    color: colors.text,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0
  },
  brandCopy: {
    alignItems: "center",
    gap: spacing.xxs
  },
  brandName: {
    color: colors.text,
    fontSize: 38,
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
  actions: {
    gap: spacing.sm
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
