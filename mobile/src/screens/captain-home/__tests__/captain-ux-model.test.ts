import { describe, expect, it } from "@jest/globals";

import { captainHomeMock } from "@/mock/captain-home";

import {
  getCaptainActiveTripView,
  getCaptainRequestDecisionView
} from "../captain-ux-model";

describe("captain UX model", () => {
  it("builds a clear request decision view before captain acceptance", () => {
    const request = captainHomeMock.availableRequests[0];
    const decision = getCaptainRequestDecisionView(request);

    expect(decision.route).toEqual({
      label: "المسار",
      value: `${request.pickup} ← ${request.destinationArea}`
    });
    expect(decision.metrics.map((metric) => metric.label)).toEqual([
      "الوصول",
      "المسافة",
      "الدفع"
    ]);
    expect(decision.metrics.map((metric) => metric.value)).toEqual([
      request.etaToPickup,
      request.distance,
      request.paymentMethod
    ]);
    expect(decision.previewRows.map((row) => row.label)).toEqual([
      "العميل المحدد",
      "رقم العميل",
      "المسار المقترح",
      "نوع الخدمة",
      "ملاحظة العميل",
      "طريقة الدفع",
      "الدخل المتوقع",
      "المسافة",
      "جاهز للانطلاق"
    ]);
    expect(decision.readiness).toEqual({
      detail: "المسار والدفع واضحان",
      status: `ابدأ خلال ${request.etaToPickup}`,
      title: "الطلب جاهز للقبول"
    });
  });

  it("builds captain active trip steps with route-ready details", () => {
    const request = captainHomeMock.availableRequests[0];
    const pickup = getCaptainActiveTripView("pickup", request);
    const arrived = getCaptainActiveTripView("arrived", request);
    const driving = getCaptainActiveTripView("driving", request);
    const completed = getCaptainActiveTripView("completed", request);

    expect(pickup).toMatchObject({
      hero: {
        meta: "اتجه إلى نقطة الانطلاق واستعد لتأكيد الوصول",
        status: "نشطة",
        title: "الطريق إلى العميل"
      },
      primaryAction: {
        accessibilityLabel: "تأكيد الوصول للعميل",
        buttonLabel: "وصلت للعميل",
        nextAction: { type: "arrive-to-customer" },
        nextStep: "arrived"
      }
    });
    expect(pickup.actionGuide).toMatchObject({
      detailLabel: "نقطة الالتقاء",
      detailValue: request.pickup,
      distanceLabel: "المسافة",
      distanceValue: request.distance,
      nextButtonLabel: "وصلت للعميل",
      stepLabel: "خطوة الكابتن 1 من 4",
      title: "اتجه إلى العميل"
    });
    expect(pickup.detailRows.map((row) => row.label)).toEqual([
      "نقطة الانطلاق",
      "منطقة الوجهة",
      "تفصيل الوجهة",
      "نوع الرحلة",
      "الدفع"
    ]);
    expect(arrived.primaryAction).toMatchObject({
      buttonLabel: "ابدأ الرحلة الآن",
      nextAction: { type: "start-trip" },
      nextStep: "driving"
    });
    expect(driving.actionGuide).toMatchObject({
      detailLabel: "الوجهة",
      detailValue: request.destinationArea,
      title: "قد إلى الوجهة"
    });
    expect(completed).toMatchObject({
      completedSummary: {
        meta: `${request.price} تمت إضافتها للأرباح mock`,
        title: "أرباح الرحلة جاهزة"
      },
      hero: {
        status: "مكتملة",
        title: "تم إنهاء الرحلة"
      },
      primaryAction: null
    });
  });
});
