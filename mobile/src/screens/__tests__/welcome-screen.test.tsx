import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
    expect(screen.getByText("اختر نوع الحساب")).toBeTruthy();
    expect(screen.getByText("تطبيق العميل")).toBeTruthy();
    expect(screen.getByText("تطبيق الكابتن")).toBeTruthy();
    expect(screen.getByText("تسجيل الدخول")).toBeTruthy();
    expect(screen.getByText("إنشاء حساب جديد")).toBeTruthy();
    expect(screen.getByText("الدخول ككابتن")).toBeTruthy();
    expect(screen.getByTestId("welcome-brand-mark")).toBeTruthy();
  });

  it("exposes mock entry actions without API connection", async () => {
    const { actions, screen } = await renderWelcomeScreen();

    await fireEvent.press(screen.getByLabelText("تسجيل الدخول"));
    await fireEvent.press(screen.getByLabelText("إنشاء حساب جديد"));
    await fireEvent.press(screen.getByLabelText("الدخول ككابتن"));

    expect(actions.onCustomerLogin).toHaveBeenCalledTimes(1);
    expect(actions.onCustomerRegister).toHaveBeenCalledTimes(1);
    expect(actions.onCaptainEntry).toHaveBeenCalledTimes(1);
  });
});
