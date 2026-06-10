import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { Phone, ShieldCheck } from "lucide-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  AuthField,
  AuthFormCard,
  AuthFormHeader,
  AuthNote,
  AuthScreenFrame,
  AuthTopBar
} from "../auth-screen-kit";
import { colors } from "@/design/tokens";

describe("auth-screen-kit", () => {
  it("renders the shared premium auth frame, top bar, form header, field, and note", async () => {
    const actions = {
      onBack: jest.fn(),
      onChangeText: jest.fn()
    };

    const screen = await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 48, right: 0, bottom: 34, left: 0 }
        }}
      >
        <AuthScreenFrame>
          <AuthTopBar appLabel="تطبيق الاختبار" onBack={actions.onBack} />
          <AuthFormCard>
            <AuthFormHeader
              icon={<ShieldCheck color={colors.cyan} size={20} />}
              meta="بيانات mock فقط"
              title="بيانات الدخول"
            />
            <AuthField
              accessibilityLabel="رقم الجوال"
              icon={<Phone color={colors.textMuted} size={17} />}
              keyboardType="phone-pad"
              label="رقم الجوال"
              onChangeText={actions.onChangeText}
              placeholder="05XXXXXXXX"
              value=""
            />
          </AuthFormCard>
          <AuthNote text="لا يوجد ربط API الآن" />
        </AuthScreenFrame>
      </SafeAreaProvider>
    );

    expect(screen.getByText("واصل")).toBeTruthy();
    expect(screen.getByText("تطبيق الاختبار")).toBeTruthy();
    expect(screen.getByText("بيانات الدخول")).toBeTruthy();
    expect(screen.getByText("بيانات mock فقط")).toBeTruthy();
    expect(screen.getByText("رقم الجوال")).toBeTruthy();
    expect(screen.getByText("لا يوجد ربط API الآن")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("رقم الجوال"), "0599000000");
    await fireEvent.press(screen.getByLabelText("رجوع"));

    expect(actions.onChangeText).toHaveBeenCalledWith("0599000000");
    expect(actions.onBack).toHaveBeenCalledTimes(1);
  });
});
