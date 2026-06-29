import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { Phone, ShieldCheck } from "lucide-react-native";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors, controlSurfaces, glass, layoutRhythm, shadows, spacing } from "@/design/tokens";

import {
  AuthField,
  AuthFormCard,
  AuthFormHeader,
  AuthNote,
  AuthScreenFrame,
  AuthTopBar
} from "../auth-screen-kit";

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
          <AuthFormCard testID="auth-form-card">
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
              testID="auth-phone-field"
              value=""
            />
          </AuthFormCard>
          <AuthNote testID="auth-note-card" text="لا يوجد ربط API الآن" />
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

  it("uses semantic premium surfaces for auth controls and content", async () => {
    const screen = await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 48, right: 0, bottom: 34, left: 0 }
        }}
      >
        <AuthScreenFrame>
          <AuthTopBar appLabel="تطبيق العميل" onBack={() => undefined} />
          <AuthFormCard testID="auth-form-card">
            <AuthField
              accessibilityLabel="رقم الجوال"
              icon={<Phone color={colors.textMuted} size={17} />}
              label="رقم الجوال"
              onChangeText={() => undefined}
              placeholder="05XXXXXXXX"
              testID="auth-phone-field"
              value=""
            />
          </AuthFormCard>
          <AuthNote testID="auth-note-card" text="بياناتك محفوظة داخل التجربة التجريبية" />
        </AuthScreenFrame>
      </SafeAreaProvider>
    );

    expect(StyleSheet.flatten(screen.getByLabelText("رجوع").props.style)).toMatchObject({
      backgroundColor: controlSurfaces.secondary.backgroundColor,
      borderColor: controlSurfaces.secondary.borderColor,
      boxShadow: shadows.cardSubtle
    });
    expect(StyleSheet.flatten(screen.getByTestId("auth-form-card").props.style)).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      boxShadow: shadows.cardStrong
    });
    expect(StyleSheet.flatten(screen.getByTestId("auth-phone-field").props.style)).toMatchObject({
      backgroundColor: controlSurfaces.secondary.backgroundColor,
      borderColor: controlSurfaces.secondary.borderColor,
      boxShadow: shadows.cardSubtle
    });
    expect(StyleSheet.flatten(screen.getByTestId("auth-note-card").props.style)).toMatchObject({
      backgroundColor: glass.subtle.backgroundColor,
      boxShadow: shadows.cardSubtle
    });
  });

  it("keeps the auth frame compact and form-friendly on Android", async () => {
    const screen = await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 48, right: 0, bottom: 34, left: 0 }
        }}
      >
        <AuthScreenFrame>
          <AuthTopBar appLabel="تطبيق العميل" onBack={() => undefined} />
          <AuthFormCard testID="auth-form-card">
            <AuthField
              accessibilityLabel="رقم الجوال"
              icon={<Phone color={colors.textMuted} size={17} />}
              label="رقم الجوال"
              onChangeText={() => undefined}
              placeholder="05XXXXXXXX"
              testID="auth-phone-field"
              value=""
            />
          </AuthFormCard>
        </AuthScreenFrame>
      </SafeAreaProvider>
    );
    const frame = screen.getByTestId("auth-screen-scroll");
    const contentStyle = StyleSheet.flatten(frame.props.contentContainerStyle);

    expect(frame.props.keyboardShouldPersistTaps).toBe("handled");
    expect(frame.props.keyboardDismissMode).toBe("on-drag");
    expect(contentStyle).toMatchObject({
      gap: layoutRhythm.compactSectionGap,
      paddingBottom: 34 + spacing.xxl + spacing.md
    });
  });
});
