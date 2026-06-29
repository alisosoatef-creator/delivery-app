import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import type { PropsWithChildren, ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
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

type AuthScreenFrameProps = PropsWithChildren;

export function AuthScreenFrame({ children }: AuthScreenFrameProps) {
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
        testID="auth-screen-scroll"
        contentContainerStyle={[
          styles.content,
          {
            alignSelf: "center",
            maxWidth: responsive.contentMaxWidth,
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xxl + spacing.md,
            paddingHorizontal: responsive.horizontalPadding,
            width: "100%"
          }
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

type AuthTopBarProps = {
  appLabel: string;
  onBack: () => void;
};

export function AuthTopBar({ appLabel, onBack }: AuthTopBarProps) {
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        hitSlop={10}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : null]}
      >
        <ChevronRight color={colors.textSoft} size={20} />
      </Pressable>
      <View style={styles.brandMini}>
        <Text selectable style={styles.brandName}>
          واصل
        </Text>
        <Text selectable style={styles.brandMeta}>
          {appLabel}
        </Text>
      </View>
    </View>
  );
}

type AuthHeroProps = {
  subtitle: string;
  title: string;
};

export function AuthHero({ subtitle, title }: AuthHeroProps) {
  return (
    <View style={styles.heroCopy}>
      <Text selectable style={styles.title}>
        {title}
      </Text>
      <Text selectable style={styles.subtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

type AuthFormCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function AuthFormCard({ children, style, testID }: AuthFormCardProps) {
  return (
    <GlassCard testID={testID} variant="strong" style={[styles.formCard, style]}>
      {children}
    </GlassCard>
  );
}

type AuthFormHeaderProps = {
  icon: ReactNode;
  meta: string;
  title: string;
};

export function AuthFormHeader({ icon, meta, title }: AuthFormHeaderProps) {
  return (
    <View style={styles.formHeader}>
      <View style={styles.formIcon}>{icon}</View>
      <View style={styles.formHeaderCopy}>
        <Text selectable style={styles.formTitle}>
          {title}
        </Text>
        <Text selectable style={styles.formMeta}>
          {meta}
        </Text>
      </View>
    </View>
  );
}

type AuthFieldProps = {
  accessibilityLabel: string;
  icon: ReactNode;
  keyboardType?: "default" | "phone-pad";
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  testID?: string;
  value: string;
};

export function AuthField({
  accessibilityLabel,
  icon,
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  testID,
  value
}: AuthFieldProps) {
  return (
    <View style={styles.field}>
      <Text selectable style={styles.fieldLabel}>
        {label}
      </Text>
      <View testID={testID} style={styles.inputWrap}>
        {icon}
        <TextInput
          accessibilityLabel={accessibilityLabel}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={value}
        />
      </View>
    </View>
  );
}

type AuthNoteProps = {
  testID?: string;
  text: string;
};

export function AuthNote({ testID, text }: AuthNoteProps) {
  return (
    <GlassCard testID={testID} variant="subtle" style={styles.noteCard}>
      <Text selectable style={styles.noteText}>
        {text}
      </Text>
    </GlassCard>
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
    gap: layoutRhythm.compactSectionGap
  },
  topBar: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor,
    boxShadow: shadows.cardSubtle
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }]
  },
  brandMini: {
    alignItems: "flex-end",
    gap: 2
  },
  brandName: {
    ...rtlText,
    color: colors.text,
    fontSize: 25,
    fontWeight: "900"
  },
  brandMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  heroCopy: {
    alignItems: "flex-end",
    gap: spacing.xs,
    paddingTop: spacing.xs
  },
  title: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900"
  },
  subtitle: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 23
  },
  formCard: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg
  },
  formHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  formIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: controlSurfaces.activeNavigation.borderColor,
    backgroundColor: controlSurfaces.activeNavigation.backgroundColor,
    boxShadow: shadows.activeControl
  },
  formHeaderCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  formTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  formMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  field: {
    gap: spacing.xs
  },
  fieldLabel: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  inputWrap: {
    minHeight: 54,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor,
    boxShadow: shadows.cardSubtle
  },
  input: {
    ...rtlText,
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  noteCard: {
    padding: spacing.md,
    alignItems: "flex-end"
  },
  noteText: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700",
    lineHeight: 21
  }
});
