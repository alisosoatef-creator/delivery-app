import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CustomerAuthScreen } from "../customer-auth-screen";

async function renderAuthScreen(mode: "login" | "register") {
  const actions = {
    onBack: jest.fn(),
    onSubmit: jest.fn()
  };

  const screen = await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 48, right: 0, bottom: 34, left: 0 }
      }}
    >
      <CustomerAuthScreen mode={mode} {...actions} />
    </SafeAreaProvider>
  );

  return { actions, screen };
}

describe("CustomerAuthScreen", () => {
  it("renders a premium mock customer login form", async () => {
    const { actions, screen } = await renderAuthScreen("login");

    expect(screen.getByText("تسجيل الدخول")).toBeTruthy();
    expect(screen.getByText("رقم الجوال")).toBeTruthy();
    expect(screen.getByText("المدينة")).toBeTruthy();
    expect(screen.queryByText("الاسم الكامل")).toBeNull();
    expect(screen.getByText("دخول تجريبي")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("رقم الجوال"), "0599123456");
    await fireEvent.changeText(screen.getByLabelText("المدينة"), "نابلس");
    await fireEvent.press(screen.getByLabelText("دخول تجريبي"));

    expect(actions.onSubmit).toHaveBeenCalledWith({
      city: "نابلس",
      mode: "login",
      name: "",
      phone: "0599123456"
    });
  });

  it("renders a premium mock customer registration form", async () => {
    const { actions, screen } = await renderAuthScreen("register");

    expect(screen.getByText("إنشاء حساب جديد")).toBeTruthy();
    expect(screen.getByText("الاسم الكامل")).toBeTruthy();
    expect(screen.getByText("رقم الجوال")).toBeTruthy();
    expect(screen.getByText("المدينة")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("الاسم الكامل"), "علي محمد");
    await fireEvent.changeText(screen.getByLabelText("رقم الجوال"), "0599000000");
    await fireEvent.changeText(screen.getByLabelText("المدينة"), "نابلس");
    await fireEvent.press(screen.getByLabelText("إنشاء الحساب التجريبي"));

    expect(actions.onSubmit).toHaveBeenCalledWith({
      city: "نابلس",
      mode: "register",
      name: "علي محمد",
      phone: "0599000000"
    });
  });

  it("can return to the welcome screen flow", async () => {
    const { actions, screen } = await renderAuthScreen("login");

    await fireEvent.press(screen.getByLabelText("رجوع"));

    expect(actions.onBack).toHaveBeenCalledTimes(1);
  });
});
