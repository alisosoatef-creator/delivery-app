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
              requestId: "request-live-customer"
            },
            type: "submit-customer-feedback"
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

async function renderCaptainHomeWithSubmittedRequestProbe() {
  function SubmittedRequestProbe() {
    const [, dispatchRideRequests] = useMockRideRequests();

    return (
      <Pressable
        accessibilityLabel="إرسال طلب عميل مباشر للكابتن"
        onPress={() =>
          dispatchRideRequests({
            request: {
              customerName: "ليان سالم",
              customerPhone: "+970 59 444 2211",
              destinationArea: "نابلس - رفيديا",
              destinationDetail: "استلام من الباب الرئيسي وتسليم عند الاستقبال",
              distance: "2.4 كم",
              etaToPickup: "4 د",
              id: "request-briefing-customer",
              paymentMethod: "فيزا • **** 4242",
              pickup: "زواتا",
              price: "35 شيكل",
              serviceLabel: "توصيل طلبية"
            },
            type: "submit-customer-request"
          })
        }
      >
        <Text>إرسال طلب عميل مباشر للكابتن</Text>
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
          <SubmittedRequestProbe />
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
    expect(screen.getAllByText("مطعم شورما عكيفك").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("كاش عند الاستلام").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("قبول الطلب")).toBeTruthy();
  });

  it("shows a stronger captain operations center with an accept preview", async () => {
    const screen = await renderCaptainHome();

    expect(screen.getByText("مركز تشغيل الكابتن")).toBeTruthy();
    expect(screen.getByText("جاهز لاستقبال الطلبات")).toBeTruthy();
    expect(screen.getByText("طلبات قريبة الآن: 1")).toBeTruthy();
    expect(screen.getByText("قوة المطابقة: 96%")).toBeTruthy();
    expect(screen.getByText("وقت الاستجابة المتوقع: أقل من دقيقة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("معاينة قبول الطلب التجريبي"));

    expect(screen.getByText("تفاصيل الطلب قبل القبول")).toBeTruthy();
    expect(screen.getByText("العميل المحدد")).toBeTruthy();
    expect(screen.getByText("المسار المقترح")).toBeTruthy();
    expect(screen.getByText("الدخل المتوقع")).toBeTruthy();
    expect(screen.getByText("جاهز للانطلاق")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تأكيد قبول الطلب"));
    expect(screen.getByTestId("captain-route-map")).toBeTruthy();
  });

  it("surfaces customer service note and payment clearly for the captain", async () => {
    const screen = await renderCaptainHomeWithSubmittedRequestProbe();

    await fireEvent.press(screen.getByLabelText("إرسال طلب عميل مباشر للكابتن"));

    expect(screen.getByText("ليان سالم")).toBeTruthy();
    expect(screen.getByText("ملخص طلب العميل")).toBeTruthy();
    expect(screen.getByText("الخدمة المطلوبة")).toBeTruthy();
    expect(screen.getAllByText("توصيل طلبية").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("ملاحظة العميل للكابتن")).toBeTruthy();
    expect(
      screen.getAllByText("استلام من الباب الرئيسي وتسليم عند الاستقبال").length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("طريقة الدفع المختارة")).toBeTruthy();
    expect(screen.getAllByText("فيزا • **** 4242").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("معاينة قبول الطلب التجريبي"));

    expect(screen.getByText("نوع الخدمة")).toBeTruthy();
    expect(screen.getByText("ملاحظة العميل")).toBeTruthy();
    expect(screen.getByText("طريقة الدفع")).toBeTruthy();
  });

  it("shows captain decision signals before accepting a customer request", async () => {
    const screen = await renderCaptainHomeWithSubmittedRequestProbe();

    await fireEvent.press(screen.getByLabelText("إرسال طلب عميل مباشر للكابتن"));

    expect(screen.getByTestId("captain-decision-signal-panel")).toBeTruthy();
    expect(screen.getByText("مؤشرات قرار الكابتن")).toBeTruthy();
    expect(screen.getByText("دخل واضح")).toBeTruthy();
    expect(screen.getAllByText("35 شيكل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("وصول سريع")).toBeTruthy();
    expect(screen.getAllByText("4 د").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("مسار مفهوم")).toBeTruthy();
    expect(screen.getAllByText("زواتا ← نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("دفع مؤكد")).toBeTruthy();
    expect(screen.getAllByText("فيزا • **** 4242").length).toBeGreaterThanOrEqual(1);
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
    expect(screen.getAllByText("مطعم شورما عكيفك").length).toBeGreaterThanOrEqual(1);
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

  it("shows a premium captain GPS route through pickup and destination steps", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب التجريبي"));

    expect(screen.getByTestId("captain-route-map")).toBeTruthy();
    expect(screen.getByText("خط سير الكابتن")).toBeTruthy();
    expect(screen.getByText("إلى نقطة الانطلاق")).toBeTruthy();
    expect(screen.getByText("المسار النشط: زواتا")).toBeTruthy();
    expect(screen.getByText("الوجهة التالية: نابلس - رفيديا")).toBeTruthy();
    expect(screen.getAllByText("مطعم شورما عكيفك").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    expect(screen.getByText("تم الوصول لنقطة الانطلاق")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء الرحلة التجريبية"));
    expect(screen.getByText("من العميل إلى الوجهة")).toBeTruthy();
    expect(screen.getAllByText("2.4 كم").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة التجريبية"));
    expect(screen.getByText("تم إكمال خط السير")).toBeTruthy();
  });

  it("keeps captain support and location sharing actions available during the trip", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب التجريبي"));

    expect(screen.getByText("مركز دعم الكابتن")).toBeTruthy();
    expect(screen.getByText("مشاركة موقعي")).toBeTruthy();
    expect(screen.getByText("مشكلة بالرحلة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("مشاركة موقع الكابتن مع الدعم"));
    expect(screen.getByText("تم تجهيز مشاركة موقع الكابتن mock")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تسجيل مشكلة في الرحلة"));
    expect(screen.getByText("تم تسجيل مشكلة الرحلة mock")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة التجريبية"));

    expect(screen.getByText("العميل في الطريق")).toBeTruthy();
    expect(screen.getByText("مركز دعم الكابتن")).toBeTruthy();
    expect(screen.getByText("مشاركة موقعي")).toBeTruthy();
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

  it("shows a premium earnings command center for captain payouts", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("فتح تبويب الأرباح"));

    expect(screen.getByText("مركز أرباح الكابتن")).toBeTruthy();
    expect(screen.getByText("صافي اليوم")).toBeTruthy();
    expect(screen.getByText("هدف اليوم: 78%")).toBeTruthy();
    expect(screen.getByText("متوسط الرحلة: 26 شيكل")).toBeTruthy();
    expect(screen.getByText("أفضل فترة: 6 م - 9 م")).toBeTruthy();
    expect(screen.getByText("رصيد قابل للسحب")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("مراجعة الأداء اليومي"));
    expect(screen.getByText("مراجعة الأداء اليومي mock فقط الآن")).toBeTruthy();
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
    expect(screen.getByTestId("captain-motion-tab-home")).toBeTruthy();
    expect(screen.getByTestId("captain-motion-tab-requests")).toBeTruthy();
    expect(screen.getByTestId("captain-motion-tab-earnings")).toBeTruthy();
    expect(screen.getByTestId("captain-motion-tab-profile")).toBeTruthy();
    expect(screen.getByTestId("captain-active-tab-motion-surface")).toBeTruthy();

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

  it("shows a premium captain profile readiness center", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("فتح تبويب حسابي"));

    expect(screen.getByText("مركز ملف الكابتن")).toBeTruthy();
    expect(screen.getByText("جاهزية الحساب")).toBeTruthy();
    expect(screen.getByText("موثق للتشغيل")).toBeTruthy();
    expect(screen.getByText("فحص المركبة: مكتمل")).toBeTruthy();
    expect(screen.getByText("تأمين الرحلات: فعال")).toBeTruthy();
    expect(screen.getByText("مستوى الخدمة: ممتاز")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تحديث بيانات الكابتن"));
    expect(screen.getByText("تحديث بيانات الكابتن mock فقط الآن")).toBeTruthy();
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
