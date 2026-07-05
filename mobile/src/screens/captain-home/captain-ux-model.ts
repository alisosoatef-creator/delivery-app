import type { CaptainAvailableRequest } from "@/mock/captain-home";
import type { CaptainTripStep } from "@/state/mock-trip-flow";

export type CaptainRequestInfoRow = {
  label: string;
  value: string;
};

export type CaptainActiveTripDetailRowKind =
  | "destination"
  | "destination-detail"
  | "payment"
  | "pickup"
  | "service";

export type CaptainActiveTripDetailRow = CaptainRequestInfoRow & {
  kind: CaptainActiveTripDetailRowKind;
};

export type CaptainActionGuideView = {
  detailLabel: string;
  detailValue: string;
  distanceLabel: string;
  distanceValue: string;
  meta: string;
  nextButtonLabel: string;
  stepLabel: string;
  title: string;
};

export type CaptainRequestDecisionView = {
  metrics: CaptainRequestInfoRow[];
  previewRows: CaptainRequestInfoRow[];
  readiness: {
    detail: string;
    status: string;
    title: string;
  };
  route: CaptainRequestInfoRow;
};

export type CaptainActiveTripView = {
  actionGuide: CaptainActionGuideView;
  completedSummary: {
    meta: string;
    title: string;
  } | null;
  detailRows: CaptainActiveTripDetailRow[];
  hero: {
    meta: string;
    status: string;
    title: string;
  };
  primaryAction: {
    accessibilityLabel: string;
    buttonLabel: string;
    nextAction: { type: "arrive-to-customer" | "complete-trip" | "start-trip" };
    nextStep: CaptainTripStep;
  } | null;
};

export function getCaptainRequestDecisionView(
  request: CaptainAvailableRequest
): CaptainRequestDecisionView {
  const routeValue = `${request.pickup} ← ${request.destinationArea}`;

  return {
    metrics: [
      { label: "الوصول", value: request.etaToPickup },
      { label: "المسافة", value: request.distance },
      { label: "الدفع", value: request.paymentMethod }
    ],
    previewRows: [
      { label: "العميل المحدد", value: request.customerName },
      { label: "رقم العميل", value: request.customerPhone },
      { label: "المسار المقترح", value: routeValue },
      { label: "نوع الخدمة", value: request.serviceLabel },
      { label: "ملاحظة العميل", value: request.destinationDetail },
      { label: "طريقة الدفع", value: request.paymentMethod },
      { label: "الدخل المتوقع", value: request.price },
      { label: "المسافة", value: request.distance },
      { label: "جاهز للانطلاق", value: `الوصول خلال ${request.etaToPickup}` }
    ],
    readiness: getCaptainAcceptanceReadinessCopy(request),
    route: {
      label: "المسار",
      value: routeValue
    }
  };
}

export function getCaptainAcceptanceReadinessCopy(request: CaptainAvailableRequest) {
  return {
    detail: "المسار والدفع واضحان",
    status: `ابدأ خلال ${request.etaToPickup}`,
    title: "الطلب جاهز للقبول"
  };
}

export function getCaptainActiveTripView(
  step: CaptainTripStep,
  request: CaptainAvailableRequest
): CaptainActiveTripView {
  if (step === "arrived") {
    return {
      actionGuide: {
        detailLabel: "نقطة الصعود",
        detailValue: request.pickup,
        distanceLabel: "المسافة",
        distanceValue: request.distance,
        meta: "راجع اسم العميل وملاحظة الوجهة قبل بدء الرحلة",
        nextButtonLabel: "ابدأ الرحلة الآن",
        stepLabel: "خطوة الكابتن 2 من 4",
        title: "ثبّت صعود العميل"
      },
      completedSummary: null,
      detailRows: getCaptainActiveTripDetailRows(request),
      hero: {
        meta: "العميل جاهز، ابدأ الرحلة عند الصعود",
        status: "نشطة",
        title: "تم الوصول للعميل"
      },
      primaryAction: {
        accessibilityLabel: "بدء الرحلة التجريبية",
        buttonLabel: "ابدأ الرحلة الآن",
        nextAction: { type: "start-trip" },
        nextStep: "driving"
      }
    };
  }

  if (step === "driving") {
    return {
      actionGuide: {
        detailLabel: "الوجهة",
        detailValue: request.destinationArea,
        distanceLabel: "المسافة",
        distanceValue: request.distance,
        meta: "ابق على المسار النشط حتى الوصول لنقطة التسليم",
        nextButtonLabel: "إنهاء الرحلة",
        stepLabel: "خطوة الكابتن 3 من 4",
        title: "قد إلى الوجهة"
      },
      completedSummary: null,
      detailRows: getCaptainActiveTripDetailRows(request),
      hero: {
        meta: "تابع المسار إلى الوجهة النهائية",
        status: "نشطة",
        title: "العميل في الطريق"
      },
      primaryAction: {
        accessibilityLabel: "إنهاء الرحلة التجريبية",
        buttonLabel: "إنهاء الرحلة",
        nextAction: { type: "complete-trip" },
        nextStep: "completed"
      }
    };
  }

  if (step === "completed") {
    return {
      actionGuide: {
        detailLabel: "الأرباح",
        detailValue: request.price,
        distanceLabel: "المسافة",
        distanceValue: request.distance,
        meta: "تم حفظ الرحلة داخل تجربة mock وجاهزة للرجوع للطلبات",
        nextButtonLabel: "العودة للطلبات",
        stepLabel: "خطوة الكابتن 4 من 4",
        title: "الرحلة مكتملة"
      },
      completedSummary: {
        meta: `${request.price} تمت إضافتها للأرباح mock`,
        title: "أرباح الرحلة جاهزة"
      },
      detailRows: getCaptainActiveTripDetailRows(request),
      hero: {
        meta: "تم تسجيل الرحلة ضمن بيانات mock لهذه المرحلة",
        status: "مكتملة",
        title: "تم إنهاء الرحلة"
      },
      primaryAction: null
    };
  }

  return {
    actionGuide: {
      detailLabel: "نقطة الالتقاء",
      detailValue: request.pickup,
      distanceLabel: "المسافة",
      distanceValue: request.distance,
      meta: `اتجه للعميل خلال ${request.etaToPickup} وخلّي المسار واضح`,
      nextButtonLabel: "وصلت للعميل",
      stepLabel: "خطوة الكابتن 1 من 4",
      title: "اتجه إلى العميل"
    },
    completedSummary: null,
    detailRows: getCaptainActiveTripDetailRows(request),
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
  };
}

function getCaptainActiveTripDetailRows(
  request: CaptainAvailableRequest
): CaptainActiveTripDetailRow[] {
  return [
    {
      kind: "pickup",
      label: "نقطة الانطلاق",
      value: request.pickup
    },
    {
      kind: "destination",
      label: "منطقة الوجهة",
      value: request.destinationArea
    },
    {
      kind: "destination-detail",
      label: "تفصيل الوجهة",
      value: request.destinationDetail
    },
    {
      kind: "service",
      label: "نوع الرحلة",
      value: request.serviceLabel
    },
    {
      kind: "payment",
      label: "الدفع",
      value: request.paymentMethod
    }
  ];
}
