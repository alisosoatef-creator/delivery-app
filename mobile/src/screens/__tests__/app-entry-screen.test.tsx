import { describe, expect, it } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MockAppProvider } from "@/state/mock-app-context";

import { AppEntryScreen } from "../app-entry-screen";

async function renderAppEntryScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 48, right: 0, bottom: 34, left: 0 }
      }}
    >
      <MockAppProvider>
        <AppEntryScreen />
      </MockAppProvider>
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

    expect(screen.getByText("جاهز لمشوارك؟")).toBeTruthy();
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

    expect(screen.getByText("جاهز لمشوارك؟")).toBeTruthy();
    expect(screen.getByText("اطلب رحلة")).toBeTruthy();
  });

  it("enters the captain dashboard through the captain mock auth flow", async () => {
    const screen = await renderAppEntryScreen();

    await fireEvent.press(screen.getByLabelText("الدخول ككابتن توصيل"));

    expect(screen.getByText("دخول الكابتن")).toBeTruthy();
    expect(screen.queryByText("أهلًا كابتن أحمد")).toBeNull();

    await fireEvent.changeText(screen.getByLabelText("رقم الجوال"), "05995551212");
    await fireEvent.changeText(screen.getByLabelText("رقم المركبة"), "12-345-67");
    await fireEvent.changeText(screen.getByLabelText("المدينة"), "نابلس");
    await fireEvent.press(screen.getByLabelText("دخول الكابتن التجريبي"));

    expect(screen.getByText("تطبيق الكابتن")).toBeTruthy();
    expect(screen.getByText("أهلًا كابتن أحمد")).toBeTruthy();
    expect(screen.getByText("أقرب طلب جاهز")).toBeTruthy();
    expect(screen.getByTestId("captain-nearest-request-card")).toBeTruthy();
  });

  it("previews the confirmed customer request inside the captain dashboard mock", async () => {
    const screen = await renderAppEntryScreen();

    await fireEvent.press(screen.getByLabelText("تسجيل الدخول"));
    await fireEvent.changeText(screen.getByLabelText("رقم الجوال"), "0599123456");
    await fireEvent.changeText(screen.getByLabelText("المدينة"), "نابلس");
    await fireEvent.press(screen.getByLabelText("دخول تجريبي"));

    await fireEvent.press(screen.getByLabelText("بدء طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));
    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));
    await fireEvent.press(screen.getByLabelText("اختيار وجهة مطعم شورما عكيفك"));
    await fireEvent.changeText(
      screen.getByLabelText("ملاحظة الوصول للكابتن"),
      "مطعم شورما عكيفك - الباب الرئيسي"
    );
    await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByTestId("customer-captain-search-surface")).toBeTruthy();
    expect(screen.getAllByText("تم إرسال طلبك للكباتن القريبين").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("معاينة الطلب عند الكابتن"));

    expect(screen.getByText("تطبيق الكابتن")).toBeTruthy();
    expect(screen.getByText("أقرب طلب جاهز")).toBeTruthy();
    expect(screen.getByText("علي محمد")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("عرض تفاصيل الطلب التجريبي"));

    expect(screen.getByTestId("captain-request-details")).toBeTruthy();
    expect(screen.getByText("+970 59 000 4321")).toBeTruthy();
    expect(screen.getAllByText("مطعم شورما عكيفك - الباب الرئيسي").length).toBeGreaterThanOrEqual(
      1
    );
  });
});
