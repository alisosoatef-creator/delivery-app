import { describe, expect, it, jest } from "@jest/globals";
import * as Haptics from "expo-haptics";
import { fireEvent, render } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MockAppProvider, useMockRideRequests } from "@/state/mock-app-context";

import { CustomerHomeScreen } from "../customer-home-screen";

async function renderCustomerHome() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 48, right: 0, bottom: 34, left: 0 }
      }}
    >
      <MockAppProvider>
        <CustomerHomeScreen />
      </MockAppProvider>
    </SafeAreaProvider>
  );
}

async function renderCustomerHomeWithCaptainAcceptanceProbe() {
  function CaptainAcceptanceProbe() {
    const [rideRequests, dispatchRideRequests] = useMockRideRequests();
    const feedback = rideRequests.customerFeedback
      ? `${rideRequests.customerFeedback.rating}-${rideRequests.customerFeedback.note}`
      : "none";

    return (
      <>
        <Text>{`shared feedback: ${feedback}`}</Text>
        <Pressable
          accessibilityLabel="قبول طلب العميل من الكابتن"
          onPress={() => dispatchRideRequests({ requestId: "request-live-customer", type: "accept-request" })}
        >
          <Text>قبول طلب العميل من الكابتن</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="بدء الرحلة من الكابتن"
          onPress={() =>
            dispatchRideRequests({
              requestId: "request-live-customer",
              step: "driving",
              type: "update-accepted-trip-step",
            })
          }
        >
          <Text>بدء الرحلة من الكابتن</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="وصول الكابتن للعميل"
          onPress={() =>
            dispatchRideRequests({
              requestId: "request-live-customer",
              step: "arrived",
              type: "update-accepted-trip-step",
            })
          }
        >
          <Text>وصول الكابتن للعميل</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="رفض طلب العميل من الكابتن"
          onPress={() => dispatchRideRequests({ requestId: "request-live-customer", type: "decline-request" })}
        >
          <Text>رفض طلب العميل من الكابتن</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="إنهاء الرحلة من الكابتن"
          onPress={() =>
            dispatchRideRequests({
              requestId: "request-live-customer",
              step: "completed",
              type: "update-accepted-trip-step",
            })
          }
        >
          <Text>إنهاء الرحلة من الكابتن</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="قطع الاتصال المباشر"
          onPress={() =>
            dispatchRideRequests({
              status: "offline",
              type: "set-realtime-connection-status",
            })
          }
        >
          <Text>قطع الاتصال المباشر</Text>
        </Pressable>
      </>
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
          <CustomerHomeScreen />
          <CaptainAcceptanceProbe />
        </View>
      </MockAppProvider>
    </SafeAreaProvider>
  );
}

describe("CustomerHomeScreen", () => {
  it("renders the Arabic map-first customer mock experience for Nablus", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByText("واصل")).toBeTruthy();
    expect(screen.getByText("أهلًا بك، علي")).toBeTruthy();
    expect(screen.getByText("اطلب رحلة")).toBeTruthy();
    expect(screen.getAllByText("زواتا").length).toBeGreaterThanOrEqual(1);
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

  it("surfaces a simple primary booking action that sends the customer to destination search", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByTestId("customer-primary-booking-card")).toBeTruthy();
    expect(screen.getByText("اطلب رحلتك بسهولة")).toBeTruthy();
    expect(screen.getByText("اختيار الوجهة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("اختيار الوجهة لبدء الطلب"));

    expect(screen.getAllByText("البحث").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("اختر وجهتك من البحث أو الأماكن المحفوظة")).toBeTruthy();
  });

  it("wraps the primary customer booking path with motion-ready surfaces", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByTestId("customer-motion-primary-booking")).toBeTruthy();
    expect(screen.getByTestId("customer-motion-booking-flow")).toBeTruthy();
    expect(screen.getByTestId("customer-motion-service-type")).toBeTruthy();
    expect(screen.getByTestId("customer-motion-service-next-step")).toBeTruthy();
  });

  it("adds haptic feedback to the primary destination action", async () => {
    const hapticSpy = jest.spyOn(Haptics, "impactAsync").mockResolvedValue();
    const screen = await renderCustomerHome();

    try {
      await fireEvent.press(screen.getByLabelText("اختيار الوجهة لبدء الطلب"));

      expect(hapticSpy).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    } finally {
      hapticSpy.mockRestore();
    }
  });

  it("summarizes the booking path in a compact three-step customer command strip", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByTestId("customer-booking-flow-strip")).toBeTruthy();
    expect(screen.getByText("ابدأ الطلب بثلاث خطوات")).toBeTruthy();
    expect(screen.getByText("نوع الخدمة")).toBeTruthy();
    expect(screen.getByText("الوجهة")).toBeTruthy();
    expect(screen.getByText("التأكيد")).toBeTruthy();
    expect(screen.getByText("الوجهة بانتظار اختيارك")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));

    expect(screen.getByText("الوجهة جاهزة")).toBeTruthy();
    expect(screen.getAllByText("مطعم شورما عكيفك").length).toBeGreaterThanOrEqual(1);
  });

  it("opens and closes a premium customer notification center", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("فتح التنبيهات"));

    expect(screen.getByText("مركز التنبيهات")).toBeTruthy();
    expect(screen.getByText("تحديثات رحلتك المهمة في مكان واحد")).toBeTruthy();
    expect(screen.getByText("الكابتن وصل للعميل")).toBeTruthy();
    expect(screen.getByText("تم قبول الطلب")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إغلاق التنبيهات"));

    expect(screen.queryByText("مركز التنبيهات")).toBeNull();
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
    expect(screen.getAllByText("تفصيل الوجهة").length).toBeGreaterThanOrEqual(1);

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
    expect(screen.getByText("مباشر")).toBeTruthy();
    expect(screen.getAllByText("طلب مباشر جديد").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("تم إرسال طلبك للكباتن القريبين").length).toBeGreaterThanOrEqual(1);
  });

  it("shows a clear live request hub after confirming a customer request", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.changeText(screen.getByLabelText("تفصيل الوجهة"), "مطعم شورما عكيفك - الباب الرئيسي");
    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByTestId("customer-live-request-hub")).toBeTruthy();
    expect(screen.getByText("مركز متابعة الطلب")).toBeTruthy();
    expect(screen.getAllByText("طلبك وصل للكباتن القريبين").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("حالة الطلب")).toBeTruthy();
    expect(screen.getAllByText("نبحث عن أقرب كابتن").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("نوع الخدمة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("رحلة داخل المدينة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("طريقة الدفع").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("فيزا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("ملاحظة للكابتن")).toBeTruthy();
    expect(screen.getAllByText("مطعم شورما عكيفك - الباب الرئيسي").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("الخطوة التالية")).toBeTruthy();
    expect(screen.getByText("سيظهر لك موقع الكابتن والمسافة فور قبول الطلب")).toBeTruthy();
  });

  it("lets the customer enable mock GPS and choose a pickup point before confirming", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByText("GPS mock غير مفعّل")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تفعيل موقع mock"));
    await fireEvent.press(screen.getByLabelText("اختيار نقطة انطلاق رفيديا"));

    expect(screen.getByText("GPS mock مفعّل")).toBeTruthy();
    expect(screen.getByText("نقطة الانطلاق: رفيديا")).toBeTruthy();
    expect(screen.getAllByText("رفيديا - قرب دوار الشهداء").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getAllByText("تأكيد الطلب").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("رفيديا").length).toBeGreaterThanOrEqual(1);
  });

  it("collects mock Visa details and save preference before confirmation", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("فيزا"));

    expect(screen.getByText("بطاقة فيزا mock")).toBeTruthy();
    expect(screen.getByText("بيانات تجريبية فقط، لن يتم خصم أي مبلغ الآن.")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("اسم حامل البطاقة"), "علي محمد");
    await fireEvent.changeText(screen.getByLabelText("رقم بطاقة فيزا"), "4242424242424242");
    await fireEvent.changeText(screen.getByLabelText("تاريخ انتهاء فيزا"), "09/28");
    await fireEvent.changeText(screen.getByLabelText("رمز CVC"), "123");
    await fireEvent.press(screen.getByLabelText("حفظ بطاقة فيزا لهذا الحساب"));

    expect(screen.getByText("سيتم استخدام فيزا • **** 4242")).toBeTruthy();
    expect(screen.getByText("سيتم حفظ البطاقة mock للاستخدام القادم")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getAllByText("فيزا • **** 4242").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("حفظ البطاقة")).toBeTruthy();
    expect(screen.getByText("نعم - mock")).toBeTruthy();
  });

  it("validates mock Visa details before showing the premium payment readiness state", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("فيزا"));

    await fireEvent.changeText(screen.getByLabelText("اسم حامل البطاقة"), "ع");
    await fireEvent.changeText(screen.getByLabelText("رقم بطاقة فيزا"), "123");
    await fireEvent.changeText(screen.getByLabelText("تاريخ انتهاء فيزا"), "13/99");
    await fireEvent.changeText(screen.getByLabelText("رمز CVC"), "1");

    expect(screen.getByText("أكمل بيانات فيزا قبل تأكيد الطلب")).toBeTruthy();
    expect(screen.getByText("اسم حامل البطاقة مطلوب")).toBeTruthy();
    expect(screen.getByText("رقم البطاقة يجب أن يكون 16 رقم")).toBeTruthy();
    expect(screen.getByText("تاريخ الانتهاء بصيغة MM/YY")).toBeTruthy();
    expect(screen.getByText("رمز CVC من 3 إلى 4 أرقام")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("اسم حامل البطاقة"), "علي محمد");
    await fireEvent.changeText(screen.getByLabelText("رقم بطاقة فيزا"), "4242424242424242");
    await fireEvent.changeText(screen.getByLabelText("تاريخ انتهاء فيزا"), "09/28");
    await fireEvent.changeText(screen.getByLabelText("رمز CVC"), "123");

    expect(screen.getByText("بيانات فيزا جاهزة للتجربة")).toBeTruthy();
    expect(screen.getByText("سيتم استخدام فيزا • **** 4242")).toBeTruthy();
  });

  it("lets the customer choose one of three simple service types before booking", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    expect(screen.getByTestId("customer-service-type-picker")).toBeTruthy();
    expect(screen.getByText("اختر نوع الخدمة")).toBeTruthy();
    expect(screen.getAllByText("رحلة داخل المدينة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("رحلة خارج المدينة")).toBeTruthy();
    expect(screen.getAllByText("توصيل طلبية").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("اختيار رحلة خارج المدينة"));

    expect(screen.getByText("تم اختيار رحلة خارج المدينة")).toBeTruthy();
    expect(screen.getAllByText("رحلة خارج المدينة").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("45 شيكل").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getAllByText("نوع الخدمة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("رحلة خارج المدينة").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("45 شيكل").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByText("الطلب المحدد: رحلة خارج المدينة • 45 شيكل")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getByText("45 شيكل")).toBeTruthy();
  });

  it("shows a focused next step for the selected service type", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("اختيار توصيل طلبية"));

    expect(screen.getByTestId("customer-service-next-step")).toBeTruthy();
    expect(screen.getByText("تجهيز توصيل الطلبية")).toBeTruthy();
    expect(screen.getByText("حدد نقطة الاستلام والتسليم وأضف وصف الغرض لاحقا.")).toBeTruthy();
    expect(screen.getByText("متابعة توصيل الطلبية")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("متابعة توصيل الطلبية"));

    expect(screen.getByText("ابحث عن وجهة تسليم الطلبية")).toBeTruthy();
    expect(screen.getAllByText("البحث").length).toBeGreaterThanOrEqual(1);
  });

  it("projects pickup destination detail and captain movement onto the mock map", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("تفعيل موقع mock"));
    await fireEvent.press(screen.getByLabelText("اختيار نقطة انطلاق رفيديا"));
    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.changeText(screen.getByLabelText("تفصيل الوجهة"), "مطعم شورما عكيفك - الباب الرئيسي");

    expect(screen.getByText("الخريطة الحية")).toBeTruthy();
    expect(screen.getByText("انطلاق: رفيديا")).toBeTruthy();
    expect(screen.getByText("وجهة: نابلس - رفيديا")).toBeTruthy();
    expect(screen.getByText("تفصيل: مطعم شورما عكيفك - الباب الرئيسي")).toBeTruthy();
    expect(screen.getByText("مسار تجريبي جاهز")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getAllByText("نبحث عن أقرب كابتن").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    expect(screen.getByText("الكابتن يتحرك الآن")).toBeTruthy();
    expect(screen.getByText("تتبع الكابتن")).toBeTruthy();
    expect(screen.getByText("موقع الكابتن الآن: قريب من رفيديا")).toBeTruthy();
    expect(screen.getByText("إحداثيات الكابتن: 32.2257, 35.2396")).toBeTruthy();
    expect(screen.getByText("المسافة بينكم: 1.2 كم")).toBeTruthy();
    expect(screen.getByText("وصل إلى: في الطريق إلى رفيديا")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("وصول الكابتن للعميل"));
    expect(screen.getByText("المسافة بينكم: 0.0 كم")).toBeTruthy();
    expect(screen.getByText("وصل إلى: نقطة الانطلاق")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));
    expect(screen.getAllByText("الرحلة بدأت").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("المسافة بينكم: 2.1 كم")).toBeTruthy();
    expect(screen.getByText("وصل إلى: باتجاه الوجهة")).toBeTruthy();
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
    expect(screen.getAllByText("تم الوصول").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("تقييم 5 نجوم"));
    expect(screen.getByText("تقييمك: 5 نجوم")).toBeTruthy();
  });

  it("shows a premium captain search radar with trip summary and cancel action", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByTestId("captain-search-radar")).toBeTruthy();
    expect(screen.getByText("ملخص البحث")).toBeTruthy();
    expect(screen.getAllByText("زواتا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("مطعم شورما عكيفك").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("كاش عند الاستلام").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("3 كباتن يطابقون الطلب")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إلغاء البحث"));

    expect(screen.getByText("تم إلغاء البحث عن كابتن")).toBeTruthy();
    expect(screen.queryByText("جاري البحث عن كابتن")).toBeNull();
  });

  it("shows a premium accepted captain card with mock contact actions", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("عرض الكابتن التجريبي"));

    expect(screen.getByTestId("accepted-captain-card")).toBeTruthy();
    expect(screen.getByText("تم قبول طلبك")).toBeTruthy();
    expect(screen.getAllByText("الكابتن في الطريق إليك").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("أحمد محمد")).toBeTruthy();
    expect(screen.getByText("تويوتا كامري 2022")).toBeTruthy();
    expect(screen.getByText("أبيض • لوحة 1234")).toBeTruthy();
    expect(screen.getByText("+970 59 555 1234")).toBeTruthy();
    expect(screen.getAllByText("قريب من رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("captain-arrival-panel")).toBeTruthy();
    expect(screen.getByText("لوحة وصول الكابتن")).toBeTruthy();
    expect(screen.getByText("يتجه الآن إلى نقطة الانطلاق")).toBeTruthy();
    expect(screen.getByText("المسافة حتى وصول الكابتن")).toBeTruthy();
    expect(screen.getByText("2.1 كم")).toBeTruthy();
    expect(screen.getByText("التحديث القادم")).toBeTruthy();
    expect(screen.getByText("سنخبرك فور اقترابه من نقطة الانطلاق")).toBeTruthy();
    expect(screen.getAllByText("زواتا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("اتصال بالكابتن"));
    expect(screen.getByText("زر الاتصال mock فقط الآن")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("رسالة للكابتن"));
    expect(screen.getByText("زر الرسالة mock فقط الآن")).toBeTruthy();
  });

  it("keeps customer safety and trip sharing actions available during the live ride", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("عرض الكابتن التجريبي"));

    expect(screen.getByText("مركز الأمان")).toBeTruthy();
    expect(screen.getByText("مشاركة الرحلة")).toBeTruthy();
    expect(screen.getByText("تنبيه أمان")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("مشاركة الرحلة مع جهة موثوقة"));
    expect(screen.getByText("تم تجهيز رابط مشاركة الرحلة mock")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إرسال تنبيه أمان للرحلة"));
    expect(screen.getByText("تم تسجيل تنبيه الأمان mock")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء الرحلة التجريبية"));

    expect(screen.getByText("الرحلة الحالية")).toBeTruthy();
    expect(screen.getByText("مركز الأمان")).toBeTruthy();
    expect(screen.getByText("مشاركة الرحلة")).toBeTruthy();
  });

  it("reflects captain acceptance automatically from the shared mock state", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByText("جاري البحث عن كابتن")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));

    expect(screen.getByTestId("accepted-captain-card")).toBeTruthy();
    expect(screen.getByText("تم قبول طلبك")).toBeTruthy();
    expect(screen.queryByText("جاري البحث عن كابتن")).toBeNull();
  });

  it("shows the customer when the captain arrives at pickup", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));

    expect(screen.getAllByText("الكابتن في الطريق إليك").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("وصول الكابتن للعميل"));

    expect(screen.getByTestId("accepted-captain-card")).toBeTruthy();
    expect(screen.getAllByText("الكابتن وصل إليك").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("الكابتن وصل للعميل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("customer-pickup-handoff-panel")).toBeTruthy();
    expect(screen.getByText("إجراءات الاستلام")).toBeTruthy();
    expect(screen.getByText("الكابتن وصل لنقطة الانطلاق")).toBeTruthy();
    expect(screen.getByText("رمز التحقق mock")).toBeTruthy();
    expect(screen.getByText("4821")).toBeTruthy();
    expect(screen.getByText("تأكد من المركبة واللوحة قبل الانطلاق")).toBeTruthy();
    expect(screen.getByText("جاهز لبدء الرحلة")).toBeTruthy();
    expect(screen.queryByText("الكابتن في الطريق إليك")).toBeNull();
  });

  it("shows realtime connection health and preserves the latest synced update offline", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByText("متصل مباشر")).toBeTruthy();
    expect(screen.getByText("آخر تحديث #1")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("قطع الاتصال المباشر"));

    expect(screen.getByText("غير متصل مؤقتًا")).toBeTruthy();
    expect(screen.getByText("آخر تحديث محفوظ #1")).toBeTruthy();
  });

  it("keeps customer search active when a captain declines and shows fallback realtime copy", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByText("جاري البحث عن كابتن")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("رفض طلب العميل من الكابتن"));

    expect(screen.getByText("جاري البحث عن كابتن")).toBeTruthy();
    expect(screen.getAllByText("الكابتن اعتذر عن الطلب").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("نبحث عن كابتن بديل يناسب رحلتك").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("تم قبول طلبك")).toBeNull();
  });

  it("reflects captain trip progress automatically from the shared mock state", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));

    expect(screen.getByText("تم قبول طلبك")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));

    expect(screen.getByText("الرحلة الحالية")).toBeTruthy();
    expect(screen.getByTestId("customer-active-ride-panel")).toBeTruthy();
    expect(screen.getByText("متابعة الرحلة النشطة")).toBeTruthy();
    expect(screen.getByText("الكابتن يتجه إلى الوجهة")).toBeTruthy();
    expect(screen.getByText("المسار الحالي")).toBeTruthy();
    expect(screen.getAllByText("زواتا ← نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("طريقة الدفع أثناء الرحلة")).toBeTruthy();
    expect(screen.getAllByText("كاش عند الاستلام").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("المتبقي للوصول")).toBeTruthy();
    expect(screen.getByText("سنخبرك عند الاقتراب من الوجهة")).toBeTruthy();
    expect(screen.queryByText("تم قبول طلبك")).toBeNull();

    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة من الكابتن"));

    expect(screen.getAllByText("تم الوصول").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("الرحلة الحالية")).toBeNull();
    expect(screen.getByText("سجل التحديثات المباشرة")).toBeTruthy();
    expect(screen.getAllByText("اكتملت الرحلة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("بدأت الرحلة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("تم قبول الطلب").length).toBeGreaterThanOrEqual(1);
  });

  it("shows the live accepted ride inside the customer trips tab", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.changeText(screen.getByLabelText("تفصيل الوجهة"), "مطعم شورما عكيفك - الباب الرئيسي");
    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));

    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getByText("العميل في الطريق")).toBeTruthy();
    expect(screen.getByText("مطعم شورما عكيفك - الباب الرئيسي")).toBeTruthy();
    expect(screen.getByText("فيزا")).toBeTruthy();
  });

  it("adds the completed live ride to the customer trips history", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.changeText(screen.getByLabelText("تفصيل الوجهة"), "مطعم شورما عكيفك - الباب الرئيسي");
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة من الكابتن"));

    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getAllByText("مطعم شورما عكيفك - الباب الرئيسي").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("الآن • 25 شيكل")).toBeTruthy();
  });

  it("shows a premium customer receipt after the live ride is completed", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.changeText(screen.getByLabelText("تفصيل الوجهة"), "مطعم شورما عكيفك - الباب الرئيسي");
    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة من الكابتن"));

    expect(screen.getByText("إيصال الرحلة")).toBeTruthy();
    expect(screen.getByText("رقم الإيصال: WAS-0001")).toBeTruthy();
    expect(screen.getByText("المبلغ المدفوع: 25 شيكل")).toBeTruthy();
    expect(screen.getByText("طريقة الدفع: فيزا")).toBeTruthy();
    expect(screen.getByText("الخدمة: خدمة واصل")).toBeTruthy();
    expect(screen.getByText("المسار: زواتا ← نابلس - رفيديا")).toBeTruthy();
    expect(screen.getByText("تفصيل الوجهة: مطعم شورما عكيفك - الباب الرئيسي")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تحميل إيصال الرحلة"));
    expect(screen.getByText("تم تجهيز إيصال الرحلة mock")).toBeTruthy();
  });

  it("submits premium post-trip feedback with quick praise tags", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.changeText(screen.getByLabelText("تفصيل الوجهة"), "مطعم شورما عكيفك - الباب الرئيسي");
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة من الكابتن"));

    expect(screen.getByText("تقييم التجربة")).toBeTruthy();
    expect(screen.getByText("كيف كانت الرحلة؟")).toBeTruthy();
    expect(screen.getByText("اختر ما أعجبك")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تقييم 5 نجوم"));
    await fireEvent.press(screen.getByLabelText("اختيار ملاحظة كابتن محترف"));
    await fireEvent.press(screen.getByLabelText("اختيار ملاحظة قيادة هادئة"));
    await fireEvent.changeText(screen.getByLabelText("ملاحظة الرحلة"), "الكابتن ممتاز");
    await fireEvent.press(screen.getByLabelText("إرسال تقييم الرحلة"));

    expect(screen.getByText("تم إرسال تقييم الرحلة للكابتن")).toBeTruthy();
    expect(screen.getByText("تقييمك: 5 نجوم")).toBeTruthy();
    expect(screen.getByText("ملاحظات مختارة: كابتن محترف، قيادة هادئة")).toBeTruthy();
    expect(screen.getByText("ملاحظتك: الكابتن ممتاز")).toBeTruthy();
    expect(screen.getByText("shared feedback: 5-كابتن محترف، قيادة هادئة • الكابتن ممتاز")).toBeTruthy();
  });

  it("shows a rich completed trip card with receipt, payment, and rating in trips history", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.changeText(screen.getByLabelText("تفصيل الوجهة"), "مطعم شورما عكيفك - الباب الرئيسي");
    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة من الكابتن"));
    await fireEvent.press(screen.getByLabelText("تقييم 5 نجوم"));
    await fireEvent.press(screen.getByLabelText("اختيار ملاحظة كابتن محترف"));
    await fireEvent.press(screen.getByLabelText("اختيار ملاحظة قيادة هادئة"));
    await fireEvent.changeText(screen.getByLabelText("ملاحظة الرحلة"), "الكابتن ممتاز");
    await fireEvent.press(screen.getByLabelText("إرسال تقييم الرحلة"));

    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getByText("ملخص الرحلة المكتملة")).toBeTruthy();
    expect(screen.getByText("إيصال WAS-0001")).toBeTruthy();
    expect(screen.getByText("حالة الدفع: مدفوع mock")).toBeTruthy();
    expect(screen.getByText("طريقة الدفع: فيزا")).toBeTruthy();
    expect(screen.getByText("تقييم الرحلة: 5 نجوم")).toBeTruthy();
    expect(screen.getByText("ملاحظاتك: كابتن محترف، قيادة هادئة • الكابتن ممتاز")).toBeTruthy();
    expect(screen.getAllByText("مطعم شورما عكيفك - الباب الرئيسي").length).toBeGreaterThanOrEqual(1);
  });

  it("collects completion feedback and clears the shared ride for a new trip", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("اختيار مطعم شورما عكيفك"));
    await fireEvent.changeText(screen.getByLabelText("تفصيل الوجهة"), "مطعم شورما عكيفك - الباب الرئيسي");
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة من الكابتن"));

    await fireEvent.press(screen.getByLabelText("تقييم 5 نجوم"));
    await fireEvent.changeText(screen.getByLabelText("ملاحظة الرحلة"), "الكابتن ممتاز");

    expect(screen.getByText("تقييمك: 5 نجوم")).toBeTruthy();
    expect(screen.getByText("ملاحظتك: الكابتن ممتاز")).toBeTruthy();
    expect(screen.getByText("shared feedback: 5-الكابتن ممتاز")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("رحلة جديدة"));
    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.queryByText("الآن • 25 شيكل")).toBeNull();
    expect(screen.queryByText("مطعم شورما عكيفك - الباب الرئيسي")).toBeNull();
  });

  it("keeps the floating nav interactive", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getByText("التبويب النشط: رحلاتي")).toBeTruthy();
  });

  it("shows a premium customer profile with wallet, payments, and security actions", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByText("حسابي"));

    expect(screen.getByText("حساب العميل")).toBeTruthy();
    expect(screen.getByText("محفظة واصل")).toBeTruthy();
    expect(screen.getByText("120 شيكل")).toBeTruthy();
    expect(screen.getByText("رصيد تجريبي")).toBeTruthy();
    expect(screen.getByText("8 نقاط")).toBeTruthy();
    expect(screen.getByText("طرق الدفع")).toBeTruthy();
    expect(screen.getAllByText("كاش عند الاستلام").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("فيزا • **** 4242")).toBeTruthy();
    expect(screen.getByText("مركز الأمان")).toBeTruthy();
    expect(screen.getByText("توثيق الجوال مفعّل")).toBeTruthy();
    expect(screen.getByText("مشاركة الرحلة مع جهة موثوقة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إضافة طريقة دفع mock"));
    expect(screen.getByText("تم فتح إضافة طريقة دفع mock")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إدارة أمان الحساب mock"));
    expect(screen.getByText("تم فتح إعدادات أمان الحساب mock")).toBeTruthy();
  });

  it("shows a customer trust center inside the profile tab", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByText("حسابي"));

    expect(screen.getByText("مركز ثقة العميل")).toBeTruthy();
    expect(screen.getByText("جاهزية الحساب")).toBeTruthy();
    expect(screen.getByText("رحلات آمنة")).toBeTruthy();
    expect(screen.getByText("الدفع محمي")).toBeTruthy();
    expect(screen.getByText("الملف مكتمل: 92%")).toBeTruthy();
    expect(screen.getByText("الوجهات المحفوظة: 4")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("مراجعة بيانات الحساب"));
    expect(screen.getByText("مراجعة بيانات الحساب mock فقط الآن")).toBeTruthy();
  });

  it("shows a premium destination discovery center in the search tab", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByText("البحث"));

    expect(screen.getByText("مركز اكتشاف الوجهات")).toBeTruthy();
    expect(screen.getByText("اقتراحات ذكية")).toBeTruthy();
    expect(screen.getByText("أقرب وجهة: المنزل")).toBeTruthy();
    expect(screen.getByText("نطاق البحث: نابلس")).toBeTruthy();
    expect(screen.getByText("وجهات محفوظة: 4")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تحديث اقتراحات البحث"));
    expect(screen.getByText("تم تحديث اقتراحات البحث mock فقط الآن")).toBeTruthy();
  });

  it("searches destinations from the search tab and prepares the selected place for booking", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByText("البحث"));

    expect(screen.getByText("بحث سريع")).toBeTruthy();
    expect(screen.getByText("اكتشف وجهتك")).toBeTruthy();
    expect(screen.getByText("اقتراحات قريبة")).toBeTruthy();
    expect(screen.getByLabelText("بحث الوجهات")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("بحث الوجهات"), "جامعة");

    expect(screen.getByText("نتائج البحث: 1")).toBeTruthy();
    expect(screen.getByText("جامعة النجاح")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("اختيار نتيجة جامعة النجاح"));

    expect(screen.getByText("تم اختيار جامعة النجاح من البحث")).toBeTruthy();
    expect(screen.getByText("وجهتك جاهزة")).toBeTruthy();
    expect(screen.getByText("نابلس - الحرم الجديد")).toBeTruthy();
    expect(screen.getByText("تفصيل: بوابة الجامعة الرئيسية")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("استخدام الوجهة المختارة"));

    expect(screen.getByText("تم تجهيز جامعة النجاح للطلب")).toBeTruthy();
    expect(screen.getByText("أهلًا بك، علي")).toBeTruthy();
    expect(screen.getAllByText("الوجهة المختارة: جامعة النجاح").length).toBeGreaterThanOrEqual(1);
  });

  it("adapts search guidance and selected destination copy to the active service type", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("اختيار توصيل طلبية"));
    await fireEvent.press(screen.getByLabelText("متابعة توصيل الطلبية"));

    expect(screen.getByText("بحث التسليم")).toBeTruthy();
    expect(screen.getByText("اختر نقطة تسليم الطلبية")).toBeTruthy();
    expect(screen.getByText("نطاق البحث: توصيل طلبية")).toBeTruthy();
    expect(screen.getByLabelText("بحث وجهة التسليم")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("اختيار نتيجة المنزل"));

    expect(screen.getByText("تم اختيار المنزل كوجهة تسليم")).toBeTruthy();
    expect(screen.getByText("وجهة التسليم جاهزة")).toBeTruthy();
    expect(screen.getByText("استخدام وجهة التسليم")).toBeTruthy();
  });

  it("lets delivery customers add a captain note from search before confirming", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("اختيار توصيل طلبية"));
    await fireEvent.press(screen.getByLabelText("متابعة توصيل الطلبية"));
    await fireEvent.press(screen.getByLabelText("اختيار نتيجة المنزل"));

    expect(screen.getByText("ملاحظة التسليم للكابتن")).toBeTruthy();
    expect(screen.getByText("اكتب وصفا قصيرا يساعد الكابتن يعرف نقطة التسليم بالضبط.")).toBeTruthy();

    await fireEvent.changeText(
      screen.getByLabelText("ملاحظة التسليم للكابتن"),
      "استلام من الباب الرئيسي وتسليم عند الاستقبال"
    );

    expect(screen.getByText("سيظهر للكابتن: استلام من الباب الرئيسي وتسليم عند الاستقبال")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("استخدام وجهة التسليم"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getAllByText("تفصيل الوجهة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("استلام من الباب الرئيسي وتسليم عند الاستقبال")).toBeTruthy();
    expect(screen.getAllByText("توصيل طلبية").length).toBeGreaterThanOrEqual(1);
  });

  it("switches customer tabs into trips, search, and profile mock surfaces", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getByText("رحلة حالية")).toBeTruthy();
    expect(screen.getByText("كابتن في الطريق")).toBeTruthy();
    expect(screen.getByText("زواتا ← نابلس - رفيديا")).toBeTruthy();
    expect(screen.getByText("أحمد محمد")).toBeTruthy();
    expect(screen.getByText("رحلات سابقة")).toBeTruthy();
    expect(screen.getByText("جامعة النجاح")).toBeTruthy();

    await fireEvent.press(screen.getByText("البحث"));

    expect(screen.getByText("بحث سريع")).toBeTruthy();
    expect(screen.getByText("الأماكن القريبة في نابلس جاهزة كتجربة mock")).toBeTruthy();
    expect(screen.getByTestId("mock-route-map")).toBeTruthy();

    await fireEvent.press(screen.getByText("حسابي"));

    expect(screen.getByText("حساب العميل")).toBeTruthy();
    expect(screen.getByText("علي محمد")).toBeTruthy();
    expect(screen.getByText("+970 59 000 4321")).toBeTruthy();
    expect(screen.getByText("نابلس")).toBeTruthy();
    expect(screen.getAllByText("كاش عند الاستلام").length).toBeGreaterThanOrEqual(1);
  });
});
