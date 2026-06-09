import { describe, expect, it } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CustomerHomeScreen } from "../customer-home-screen";

describe("CustomerHomeScreen", () => {
  it("renders the Arabic map-first customer mock experience", async () => {
    const screen = await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 48, right: 0, bottom: 34, left: 0 }
        }}
      >
        <CustomerHomeScreen />
      </SafeAreaProvider>
    );

    expect(screen.getByText("واصل")).toBeTruthy();
    expect(screen.getByText("أهلًا بك، علي")).toBeTruthy();
    expect(screen.getByText("اطلب رحلة")).toBeTruthy();
    expect(screen.getByText("المنزل")).toBeTruthy();
    expect(screen.getByText("العمل")).toBeTruthy();
    expect(screen.getByText("سائقون قريبون")).toBeTruthy();
    expect(screen.getByText("خدمة واصل")).toBeTruthy();
    expect(screen.getAllByText("25 شيكل")).toHaveLength(2);
    expect(screen.queryByText("وصل عادي")).toBeNull();
    expect(screen.queryByText("وصل بلس")).toBeNull();
    expect(screen.queryByText("25 ر.س")).toBeNull();
    expect(screen.getByTestId("mock-route-map")).toBeTruthy();
    expect(screen.getByTestId("floating-bottom-nav")).toBeTruthy();
  });

  it("responds to customer mock taps", async () => {
    const screen = await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 48, right: 0, bottom: 34, left: 0 }
        }}
      >
        <CustomerHomeScreen />
      </SafeAreaProvider>
    );

    await fireEvent.press(screen.getByLabelText("اختيار المنزل"));
    expect(screen.getAllByText("الوجهة المختارة: المنزل")).toHaveLength(2);

    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    expect(screen.getByText("تم إرسال طلبك التجريبي")).toBeTruthy();
    expect(screen.getByText("الطلب المحدد: خدمة واصل • 25 شيكل")).toBeTruthy();

    await fireEvent.press(screen.getByText("رحلاتي"));
    expect(screen.getByText("التبويب النشط: رحلاتي")).toBeTruthy();
  });

  it("walks through the full mock customer ride flow", async () => {
    const screen = await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 48, right: 0, bottom: 34, left: 0 }
        }}
      >
        <CustomerHomeScreen />
      </SafeAreaProvider>
    );

    await fireEvent.press(screen.getByLabelText("اختيار المنزل"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
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
});
