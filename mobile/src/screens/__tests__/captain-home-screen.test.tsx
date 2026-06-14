import { describe, expect, it } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MockAppProvider, useMockRideRequests } from "@/state/mock-app-context";

import { CaptainHomeScreen } from "../captain-home-screen";

async function renderCaptainHome() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 48, right: 0, bottom: 34, left: 0 }
      }}
    >
      <MockAppProvider>
        <CaptainHomeScreen />
      </MockAppProvider>
    </SafeAreaProvider>
  );
}

async function renderCaptainHomeWithSharedStepProbe() {
  function SharedStepProbe() {
    const [rideRequests] = useMockRideRequests();

    return <Text>{`shared step: ${rideRequests.acceptedTripStep ?? "none"}`}</Text>;
  }

  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 48, right: 0, bottom: 34, left: 0 }
      }}
    >
      <MockAppProvider>
        <View>
          <CaptainHomeScreen />
          <SharedStepProbe />
        </View>
      </MockAppProvider>
    </SafeAreaProvider>
  );
}

async function renderCaptainHomeWithCustomerFeedbackProbe() {
  function CustomerFeedbackProbe() {
    const [, dispatchRideRequests] = useMockRideRequests();

    return (
      <Pressable
        accessibilityLabel="إضافة تقييم عميل للكابتن"
        onPress={() =>
          dispatchRideRequests({
            feedback: {
              note: "الكابتن ممتاز",
              rating: 5,
              requestId: "request-live-customer",
            },
            type: "submit-customer-feedback",
          })
        }
      >
        <Text>إضافة تقييم عميل للكابتن</Text>
      </Pressable>
    );
  }

  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 48, right: 0, bottom: 34, left: 0 }
      }}
    >
      <MockAppProvider>
        <View>
          <CaptainHomeScreen />
          <CustomerFeedbackProbe />
        </View>
      </MockAppProvider>
    </SafeAreaProvider>
  );
}

describe("CaptainHomeScreen", () => {
  it("renders the premium captain dashboard with available mock request", async () => {
    const screen = await renderCaptainHome();

    expect(screen.getByText("تطبيق الكابتن")).toBeTruthy();
    expect(screen.getByText("أهلًا كابتن أحمد")).toBeTruthy();
    expect(screen.getByText("متصل")).toBeTruthy();
    expect(screen.getByText("620 شيكل")).toBeTruthy();
    expect(screen.getByText("24")).toBeTruthy();
    expect(screen.getByText("4.9")).toBeTruthy();
    expect(screen.getByText("الطلبات المتاحة")).toBeTruthy();
    expect(screen.getByText("علي محمد")).toBeTruthy();
    expect(screen.getByText("+970 59 111 2222")).toBeTruthy();
    expect(screen.getAllByText("زواتا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("مطعم شورما عكيفك")).toBeTruthy();
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("كاش عند الاستلام")).toBeTruthy();
    expect(screen.getByText("قبول الطلب")).toBeTruthy();
  });

  it("toggles captain availability", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("تغيير حالة الكابتن"));
    expect(screen.getByText("غير متصل")).toBeTruthy();
  });

  it("lets the captain decline an available request", async () => {
    const screen = await renderCaptainHome();

    expect(screen.getByText("علي محمد")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("رفض الطلب التجريبي"));

    expect(screen.getByText("تم رفض الطلب التجريبي")).toBeTruthy();
    expect(screen.getByText("لا توجد طلبات متاحة الآن")).toBeTruthy();
    expect(screen.getAllByText("الكابتن اعتذر عن الطلب").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("علي محمد")).toBeNull();
  });

  it("moves an accepted request into the active captain trip mock flow", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب التجريبي"));
    expect(screen.getByText("الرحلة الحالية")).toBeTruthy();
    expect(screen.getByText("الطريق إلى العميل")).toBeTruthy();
    expect(screen.getByText("علي محمد")).toBeTruthy();
    expect(screen.getByText("زواتا")).toBeTruthy();
    expect(screen.getByText("نابلس - رفيديا")).toBeTruthy();
    expect(screen.getByText("مطعم شورما عكيفك")).toBeTruthy();
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("كاش عند الاستلام")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    expect(screen.getByText("تم الوصول للعميل")).toBeTruthy();
    expect(screen.getByText("ابدأ الرحلة الآن")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء الرحلة التجريبية"));
    expect(screen.getByText("العميل في الطريق")).toBeTruthy();
    expect(screen.getByText("إنهاء الرحلة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة التجريبية"));
    expect(screen.getByText("تم إنهاء الرحلة")).toBeTruthy();
    expect(screen.getByText("25 شيكل تمت إضافتها للأرباح mock")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("العودة لقائمة الطلبات"));
    expect(screen.getByText("الطلبات المتاحة")).toBeTruthy();
  });

  it("publishes captain trip progress to the shared mock state", async () => {
    const screen = await renderCaptainHomeWithSharedStepProbe();

    expect(screen.getByText("shared step: none")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("قبول الطلب التجريبي"));
    expect(screen.getByText("shared step: pickup")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    expect(screen.getByText("shared step: arrived")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء الرحلة التجريبية"));
    expect(screen.getByText("shared step: driving")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة التجريبية"));
    expect(screen.getByText("shared step: completed")).toBeTruthy();
  });

  it("clears the completed accepted trip when captain returns to requests", async () => {
    const screen = await renderCaptainHomeWithSharedStepProbe();

    await fireEvent.press(screen.getByLabelText("قبول الطلب التجريبي"));
    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة التجريبية"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة التجريبية"));

    expect(screen.getByText("shared step: completed")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("العودة لقائمة الطلبات"));

    expect(screen.getByText("shared step: none")).toBeTruthy();
    expect(screen.getByText("لا توجد طلبات متاحة الآن")).toBeTruthy();
  });

  it("shows the completed accepted trip inside captain earnings", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب التجريبي"));
    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة التجريبية"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة التجريبية"));
    await fireEvent.press(screen.getByLabelText("العودة لقائمة الطلبات"));
    await fireEvent.press(screen.getByLabelText("فتح تبويب الأرباح"));

    expect(screen.getByText("رحلات مكتملة من التطبيق")).toBeTruthy();
    expect(screen.getByText("علي محمد")).toBeTruthy();
    expect(screen.getByText("مطعم شورما عكيفك")).toBeTruthy();
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(1);
  });

  it("adds the completed accepted trip to captain earnings totals", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب التجريبي"));
    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة التجريبية"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة التجريبية"));
    await fireEvent.press(screen.getByLabelText("العودة لقائمة الطلبات"));
    await fireEvent.press(screen.getByLabelText("فتح تبويب الأرباح"));

    expect(screen.getByText("645 شيكل")).toBeTruthy();
    expect(screen.getByText("25 رحلة مكتملة")).toBeTruthy();
  });

  it("switches between captain bottom nav mock tabs", async () => {
    const screen = await renderCaptainHome();

    expect(screen.getByTestId("captain-bottom-nav")).toBeTruthy();
    expect(screen.getByText("الرئيسية")).toBeTruthy();
    expect(screen.getByText("الطلبات")).toBeTruthy();
    expect(screen.getByText("الأرباح")).toBeTruthy();
    expect(screen.getByText("حسابي")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("فتح تبويب الأرباح"));
    expect(screen.getByText("أرباح الكابتن")).toBeTruthy();
    expect(screen.getByText("إجمالي أرباح اليوم")).toBeTruthy();
    expect(screen.getByText("620 شيكل")).toBeTruthy();
    expect(screen.getByText("24 رحلة مكتملة")).toBeTruthy();
    expect(screen.getByText("آخر دفعة")).toBeTruthy();
    expect(screen.getByText("سحب الأرباح")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("سحب أرباح تجريبي"));
    expect(screen.getByText("طلب السحب mock فقط الآن")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("فتح تبويب حسابي"));
    expect(screen.getByText("حساب الكابتن")).toBeTruthy();
    expect(screen.getByText("كابتن أحمد")).toBeTruthy();
    expect(screen.getByText("+970 59 555 1212")).toBeTruthy();
    expect(screen.getByText("تويوتا كورولا - أبيض")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("فتح تبويب الطلبات"));
    expect(screen.getByText("الطلبات المتاحة")).toBeTruthy();
  });

  it("shows the latest customer feedback inside captain profile", async () => {
    const screen = await renderCaptainHomeWithCustomerFeedbackProbe();

    await fireEvent.press(screen.getByLabelText("إضافة تقييم عميل للكابتن"));
    await fireEvent.press(screen.getByLabelText("فتح تبويب حسابي"));

    expect(screen.getByText("آخر تقييم من العميل")).toBeTruthy();
    expect(screen.getByText("5 نجوم")).toBeTruthy();
    expect(screen.getByText("الكابتن ممتاز")).toBeTruthy();
  });

  it("updates captain rating summary from the latest customer feedback", async () => {
    const screen = await renderCaptainHomeWithCustomerFeedbackProbe();

    await fireEvent.press(screen.getByLabelText("إضافة تقييم عميل للكابتن"));

    expect(screen.getByText("مباشر")).toBeTruthy();
    expect(screen.getAllByText("تقييم جديد من العميل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("سجل التحديثات المباشرة")).toBeTruthy();
    expect(screen.getByText("5.0")).toBeTruthy();
    expect(screen.queryByText("4.9")).toBeNull();

    await fireEvent.press(screen.getByLabelText("فتح تبويب الأرباح"));

    expect(screen.getByText("5.0")).toBeTruthy();
    expect(screen.queryByText("4.9")).toBeNull();
  });
});
