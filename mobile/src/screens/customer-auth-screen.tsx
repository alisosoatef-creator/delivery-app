import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, MapPin, Phone, ShieldCheck, User } from "lucide-react-native";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import { PremiumButton } from "@/components/premium-button";
import { colors, gradients, radii, spacing, typography } from "@/design/tokens";

export type CustomerAuthMode = "login" | "register";

export type CustomerAuthPayload = {
  city: string;
  mode: CustomerAuthMode;
  name: string;
  phone: string;
};

type CustomerAuthScreenProps = {
  mode: CustomerAuthMode;
  onBack: () => void;
  onSubmit: (payload: CustomerAuthPayload) => void;
};

export function CustomerAuthScreen({ mode, onBack, onSubmit }: CustomerAuthScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("نابلس");
  const isRegister = mode === "register";

  function submitMockAuth() {
    onSubmit({
      city,
      mode,
      name: isRegister ? name : "",
      phone
    });
  }

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
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xxl
          }
        ]}
      >
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
              تطبيق العميل
            </Text>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <Text selectable style={styles.title}>
            {isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </Text>
          <Text selectable style={styles.subtitle}>
            {isRegister ? "ابدأ تجربة واصل ببيانات تجريبية" : "ادخل إلى تجربة العميل بدون ربط API"}
          </Text>
        </View>

        <GlassCard variant="strong" style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={styles.formIcon}>
              <ShieldCheck color={colors.cyan} size={20} />
            </View>
            <View style={styles.formHeaderCopy}>
              <Text selectable style={styles.formTitle}>
                بيانات العميل
              </Text>
              <Text selectable style={styles.formMeta}>
                mock UI فقط في هذه المرحلة
              </Text>
            </View>
          </View>

          {isRegister ? (
            <LabeledInput
              accessibilityLabel="الاسم الكامل"
              icon={<User color={colors.textMuted} size={17} />}
              label="الاسم الكامل"
              onChangeText={setName}
              placeholder="مثال: علي محمد"
              value={name}
            />
          ) : null}

          <LabeledInput
            accessibilityLabel="رقم الجوال"
            icon={<Phone color={colors.textMuted} size={17} />}
            keyboardType="phone-pad"
            label="رقم الجوال"
            onChangeText={setPhone}
            placeholder="05XXXXXXXX"
            value={phone}
          />

          <LabeledInput
            accessibilityLabel="المدينة"
            icon={<MapPin color={colors.textMuted} size={17} />}
            label="المدينة"
            onChangeText={setCity}
            placeholder="نابلس"
            value={city}
          />

          <PremiumButton
            accessibilityLabel={isRegister ? "إنشاء الحساب التجريبي" : "دخول تجريبي"}
            label={isRegister ? "إنشاء الحساب التجريبي" : "دخول تجريبي"}
            onPress={submitMockAuth}
            style={styles.submitButton}
          />
        </GlassCard>

        <GlassCard variant="subtle" style={styles.noteCard}>
          <Text selectable style={styles.noteText}>
            لا يوجد ربط backend أو تحقق SMS الآن. هذه شاشة mock لتثبيت تجربة الدخول فقط.
          </Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

type LabeledInputProps = {
  accessibilityLabel: string;
  icon: ReactNode;
  keyboardType?: "default" | "phone-pad";
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

function LabeledInput({
  accessibilityLabel,
  icon,
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  value
}: LabeledInputProps) {
  return (
    <View style={styles.field}>
      <Text selectable style={styles.fieldLabel}>
        {label}
      </Text>
      <View style={styles.inputWrap}>
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
    gap: spacing.lg,
    paddingHorizontal: spacing.lg
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
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft
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
    padding: spacing.md,
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
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
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
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  input: {
    ...rtlText,
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  submitButton: {
    minHeight: 56,
    borderRadius: radii.sm
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
