import { describe, expect, it } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CustomerHomeScreen } from "../customer-home-screen";

async function renderCustomerHome() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 48, right: 0, bottom: 34, left: 0 }
      }}
    >
      <CustomerHomeScreen />
    </SafeAreaProvider>
  );
}

describe("CustomerHomeScreen", () => {
  it("renders the Arabic map-first customer mock experience for Nablus", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByText("واصل")).toBeTruthy();
    expect(screen.getByText("أهلًا بك، علي")).toBeTruthy();
    expect(screen.getByText("اطلب رحلة")).toBeTruthy();
    expect(screen.getByText("زواتا")).toBeTruthy();
    expect(screen.getAllByText("مطعم شورما عكيفك").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("جامعة النجاح")).toBeTruthy();
    expect(screen.getByText("سائقون قريبون")).toBeTruthy();
    expect(screen.getByText("خدمة واصل")).toBeTruthy();
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("وصل عادي")).toBeNull();
    expect(screen.queryByText("وصل بلس")).toBeNull();
    expect(screen.queryByText("25 ر.س")).toBeNull();
    expect(screen.queryByText("شارع النخيل، الرياض")).toBeNull();
    expect(screen.getByTestId("mock-route-map")).toBeTruthy();
    expect(screen.getByTestId("floating-bottom-nav")).toBeTruthy();
  });

  it("does not start captain search before a destination is selected", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getByText("اختر وجهتك قبل تأكيد الطلب")).toBeTruthy();
    expect(screen.queryByText("جاري البحث عن كابتن")).toBeNull();
  });

  it("selects a destination, edits detail, and confirms the mock trip", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    expect(screen.getAllByText("نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("تفصيل الوجهة")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("تفصيل الوجهة"), "مطعم شورما عكيفك - الباب الرئيسي");
    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getAllByText("تأكيد الطلب").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("نقطة الانطلاق")).toBeTruthy();
    expect(screen.getAllByText("زواتا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("منطقة الوجهة")).toBeTruthy();
    expect(screen.getByText("مطعم شورما عكيفك - الباب الرئيسي")).toBeTruthy();
    expect(screen.getAllByText("2.4 كم").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("طريقة الدفع").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("فيزا").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByText("تم تأكيد طلبك التجريبي")).toBeTruthy();
    expect(screen.getByText("جاري البحث عن كابتن")).toBeTruthy();
  });

  it("walks through the full mock customer ride flow after trip confirmation", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    expect(screen.getByText("جاري البحث عن كابتن")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("عرض الكابتن التجريبي"));
    expect(screen.getByText("أحمد محمد")).toBeTruthy();
    expect(screen.getByText("4.9")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء الرحلة التجريبية"));
    expect(screen.getByText("الرحلة الحالية")).toBeTruthy();
    expect(screen.getByText("2.1 كم")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة"));
    expect(screen.getByText("تم الوصول")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تقييم 5 نجوم"));
    expect(screen.getByText("تقييمك: 5 نجوم")).toBeTruthy();
  });

  it("keeps the floating nav interactive", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getByText("التبويب النشط: رحلاتي")).toBeTruthy();
  });
});
