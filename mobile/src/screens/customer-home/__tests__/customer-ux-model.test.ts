import { describe, expect, it } from "@jest/globals";

import { customerHomeMock } from "@/mock/customer-home";

import {
  CUSTOMER_BOOKING_STEPS,
  CUSTOMER_SEARCH_FILTERS,
  DELIVERY_PACKAGE_TYPES,
  formatCustomerFeedbackNote,
  getCustomerDestinationResults,
  getCustomerProfileOverview,
  getCustomerSearchCopy,
  getCustomerSearchTabView,
  getCustomerSupportHubView,
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

  it("builds account and support views without leaking screen-specific logic", () => {
    const profileView = getCustomerProfileOverview();
    const supportView = getCustomerSupportHubView("الإبلاغ عن مشكلة");

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
});
