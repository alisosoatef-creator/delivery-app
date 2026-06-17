import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  Bell,
  Car,
  CheckCircle,
  ChevronLeft,
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  XCircle
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useReducer, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

import { GlassCard } from "@/components/glass-card";
import { MockRouteMap, type MockRouteMapPhase } from "@/components/mock-route-map";
import { PremiumButton } from "@/components/premium-button";
import { RealtimeActivityFeed, RealtimeStatusCard } from "@/components/realtime-status-card";
import { colors, gradients, radii, spacing, typography } from "@/design/tokens";
import type { CaptainAvailableRequest } from "@/mock/captain-home";
import { customerHomeMock } from "@/mock/customer-home";
import {
  getLatestMockRealtimeEvent,
  getMockRealtimeConnectionSummary,
  getRecentMockRealtimeEvents
} from "@/realtime/mock-realtime";
import { useMockRideRequests } from "@/state/mock-app-context";
import {
  createInitialCustomerTripFlow,
  customerTripFlowReducer,
  type CaptainTripStep,
  type CustomerTripStage
} from "@/state/mock-trip-flow";

type DestinationPlace = (typeof customerHomeMock.savedPlaces)[number];
type PickupPoint = (typeof customerHomeMock.pickupOptions)[number];
type PaymentMethod = (typeof customerHomeMock.paymentMethods)[number];
type ServiceType = (typeof customerHomeMock.serviceTypes)[number];
type CustomerSearchCopy = {
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

type CustomerHomeScreenProps = {
  onPreviewCaptainRequests?: () => void;
};

type CustomerTripsLiveRide = {
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

const LIVE_CUSTOMER_REQUEST_ID = "request-live-customer";
const CUSTOMER_FEEDBACK_TAGS = ["كابتن محترف", "قيادة هادئة", "سيارة نظيفة"] as const;
const CUSTOMER_PROFILE_WALLET = {
  balance: "120 شيكل",
  label: "رصيد تجريبي",
  monthlySpend: "184 شيكل",
  points: "8 نقاط"
} as const;
const CUSTOMER_PROFILE_PAYMENT_METHODS = [
  { detail: "افتراضي للطلبات السريعة", label: "كاش عند الاستلام", status: "نشط" },
  { detail: "تنتهي 09/28", label: "فيزا • **** 4242", status: "جاهزة" }
] as const;
const CUSTOMER_PROFILE_SECURITY_ITEMS = [
  "توثيق الجوال مفعّل",
  "مشاركة الرحلة مع جهة موثوقة",
  "تنبيهات الدفع والرحلات مفعّلة"
] as const;
const CUSTOMER_SEARCH_FILTERS = ["الكل", "مطاعم", "جامعات", "الأقرب"] as const;
const DELIVERY_PACKAGE_TYPES = ["طرد صغير", "مستندات", "أغراض شخصية"] as const;

type CustomerSearchFilter = (typeof CUSTOMER_SEARCH_FILTERS)[number];
type DeliveryPackageType = (typeof DELIVERY_PACKAGE_TYPES)[number];

const visaPaymentSchema = z.object({
  cardholderName: z.string().trim().min(2, "اسم حامل البطاقة مطلوب"),
  cardNumber: z.string().refine((value) => value.replace(/\D/g, "").length === 16, {
    message: "رقم البطاقة يجب أن يكون 16 رقم"
  }),
  cvc: z.string().regex(/^\d{3,4}$/, "رمز CVC من 3 إلى 4 أرقام"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "تاريخ الانتهاء بصيغة MM/YY")
});

type VisaPaymentFormValues = z.infer<typeof visaPaymentSchema>;

const defaultVisaPaymentValues: VisaPaymentFormValues = {
  cardholderName: "",
  cardNumber: "",
  cvc: "",
  expiry: ""
};

function getCustomerSearchCopy(serviceType: ServiceType): CustomerSearchCopy {
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
      title: "بحث التسليم",
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
      title: "بحث خارج المدينة",
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
    title: customerHomeMock.searchTab.title,
  };
}

function formatCustomerFeedbackNote(note: string, tags: string[]) {
  const trimmedNote = note.trim();
  const tagSummary = tags.join("، ");

  if (tagSummary && trimmedNote) {
    return `${tagSummary} • ${trimmedNote}`;
  }

  return tagSummary || trimmedNote;
}

function mapAcceptedTripStepToCustomerStage(step: CaptainTripStep | null): CustomerTripStage {
  if (step === "driving") {
    return "active";
  }

  if (step === "completed") {
    return "completed";
  }

  return "captain";
}

function mapCustomerStageToMapPhase(stage: CustomerTripStage, step: CaptainTripStep | null): MockRouteMapPhase {
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

function mapAcceptedTripStepToTripsStatus(step: CaptainTripStep | null): string {
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

type CustomerJourneyStepState = "done" | "pending";

type CustomerJourneyStep = {
  detail: string;
  label: string;
  state: CustomerJourneyStepState;
};

function getCustomerJourneySteps(liveTrip: CustomerTripsLiveRide): CustomerJourneyStep[] {
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

function mapAcceptedTripStepToCaptainStatus(step: CaptainTripStep | null): string {
  if (step === "arrived") {
    return "الكابتن وصل إليك";
  }

  return customerHomeMock.captain.status;
}

function getVisaCardLastFour(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");

  return digits.length >= 4 ? digits.slice(-4) : "";
}

export function CustomerHomeScreen({ onPreviewCaptainRequests }: CustomerHomeScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const [selectedDestination, setSelectedDestination] = useState<DestinationPlace | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<PickupPoint>(customerHomeMock.pickupOptions[0]);
  const [isMockLocationEnabled, setIsMockLocationEnabled] = useState(false);
  const [activeNav, setActiveNav] = useState<string>(customerHomeMock.navItems[0].label);
  const [tripFlow, dispatchTripFlow] = useReducer(customerTripFlowReducer, createInitialCustomerTripFlow());
  const [rideRequests, dispatchRideRequests] = useMockRideRequests();
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [completionNote, setCompletionNote] = useState<string>("");
  const [selectedFeedbackTags, setSelectedFeedbackTags] = useState<string[]>([]);
  const [destinationDetail, setDestinationDetail] = useState<string>("");
  const [deliveryPackageDescription, setDeliveryPackageDescription] = useState<string>("");
  const [selectedDeliveryPackageType, setSelectedDeliveryPackageType] = useState<DeliveryPackageType>(
    DELIVERY_PACKAGE_TYPES[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(customerHomeMock.defaultPaymentMethod);
  const [shouldSaveVisaCard, setShouldSaveVisaCard] = useState(false);
  const visaForm = useForm<VisaPaymentFormValues>({
    defaultValues: defaultVisaPaymentValues,
    mode: "onChange",
    resolver: zodResolver(visaPaymentSchema)
  });
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>(customerHomeMock.serviceTypes[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchFilter, setActiveSearchFilter] = useState<CustomerSearchFilter>("الكل");
  const { showConfirmation, stage: rideStage } = tripFlow;
  const acceptedCustomerRequest =
    rideRequests.acceptedRequest?.id === LIVE_CUSTOMER_REQUEST_ID ? rideRequests.acceptedRequest : null;
  const liveCustomerFeedback =
    acceptedCustomerRequest && rideRequests.customerFeedback?.requestId === acceptedCustomerRequest.id
      ? rideRequests.customerFeedback
      : null;
  const effectiveRideStage =
    acceptedCustomerRequest && rideStage !== "idle"
      ? mapAcceptedTripStepToCustomerStage(rideRequests.acceptedTripStep)
      : rideStage;
  const liveCustomerTrip: CustomerTripsLiveRide | null = acceptedCustomerRequest
    ? {
        activeStatus: mapAcceptedTripStepToTripsStatus(rideRequests.acceptedTripStep),
        captain: customerHomeMock.captain.name,
        destinationDetail: acceptedCustomerRequest.destinationDetail,
        feedbackNote: liveCustomerFeedback?.note ?? null,
        feedbackRating: liveCustomerFeedback?.rating ?? null,
        isCompleted: rideRequests.acceptedTripStep === "completed",
        payment: acceptedCustomerRequest.paymentMethod,
        paymentStatus: rideRequests.acceptedTripStep === "completed" ? "مدفوع mock" : "بانتظار اكتمال الرحلة",
        price: acceptedCustomerRequest.price,
        receiptNumber: "WAS-0001",
        route: `${acceptedCustomerRequest.pickup} ← ${acceptedCustomerRequest.destinationArea}`,
        serviceLabel: acceptedCustomerRequest.serviceLabel,
        time: rideRequests.acceptedTripStep === "completed" ? "اكتملت الآن" : "نشطة الآن",
      }
    : null;
  const latestRealtimeEvent = getLatestMockRealtimeEvent(rideRequests.realtime, "customer");
  const realtimeConnectionSummary = getMockRealtimeConnectionSummary(rideRequests.realtime, "customer");
  const recentRealtimeEvents = getRecentMockRealtimeEvents(rideRequests.realtime, "customer", 4);
  const selectedServiceLabel =
    selectedServiceType.id === "city" ? customerHomeMock.service.label : selectedServiceType.label;
  const selectedSearchCopy = getCustomerSearchCopy(selectedServiceType);
  const visaPaymentValues = visaForm.watch();
  const isVisaPaymentDirty = Object.values(visaPaymentValues).some((value) => value.trim().length > 0);
  const visaValidationResult = visaPaymentSchema.safeParse(visaPaymentValues);
  const visaValidationMessages = visaValidationResult.success
    ? []
    : Array.from(new Set(visaValidationResult.error.issues.map((issue) => issue.message)));
  const visaCardLastFour = getVisaCardLastFour(visaPaymentValues.cardNumber);
  const effectivePaymentMethod =
    paymentMethod === "فيزا" && visaValidationResult.success && visaCardLastFour
      ? `فيزا • **** ${visaCardLastFour}`
      : paymentMethod;
  const deliveryPackageDescriptionTrimmed = deliveryPackageDescription.trim();
  const captainDestinationDetail =
    selectedServiceType.id === "delivery" && deliveryPackageDescriptionTrimmed
      ? `${destinationDetail} • ${selectedDeliveryPackageType} • ${deliveryPackageDescriptionTrimmed}`
      : destinationDetail;

  function resetRide() {
    dispatchTripFlow({ type: "reset" });
    setRequestStatus(null);
    setRating(null);
    setCompletionNote("");
    setSelectedFeedbackTags([]);
  }

  function resetVisaPaymentDetails() {
    visaForm.reset(defaultVisaPaymentValues);
    setShouldSaveVisaCard(false);
  }

  function startNewTrip() {
    dispatchRideRequests({ type: "reset-requests" });
    resetRide();
    setSelectedDestination(null);
    setDestinationDetail("");
    setDeliveryPackageDescription("");
    setSelectedDeliveryPackageType(DELIVERY_PACKAGE_TYPES[0]);
    setPaymentMethod(customerHomeMock.defaultPaymentMethod);
    resetVisaPaymentDetails();
    setSelectedServiceType(customerHomeMock.serviceTypes[0]);
    setNotice(null);
    setIsNotificationsOpen(false);
  }

  function enableMockLocation() {
    setIsMockLocationEnabled(true);
    setIsNotificationsOpen(false);
    setNotice("تم تفعيل موقع mock لهذه النسخة");
  }

  function selectPickup(nextPickup: PickupPoint) {
    setSelectedPickup(nextPickup);
    setIsMockLocationEnabled(true);
    setIsNotificationsOpen(false);
    setNotice(`تم اختيار ${nextPickup.label} كنقطة انطلاق mock`);
  }

  function selectDestination(place: DestinationPlace) {
    setSelectedDestination(place);
    setDestinationDetail(place.detail);
    setRequestStatus(null);
    setNotice(null);
    setIsNotificationsOpen(false);
    resetRide();
  }

  function selectDestinationFromSearch(place: DestinationPlace) {
    selectDestination(place);
    setNotice(`تم اختيار ${place.label} ${selectedSearchCopy.selectedNoticeSuffix}`);
  }

  function selectServiceType(serviceType: ServiceType) {
    setSelectedServiceType(serviceType);
    setRequestStatus(null);
    setNotice(`تم اختيار ${serviceType.label}`);
    setIsNotificationsOpen(false);
    void Haptics.selectionAsync();
  }

  function selectPaymentMethod(method: PaymentMethod) {
    setPaymentMethod(method);
    setNotice(null);
    void Haptics.selectionAsync();
  }

  function toggleSaveVisaCard() {
    setShouldSaveVisaCard((currentValue) => !currentValue);
    void Haptics.selectionAsync();
  }

  function openDestinationSearch() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveNav("البحث");
    setNotice("اختر وجهتك من البحث أو الأماكن المحفوظة");
    setIsNotificationsOpen(false);
  }

  function continueSelectedServiceType() {
    setActiveNav("البحث");
    setNotice(selectedServiceType.searchNotice);
    setIsNotificationsOpen(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function useSelectedSearchDestination() {
    if (!selectedDestination) {
      setNotice("اختر وجهة من نتائج البحث");
      return;
    }

    setActiveNav("الرئيسية");
    setNotice(`تم تجهيز ${selectedDestination.label} للطلب`);
  }

  function requestTrip() {
    if (!selectedDestination) {
      setNotice("اختر وجهتك قبل تأكيد الطلب");
      dispatchTripFlow({ type: "reset" });
      return;
    }

    setNotice(null);
    setIsNotificationsOpen(false);
    setRequestStatus(null);
    dispatchTripFlow({ type: "review-request" });
  }

  function confirmTrip() {
    if (!selectedDestination) {
      return;
    }

    const request: CaptainAvailableRequest = {
      customerName: customerHomeMock.profile.name,
      customerPhone: customerHomeMock.profile.phone,
      destinationArea: selectedDestination.area,
      destinationDetail: captainDestinationDetail,
      distance: selectedDestination.distance,
      etaToPickup: customerHomeMock.captain.arrivalEta,
      id: LIVE_CUSTOMER_REQUEST_ID,
      paymentMethod: effectivePaymentMethod,
      pickup: selectedPickup.label,
      price: selectedServiceType.price,
      serviceLabel: selectedServiceLabel,
    };

    dispatchRideRequests({ request, type: "submit-customer-request" });
    setRequestStatus("تم تأكيد طلبك التجريبي");
    dispatchTripFlow({ type: "confirm-request" });
    setRating(null);
    setNotice(null);
    setIsNotificationsOpen(false);
  }

  function cancelSearch() {
    resetRide();
    setNotice("تم إلغاء البحث عن كابتن");
  }

  function submitCustomerFeedback(nextRating: number | null, nextNote: string, nextTags = selectedFeedbackTags) {
    if (!acceptedCustomerRequest || effectiveRideStage !== "completed" || !nextRating) {
      return;
    }

    dispatchRideRequests({
      feedback: {
        note: formatCustomerFeedbackNote(nextNote, nextTags),
        rating: nextRating,
        requestId: acceptedCustomerRequest.id,
      },
      type: "submit-customer-feedback",
    });
  }

  function toggleFeedbackTag(tag: string) {
    const nextTags = selectedFeedbackTags.includes(tag)
      ? selectedFeedbackTags.filter((selectedTag) => selectedTag !== tag)
      : [...selectedFeedbackTags, tag];

    setSelectedFeedbackTags(nextTags);
    submitCustomerFeedback(rating, completionNote, nextTags);
  }

  function sendCustomerFeedback() {
    if (!rating) {
      setNotice("اختر تقييم النجوم أولًا");
      return;
    }

    submitCustomerFeedback(rating, completionNote, selectedFeedbackTags);
    setNotice("تم إرسال تقييم الرحلة للكابتن");
  }

  function renderTripConfirmation() {
    if (!showConfirmation || !selectedDestination) {
      return null;
    }

    return (
      <GlassCard style={styles.confirmationCard} variant="strong">
        <View style={styles.stageHeader}>
          <View style={styles.stagePulse}>
            <ShieldCheck color={colors.cyan} size={22} />
          </View>
          <View style={styles.stageCopy}>
            <Text selectable style={styles.stageTitle}>
              تأكيد الطلب
            </Text>
            <Text selectable style={styles.stageMeta}>
              راجع تفاصيل الرحلة قبل إرسالها للكباتن القريبين
            </Text>
          </View>
        </View>

        <CustomerOrderReadinessPanel
          destination={selectedDestination}
          destinationDetail={captainDestinationDetail}
          paymentMethod={effectivePaymentMethod}
          pickup={selectedPickup}
          serviceLabel={selectedServiceLabel}
          serviceType={selectedServiceType}
        />

        <View style={styles.confirmationRows}>
          <InfoRow label="نقطة الانطلاق" value={selectedPickup.label} />
          <InfoRow label="منطقة الوجهة" value={selectedDestination.area} />
          <InfoRow label="تفصيل الوجهة" value={captainDestinationDetail} />
          <InfoRow label="الخدمة" value={selectedServiceLabel} />
          <InfoRow label="نوع الخدمة" value={selectedServiceType.label} />
          <InfoRow label="المسافة" value={selectedDestination.distance} />
          <InfoRow label="السعر التقديري" value={selectedServiceType.price} />
          <InfoRow label="طريقة الدفع" value={effectivePaymentMethod} />
          {paymentMethod === "فيزا" ? (
            <InfoRow label="حفظ البطاقة" value={shouldSaveVisaCard ? "نعم - mock" : "لا"} />
          ) : null}
        </View>

        <PremiumButton
          accessibilityLabel="تأكيد الطلب"
          label="تأكيد الطلب"
          onPress={confirmTrip}
          style={styles.stagePrimaryButton}
        />
      </GlassCard>
    );
  }

  function renderRideStagePanel() {
    if (effectiveRideStage === "idle") {
      return null;
    }

    if (effectiveRideStage === "searching") {
      return (
        <GlassCard style={styles.stageCard}>
          <View style={styles.stageHeader}>
            <View style={styles.stagePulse}>
              <Car color={colors.cyan} size={22} />
            </View>
            <View style={styles.stageCopy}>
              <Text style={styles.stageTitle}>جاري البحث عن كابتن</Text>
              <Text style={styles.stageMeta}>نبحث عن أقرب كابتن يناسب رحلتك الآن</Text>
              {selectedDestination ? (
                <Text style={styles.stageMeta}>
                  {`${selectedPickup.label} ← ${selectedDestination.area} • ${captainDestinationDetail}`}
                </Text>
              ) : null}
            </View>
          </View>
          <View testID="captain-search-radar" style={styles.searchRings}>
            <View style={[styles.ring, styles.ringLarge]} />
            <View style={[styles.ring, styles.ringMedium]} />
            <View style={styles.radarScan} />
            <View style={[styles.radarDot, styles.radarDotOne]} />
            <View style={[styles.radarDot, styles.radarDotTwo]} />
            <View style={styles.searchCore}>
              <Car color={colors.text} size={20} />
            </View>
            <View style={styles.radarMetaPill}>
              <Text style={styles.radarMetaText}>{customerHomeMock.matchingCaptains}</Text>
            </View>
          </View>
          {selectedDestination ? (
            <View style={styles.stageSummary}>
              <Text selectable style={styles.stageSummaryTitle}>
                ملخص البحث
              </Text>
              <View style={styles.confirmationRows}>
                <InfoRow label="نقطة الانطلاق" value={selectedPickup.label} />
                <InfoRow label="منطقة الوجهة" value={selectedDestination.area} />
                <InfoRow label="تفصيل الوجهة" value={captainDestinationDetail} />
                <InfoRow label="الخدمة" value={selectedServiceLabel} />
                <InfoRow label="نوع الخدمة" value={selectedServiceType.label} />
                <InfoRow label="السعر" value={selectedServiceType.price} />
                <InfoRow label="طريقة الدفع" value={effectivePaymentMethod} />
                {paymentMethod === "فيزا" ? (
                  <InfoRow label="حفظ البطاقة" value={shouldSaveVisaCard ? "نعم - mock" : "لا"} />
                ) : null}
              </View>
            </View>
          ) : null}
          <View style={styles.stageActions}>
            <PremiumButton
              accessibilityLabel="إلغاء البحث"
              label="إلغاء البحث"
              onPress={cancelSearch}
              style={styles.secondaryButton}
              variant="secondary"
            >
              <XCircle color={colors.textMuted} size={16} />
            </PremiumButton>
            <PremiumButton
              accessibilityLabel="عرض الكابتن التجريبي"
              label="عرض الكابتن"
              onPress={() => dispatchTripFlow({ type: "assign-captain" })}
              style={styles.stagePrimaryButton}
            />
          </View>
        </GlassCard>
      );
    }

    if (effectiveRideStage === "captain") {
      const captain = customerHomeMock.captain;

      return (
        <GlassCard testID="accepted-captain-card" style={styles.acceptedCaptainCard} variant="strong">
          <View style={styles.acceptedHeader}>
            <View style={styles.acceptedBadge}>
              <CheckCircle color={colors.cyan} size={18} />
              <Text selectable style={styles.acceptedBadgeText}>
                تم قبول طلبك
              </Text>
            </View>
            <Text selectable style={styles.acceptedStatus}>
              {mapAcceptedTripStepToCaptainStatus(rideRequests.acceptedTripStep)}
            </Text>
          </View>

          <View style={styles.captainRow}>
            <View style={styles.captainAvatar}>
              <Text style={styles.captainInitial}>{captain.initials}</Text>
            </View>
            <View style={styles.stageCopy}>
              <Text selectable style={styles.stageTitle}>
                {captain.name}
              </Text>
              <Text selectable style={styles.stageMeta}>
                {captain.carModel}
              </Text>
              <Text selectable style={styles.stageMeta}>
                {`${captain.carColor} • لوحة ${captain.plate}`}
              </Text>
            </View>
            <View style={styles.ratingPill}>
              <Star color={colors.warning} fill={colors.warning} size={14} />
              <Text style={styles.ratingText}>{captain.rating}</Text>
            </View>
          </View>

          <View style={styles.captainStats}>
            <View style={styles.miniMetric}>
              <Clock color={colors.cyan} size={16} />
              <Text style={styles.metricValue}>{captain.arrivalEta}</Text>
              <Text style={styles.metricLabel}>وصول</Text>
            </View>
            <View style={styles.miniMetric}>
              <MapPin color={colors.cyan} size={16} />
              <Text style={styles.metricValue}>{captain.locationLabel}</Text>
              <Text style={styles.metricLabel}>موقع الكابتن</Text>
            </View>
            <View style={styles.miniMetric}>
              <Car color={colors.violetSoft} size={16} />
              <Text style={styles.metricValue}>{selectedServiceType.price}</Text>
              <Text style={styles.metricLabel}>السعر</Text>
            </View>
          </View>

          <CustomerCaptainArrivalPanel
            arrivalEta={captain.arrivalEta}
            captainLocation={captain.locationLabel}
            pickupLabel={selectedPickup.label}
          />

          {rideRequests.acceptedTripStep === "arrived" ? (
            <CustomerPickupHandoffPanel captainName={captain.name} vehicleLabel={`${captain.carColor} • لوحة ${captain.plate}`} />
          ) : null}

          <View style={styles.captainDetailsGrid}>
            <InfoRow label="رقم الكابتن" value={captain.phone} />
            <InfoRow label="نقطة الانطلاق" value={selectedPickup.label} />
            {selectedDestination ? <InfoRow label="منطقة الوجهة" value={selectedDestination.area} /> : null}
            {selectedDestination ? <InfoRow label="تفصيل الوجهة" value={captainDestinationDetail} /> : null}
          </View>

          <CustomerSafetyPanel
            onSafetyAlert={() => setNotice("تم تسجيل تنبيه الأمان mock")}
            onShareTrip={() => setNotice("تم تجهيز رابط مشاركة الرحلة mock")}
          />

          <View style={styles.stageActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="اتصال بالكابتن"
              onPress={() => setNotice("زر الاتصال mock فقط الآن")}
              style={styles.iconAction}
            >
              <Phone color={colors.textSoft} size={18} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="رسالة للكابتن"
              onPress={() => setNotice("زر الرسالة mock فقط الآن")}
              style={styles.iconAction}
            >
              <MessageCircle color={colors.textSoft} size={18} />
            </Pressable>
            <PremiumButton
              accessibilityLabel="بدء الرحلة التجريبية"
              label="بدء الرحلة"
              onPress={() => dispatchTripFlow({ type: "start-trip" })}
              style={styles.stagePrimaryButton}
            />
          </View>
        </GlassCard>
      );
    }

    if (effectiveRideStage === "active") {
      const activeRideRoute = acceptedCustomerRequest
        ? `${acceptedCustomerRequest.pickup} ← ${acceptedCustomerRequest.destinationArea}`
        : selectedDestination
          ? `${selectedPickup.label} ← ${selectedDestination.area}`
          : customerHomeMock.trips.current.route;
      const activeRideDestinationDetail = acceptedCustomerRequest?.destinationDetail ?? captainDestinationDetail;
      const activeRidePaymentMethod = acceptedCustomerRequest?.paymentMethod ?? effectivePaymentMethod;

      return (
        <GlassCard style={styles.stageCard}>
          <View style={styles.stageHeader}>
            <View style={styles.stagePulse}>
              <MapPin color={colors.cyan} size={22} />
            </View>
            <View style={styles.stageCopy}>
              <Text style={styles.stageTitle}>الرحلة الحالية</Text>
              <Text style={styles.stageMeta}>الكابتن في الطريق إلى الوجهة المختارة</Text>
            </View>
          </View>
          <View style={styles.tripMetrics}>
            <View style={styles.tripMetric}>
              <Text style={styles.metricValue}>10:24</Text>
              <Text style={styles.metricLabel}>الوصول المتوقع</Text>
            </View>
            <View style={styles.tripMetric}>
              <Text style={styles.metricValue}>2.1 كم</Text>
              <Text style={styles.metricLabel}>المسافة المتبقية</Text>
            </View>
            <View style={styles.tripMetric}>
              <Text style={styles.metricValue}>5 د</Text>
              <Text style={styles.metricLabel}>الوقت المتبقي</Text>
            </View>
          </View>
          <CustomerActiveRidePanel
            destinationDetail={activeRideDestinationDetail}
            paymentMethod={activeRidePaymentMethod}
            route={activeRideRoute}
          />
          <CustomerSafetyPanel
            onSafetyAlert={() => setNotice("تم تسجيل تنبيه الأمان mock")}
            onShareTrip={() => setNotice("تم تجهيز رابط مشاركة الرحلة mock")}
          />
          <PremiumButton
            accessibilityLabel="إنهاء الرحلة"
            label="إنهاء الرحلة"
            onPress={() => dispatchTripFlow({ type: "complete-trip" })}
            style={styles.stagePrimaryButton}
          />
        </GlassCard>
      );
    }

    return (
      <GlassCard style={styles.stageCard}>
        <View style={styles.completedIcon}>
          <CheckCircle color={colors.cyan} size={42} />
        </View>
        <Text style={styles.completedTitle}>تم الوصول</Text>
        <Text style={styles.stageMeta}>شكرًا لاستخدامك واصل</Text>
        <CustomerReceiptCard
          amount={acceptedCustomerRequest?.price ?? selectedServiceType.price}
          destinationDetail={acceptedCustomerRequest?.destinationDetail ?? captainDestinationDetail}
          onDownload={() => setNotice("تم تجهيز إيصال الرحلة mock")}
          paymentMethod={acceptedCustomerRequest?.paymentMethod ?? effectivePaymentMethod}
          receiptNumber="WAS-0001"
          route={
            acceptedCustomerRequest
              ? `${acceptedCustomerRequest.pickup} ← ${acceptedCustomerRequest.destinationArea}`
              : selectedDestination
                ? `${selectedPickup.label} ← ${selectedDestination.area}`
                : customerHomeMock.trips.current.route
          }
          serviceLabel={acceptedCustomerRequest?.serviceLabel ?? selectedServiceLabel}
        />
        <CustomerFeedbackCard
          captainLabel={`${customerHomeMock.captain.name} • ${customerHomeMock.captain.carModel}`}
          completionNote={completionNote}
          feedbackTags={CUSTOMER_FEEDBACK_TAGS}
          onChangeNote={(note) => {
            setCompletionNote(note);
            submitCustomerFeedback(rating, note);
          }}
          onSend={sendCustomerFeedback}
          onSelectRating={(star) => {
            setRating(star);
            submitCustomerFeedback(star, completionNote);
          }}
          onToggleTag={toggleFeedbackTag}
          rating={rating}
          selectedTags={selectedFeedbackTags}
        />
        <PremiumButton
          accessibilityLabel="رحلة جديدة"
          label="رحلة جديدة"
          onPress={startNewTrip}
          style={styles.secondaryButton}
          variant="secondary"
        />
      </GlassCard>
    );
  }

  function renderLiveRequestHub() {
    if (!requestStatus || !selectedDestination || effectiveRideStage === "idle") {
      return null;
    }

    const liveStatus =
      effectiveRideStage === "searching"
        ? "نبحث عن أقرب كابتن"
        : effectiveRideStage === "captain"
          ? mapAcceptedTripStepToCaptainStatus(rideRequests.acceptedTripStep)
          : effectiveRideStage === "active"
            ? "الرحلة بدأت"
            : "تمت الرحلة بنجاح";
    const nextStep =
      effectiveRideStage === "searching"
        ? "سيظهر لك موقع الكابتن والمسافة فور قبول الطلب"
        : effectiveRideStage === "captain"
          ? "تابع موقع الكابتن والمسافة حتى يصل إليك"
          : effectiveRideStage === "active"
            ? "الكابتن بدأ الرحلة نحو وجهتك"
            : "راجع الإيصال وقيم تجربتك";
    const liveDestinationDetail = acceptedCustomerRequest?.destinationDetail ?? captainDestinationDetail;
    const livePaymentMethod = acceptedCustomerRequest?.paymentMethod ?? effectivePaymentMethod;
    const liveRoute = acceptedCustomerRequest
      ? `${acceptedCustomerRequest.pickup} ← ${acceptedCustomerRequest.destinationArea}`
      : `${selectedPickup.label} ← ${selectedDestination.area}`;
    const liveDistance = acceptedCustomerRequest?.distance ?? selectedDestination.distance;
    const livePrice = acceptedCustomerRequest?.price ?? selectedServiceType.price;

    return (
      <GlassCard testID="customer-live-request-hub" style={styles.liveRequestHubCard} variant="strong">
        <View style={styles.liveRequestHubHeader}>
          <View style={styles.liveRequestHubIcon}>
            <ShieldCheck color={colors.cyan} size={20} />
          </View>
          <View style={styles.liveRequestHubCopy}>
            <Text selectable style={styles.liveRequestHubTitle}>
              مركز متابعة الطلب
            </Text>
            <Text selectable style={styles.liveRequestHubMeta}>
              طلبك وصل للكباتن القريبين
            </Text>
          </View>
        </View>

        <View style={styles.liveRequestStatusBand}>
          <View style={styles.liveRequestStatusIcon}>
            <Car color={colors.text} size={18} />
          </View>
          <View style={styles.liveRequestStatusCopy}>
            <Text selectable style={styles.liveRequestStatusLabel}>
              حالة الطلب
            </Text>
            <Text selectable style={styles.liveRequestStatusValue}>
              {liveStatus}
            </Text>
          </View>
        </View>

        <View style={styles.liveRequestPills}>
          <View style={styles.liveRequestPill}>
            <Text selectable style={styles.liveRequestPillText}>
              {liveDistance}
            </Text>
          </View>
          <View style={styles.liveRequestPill}>
            <Text selectable style={styles.liveRequestPillText}>
              {livePrice}
            </Text>
          </View>
          <View style={styles.liveRequestPill}>
            <Text selectable style={styles.liveRequestPillText}>
              {liveRoute}
            </Text>
          </View>
        </View>

        <View style={styles.liveRequestRows}>
          <InfoRow label="نوع الخدمة" value={selectedServiceType.label} />
          <InfoRow label="طريقة الدفع" value={livePaymentMethod} />
          <InfoRow label="ملاحظة للكابتن" value={liveDestinationDetail} />
        </View>

        <View style={styles.liveRequestNextStep}>
          <Text selectable style={styles.liveRequestNextLabel}>
            الخطوة التالية
          </Text>
          <Text selectable style={styles.liveRequestNextValue}>
            {nextStep}
          </Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient pointerEvents="none" colors={gradients.app} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + 120
          }
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="فتح التنبيهات"
            hitSlop={10}
            onPress={() => {
              setNotice(null);
              setIsNotificationsOpen((current) => !current);
            }}
          >
            {({ pressed }) => (
              <GlassCard style={[styles.iconButton, pressed ? styles.pressed : null]}>
                <Bell color={colors.textSoft} size={18} />
              </GlassCard>
            )}
          </Pressable>
          <View style={styles.brandLockup}>
            <View style={styles.brandCopy}>
              <Text selectable style={styles.brandName}>
                واصل
              </Text>
              <Text selectable style={styles.brandMeta}>
                تطبيق العميل
              </Text>
            </View>
            <LinearGradient colors={gradients.primary} style={styles.logoMark}>
              <Text selectable style={styles.logoLetter}>
                W
              </Text>
            </LinearGradient>
          </View>
        </View>

        {notice ? (
          <GlassCard style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>{notice}</Text>
          </GlassCard>
        ) : null}

        {isNotificationsOpen ? (
          <CustomerNotificationCenter onClose={() => setIsNotificationsOpen(false)} />
        ) : null}

        {latestRealtimeEvent ? (
          <RealtimeStatusCard event={latestRealtimeEvent} summary={realtimeConnectionSummary} />
        ) : null}
        <RealtimeActivityFeed events={recentRealtimeEvents} />

        <View style={styles.heroCopy}>
          <Text selectable style={styles.greeting}>
            {activeNav === "رحلاتي"
              ? customerHomeMock.trips.title
              : activeNav === "حسابي"
                ? "ملف العميل"
                : activeNav === "البحث"
                  ? "البحث"
                  : customerHomeMock.greeting}
          </Text>
          <Text selectable style={styles.subtitle}>
            {activeNav === "رحلاتي"
              ? "تابع رحلتك الحالية وسجل رحلاتك السابقة"
              : activeNav === "حسابي"
                ? "بياناتك الأساسية وتجربة الدفع mock"
                : activeNav === "البحث"
                  ? "اختر وجهتك بسرعة من الأماكن القريبة والمحفوظة"
                  : customerHomeMock.subtitle}
          </Text>
        </View>

        {activeNav === "رحلاتي" ? (
          <CustomerTripsTab liveTrip={liveCustomerTrip} />
        ) : activeNav === "حسابي" ? (
          <CustomerProfileTab
            onAddPayment={() => setNotice("تم فتح إضافة طريقة دفع mock")}
            onManageSecurity={() => setNotice("تم فتح إعدادات أمان الحساب mock")}
            onReviewProfile={() => setNotice("مراجعة بيانات الحساب mock فقط الآن")}
          />
        ) : activeNav === "البحث" ? (
          <CustomerSearchTab
            activeFilter={activeSearchFilter}
            destinationDetail={selectedDestination ? destinationDetail : undefined}
            onChangeDestinationDetail={setDestinationDetail}
            onChangeFilter={setActiveSearchFilter}
            onChangeQuery={setSearchQuery}
            onRefreshSuggestions={() => setNotice("تم تحديث اقتراحات البحث mock فقط الآن")}
            onSelectDestination={selectDestinationFromSearch}
            onUseDestination={useSelectedSearchDestination}
            pickupLabel={selectedPickup.label}
            query={searchQuery}
            searchCopy={selectedSearchCopy}
            selectedDestination={selectedDestination}
          />
        ) : (
          <>
            <MotionSurface delay={0} testID="customer-motion-primary-booking">
              <GlassCard testID="customer-primary-booking-card" style={styles.primaryBookingCard} variant="strong">
                <View style={styles.primaryBookingHeader}>
                  <View style={styles.primaryBookingIcon}>
                    <Search color={colors.cyan} size={22} />
                  </View>
                  <View style={styles.primaryBookingCopy}>
                    <Text selectable style={styles.primaryBookingTitle}>
                      اطلب رحلتك بسهولة
                    </Text>
                    <Text selectable style={styles.primaryBookingMeta}>
                      اختر وجهتك أولا، وبعدها نجهز لك السعر والمسار والكابتن الأقرب.
                    </Text>
                  </View>
                </View>

                <View style={styles.primaryBookingMetrics}>
                  <View style={styles.primaryBookingMetric}>
                    <Text selectable style={styles.primaryBookingMetricValue}>
                      {selectedPickup.label}
                    </Text>
                    <Text selectable style={styles.primaryBookingMetricLabel}>
                      انطلاقك
                    </Text>
                  </View>
                  <View style={styles.primaryBookingMetric}>
                    <Text selectable style={styles.primaryBookingMetricValue}>
                      {selectedServiceType.price}
                    </Text>
                    <Text selectable style={styles.primaryBookingMetricLabel}>
                      سعر مبدئي
                    </Text>
                  </View>
                </View>

                <PremiumButton
                  accessibilityLabel="اختيار الوجهة لبدء الطلب"
                  label="اختيار الوجهة"
                  onPress={openDestinationSearch}
                  style={styles.primaryBookingButton}
                >
                  <MapPin color={colors.text} size={17} />
                </PremiumButton>
              </GlassCard>
            </MotionSurface>

            <MotionSurface delay={70} testID="customer-motion-booking-flow">
              <CustomerBookingFlowStrip
                destinationLabel={selectedDestination?.label ?? null}
                serviceLabel={selectedServiceType.label}
              />
            </MotionSurface>

            <MotionSurface delay={140} testID="customer-motion-service-type">
              <GlassCard testID="customer-service-type-picker" style={styles.serviceTypePicker}>
                <View style={styles.serviceTypeHeader}>
                  <View style={styles.serviceTypeHeaderIcon}>
                    <Car color={colors.cyan} size={19} />
                  </View>
                  <View style={styles.serviceTypeHeaderCopy}>
                    <Text selectable style={styles.serviceTypeTitle}>
                      اختر نوع الخدمة
                    </Text>
                    <Text selectable style={styles.serviceTypeMeta}>
                      ثلاث خيارات واضحة حسب مشوارك اليوم.
                    </Text>
                  </View>
                </View>

                <View style={styles.serviceTypeList}>
                  {customerHomeMock.serviceTypes.map((serviceType) => {
                    const isSelected = selectedServiceType.id === serviceType.id;

                    return (
                      <Pressable
                        key={serviceType.id}
                        accessibilityRole="button"
                        accessibilityLabel={`اختيار ${serviceType.label}`}
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => selectServiceType(serviceType)}
                        style={({ pressed }) => [
                          styles.serviceTypeOption,
                          isSelected ? styles.serviceTypeOptionActive : null,
                          pressed ? styles.pressed : null
                        ]}
                      >
                        <View style={styles.serviceTypeEmoji}>
                          <Text style={styles.serviceTypeEmojiText}>{serviceType.emoji}</Text>
                        </View>
                        <View style={styles.serviceTypeCopy}>
                          <Text selectable style={styles.serviceTypeOptionTitle}>
                            {serviceType.label}
                          </Text>
                          <Text selectable style={styles.serviceTypeOptionMeta}>
                            {serviceType.vehicle} • {serviceType.description}
                          </Text>
                        </View>
                        <View style={styles.serviceTypePricePill}>
                          <Text selectable style={styles.serviceTypePriceText}>
                            {serviceType.price}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </GlassCard>
            </MotionSurface>

            <MotionSurface delay={210} testID="customer-motion-service-next-step">
              <GlassCard testID="customer-service-next-step" style={styles.serviceNextStepCard} variant="strong">
                <View style={styles.serviceNextStepHeader}>
                  <View style={styles.serviceNextStepBadge}>
                    <Text style={styles.serviceNextStepEmoji}>{selectedServiceType.emoji}</Text>
                  </View>
                  <View style={styles.serviceNextStepCopy}>
                    <Text selectable style={styles.serviceNextStepTitle}>
                      {selectedServiceType.nextStepTitle}
                    </Text>
                    <Text selectable style={styles.serviceNextStepMeta}>
                      {selectedServiceType.nextStepHint}
                    </Text>
                  </View>
                </View>

                <View style={styles.serviceNextStepSummary}>
                  <View style={styles.serviceNextStepMetric}>
                    <Text selectable style={styles.serviceNextStepValue}>
                      {selectedServiceType.eta}
                    </Text>
                    <Text selectable style={styles.serviceNextStepLabel}>
                      وصول قريب
                    </Text>
                  </View>
                  <View style={styles.serviceNextStepMetric}>
                    <Text selectable style={styles.serviceNextStepValue}>
                      {selectedServiceType.price}
                    </Text>
                    <Text selectable style={styles.serviceNextStepLabel}>
                      تقدير أولي
                    </Text>
                  </View>
                </View>

                <PremiumButton
                  accessibilityLabel={selectedServiceType.nextStepAction}
                  label={selectedServiceType.nextStepAction}
                  onPress={continueSelectedServiceType}
                  style={styles.serviceNextStepButton}
                >
                  <Search color={colors.text} size={17} />
                </PremiumButton>
              </GlassCard>
            </MotionSurface>

            <MockRouteMap
              destinationArea={selectedDestination?.area}
              destinationDetail={selectedDestination ? destinationDetail : undefined}
              phase={mapCustomerStageToMapPhase(effectiveRideStage, rideRequests.acceptedTripStep)}
              pickupLabel={selectedPickup.label}
            />

        <CustomerLocationCard
          isMockLocationEnabled={isMockLocationEnabled}
          onEnableLocation={enableMockLocation}
          onSelectPickup={selectPickup}
          selectedPickup={selectedPickup}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="اختيار الوجهة"
          onPress={() => setNotice("اختر وجهة من الأماكن المحفوظة")}
        >
          {({ pressed }) => (
            <GlassCard style={[styles.searchCard, pressed ? styles.pressed : null]}>
              <View style={styles.searchIcon}>
                <MapPin color={colors.cyan} size={18} />
              </View>
              <View style={styles.searchCopy}>
                <Text style={styles.searchLabel}>{selectedPickup.detail}</Text>
                <Text style={styles.searchValue}>
                  {selectedDestination
                    ? `الوجهة المختارة: ${selectedDestination.label}`
                    : customerHomeMock.destinationHint}
                </Text>
                {selectedDestination ? <Text style={styles.searchLabel}>{selectedDestination.area}</Text> : null}
              </View>
              <ChevronLeft color={colors.textMuted} size={20} />
            </GlassCard>
          )}
        </Pressable>

        <View style={styles.quickStats}>
          <GlassCard style={styles.statCard}>
            <Sparkles color={colors.cyan} size={18} />
            <Text selectable style={styles.statValue}>
              {customerHomeMock.nearbyDrivers}
            </Text>
            <Text selectable style={styles.statLabel}>
              سائقون قريبون
            </Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <ShieldCheck color={colors.success} size={18} />
            <Text selectable style={styles.statValue}>
              {selectedServiceType.price}
            </Text>
            <Text selectable style={styles.statLabel}>
              سعر مقترح
            </Text>
          </GlassCard>
        </View>

        <View style={styles.sectionHeader}>
          <Text selectable style={styles.sectionTitle}>
            أماكن محفوظة
          </Text>
        </View>

        <View style={styles.savedPlaces}>
          {customerHomeMock.savedPlaces.map((place) => {
            const Icon = place.icon;

            return (
              <Pressable
                key={place.label}
                accessibilityRole="button"
                accessibilityLabel={`اختيار ${place.label}`}
                onPress={() => selectDestination(place)}
              >
                {({ pressed }) => (
                  <GlassCard
                    style={[
                      styles.placeCard,
                      selectedDestination?.label === place.label ? styles.selectableCardActive : null,
                      pressed ? styles.pressed : null
                    ]}
                  >
                    <View style={styles.placeIcon}>
                      <Icon color={colors.text} size={17} />
                    </View>
                    <View style={styles.placeCopy}>
                      <Text style={styles.placeLabel}>{place.label}</Text>
                      <Text style={styles.placeDetail}>{place.area}</Text>
                      <Text style={styles.placeDetail}>{place.detail}</Text>
                    </View>
                  </GlassCard>
                )}
              </Pressable>
            );
          })}
        </View>

        {selectedDestination ? (
          <GlassCard style={styles.destinationCard} variant="strong">
            <View style={styles.destinationHeader}>
              <View style={styles.destinationPin}>
                <MapPin color={colors.cyan} size={18} />
              </View>
              <View style={styles.destinationCopy}>
                <Text selectable style={styles.destinationTitle}>
                  {selectedDestination.area}
                </Text>
                <Text selectable style={styles.destinationMeta}>
                  {selectedDestination.label}
                </Text>
              </View>
            </View>

            <View style={styles.detailField}>
              <Text selectable style={styles.detailLabel}>
                تفصيل الوجهة
              </Text>
              <TextInput
                accessibilityLabel="تفصيل الوجهة"
                onChangeText={setDestinationDetail}
                placeholder="اكتب تفصيل الوجهة"
                placeholderTextColor={colors.textMuted}
                style={styles.detailInput}
                value={destinationDetail}
              />
            </View>

            {selectedServiceType.id === "delivery" ? (
              <CustomerDeliveryPackagePanel
                description={deliveryPackageDescription}
                onChangeDescription={setDeliveryPackageDescription}
                onSelectType={(packageType) => {
                  setSelectedDeliveryPackageType(packageType);
                  void Haptics.selectionAsync();
                }}
                packageTypes={DELIVERY_PACKAGE_TYPES}
                selectedType={selectedDeliveryPackageType}
              />
            ) : null}

            <View style={styles.serviceGroup}>
              <Text selectable style={styles.detailLabel}>
                نوع الخدمة
              </Text>
              <View style={styles.serviceCard}>
                <View style={styles.servicePriceBox}>
                  <Text selectable style={styles.servicePrice}>
                    {selectedServiceType.price}
                  </Text>
                  <Text selectable style={styles.serviceEta}>
                    {selectedServiceType.eta}
                  </Text>
                </View>
                <View style={styles.serviceCopy}>
                  <View style={styles.serviceTitleRow}>
                    <View style={styles.serviceBadge}>
                      <Text selectable style={styles.serviceBadgeText}>
                        أقرب كابتن
                      </Text>
                    </View>
                    <Text selectable style={styles.serviceLabel}>
                      {selectedServiceType.label}
                    </Text>
                  </View>
                  <Text selectable style={styles.serviceMeta}>
                    {selectedServiceType.description}
                  </Text>
                </View>
                <CheckCircle color={colors.cyan} size={18} />
              </View>
            </View>

            <View style={styles.paymentGroup}>
              <Text selectable style={styles.detailLabel}>
                طريقة الدفع
              </Text>
              <View style={styles.paymentOptions}>
                {customerHomeMock.paymentMethods.map((method) => (
                  <Pressable
                    key={method}
                    accessibilityLabel={method}
                    accessibilityRole="button"
                    onPress={() => selectPaymentMethod(method)}
                    style={({ pressed }) => [
                      styles.paymentOption,
                      paymentMethod === method ? styles.paymentOptionActive : null,
                      pressed ? styles.pressed : null
                    ]}
                  >
                    <Text
                      style={[
                        styles.paymentOptionText,
                        paymentMethod === method ? styles.paymentOptionTextActive : null
                      ]}
                    >
                      {method}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {paymentMethod === "فيزا" ? (
                <View style={styles.visaPaymentPanel}>
                  <View style={styles.visaPaymentHeader}>
                    <View style={styles.visaPaymentIcon}>
                      <CreditCard color={colors.cyan} size={18} />
                    </View>
                    <View style={styles.visaPaymentCopy}>
                      <Text selectable style={styles.visaPaymentTitle}>
                        بطاقة فيزا mock
                      </Text>
                      <Text selectable style={styles.visaPaymentMeta}>
                        بيانات تجريبية فقط، لن يتم خصم أي مبلغ الآن.
                      </Text>
                    </View>
                  </View>

                  <Controller
                    control={visaForm.control}
                    name="cardholderName"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        accessibilityLabel="اسم حامل البطاقة"
                        onChangeText={onChange}
                        placeholder="الاسم على البطاقة"
                        placeholderTextColor={colors.textMuted}
                        style={styles.paymentInput}
                        value={value}
                      />
                    )}
                  />
                  <Controller
                    control={visaForm.control}
                    name="cardNumber"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        accessibilityLabel="رقم بطاقة فيزا"
                        keyboardType="number-pad"
                        onChangeText={onChange}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor={colors.textMuted}
                        style={styles.paymentInput}
                        value={value}
                      />
                    )}
                  />
                  <View style={styles.paymentInputRow}>
                    <Controller
                      control={visaForm.control}
                      name="expiry"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          accessibilityLabel="تاريخ انتهاء فيزا"
                          onChangeText={onChange}
                          placeholder="MM/YY"
                          placeholderTextColor={colors.textMuted}
                          style={[styles.paymentInput, styles.paymentInputHalf]}
                          value={value}
                        />
                      )}
                    />
                    <Controller
                      control={visaForm.control}
                      name="cvc"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          accessibilityLabel="رمز CVC"
                          keyboardType="number-pad"
                          onChangeText={onChange}
                          placeholder="CVC"
                          placeholderTextColor={colors.textMuted}
                          secureTextEntry
                          style={[styles.paymentInput, styles.paymentInputHalf]}
                          value={value}
                        />
                      )}
                    />
                  </View>

                  <View
                    style={[
                      styles.visaReadinessBox,
                      visaValidationResult.success
                        ? styles.visaReadinessBoxReady
                        : isVisaPaymentDirty
                          ? styles.visaReadinessBoxWarning
                          : null
                    ]}
                  >
                    <Text selectable style={styles.visaReadinessTitle}>
                      {visaValidationResult.success
                        ? "بيانات فيزا جاهزة للتجربة"
                        : isVisaPaymentDirty
                          ? "أكمل بيانات فيزا قبل تأكيد الطلب"
                          : "أدخل بيانات فيزا عند استخدام البطاقة"}
                    </Text>
                    {isVisaPaymentDirty && !visaValidationResult.success
                      ? visaValidationMessages.map((message) => (
                          <Text key={message} selectable style={styles.visaReadinessIssue}>
                            {message}
                          </Text>
                        ))
                      : null}
                  </View>

                  <Pressable
                    accessibilityLabel="حفظ بطاقة فيزا لهذا الحساب"
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: shouldSaveVisaCard }}
                    onPress={toggleSaveVisaCard}
                    style={({ pressed }) => [
                      styles.saveVisaToggle,
                      shouldSaveVisaCard ? styles.saveVisaToggleActive : null,
                      pressed ? styles.pressed : null
                    ]}
                  >
                    <View style={styles.saveVisaCheck}>
                      {shouldSaveVisaCard ? <CheckCircle color={colors.success} size={16} /> : null}
                    </View>
                    <Text selectable style={styles.saveVisaText}>
                      حفظ البطاقة لهذا الحساب
                    </Text>
                  </Pressable>

                  {visaValidationResult.success && visaCardLastFour ? (
                    <View style={styles.visaSummaryBox}>
                      <Text selectable style={styles.visaSummaryText}>
                        {`سيتم استخدام فيزا • **** ${visaCardLastFour}`}
                      </Text>
                      {shouldSaveVisaCard ? (
                        <Text selectable style={styles.visaSummaryMeta}>
                          سيتم حفظ البطاقة mock للاستخدام القادم
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          </GlassCard>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text selectable style={styles.sectionTitle}>
            تفاصيل الطلب
          </Text>
        </View>

        <GlassCard style={styles.tripCard}>
          <View style={styles.tripPricePill}>
            <Text style={styles.tripPrice}>{selectedServiceType.price}</Text>
          </View>
          <View style={styles.tripCopy}>
            <Text style={styles.tripLabel}>{selectedServiceLabel}</Text>
            <Text style={styles.tripMeta}>{selectedServiceType.description}</Text>
            <Text style={styles.tripMeta}>
              {selectedDestination ? `${selectedDestination.distance} • ${selectedServiceType.eta}` : selectedServiceType.eta}
            </Text>
          </View>
        </GlassCard>

        <PremiumButton
          accessibilityLabel="طلب رحلة"
          label="اطلب رحلة"
          style={styles.primaryButton}
          onPress={requestTrip}
        />

        {renderTripConfirmation()}

        {renderRideStagePanel()}

        {renderLiveRequestHub()}

        <GlassCard style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>
            {requestStatus ??
              `الطلب المحدد: ${selectedServiceLabel} • ${selectedServiceType.price}`}
          </Text>
          {requestStatus ? (
            <Text style={styles.feedbackMeta}>
              {`الطلب المحدد: ${selectedServiceLabel} • ${selectedServiceType.price}`}
            </Text>
          ) : null}
          {selectedDestination ? (
            <>
              <Text style={styles.feedbackMeta}>{`الوجهة المختارة: ${selectedDestination.label}`}</Text>
              <Text style={styles.feedbackMeta}>{`${selectedPickup.label} ← ${selectedDestination.area}`}</Text>
            </>
          ) : null}
          {requestStatus && onPreviewCaptainRequests ? (
            <PremiumButton
              accessibilityLabel="معاينة الطلب عند الكابتن"
              label="معاينة الطلب عند الكابتن"
              onPress={onPreviewCaptainRequests}
              style={styles.previewCaptainButton}
              variant="secondary"
            >
              <Car color={colors.textSoft} size={16} />
            </PremiumButton>
          ) : null}
        </GlassCard>
          </>
        )}
      </ScrollView>

      <GlassCard
        testID="floating-bottom-nav"
        style={[
          styles.bottomNav,
          {
            bottom: insets.bottom + spacing.md
          }
        ]}
      >
        {customerHomeMock.navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Pressable
              key={item.label}
              accessibilityLabel={`فتح تبويب ${item.label}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeNav === item.label }}
              hitSlop={8}
              onPress={() => {
                setNotice(null);
                setActiveNav(item.label);
              }}
              style={({ pressed }) => [
                styles.navItem,
                activeNav === item.label ? styles.navItemActive : null,
                pressed ? styles.navItemPressed : null
              ]}
            >
              <Icon color={activeNav === item.label ? colors.text : colors.textMuted} size={18} />
              <Text style={[styles.navLabel, activeNav === item.label ? styles.navLabelActive : null]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </GlassCard>
      <View pointerEvents="none" style={[styles.activeNavToast, { bottom: insets.bottom + 92 }]}>
        <Text style={styles.activeNavText}>{`التبويب النشط: ${activeNav}`}</Text>
      </View>
    </View>
  );
}

function MotionSurface({
  children,
  delay,
  testID
}: {
  children: ReactNode;
  delay: number;
  testID: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(380).delay(delay)}
      style={styles.motionSurface}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
}

function CustomerBookingFlowStrip({
  destinationLabel,
  serviceLabel
}: {
  destinationLabel: string | null;
  serviceLabel: string;
}) {
  const steps = [
    {
      isReady: true,
      label: "نوع الخدمة",
      value: serviceLabel
    },
    {
      isReady: Boolean(destinationLabel),
      label: "الوجهة",
      value: destinationLabel ? "الوجهة جاهزة" : "الوجهة بانتظار اختيارك"
    },
    {
      isReady: Boolean(destinationLabel),
      label: "التأكيد",
      value: destinationLabel ? "جاهز للتأكيد" : "بعد اختيار الوجهة"
    }
  ];

  return (
    <GlassCard testID="customer-booking-flow-strip" style={styles.bookingFlowStrip} variant="strong">
      <View style={styles.bookingFlowHeader}>
        <View style={styles.bookingFlowHeaderIcon}>
          <CheckCircle color={colors.cyan} size={18} />
        </View>
        <View style={styles.bookingFlowCopy}>
          <Text selectable style={styles.bookingFlowTitle}>
            ابدأ الطلب بثلاث خطوات
          </Text>
          <Text selectable style={styles.bookingFlowMeta}>
            نوع الخدمة، الوجهة، ثم تأكيد الطلب
          </Text>
        </View>
      </View>

      <View style={styles.bookingFlowSteps}>
        {steps.map((step, index) => (
          <View key={step.label} style={[styles.bookingFlowStep, step.isReady ? styles.bookingFlowStepReady : null]}>
            <View style={[styles.bookingFlowIndex, step.isReady ? styles.bookingFlowIndexReady : null]}>
              <Text selectable style={styles.bookingFlowIndexText}>
                {index + 1}
              </Text>
            </View>
            <View style={styles.bookingFlowStepCopy}>
              <Text selectable style={styles.bookingFlowStepLabel}>
                {step.label}
              </Text>
              <Text selectable style={styles.bookingFlowStepValue}>
                {step.value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {destinationLabel ? (
        <Text selectable style={styles.bookingFlowDestination}>
          {destinationLabel}
        </Text>
      ) : null}
    </GlassCard>
  );
}

function CustomerDeliveryPackagePanel({
  description,
  onChangeDescription,
  onSelectType,
  packageTypes,
  selectedType
}: {
  description: string;
  onChangeDescription: (description: string) => void;
  onSelectType: (packageType: DeliveryPackageType) => void;
  packageTypes: readonly DeliveryPackageType[];
  selectedType: DeliveryPackageType;
}) {
  const trimmedDescription = description.trim();

  return (
    <View testID="customer-delivery-package-panel" style={styles.deliveryPackagePanel}>
      <View style={styles.deliveryPackageHeader}>
        <View style={styles.deliveryPackageIcon}>
          <Sparkles color={colors.cyan} size={17} />
        </View>
        <View style={styles.deliveryPackageCopy}>
          <Text selectable style={styles.deliveryPackageTitle}>
            تفاصيل الطلبية
          </Text>
          <Text selectable style={styles.deliveryPackageMeta}>
            أضف نوع الغرض ووصفه حتى يظهر للكابتن بوضوح.
          </Text>
        </View>
      </View>

      <View style={styles.deliveryPackageTypeGroup}>
        <Text selectable style={styles.deliveryPackageLabel}>
          نوع الغرض
        </Text>
        <View style={styles.deliveryPackageChips}>
          {packageTypes.map((packageType) => {
            const isSelected = selectedType === packageType;

            return (
              <Pressable
                key={packageType}
                accessibilityLabel={`اختيار نوع غرض ${packageType}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelectType(packageType)}
                style={({ pressed }) => [
                  styles.deliveryPackageChip,
                  isSelected ? styles.deliveryPackageChipActive : null,
                  pressed ? styles.pressed : null
                ]}
              >
                <Text
                  selectable
                  style={[
                    styles.deliveryPackageChipText,
                    isSelected ? styles.deliveryPackageChipTextActive : null
                  ]}
                >
                  {packageType}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TextInput
        accessibilityLabel="وصف الطلبية"
        multiline
        onChangeText={onChangeDescription}
        placeholder="مثلا: كيس ملابس صغير أو مستندات داخل ظرف"
        placeholderTextColor={colors.textMuted}
        style={styles.deliveryPackageInput}
        value={description}
      />

      {trimmedDescription ? (
        <View style={styles.deliveryPackagePreview}>
          <Text selectable style={styles.deliveryPackagePreviewLabel}>
            {selectedType}
          </Text>
          <Text selectable style={styles.deliveryPackagePreviewText}>
            {trimmedDescription}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function CustomerOrderReadinessPanel({
  destination,
  destinationDetail,
  paymentMethod,
  pickup,
  serviceLabel,
  serviceType
}: {
  destination: DestinationPlace;
  destinationDetail: string;
  paymentMethod: string;
  pickup: PickupPoint;
  serviceLabel: string;
  serviceType: ServiceType;
}) {
  const routeLabel = `${pickup.label} ← ${destination.area}`;
  const captainNote = destinationDetail.trim() || destination.detail;
  const captainNoteLabel = destinationDetail.trim() ? "ملاحظة الكابتن جاهزة" : "ملاحظة الكابتن من الوجهة";
  const readinessItems = [
    {
      detail: `${serviceType.vehicle} • ${serviceType.eta}`,
      icon: "service",
      label: "الخدمة المختارة",
      value: serviceLabel
    },
    {
      detail: destination.distance,
      icon: "route",
      label: "المسار واضح",
      value: routeLabel
    },
    {
      detail: captainNote,
      icon: "note",
      label: captainNoteLabel,
      value: destination.label
    },
    {
      detail: "سيظهر للكابتن بعد القبول",
      icon: "payment",
      label: "الدفع جاهز",
      value: paymentMethod
    }
  ] as const;

  return (
    <View testID="customer-order-readiness-panel" style={styles.orderReadinessPanel}>
      <View style={styles.orderReadinessHeader}>
        <View style={styles.orderReadinessIcon}>
          <CheckCircle color={colors.success} size={18} />
        </View>
        <View style={styles.orderReadinessCopy}>
          <Text selectable style={styles.orderReadinessTitle}>
            ملخص جاهزية الطلب
          </Text>
          <Text selectable style={styles.orderReadinessMeta}>
            أهم تفاصيل الطلب جاهزة قبل الإرسال للكابتن
          </Text>
        </View>
      </View>

      <View style={styles.orderReadinessGrid}>
        {readinessItems.map((item) => (
          <View key={item.label} style={styles.orderReadinessItem}>
            <View style={styles.orderReadinessItemIcon}>
              {item.icon === "service" ? <Car color={colors.cyan} size={15} /> : null}
              {item.icon === "route" ? <MapPin color={colors.cyan} size={15} /> : null}
              {item.icon === "note" ? <MessageCircle color={colors.violetSoft} size={15} /> : null}
              {item.icon === "payment" ? <CreditCard color={colors.success} size={15} /> : null}
            </View>
            <View style={styles.orderReadinessItemCopy}>
              <Text selectable style={styles.orderReadinessItemLabel}>
                {item.label}
              </Text>
              <Text selectable style={styles.orderReadinessItemValue}>
                {item.value}
              </Text>
              <Text selectable style={styles.orderReadinessItemDetail}>
                {item.detail}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function CustomerReceiptCard({
  amount,
  destinationDetail,
  onDownload,
  paymentMethod,
  receiptNumber,
  route,
  serviceLabel
}: {
  amount: string;
  destinationDetail: string;
  onDownload: () => void;
  paymentMethod: string;
  receiptNumber: string;
  route: string;
  serviceLabel: string;
}) {
  return (
    <View style={styles.receiptCard}>
      <View style={styles.receiptHeader}>
        <View style={styles.receiptIcon}>
          <CreditCard color={colors.cyan} size={17} />
        </View>
        <View style={styles.receiptCopy}>
          <Text selectable style={styles.receiptTitle}>
            إيصال الرحلة
          </Text>
          <Text selectable style={styles.receiptMeta}>
            {`رقم الإيصال: ${receiptNumber}`}
          </Text>
        </View>
      </View>
      <View style={styles.receiptRows}>
        <Text selectable style={styles.receiptLine}>
          {`المبلغ المدفوع: ${amount}`}
        </Text>
        <Text selectable style={styles.receiptLine}>
          {`طريقة الدفع: ${paymentMethod}`}
        </Text>
        <Text selectable style={styles.receiptLine}>
          {`الخدمة: ${serviceLabel}`}
        </Text>
        <Text selectable style={styles.receiptLine}>
          {`المسار: ${route}`}
        </Text>
        <Text selectable style={styles.receiptLineMuted}>
          {`تفصيل الوجهة: ${destinationDetail}`}
        </Text>
      </View>
      <Pressable
        accessibilityLabel="تحميل إيصال الرحلة"
        accessibilityRole="button"
        onPress={onDownload}
        style={styles.receiptDownloadButton}
      >
        <Text selectable style={styles.receiptDownloadText}>
          تحميل الإيصال
        </Text>
      </Pressable>
    </View>
  );
}

function CustomerFeedbackCard({
  captainLabel,
  completionNote,
  feedbackTags,
  onChangeNote,
  onSelectRating,
  onSend,
  onToggleTag,
  rating,
  selectedTags
}: {
  captainLabel: string;
  completionNote: string;
  feedbackTags: readonly string[];
  onChangeNote: (note: string) => void;
  onSelectRating: (rating: number) => void;
  onSend: () => void;
  onToggleTag: (tag: string) => void;
  rating: number | null;
  selectedTags: string[];
}) {
  const selectedTagSummary = selectedTags.join("، ");

  return (
    <View style={styles.customerFeedbackCard}>
      <View style={styles.customerFeedbackHeader}>
        <View style={styles.customerFeedbackIcon}>
          <Sparkles color={colors.cyan} size={18} />
        </View>
        <View style={styles.customerFeedbackCopy}>
          <Text selectable style={styles.customerFeedbackTitle}>
            تقييم التجربة
          </Text>
          <Text selectable style={styles.customerFeedbackMeta}>
            كيف كانت الرحلة؟
          </Text>
          <Text selectable style={styles.customerFeedbackCaptain}>
            {captainLabel}
          </Text>
        </View>
      </View>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            accessibilityRole="button"
            accessibilityLabel={`تقييم ${star} نجوم`}
            hitSlop={8}
            onPress={() => onSelectRating(star)}
            style={styles.starButton}
          >
            <Star
              color={rating && rating >= star ? colors.cyan : colors.textMuted}
              fill={rating && rating >= star ? colors.cyan : "transparent"}
              size={30}
            />
          </Pressable>
        ))}
      </View>

      {rating ? <Text selectable style={styles.feedbackText}>{`تقييمك: ${rating} نجوم`}</Text> : null}

      <View style={styles.feedbackTagsBlock}>
        <Text selectable style={styles.feedbackTagsTitle}>
          اختر ما أعجبك
        </Text>
        <View style={styles.feedbackTagsRow}>
          {feedbackTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);

            return (
              <Pressable
                key={tag}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`اختيار ملاحظة ${tag}`}
                onPress={() => onToggleTag(tag)}
                style={({ pressed }) => [
                  styles.feedbackTag,
                  isSelected ? styles.feedbackTagActive : null,
                  pressed ? styles.pressed : null
                ]}
              >
                <Text selectable style={[styles.feedbackTagText, isSelected ? styles.feedbackTagTextActive : null]}>
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedTagSummary ? (
        <Text selectable style={styles.feedbackText}>{`ملاحظات مختارة: ${selectedTagSummary}`}</Text>
      ) : null}

      <View style={styles.detailField}>
        <Text selectable style={styles.detailLabel}>
          ملاحظة الرحلة
        </Text>
        <TextInput
          accessibilityLabel="ملاحظة الرحلة"
          multiline
          onChangeText={onChangeNote}
          placeholder="اكتب ملاحظة اختيارية"
          placeholderTextColor={colors.textMuted}
          style={[styles.detailInput, styles.completionNoteInput]}
          value={completionNote}
        />
      </View>

      {completionNote.trim() ? (
        <Text selectable style={styles.feedbackText}>{`ملاحظتك: ${completionNote.trim()}`}</Text>
      ) : null}

      <PremiumButton
        accessibilityLabel="إرسال تقييم الرحلة"
        label="إرسال التقييم"
        onPress={onSend}
        style={styles.feedbackSubmitButton}
      />
    </View>
  );
}

function CustomerSafetyPanel({
  onSafetyAlert,
  onShareTrip
}: {
  onSafetyAlert: () => void;
  onShareTrip: () => void;
}) {
  return (
    <View style={styles.safetyPanel}>
      <View style={styles.safetyHeader}>
        <View style={styles.safetyIcon}>
          <ShieldCheck color={colors.success} size={16} />
        </View>
        <View style={styles.safetyCopy}>
          <Text selectable style={styles.safetyTitle}>
            مركز الأمان
          </Text>
          <Text selectable style={styles.safetyMeta}>
            مشاركة الرحلة أو إرسال تنبيه بدون مغادرة الشاشة
          </Text>
        </View>
      </View>
      <View style={styles.safetyActions}>
        <Pressable
          accessibilityLabel="مشاركة الرحلة مع جهة موثوقة"
          accessibilityRole="button"
          onPress={onShareTrip}
          style={styles.safetyButton}
        >
          <MessageCircle color={colors.cyan} size={16} />
          <Text selectable style={styles.safetyButtonText}>
            مشاركة الرحلة
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="إرسال تنبيه أمان للرحلة"
          accessibilityRole="button"
          onPress={onSafetyAlert}
          style={[styles.safetyButton, styles.safetyButtonAlert]}
        >
          <ShieldCheck color={colors.warning} size={16} />
          <Text selectable style={styles.safetyButtonText}>
            تنبيه أمان
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function CustomerActiveRidePanel({
  destinationDetail,
  paymentMethod,
  route
}: {
  destinationDetail: string;
  paymentMethod: string;
  route: string;
}) {
  return (
    <View testID="customer-active-ride-panel" style={styles.activeRidePanel}>
      <View style={styles.activeRideHeader}>
        <View style={styles.activeRideIcon}>
          <Car color={colors.cyan} size={18} />
        </View>
        <View style={styles.activeRideCopy}>
          <Text selectable style={styles.activeRideTitle}>
            متابعة الرحلة النشطة
          </Text>
          <Text selectable style={styles.activeRideMeta}>
            الكابتن يتجه إلى الوجهة
          </Text>
        </View>
      </View>

      <View style={styles.activeRideRouteBox}>
        <Text selectable style={styles.activeRideRouteLabel}>
          المسار الحالي
        </Text>
        <Text selectable style={styles.activeRideRouteValue}>
          {route}
        </Text>
        <Text selectable style={styles.activeRideRouteDetail}>
          {destinationDetail}
        </Text>
      </View>

      <View style={styles.activeRideGrid}>
        <View style={styles.activeRideGridItem}>
          <Text selectable style={styles.activeRideGridValue}>
            {paymentMethod}
          </Text>
          <Text selectable style={styles.activeRideGridLabel}>
            طريقة الدفع أثناء الرحلة
          </Text>
        </View>
        <View style={styles.activeRideGridItem}>
          <Text selectable style={styles.activeRideGridValue}>
            5 د
          </Text>
          <Text selectable style={styles.activeRideGridLabel}>
            المتبقي للوصول
          </Text>
        </View>
      </View>

      <View style={styles.activeRideNextStep}>
        <Text selectable style={styles.activeRideNextText}>
          سنخبرك عند الاقتراب من الوجهة
        </Text>
      </View>
    </View>
  );
}

function CustomerCaptainArrivalPanel({
  arrivalEta,
  captainLocation,
  pickupLabel
}: {
  arrivalEta: string;
  captainLocation: string;
  pickupLabel: string;
}) {
  return (
    <View testID="captain-arrival-panel" style={styles.captainArrivalPanel}>
      <View style={styles.captainArrivalHeader}>
        <View style={styles.captainArrivalIcon}>
          <MapPin color={colors.cyan} size={18} />
        </View>
        <View style={styles.captainArrivalCopy}>
          <Text selectable style={styles.captainArrivalTitle}>
            لوحة وصول الكابتن
          </Text>
          <Text selectable style={styles.captainArrivalMeta}>
            يتجه الآن إلى نقطة الانطلاق
          </Text>
        </View>
      </View>

      <View style={styles.captainArrivalTrack}>
        <View style={styles.arrivalTrackStep}>
          <Text selectable style={styles.arrivalTrackValue}>
            {captainLocation}
          </Text>
          <Text selectable style={styles.arrivalTrackLabel}>
            موقع الكابتن الآن
          </Text>
        </View>
        <View style={styles.arrivalTrackLine} />
        <View style={styles.arrivalTrackStep}>
          <Text selectable style={styles.arrivalTrackValue}>
            {pickupLabel}
          </Text>
          <Text selectable style={styles.arrivalTrackLabel}>
            نقطة الاستلام
          </Text>
        </View>
      </View>

      <View style={styles.captainArrivalMetrics}>
        <View style={styles.captainArrivalMetric}>
          <Text selectable style={styles.captainArrivalMetricValue}>
            {arrivalEta}
          </Text>
          <Text selectable style={styles.captainArrivalMetricLabel}>
            وقت الوصول
          </Text>
        </View>
        <View style={styles.captainArrivalMetric}>
          <Text selectable style={styles.captainArrivalMetricValue}>
            2.1 كم
          </Text>
          <Text selectable style={styles.captainArrivalMetricLabel}>
            المسافة حتى وصول الكابتن
          </Text>
        </View>
      </View>

      <View style={styles.captainArrivalNext}>
        <Text selectable style={styles.captainArrivalNextLabel}>
          التحديث القادم
        </Text>
        <Text selectable style={styles.captainArrivalNextValue}>
          سنخبرك فور اقترابه من نقطة الانطلاق
        </Text>
      </View>
    </View>
  );
}

function CustomerPickupHandoffPanel({ captainName, vehicleLabel }: { captainName: string; vehicleLabel: string }) {
  return (
    <View testID="customer-pickup-handoff-panel" style={styles.pickupHandoffPanel}>
      <View style={styles.pickupHandoffHeader}>
        <View style={styles.pickupHandoffIcon}>
          <ShieldCheck color={colors.success} size={18} />
        </View>
        <View style={styles.pickupHandoffCopy}>
          <Text selectable style={styles.pickupHandoffTitle}>
            إجراءات الاستلام
          </Text>
          <Text selectable style={styles.pickupHandoffMeta}>
            الكابتن وصل لنقطة الانطلاق
          </Text>
        </View>
      </View>

      <View style={styles.pickupHandoffCodeCard}>
        <Text selectable style={styles.pickupHandoffCodeLabel}>
          رمز التحقق mock
        </Text>
        <Text selectable style={styles.pickupHandoffCodeValue}>
          4821
        </Text>
      </View>

      <View style={styles.pickupHandoffChecklist}>
        <Text selectable style={styles.pickupHandoffChecklistText}>
          تأكد من المركبة واللوحة قبل الانطلاق
        </Text>
        <Text selectable style={styles.pickupHandoffChecklistMeta}>
          {`${captainName} • ${vehicleLabel}`}
        </Text>
      </View>

      <View style={styles.pickupHandoffReadyPill}>
        <CheckCircle color={colors.success} size={16} />
        <Text selectable style={styles.pickupHandoffReadyText}>
          جاهز لبدء الرحلة
        </Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text selectable style={styles.infoValue}>
        {value}
      </Text>
      <Text selectable style={styles.infoLabel}>
        {label}
      </Text>
    </View>
  );
}

function CustomerLocationCard({
  isMockLocationEnabled,
  onEnableLocation,
  onSelectPickup,
  selectedPickup
}: {
  isMockLocationEnabled: boolean;
  onEnableLocation: () => void;
  onSelectPickup: (pickup: PickupPoint) => void;
  selectedPickup: PickupPoint;
}) {
  return (
    <GlassCard style={styles.locationCard} variant="strong">
      <View style={styles.locationHeader}>
        <Pressable
          accessibilityLabel="تفعيل موقع mock"
          accessibilityRole="button"
          onPress={onEnableLocation}
          style={({ pressed }) => [
            styles.locationToggle,
            isMockLocationEnabled ? styles.locationToggleActive : null,
            pressed ? styles.pressed : null
          ]}
        >
          <MapPin color={isMockLocationEnabled ? colors.cyan : colors.textSoft} size={16} />
          <Text selectable style={styles.locationToggleText}>
            {isMockLocationEnabled ? "GPS mock مفعّل" : "GPS mock غير مفعّل"}
          </Text>
        </Pressable>

        <View style={styles.locationCopy}>
          <Text selectable style={styles.locationEyebrow}>
            موقع الانطلاق
          </Text>
          <Text selectable style={styles.locationTitle}>
            {`نقطة الانطلاق: ${selectedPickup.label}`}
          </Text>
          <Text selectable style={styles.locationDetail}>
            {selectedPickup.detail}
          </Text>
        </View>
      </View>

      <View style={styles.pickupOptions}>
        {customerHomeMock.pickupOptions.map((pickup) => {
          const isSelected = selectedPickup.id === pickup.id;

          return (
            <Pressable
              key={pickup.id}
              accessibilityLabel={`اختيار نقطة انطلاق ${pickup.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectPickup(pickup)}
              style={({ pressed }) => [
                styles.pickupOption,
                isSelected ? styles.pickupOptionActive : null,
                pressed ? styles.pressed : null
              ]}
            >
              <Text
                selectable
                style={[
                  styles.pickupOptionLabel,
                  isSelected ? styles.pickupOptionLabelActive : null
                ]}
              >
                {pickup.label}
              </Text>
              <Text selectable style={styles.pickupOptionEta}>
                {pickup.eta}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassCard>
  );
}

function CustomerNotificationCenter({ onClose }: { onClose: () => void }) {
  return (
    <GlassCard style={styles.notificationCenterCard} variant="strong">
      <View style={styles.notificationHeader}>
        <Pressable
          accessibilityLabel="إغلاق التنبيهات"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [
            styles.notificationCloseButton,
            pressed ? styles.pressed : null
          ]}
        >
          <XCircle color={colors.textMuted} size={18} />
        </Pressable>
        <View style={styles.notificationHeaderCopy}>
          <Text selectable style={styles.notificationTitle}>
            مركز التنبيهات
          </Text>
          <Text selectable style={styles.notificationMeta}>
            تحديثات رحلتك المهمة في مكان واحد
          </Text>
        </View>
      </View>

      <View style={styles.notificationList}>
        {customerHomeMock.notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationRow}>
            <View
              style={[
                styles.notificationDot,
                notification.tone === "live" ? styles.notificationDotLive : null,
                notification.tone === "success" ? styles.notificationDotSuccess : null
              ]}
            />
            <View style={styles.notificationCopy}>
              <Text selectable style={styles.notificationRowTitle}>
                {notification.title}
              </Text>
              <Text selectable style={styles.notificationRowDetail}>
                {notification.detail}
              </Text>
            </View>
            <Text selectable style={styles.notificationTime}>
              {notification.time}
            </Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

function CustomerDestinationDiscoveryPanel({
  nearestPlace,
  onRefreshSuggestions,
  savedPlacesCount,
  searchScope
}: {
  nearestPlace: DestinationPlace;
  onRefreshSuggestions: () => void;
  savedPlacesCount: number;
  searchScope: string;
}) {
  return (
    <View style={styles.destinationDiscoveryPanel}>
      <View style={styles.destinationDiscoveryHeader}>
        <View style={styles.destinationDiscoveryIcon}>
          <Sparkles color={colors.cyan} size={20} />
        </View>
        <View style={styles.destinationDiscoveryCopy}>
          <Text selectable style={styles.destinationDiscoveryTitle}>
            مركز اكتشاف الوجهات
          </Text>
          <Text selectable style={styles.destinationDiscoveryMeta}>
            اقتراحات ذكية
          </Text>
        </View>
      </View>

      <View style={styles.destinationDiscoveryGrid}>
        <View style={styles.destinationDiscoveryMetric}>
          <MapPin color={colors.success} size={16} />
          <Text selectable style={styles.destinationDiscoveryValue}>
            {`أقرب وجهة: ${nearestPlace.label}`}
          </Text>
        </View>
        <View style={styles.destinationDiscoveryMetric}>
          <Search color={colors.cyan} size={16} />
          <Text selectable style={styles.destinationDiscoveryValue}>
            {`نطاق البحث: ${searchScope}`}
          </Text>
        </View>
      </View>

      <View style={styles.destinationDiscoveryFooter}>
        <Text selectable style={styles.destinationDiscoveryText}>
          {`وجهات محفوظة: ${savedPlacesCount}`}
        </Text>
        <Pressable
          accessibilityLabel="تحديث اقتراحات البحث"
          accessibilityRole="button"
          onPress={onRefreshSuggestions}
          style={({ pressed }) => [styles.destinationDiscoveryButton, pressed ? styles.pressed : null]}
        >
          <Text selectable style={styles.destinationDiscoveryButtonText}>
            تحديث الاقتراحات
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function CustomerSearchTab({
  activeFilter,
  destinationDetail,
  onChangeDestinationDetail,
  onChangeFilter,
  onChangeQuery,
  onRefreshSuggestions,
  onSelectDestination,
  onUseDestination,
  pickupLabel,
  query,
  searchCopy,
  selectedDestination
}: {
  activeFilter: CustomerSearchFilter;
  destinationDetail?: string;
  onChangeDestinationDetail: (detail: string) => void;
  onChangeFilter: (filter: CustomerSearchFilter) => void;
  onChangeQuery: (query: string) => void;
  onRefreshSuggestions: () => void;
  onSelectDestination: (place: DestinationPlace) => void;
  onUseDestination: () => void;
  pickupLabel: string;
  query: string;
  searchCopy: CustomerSearchCopy;
  selectedDestination: DestinationPlace | null;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const results = customerHomeMock.savedPlaces.filter((place) => {
    const matchesQuery =
      !normalizedQuery ||
      place.label.toLowerCase().includes(normalizedQuery) ||
      place.area.toLowerCase().includes(normalizedQuery) ||
      place.detail.toLowerCase().includes(normalizedQuery);
    const matchesFilter =
      activeFilter === "الكل" ||
      (activeFilter === "مطاعم" && place.label.includes("مطعم")) ||
      (activeFilter === "جامعات" && place.label.includes("جامعة")) ||
      (activeFilter === "الأقرب" && (place.distance === "0.0 كم" || place.distance.startsWith("2.")));

    return matchesQuery && matchesFilter;
  });

  return (
    <View style={styles.tabStack}>
      <GlassCard style={styles.searchTabCard} variant="strong">
        <View style={styles.tabHeader}>
          <View style={styles.tabIcon}>
            <Search color={colors.cyan} size={22} />
          </View>
          <View style={styles.tabCopy}>
            <Text selectable style={styles.tabTitle}>
              {searchCopy.title}
            </Text>
            <Text selectable style={styles.tabMeta}>
              {searchCopy.subtitle}
            </Text>
            <Text selectable style={styles.tabMeta}>
              {searchCopy.hint}
            </Text>
          </View>
        </View>

        <CustomerDestinationDiscoveryPanel
          nearestPlace={customerHomeMock.savedPlaces[0]}
          onRefreshSuggestions={onRefreshSuggestions}
          savedPlacesCount={customerHomeMock.savedPlaces.length}
          searchScope={searchCopy.scope}
        />

        <View style={styles.searchInputShell}>
          <Search color={colors.textMuted} size={18} />
          <TextInput
            accessibilityLabel={searchCopy.inputLabel}
            onChangeText={onChangeQuery}
            placeholder={searchCopy.inputPlaceholder}
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={query}
          />
        </View>

        <View style={styles.searchFilterRow}>
          {CUSTOMER_SEARCH_FILTERS.map((filter) => {
            const isSelected = activeFilter === filter;

            return (
              <Pressable
                key={filter}
                accessibilityLabel={`فلتر البحث ${filter}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => onChangeFilter(filter)}
                style={({ pressed }) => [
                  styles.searchFilterChip,
                  isSelected ? styles.searchFilterChipActive : null,
                  pressed ? styles.pressed : null
                ]}
              >
                <Text
                  selectable
                  style={[styles.searchFilterText, isSelected ? styles.searchFilterTextActive : null]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </GlassCard>

      <MockRouteMap
        destinationArea={selectedDestination?.area}
        destinationDetail={selectedDestination ? destinationDetail : undefined}
        phase="idle"
        pickupLabel={pickupLabel}
      />

      <View style={styles.sectionHeader}>
        <Text selectable style={styles.sectionTitle}>
          اقتراحات قريبة
        </Text>
        <Text selectable style={styles.searchResultCount}>
          {`نتائج البحث: ${results.length}`}
        </Text>
      </View>

      <View style={styles.searchResultsList}>
        {results.map((place) => {
          const Icon = place.icon;
          const isSelected = selectedDestination?.label === place.label;

          return (
            <Pressable
              key={place.label}
              accessibilityLabel={`اختيار نتيجة ${place.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectDestination(place)}
              style={({ pressed }) => [
                styles.searchResultRow,
                isSelected ? styles.searchResultRowActive : null,
                pressed ? styles.pressed : null
              ]}
            >
              <View style={styles.searchResultMetaPill}>
                <Text selectable style={styles.searchResultMetaText}>
                  {place.price}
                </Text>
              </View>
              <View style={styles.searchResultCopy}>
                <Text selectable style={styles.searchResultTitle}>
                  {place.label}
                </Text>
                <Text selectable style={styles.searchResultArea}>
                  {place.area}
                </Text>
                <Text selectable style={styles.searchResultDetail}>
                  {`${place.detail} • ${place.distance}`}
                </Text>
              </View>
              <View style={styles.searchResultIcon}>
                <Icon color={isSelected ? colors.text : colors.cyan} size={18} />
              </View>
            </Pressable>
          );
        })}
      </View>

      {selectedDestination ? (
        <GlassCard style={styles.searchSelectedCard} variant="strong">
          <View style={styles.searchSelectedHeader}>
            <View style={styles.searchSelectedIcon}>
              <MapPin color={colors.cyan} size={18} />
            </View>
            <View style={styles.searchSelectedCopy}>
              <Text selectable style={styles.searchSelectedTitle}>
                {searchCopy.selectedTitle}
              </Text>
              <Text selectable style={styles.searchSelectedName}>
                {selectedDestination.label}
              </Text>
              <Text selectable style={styles.searchSelectedMeta}>
                {`${selectedDestination.area} • ${selectedDestination.distance}`}
              </Text>
            </View>
          </View>
          <View style={styles.searchDetailField}>
            <Text selectable style={styles.detailLabel}>
              {searchCopy.detailLabel}
            </Text>
            <Text selectable style={styles.searchDetailHint}>
              {searchCopy.detailHint}
            </Text>
            <TextInput
              accessibilityLabel={searchCopy.detailLabel}
              multiline
              onChangeText={onChangeDestinationDetail}
              placeholder={searchCopy.detailPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={[styles.detailInput, styles.searchDetailInput]}
              value={destinationDetail ?? ""}
            />
            {destinationDetail?.trim() ? (
              <Text selectable style={styles.searchDetailPreview}>
                {`${searchCopy.detailPreviewPrefix}: ${destinationDetail.trim()}`}
              </Text>
            ) : null}
          </View>
          <PremiumButton
            accessibilityLabel={searchCopy.selectedActionAccessibilityLabel}
            label={searchCopy.selectedActionLabel}
            onPress={onUseDestination}
            style={styles.searchUseButton}
          >
            <MapPin color={colors.text} size={16} />
          </PremiumButton>
        </GlassCard>
      ) : null}

      {!results.length ? (
        <GlassCard style={styles.searchEmptyCard}>
          <Text selectable style={styles.feedbackText}>
            لا توجد نتائج مطابقة الآن
          </Text>
        </GlassCard>
      ) : null}
    </View>
  );
}

function CustomerTripsTab({ liveTrip }: { liveTrip: CustomerTripsLiveRide | null }) {
  const trips = customerHomeMock.trips;
  const currentTrip = liveTrip ?? trips.current;
  const activeStatus = liveTrip?.activeStatus ?? trips.activeStatus;

  return (
    <View style={styles.tabStack}>
      <GlassCard style={styles.tripOverviewCard} variant="strong">
        <View style={styles.tabHeader}>
          <View style={styles.tabIcon}>
            <Car color={colors.cyan} size={22} />
          </View>
          <View style={styles.tabCopy}>
            <Text selectable style={styles.tabTitle}>
              {trips.activeTitle}
            </Text>
            <Text selectable style={styles.tabMeta}>
              {activeStatus}
            </Text>
          </View>
        </View>

        <View style={styles.tripTimelineBox}>
          <InfoRow label="المسار" value={currentTrip.route} />
          {liveTrip ? <InfoRow label="تفصيل الوجهة" value={liveTrip.destinationDetail} /> : null}
          {liveTrip ? <InfoRow label="الخدمة" value={liveTrip.serviceLabel} /> : null}
          <InfoRow label="الكابتن" value={currentTrip.captain} />
          <InfoRow label="السعر" value={currentTrip.price} />
          <InfoRow label="الدفع" value={currentTrip.payment} />
          <InfoRow label="الوقت" value={currentTrip.time} />
        </View>
      </GlassCard>

      {liveTrip ? <CustomerJourneyTimeline liveTrip={liveTrip} /> : null}

      <View style={styles.sectionHeader}>
        <Text selectable style={styles.sectionTitle}>
          {trips.historyTitle}
        </Text>
      </View>

      <View style={styles.historyList}>
        {liveTrip?.isCompleted ? <CompletedTripHistoryCard liveTrip={liveTrip} /> : null}
        {trips.history.map((trip) => (
          <View key={trip.id} style={styles.historyRow}>
            <View style={styles.historyStatus}>
              <CheckCircle color={colors.success} size={16} />
              <Text selectable style={styles.historyStatusText}>
                {trip.status}
              </Text>
            </View>
            <View style={styles.historyCopy}>
              <Text selectable style={styles.historyTitle}>
                {trip.destination}
              </Text>
              <Text selectable style={styles.historyMeta}>
                {`${trip.date} • ${trip.price}`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function CustomerJourneyTimeline({ liveTrip }: { liveTrip: CustomerTripsLiveRide }) {
  const journeySteps = getCustomerJourneySteps(liveTrip);
  const statusText = liveTrip.isCompleted ? "كل الخطوات مكتملة" : `المرحلة الحالية: ${liveTrip.activeStatus}`;

  return (
    <GlassCard testID="customer-trip-journey-timeline" style={styles.customerJourneyTimelineCard} variant="strong">
      <View style={styles.customerJourneyHeader}>
        <View style={styles.customerJourneyIcon}>
          {liveTrip.isCompleted ? (
            <CheckCircle color={colors.success} size={20} />
          ) : (
            <Clock color={colors.cyan} size={20} />
          )}
        </View>
        <View style={styles.customerJourneyCopy}>
          <Text selectable style={styles.customerJourneyTitle}>
            خط سير الرحلة
          </Text>
          <Text selectable style={styles.customerJourneyMeta}>
            {statusText}
          </Text>
        </View>
      </View>

      <View style={styles.customerJourneySteps}>
        {journeySteps.map((step) => {
          const isDone = step.state === "done";

          return (
            <View
              key={step.label}
              style={[styles.customerJourneyStep, isDone ? styles.customerJourneyStepDone : null]}
            >
              <View style={[styles.customerJourneyStepIcon, isDone ? styles.customerJourneyStepIconDone : null]}>
                {isDone ? (
                  <CheckCircle color={colors.success} size={15} />
                ) : (
                  <Clock color={colors.textMuted} size={15} />
                )}
              </View>
              <View style={styles.customerJourneyStepCopy}>
                <Text
                  selectable
                  style={[styles.customerJourneyStepText, isDone ? styles.customerJourneyStepTextDone : null]}
                >
                  {step.label}
                </Text>
                <Text selectable style={styles.customerJourneyStepDetail}>
                  {step.detail}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

function CompletedTripHistoryCard({ liveTrip }: { liveTrip: CustomerTripsLiveRide }) {
  return (
    <GlassCard style={styles.completedTripHistoryCard} variant="strong">
      <View style={styles.completedTripHistoryHeader}>
        <View style={styles.completedTripHistoryBadge}>
          <CheckCircle color={colors.success} size={16} />
          <Text selectable style={styles.completedTripHistoryBadgeText}>
            مكتملة
          </Text>
        </View>
        <View style={styles.completedTripHistoryCopy}>
          <Text selectable style={styles.completedTripHistoryTitle}>
            ملخص الرحلة المكتملة
          </Text>
          <Text selectable style={styles.completedTripHistoryMeta}>
            {`الآن • ${liveTrip.price}`}
          </Text>
        </View>
      </View>

      <View style={styles.completedTripHistoryDestination}>
        <Text selectable style={styles.historyTitle}>
          {liveTrip.destinationDetail}
        </Text>
        <Text selectable style={styles.historyMeta}>
          {liveTrip.route}
        </Text>
      </View>

      <View style={styles.completedTripHistoryGrid}>
        <View style={styles.completedTripHistoryTile}>
          <CreditCard color={colors.cyan} size={16} />
          <Text selectable style={styles.completedTripHistoryTileValue}>
            {`إيصال ${liveTrip.receiptNumber}`}
          </Text>
          <Text selectable style={styles.completedTripHistoryTileLabel}>
            {`حالة الدفع: ${liveTrip.paymentStatus}`}
          </Text>
        </View>
        <View style={styles.completedTripHistoryTile}>
          <Star color={colors.warning} fill={colors.warning} size={16} />
          <Text selectable style={styles.completedTripHistoryTileValue}>
            {liveTrip.feedbackRating ? `تقييم الرحلة: ${liveTrip.feedbackRating} نجوم` : "بانتظار التقييم"}
          </Text>
          <Text selectable style={styles.completedTripHistoryTileLabel}>
            {`طريقة الدفع: ${liveTrip.payment}`}
          </Text>
        </View>
      </View>

      {liveTrip.feedbackNote ? (
        <Text selectable style={styles.completedTripHistoryNote}>
          {`ملاحظاتك: ${liveTrip.feedbackNote}`}
        </Text>
      ) : null}
    </GlassCard>
  );
}

function CustomerProfileTrustCenter({
  onReviewProfile,
  savedPlacesCount
}: {
  onReviewProfile: () => void;
  savedPlacesCount: number;
}) {
  return (
    <View style={styles.customerTrustPanel}>
      <View style={styles.customerTrustHeader}>
        <View style={styles.customerTrustIcon}>
          <ShieldCheck color={colors.success} size={20} />
        </View>
        <View style={styles.customerTrustCopy}>
          <Text selectable style={styles.customerTrustTitle}>
            مركز ثقة العميل
          </Text>
          <Text selectable style={styles.customerTrustMeta}>
            جاهزية الحساب
          </Text>
        </View>
      </View>

      <View style={styles.customerTrustGrid}>
        <View style={styles.customerTrustMetric}>
          <CheckCircle color={colors.success} size={16} />
          <Text selectable style={styles.customerTrustValue}>
            رحلات آمنة
          </Text>
          <Text selectable style={styles.customerTrustLabel}>
            مشاركة الرحلة مفعّلة
          </Text>
        </View>
        <View style={styles.customerTrustMetric}>
          <CreditCard color={colors.cyan} size={16} />
          <Text selectable style={styles.customerTrustValue}>
            الدفع محمي
          </Text>
          <Text selectable style={styles.customerTrustLabel}>
            طرق الدفع جاهزة
          </Text>
        </View>
      </View>

      <View style={styles.customerTrustList}>
        <Text selectable style={styles.customerTrustText}>
          الملف مكتمل: 92%
        </Text>
        <Text selectable style={styles.customerTrustText}>
          {`الوجهات المحفوظة: ${savedPlacesCount}`}
        </Text>
      </View>

      <Pressable
        accessibilityLabel="مراجعة بيانات الحساب"
        accessibilityRole="button"
        onPress={onReviewProfile}
        style={({ pressed }) => [styles.customerTrustButton, pressed ? styles.pressed : null]}
      >
        <Text selectable style={styles.customerTrustButtonText}>
          مراجعة بيانات الحساب
        </Text>
      </Pressable>
    </View>
  );
}

function CustomerProfileTab({
  onAddPayment,
  onManageSecurity,
  onReviewProfile
}: {
  onAddPayment: () => void;
  onManageSecurity: () => void;
  onReviewProfile: () => void;
}) {
  const profile = customerHomeMock.profile;

  return (
    <View style={styles.profileStack}>
      <GlassCard style={styles.profileCard} variant="strong">
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <User color={colors.text} size={24} />
          </View>
          <View style={styles.profileCopy}>
            <Text selectable style={styles.profileTitle}>
              {profile.title}
            </Text>
            <Text selectable style={styles.profileName}>
              {profile.name}
            </Text>
            <Text selectable style={styles.profileMeta}>
              {profile.city}
            </Text>
          </View>
        </View>

        <CustomerProfileTrustCenter
          onReviewProfile={onReviewProfile}
          savedPlacesCount={customerHomeMock.savedPlaces.length}
        />

        <View style={styles.profileRows}>
          <ProfileRow icon={<Phone color={colors.cyan} size={16} />} label="رقم الجوال" value={profile.phone} />
          <ProfileRow icon={<MapPin color={colors.success} size={16} />} label="المنطقة" value={profile.homeArea} />
          <ProfileRow icon={<CreditCard color={colors.violetSoft} size={16} />} label="طريقة الدفع" value={profile.defaultPayment} />
          <ProfileRow icon={<Star color={colors.warning} fill={colors.warning} size={16} />} label="تقييمك" value={profile.rating} />
        </View>
      </GlassCard>

      <GlassCard style={styles.profileWalletCard} variant="strong">
        <View style={styles.profileSectionHeader}>
          <View style={styles.profileSectionIcon}>
            <CreditCard color={colors.cyan} size={18} />
          </View>
          <View style={styles.profileSectionCopy}>
            <Text selectable style={styles.profileSectionTitle}>
              محفظة واصل
            </Text>
            <Text selectable style={styles.profileSectionMeta}>
              رصيد ومكافآت mock لنسخة التصميم
            </Text>
          </View>
        </View>

        <View style={styles.profileWalletGrid}>
          <View style={styles.profileWalletTilePrimary}>
            <Text selectable style={styles.profileWalletValue}>
              {CUSTOMER_PROFILE_WALLET.balance}
            </Text>
            <Text selectable style={styles.profileWalletLabel}>
              {CUSTOMER_PROFILE_WALLET.label}
            </Text>
          </View>
          <View style={styles.profileWalletTile}>
            <Text selectable style={styles.profileWalletValueSmall}>
              {CUSTOMER_PROFILE_WALLET.points}
            </Text>
            <Text selectable style={styles.profileWalletLabel}>
              نقاط واصل
            </Text>
          </View>
          <View style={styles.profileWalletTile}>
            <Text selectable style={styles.profileWalletValueSmall}>
              {CUSTOMER_PROFILE_WALLET.monthlySpend}
            </Text>
            <Text selectable style={styles.profileWalletLabel}>
              هذا الشهر
            </Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard style={styles.profilePaymentCard}>
        <View style={styles.profileSectionHeader}>
          <View style={styles.profileSectionIcon}>
            <CreditCard color={colors.violetSoft} size={18} />
          </View>
          <View style={styles.profileSectionCopy}>
            <Text selectable style={styles.profileSectionTitle}>
              طرق الدفع
            </Text>
            <Text selectable style={styles.profileSectionMeta}>
              خيارات دفع mock جاهزة للتجربة
            </Text>
          </View>
        </View>

        <View style={styles.profilePaymentList}>
          {CUSTOMER_PROFILE_PAYMENT_METHODS.map((method) => (
            <View key={method.label} style={styles.profilePaymentRow}>
              <View style={styles.profilePaymentStatus}>
                <Text selectable style={styles.profilePaymentStatusText}>
                  {method.status}
                </Text>
              </View>
              <View style={styles.profilePaymentCopy}>
                <Text selectable style={styles.profilePaymentTitle}>
                  {method.label}
                </Text>
                <Text selectable style={styles.profilePaymentMeta}>
                  {method.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityLabel="إضافة طريقة دفع mock"
          accessibilityRole="button"
          onPress={onAddPayment}
          style={({ pressed }) => [styles.profileActionButton, pressed ? styles.pressed : null]}
        >
          <Sparkles color={colors.cyan} size={16} />
          <Text selectable style={styles.profileActionText}>
            إضافة طريقة دفع
          </Text>
        </Pressable>
      </GlassCard>

      <GlassCard style={styles.profileSecurityCard}>
        <View style={styles.profileSectionHeader}>
          <View style={styles.profileSectionIcon}>
            <ShieldCheck color={colors.success} size={18} />
          </View>
          <View style={styles.profileSectionCopy}>
            <Text selectable style={styles.profileSectionTitle}>
              مركز الأمان
            </Text>
            <Text selectable style={styles.profileSectionMeta}>
              إعدادات حماية الرحلات والحساب
            </Text>
          </View>
        </View>

        <View style={styles.profileSecurityList}>
          {CUSTOMER_PROFILE_SECURITY_ITEMS.map((item) => (
            <View key={item} style={styles.profileSecurityRow}>
              <CheckCircle color={colors.success} size={16} />
              <Text selectable style={styles.profileSecurityText}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityLabel="إدارة أمان الحساب mock"
          accessibilityRole="button"
          onPress={onManageSecurity}
          style={({ pressed }) => [
            styles.profileActionButton,
            styles.profileSecurityButton,
            pressed ? styles.pressed : null
          ]}
        >
          <ShieldCheck color={colors.success} size={16} />
          <Text selectable style={styles.profileActionText}>
            إدارة الأمان
          </Text>
        </Pressable>
      </GlassCard>
    </View>
  );
}

function ProfileRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <View style={styles.profileRow}>
      {icon}
      <View style={styles.profileRowCopy}>
        <Text selectable style={styles.profileRowLabel}>
          {label}
        </Text>
        <Text selectable style={styles.profileRowValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const rtlText = {
  textAlign: "right" as const,
  writingDirection: "rtl" as const
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    flex: 1
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  brandLockup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  brandCopy: {
    alignItems: "flex-end",
    gap: 2
  },
  brandName: {
    ...rtlText,
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 0
  },
  brandMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "700",
    letterSpacing: 0
  },
  logoMark: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)"
  },
  logoLetter: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }]
  },
  heroCopy: {
    alignItems: "flex-end",
    gap: spacing.xs,
    paddingTop: spacing.xs
  },
  greeting: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.body,
    fontWeight: "600",
    letterSpacing: 0
  },
  primaryBookingCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.34)"
  },
  primaryBookingHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  primaryBookingIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  primaryBookingCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  primaryBookingTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  primaryBookingMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800",
    lineHeight: 20
  },
  primaryBookingMetrics: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  primaryBookingMetric: {
    flex: 1,
    minHeight: 58,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  primaryBookingMetricValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  primaryBookingMetricLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  primaryBookingButton: {
    minHeight: 50,
    borderRadius: radii.sm
  },
  motionSurface: {
    width: "100%"
  },
  bookingFlowStrip: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.26)",
    backgroundColor: "rgba(7, 14, 28, 0.46)"
  },
  bookingFlowHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  bookingFlowHeaderIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.26)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  bookingFlowCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  bookingFlowTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  bookingFlowMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  bookingFlowSteps: {
    flexDirection: "row-reverse",
    gap: spacing.xs
  },
  bookingFlowStep: {
    flex: 1,
    minHeight: 74,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  bookingFlowStepReady: {
    borderColor: "rgba(0, 229, 255, 0.3)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  bookingFlowIndex: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "rgba(147, 177, 255, 0.12)"
  },
  bookingFlowIndexReady: {
    backgroundColor: "rgba(0, 229, 255, 0.2)"
  },
  bookingFlowIndexText: {
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  bookingFlowStepCopy: {
    alignItems: "flex-end",
    gap: 3
  },
  bookingFlowStepLabel: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  bookingFlowStepValue: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 15
  },
  bookingFlowDestination: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  serviceTypePicker: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(147, 177, 255, 0.2)"
  },
  serviceTypeHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  serviceTypeHeaderIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  serviceTypeHeaderCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  serviceTypeTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  serviceTypeMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  serviceTypeList: {
    gap: spacing.sm
  },
  serviceTypeOption: {
    minHeight: 76,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.16)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  serviceTypeOptionActive: {
    borderColor: "rgba(0, 229, 255, 0.44)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  serviceTypeEmoji: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.07)"
  },
  serviceTypeEmojiText: {
    fontSize: 22
  },
  serviceTypeCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  serviceTypeOptionTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  serviceTypeOptionMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 17
  },
  serviceTypePricePill: {
    minWidth: 70,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(139, 92, 246, 0.16)"
  },
  serviceTypePriceText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  serviceNextStepCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(139, 92, 246, 0.3)"
  },
  serviceNextStepHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  serviceNextStepBadge: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(199, 183, 255, 0.28)",
    backgroundColor: "rgba(139, 92, 246, 0.16)"
  },
  serviceNextStepEmoji: {
    fontSize: 24
  },
  serviceNextStepCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  serviceNextStepTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  serviceNextStepMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800",
    lineHeight: 20
  },
  serviceNextStepSummary: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  serviceNextStepMetric: {
    flex: 1,
    minHeight: 56,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  serviceNextStepValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  serviceNextStepLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  serviceNextStepButton: {
    minHeight: 48,
    borderRadius: radii.sm
  },
  searchCard: {
    minHeight: 72,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg
  },
  searchIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  searchCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  searchLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "700"
  },
  searchValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  quickStats: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  statCard: {
    flex: 1,
    minHeight: 112,
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: spacing.md
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
    letterSpacing: 0
  },
  statLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  sectionHeader: {
    alignItems: "flex-end",
    paddingTop: spacing.xs
  },
  sectionTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  savedPlaces: {
    gap: spacing.sm
  },
  placeCard: {
    minHeight: 74,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md
  },
  placeIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSoft
  },
  placeCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  placeLabel: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  placeDetail: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "600"
  },
  tripCard: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md
  },
  selectableCardActive: {
    borderColor: "rgba(0, 229, 255, 0.46)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  tripPricePill: {
    minWidth: 76,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  tripPrice: {
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  tripCopy: {
    alignItems: "flex-end",
    gap: 4
  },
  tripLabel: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  tripMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  primaryButton: {
    height: 56,
    borderRadius: radii.sm
  },
  destinationCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.26)"
  },
  destinationHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  destinationPin: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  destinationCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  destinationTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  destinationMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  detailField: {
    gap: spacing.xs
  },
  detailLabel: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  detailInput: {
    ...rtlText,
    minHeight: 52,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  deliveryPackagePanel: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.22)",
    backgroundColor: "rgba(0, 229, 255, 0.055)"
  },
  deliveryPackageHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  deliveryPackageIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.26)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  deliveryPackageCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  deliveryPackageTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  deliveryPackageMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 17
  },
  deliveryPackageTypeGroup: {
    gap: spacing.xs
  },
  deliveryPackageLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  deliveryPackageChips: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  deliveryPackageChip: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  deliveryPackageChipActive: {
    borderColor: "rgba(0, 229, 255, 0.36)",
    backgroundColor: "rgba(0, 229, 255, 0.13)"
  },
  deliveryPackageChipText: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  deliveryPackageChipTextActive: {
    color: colors.text
  },
  deliveryPackageInput: {
    ...rtlText,
    minHeight: 64,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "800",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    textAlignVertical: "top"
  },
  deliveryPackagePreview: {
    alignItems: "flex-end",
    padding: spacing.sm,
    gap: 4,
    borderRadius: radii.sm,
    backgroundColor: "rgba(139, 92, 246, 0.13)"
  },
  deliveryPackagePreviewLabel: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  deliveryPackagePreviewText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900",
    lineHeight: 18
  },
  completionNoteInput: {
    minHeight: 82,
    textAlignVertical: "top"
  },
  paymentGroup: {
    gap: spacing.xs
  },
  serviceGroup: {
    gap: spacing.xs
  },
  serviceCard: {
    minHeight: 72,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.46)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  serviceCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  serviceTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs
  },
  serviceLabel: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  serviceMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  servicePriceBox: {
    minWidth: 78,
    alignItems: "flex-end",
    gap: 3
  },
  servicePrice: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  serviceEta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  serviceBadge: {
    minHeight: 24,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.16)"
  },
  serviceBadgeText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: "900"
  },
  paymentOptions: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  paymentOption: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  paymentOptionActive: {
    borderColor: "rgba(0, 229, 255, 0.46)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  paymentOptionText: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  paymentOptionTextActive: {
    color: colors.text
  },
  visaPaymentPanel: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.2)",
    backgroundColor: "rgba(0, 229, 255, 0.06)"
  },
  visaPaymentHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  visaPaymentIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.26)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  visaPaymentCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  visaPaymentTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  visaPaymentMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 17
  },
  paymentInput: {
    ...rtlText,
    minHeight: 46,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "800",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  paymentInputRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  paymentInputHalf: {
    flex: 1
  },
  visaReadinessBox: {
    gap: spacing.xs,
    alignItems: "flex-end",
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.16)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  visaReadinessBoxReady: {
    borderColor: "rgba(52, 211, 153, 0.32)",
    backgroundColor: "rgba(52, 211, 153, 0.08)"
  },
  visaReadinessBoxWarning: {
    borderColor: "rgba(251, 191, 36, 0.28)",
    backgroundColor: "rgba(251, 191, 36, 0.07)"
  },
  visaReadinessTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  visaReadinessIssue: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 17
  },
  saveVisaToggle: {
    minHeight: 44,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  saveVisaToggleActive: {
    borderColor: "rgba(52, 211, 153, 0.32)",
    backgroundColor: "rgba(52, 211, 153, 0.08)"
  },
  saveVisaCheck: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.42)"
  },
  saveVisaText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  visaSummaryBox: {
    gap: 3,
    alignItems: "flex-end",
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(139, 92, 246, 0.13)"
  },
  visaSummaryText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  visaSummaryMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  confirmationCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.3)"
  },
  confirmationRows: {
    gap: spacing.xs
  },
  orderReadinessPanel: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.22)",
    backgroundColor: "rgba(0, 229, 255, 0.055)"
  },
  orderReadinessHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  orderReadinessIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.28)",
    backgroundColor: "rgba(51, 231, 168, 0.1)"
  },
  orderReadinessCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  orderReadinessTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  orderReadinessMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 17
  },
  orderReadinessGrid: {
    gap: spacing.xs
  },
  orderReadinessItem: {
    minHeight: 58,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  orderReadinessItemIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.18)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  orderReadinessItemCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  orderReadinessItemLabel: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  orderReadinessItemValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  orderReadinessItemDetail: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 18
  },
  infoRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  infoLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  infoValue: {
    ...rtlText,
    flex: 1,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  bottomNav: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    minHeight: 68,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg
  },
  navItem: {
    width: 72,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: radii.md
  },
  navItemActive: {
    backgroundColor: "rgba(0, 229, 255, 0.14)"
  },
  navItemPressed: {
    opacity: 0.72
  },
  navLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "700"
  },
  navLabelActive: {
    color: colors.text
  },
  feedbackCard: {
    gap: spacing.xs,
    padding: spacing.md,
    alignItems: "flex-end"
  },
  feedbackText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  feedbackMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "700"
  },
  locationCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.2)"
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  locationToggle: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    borderWidth: 1,
    borderColor: colors.border
  },
  locationToggleActive: {
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    borderColor: "rgba(0, 229, 255, 0.34)"
  },
  locationToggleText: {
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  locationCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xxs
  },
  locationEyebrow: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  locationTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  locationDetail: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  pickupOptions: {
    flexDirection: "row-reverse",
    gap: spacing.xs
  },
  pickupOption: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: "rgba(255, 255, 255, 0.045)",
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.12)"
  },
  pickupOptionActive: {
    backgroundColor: "rgba(139, 92, 246, 0.16)",
    borderColor: "rgba(0, 229, 255, 0.38)"
  },
  pickupOptionLabel: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  pickupOptionLabelActive: {
    color: colors.text
  },
  pickupOptionEta: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  notificationCenterCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.22)"
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  notificationHeaderCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xxs
  },
  notificationTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  notificationMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "700"
  },
  notificationCloseButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: colors.border
  },
  notificationList: {
    gap: spacing.xs
  },
  notificationRow: {
    minHeight: 58,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: "rgba(255, 255, 255, 0.045)",
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.12)"
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.blue
  },
  notificationDotLive: {
    backgroundColor: colors.cyan
  },
  notificationDotSuccess: {
    backgroundColor: colors.success
  },
  notificationCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xxs
  },
  notificationRowTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  notificationRowDetail: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "700",
    lineHeight: 17
  },
  notificationTime: {
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  previewCaptainButton: {
    alignSelf: "stretch",
    minHeight: 44,
    marginTop: spacing.xs,
    borderRadius: radii.sm
  },
  liveRequestHubCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(18, 34, 58, 0.74)"
  },
  liveRequestHubHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  liveRequestHubIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  liveRequestHubCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  liveRequestHubTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  liveRequestHubMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  liveRequestStatusBand: {
    minHeight: 68,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.28)",
    backgroundColor: "rgba(139, 92, 246, 0.12)"
  },
  liveRequestStatusIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.14)"
  },
  liveRequestStatusCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  liveRequestStatusLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  liveRequestStatusValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  liveRequestPills: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  liveRequestPill: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  liveRequestPillText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  liveRequestRows: {
    gap: spacing.xs
  },
  liveRequestNextStep: {
    alignItems: "flex-end",
    gap: 4,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.2)",
    backgroundColor: "rgba(0, 229, 255, 0.07)"
  },
  liveRequestNextLabel: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  liveRequestNextValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  stageCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderColor: "rgba(0, 229, 255, 0.28)"
  },
  stageHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  stagePulse: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.36)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  stageCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  stageTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  stageMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  searchRings: {
    height: 156,
    alignItems: "center",
    justifyContent: "center"
  },
  ring: {
    position: "absolute",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.2)"
  },
  ringLarge: {
    width: 128,
    height: 128
  },
  ringMedium: {
    width: 82,
    height: 82
  },
  searchCore: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.18)"
  },
  radarScan: {
    position: "absolute",
    width: 74,
    height: 2,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.62)",
    transform: [{ rotate: "-32deg" }],
    boxShadow: "0 0 18px rgba(0, 229, 255, 0.54)"
  },
  radarDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
    boxShadow: "0 0 12px rgba(0, 229, 255, 0.7)"
  },
  radarDotOne: {
    top: 42,
    right: 82
  },
  radarDotTwo: {
    left: 92,
    bottom: 45,
    backgroundColor: colors.violetSoft
  },
  radarMetaPill: {
    position: "absolute",
    bottom: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  radarMetaText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  stageSummary: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  stageSummaryTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  stageActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  secondaryButton: {
    minHeight: 44,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  stagePrimaryButton: {
    minHeight: 48,
    flex: 1,
    borderRadius: radii.sm
  },
  acceptedCaptainCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.32)"
  },
  acceptedHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  acceptedBadge: {
    minHeight: 36,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.32)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  acceptedBadgeText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  acceptedStatus: {
    ...rtlText,
    flex: 1,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  captainRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  captainAvatar: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(139, 92, 246, 0.24)"
  },
  captainInitial: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  ratingPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255, 209, 102, 0.12)"
  },
  ratingText: {
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  captainStats: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  captainArrivalPanel: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.07)"
  },
  captainArrivalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  captainArrivalIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  captainArrivalCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  captainArrivalTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  captainArrivalMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  captainArrivalTrack: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs
  },
  arrivalTrackStep: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  arrivalTrackLine: {
    width: 28,
    height: 2,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.62)"
  },
  arrivalTrackValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  arrivalTrackLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  captainArrivalMetrics: {
    flexDirection: "row-reverse",
    gap: spacing.xs
  },
  captainArrivalMetric: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  captainArrivalMetricValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  captainArrivalMetricLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  captainArrivalNext: {
    alignItems: "flex-end",
    gap: 3,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(139, 92, 246, 0.12)"
  },
  captainArrivalNextLabel: {
    ...rtlText,
    color: colors.violetSoft,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  captainArrivalNextValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  pickupHandoffPanel: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.24)",
    backgroundColor: "rgba(51, 231, 168, 0.08)"
  },
  pickupHandoffHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  pickupHandoffIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.28)",
    backgroundColor: "rgba(51, 231, 168, 0.12)"
  },
  pickupHandoffCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  pickupHandoffTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  pickupHandoffMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  pickupHandoffCodeCard: {
    minHeight: 82,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.22)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  pickupHandoffCodeLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  pickupHandoffCodeValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    fontVariant: ["tabular-nums"]
  },
  pickupHandoffChecklist: {
    alignItems: "flex-end",
    gap: 3,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  pickupHandoffChecklistText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  pickupHandoffChecklistMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  pickupHandoffReadyPill: {
    minHeight: 38,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(51, 231, 168, 0.14)"
  },
  pickupHandoffReadyText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  captainDetailsGrid: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  safetyPanel: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.18)",
    backgroundColor: "rgba(51, 231, 168, 0.07)"
  },
  safetyHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  safetyIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.24)",
    backgroundColor: "rgba(51, 231, 168, 0.1)"
  },
  safetyCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  safetyTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  safetyMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  safetyActions: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  safetyButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.22)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  safetyButtonAlert: {
    borderColor: "rgba(255, 209, 102, 0.22)",
    backgroundColor: "rgba(255, 209, 102, 0.08)"
  },
  safetyButtonText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  miniMetric: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSoft
  },
  metricValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  metricLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "700"
  },
  iconAction: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSoft
  },
  tripMetrics: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  tripMetric: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  activeRidePanel: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.07)"
  },
  activeRideHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  activeRideIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  activeRideCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  activeRideTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  activeRideMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  activeRideRouteBox: {
    alignItems: "flex-end",
    gap: 4,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  activeRideRouteLabel: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  activeRideRouteValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  activeRideRouteDetail: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  activeRideGrid: {
    flexDirection: "row-reverse",
    gap: spacing.xs
  },
  activeRideGridItem: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  activeRideGridValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  activeRideGridLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  activeRideNextStep: {
    alignItems: "flex-end",
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(139, 92, 246, 0.12)"
  },
  activeRideNextText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  completedIcon: {
    alignSelf: "center",
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.09)"
  },
  completedTitle: {
    ...rtlText,
    alignSelf: "center",
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  },
  receiptCard: {
    alignSelf: "stretch",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.22)",
    backgroundColor: "rgba(0, 229, 255, 0.07)"
  },
  receiptHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  receiptIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.26)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  receiptCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  receiptTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  receiptMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  receiptRows: {
    gap: spacing.xs
  },
  receiptLine: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  receiptLineMuted: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  receiptDownloadButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  receiptDownloadText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  customerFeedbackCard: {
    alignSelf: "stretch",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.28)",
    backgroundColor: "rgba(139, 92, 246, 0.08)"
  },
  customerFeedbackHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  customerFeedbackIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  customerFeedbackCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  customerFeedbackTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  customerFeedbackMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  customerFeedbackCaptain: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  starsRow: {
    flexDirection: "row",
    alignSelf: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs
  },
  starButton: {
    minWidth: 40,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill
  },
  feedbackTagsBlock: {
    gap: spacing.xs
  },
  feedbackTagsTitle: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  feedbackTagsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  feedbackTag: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  feedbackTagActive: {
    borderColor: "rgba(0, 229, 255, 0.38)",
    backgroundColor: "rgba(0, 229, 255, 0.14)"
  },
  feedbackTagText: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  feedbackTagTextActive: {
    color: colors.text
  },
  feedbackSubmitButton: {
    minHeight: 46,
    borderRadius: radii.sm
  },
  tabStack: {
    gap: spacing.md
  },
  tabIntroCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.28)"
  },
  searchTabCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.3)"
  },
  destinationDiscoveryPanel: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.07)"
  },
  destinationDiscoveryHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  destinationDiscoveryIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  destinationDiscoveryCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  destinationDiscoveryTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  destinationDiscoveryMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  destinationDiscoveryGrid: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  destinationDiscoveryMetric: {
    flex: 1,
    minHeight: 58,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 5,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  destinationDiscoveryValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  destinationDiscoveryFooter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  destinationDiscoveryText: {
    ...rtlText,
    flex: 1,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  destinationDiscoveryButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.32)",
    backgroundColor: "rgba(139, 92, 246, 0.14)"
  },
  destinationDiscoveryButtonText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  searchInputShell: {
    minHeight: 50,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  searchInput: {
    ...rtlText,
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
    paddingVertical: spacing.xs
  },
  searchFilterRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  searchFilterChip: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  searchFilterChipActive: {
    borderColor: "rgba(0, 229, 255, 0.36)",
    backgroundColor: "rgba(0, 229, 255, 0.13)"
  },
  searchFilterText: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  searchFilterTextActive: {
    color: colors.text
  },
  searchResultCount: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  searchResultsList: {
    gap: spacing.sm
  },
  searchResultRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  searchResultRowActive: {
    borderColor: "rgba(0, 229, 255, 0.38)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  searchResultMetaPill: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: "rgba(139, 92, 246, 0.16)"
  },
  searchResultMetaText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  searchResultCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  searchResultTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  searchResultArea: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  searchResultDetail: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  searchResultIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  searchSelectedCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.34)"
  },
  searchSelectedHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  searchSelectedIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  searchSelectedCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  searchSelectedTitle: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  searchSelectedName: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  searchSelectedMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  searchDetailField: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.18)",
    backgroundColor: "rgba(0, 229, 255, 0.055)"
  },
  searchDetailHint: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 18
  },
  searchDetailInput: {
    minHeight: 76,
    textAlignVertical: "top"
  },
  searchDetailPreview: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "900",
    lineHeight: 18
  },
  searchUseButton: {
    minHeight: 46,
    borderRadius: radii.sm
  },
  searchEmptyCard: {
    padding: spacing.md,
    alignItems: "flex-end"
  },
  tabHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  tabIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.32)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  tabCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  tabTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  tabMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  tripOverviewCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.32)"
  },
  tripTimelineBox: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  customerJourneyTimelineCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.06)"
  },
  customerJourneyHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  customerJourneyIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.11)"
  },
  customerJourneyCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  customerJourneyTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  customerJourneyMeta: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  customerJourneySteps: {
    gap: spacing.xs
  },
  customerJourneyStep: {
    minHeight: 54,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  customerJourneyStepDone: {
    borderColor: "rgba(51, 231, 168, 0.18)",
    backgroundColor: "rgba(51, 231, 168, 0.08)"
  },
  customerJourneyStepIcon: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.16)",
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  customerJourneyStepIconDone: {
    borderColor: "rgba(51, 231, 168, 0.24)",
    backgroundColor: "rgba(51, 231, 168, 0.11)"
  },
  customerJourneyStepCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  customerJourneyStepText: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  customerJourneyStepTextDone: {
    color: colors.text
  },
  customerJourneyStepDetail: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 18
  },
  historyList: {
    gap: spacing.sm
  },
  completedTripHistoryCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.32)",
    backgroundColor: "rgba(0, 229, 255, 0.07)"
  },
  completedTripHistoryHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  completedTripHistoryBadge: {
    minHeight: 34,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.26)",
    backgroundColor: "rgba(51, 231, 168, 0.12)"
  },
  completedTripHistoryBadgeText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  completedTripHistoryCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  completedTripHistoryTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  completedTripHistoryMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  completedTripHistoryDestination: {
    gap: spacing.xxs,
    alignItems: "flex-end",
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  completedTripHistoryGrid: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  completedTripHistoryTile: {
    flex: 1,
    minHeight: 82,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: spacing.xxs,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  completedTripHistoryTileValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  completedTripHistoryTileLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 17
  },
  completedTripHistoryNote: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900",
    lineHeight: 20
  },
  historyRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  historyStatus: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(51, 231, 168, 0.12)"
  },
  historyStatusText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  historyCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  historyTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  historyMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  profileStack: {
    gap: spacing.md
  },
  profileCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(139, 92, 246, 0.32)"
  },
  profileHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  profileAvatar: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(199, 183, 255, 0.32)",
    backgroundColor: "rgba(139, 92, 246, 0.18)"
  },
  profileCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  profileTitle: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  profileName: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  profileMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  customerTrustPanel: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.24)",
    backgroundColor: "rgba(51, 231, 168, 0.07)"
  },
  customerTrustHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  customerTrustIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.3)",
    backgroundColor: "rgba(51, 231, 168, 0.12)"
  },
  customerTrustCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  customerTrustTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  customerTrustMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  customerTrustGrid: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  customerTrustMetric: {
    flex: 1,
    minHeight: 78,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  customerTrustValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  customerTrustLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  customerTrustList: {
    gap: spacing.xs
  },
  customerTrustText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  customerTrustButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  customerTrustButtonText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profileRows: {
    gap: spacing.xs
  },
  profileWalletCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.28)"
  },
  profilePaymentCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(139, 92, 246, 0.26)"
  },
  profileSecurityCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(51, 231, 168, 0.24)"
  },
  profileSectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  profileSectionIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  profileSectionCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  profileSectionTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  profileSectionMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  profileWalletGrid: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  profileWalletTilePrimary: {
    flex: 1.3,
    minHeight: 88,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.26)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  profileWalletTile: {
    flex: 1,
    minHeight: 88,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: spacing.xxs,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.16)",
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  profileWalletValue: {
    ...rtlText,
    color: colors.text,
    fontSize: 23,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  profileWalletValueSmall: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  profileWalletLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  profilePaymentList: {
    gap: spacing.xs
  },
  profilePaymentRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  profilePaymentStatus: {
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  profilePaymentStatusText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  profilePaymentCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  profilePaymentTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profilePaymentMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  profileSecurityList: {
    gap: spacing.xs
  },
  profileSecurityRow: {
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(51, 231, 168, 0.08)"
  },
  profileSecurityText: {
    ...rtlText,
    flex: 1,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profileActionButton: {
    minHeight: 44,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  profileSecurityButton: {
    borderColor: "rgba(51, 231, 168, 0.24)",
    backgroundColor: "rgba(51, 231, 168, 0.08)"
  },
  profileActionText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profileRow: {
    minHeight: 46,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  profileRowCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  profileRowLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  profileRowValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  activeNavToast: {
    position: "absolute",
    right: spacing.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(7, 11, 20, 0.62)"
  },
  activeNavText: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700"
  }
});
