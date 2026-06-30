import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { controlSurfaces, shadows, spacing } from "@/design/tokens";

import { WelcomeScreen } from "../welcome-screen";

async function renderWelcomeScreen() {
  const actions = {
    onCaptainEntry: jest.fn(),
    onCustomerLogin: jest.fn(),
    onCustomerRegister: jest.fn()
  };

  const screen = await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 48, right: 0, bottom: 34, left: 0 }
      }}
    >
      <WelcomeScreen {...actions} />
    </SafeAreaProvider>
  );

  return { actions, screen };
}

describe("WelcomeScreen", () => {
  it("renders the premium Wasel entry experience", async () => {
    const { screen } = await renderWelcomeScreen();

    expect(screen.getByText("واصل")).toBeTruthy();
    expect(screen.getByText("واصل وجهتك بسهولة وثقة")).toBeTruthy();
    expect(screen.getByText("تجربة تنقل ذكية وآمنة مصممة من أجلك")).toBeTruthy();
    expect(screen.getByText("تسجيل الدخول")).toBeTruthy();
    expect(screen.getByText("إنشاء حساب جديد")).toBeTruthy();
    expect(screen.getByText("الدخول ككابتن توصيل")).toBeTruthy();
    expect(screen.getByTestId("welcome-brand-mark")).toBeTruthy();
  });

  it("keeps the welcome entry focused on account actions only", async () => {
    const { screen } = await renderWelcomeScreen();

    expect(screen.queryByTestId("welcome-promise-card")).toBeNull();
    expect(screen.queryByTestId("welcome-role-card")).toBeNull();
    expect(screen.queryByText("خريطة أولًا، طلب أسرع")).toBeNull();
    expect(screen.queryByText("اختر نوع الحساب")).toBeNull();
    expect(screen.getAllByTestId("premium-motion-button")).toHaveLength(3);
    expect(screen.getByLabelText("تسجيل الدخول")).toBeTruthy();
    expect(screen.getByLabelText("إنشاء حساب جديد")).toBeTruthy();
    expect(screen.getByLabelText("الدخول ككابتن توصيل")).toBeTruthy();
  });

  it("uses a calm premium hierarchy for brand and entry actions", async () => {
    const { screen } = await renderWelcomeScreen();
    const brandStyle = StyleSheet.flatten(screen.getByTestId("welcome-brand-mark").props.style);
    const buttons = screen.getAllByTestId("premium-motion-button");
    const primaryButtonStyle = StyleSheet.flatten(buttons[0].props.style);
    const secondaryButtonStyle = StyleSheet.flatten(buttons[1].props.style);

    expect(brandStyle).toMatchObject({
      backgroundColor: controlSurfaces.activeNavigation.backgroundColor,
      borderColor: controlSurfaces.activeNavigation.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(buttons).toHaveLength(3);
    expect(primaryButtonStyle.boxShadow).toBe(shadows.primaryAction);
    expect(secondaryButtonStyle).toMatchObject({
      backgroundColor: controlSurfaces.secondary.backgroundColor,
      borderColor: controlSurfaces.secondary.borderColor
    });
  });

  it("keeps the Android welcome entry compact enough for the primary action", async () => {
    const { screen } = await renderWelcomeScreen();
    const brandStyle = StyleSheet.flatten(screen.getByTestId("welcome-brand-mark").props.style);
    const primaryButtonStyle = StyleSheet.flatten(
      screen.getAllByTestId("premium-motion-button")[0].props.style
    );

    expect(brandStyle).toMatchObject({
      width: 88,
      height: 88
    });
    expect(screen.queryByTestId("welcome-role-card")).toBeNull();
    expect(primaryButtonStyle.minHeight).toBeGreaterThanOrEqual(56);
  });

  it("keeps welcome scrolling responsive for fast role entry", async () => {
    const { screen } = await renderWelcomeScreen();
    const scroll = screen.getByTestId("welcome-scroll");
    const contentStyle = StyleSheet.flatten(scroll.props.contentContainerStyle);

    expect(scroll.props.keyboardShouldPersistTaps).toBe("handled");
    expect(scroll.props.keyboardDismissMode).toBe("on-drag");
    expect(contentStyle.paddingBottom).toBe(34 + spacing.xxl + spacing.md);
  });

  it("exposes mock entry actions without API connection", async () => {
    const { actions, screen } = await renderWelcomeScreen();

    await fireEvent.press(screen.getByLabelText("تسجيل الدخول"));
    await fireEvent.press(screen.getByLabelText("إنشاء حساب جديد"));
    await fireEvent.press(screen.getByLabelText("الدخول ككابتن توصيل"));

    expect(actions.onCustomerLogin).toHaveBeenCalledTimes(1);
    expect(actions.onCustomerRegister).toHaveBeenCalledTimes(1);
    expect(actions.onCaptainEntry).toHaveBeenCalledTimes(1);
  });
});
