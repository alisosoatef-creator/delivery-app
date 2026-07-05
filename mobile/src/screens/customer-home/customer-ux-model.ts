import { z } from "zod";

import type { MockRouteMapPhase } from "@/components/mock-route-map";
import { customerHomeMock } from "@/mock/customer-home";
import type { CaptainAvailableRequest } from "@/mock/captain-home";
import type { CaptainTripStep, CustomerTripStage } from "@/state/mock-trip-flow";

export type SavedDestinationPlace = (typeof customerHomeMock.savedPlaces)[number];
export type CitySuggestionPlace = (typeof customerHomeMock.citySuggestions)[number]["places"][number];
export type DestinationPlace = SavedDestinationPlace | CitySuggestionPlace;
export type PickupPoint = (typeof customerHomeMock.pickupOptions)[number];
export type PaymentMethod = (typeof customerHomeMock.paymentMethods)[number];
export type ServiceType = (typeof customerHomeMock.serviceTypes)[number];

export type CustomerSearchCopy = {
  detailHint: string;
  detailLabel: string;
  detailPlaceholder: string;
  detailPreviewPrefix: string;
  inputLabel: string;
  inputPlaceholder: string;
  scope: string;
  selectedActionAccessibilityLabel: string;
  selectedActionLabel: string;
  selectedNoticeSuffix: string;
  selectedTitle: string;
  subtitle: string;
  title: string;
  hint: string;
};

export type PaymentReadinessCopy = {
  detail: string;
  method: string;
  status: string;
  title: string;
};

export type PaymentChoiceSummary = {
  detail: string;
  title: string;
};

export type RequestReadinessCopy = {
  detail: string;
  status: string;
  title: string;
};

export type CustomerTripsLiveRide = {
  activeStatus: string;
  captain: string;
  destinationDetail: string;
  feedbackNote: string | null;
  feedbackRating: number | null;
  isCompleted: boolean;
  payment: string;
  paymentStatus: string;
  price: string;
  receiptNumber: string;
  route: string;
  serviceLabel: string;
  time: string;
};

export type CustomerTripHistoryItem = (typeof customerHomeMock.trips.history)[number];
export type CustomerTripsDetailView = "current" | "completed-live" | `history:${string}` | null;
export type CustomerTripsCurrentTrip = CustomerTripsLiveRide | typeof customerHomeMock.trips.current;
export type CustomerTripsHistoryRow = {
  accessibilityLabel: string;
  destination: string;
  detailView: Exclude<CustomerTripsDetailView, "current" | null>;
  id: string;
  meta: string;
  status: string;
};
export type CustomerTripsOverview = {
  activeStatus: string;
  currentTrip: CustomerTripsCurrentTrip;
  historyRows: CustomerTripsHistoryRow[];
  historyTitle: string;
};
export type CustomerTripDetailRow = {
  label: string;
  value: string;
};
export type CustomerTripDetailMap = {
  destinationArea: string;
  destinationDetail: string | null;
  phase: MockRouteMapPhase;
  pickupLabel: string;
};
export type CustomerTripDetailViewModel = {
  cardTitle: string;
  headerTitle: string;
  kind: "completed-live" | "current" | "history" | "missing";
  map: CustomerTripDetailMap | null;
  rows: CustomerTripDetailRow[];
  status: string;
};
export type CustomerProfileSupportItemView = {
  label: string;
  meta: string;
};
export type CustomerProfileSupportView = {
  actionLabel: string;
  items: CustomerProfileSupportItemView[];
  meta: string;
  title: string;
};
export type CustomerAccountInfoRowKind = "area" | "payment-card" | "payment-status" | "phone";
export type CustomerAccountInfoRow = {
  kind: CustomerAccountInfoRowKind;
  label: string;
  value: string;
};
export type CustomerAccountWalletTile = {
  label: string;
  tone: "primary" | "secondary";
  value: string;
};
export type CustomerAccountDetailView = {
  profile: typeof customerHomeMock.profile;
  rows: CustomerAccountInfoRow[];
  support: CustomerProfileSupportView;
  trust: CustomerProfileTrustView;
  wallet: {
    meta: string;
    tiles: CustomerAccountWalletTile[];
    title: string;
  };
};
export type CustomerProfileTrustView = {
  completionLabel: string;
  meta: string;
  savedPlacesLabel: string;
  title: string;
};
export type CustomerProfileOverview = {
  paymentSummary: typeof customerHomeMock.profilePaymentSummary;
  profile: typeof customerHomeMock.profile;
  support: CustomerProfileSupportView;
  trust: CustomerProfileTrustView;
};
export type CustomerSupportHubView = {
  actions: readonly CustomerSupportAction[];
  activeAction: CustomerSupportAction;
  apiNote: string;
  summary: {
    lines: string[];
    meta: string;
    title: string;
  };
};

export const LIVE_CUSTOMER_REQUEST_ID = "request-live-customer";
export const CUSTOMER_FEEDBACK_TAGS = ["كابتن محترف", "قيادة هادئة", "سيارة نظيفة"] as const;
export const CUSTOMER_SEARCH_FILTERS = ["الكل", "مطاعم", "جامعات", "أماكن أخرى"] as const;
export const DELIVERY_PACKAGE_TYPES = ["طرد صغير", "مستندات", "أغراض شخصية"] as const;

export type CustomerSearchFilter = (typeof CUSTOMER_SEARCH_FILTERS)[number];
export type CustomerSupportAction = (typeof customerHomeMock.profileSupport.actions)[number];
export type CustomerSupportActionLabel = CustomerSupportAction["label"];
export type DeliveryPackageType = (typeof DELIVERY_PACKAGE_TYPES)[number];
export type CustomerBookingStep = "service" | "pickup" | "destination" | "details";

export type CustomerDestinationResults = {
  places: DestinationPlace[];
  title: string;
};

export type CustomerSearchTabView = {
  emptyTitle: string;
  isEmpty: boolean;
  resultCountLabel: string;
  results: DestinationPlace[];
  title: string;
};

export type CustomerRideRequestDraftInput = {
  deliveryPackageDescription: string;
  destinationDetail: string;
  effectivePaymentMethod: string;
  selectedDeliveryPackageType: DeliveryPackageType;
  selectedDestination: DestinationPlace;
  selectedPickup: PickupPoint;
  selectedServiceLabel: string;
  selectedServiceType: ServiceType;
};

export function normalizeDestinationSearch(value: string) {
  return value.trim().toLowerCase();
}

export function getCustomerRideRequestDraft({
  deliveryPackageDescription,
  destinationDetail,
  effectivePaymentMethod,
  selectedDeliveryPackageType,
  selectedDestination,
  selectedPickup,
  selectedServiceLabel,
  selectedServiceType
}: CustomerRideRequestDraftInput): CaptainAvailableRequest {
  const deliveryPackageDescriptionTrimmed = deliveryPackageDescription.trim();
  const destinationDetailTrimmed = destinationDetail.trim();
  const resolvedDestinationDetail =
    selectedServiceType.id === "delivery" && deliveryPackageDescriptionTrimmed
      ? `${
          destinationDetailTrimmed || selectedDestination.detail
        } • ${selectedDeliveryPackageType} • ${deliveryPackageDescriptionTrimmed}`
      : destinationDetailTrimmed || selectedDestination.detail;

  return {
    customerName: customerHomeMock.profile.name,
    customerPhone: customerHomeMock.profile.phone,
    destinationArea: selectedDestination.area,
    destinationDetail: resolvedDestinationDetail,
    distance: selectedDestination.distance,
    etaToPickup: customerHomeMock.captain.arrivalEta,
    id: LIVE_CUSTOMER_REQUEST_ID,
    paymentMethod: effectivePaymentMethod,
    pickup: selectedPickup.label,
    price: selectedServiceType.price,
    serviceLabel: selectedServiceLabel
  };
}

export function findCitySuggestion(query: string) {
  const normalizedQuery = normalizeDestinationSearch(query);

  if (!normalizedQuery) {
    return null;
  }

  return (
    customerHomeMock.citySuggestions.find((citySuggestion) => {
      const normalizedCity = citySuggestion.city.toLowerCase();

      return normalizedQuery.includes(normalizedCity) || normalizedCity.includes(normalizedQuery);
    }) ?? null
  );
}

export function matchesDestinationFilter(
  place: DestinationPlace,
  activeFilter?: CustomerSearchFilter
) {
  if (!activeFilter || activeFilter === "الكل") {
    return true;
  }

  if (activeFilter === "مطاعم") {
    return place.label.includes("مطعم");
  }

  if (activeFilter === "جامعات") {
    return place.label.includes("جامعة");
  }

  return !place.label.includes("مطعم") && !place.label.includes("جامعة");
}

export function getCustomerDestinationResults({
  activeFilter,
  fallbackTitle,
  query
}: {
  activeFilter?: CustomerSearchFilter;
  fallbackTitle: string;
  query: string;
}): CustomerDestinationResults {
  const normalizedQuery = normalizeDestinationSearch(query);
  const matchedCity = findCitySuggestion(query);
  const sourcePlaces: DestinationPlace[] = matchedCity
    ? [...matchedCity.places]
    : [...customerHomeMock.savedPlaces];

  const places = sourcePlaces.filter((place) => {
    const matchesQuery =
      Boolean(matchedCity) ||
      !normalizedQuery ||
      place.label.toLowerCase().includes(normalizedQuery) ||
      place.area.toLowerCase().includes(normalizedQuery) ||
      place.detail.toLowerCase().includes(normalizedQuery);

    return matchesQuery && matchesDestinationFilter(place, activeFilter);
  });

  return {
    places,
    title: matchedCity ? `اقتراحات ${matchedCity.city}` : fallbackTitle
  };
}

export function getCustomerSearchTabView({
  activeFilter,
  fallbackTitle,
  query
}: {
  activeFilter: CustomerSearchFilter;
  fallbackTitle: string;
  query: string;
}): CustomerSearchTabView {
  const destinationResults = getCustomerDestinationResults({
    activeFilter,
    fallbackTitle,
    query
  });
  const results = destinationResults.places;

  return {
    emptyTitle: "لا توجد نتائج مطابقة الآن",
    isEmpty: results.length === 0,
    resultCountLabel: `نتائج البحث: ${results.length}`,
    results,
    title: destinationResults.title
  };
}

export function getCustomerTripsOverview(
  liveTrip: CustomerTripsLiveRide | null
): CustomerTripsOverview {
  const trips = customerHomeMock.trips;
  const completedLiveHistoryRows: CustomerTripsHistoryRow[] = liveTrip?.isCompleted
    ? [
        {
          accessibilityLabel: "فتح تفاصيل الرحلة المكتملة",
          destination: liveTrip.destinationDetail,
          detailView: "completed-live",
          id: "completed-live",
          meta: `الآن • ${liveTrip.price}`,
          status: "مكتملة"
        }
      ]
    : [];
  const savedHistoryRows = trips.history.map<CustomerTripsHistoryRow>((trip) => ({
    accessibilityLabel: `فتح تفاصيل رحلة ${trip.destination}`,
    destination: trip.destination,
    detailView: `history:${trip.id}`,
    id: trip.id,
    meta: `${trip.date} • ${trip.price}`,
    status: trip.status
  }));

  return {
    activeStatus: liveTrip?.activeStatus ?? trips.activeStatus,
    currentTrip: liveTrip ?? trips.current,
    historyRows: [...completedLiveHistoryRows, ...savedHistoryRows],
    historyTitle: trips.historyTitle
  };
}

export function getCustomerTripDetailView({
  detailView,
  liveTrip
}: {
  detailView: Exclude<CustomerTripsDetailView, null>;
  liveTrip: CustomerTripsLiveRide | null;
}): CustomerTripDetailViewModel {
  const trips = customerHomeMock.trips;

  if (detailView === "current") {
    const currentTrip = liveTrip ?? trips.current;
    const rows: CustomerTripDetailRow[] = [
      { label: "المسار", value: currentTrip.route },
      ...(liveTrip
        ? [
            { label: "تفصيل الوجهة", value: liveTrip.destinationDetail },
            { label: "الخدمة", value: liveTrip.serviceLabel }
          ]
        : []),
      { label: "الكابتن", value: currentTrip.captain },
      { label: "السعر", value: currentTrip.price },
      { label: "الدفع", value: currentTrip.payment },
      { label: "الوقت", value: currentTrip.time }
    ];

    return {
      cardTitle: "الرحلة الحالية",
      headerTitle: "تفاصيل الرحلة الحالية",
      kind: "current",
      map: {
        destinationArea: currentTrip.route,
        destinationDetail: liveTrip?.destinationDetail ?? null,
        phase: liveTrip?.isCompleted ? "completed" : liveTrip ? "driving" : "pickup",
        pickupLabel: customerHomeMock.pickup
      },
      rows,
      status: liveTrip?.activeStatus ?? trips.activeStatus
    };
  }

  if (detailView === "completed-live" && liveTrip) {
    return {
      cardTitle: "ملخص الرحلة المكتملة",
      headerTitle: "تفاصيل الرحلة المكتملة",
      kind: "completed-live",
      map: null,
      rows: [
        { label: "الإيصال", value: liveTrip.receiptNumber },
        { label: "حالة الدفع", value: liveTrip.paymentStatus },
        { label: "طريقة الدفع", value: liveTrip.payment },
        { label: "التقييم", value: liveTrip.feedbackRating ? `${liveTrip.feedbackRating} نجوم` : "بانتظار التقييم" }
      ],
      status: liveTrip.activeStatus
    };
  }

  const historyTrip =
    detailView.startsWith("history:") === true
      ? trips.history.find((trip) => detailView === `history:${trip.id}`)
      : undefined;

  if (historyTrip) {
    return {
      cardTitle: historyTrip.destination,
      headerTitle: "تفاصيل رحلة سابقة",
      kind: "history",
      map: null,
      rows: [
        { label: "الوجهة", value: historyTrip.destination },
        { label: "التاريخ", value: historyTrip.date },
        { label: "السعر", value: historyTrip.price },
        { label: "الحالة", value: historyTrip.status }
      ],
      status: historyTrip.status
    };
  }

  return {
    cardTitle: "لا توجد تفاصيل",
    headerTitle: "تفاصيل غير متوفرة",
    kind: "missing",
    map: null,
    rows: [],
    status: "غير متاح"
  };
}

export function getCustomerProfileOverview(): CustomerProfileOverview {
  return {
    paymentSummary: customerHomeMock.profilePaymentSummary,
    profile: customerHomeMock.profile,
    support: {
      actionLabel: "فتح الدعم والمساعدة",
      items: customerHomeMock.profileSupport.items.map((item) => ({
        label: item,
        meta: "متاح للمرحلة التجريبية"
      })),
      meta: "مساعدة وبلاغات سريعة بدون تعقيد",
      title: "الدعم والمساعدة"
    },
    trust: {
      completionLabel: "الملف مكتمل: 92%",
      meta: "بياناتك الأساسية جاهزة للطلبات",
      savedPlacesLabel: `الوجهات المحفوظة: ${customerHomeMock.savedPlaces.length}`,
      title: "جاهزية الحساب"
    }
  };
}

export function getCustomerAccountDetailView(): CustomerAccountDetailView {
  const profileView = getCustomerProfileOverview();

  return {
    profile: profileView.profile,
    rows: [
      {
        kind: "phone",
        label: "رقم الجوال",
        value: profileView.profile.phone
      },
      {
        kind: "area",
        label: "المنطقة",
        value: profileView.profile.homeArea
      },
      {
        kind: "payment-status",
        label: "طريقة الدفع",
        value: profileView.paymentSummary.status
      },
      {
        kind: "payment-card",
        label: "بطاقة الدفع",
        value: profileView.paymentSummary.method
      }
    ],
    support: profileView.support,
    trust: profileView.trust,
    wallet: {
      meta: "إجمالي ما دفعته هذا الشهر على واصل",
      tiles: [
        {
          label: "مدفوعات هذا الشهر",
          tone: "primary",
          value: profileView.paymentSummary.monthlySpend
        },
        {
          label: "حالة الدفع",
          tone: "secondary",
          value: profileView.paymentSummary.status
        },
        {
          label: "البطاقة الافتراضية",
          tone: "secondary",
          value: profileView.paymentSummary.method
        }
      ],
      title: "ملخص المدفوعات"
    }
  };
}

export function getCustomerSupportHubView(
  selectedAction: CustomerSupportActionLabel
): CustomerSupportHubView {
  const activeAction =
    customerHomeMock.profileSupport.actions.find((action) => action.label === selectedAction) ??
    customerHomeMock.profileSupport.actions[0];

  return {
    actions: customerHomeMock.profileSupport.actions,
    activeAction,
    apiNote: "لا يوجد ربط API الآن",
    summary: {
      lines: [
        `نوع البلاغ: ${activeAction.label}`,
        `الأولوية: ${activeAction.priority}`,
        activeAction.response
      ],
      meta: "طلب دعم mock محفوظ داخل الواجهة فقط",
      title:
        activeAction.label === "الإبلاغ عن مشكلة"
          ? "بلاغ مشكلة جاهز"
          : `${activeAction.label} جاهزة`
    }
  };
}

export function getDestinationCity(place: DestinationPlace) {
  return place.area.split(" - ")[0] || place.area;
}

export const CUSTOMER_BOOKING_STEPS: readonly {
  helper: string;
  id: CustomerBookingStep;
  shortTitle: string;
  title: string;
}[] = [
  {
    helper: "اختر داخل المدينة، خارج المدينة، أو توصيل طلبية.",
    id: "service",
    shortTitle: "نوع",
    title: "نوع الرحلة"
  },
  {
    helper: "فعّل موقعك أو اختر أقرب نقطة انطلاق مناسبة.",
    id: "pickup",
    shortTitle: "انطلاق",
    title: "اختيار موقع الانطلاق"
  },
  {
    helper: "حدد الوجهة وأضف ملاحظة قصيرة للكابتن.",
    id: "destination",
    shortTitle: "وجهة",
    title: "الوجهة والملاحظة"
  },
  {
    helper: "راجع المسار، السعر، وطريقة الدفع قبل الإرسال.",
    id: "details",
    shortTitle: "مراجعة",
    title: "المراجعة والدفع"
  }
];

export const visaPaymentSchema = z.object({
  cardholderName: z.string().trim().min(2, "اسم حامل البطاقة مطلوب"),
  cardNumber: z.string().refine((value) => value.replace(/\D/g, "").length === 16, {
    message: "رقم البطاقة يجب أن يكون 16 رقم"
  }),
  cvc: z.string().regex(/^\d{3,4}$/, "رمز CVC من 3 إلى 4 أرقام"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "تاريخ الانتهاء بصيغة MM/YY")
});

export type VisaPaymentFormValues = z.infer<typeof visaPaymentSchema>;

export const defaultVisaPaymentValues: VisaPaymentFormValues = {
  cardholderName: "",
  cardNumber: "",
  cvc: "",
  expiry: ""
};

export function getCustomerSearchCopy(serviceType: ServiceType): CustomerSearchCopy {
  if (serviceType.id === "delivery") {
    return {
      detailHint: "اكتب وصفا قصيرا يساعد الكابتن يعرف نقطة التسليم بالضبط.",
      detailLabel: "ملاحظة التسليم للكابتن",
      detailPlaceholder: "مثلا: تسليم عند الاستقبال أو باب العمارة",
      detailPreviewPrefix: "سيظهر للكابتن",
      hint: "حدد نقطة التسليم التي سيصل لها الكابتن مع الطلبية.",
      inputLabel: "بحث وجهة التسليم",
      inputPlaceholder: "ابحث عن نقطة تسليم أو منطقة",
      scope: "توصيل طلبية",
      selectedActionAccessibilityLabel: "استخدام وجهة التسليم",
      selectedActionLabel: "استخدام وجهة التسليم",
      selectedNoticeSuffix: "كوجهة تسليم",
      selectedTitle: "وجهة التسليم جاهزة",
      subtitle: "اختر نقطة تسليم الطلبية",
      title: "بحث التسليم"
    };
  }

  if (serviceType.id === "intercity") {
    return {
      detailHint: "أضف علامة وصول واضحة أو اسم منطقة تساعد الكابتن قبل الانطلاق.",
      detailLabel: "تفصيل الوصول للكابتن",
      detailPlaceholder: "مثلا: عند مدخل المدينة أو قرب المجمع",
      detailPreviewPrefix: "سيظهر للكابتن",
      hint: "ابحث عن المنطقة أو المدينة المطلوبة وسنجهز ملخص المسار.",
      inputLabel: "بحث وجهة خارج المدينة",
      inputPlaceholder: "ابحث عن مدينة أو منطقة",
      scope: "خارج المدينة",
      selectedActionAccessibilityLabel: "استخدام وجهة السفر",
      selectedActionLabel: "استخدام وجهة السفر",
      selectedNoticeSuffix: "كوجهة سفر",
      selectedTitle: "وجهة السفر جاهزة",
      subtitle: "اختر منطقة الوصول",
      title: "بحث خارج المدينة"
    };
  }

  return {
    detailHint: "أضف مدخلا أو علامة قريبة حتى يعرف الكابتن المكان بدقة.",
    detailLabel: "تفصيل الوجهة للكابتن",
    detailPlaceholder: "اكتب مدخل البناية أو علامة قريبة",
    detailPreviewPrefix: "سيظهر للكابتن",
    hint: customerHomeMock.searchTab.hint,
    inputLabel: "بحث الوجهات",
    inputPlaceholder: "ابحث عن مكان أو منطقة",
    scope: customerHomeMock.profile.city,
    selectedActionAccessibilityLabel: "استخدام الوجهة المختارة",
    selectedActionLabel: "استخدام الوجهة",
    selectedNoticeSuffix: "من البحث",
    selectedTitle: "وجهتك جاهزة",
    subtitle: "اكتشف وجهتك",
    title: customerHomeMock.searchTab.title
  };
}

export function formatCustomerFeedbackNote(note: string, tags: string[]) {
  const trimmedNote = note.trim();
  const tagSummary = tags.join("، ");

  if (tagSummary && trimmedNote) {
    return `${tagSummary} • ${trimmedNote}`;
  }

  return tagSummary || trimmedNote;
}

export function mapAcceptedTripStepToCustomerStage(
  step: CaptainTripStep | null
): CustomerTripStage {
  if (step === "driving") {
    return "active";
  }

  if (step === "completed") {
    return "completed";
  }

  return "captain";
}

export function mapCustomerStageToMapPhase(
  stage: CustomerTripStage,
  step: CaptainTripStep | null
): MockRouteMapPhase {
  if (step) {
    return step;
  }

  if (stage === "searching") {
    return "searching";
  }

  if (stage === "captain") {
    return "pickup";
  }

  if (stage === "active") {
    return "driving";
  }

  if (stage === "completed") {
    return "completed";
  }

  return "idle";
}

export function mapAcceptedTripStepToTripsStatus(step: CaptainTripStep | null): string {
  if (step === "completed") {
    return "تم الوصول";
  }

  if (step === "driving") {
    return "العميل في الطريق";
  }

  if (step === "arrived") {
    return "الكابتن وصل إليك";
  }

  return customerHomeMock.captain.status;
}

export type CustomerJourneyStepState = "done" | "pending";

export type CustomerJourneyStep = {
  detail: string;
  label: string;
  state: CustomerJourneyStepState;
};

export function getCustomerJourneySteps(liveTrip: CustomerTripsLiveRide): CustomerJourneyStep[] {
  const isCompleted = liveTrip.isCompleted;
  const isDriving = liveTrip.activeStatus === "العميل في الطريق";
  const isCaptainArrived = liveTrip.activeStatus === "الكابتن وصل إليك";
  const captainStepDone = isCompleted || isDriving || isCaptainArrived;
  const drivingStepDone = isCompleted || isDriving;

  return [
    {
      detail: "وصل طلبك للكباتن القريبين",
      label: "تم إرسال الطلب",
      state: "done"
    },
    {
      detail: `الكابتن ${liveTrip.captain} قبل الطلب`,
      label: "تم قبول الطلب",
      state: "done"
    },
    {
      detail: "موقع الكابتن والمسافة تظهر للعميل",
      label: isCaptainArrived ? "الكابتن وصل إليك" : "الكابتن في الطريق",
      state: captainStepDone ? "done" : "pending"
    },
    {
      detail: liveTrip.route,
      label: "بدأت الرحلة",
      state: drivingStepDone ? "done" : "pending"
    },
    {
      detail: liveTrip.destinationDetail,
      label: isCompleted ? "تم الوصول" : "بانتظار الوصول",
      state: isCompleted ? "done" : "pending"
    }
  ];
}

export function mapAcceptedTripStepToCaptainStatus(step: CaptainTripStep | null): string {
  if (step === "arrived") {
    return "الكابتن وصل إليك";
  }

  return customerHomeMock.captain.status;
}

export function getVisaCardLastFour(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");

  return digits.length >= 4 ? digits.slice(-4) : "";
}

export function getPaymentReadinessCopy({
  effectivePaymentMethod,
  isVisaPaymentDirty,
  paymentMethod,
  shouldSaveVisaCard,
  visaValidationReady
}: {
  effectivePaymentMethod: string;
  isVisaPaymentDirty: boolean;
  paymentMethod: PaymentMethod;
  shouldSaveVisaCard: boolean;
  visaValidationReady: boolean;
}): PaymentReadinessCopy {
  if (paymentMethod !== "فيزا") {
    return {
      detail: "بدون بيانات إضافية",
      method: effectivePaymentMethod,
      status: "الدفع عند الاستلام للكابتن",
      title: "الدفع جاهز للطلب"
    };
  }

  if (visaValidationReady) {
    return {
      detail: shouldSaveVisaCard ? "الحفظ مفعّل mock" : "بدون حفظ البطاقة",
      method: effectivePaymentMethod,
      status: "لن يتم خصم أي مبلغ الآن",
      title: "فيزا جاهزة للطلب"
    };
  }

  return {
    detail: isVisaPaymentDirty ? "راجع بيانات البطاقة قبل الطلب" : "أدخل بيانات البطاقة",
    method: "فيزا",
    status: "تجربة mock بدون خصم",
    title: "بانتظار إكمال فيزا"
  };
}

export function getPaymentChoiceSummary({
  effectivePaymentMethod,
  paymentMethod,
  visaValidationReady
}: {
  effectivePaymentMethod: string;
  paymentMethod: PaymentMethod;
  visaValidationReady: boolean;
}): PaymentChoiceSummary {
  if (paymentMethod === "فيزا") {
    return {
      detail: visaValidationReady ? effectivePaymentMethod : "أكمل البطاقة قبل إرسال الطلب",
      title: visaValidationReady ? "فيزا جاهزة" : "فيزا تحتاج بيانات"
    };
  }

  return {
    detail: "الدفع عند الاستلام",
    title: "كاش عند الاستلام جاهز"
  };
}

export function getRequestReadinessCopy({
  paymentMethod,
  visaValidationReady
}: {
  paymentMethod: PaymentMethod;
  visaValidationReady: boolean;
}): RequestReadinessCopy {
  if (paymentMethod === "فيزا" && !visaValidationReady) {
    return {
      detail: "بيانات فيزا مطلوبة",
      status: "فيزا غير مكتملة",
      title: "أكمل الدفع قبل الإرسال"
    };
  }

  return {
    detail: "المسار والدفع مكتملان",
    status: paymentMethod === "فيزا" ? "فيزا جاهزة للإرسال" : "كاش جاهز للإرسال",
    title: "الطلب جاهز للإرسال"
  };
}
