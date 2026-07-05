import { describe, expect, it } from "@jest/globals";

import { customerHomeMock } from "@/mock/customer-home";

import {
  CUSTOMER_BOOKING_STEPS,
  CUSTOMER_SEARCH_FILTERS,
  DELIVERY_PACKAGE_TYPES,
  formatCustomerFeedbackNote,
  getCustomerAccountDetailView,
  getCustomerDestinationResults,
  getCustomerProfileOverview,
  getCustomerRideRequestDraft,
  getCustomerSearchCopy,
  getCustomerSearchTabView,
  getCustomerSupportHubView,
  getCustomerTripDetailView,
  getCustomerTripsOverview,
  getPaymentChoiceSummary,
  getRequestReadinessCopy,
  getVisaCardLastFour,
  type CustomerTripsLiveRide
} from "../customer-ux-model";

describe("customer UX model", () => {
  it("keeps the customer booking architecture simple and ordered", () => {
    expect(CUSTOMER_BOOKING_STEPS.map((step) => step.id)).toEqual([
      "service",
      "pickup",
      "destination",
      "details"
    ]);
    expect(CUSTOMER_SEARCH_FILTERS).toEqual(["الكل", "مطاعم", "جامعات", "أماكن أخرى"]);
    expect(DELIVERY_PACKAGE_TYPES).toEqual(["طرد صغير", "مستندات", "أغراض شخصية"]);
  });

  it("returns calm city suggestions and filters them by category", () => {
    const cityResults = getCustomerDestinationResults({
      activeFilter: "الكل",
      fallbackTitle: "نتائج البحث",
      query: "جنين"
    });
    const universityResults = getCustomerDestinationResults({
      activeFilter: "جامعات",
      fallbackTitle: "نتائج البحث",
      query: "جنين"
    });

    expect(cityResults.title).toBe("اقتراحات جنين");
    expect(cityResults.places).toHaveLength(3);
    expect(cityResults.places.map((place) => place.label)).toEqual([
      "وسط جنين",
      "الجامعة العربية الأمريكية",
      "مستشفى جنين الحكومي"
    ]);
    expect(universityResults.places.map((place) => place.label)).toEqual([
      "الجامعة العربية الأمريكية"
    ]);
  });

  it("builds a calm search tab view model with count and empty-state copy", () => {
    const nablusView = getCustomerSearchTabView({
      activeFilter: "مطاعم",
      fallbackTitle: "نتائج البحث",
      query: "نابلس"
    });
    const emptyView = getCustomerSearchTabView({
      activeFilter: "مطاعم",
      fallbackTitle: "نتائج البحث",
      query: "جامعة"
    });

    expect(nablusView.title).toBe("اقتراحات نابلس");
    expect(nablusView.resultCountLabel).toBe("نتائج البحث: 0");
    expect(nablusView.isEmpty).toBe(true);
    expect(nablusView.emptyTitle).toBe("لا توجد نتائج مطابقة الآن");
    expect(emptyView.title).toBe("نتائج البحث");
    expect(emptyView.resultCountLabel).toBe("نتائج البحث: 0");
    expect(emptyView.isEmpty).toBe(true);
  });

  it("builds a focused trips overview from mock and live ride state", () => {
    const completedLiveTrip: CustomerTripsLiveRide = {
      activeStatus: "تم الوصول",
      captain: "أحمد محمد",
      destinationDetail: "مطعم شورما عكيفك - الباب الرئيسي",
      feedbackNote: null,
      feedbackRating: null,
      isCompleted: true,
      payment: "فيزا • **** 4242",
      paymentStatus: "مدفوع mock",
      price: "25 شيكل",
      receiptNumber: "WAS-0001",
      route: "زواتا ← نابلس - رفيديا",
      serviceLabel: "خدمة واصل",
      time: "الآن"
    };
    const idleView = getCustomerTripsOverview(null);
    const liveView = getCustomerTripsOverview(completedLiveTrip);

    expect(idleView.activeStatus).toBe(customerHomeMock.trips.activeStatus);
    expect(idleView.currentTrip).toEqual(customerHomeMock.trips.current);
    expect(idleView.historyRows.map((row) => row.detailView)).toEqual(
      customerHomeMock.trips.history.map((trip) => `history:${trip.id}`)
    );
    expect(liveView.activeStatus).toBe("تم الوصول");
    expect(liveView.currentTrip).toEqual(completedLiveTrip);
    expect(liveView.historyRows[0]).toMatchObject({
      accessibilityLabel: "فتح تفاصيل الرحلة المكتملة",
      destination: "مطعم شورما عكيفك - الباب الرئيسي",
      detailView: "completed-live",
      meta: "الآن • 25 شيكل",
      status: "مكتملة"
    });
  });

  it("builds API-ready trip detail views for current, completed, and history trips", () => {
    const liveTrip: CustomerTripsLiveRide = {
      activeStatus: "العميل في الطريق",
      captain: "أحمد محمد",
      destinationDetail: "مطعم شورما عكيفك - الباب الرئيسي",
      feedbackNote: "كابتن محترف",
      feedbackRating: 5,
      isCompleted: false,
      payment: "فيزا • **** 4242",
      paymentStatus: "بانتظار اكتمال الرحلة",
      price: "25 شيكل",
      receiptNumber: "WAS-0001",
      route: "زواتا ← نابلس - رفيديا",
      serviceLabel: "خدمة واصل",
      time: "نشطة الآن"
    };
    const currentDetail = getCustomerTripDetailView({ detailView: "current", liveTrip });
    const completedDetail = getCustomerTripDetailView({
      detailView: "completed-live",
      liveTrip: { ...liveTrip, activeStatus: "تم الوصول", isCompleted: true, paymentStatus: "مدفوع mock" }
    });
    const historyTrip = customerHomeMock.trips.history[0];
    const historyDetail = getCustomerTripDetailView({
      detailView: `history:${historyTrip.id}`,
      liveTrip: null
    });

    expect(currentDetail).toMatchObject({
      cardTitle: "الرحلة الحالية",
      headerTitle: "تفاصيل الرحلة الحالية",
      kind: "current",
      map: {
        destinationArea: liveTrip.route,
        destinationDetail: liveTrip.destinationDetail,
        phase: "driving",
        pickupLabel: customerHomeMock.pickup
      },
      status: "العميل في الطريق"
    });
    expect(currentDetail.rows.map((row) => row.label)).toEqual([
      "المسار",
      "تفصيل الوجهة",
      "الخدمة",
      "الكابتن",
      "السعر",
      "الدفع",
      "الوقت"
    ]);
    expect(completedDetail).toMatchObject({
      headerTitle: "تفاصيل الرحلة المكتملة",
      kind: "completed-live",
      status: "تم الوصول"
    });
    expect(historyDetail).toMatchObject({
      cardTitle: historyTrip.destination,
      headerTitle: "تفاصيل رحلة سابقة",
      kind: "history",
      status: historyTrip.status
    });
    expect(historyDetail.rows).toEqual([
      { label: "الوجهة", value: historyTrip.destination },
      { label: "التاريخ", value: historyTrip.date },
      { label: "السعر", value: historyTrip.price },
      { label: "الحالة", value: historyTrip.status }
    ]);
  });

  it("builds account and support views without leaking screen-specific logic", () => {
    const profileView = getCustomerProfileOverview();
    const supportView = getCustomerSupportHubView("الإبلاغ عن مشكلة");
    const accountView = getCustomerAccountDetailView();

    expect(profileView.profile.name).toBe("علي محمد");
    expect(profileView.trust.completionLabel).toBe("الملف مكتمل: 92%");
    expect(profileView.trust.savedPlacesLabel).toBe("الوجهات المحفوظة: 4");
    expect(profileView.paymentSummary.monthlySpend).toBe("184 شيكل");
    expect(profileView.paymentSummary.status).toBe("فيزا مفعلة");
    expect(profileView.support.items.map((item) => item.label)).toEqual([
      "محادثة الدعم",
      "الإبلاغ عن مشكلة",
      "مركز المساعدة"
    ]);
    expect(profileView.support.items.every((item) => item.meta === "متاح للمرحلة التجريبية")).toBe(
      true
    );
    expect(supportView.activeAction.label).toBe("الإبلاغ عن مشكلة");
    expect(supportView.apiNote).toBe("لا يوجد ربط API الآن");
    expect(supportView.summary.title).toBe("بلاغ مشكلة جاهز");
    expect(supportView.summary.lines).toEqual([
      "نوع البلاغ: الإبلاغ عن مشكلة",
      "الأولوية: عالية",
      "سيظهر هنا نموذج API لاحقاً"
    ]);
    expect(accountView.rows.map((row) => row.label)).toEqual([
      "رقم الجوال",
      "المنطقة",
      "طريقة الدفع",
      "بطاقة الدفع"
    ]);
    expect(accountView.rows.map((row) => row.value)).toEqual([
      customerHomeMock.profile.phone,
      customerHomeMock.profile.homeArea,
      "فيزا مفعلة",
      "فيزا • **** 4242"
    ]);
    expect(accountView.rows.some((row) => row.label.includes("تقييم"))).toBe(false);
    expect(accountView.wallet.title).toBe("ملخص المدفوعات");
    expect(accountView.wallet.tiles.map((tile) => tile.label)).toEqual([
      "مدفوعات هذا الشهر",
      "حالة الدفع",
      "البطاقة الافتراضية"
    ]);
    expect(accountView.wallet.tiles[0]).toMatchObject({
      tone: "primary",
      value: "184 شيكل"
    });
  });

  it("keeps service-specific search and payment copy outside the screen component", () => {
    const deliveryService = customerHomeMock.serviceTypes.find((service) => service.id === "delivery");

    expect(deliveryService).toBeDefined();
    expect(getCustomerSearchCopy(deliveryService ?? customerHomeMock.serviceTypes[0])).toMatchObject({
      inputLabel: "بحث وجهة التسليم",
      selectedActionLabel: "استخدام وجهة التسليم",
      title: "بحث التسليم"
    });
    expect(getVisaCardLastFour("4242 4242 4242 1234")).toBe("1234");
    expect(
      getPaymentChoiceSummary({
        effectivePaymentMethod: "فيزا • **** 1234",
        paymentMethod: "فيزا",
        visaValidationReady: true
      })
    ).toEqual({
      detail: "فيزا • **** 1234",
      title: "فيزا جاهزة"
    });
    expect(getRequestReadinessCopy({ paymentMethod: "فيزا", visaValidationReady: false })).toEqual({
      detail: "بيانات فيزا مطلوبة",
      status: "فيزا غير مكتملة",
      title: "أكمل الدفع قبل الإرسال"
    });
    expect(formatCustomerFeedbackNote("سيارة نظيفة", ["كابتن محترف"])).toBe(
      "كابتن محترف • سيارة نظيفة"
    );
  });

  it("builds the captain request draft from the selected customer booking details", () => {
    const pickup = customerHomeMock.pickupOptions[0];
    const cityService = customerHomeMock.serviceTypes[0];
    const deliveryService = customerHomeMock.serviceTypes.find((service) => service.id === "delivery");
    const destination = customerHomeMock.savedPlaces[1];

    expect(deliveryService).toBeDefined();
    expect(
      getCustomerRideRequestDraft({
        deliveryPackageDescription: "",
        destinationDetail: "",
        effectivePaymentMethod: "كاش عند الاستلام",
        selectedDeliveryPackageType: "طرد صغير",
        selectedDestination: destination,
        selectedPickup: pickup,
        selectedServiceLabel: customerHomeMock.service.label,
        selectedServiceType: cityService
      })
    ).toMatchObject({
      customerName: customerHomeMock.profile.name,
      customerPhone: customerHomeMock.profile.phone,
      destinationArea: destination.area,
      destinationDetail: destination.detail,
      distance: destination.distance,
      etaToPickup: customerHomeMock.captain.arrivalEta,
      id: "request-live-customer",
      paymentMethod: "كاش عند الاستلام",
      pickup: pickup.label,
      price: cityService.price,
      serviceLabel: customerHomeMock.service.label
    });
    expect(
      getCustomerRideRequestDraft({
        deliveryPackageDescription: "مستندات داخل ظرف",
        destinationDetail: "البوابة الرئيسية",
        effectivePaymentMethod: "فيزا • **** 4242",
        selectedDeliveryPackageType: "مستندات",
        selectedDestination: destination,
        selectedPickup: pickup,
        selectedServiceLabel: deliveryService?.label ?? "توصيل طلبية",
        selectedServiceType: deliveryService ?? cityService
      }).destinationDetail
    ).toBe("البوابة الرئيسية • مستندات • مستندات داخل ظرف");
  });
});
