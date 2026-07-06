import { describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render } from "@testing-library/react-native";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { controlSurfaces, glass, shadows, spacing } from "@/design/tokens";
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

function mockHardwareBackPress() {
  const callbacks: (() => boolean | null | undefined)[] = [];
  const remove = jest.fn();
  const addEventListenerSpy = jest
    .spyOn(BackHandler, "addEventListener")
    .mockImplementation((eventName, callback) => {
      if (eventName === "hardwareBackPress") {
        callbacks.push(callback);
      }

      return { remove } as unknown as ReturnType<typeof BackHandler.addEventListener>;
    });

  return {
    pressBack: () => callbacks.at(-1)?.(),
    restore: () => addEventListenerSpy.mockRestore()
  };
}

describe("CaptainHomeScreen", () => {
  it("exposes captain availability as an accessible switch", async () => {
    const screen = await renderCaptainHome();
    const availabilitySwitch = screen.getByRole("switch", { name: "تغيير حالة الكابتن" });

    expect(availabilitySwitch.props.accessibilityState).toEqual({ checked: true });

    await fireEvent.press(availabilitySwitch);

    expect(
      screen.getByRole("switch", { name: "تغيير حالة الكابتن" }).props.accessibilityState
    ).toEqual({ checked: false });
  });

  it("announces captain action feedback politely", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("اتصال بالعميل"));

    const notice = screen.getByText("سيتم تفعيل الاتصال بالعميل قريباً");
    expect(notice.props.accessibilityLiveRegion).toBe("polite");
    expect(notice.props.accessibilityRole).toBe("alert");
  });

  it("keeps captain scrolling responsive under the floating nav", async () => {
    const screen = await renderCaptainHome();
    const scroll = screen.getByTestId("captain-home-scroll");
    const contentStyle = StyleSheet.flatten(scroll.props.contentContainerStyle);

    expect(scroll.props.keyboardShouldPersistTaps).toBe("handled");
    expect(scroll.props.keyboardDismissMode).toBe("on-drag");
    expect(contentStyle.paddingBottom).toBe(34 + 120);
  });

  it("routes Android back from an active captain trip to the requests workspace", async () => {
    const hardwareBack = mockHardwareBackPress();
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب"));
    expect(screen.getByTestId("captain-active-trip-scroll")).toBeTruthy();

    await act(async () => {
      expect(hardwareBack.pressBack()).toBe(true);
    });

    expect(screen.queryByTestId("captain-active-trip-scroll")).toBeNull();
    expect(screen.getByTestId("captain-requests-workspace")).toBeTruthy();

    hardwareBack.restore();
  });

  it("keeps the floating navigation flexible for compact screens", async () => {
    const screen = await renderCaptainHome();
    const navStyle = StyleSheet.flatten(screen.getByTestId("captain-bottom-nav").props.style);
    const homeTab = screen.getByTestId("captain-motion-tab-home");
    const navItemStyle = StyleSheet.flatten(homeTab.props.style);

    expect(navStyle).toMatchObject({
      backgroundColor: glass.floating.backgroundColor,
      borderColor: glass.floating.borderColor,
      boxShadow: shadows.floating
    });
    expect(navItemStyle).toMatchObject({
      backgroundColor: controlSurfaces.activeNavigation.backgroundColor,
      borderColor: controlSurfaces.activeNavigation.borderColor,
      boxShadow: shadows.activeControl,
      flex: 1,
      maxWidth: 72,
      minWidth: 0
    });
    expect(homeTab.props.accessibilityRole).toBe("tab");
    expect(homeTab.props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByText("الرئيسية").props.numberOfLines).toBe(1);
  });

  it("keeps the captain home focused on one nearest-request decision", async () => {
    const screen = await renderCaptainHome();
    const requestStyle = StyleSheet.flatten(
      screen.getByTestId("captain-nearest-request-card").props.style
    );
    const routeStyle = StyleSheet.flatten(
      screen.getByTestId("captain-nearest-request-route").props.style
    );

    expect(screen.getByTestId("captain-focused-home")).toBeTruthy();
    expect(screen.getByTestId("captain-nearest-request-card")).toBeTruthy();
    expect(requestStyle).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(routeStyle).toMatchObject({
      backgroundColor: controlSurfaces.secondary.backgroundColor,
      borderColor: controlSurfaces.secondary.borderColor,
      boxShadow: shadows.cardSubtle
    });
    expect(screen.getByText("أقرب طلب جاهز")).toBeTruthy();
    expect(screen.getAllByLabelText("قبول الطلب")).toHaveLength(1);
    expect(screen.getByLabelText("عرض تفاصيل الطلب")).toBeTruthy();
    expect(screen.queryByText("مركز تشغيل الكابتن")).toBeNull();
    expect(screen.queryByText("ملخص طلب العميل")).toBeNull();
    expect(screen.queryByTestId("captain-decision-signal-panel")).toBeNull();
    expect(screen.queryByText("سجل التحديثات المباشرة")).toBeNull();

    await fireEvent.press(screen.getByLabelText("عرض تفاصيل الطلب"));

    expect(
      StyleSheet.flatten(screen.getByTestId("captain-request-details").props.style)
    ).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("captain-request-details-rows").props.style)
    ).toMatchObject({
      backgroundColor: controlSurfaces.secondary.backgroundColor,
      borderColor: controlSurfaces.secondary.borderColor,
      boxShadow: shadows.cardSubtle
    });
    expect(screen.queryByTestId("captain-nearest-request-card")).toBeNull();
    expect(screen.getByText("ملاحظة العميل")).toBeTruthy();
    expect(screen.getByText("نوع الخدمة")).toBeTruthy();
    expect(screen.getByText("طريقة الدفع")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إلغاء معاينة قبول الطلب"));

    expect(screen.getByTestId("captain-nearest-request-card")).toBeTruthy();
    expect(screen.queryByTestId("captain-request-details")).toBeNull();
  });

  it("keeps realtime updates inside the requests tab", async () => {
    const screen = await renderCaptainHome();

    expect(screen.queryByText("سجل التحديثات المباشرة")).toBeNull();

    await fireEvent.press(screen.getByLabelText("فتح تبويب الطلبات"));

    expect(screen.getByText("سجل التحديثات المباشرة")).toBeTruthy();
  });

  it("renders the premium captain dashboard with available mock request", async () => {
    const screen = await renderCaptainHome();

    expect(screen.getByText("تطبيق الكابتن")).toBeTruthy();
    expect(screen.getByText("أهلًا كابتن أحمد")).toBeTruthy();
    expect(screen.getByText("متصل")).toBeTruthy();
    expect(screen.getByText("أقرب طلب جاهز")).toBeTruthy();
    expect(screen.getByText("علي محمد")).toBeTruthy();
    expect(screen.getByText("زواتا ← نابلس - رفيديا")).toBeTruthy();
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("كاش عند الاستلام").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("قبول الطلب")).toBeTruthy();
    expect(screen.queryByText("620 شيكل")).toBeNull();
    expect(screen.queryByText("24")).toBeNull();
    expect(screen.queryByText("4.9")).toBeNull();
  });

  it("opens complete request details before confirming acceptance", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("عرض تفاصيل الطلب"));

    expect(screen.getByText("تفاصيل الطلب قبل القبول")).toBeTruthy();
    expect(screen.getByText("العميل المحدد")).toBeTruthy();
    expect(screen.getByText("رقم العميل")).toBeTruthy();
    expect(screen.getByText("المسار المقترح")).toBeTruthy();
    expect(screen.getByText("الدخل المتوقع")).toBeTruthy();
    expect(screen.getByText("المسافة")).toBeTruthy();
    expect(screen.getByText("جاهز للانطلاق")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تأكيد قبول الطلب"));
    expect(screen.getByTestId("captain-route-map")).toBeTruthy();
  });

  it("shows final captain acceptance readiness before confirming request", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("عرض تفاصيل الطلب"));

    expect(screen.getByTestId("captain-acceptance-readiness-strip")).toBeTruthy();
    expect(screen.getByText("الطلب جاهز للقبول")).toBeTruthy();
    expect(screen.getByText("المسار والدفع واضحان")).toBeTruthy();
    expect(screen.getByText("ابدأ خلال 3 د")).toBeTruthy();
  });

  it("keeps the captain acceptance readiness copy visually bounded", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("عرض تفاصيل الطلب"));

    expect(screen.getByText("الطلب جاهز للقبول").props.numberOfLines).toBe(1);
    expect(screen.getByText("المسار والدفع واضحان").props.numberOfLines).toBe(2);
    expect(screen.getByText("ابدأ خلال 3 د").props.numberOfLines).toBe(2);
    expect(screen.getByText("ابدأ خلال 3 د").props.adjustsFontSizeToFit).toBe(true);
  });

  it("surfaces customer service note and payment clearly for the captain", async () => {
    const screen = await renderCaptainHomeWithSubmittedRequestProbe();

    await fireEvent.press(screen.getByLabelText("إرسال طلب عميل مباشر للكابتن"));

    expect(screen.getByText("ليان سالم")).toBeTruthy();
    expect(screen.getAllByText("توصيل طلبية").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("فيزا • **** 4242").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("استلام من الباب الرئيسي وتسليم عند الاستقبال")).toBeNull();

    await fireEvent.press(screen.getByLabelText("عرض تفاصيل الطلب"));

    expect(screen.getByText("نوع الخدمة")).toBeTruthy();
    expect(screen.getByText("ملاحظة العميل")).toBeTruthy();
    expect(
      screen.getAllByText("استلام من الباب الرئيسي وتسليم عند الاستقبال").length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("طريقة الدفع")).toBeTruthy();
  });

  it("shows the core decision signals on the compact request card", async () => {
    const screen = await renderCaptainHomeWithSubmittedRequestProbe();

    await fireEvent.press(screen.getByLabelText("إرسال طلب عميل مباشر للكابتن"));

    expect(screen.getByTestId("captain-nearest-request-card")).toBeTruthy();
    expect(screen.getAllByText("35 شيكل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("الوصول")).toBeTruthy();
    expect(screen.getAllByText("4 د").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("المسار")).toBeTruthy();
    expect(screen.getAllByText("زواتا ← نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("الدفع")).toBeTruthy();
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

    await fireEvent.press(screen.getByLabelText("رفض الطلب"));

    expect(screen.getByText("تم رفض الطلب")).toBeTruthy();
    expect(screen.getByText("لا توجد طلبات متاحة الآن")).toBeTruthy();
    expect(screen.queryByText("الكابتن اعتذر عن الطلب")).toBeNull();

    await fireEvent.press(screen.getByLabelText("فتح تبويب الطلبات"));

    expect(screen.getAllByText("الكابتن اعتذر عن الطلب").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("علي محمد")).toBeNull();
  });

  it("moves an accepted request into the active captain trip mock flow", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب"));
    expect(
      StyleSheet.flatten(screen.getByTestId("captain-active-trip-hero").props.style)
    ).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("captain-active-trip-customer").props.style)
    ).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(screen.getByText("الرحلة الحالية")).toBeTruthy();
    expect(screen.getByText("الطريق إلى العميل")).toBeTruthy();
    expect(screen.getByText("علي محمد")).toBeTruthy();
    expect(screen.getAllByText("زواتا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("مطعم شورما عكيفك").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("كاش عند الاستلام")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    expect(screen.getByText("تم الوصول للعميل")).toBeTruthy();
    expect(screen.getByText("ابدأ الرحلة الآن")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء الرحلة"));
    expect(screen.getByText("العميل في الطريق")).toBeTruthy();
    expect(screen.getByText("إنهاء الرحلة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة"));
    expect(screen.getByText("تم إنهاء الرحلة")).toBeTruthy();
    expect(screen.getByText("25 شيكل تمت إضافتها للأرباح")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("العودة لقائمة الطلبات"));
    expect(screen.getByTestId("captain-requests-workspace")).toBeTruthy();
  });

  it("keeps the active captain trip scroll responsive through the trip flow", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب"));
    const scroll = screen.getByTestId("captain-active-trip-scroll");
    const contentStyle = StyleSheet.flatten(scroll.props.contentContainerStyle);

    expect(scroll.props.keyboardShouldPersistTaps).toBe("handled");
    expect(scroll.props.keyboardDismissMode).toBe("on-drag");
    expect(contentStyle.paddingBottom).toBe(34 + spacing.xxl);
  });

  it("guides the captain through the current trip action in one clear panel", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب"));

    expect(screen.getByTestId("captain-trip-action-guide")).toBeTruthy();
    expect(screen.getByText("خطوة الكابتن 1 من 4")).toBeTruthy();
    expect(screen.getByText("اتجه إلى العميل")).toBeTruthy();
    expect(screen.getByText("الزر التالي: وصلت للعميل")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));

    expect(screen.getByText("خطوة الكابتن 2 من 4")).toBeTruthy();
    expect(screen.getByText("ثبّت صعود العميل")).toBeTruthy();
    expect(screen.getByText("الزر التالي: ابدأ الرحلة الآن")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء الرحلة"));

    expect(screen.getByText("خطوة الكابتن 3 من 4")).toBeTruthy();
    expect(screen.getByText("قد إلى الوجهة")).toBeTruthy();
    expect(screen.getByText("الزر التالي: إنهاء الرحلة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة"));

    expect(screen.getByText("خطوة الكابتن 4 من 4")).toBeTruthy();
    expect(screen.getByText("الرحلة مكتملة")).toBeTruthy();
    expect(screen.getByText("الزر التالي: العودة للطلبات")).toBeTruthy();
  });

  it("shows a premium captain GPS route through pickup and destination steps", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب"));

    expect(screen.getByTestId("captain-route-map")).toHaveProp("accessibilityRole", "image");
    expect(screen.getByTestId("captain-route-map")).toHaveProp("accessible", true);
    expect(screen.getByText("خط سير الكابتن")).toBeTruthy();
    expect(screen.getByText("إلى نقطة الانطلاق")).toBeTruthy();
    expect(screen.getByText("المسار النشط: زواتا")).toBeTruthy();
    expect(screen.getByText("الوجهة التالية: نابلس - رفيديا")).toBeTruthy();
    expect(screen.getAllByText("مطعم شورما عكيفك").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    expect(screen.getByText("تم الوصول لنقطة الانطلاق")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء الرحلة"));
    expect(screen.getByText("من العميل إلى الوجهة")).toBeTruthy();
    expect(screen.getAllByText("2.4 كم").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة"));
    expect(screen.getByText("تم إكمال خط السير")).toBeTruthy();
  });

  it("keeps captain support and location sharing actions available during the trip", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب"));

    expect(screen.getByText("مركز دعم الكابتن")).toBeTruthy();
    expect(screen.getByText("مشاركة موقعي")).toBeTruthy();
    expect(screen.getByText("مشكلة بالرحلة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("مشاركة موقع الكابتن مع الدعم"));
    expect(screen.getByText("تم تجهيز مشاركة موقع الكابتن")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تسجيل مشكلة في الرحلة"));
    expect(screen.getByText("تم تسجيل مشكلة الرحلة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة"));

    expect(screen.getByText("العميل في الطريق")).toBeTruthy();
    expect(screen.getByText("مركز دعم الكابتن")).toBeTruthy();
    expect(screen.getByText("مشاركة موقعي")).toBeTruthy();
  });

  it("publishes captain trip progress to the shared mock state", async () => {
    const screen = await renderCaptainHomeWithSharedStepProbe();

    expect(screen.getByText("shared step: none")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("قبول الطلب"));
    expect(screen.getByText("shared step: pickup")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    expect(screen.getByText("shared step: arrived")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء الرحلة"));
    expect(screen.getByText("shared step: driving")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة"));
    expect(screen.getByText("shared step: completed")).toBeTruthy();
  });

  it("clears the completed accepted trip when captain returns to requests", async () => {
    const screen = await renderCaptainHomeWithSharedStepProbe();

    await fireEvent.press(screen.getByLabelText("قبول الطلب"));
    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة"));

    expect(screen.getByText("shared step: completed")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("العودة لقائمة الطلبات"));

    expect(screen.getByText("shared step: none")).toBeTruthy();
    expect(screen.getByText("لا توجد طلبات متاحة الآن")).toBeTruthy();
  });

  it("shows a premium earnings command center for captain payouts", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("فتح تبويب الأرباح"));

    expect(
      StyleSheet.flatten(screen.getByTestId("captain-earnings-overview").props.style)
    ).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(screen.getByText("مركز أرباح الكابتن")).toBeTruthy();
    expect(screen.getByText("صافي اليوم")).toBeTruthy();
    expect(screen.getByText("هدف اليوم: 78%")).toBeTruthy();
    expect(screen.getByText("متوسط الرحلة: 26 شيكل")).toBeTruthy();
    expect(screen.getByText("أفضل فترة: 6 م - 9 م")).toBeTruthy();
    expect(screen.getByText("رصيد قابل للسحب")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("مراجعة الأداء اليومي"));
    expect(screen.getByText("تم فتح مراجعة الأداء اليومي")).toBeTruthy();
  });

  it("shows the completed accepted trip inside captain earnings", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب"));
    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة"));
    await fireEvent.press(screen.getByLabelText("العودة لقائمة الطلبات"));
    await fireEvent.press(screen.getByLabelText("فتح تبويب الأرباح"));

    expect(screen.getByText("رحلات مكتملة من التطبيق")).toBeTruthy();
    expect(screen.getByText("علي محمد")).toBeTruthy();
    expect(screen.getByText("مطعم شورما عكيفك")).toBeTruthy();
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(1);
  });

  it("adds the completed accepted trip to captain earnings totals", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("قبول الطلب"));
    await fireEvent.press(screen.getByLabelText("تأكيد الوصول للعميل"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة"));
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

    await fireEvent.press(screen.getByLabelText("سحب الأرباح"));
    expect(screen.getByText("تم تجهيز طلب سحب الأرباح")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("فتح تبويب حسابي"));
    expect(screen.getByText("حساب الكابتن")).toBeTruthy();
    expect(screen.getByText("كابتن أحمد")).toBeTruthy();
    expect(screen.getByText("+970 59 555 1212")).toBeTruthy();
    expect(screen.getByText("تويوتا كورولا - أبيض")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("فتح تبويب الطلبات"));
    expect(screen.getByTestId("captain-requests-workspace")).toBeTruthy();
  });

  it("shows a premium captain profile readiness center", async () => {
    const screen = await renderCaptainHome();

    await fireEvent.press(screen.getByLabelText("فتح تبويب حسابي"));

    expect(
      StyleSheet.flatten(screen.getByTestId("captain-profile-overview").props.style)
    ).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(screen.getByText("مركز ملف الكابتن")).toBeTruthy();
    expect(screen.getByText("جاهزية الحساب")).toBeTruthy();
    expect(screen.getByText("موثق للتشغيل")).toBeTruthy();
    expect(screen.getByText("فحص المركبة: مكتمل")).toBeTruthy();
    expect(screen.getByText("تأمين الرحلات: فعال")).toBeTruthy();
    expect(screen.getByText("مستوى الخدمة: ممتاز")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تحديث بيانات الكابتن"));
    expect(screen.getByText("تم فتح تحديث بيانات الكابتن")).toBeTruthy();
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

    expect(screen.queryByText("مباشر")).toBeNull();

    await fireEvent.press(screen.getByLabelText("فتح تبويب الطلبات"));

    expect(screen.getByText("مباشر")).toBeTruthy();
    expect(screen.getAllByText("تقييم جديد من العميل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("سجل التحديثات المباشرة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("فتح تبويب الأرباح"));

    expect(screen.getByText("5.0")).toBeTruthy();
    expect(screen.queryByText("4.9")).toBeNull();
  });
});
