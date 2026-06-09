import { describe, expect, it } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppEntryScreen } from "../app-entry-screen";

async function renderAppEntryScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 48, right: 0, bottom: 34, left: 0 }
      }}
    >
      <AppEntryScreen />
    </SafeAreaProvider>
  );
}

describe("AppEntryScreen", () => {
  it("starts on welcome before entering through the customer login mock", async () => {
    const screen = await renderAppEntryScreen();

    expect(screen.getByText("واصل وجهتك بسهولة وثقة")).toBeTruthy();
    expect(screen.queryByText("أهلًا بك، علي")).toBeNull();

    await fireEvent.press(screen.getByLabelText("تسجيل الدخول"));

    expect(screen.getByText("رقم الجوال")).toBeTruthy();
    expect(screen.queryByText("أهلًا بك، علي")).toBeNull();

    await fireEvent.changeText(screen.getByLabelText("رقم الجوال"), "0599123456");
    await fireEvent.changeText(screen.getByLabelText("المدينة"), "نابلس");
    await fireEvent.press(screen.getByLabelText("دخول تجريبي"));

    expect(screen.getByText("أهلًا بك، علي")).toBeTruthy();
    expect(screen.getByText("اطلب رحلة")).toBeTruthy();
  });

  it("enters through the customer registration mock", async () => {
    const screen = await renderAppEntryScreen();

    await fireEvent.press(screen.getByLabelText("إنشاء حساب جديد"));

    expect(screen.getByText("الاسم الكامل")).toBeTruthy();
    expect(screen.queryByText("أهلًا بك، علي")).toBeNull();

    await fireEvent.changeText(screen.getByLabelText("الاسم الكامل"), "علي محمد");
    await fireEvent.changeText(screen.getByLabelText("رقم الجوال"), "0599000000");
    await fireEvent.changeText(screen.getByLabelText("المدينة"), "نابلس");
    await fireEvent.press(screen.getByLabelText("إنشاء الحساب التجريبي"));

    expect(screen.getByText("أهلًا بك، علي")).toBeTruthy();
    expect(screen.getByText("اطلب رحلة")).toBeTruthy();
  });

  it("keeps captain entry as a mock notice for the next phase", async () => {
    const screen = await renderAppEntryScreen();

    await fireEvent.press(screen.getByLabelText("الدخول ككابتن"));

    expect(screen.getByText("واجهة الكابتن التجريبية ستكون في المرحلة القادمة")).toBeTruthy();
    expect(screen.getByText("واصل وجهتك بسهولة وثقة")).toBeTruthy();
  });
});
