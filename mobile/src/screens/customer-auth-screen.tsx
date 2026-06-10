import { MapPin, Phone, ShieldCheck, User } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet } from "react-native";

import {
  AuthField,
  AuthFormCard,
  AuthFormHeader,
  AuthHero,
  AuthNote,
  AuthScreenFrame,
  AuthTopBar
} from "@/components/auth-screen-kit";
import { PremiumButton } from "@/components/premium-button";
import { colors, radii } from "@/design/tokens";

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
    <AuthScreenFrame>
      <AuthTopBar appLabel="تطبيق العميل" onBack={onBack} />

      <AuthHero
        title={isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}
        subtitle={isRegister ? "ابدأ تجربة واصل ببيانات تجريبية" : "ادخل إلى تجربة العميل بدون ربط API"}
      />

      <AuthFormCard>
        <AuthFormHeader
          icon={<ShieldCheck color={colors.cyan} size={20} />}
          title="بيانات العميل"
          meta="mock UI فقط في هذه المرحلة"
        />

        {isRegister ? (
          <AuthField
            accessibilityLabel="الاسم الكامل"
            icon={<User color={colors.textMuted} size={17} />}
            label="الاسم الكامل"
            onChangeText={setName}
            placeholder="مثال: علي محمد"
            value={name}
          />
        ) : null}

        <AuthField
          accessibilityLabel="رقم الجوال"
          icon={<Phone color={colors.textMuted} size={17} />}
          keyboardType="phone-pad"
          label="رقم الجوال"
          onChangeText={setPhone}
          placeholder="05XXXXXXXX"
          value={phone}
        />

        <AuthField
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
      </AuthFormCard>

      <AuthNote text="لا يوجد ربط backend أو تحقق SMS الآن. هذه شاشة mock لتثبيت تجربة الدخول فقط." />
    </AuthScreenFrame>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    minHeight: 56,
    borderRadius: radii.sm
  }
});
