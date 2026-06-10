import { Car, MapPin, Phone, ShieldCheck } from "lucide-react-native";
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

export type CaptainAuthPayload = {
  city: string;
  phone: string;
  vehicleNumber: string;
};

type CaptainAuthScreenProps = {
  onBack: () => void;
  onSubmit: (payload: CaptainAuthPayload) => void;
};

export function CaptainAuthScreen({ onBack, onSubmit }: CaptainAuthScreenProps) {
  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [city, setCity] = useState("نابلس");

  function submitMockAuth() {
    onSubmit({
      city,
      phone,
      vehicleNumber
    });
  }

  return (
    <AuthScreenFrame>
      <AuthTopBar appLabel="تطبيق الكابتن" onBack={onBack} />

      <AuthHero title="دخول الكابتن" subtitle="سجّل بيانات تشغيلية mock قبل فتح لوحة الطلبات" />

      <AuthFormCard style={styles.formCard}>
        <AuthFormHeader
          icon={<ShieldCheck color={colors.cyan} size={20} />}
          title="بيانات الكابتن"
          meta="لا يوجد تحقق SMS أو ربط backend الآن"
        />

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
          accessibilityLabel="رقم المركبة"
          icon={<Car color={colors.textMuted} size={17} />}
          label="رقم المركبة"
          onChangeText={setVehicleNumber}
          placeholder="12-345-67"
          value={vehicleNumber}
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
          accessibilityLabel="دخول الكابتن التجريبي"
          label="دخول الكابتن التجريبي"
          onPress={submitMockAuth}
          style={styles.submitButton}
        />
      </AuthFormCard>

      <AuthNote text="هذه شاشة mock لتثبيت تجربة الكابتن فقط. الربط مع backend والتوثيق الحقيقي يأتي لاحقًا." />
    </AuthScreenFrame>
  );
}

const styles = StyleSheet.create({
  formCard: {
    borderColor: "rgba(0, 229, 255, 0.3)"
  },
  submitButton: {
    minHeight: 56,
    borderRadius: radii.sm
  }
});
