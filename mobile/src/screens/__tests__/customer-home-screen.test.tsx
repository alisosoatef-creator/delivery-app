import { describe, expect, it, jest } from "@jest/globals";
import * as Haptics from "expo-haptics";
import { act, fireEvent, render } from "@testing-library/react-native";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { controlSurfaces, glass, shadows } from "@/design/tokens";
import { MockAppProvider, useMockRideRequests } from "@/state/mock-app-context";

import { CustomerHomeScreen } from "../customer-home-screen";

async function renderCustomerLanding() {
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

async function renderCustomerServiceSelection() {
  const screen = await renderCustomerLanding();

  await fireEvent.press(screen.getByLabelText("بدء طلب رحلة"));

  return screen;
}

async function renderCustomerPickupSelection() {
  const screen = await renderCustomerServiceSelection();

  await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));

  return screen;
}

async function renderCustomerDestinationSelection() {
  const screen = await renderCustomerPickupSelection();

  await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));

  return screen;
}

async function renderCustomerHome() {
  const screen = await renderCustomerDestinationSelection();

  await fireEvent.press(screen.getByLabelText("اختيار وجهة مطعم شورما عكيفك"));
  await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));

  return screen;
}

async function fillMockVisaDetails(screen: Awaited<ReturnType<typeof render>>) {
  await fireEvent.changeText(screen.getByLabelText("اسم حامل البطاقة"), "علي محمد");
  await fireEvent.changeText(screen.getByLabelText("رقم بطاقة فيزا"), "4242424242424242");
  await fireEvent.changeText(screen.getByLabelText("تاريخ انتهاء فيزا"), "09/28");
  await fireEvent.changeText(screen.getByLabelText("رمز CVC"), "123");
}

async function renderCustomerHomeWithCaptainAcceptanceProbe(
  advanceTo: "service" | "pickup" | "destination" | "details" = "details"
) {
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
          onPress={() =>
            dispatchRideRequests({ requestId: "request-live-customer", type: "accept-request" })
          }
        >
          <Text>قبول طلب العميل من الكابتن</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="بدء الرحلة من الكابتن"
          onPress={() =>
            dispatchRideRequests({
              requestId: "request-live-customer",
              step: "driving",
              type: "update-accepted-trip-step"
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
              type: "update-accepted-trip-step"
            })
          }
        >
          <Text>وصول الكابتن للعميل</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="رفض طلب العميل من الكابتن"
          onPress={() =>
            dispatchRideRequests({ requestId: "request-live-customer", type: "decline-request" })
          }
        >
          <Text>رفض طلب العميل من الكابتن</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="إنهاء الرحلة من الكابتن"
          onPress={() =>
            dispatchRideRequests({
              requestId: "request-live-customer",
              step: "completed",
              type: "update-accepted-trip-step"
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
              type: "set-realtime-connection-status"
            })
          }
        >
          <Text>قطع الاتصال المباشر</Text>
        </Pressable>
      </>
    );
  }

  const screen = await render(
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

  await fireEvent.press(screen.getByLabelText("بدء طلب رحلة"));
  if (advanceTo !== "service") {
    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));
  }
  if (advanceTo === "destination" || advanceTo === "details") {
    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));
  }
  if (advanceTo === "details") {
    await fireEvent.press(screen.getByLabelText("اختيار وجهة مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));
  }

  return screen;
}

describe("CustomerHomeScreen", () => {
  it("announces customer action feedback politely", async () => {
    const screen = await renderCustomerLanding();

    await fireEvent.press(screen.getByLabelText("فتح تبويب البحث"));
    await fireEvent.press(screen.getByLabelText("تحديث اقتراحات البحث"));

    const notice = screen.getByText("تم تحديث اقتراحات البحث mock فقط الآن");
    expect(notice.props.accessibilityLiveRegion).toBe("polite");
    expect(notice.props.accessibilityRole).toBe("alert");
  });

  it("keeps customer scrolling responsive while search and payment forms are open", async () => {
    const screen = await renderCustomerLanding();

    const scroll = screen.getByTestId("customer-home-scroll");
    const contentStyle = StyleSheet.flatten(scroll.props.contentContainerStyle);

    expect(scroll.props.keyboardShouldPersistTaps).toBe("handled");
    expect(scroll.props.keyboardDismissMode).toBe("on-drag");
    expect(contentStyle.paddingBottom).toBe(34 + 120);
  });

  it("uses mobile-friendly keyboard actions in customer search and payment fields", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByLabelText("تفصيل الوجهة").props.returnKeyType).toBe("done");

    await fireEvent.press(screen.getByLabelText("فيزا"));
    expect(screen.getByLabelText("اسم حامل البطاقة").props.returnKeyType).toBe("next");
    expect(screen.getByLabelText("رقم بطاقة فيزا").props.returnKeyType).toBe("next");
    expect(screen.getByLabelText("تاريخ انتهاء فيزا").props.returnKeyType).toBe("next");
    expect(screen.getByLabelText("رمز CVC").props.returnKeyType).toBe("done");

    await fireEvent.press(screen.getByText("البحث"));
    expect(screen.getByLabelText("بحث الوجهات").props.returnKeyType).toBe("search");
  });

  it("exposes search filters as accessible radio controls with safe touch targets", async () => {
    const screen = await renderCustomerLanding();

    await fireEvent.press(screen.getByLabelText("فتح تبويب البحث"));

    const allFilter = screen.getByRole("radio", { name: "فلتر البحث الكل" });
    const filterStyle = StyleSheet.flatten(allFilter.props.style);

    expect(allFilter.props.accessibilityState).toEqual({ checked: true });
    expect(filterStyle.minHeight).toBe(44);

    await fireEvent.press(screen.getByRole("radio", { name: "فلتر البحث جامعات" }));

    expect(
      screen.getByRole("radio", { name: "فلتر البحث جامعات" }).props.accessibilityState
    ).toEqual({ checked: true });
  });

  it("exposes payment methods as one checked radio choice", async () => {
    const screen = await renderCustomerHome();

    expect(
      screen.getByRole("radio", { name: "كاش عند الاستلام" }).props.accessibilityState
    ).toEqual({ checked: true });
    expect(screen.getByRole("radio", { name: "فيزا" }).props.accessibilityState).toEqual({
      checked: false
    });

    await fireEvent.press(screen.getByRole("radio", { name: "فيزا" }));

    expect(screen.getByRole("radio", { name: "فيزا" }).props.accessibilityState).toEqual({
      checked: true
    });
  });

  it("keeps the floating navigation flexible for compact screens", async () => {
    const screen = await renderCustomerLanding();
    const navStyle = StyleSheet.flatten(screen.getByTestId("floating-bottom-nav").props.style);
    const homeTab = screen.getByTestId("customer-motion-tab-0");
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

  it("hides the floating navigation while the Android keyboard is visible", async () => {
    const callbacks: Record<string, (() => void) | undefined> = {};
    const addListenerSpy = jest
      .spyOn(Keyboard, "addListener")
      .mockImplementation((event, callback) => {
        callbacks[event] = callback as () => void;

        return { remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>;
      });
    const screen = await renderCustomerLanding();

    expect(screen.getByTestId("floating-bottom-nav")).toBeTruthy();

    await act(async () => {
      callbacks.keyboardDidShow?.();
    });

    expect(screen.queryByTestId("floating-bottom-nav")).toBeNull();

    await act(async () => {
      callbacks.keyboardDidHide?.();
    });

    expect(screen.getByTestId("floating-bottom-nav")).toBeTruthy();
    addListenerSpy.mockRestore();
  });

  it("hides the floating navigation while the booking flow is open", async () => {
    const screen = await renderCustomerLanding();

    expect(screen.getByTestId("floating-bottom-nav")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("بدء طلب رحلة"));

    expect(screen.queryByTestId("floating-bottom-nav")).toBeNull();
  });

  it("hides the floating navigation while choosing a destination", async () => {
    const screen = await renderCustomerDestinationSelection();

    expect(screen.getByTestId("customer-destination-selection-page")).toBeTruthy();
    expect(screen.queryByTestId("floating-bottom-nav")).toBeNull();
  });

  it("keeps the customer landing focused on one clear ride request action", async () => {
    const screen = await renderCustomerLanding();
    const launcherStyle = StyleSheet.flatten(
      screen.getByTestId("customer-booking-launcher").props.style
    );

    expect(screen.getByTestId("customer-focused-home")).toBeTruthy();
    expect(screen.getByTestId("customer-home-ready-status")).toBeTruthy();
    expect(launcherStyle).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(screen.getByText("اطلب رحلتك الآن")).toBeTruthy();
    expect(screen.getByText("ابدأ بطلب واحد واضح، وبعدها نرتب النوع والموقع والدفع خطوة بخطوة.")).toBeTruthy();
    expect(screen.getAllByLabelText("بدء طلب رحلة")).toHaveLength(1);
    expect(screen.queryByText("جاهز لطلب جديد")).toBeNull();
    expect(screen.queryByText("رحلتك تبدأ من هنا")).toBeNull();
    expect(screen.queryByTestId("customer-service-type-picker")).toBeNull();
    expect(screen.queryByTestId("mock-route-map")).toBeNull();
  });

  it("opens a dedicated booking workspace from a focused customer home", async () => {
    const screen = await renderCustomerLanding();

    expect(screen.getByTestId("customer-booking-launcher")).toBeTruthy();
    expect(screen.getByText("جاهز لمشوارك؟")).toBeTruthy();
    expect(screen.queryByTestId("customer-service-type-picker")).toBeNull();

    await fireEvent.press(screen.getByLabelText("بدء طلب رحلة"));

    expect(screen.getByTestId("customer-booking-workspace")).toBeTruthy();
    expect(screen.getByTestId("customer-service-type-picker")).toBeTruthy();
    expect(screen.getByLabelText("العودة إلى الرئيسية")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("العودة إلى الرئيسية"));

    expect(screen.getByTestId("customer-booking-launcher")).toBeTruthy();
    expect(screen.queryByTestId("customer-booking-workspace")).toBeNull();
  });

  it("starts booking on a dedicated three-option service selection page", async () => {
    const screen = await renderCustomerLanding();

    await fireEvent.press(screen.getByLabelText("بدء طلب رحلة"));

    const selectedCityStyle = StyleSheet.flatten(
      screen.getByTestId("customer-service-option-city").props.style
    );
    expect(selectedCityStyle).toMatchObject({
      backgroundColor: controlSurfaces.activeNavigation.backgroundColor,
      borderColor: controlSurfaces.activeNavigation.borderColor,
      boxShadow: shadows.activeControl
    });
    expect(screen.getByTestId("customer-service-selection-page")).toBeTruthy();
    expect(screen.getByText("اختر نوع رحلتك")).toBeTruthy();
    expect(screen.getByLabelText("اختيار رحلة داخل المدينة")).toBeTruthy();
    expect(screen.getByLabelText("اختيار رحلة خارج المدينة")).toBeTruthy();
    expect(screen.getByLabelText("اختيار توصيل طلبية")).toBeTruthy();
    expect(screen.getByText("تاكسي سكودا")).toBeTruthy();
    expect(screen.getByText("سيارة مريحة")).toBeTruthy();
    expect(screen.getByText("سيارة كادي")).toBeTruthy();
    expect(screen.getByText("الأسرع داخل المدينة")).toBeTruthy();
    expect(screen.getByText("للمشاوير الطويلة")).toBeTruthy();
    expect(screen.getByText("للأغراض والطلبيات")).toBeTruthy();
    expect(screen.getByText("متابعة رحلة داخل المدينة")).toBeTruthy();
    expect(screen.queryByTestId("mock-route-map")).toBeNull();

    await fireEvent.press(screen.getByLabelText("اختيار توصيل طلبية"));
    expect(screen.getByText("متابعة توصيل الطلبية")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));

    expect(screen.getByTestId("customer-pickup-selection-page")).toBeTruthy();
    expect(screen.queryByTestId("mock-route-map")).toBeNull();
    expect(screen.getAllByText("توصيل طلبية").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByTestId("customer-service-type-picker")).toBeNull();
  });

  it("shows a simple step-by-step booking progress guide", async () => {
    const screen = await renderCustomerLanding();

    await fireEvent.press(screen.getByLabelText("بدء طلب رحلة"));

    expect(screen.getByTestId("customer-booking-progress")).toBeTruthy();
    expect(screen.getByText("الخطوة 1 من 4")).toBeTruthy();
    expect(screen.getByText("نوع الرحلة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));

    expect(screen.getByText("الخطوة 2 من 4")).toBeTruthy();
    expect(screen.getByText("اختيار موقع الانطلاق")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));

    expect(screen.getByText("الخطوة 3 من 4")).toBeTruthy();
    expect(screen.getByText("الوجهة والملاحظة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("اختيار وجهة مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));

    expect(screen.getByText("الخطوة 4 من 4")).toBeTruthy();
    expect(screen.getByText("المراجعة والدفع")).toBeTruthy();
  });

  it("uses a dedicated pickup step with mock GPS before destination selection", async () => {
    const screen = await renderCustomerLanding();

    await fireEvent.press(screen.getByLabelText("بدء طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));

    expect(screen.getByTestId("customer-pickup-selection-page")).toBeTruthy();
    expect(screen.getByText("حدد موقع الانطلاق")).toBeTruthy();
    expect(screen.getByText("GPS mock غير مفعّل")).toBeTruthy();
    expect(screen.queryByTestId("mock-route-map")).toBeNull();

    await fireEvent.press(screen.getByLabelText("تفعيل موقع mock"));
    await fireEvent.press(screen.getByLabelText("اختيار نقطة انطلاق رفيديا"));

    expect(screen.getByText("GPS mock مفعّل")).toBeTruthy();
    expect(screen.getByText("نقطة الانطلاق: رفيديا")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));

    expect(screen.getByTestId("customer-destination-selection-page")).toBeTruthy();
    expect(screen.getByTestId("mock-route-map")).toBeTruthy();
    expect(screen.getByText("انطلاق: رفيديا")).toBeTruthy();
    expect(screen.queryByTestId("customer-pickup-location-card")).toBeNull();
  });

  it("uses a dedicated destination step with search, map, distance, and captain note", async () => {
    const screen = await renderCustomerLanding();

    await fireEvent.press(screen.getByLabelText("بدء طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));
    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));

    expect(screen.getByTestId("customer-destination-selection-page")).toBeTruthy();
    expect(screen.getByText("اختر وجهتك")).toBeTruthy();
    expect(screen.getByLabelText("ابحث عن وجهة")).toBeTruthy();
    expect(screen.getByTestId("mock-route-map")).toBeTruthy();
    expect(screen.queryByTestId("customer-booking-details-page")).toBeNull();
    expect(screen.queryByLabelText("متابعة من الوجهة")).toBeNull();

    await fireEvent.changeText(screen.getByLabelText("ابحث عن وجهة"), "جامعة");

    expect(screen.getByLabelText("اختيار وجهة جامعة النجاح")).toBeTruthy();
    expect(screen.queryByLabelText("اختيار وجهة مطعم شورما عكيفك")).toBeNull();

    await fireEvent.press(screen.getByLabelText("اختيار وجهة جامعة النجاح"));
    await fireEvent.changeText(
      screen.getByLabelText("ملاحظة الوصول للكابتن"),
      "بوابة الجامعة الرئيسية"
    );

    expect(screen.getAllByText("3.1 كم").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("بوابة الجامعة الرئيسية").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));

    expect(screen.getByTestId("customer-booking-details-page")).toBeTruthy();
    expect(screen.getAllByText("جامعة النجاح").length).toBeGreaterThanOrEqual(1);
  });

  it("shows a compact booking review without repeating destination discovery", async () => {
    const screen = await renderCustomerHome();
    const reviewStyle = StyleSheet.flatten(
      screen.getByTestId("customer-booking-review-card").props.style
    );
    const reviewRouteStyle = StyleSheet.flatten(
      screen.getByTestId("customer-booking-review-route").props.style
    );

    expect(screen.getByTestId("customer-booking-review-card")).toBeTruthy();
    expect(reviewStyle).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(reviewRouteStyle).toMatchObject({
      backgroundColor: controlSurfaces.secondary.backgroundColor,
      borderColor: controlSurfaces.secondary.borderColor,
      boxShadow: shadows.cardSubtle
    });
    expect(screen.getByText("راجع طلبك")).toBeTruthy();
    expect(screen.getAllByText("زواتا ← نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("مطعم شورما عكيفك").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("طريقة الدفع")).toBeTruthy();
    expect(screen.getByLabelText("تعديل الوجهة")).toBeTruthy();
    expect(screen.getByLabelText("طلب رحلة")).toBeTruthy();
    expect(screen.queryByTestId("customer-primary-booking-card")).toBeNull();
    expect(screen.queryByText("أماكن محفوظة")).toBeNull();
    expect(screen.queryByText("سائقون قريبون")).toBeNull();
    expect(screen.queryByLabelText("اختيار الوجهة لبدء الطلب")).toBeNull();
  });

  it("keeps the focused customer home free from operational booking noise", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("العودة إلى الرئيسية"));

    expect(screen.getByTestId("customer-booking-launcher")).toBeTruthy();
    expect(screen.queryByTestId("mock-route-map")).toBeNull();
    expect(screen.queryByText("سجل التحديثات المباشرة")).toBeNull();
    expect(screen.queryByText("التبويب النشط: الرئيسية")).toBeNull();
  });

  it("returns to the focused launcher when the customer taps the home tab", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByText("رحلاتي"));
    await fireEvent.press(screen.getByText("الرئيسية"));

    expect(screen.getByTestId("customer-booking-launcher")).toBeTruthy();
    expect(screen.queryByTestId("customer-booking-workspace")).toBeNull();
  });

  it("renders the Arabic customer booking review for Nablus", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByText("واصل")).toBeTruthy();
    expect(screen.getByText("إنشاء طلب جديد")).toBeTruthy();
    expect(screen.getByText("اطلب رحلة")).toBeTruthy();
    expect(screen.getAllByText("زواتا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("مطعم شورما عكيفك").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("خدمة واصل")).toBeTruthy();
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2.4 كم")).toBeTruthy();
    expect(screen.queryByText("وصل عادي")).toBeNull();
    expect(screen.queryByText("وصل بلس")).toBeNull();
    expect(screen.queryByText("25 ر.س")).toBeNull();
    expect(screen.queryByText("شارع النخيل، الرياض")).toBeNull();
    expect(screen.queryByTestId("mock-route-map")).toBeNull();
    expect(screen.getByTestId("floating-bottom-nav")).toBeTruthy();
  });

  it("lets the customer return from review to edit the destination", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByTestId("customer-booking-review-card")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تعديل الوجهة"));

    expect(screen.getByTestId("customer-destination-selection-page")).toBeTruthy();
    expect(screen.getByLabelText("ابحث عن وجهة")).toBeTruthy();
    expect(screen.getAllByText("مطعم شورما عكيفك").length).toBeGreaterThanOrEqual(1);
  });

  it("wraps the primary customer booking path with motion-ready surfaces", async () => {
    const screen = await renderCustomerServiceSelection();

    expect(screen.getByTestId("customer-motion-service-type")).toBeTruthy();
    expect(screen.getByTestId("customer-motion-service-next-step")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));

    expect(screen.getByTestId("customer-pickup-selection-page")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));

    expect(screen.getByTestId("customer-motion-destination-search")).toBeTruthy();
    expect(screen.getByTestId("customer-motion-destination-map")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("اختيار وجهة مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));

    expect(screen.getByTestId("customer-motion-booking-review")).toBeTruthy();
  });

  it("adds haptic feedback when editing the selected destination", async () => {
    const hapticSpy = jest.spyOn(Haptics, "selectionAsync").mockResolvedValue();
    const screen = await renderCustomerHome();

    try {
      await fireEvent.press(screen.getByLabelText("تعديل الوجهة"));

      expect(hapticSpy).toHaveBeenCalled();
    } finally {
      hapticSpy.mockRestore();
    }
  });

  it("summarizes the booking path in a compact review card", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByTestId("customer-booking-review-card")).toBeTruthy();
    expect(screen.getByText("راجع طلبك")).toBeTruthy();
    expect(screen.getByText("نقطة الانطلاق")).toBeTruthy();
    expect(screen.getByText("الوجهة")).toBeTruthy();
    expect(screen.getByText("المسافة")).toBeTruthy();
    expect(screen.getByText("وصول الكابتن")).toBeTruthy();
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
    const screen = await renderCustomerDestinationSelection();

    expect(screen.queryByLabelText("متابعة من الوجهة")).toBeNull();
    expect(screen.queryByLabelText("طلب رحلة")).toBeNull();
    expect(screen.queryByText("جاري البحث عن كابتن")).toBeNull();
  });

  it("selects a destination, edits detail, and confirms the mock trip", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getAllByText("نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("ملاحظة الكابتن")).toBeTruthy();

    await fireEvent.changeText(
      screen.getByLabelText("تفصيل الوجهة"),
      "مطعم شورما عكيفك - الباب الرئيسي"
    );
    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fillMockVisaDetails(screen);
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getByTestId("customer-compact-confirmation-card")).toBeTruthy();
    expect(screen.getByText("تأكيد وإرسال الطلب")).toBeTruthy();
    expect(screen.getAllByText("زواتا ← نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("خدمة واصل • 2.4 كم")).toBeTruthy();
    expect(screen.getAllByText("25 شيكل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("فيزا • **** 4242").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByTestId("customer-captain-search-surface")).toBeTruthy();
    expect(screen.getByText("جاري البحث عن كابتن")).toBeTruthy();
    expect(screen.getByTestId("mock-route-map")).toBeTruthy();
    expect(screen.getByTestId("captain-search-radar")).toBeTruthy();
    expect(screen.getAllByText("تم إرسال طلبك للكباتن القريبين").length).toBeGreaterThanOrEqual(1);
  });

  it("moves from one compact confirmation card into one focused captain search surface", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getByTestId("customer-compact-confirmation-card")).toBeTruthy();
    expect(screen.getByText("تأكيد وإرسال الطلب")).toBeTruthy();
    expect(screen.getAllByText("زواتا ← نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText("تأكيد الطلب")).toBeTruthy();
    expect(screen.getByLabelText("العودة لتعديل الطلب")).toBeTruthy();
    expect(screen.queryByTestId("customer-order-readiness-panel")).toBeNull();

    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByTestId("customer-captain-search-surface")).toBeTruthy();
    expect(screen.getByTestId("captain-search-radar")).toBeTruthy();
    expect(screen.getByTestId("mock-route-map")).toBeTruthy();
    expect(screen.getByLabelText("إلغاء البحث")).toBeTruthy();
    expect(screen.queryByTestId("customer-booking-review-card")).toBeNull();
    expect(screen.queryByTestId("customer-compact-confirmation-card")).toBeNull();
    expect(screen.queryByTestId("customer-live-request-hub")).toBeNull();
  });

  it("keeps accepted request details inside the unified tracking surface", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.changeText(
      screen.getByLabelText("تفصيل الوجهة"),
      "مطعم شورما عكيفك - الباب الرئيسي"
    );
    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fillMockVisaDetails(screen);
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.queryByTestId("customer-live-request-hub")).toBeNull();

    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));

    expect(screen.getByTestId("customer-captain-tracking-surface")).toBeTruthy();
    expect(screen.getByTestId("captain-trip-summary")).toBeTruthy();
    expect(screen.queryByTestId("customer-live-request-hub")).toBeNull();
    expect(screen.getAllByText("الكابتن في الطريق إليك").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("رحلة داخل المدينة • 25 شيكل")).toBeTruthy();
    expect(screen.getAllByText("فيزا • **** 4242").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("تفصيل: مطعم شورما عكيفك - الباب الرئيسي")).toBeTruthy();
  });

  it("lets the customer enable mock GPS and choose a pickup point before confirming", async () => {
    const screen = await renderCustomerPickupSelection();

    expect(screen.getByText("GPS mock غير مفعّل")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تفعيل موقع mock"));
    await fireEvent.press(screen.getByLabelText("اختيار نقطة انطلاق رفيديا"));

    expect(screen.getByText("GPS mock مفعّل")).toBeTruthy();
    expect(screen.getByText("نقطة الانطلاق: رفيديا")).toBeTruthy();
    expect(screen.getAllByText("رفيديا - قرب دوار الشهداء").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));
    await fireEvent.press(screen.getByLabelText("اختيار وجهة مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getByTestId("customer-compact-confirmation-card")).toBeTruthy();
    expect(screen.getByText("رفيديا ← نابلس - رفيديا")).toBeTruthy();
    expect(screen.getByText("خدمة واصل • 2.4 كم")).toBeTruthy();
  });

  it("collects mock Visa details and save preference before confirmation", async () => {
    const screen = await renderCustomerHome();

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

    expect(screen.getByTestId("customer-compact-confirmation-card")).toBeTruthy();
    expect(screen.getAllByText("فيزا • **** 4242").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("حفظ البطاقة")).toBeNull();
    expect(screen.queryByText("نعم - mock")).toBeNull();
  });

  it("validates mock Visa details before showing the premium payment readiness state", async () => {
    const screen = await renderCustomerHome();

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

  it("summarizes payment readiness inside the booking review", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByTestId("customer-payment-readiness-card")).toBeTruthy();
    expect(screen.getByText("الدفع جاهز للطلب")).toBeTruthy();
    expect(screen.getAllByText("كاش عند الاستلام").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("بدون بيانات إضافية")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fireEvent.changeText(screen.getByLabelText("اسم حامل البطاقة"), "علي محمد");
    await fireEvent.changeText(screen.getByLabelText("رقم بطاقة فيزا"), "4242424242424242");
    await fireEvent.changeText(screen.getByLabelText("تاريخ انتهاء فيزا"), "09/28");
    await fireEvent.changeText(screen.getByLabelText("رمز CVC"), "123");
    await fireEvent.press(screen.getByLabelText("حفظ بطاقة فيزا لهذا الحساب"));

    expect(screen.getByText("فيزا جاهزة للطلب")).toBeTruthy();
    expect(screen.getAllByText("فيزا • **** 4242").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("الحفظ مفعّل mock")).toBeTruthy();
  });

  it("shows a final request readiness signal before sending the booking", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByTestId("customer-request-readiness-strip")).toBeTruthy();
    expect(screen.getByText("الطلب جاهز للإرسال")).toBeTruthy();
    expect(screen.getByText("المسار والدفع مكتملان")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("فيزا"));

    expect(screen.getByText("أكمل الدفع قبل الإرسال")).toBeTruthy();
    expect(screen.getByText("بيانات فيزا مطلوبة")).toBeTruthy();

    await fillMockVisaDetails(screen);

    expect(screen.getByText("الطلب جاهز للإرسال")).toBeTruthy();
    expect(screen.getByText("فيزا جاهزة للإرسال")).toBeTruthy();
  });

  it("keeps the customer request readiness copy visually bounded", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByText("الطلب جاهز للإرسال").props.numberOfLines).toBe(1);
    expect(screen.getByText("المسار والدفع مكتملان").props.numberOfLines).toBe(2);
    expect(screen.getByText("كاش جاهز للإرسال").props.numberOfLines).toBe(2);
    expect(screen.getByText("كاش جاهز للإرسال").props.adjustsFontSizeToFit).toBe(true);
  });

  it("keeps the customer on booking review until Visa details are complete", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getByText("أكمل بيانات فيزا قبل تأكيد الطلب")).toBeTruthy();
    expect(screen.getByTestId("customer-booking-review-card")).toBeTruthy();
    expect(screen.queryByTestId("customer-compact-confirmation-card")).toBeNull();

    await fireEvent.changeText(screen.getByLabelText("اسم حامل البطاقة"), "علي محمد");
    await fireEvent.changeText(screen.getByLabelText("رقم بطاقة فيزا"), "4242424242424242");
    await fireEvent.changeText(screen.getByLabelText("تاريخ انتهاء فيزا"), "09/28");
    await fireEvent.changeText(screen.getByLabelText("رمز CVC"), "123");
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getByTestId("customer-compact-confirmation-card")).toBeTruthy();
    expect(screen.getAllByText("فيزا • **** 4242").length).toBeGreaterThanOrEqual(1);
  });

  it("lets the customer choose one of three simple service types before booking", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe("service");

    expect(screen.getByTestId("customer-service-type-picker")).toBeTruthy();
    expect(screen.getByText("اختر نوع رحلتك")).toBeTruthy();
    expect(screen.getAllByText("رحلة داخل المدينة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("رحلة خارج المدينة")).toBeTruthy();
    expect(screen.getAllByText("توصيل طلبية").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("اختيار رحلة خارج المدينة"));

    expect(screen.getByText("تم اختيار رحلة خارج المدينة")).toBeTruthy();
    expect(screen.getAllByText("رحلة خارج المدينة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("45 شيكل").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));
    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));
    await fireEvent.press(screen.getByLabelText("اختيار وجهة مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getByTestId("customer-compact-confirmation-card")).toBeTruthy();
    expect(screen.getByText("رحلة خارج المدينة • 2.4 كم")).toBeTruthy();
    expect(screen.getAllByText("45 شيكل").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByTestId("customer-captain-search-surface")).toBeTruthy();
    expect(screen.getAllByText(/45 شيكل • كاش عند الاستلام/).length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getByText("45 شيكل")).toBeTruthy();
  });

  it("shows a focused next step for the selected service type", async () => {
    const screen = await renderCustomerServiceSelection();

    await fireEvent.press(screen.getByLabelText("اختيار توصيل طلبية"));

    expect(screen.getByTestId("customer-service-next-step")).toBeTruthy();
    expect(screen.getByText("تجهيز توصيل الطلبية")).toBeTruthy();
    expect(screen.getByText("حدد نقطة الاستلام والتسليم وأضف وصف الغرض لاحقا.")).toBeTruthy();
    expect(screen.getByText("متابعة توصيل الطلبية")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));

    expect(screen.getByTestId("customer-pickup-selection-page")).toBeTruthy();
    expect(screen.queryByTestId("mock-route-map")).toBeNull();
    expect(screen.queryByTestId("customer-service-type-picker")).toBeNull();
  });

  it("keeps the final delivery confirmation compact before sending the request", async () => {
    const screen = await renderCustomerServiceSelection();

    await fireEvent.press(screen.getByLabelText("اختيار توصيل طلبية"));
    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));
    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));
    await fireEvent.press(screen.getByLabelText("اختيار وجهة مطعم شورما عكيفك"));
    await fireEvent.changeText(
      screen.getByLabelText("ملاحظة الوصول للكابتن"),
      "استلام من الباب الرئيسي وتسليم عند الاستقبال"
    );
    await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getByTestId("customer-compact-confirmation-card")).toBeTruthy();
    expect(screen.queryByTestId("customer-order-readiness-panel")).toBeNull();
    expect(screen.getAllByText("زواتا ← نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("توصيل طلبية • 2.4 كم")).toBeTruthy();
    expect(screen.getAllByText("كاش عند الاستلام").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("استلام من الباب الرئيسي وتسليم عند الاستقبال")).toBeNull();
  });

  it("projects pickup destination detail and captain movement onto the mock map", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe("pickup");

    await fireEvent.press(screen.getByLabelText("تفعيل موقع mock"));
    await fireEvent.press(screen.getByLabelText("اختيار نقطة انطلاق رفيديا"));
    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));
    await fireEvent.press(screen.getByLabelText("اختيار وجهة مطعم شورما عكيفك"));
    await fireEvent.changeText(
      screen.getByLabelText("ملاحظة الوصول للكابتن"),
      "مطعم شورما عكيفك - الباب الرئيسي"
    );

    expect(screen.getByText("الخريطة الحية")).toBeTruthy();
    expect(screen.getByText("انطلاق: رفيديا")).toBeTruthy();
    expect(screen.getByText("وجهة: نابلس - رفيديا")).toBeTruthy();
    expect(screen.getByText("تفصيل: مطعم شورما عكيفك - الباب الرئيسي")).toBeTruthy();
    expect(screen.getByText("مسار تجريبي جاهز")).toBeTruthy();
    expect(screen.getByTestId("mock-route-map")).toHaveProp("accessibilityRole", "image");
    expect(screen.getByTestId("mock-route-map")).toHaveProp("accessible", true);

    await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));
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

    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(screen.getByTestId("customer-captain-search-surface")).toBeTruthy();
    expect(screen.getByTestId("captain-search-radar")).toBeTruthy();
    expect(screen.getByTestId("mock-route-map")).toBeTruthy();
    expect(screen.getAllByText("زواتا ← نابلس - رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/25 شيكل • كاش عند الاستلام/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("3 كباتن يطابقون الطلب")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إلغاء البحث"));

    expect(screen.getByText("تم إلغاء البحث عن كابتن")).toBeTruthy();
    expect(screen.queryByText("جاري البحث عن كابتن")).toBeNull();
  });

  it("shows a premium accepted captain card with mock contact actions", async () => {
    const screen = await renderCustomerHome();

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
    expect(screen.getByTestId("captain-live-metrics")).toBeTruthy();
    expect(screen.getByText("وقت الوصول")).toBeTruthy();
    expect(screen.getAllByText("3 د").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("المسافة بينكم")).toBeTruthy();
    expect(screen.getAllByText("1.2 كم").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByTestId("captain-arrival-panel")).toBeNull();
    expect(screen.getByText("انطلاق: زواتا")).toBeTruthy();
    expect(screen.getByText("وجهة: نابلس - رفيديا")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("اتصال بالكابتن"));
    expect(screen.getByText("زر الاتصال mock فقط الآن")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("رسالة للكابتن"));
    expect(screen.getByText("زر الرسالة mock فقط الآن")).toBeTruthy();
  });

  it("shows one map-first tracking surface after the captain accepts", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));

    expect(screen.getByTestId("customer-captain-tracking-surface")).toBeTruthy();
    expect(screen.getByTestId("accepted-captain-card")).toBeTruthy();
    expect(screen.getAllByTestId("mock-route-map")).toHaveLength(1);
    expect(screen.getByTestId("captain-live-metrics")).toBeTruthy();
    expect(screen.getAllByText("1.2 كم").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("قريب من رفيديا").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText("اتصال بالكابتن")).toBeTruthy();
    expect(screen.getByLabelText("رسالة للكابتن")).toBeTruthy();
    expect(screen.queryByTestId("customer-motion-live-route")).toBeNull();
    expect(screen.queryByTestId("customer-live-request-hub")).toBeNull();
  });

  it("keeps customer safety and trip sharing actions available during the live ride", async () => {
    const screen = await renderCustomerHome();

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

    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));

    expect(screen.getAllByText("الكابتن في الطريق إليك").length).toBeGreaterThanOrEqual(1);

    await fireEvent.press(screen.getByLabelText("وصول الكابتن للعميل"));

    expect(screen.getByTestId("accepted-captain-card")).toBeTruthy();
    expect(screen.getAllByText("الكابتن وصل إليك").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("الكابتن وصل للعميل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("captain-live-metrics")).toBeTruthy();
    expect(screen.getByText("وصل الآن")).toBeTruthy();
    expect(screen.getAllByText("0.0 كم").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("عند زواتا").length).toBeGreaterThanOrEqual(1);
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

  it("uses one map-first surface during the ride and one clean arrival surface", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));

    expect(
      StyleSheet.flatten(screen.getByTestId("customer-active-trip-surface").props.style)
    ).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(screen.getAllByTestId("mock-route-map")).toHaveLength(1);
    expect(screen.getByTestId("customer-active-progress-strip")).toBeTruthy();
    expect(screen.getAllByText("2.1 كم").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("5 د").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("زواتا ← نابلس - رفيديا")).toBeTruthy();
    expect(screen.getByText("كاش عند الاستلام")).toBeTruthy();
    expect(screen.queryByTestId("customer-motion-live-route")).toBeNull();
    expect(screen.queryByTestId("customer-live-request-hub")).toBeNull();

    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة من الكابتن"));

    expect(screen.getByTestId("customer-trip-completion-surface")).toBeTruthy();
    expect(screen.queryByTestId("customer-active-trip-surface")).toBeNull();
    expect(screen.queryByTestId("mock-route-map")).toBeNull();
    expect(screen.queryByTestId("customer-live-request-hub")).toBeNull();
    expect(screen.getByText("إيصال الرحلة")).toBeTruthy();
    expect(screen.getByText("تقييم التجربة")).toBeTruthy();
  });

  it("shows the live accepted ride inside the customer trips tab", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.changeText(
      screen.getByLabelText("تفصيل الوجهة"),
      "مطعم شورما عكيفك - الباب الرئيسي"
    );
    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fillMockVisaDetails(screen);
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));

    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getByText("العميل في الطريق")).toBeTruthy();
    expect(screen.getAllByText("مطعم شورما عكيفك - الباب الرئيسي").length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getByText("فيزا • **** 4242")).toBeTruthy();
  });

  it("shows a unified customer journey timeline inside the trips tab", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.changeText(
      screen.getByLabelText("تفصيل الوجهة"),
      "مطعم شورما عكيفك - الباب الرئيسي"
    );
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));

    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getByTestId("customer-trip-journey-timeline")).toBeTruthy();
    expect(screen.getByText("خط سير الرحلة")).toBeTruthy();
    expect(screen.getByText("المرحلة الحالية: العميل في الطريق")).toBeTruthy();
    expect(screen.getByText("تم إرسال الطلب")).toBeTruthy();
    expect(screen.getAllByText("تم قبول الطلب").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("بدأت الرحلة").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("بانتظار الوصول")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة من الكابتن"));

    expect(screen.getByText("كل الخطوات مكتملة")).toBeTruthy();
    expect(screen.getAllByText("تم الوصول").length).toBeGreaterThanOrEqual(1);
  });

  it("adds the completed live ride to the customer trips history", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.changeText(
      screen.getByLabelText("تفصيل الوجهة"),
      "مطعم شورما عكيفك - الباب الرئيسي"
    );
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة من الكابتن"));

    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getAllByText("مطعم شورما عكيفك - الباب الرئيسي").length).toBeGreaterThanOrEqual(
      2
    );
    expect(screen.getByText("الآن • 25 شيكل")).toBeTruthy();
  });

  it("shows a premium customer receipt after the live ride is completed", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.changeText(
      screen.getByLabelText("تفصيل الوجهة"),
      "مطعم شورما عكيفك - الباب الرئيسي"
    );
    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fillMockVisaDetails(screen);
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));
    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByLabelText("بدء الرحلة من الكابتن"));
    await fireEvent.press(screen.getByLabelText("إنهاء الرحلة من الكابتن"));

    expect(screen.getByText("إيصال الرحلة")).toBeTruthy();
    expect(screen.getByText("رقم الإيصال: WAS-0001")).toBeTruthy();
    expect(screen.getByText("المبلغ المدفوع: 25 شيكل")).toBeTruthy();
    expect(screen.getByText("طريقة الدفع: فيزا • **** 4242")).toBeTruthy();
    expect(screen.getByText("الخدمة: خدمة واصل")).toBeTruthy();
    expect(screen.getByText("المسار: زواتا ← نابلس - رفيديا")).toBeTruthy();
    expect(screen.getByText("تفصيل الوجهة: مطعم شورما عكيفك - الباب الرئيسي")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تحميل إيصال الرحلة"));
    expect(screen.getByText("تم تجهيز إيصال الرحلة mock")).toBeTruthy();
  });

  it("submits premium post-trip feedback with quick praise tags", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.changeText(
      screen.getByLabelText("تفصيل الوجهة"),
      "مطعم شورما عكيفك - الباب الرئيسي"
    );
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
    expect(
      screen.getByText("shared feedback: 5-كابتن محترف، قيادة هادئة • الكابتن ممتاز")
    ).toBeTruthy();
  });

  it("shows a rich completed trip card with receipt, payment, and rating in trips history", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.changeText(
      screen.getByLabelText("تفصيل الوجهة"),
      "مطعم شورما عكيفك - الباب الرئيسي"
    );
    await fireEvent.press(screen.getByLabelText("فيزا"));
    await fillMockVisaDetails(screen);
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
    expect(screen.getByText("طريقة الدفع: فيزا • **** 4242")).toBeTruthy();
    expect(screen.getByText("تقييم الرحلة: 5 نجوم")).toBeTruthy();
    expect(screen.getByText("ملاحظاتك: كابتن محترف، قيادة هادئة • الكابتن ممتاز")).toBeTruthy();
    expect(screen.getAllByText("مطعم شورما عكيفك - الباب الرئيسي").length).toBeGreaterThanOrEqual(
      1
    );
  });

  it("collects completion feedback and clears the shared ride for a new trip", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe();

    await fireEvent.changeText(
      screen.getByLabelText("تفصيل الوجهة"),
      "مطعم شورما عكيفك - الباب الرئيسي"
    );
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

  it("keeps the floating nav interactive without showing a visual active-tab toast", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(screen.getByText("رحلة حالية")).toBeTruthy();
    expect(screen.queryByText("التبويب النشط: رحلاتي")).toBeNull();
  });

  it("shows a premium customer profile with wallet, payments, and security actions", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByText("حسابي"));

    expect(
      StyleSheet.flatten(screen.getByTestId("customer-profile-overview").props.style)
    ).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("customer-profile-payment").props.style)
    ).toMatchObject({
      backgroundColor: glass.default.backgroundColor,
      borderColor: controlSurfaces.secondary.borderColor,
      boxShadow: shadows.card
    });
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

    expect(
      StyleSheet.flatten(screen.getByTestId("customer-search-overview").props.style)
    ).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
    expect(screen.getByText("مركز اكتشاف الوجهات")).toBeTruthy();
    expect(screen.getByText("اقتراحات ذكية")).toBeTruthy();
    expect(screen.getByText("أقرب وجهة: المنزل")).toBeTruthy();
    expect(screen.getByText("نطاق البحث: نابلس")).toBeTruthy();
    expect(screen.getByText("وجهات محفوظة: 4")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("تحديث اقتراحات البحث"));
    expect(screen.getByText("تم تحديث اقتراحات البحث mock فقط الآن")).toBeTruthy();
  });

  it("keeps the trips overview in the same premium surface family", async () => {
    const screen = await renderCustomerHome();

    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(
      StyleSheet.flatten(screen.getByTestId("customer-trips-overview").props.style)
    ).toMatchObject({
      backgroundColor: glass.strong.backgroundColor,
      borderColor: glass.strong.borderColor,
      boxShadow: shadows.cardStrong
    });
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
    expect(screen.getByText("إنشاء طلب جديد")).toBeTruthy();
    expect(screen.getByTestId("customer-booking-review-card")).toBeTruthy();
    expect(screen.getAllByText("جامعة النجاح").length).toBeGreaterThanOrEqual(1);
  });

  it("adapts search guidance and selected destination copy to the active service type", async () => {
    const screen = await renderCustomerServiceSelection();

    await fireEvent.press(screen.getByLabelText("اختيار توصيل طلبية"));
    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));
    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));

    expect(screen.getByText("اختر وجهتك")).toBeTruthy();
    expect(screen.getByText("توصيل طلبية")).toBeTruthy();
    expect(screen.getByLabelText("ابحث عن وجهة")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("اختيار وجهة المنزل"));

    expect(screen.getByText("الوجهة المختارة")).toBeTruthy();
    expect(screen.getAllByText("المنزل").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("متابعة إلى تفاصيل الطلب")).toBeTruthy();
  });

  it("lets delivery customers add a captain note from the destination step before confirming", async () => {
    const screen = await renderCustomerServiceSelection();

    await fireEvent.press(screen.getByLabelText("اختيار توصيل طلبية"));
    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));
    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));
    await fireEvent.press(screen.getByLabelText("اختيار وجهة المنزل"));

    expect(screen.getByText("ملاحظة الوصول للكابتن")).toBeTruthy();
    expect(
      screen.getByText("اكتب علامة واضحة مثل اسم البوابة أو مدخل المبنى.")
    ).toBeTruthy();

    await fireEvent.changeText(
      screen.getByLabelText("ملاحظة الوصول للكابتن"),
      "استلام من الباب الرئيسي وتسليم عند الاستقبال"
    );

    expect(screen.getByText("استلام من الباب الرئيسي وتسليم عند الاستقبال")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getByTestId("customer-compact-confirmation-card")).toBeTruthy();
    expect(screen.getAllByText(/توصيل طلبية • \d+\.\d كم/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("استلام من الباب الرئيسي وتسليم عند الاستقبال")).toBeNull();
  });

  it("adds package details to delivery requests before sending them to the captain", async () => {
    const screen = await renderCustomerHomeWithCaptainAcceptanceProbe("service");

    await fireEvent.press(screen.getByLabelText("اختيار توصيل طلبية"));
    await fireEvent.press(screen.getByLabelText("متابعة الخدمة المختارة"));
    await fireEvent.press(screen.getByLabelText("متابعة من موقع الانطلاق"));
    await fireEvent.press(screen.getByLabelText("اختيار وجهة مطعم شورما عكيفك"));
    await fireEvent.press(screen.getByLabelText("متابعة من الوجهة"));

    expect(screen.getByTestId("customer-delivery-package-panel")).toBeTruthy();
    expect(screen.getByText("تفاصيل الطلبية")).toBeTruthy();
    expect(screen.getByText("نوع الغرض")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("اختيار نوع غرض أغراض شخصية"));
    await fireEvent.changeText(
      screen.getByLabelText("وصف الطلبية"),
      "كيس ملابس صغير يحتاج تسليم يد بيد"
    );
    await fireEvent.changeText(
      screen.getByLabelText("تفصيل الوجهة"),
      "استلام من الباب الرئيسي وتسليم عند الاستقبال"
    );
    await fireEvent.press(screen.getByLabelText("طلب رحلة"));

    expect(screen.getByTestId("customer-compact-confirmation-card")).toBeTruthy();
    expect(screen.getByText("توصيل طلبية • 2.4 كم")).toBeTruthy();
    expect(screen.queryByText("أغراض شخصية")).toBeNull();
    expect(screen.queryByText("كيس ملابس صغير يحتاج تسليم يد بيد")).toBeNull();

    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));
    await fireEvent.press(screen.getByLabelText("قبول طلب العميل من الكابتن"));
    await fireEvent.press(screen.getByText("رحلاتي"));

    expect(
      screen.getAllByText(
        "استلام من الباب الرئيسي وتسليم عند الاستقبال • أغراض شخصية • كيس ملابس صغير يحتاج تسليم يد بيد"
      ).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("switches customer tabs into trips, search, and profile mock surfaces", async () => {
    const screen = await renderCustomerHome();

    expect(screen.getByTestId("customer-motion-tab-0")).toBeTruthy();
    expect(screen.getByTestId("customer-motion-tab-1")).toBeTruthy();
    expect(screen.getByTestId("customer-motion-tab-2")).toBeTruthy();
    expect(screen.getByTestId("customer-motion-tab-3")).toBeTruthy();
    expect(screen.getByTestId("customer-active-tab-motion-surface")).toBeTruthy();

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
