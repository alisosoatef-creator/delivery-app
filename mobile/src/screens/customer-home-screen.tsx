import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  Bell,
  Car,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  AlertTriangle,
  LogOut,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  XCircle
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useEffect, useReducer, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  BackHandler,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import { MockRouteMap } from "@/components/mock-route-map";
import { MotionPressable } from "@/components/motion-pressable";
import { MotionSurface } from "@/components/motion-surface";
import { PremiumButton } from "@/components/premium-button";
import { RealtimeActivityFeed, RealtimeStatusCard } from "@/components/realtime-status-card";
import { useResponsiveLayout } from "@/design/responsive";
import {
  colors,
  controlSurfaces,
  glass,
  gradients,
  layoutRhythm,
  radii,
  shadows,
  spacing,
  touchTargets,
  typography
} from "@/design/tokens";
import { customerHomeMock } from "@/mock/customer-home";
import {
  CUSTOMER_BOOKING_STEPS,
  CUSTOMER_FEEDBACK_TAGS,
  CUSTOMER_SEARCH_FILTERS,
  DELIVERY_PACKAGE_TYPES,
  LIVE_CUSTOMER_REQUEST_ID,
  defaultVisaPaymentValues,
  formatCustomerFeedbackNote,
  getCustomerDestinationResults,
  getCustomerJourneySteps,
  getCustomerAccountDetailView,
  getCustomerRideRequestDraft,
  getCustomerSearchCopy,
  getCustomerSearchTabView,
  getCustomerSupportHubView,
  getCustomerTripDetailView,
  getCustomerTripsOverview,
  getDestinationCity,
  getPaymentChoiceSummary,
  getPaymentReadinessCopy,
  getRequestReadinessCopy,
  getVisaCardLastFour,
  mapAcceptedTripStepToCaptainStatus,
  mapAcceptedTripStepToCustomerStage,
  mapAcceptedTripStepToTripsStatus,
  mapCustomerStageToMapPhase,
  visaPaymentSchema,
  type CustomerAccountInfoRowKind,
  type CustomerBookingStep,
  type CustomerSearchCopy,
  type CustomerSearchFilter,
  type CustomerSupportAction,
  type CustomerSupportActionLabel,
  type CustomerTripDetailViewModel,
  type CustomerTripsDetailView,
  type CustomerTripsLiveRide,
  type DeliveryPackageType,
  type DestinationPlace,
  type PaymentMethod,
  type PickupPoint,
  type ServiceType,
  type VisaPaymentFormValues
} from "@/screens/customer-home/customer-ux-model";
import {
  getLatestMockRealtimeEvent,
  getMockRealtimeConnectionSummary,
  getRecentMockRealtimeEvents
} from "@/realtime/mock-realtime";
import { useMockRideRequests } from "@/state/mock-app-context";
import {
  createInitialCustomerTripFlow,
  customerTripFlowReducer
} from "@/state/mock-trip-flow";

type CustomerHomeScreenProps = {
  onPreviewCaptainRequests?: () => void;
};

type CustomerNotification = (typeof customerHomeMock.notifications)[number];

export function CustomerHomeScreen({ onPreviewCaptainRequests }: CustomerHomeScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();
  const [selectedDestination, setSelectedDestination] = useState<DestinationPlace | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<PickupPoint>(
    customerHomeMock.pickupOptions[0]
  );
  const [isMockLocationEnabled, setIsMockLocationEnabled] = useState(false);
  const [activeNav, setActiveNav] = useState<string>(customerHomeMock.navItems[0].label);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isBookingFlowOpen, setIsBookingFlowOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<CustomerBookingStep>("service");
  const [tripFlow, dispatchTripFlow] = useReducer(
    customerTripFlowReducer,
    createInitialCustomerTripFlow()
  );
  const [rideRequests, dispatchRideRequests] = useMockRideRequests();
  const [notice, setNotice] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [visibleNotifications, setVisibleNotifications] = useState<CustomerNotification[]>(
    () => [...customerHomeMock.notifications]
  );
  const [clearedNotifications, setClearedNotifications] = useState<CustomerNotification[] | null>(
    null
  );
  const [isSupportHubOpen, setIsSupportHubOpen] = useState(false);
  const [selectedSupportAction, setSelectedSupportAction] =
    useState<CustomerSupportActionLabel>("محادثة الدعم");
  const [rating, setRating] = useState<number | null>(null);
  const [completionNote, setCompletionNote] = useState<string>("");
  const [selectedFeedbackTags, setSelectedFeedbackTags] = useState<string[]>([]);
  const [destinationDetail, setDestinationDetail] = useState<string>("");
  const [deliveryPackageDescription, setDeliveryPackageDescription] = useState<string>("");
  const [selectedDeliveryPackageType, setSelectedDeliveryPackageType] =
    useState<DeliveryPackageType>(DELIVERY_PACKAGE_TYPES[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    customerHomeMock.defaultPaymentMethod
  );
  const [shouldSaveVisaCard, setShouldSaveVisaCard] = useState(false);
  const visaForm = useForm<VisaPaymentFormValues>({
    defaultValues: defaultVisaPaymentValues,
    mode: "onChange",
    resolver: zodResolver(visaPaymentSchema)
  });
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>(
    customerHomeMock.serviceTypes[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchFilter, setActiveSearchFilter] = useState<CustomerSearchFilter>("الكل");
  const [isSearchDestinationPrepared, setIsSearchDestinationPrepared] = useState(false);
  const { showConfirmation, stage: rideStage } = tripFlow;

  useEffect(() => {
    const keyboardShowSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const keyboardHideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isKeyboardVisible) {
        Keyboard.dismiss();
        return true;
      }

      if (isNotificationsOpen) {
        setIsNotificationsOpen(false);
        setNotice(null);
        return true;
      }

      if (isSupportHubOpen) {
        setIsSupportHubOpen(false);
        setNotice(null);
        void Haptics.selectionAsync();
        return true;
      }

      if (showConfirmation) {
        dispatchTripFlow({ type: "reset" });
        setNotice(null);
        void Haptics.selectionAsync();
        return true;
      }

      if (isBookingFlowOpen) {
        if (bookingStep === "details") {
          setBookingStep("destination");
        } else if (bookingStep === "destination") {
          setBookingStep("pickup");
        } else if (bookingStep === "pickup") {
          setBookingStep("service");
        } else {
          setIsBookingFlowOpen(false);
          setBookingStep("service");
        }

        setIsSupportHubOpen(false);
        setIsNotificationsOpen(false);
        setNotice(null);
        void Haptics.selectionAsync();
        return true;
      }

      if (activeNav !== customerHomeMock.navItems[0].label) {
        setActiveNav(customerHomeMock.navItems[0].label);
        setIsSupportHubOpen(false);
        setIsNotificationsOpen(false);
        setNotice(null);
        void Haptics.selectionAsync();
        return true;
      }

      return true;
    });

    return () => subscription.remove();
  }, [
    activeNav,
    bookingStep,
    isBookingFlowOpen,
    isKeyboardVisible,
    isNotificationsOpen,
    isSupportHubOpen,
    showConfirmation
  ]);

  const acceptedCustomerRequest =
    rideRequests.acceptedRequest?.id === LIVE_CUSTOMER_REQUEST_ID
      ? rideRequests.acceptedRequest
      : null;
  const liveCustomerFeedback =
    acceptedCustomerRequest &&
    rideRequests.customerFeedback?.requestId === acceptedCustomerRequest.id
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
        paymentStatus: rideRequests.acceptedTripStep === "completed" ? "مدفوع" : "بانتظار اكتمال الرحلة",
        price: acceptedCustomerRequest.price,
        receiptNumber: "WAS-0001",
        route: `${acceptedCustomerRequest.pickup} ← ${acceptedCustomerRequest.destinationArea}`,
        serviceLabel: acceptedCustomerRequest.serviceLabel,
        time: rideRequests.acceptedTripStep === "completed" ? "اكتملت الآن" : "نشطة الآن"
      }
    : null;
  const latestRealtimeEvent = getLatestMockRealtimeEvent(rideRequests.realtime, "customer");
  const realtimeConnectionSummary = getMockRealtimeConnectionSummary(
    rideRequests.realtime,
    "customer"
  );
  const recentRealtimeEvents = getRecentMockRealtimeEvents(rideRequests.realtime, "customer", 4);
  const notificationCount = visibleNotifications.length;
  const selectedServiceLabel =
    selectedServiceType.id === "city" ? customerHomeMock.service.label : selectedServiceType.label;
  const selectedSearchCopy = getCustomerSearchCopy(selectedServiceType);

  function handleClearNotifications() {
    if (visibleNotifications.length === 0) {
      return;
    }

    setClearedNotifications(visibleNotifications);
    setVisibleNotifications([]);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleUndoClearNotifications() {
    if (!clearedNotifications?.length) {
      return;
    }

    setVisibleNotifications(clearedNotifications);
    setClearedNotifications(null);
  }
  const visaPaymentValues = visaForm.watch();
  const isVisaPaymentDirty = Object.values(visaPaymentValues).some(
    (value) => value.trim().length > 0
  );
  const visaValidationResult = visaPaymentSchema.safeParse(visaPaymentValues);
  const visaValidationMessages = visaValidationResult.success
    ? []
    : Array.from(new Set(visaValidationResult.error.issues.map((issue) => issue.message)));
  const visaCardLastFour = getVisaCardLastFour(visaPaymentValues.cardNumber);
  const effectivePaymentMethod =
    paymentMethod === "فيزا" && visaValidationResult.success && visaCardLastFour
      ? `فيزا • **** ${visaCardLastFour}`
      : paymentMethod;
  const paymentReadinessCopy = getPaymentReadinessCopy({
    effectivePaymentMethod,
    isVisaPaymentDirty,
    paymentMethod,
    shouldSaveVisaCard,
    visaValidationReady: visaValidationResult.success
  });
  const paymentChoiceSummary = getPaymentChoiceSummary({
    effectivePaymentMethod,
    paymentMethod,
    visaValidationReady: visaValidationResult.success
  });
  const requestReadinessCopy = getRequestReadinessCopy({
    paymentMethod,
    visaValidationReady: visaValidationResult.success
  });
  const isRequestBlockedByPayment = paymentMethod === "فيزا" && !visaValidationResult.success;
  const customerRideRequestDraftPreview = selectedDestination
    ? getCustomerRideRequestDraft({
        deliveryPackageDescription,
        destinationDetail,
        effectivePaymentMethod,
        selectedDeliveryPackageType,
        selectedDestination,
        selectedPickup,
        selectedServiceLabel,
        selectedServiceType
      })
    : null;
  const captainDestinationDetail = customerRideRequestDraftPreview?.destinationDetail ?? destinationDetail;
  const isFocusedCustomerHome = activeNav === "الرئيسية" && !isBookingFlowOpen;
  const shouldShowFloatingNav =
    !isKeyboardVisible && !(isBookingFlowOpen && bookingStep !== "details");

  function resetRide() {
    dispatchTripFlow({ type: "reset" });
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
    setNotice("تم تفعيل موقعك الحالي");
  }

  function openBookingFlow() {
    setActiveNav("الرئيسية");
    setIsBookingFlowOpen(true);
    setIsSupportHubOpen(false);
    setBookingStep("service");
    setNotice(null);
    setIsNotificationsOpen(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function closeBookingFlow() {
    setIsBookingFlowOpen(false);
    setBookingStep("service");
    setIsSupportHubOpen(false);
    setNotice(null);
    setIsNotificationsOpen(false);
    void Haptics.selectionAsync();
  }

  function openSupportHub() {
    setIsSupportHubOpen(true);
    setSelectedSupportAction("محادثة الدعم");
    setNotice(null);
    setIsNotificationsOpen(false);
    void Haptics.selectionAsync();
  }

  function closeSupportHub() {
    setIsSupportHubOpen(false);
    setNotice(null);
    setIsNotificationsOpen(false);
    void Haptics.selectionAsync();
  }

  function selectSupportAction(action: CustomerSupportAction) {
    setSelectedSupportAction(action.label);
    setNotice(null);
    setIsNotificationsOpen(false);
    void Haptics.selectionAsync();
  }

  function selectPickup(nextPickup: PickupPoint) {
    setSelectedPickup(nextPickup);
    setIsMockLocationEnabled(true);
    setIsNotificationsOpen(false);
    setNotice(`تم اختيار ${nextPickup.label} كنقطة انطلاق`);
  }

  function selectDestination(place: DestinationPlace) {
    setSelectedDestination(place);
    setDestinationDetail(place.detail);
    setNotice(null);
    setIsNotificationsOpen(false);
    resetRide();
  }

  function selectDestinationFromSearch(place: DestinationPlace) {
    selectDestination(place);
    setIsSearchDestinationPrepared(true);
    setNotice(`تم اختيار ${place.label} ${selectedSearchCopy.selectedNoticeSuffix}`);
  }

  function selectServiceType(serviceType: ServiceType) {
    setSelectedServiceType(serviceType);
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

  function continueSelectedServiceType() {
    setBookingStep("pickup");
    setNotice(null);
    setIsNotificationsOpen(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function continuePickupSelection() {
    setBookingStep("destination");
    setNotice(null);
    setIsNotificationsOpen(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function continueDestinationSelection() {
    if (!selectedDestination) {
      return;
    }

    setBookingStep("details");
    setNotice(null);
    setIsNotificationsOpen(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function editDestinationSelection() {
    setBookingStep("destination");
    setNotice(null);
    setIsNotificationsOpen(false);
    void Haptics.selectionAsync();
  }

  function useSelectedSearchDestination() {
    if (!selectedDestination || !isSearchDestinationPrepared) {
      setNotice("اختر وجهة من نتائج البحث");
      return;
    }

    setActiveNav("الرئيسية");
    setIsBookingFlowOpen(true);
    setBookingStep("details");
    setIsSearchDestinationPrepared(false);
    setNotice(`تم تجهيز ${selectedDestination.label} للطلب`);
  }

  function requestTrip() {
    if (!selectedDestination) {
      setNotice("اختر وجهتك قبل تأكيد الطلب");
      dispatchTripFlow({ type: "reset" });
      return;
    }

    if (paymentMethod === "فيزا" && !visaValidationResult.success) {
      setNotice("أكمل بيانات فيزا قبل تأكيد الطلب");
      return;
    }

    setNotice(null);
    setIsNotificationsOpen(false);
    dispatchTripFlow({ type: "review-request" });
  }

  function confirmTrip() {
    if (!selectedDestination) {
      return;
    }

    const request =
      customerRideRequestDraftPreview ??
      getCustomerRideRequestDraft({
        deliveryPackageDescription,
        destinationDetail,
        effectivePaymentMethod,
        selectedDeliveryPackageType,
        selectedDestination,
        selectedPickup,
        selectedServiceLabel,
        selectedServiceType
      });

    dispatchRideRequests({ request, type: "submit-customer-request" });
    dispatchTripFlow({ type: "confirm-request" });
    setRating(null);
    setNotice(null);
    setIsNotificationsOpen(false);
  }

  function returnToBookingReview() {
    dispatchTripFlow({ type: "reset" });
    setNotice(null);
    void Haptics.selectionAsync();
  }

  function cancelSearch() {
    resetRide();
    setNotice("تم إلغاء البحث عن كابتن");
  }

  function submitCustomerFeedback(
    nextRating: number | null,
    nextNote: string,
    nextTags = selectedFeedbackTags
  ) {
    if (!acceptedCustomerRequest || effectiveRideStage !== "completed" || !nextRating) {
      return;
    }

    dispatchRideRequests({
      feedback: {
        note: formatCustomerFeedbackNote(nextNote, nextTags),
        rating: nextRating,
        requestId: acceptedCustomerRequest.id
      },
      type: "submit-customer-feedback"
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
      <GlassCard
        testID="customer-compact-confirmation-card"
        style={styles.compactConfirmationCard}
        variant="strong"
      >
        <View style={styles.stageHeader}>
          <View style={styles.stagePulse}>
            <ShieldCheck color={colors.cyan} size={22} />
          </View>
          <View style={styles.stageCopy}>
            <Text selectable style={styles.stageTitle}>
              تأكيد وإرسال الطلب
            </Text>
            <Text selectable style={styles.stageMeta}>
              سنرسل الطلب الآن للكباتن القريبين.
            </Text>
          </View>
        </View>

        <View style={styles.compactConfirmationRoute}>
          <MapPin color={colors.cyan} size={18} />
          <View style={styles.compactConfirmationRouteCopy}>
            <Text selectable style={styles.compactConfirmationRouteValue}>
              {`${selectedPickup.label} ← ${selectedDestination.area}`}
            </Text>
            <Text selectable style={styles.compactConfirmationRouteMeta}>
              {`${selectedServiceLabel} • ${selectedDestination.distance}`}
            </Text>
          </View>
        </View>

        <View style={styles.compactConfirmationMetrics}>
          <View style={styles.compactConfirmationMetric}>
            <Text selectable style={styles.compactConfirmationMetricValue}>
              {selectedServiceType.price}
            </Text>
            <Text selectable style={styles.compactConfirmationMetricLabel}>
              السعر
            </Text>
          </View>
          <View style={styles.compactConfirmationMetric}>
            <Text selectable style={styles.compactConfirmationMetricValue}>
              {effectivePaymentMethod}
            </Text>
            <Text selectable style={styles.compactConfirmationMetricLabel}>
              الدفع
            </Text>
          </View>
        </View>

        <View style={styles.compactConfirmationActions}>
          <PremiumButton
            accessibilityLabel="العودة لتعديل الطلب"
            label="تعديل"
            onPress={returnToBookingReview}
            style={styles.secondaryButton}
            variant="secondary"
          />
          <PremiumButton
            accessibilityLabel="تأكيد الطلب"
            label="تأكيد الطلب"
            onPress={confirmTrip}
            style={styles.stagePrimaryButton}
          />
        </View>
      </GlassCard>
    );
  }

  function renderRideStagePanel() {
    if (effectiveRideStage === "idle") {
      return null;
    }

    if (effectiveRideStage === "searching") {
      return (
        <GlassCard
          testID="customer-captain-search-surface"
          style={styles.captainSearchSurface}
          variant="strong"
        >
          <View style={styles.stageHeader}>
            <View style={styles.stagePulse}>
              <Car color={colors.cyan} size={22} />
            </View>
            <View style={styles.stageCopy}>
              <Text style={styles.stageTitle}>جاري البحث عن كابتن</Text>
              <Text style={styles.stageMeta}>نبحث عن أقرب كابتن يناسب رحلتك الآن</Text>
              <Text selectable style={styles.captainSearchStatus}>
                تم إرسال طلبك للكباتن القريبين
              </Text>
            </View>
          </View>
          {selectedDestination ? (
            <MockRouteMap
              destinationArea={selectedDestination.area}
              destinationDetail={destinationDetail}
              phase="searching"
              pickupLabel={selectedPickup.label}
            />
          ) : null}
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
            <View style={styles.captainSearchSummary}>
              <Text selectable style={styles.captainSearchSummaryRoute}>
                {`${selectedPickup.label} ← ${selectedDestination.area}`}
              </Text>
              <Text selectable style={styles.captainSearchSummaryMeta}>
                {`${selectedServiceType.price} • ${effectivePaymentMethod}`}
              </Text>
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
              accessibilityLabel={
                onPreviewCaptainRequests ? "معاينة الطلب عند الكابتن" : "عرض الكابتن"
              }
              label={onPreviewCaptainRequests ? "معاينة عند الكابتن" : "عرض الكابتن"}
              onPress={
                onPreviewCaptainRequests ?? (() => dispatchTripFlow({ type: "assign-captain" }))
              }
              style={styles.stagePrimaryButton}
            />
          </View>
        </GlassCard>
      );
    }

    if (effectiveRideStage === "captain") {
      const captain = customerHomeMock.captain;
      const hasCaptainArrived = rideRequests.acceptedTripStep === "arrived";
      const liveArrivalEta = hasCaptainArrived ? "وصل الآن" : captain.arrivalEta;
      const liveCaptainDistance = hasCaptainArrived ? "0.0 كم" : "1.2 كم";
      const liveCaptainLocation = hasCaptainArrived
        ? `عند ${selectedPickup.label}`
        : captain.locationLabel;

      return (
        <GlassCard
          testID="customer-captain-tracking-surface"
          style={styles.captainTrackingSurface}
          variant="strong"
        >
          <View testID="accepted-captain-card" style={styles.acceptedCaptainSummary}>
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
          </View>

          {selectedDestination ? (
            <MockRouteMap
              destinationArea={selectedDestination.area}
              destinationDetail={captainDestinationDetail}
              phase={mapCustomerStageToMapPhase(effectiveRideStage, rideRequests.acceptedTripStep)}
              pickupLabel={selectedPickup.label}
            />
          ) : null}

          <View testID="captain-live-metrics" style={styles.captainLiveMetrics}>
            <View style={styles.miniMetric}>
              <Clock color={colors.cyan} size={16} />
              <Text selectable style={styles.metricValue}>
                {liveArrivalEta}
              </Text>
              <Text selectable style={styles.metricLabel}>
                وقت الوصول
              </Text>
            </View>
            <View style={styles.miniMetric}>
              <MapPin color={colors.cyan} size={16} />
              <Text selectable style={styles.metricValue}>
                {liveCaptainDistance}
              </Text>
              <Text selectable style={styles.metricLabel}>
                المسافة بينكم
              </Text>
            </View>
            <View style={styles.miniMetric}>
              <Car color={colors.violetSoft} size={16} />
              <Text selectable style={styles.metricValue}>
                {liveCaptainLocation}
              </Text>
              <Text selectable style={styles.metricLabel}>
                موقع الكابتن
              </Text>
            </View>
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
              <Text selectable style={styles.stageMeta}>
                {captain.phone}
              </Text>
            </View>
            <View style={styles.ratingPill}>
              <Star color={colors.warning} fill={colors.warning} size={14} />
              <Text style={styles.ratingText}>{captain.rating}</Text>
            </View>
          </View>

          <View testID="captain-trip-summary" style={styles.captainTripSummary}>
            <View style={styles.captainTripSummaryItem}>
              <Car color={colors.cyan} size={16} />
              <Text selectable style={styles.captainTripSummaryValue}>
                {`${selectedServiceType.label} • ${selectedServiceType.price}`}
              </Text>
            </View>
            <View style={styles.captainTripSummaryItem}>
              <CreditCard color={colors.violetSoft} size={16} />
              <Text selectable style={styles.captainTripSummaryValue}>
                {effectivePaymentMethod}
              </Text>
            </View>
          </View>

          {rideRequests.acceptedTripStep === "arrived" ? (
            <CustomerPickupHandoffPanel
              captainName={captain.name}
              vehicleLabel={`${captain.carColor} • لوحة ${captain.plate}`}
            />
          ) : null}

          <CustomerSafetyPanel
            onSafetyAlert={() => setNotice("تم تسجيل تنبيه الأمان")}
            onShareTrip={() => setNotice("تم تجهيز رابط مشاركة الرحلة")}
          />

          <View style={styles.stageActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="اتصال بالكابتن"
              onPress={() => setNotice("سيتم تفعيل الاتصال قريباً")}
              style={styles.iconAction}
            >
              <Phone color={colors.textSoft} size={18} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="رسالة للكابتن"
              onPress={() => setNotice("سيتم تفعيل الرسائل قريباً")}
              style={styles.iconAction}
            >
              <MessageCircle color={colors.textSoft} size={18} />
            </Pressable>
            <PremiumButton
              accessibilityLabel="بدء الرحلة"
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
      const activeRideDestinationDetail =
        acceptedCustomerRequest?.destinationDetail ?? captainDestinationDetail;
      const activeRidePaymentMethod =
        acceptedCustomerRequest?.paymentMethod ?? effectivePaymentMethod;

      return (
        <GlassCard
          testID="customer-active-trip-surface"
          style={styles.activeTripSurface}
          variant="strong"
        >
          <View style={styles.stageHeader}>
            <View style={styles.stagePulse}>
              <MapPin color={colors.cyan} size={22} />
            </View>
            <View style={styles.stageCopy}>
              <Text style={styles.stageTitle}>الرحلة الحالية</Text>
              <Text style={styles.stageMeta}>الكابتن في الطريق إلى الوجهة المختارة</Text>
            </View>
          </View>

          {selectedDestination ? (
            <MockRouteMap
              destinationArea={selectedDestination.area}
              destinationDetail={activeRideDestinationDetail}
              phase="driving"
              pickupLabel={selectedPickup.label}
            />
          ) : null}

          <View testID="customer-active-progress-strip" style={styles.tripMetrics}>
            <View style={styles.tripMetric}>
              <Clock color={colors.cyan} size={16} />
              <Text selectable style={styles.metricValue}>
                5 د
              </Text>
              <Text selectable style={styles.metricLabel}>
                الوقت المتبقي
              </Text>
            </View>
            <View style={styles.tripMetric}>
              <MapPin color={colors.cyan} size={16} />
              <Text selectable style={styles.metricValue}>
                2.1 كم
              </Text>
              <Text selectable style={styles.metricLabel}>
                المسافة المتبقية
              </Text>
            </View>
            <View style={styles.tripMetric}>
              <Navigation color={colors.violetSoft} size={16} />
              <Text selectable style={styles.metricValue}>
                10:24
              </Text>
              <Text selectable style={styles.metricLabel}>
                الوصول المتوقع
              </Text>
            </View>
          </View>
          <CustomerActiveRidePanel
            destinationDetail={activeRideDestinationDetail}
            paymentMethod={activeRidePaymentMethod}
            route={activeRideRoute}
          />
          <CustomerSafetyPanel
            onSafetyAlert={() => setNotice("تم تسجيل تنبيه الأمان")}
            onShareTrip={() => setNotice("تم تجهيز رابط مشاركة الرحلة")}
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
      <GlassCard
        testID="customer-trip-completion-surface"
        style={styles.tripCompletionSurface}
        variant="strong"
      >
        <View style={styles.completedIcon}>
          <CheckCircle color={colors.cyan} size={42} />
        </View>
        <Text style={styles.completedTitle}>تم الوصول</Text>
        <Text style={styles.stageMeta}>شكرًا لاستخدامك واصل</Text>
        <CustomerReceiptCard
          amount={acceptedCustomerRequest?.price ?? selectedServiceType.price}
          destinationDetail={acceptedCustomerRequest?.destinationDetail ?? captainDestinationDetail}
          onDownload={() => setNotice("تم تجهيز إيصال الرحلة")}
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

  return (
    <View style={styles.root}>
      <LinearGradient pointerEvents="none" colors={gradients.app} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        testID="customer-home-scroll"
        contentContainerStyle={[
          styles.content,
          {
            alignSelf: "center",
            maxWidth: responsive.contentMaxWidth,
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + 120,
            paddingHorizontal: responsive.horizontalPadding,
            width: "100%"
          }
        ]}
      >
        <View style={styles.header}>
          <MotionPressable
            accessibilityLabel="فتح التنبيهات"
            accessibilityHint={`${notificationCount} إشعارات جديدة`}
            accessibilityRole="button"
            feedback="selection"
            onPress={() => {
              setNotice(null);
              setIsNotificationsOpen((current) => !current);
            }}
            pressedScale={0.96}
            style={styles.notificationPill}
            testID="customer-notification-pill"
          >
            <LinearGradient
              colors={["rgba(139, 92, 246, 0.18)", "rgba(0, 229, 255, 0.2)"]}
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0)"]}
              pointerEvents="none"
              style={styles.notificationPillHighlight}
            />
            <View style={styles.notificationPillIcon}>
              <Bell color={colors.text} size={18} />
            </View>
            <View
              accessibilityLabel={`${notificationCount} إشعارات`}
              testID="customer-notification-count-badge"
              style={styles.notificationCountBadge}
            >
              <Text
                selectable
                style={styles.notificationCountText}
                testID="customer-notification-count-text"
              >
                {String(notificationCount)}
              </Text>
            </View>
          </MotionPressable>
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
            <Text
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
              selectable
              style={styles.feedbackText}
            >
              {notice}
            </Text>
          </GlassCard>
        ) : null}

        {isNotificationsOpen ? (
          <MotionSurface testID="customer-motion-notification-center">
            <CustomerNotificationCenter
              canUndoClear={Boolean(clearedNotifications?.length)}
              notifications={visibleNotifications}
              onClear={handleClearNotifications}
              onClose={() => setIsNotificationsOpen(false)}
              onUndoClear={handleUndoClearNotifications}
            />
          </MotionSurface>
        ) : null}

        {!isFocusedCustomerHome && latestRealtimeEvent ? (
          <RealtimeStatusCard event={latestRealtimeEvent} summary={realtimeConnectionSummary} />
        ) : null}
        {!isFocusedCustomerHome ? <RealtimeActivityFeed events={recentRealtimeEvents} /> : null}

        <View style={[styles.heroCopy, isFocusedCustomerHome ? styles.focusedHeroCopy : null]}>
          <Text selectable style={styles.greeting}>
            {activeNav === "رحلاتي"
              ? customerHomeMock.trips.title
              : activeNav === "حسابي"
                ? isSupportHubOpen
                  ? "مركز الدعم"
                  : "ملف العميل"
                : activeNav === "البحث"
                  ? "البحث"
                  : isBookingFlowOpen
                    ? "إنشاء طلب جديد"
                    : "جاهز لمشوارك؟"}
          </Text>
          <Text selectable style={styles.subtitle}>
            {activeNav === "رحلاتي"
              ? "تابع رحلتك الحالية وسجل رحلاتك السابقة"
              : activeNav === "حسابي"
                ? isSupportHubOpen
                  ? "كل خيارات المساعدة في مكان واحد"
                  : "بياناتك الأساسية ووسائل الدفع"
                : activeNav === "البحث"
                  ? "اختر وجهتك بسرعة من الأماكن القريبة والمحفوظة"
                  : isBookingFlowOpen
                    ? "خطوات رحلتك مرتبة في مساحة واحدة"
                    : "اطلب رحلتك بخطوات بسيطة وواضحة"}
          </Text>
        </View>

        <MotionSurface
          key={`${activeNav}-${isBookingFlowOpen ? "booking" : "tab"}-${
            isSupportHubOpen ? "support" : "profile"
          }`}
          testID="customer-active-tab-motion-surface"
        >
          {activeNav === "رحلاتي" ? (
            <CustomerTripsTab liveTrip={liveCustomerTrip} />
          ) : activeNav === "حسابي" ? (
            isSupportHubOpen ? (
              <CustomerSupportHub
                onBack={closeSupportHub}
                onSelectAction={selectSupportAction}
                selectedAction={selectedSupportAction}
              />
            ) : (
              <CustomerProfileTab onOpenSupport={openSupportHub} />
            )
          ) : activeNav === "البحث" ? (
            <CustomerSearchTab
              activeFilter={activeSearchFilter}
              destinationDetail={
                isSearchDestinationPrepared && selectedDestination ? destinationDetail : undefined
              }
              onChangeDestinationDetail={setDestinationDetail}
              onChangeFilter={(filter) => {
                setActiveSearchFilter(filter);
                setIsSearchDestinationPrepared(false);
              }}
              onChangeQuery={(query) => {
                setSearchQuery(query);
                setIsSearchDestinationPrepared(false);
              }}
              onSelectDestination={selectDestinationFromSearch}
              onUseDestination={useSelectedSearchDestination}
              query={searchQuery}
              searchCopy={selectedSearchCopy}
              selectedDestination={isSearchDestinationPrepared ? selectedDestination : null}
            />
          ) : isBookingFlowOpen ? (
            <View testID="customer-booking-workspace" style={styles.bookingWorkspace}>
              <Pressable
                accessibilityLabel="العودة إلى الرئيسية"
                accessibilityRole="button"
                hitSlop={8}
                onPress={closeBookingFlow}
                style={({ pressed }) => [
                  styles.bookingWorkspaceBack,
                  pressed ? styles.pressed : null
                ]}
              >
                <ChevronRight color={colors.textSoft} size={19} />
                <Text selectable style={styles.bookingWorkspaceBackText}>
                  الرئيسية
                </Text>
              </Pressable>

              <CustomerBookingProgress currentStep={bookingStep} />

              {bookingStep === "service" ? (
                <CustomerServiceSelectionPage
                  onContinue={continueSelectedServiceType}
                  onSelect={selectServiceType}
                  selectedServiceType={selectedServiceType}
                />
              ) : bookingStep === "pickup" ? (
                <CustomerPickupSelectionPage
                  isMockLocationEnabled={isMockLocationEnabled}
                  onContinue={continuePickupSelection}
                  onEnableLocation={enableMockLocation}
                  onSelectPickup={selectPickup}
                  selectedPickup={selectedPickup}
                  selectedServiceType={selectedServiceType}
                />
              ) : bookingStep === "destination" ? (
                <CustomerDestinationSelectionPage
                  destinationDetail={destinationDetail}
                  onChangeDestinationDetail={setDestinationDetail}
                  onChangeQuery={setSearchQuery}
                  onContinue={continueDestinationSelection}
                  onSelectDestination={selectDestination}
                  pickupLabel={selectedPickup.label}
                  query={searchQuery}
                  selectedDestination={selectedDestination}
                  selectedServiceType={selectedServiceType}
                />
              ) : (
                <View testID="customer-booking-details-page" style={styles.bookingDetailsPage}>
                  {selectedDestination && effectiveRideStage === "idle" && !showConfirmation ? (
                    <MotionSurface delay={0} testID="customer-motion-booking-review">
                      <GlassCard
                        testID="customer-booking-review-card"
                        style={styles.bookingReviewCard}
                        variant="strong"
                      >
                        <View style={styles.bookingReviewHeader}>
                          <View style={styles.bookingReviewIcon}>
                            <CheckCircle color={colors.success} size={21} />
                          </View>
                          <View style={styles.bookingReviewCopy}>
                            <Text selectable style={styles.bookingReviewTitle}>
                              راجع طلبك
                            </Text>
                            <Text selectable style={styles.bookingReviewMeta}>
                              تأكد من المسار والدفع، ثم أرسل الطلب لأقرب كابتن.
                            </Text>
                          </View>
                        </View>

                        <View
                          testID="customer-booking-review-route"
                          style={styles.bookingReviewRoute}
                        >
                          <View style={styles.bookingReviewRouteLine}>
                            <View style={styles.bookingReviewRouteDot} />
                            <View style={styles.bookingReviewRouteConnector} />
                            <View
                              style={[
                                styles.bookingReviewRouteDot,
                                styles.bookingReviewRouteDotDestination
                              ]}
                            />
                          </View>
                          <View style={styles.bookingReviewRouteCopy}>
                            <View style={styles.bookingReviewRoutePoint}>
                              <Text selectable style={styles.bookingReviewRouteLabel}>
                                نقطة الانطلاق
                              </Text>
                              <Text selectable style={styles.bookingReviewRouteValue}>
                                {selectedPickup.label}
                              </Text>
                            </View>
                            <View style={styles.bookingReviewRoutePoint}>
                              <Text selectable style={styles.bookingReviewRouteLabel}>
                                الوجهة
                              </Text>
                              <Text selectable style={styles.bookingReviewRouteValue}>
                                {selectedDestination.label}
                              </Text>
                              <Text selectable style={styles.bookingReviewRouteMeta}>
                                {selectedDestination.area}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Text selectable style={styles.bookingReviewRouteSummary}>
                          {`${selectedPickup.label} ← ${selectedDestination.area}`}
                        </Text>

                        <View style={styles.bookingReviewMetrics}>
                          <View style={styles.bookingReviewMetric}>
                            <Text selectable style={styles.bookingReviewMetricValue}>
                              {selectedServiceType.price}
                            </Text>
                            <Text selectable style={styles.bookingReviewMetricLabel}>
                              السعر
                            </Text>
                          </View>
                          <View style={styles.bookingReviewMetric}>
                            <Text selectable style={styles.bookingReviewMetricValue}>
                              {selectedDestination.distance}
                            </Text>
                            <Text selectable style={styles.bookingReviewMetricLabel}>
                              المسافة
                            </Text>
                          </View>
                          <View style={styles.bookingReviewMetric}>
                            <Text selectable style={styles.bookingReviewMetricValue}>
                              {selectedServiceType.eta}
                            </Text>
                            <Text selectable style={styles.bookingReviewMetricLabel}>
                              وصول الكابتن
                            </Text>
                          </View>
                        </View>

                        <View style={styles.bookingReviewNote}>
                          <MessageCircle color={colors.violetSoft} size={17} />
                          <View style={styles.bookingReviewNoteCopy}>
                            <Text selectable style={styles.bookingReviewNoteLabel}>
                              ملاحظة الكابتن
                            </Text>
                            <TextInput
                              accessibilityLabel="تفصيل الوجهة"
                              multiline
                              onChangeText={setDestinationDetail}
                              placeholder="أضف علامة واضحة للكابتن"
                              placeholderTextColor={colors.textMuted}
                              returnKeyType="done"
                              style={styles.bookingReviewNoteInput}
                              value={destinationDetail}
                            />
                          </View>
                        </View>

                        <View style={styles.bookingReviewService}>
                          <View style={styles.bookingReviewServiceIcon}>
                            <Text style={styles.bookingReviewServiceEmoji}>
                              {selectedServiceType.emoji}
                            </Text>
                          </View>
                          <View style={styles.bookingReviewServiceCopy}>
                            <Text selectable style={styles.bookingReviewServiceTitle}>
                              {selectedServiceLabel}
                            </Text>
                            <Text selectable style={styles.bookingReviewServiceMeta}>
                              {selectedServiceType.label} • {selectedServiceType.vehicle}
                            </Text>
                          </View>
                          <CheckCircle color={colors.cyan} size={18} />
                        </View>

                        <Pressable
                          accessibilityLabel="تعديل الوجهة"
                          accessibilityRole="button"
                          onPress={editDestinationSelection}
                          style={({ pressed }) => [
                            styles.bookingReviewEdit,
                            pressed ? styles.pressed : null
                          ]}
                        >
                          <MapPin color={colors.cyan} size={16} />
                          <Text selectable style={styles.bookingReviewEditText}>
                            تعديل الوجهة
                          </Text>
                        </Pressable>

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

                        <View testID="customer-payment-method-panel" style={styles.paymentGroup}>
                          <View style={styles.paymentHeaderRow}>
                            <Text selectable style={styles.detailLabel}>
                              طريقة الدفع
                            </Text>
                            <View
                              testID="customer-payment-choice-summary"
                              style={styles.paymentChoiceSummary}
                            >
                              <Text selectable style={styles.paymentChoiceSummaryTitle}>
                                {paymentChoiceSummary.title}
                              </Text>
                              <Text selectable style={styles.paymentChoiceSummaryMeta}>
                                {paymentChoiceSummary.detail}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.paymentOptions}>
                            {customerHomeMock.paymentMethods.map((method) => (
                              <Pressable
                                key={method}
                                accessibilityLabel={method}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: paymentMethod === method }}
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
                                    بطاقة فيزا
                                  </Text>
                                  <Text selectable style={styles.visaPaymentMeta}>
                                    لن يتم خصم أي مبلغ الآن.
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
                                    returnKeyType="next"
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
                                    returnKeyType="next"
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
                                      returnKeyType="next"
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
                                      returnKeyType="done"
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
                                      <Text
                                        key={message}
                                        selectable
                                        style={styles.visaReadinessIssue}
                                      >
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
                                  {shouldSaveVisaCard ? (
                                    <CheckCircle color={colors.success} size={16} />
                                  ) : null}
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
                                      سيتم حفظ البطاقة للاستخدام القادم
                                    </Text>
                                  ) : null}
                                </View>
                              ) : null}
                            </View>
                          ) : null}

                          <View
                            testID="customer-payment-readiness-card"
                            style={styles.paymentReadinessCard}
                          >
                            <View style={styles.paymentReadinessIcon}>
                              <CreditCard
                                color={
                                  paymentMethod === "فيزا" && !visaValidationResult.success
                                    ? colors.warning
                                    : colors.cyan
                                }
                                size={18}
                              />
                            </View>
                            <View style={styles.paymentReadinessCopy}>
                              <Text selectable style={styles.paymentReadinessTitle}>
                                {paymentReadinessCopy.title}
                              </Text>
                              <Text selectable style={styles.paymentReadinessMethod}>
                                {paymentReadinessCopy.method}
                              </Text>
                              <Text selectable style={styles.paymentReadinessMeta}>
                                {paymentReadinessCopy.detail}
                              </Text>
                            </View>
                            <View style={styles.paymentReadinessStatus}>
                              <CheckCircle
                                color={
                                  paymentMethod === "فيزا" && !visaValidationResult.success
                                    ? colors.textMuted
                                    : colors.success
                                }
                                size={15}
                              />
                              <Text selectable style={styles.paymentReadinessStatusText}>
                                {paymentReadinessCopy.status}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View
                          accessibilityLabel={requestReadinessCopy.title}
                          testID="customer-request-readiness-strip"
                          style={styles.requestReadinessStrip}
                        >
                          <View
                            style={[
                              styles.requestReadinessIcon,
                              isRequestBlockedByPayment
                                ? styles.requestReadinessIconWarning
                                : styles.requestReadinessIconReady
                            ]}
                          >
                            <ShieldCheck
                              color={isRequestBlockedByPayment ? colors.warning : colors.success}
                              size={17}
                            />
                          </View>
                          <View style={styles.requestReadinessCopy}>
                            <Text numberOfLines={1} selectable style={styles.requestReadinessTitle}>
                              {requestReadinessCopy.title}
                            </Text>
                            <Text numberOfLines={2} selectable style={styles.requestReadinessDetail}>
                              {requestReadinessCopy.detail}
                            </Text>
                          </View>
                          <Text
                            adjustsFontSizeToFit
                            minimumFontScale={0.82}
                            numberOfLines={2}
                            selectable
                            style={styles.requestReadinessStatus}
                          >
                            {requestReadinessCopy.status}
                          </Text>
                        </View>
                      </GlassCard>
                    </MotionSurface>
                  ) : null}

                  {effectiveRideStage === "idle" && !showConfirmation ? (
                    <PremiumButton
                      accessibilityLabel="طلب رحلة"
                      label="اطلب رحلة"
                      style={styles.primaryButton}
                      onPress={requestTrip}
                    />
                  ) : null}

                  {renderTripConfirmation()}

                  {renderRideStagePanel()}
                </View>
              )}
            </View>
          ) : (
            <CustomerBookingLauncher onStart={openBookingFlow} />
          )}
        </MotionSurface>
      </ScrollView>

      {shouldShowFloatingNav ? (
        <GlassCard
          testID="floating-bottom-nav"
          variant="floating"
          style={[
            styles.bottomNav,
            {
              bottom: insets.bottom + spacing.md,
              columnGap: responsive.navItemGap,
              left: responsive.navInset,
              right: responsive.navInset
            }
          ]}
        >
          {customerHomeMock.navItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <MotionPressable
                key={item.label}
                accessibilityLabel={`فتح تبويب ${item.label}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: activeNav === item.label }}
                feedback="selection"
                hitSlop={8}
                onPress={() => {
                  setNotice(null);
                  setActiveNav(item.label);
                  setIsSupportHubOpen(false);
                  if (item.label === "البحث") {
                    setIsSearchDestinationPrepared(false);
                  }
                  if (item.label === "الرئيسية") {
                    setIsBookingFlowOpen(false);
                  }
                }}
                style={[styles.navItem, activeNav === item.label ? styles.navItemActive : null]}
                testID={`customer-motion-tab-${index}`}
              >
                <Icon color={activeNav === item.label ? colors.text : colors.textMuted} size={18} />
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                  numberOfLines={1}
                  style={[styles.navLabel, activeNav === item.label ? styles.navLabelActive : null]}
                >
                  {item.label}
                </Text>
              </MotionPressable>
            );
          })}
        </GlassCard>
      ) : null}
    </View>
  );
}

function CustomerDestinationSelectionPage({
  destinationDetail,
  onChangeDestinationDetail,
  onChangeQuery,
  onContinue,
  onSelectDestination,
  pickupLabel,
  query,
  selectedDestination,
  selectedServiceType
}: {
  destinationDetail: string;
  onChangeDestinationDetail: (detail: string) => void;
  onChangeQuery: (query: string) => void;
  onContinue: () => void;
  onSelectDestination: (place: DestinationPlace) => void;
  pickupLabel: string;
  query: string;
  selectedDestination: DestinationPlace | null;
  selectedServiceType: ServiceType;
}) {
  const destinationResults = getCustomerDestinationResults({
    fallbackTitle: "أماكن مقترحة",
    query
  });
  const results = destinationResults.places;

  return (
    <View testID="customer-destination-selection-page" style={styles.destinationSelectionPage}>
      <MotionSurface delay={0} testID="customer-motion-destination-search">
        <View style={styles.destinationSelectionHeader}>
          <View style={styles.destinationSelectionIcon}>
            <Search color={colors.cyan} size={22} />
          </View>
          <View style={styles.destinationSelectionCopy}>
            <Text selectable style={styles.destinationSelectionTitle}>
              اختر وجهتك
            </Text>
            <Text selectable style={styles.destinationSelectionMeta}>
              ابحث عن المكان، راجع المسافة، وأضف ملاحظة وصول واضحة.
            </Text>
            <Text selectable style={styles.destinationSelectionService}>
              {selectedServiceType.label}
            </Text>
          </View>
        </View>

        <View style={styles.searchInputShell}>
          <Search color={colors.textMuted} size={18} />
          <TextInput
            accessibilityLabel="ابحث عن وجهة"
            onChangeText={onChangeQuery}
            placeholder="ابحث عن مكان أو منطقة"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
        </View>
      </MotionSurface>

      <MotionSurface delay={60} testID="customer-motion-destination-map">
        <MockRouteMap
          destinationArea={selectedDestination?.area}
          destinationDetail={selectedDestination ? destinationDetail : undefined}
          phase="idle"
          pickupLabel={pickupLabel}
        />
      </MotionSurface>

      <MotionSurface delay={110} testID="customer-motion-destination-results">
        <View style={styles.sectionHeader}>
          <Text selectable style={styles.sectionTitle}>
            {destinationResults.title}
          </Text>
          <Text selectable style={styles.searchResultCount}>
            {`${results.length} نتائج`}
          </Text>
        </View>

        <View style={styles.searchResultsList}>
          {results.map((place) => {
            const Icon = place.icon;
            const isSelected = selectedDestination?.label === place.label;

            return (
              <Pressable
                key={place.label}
                accessibilityLabel={`اختيار وجهة ${place.label}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                onPress={() => onSelectDestination(place)}
                style={({ pressed }) => [
                  styles.searchResultRow,
                  isSelected ? styles.searchResultRowActive : null,
                  pressed ? styles.pressed : null
                ]}
              >
                <View style={styles.searchResultMetaPill}>
                  <Text selectable style={styles.searchResultMetaText}>
                    {place.distance}
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
                    {place.detail}
                  </Text>
                </View>
                <View style={styles.searchResultIcon}>
                  <Icon color={isSelected ? colors.text : colors.cyan} size={18} />
                </View>
              </Pressable>
            );
          })}
        </View>

        {!results.length ? (
          <GlassCard style={styles.destinationSelectionEmpty}>
            <Text selectable style={styles.destinationSelectionEmptyText}>
              لا توجد نتائج مطابقة، جرّب اسم منطقة أو مكان آخر.
            </Text>
          </GlassCard>
        ) : null}
      </MotionSurface>

      {selectedDestination ? (
        <MotionSurface delay={160} testID="customer-motion-destination-confirmation">
          <GlassCard style={styles.searchSelectedCard} variant="strong">
            <View style={styles.searchSelectedHeader}>
              <View style={styles.searchSelectedIcon}>
                <MapPin color={colors.cyan} size={18} />
              </View>
              <View style={styles.searchSelectedCopy}>
                <Text selectable style={styles.searchSelectedTitle}>
                  الوجهة المختارة
                </Text>
                <Text selectable style={styles.searchSelectedName}>
                  {selectedDestination.label}
                </Text>
                <Text selectable style={styles.searchSelectedMeta}>
                  {`${selectedDestination.area} • ${selectedDestination.distance}`}
                </Text>
              </View>
            </View>

            <DestinationReadinessSummary
              place={selectedDestination}
              testID="customer-booking-destination-summary"
            />

            <View style={styles.searchDetailField}>
              <Text selectable style={styles.detailLabel}>
                ملاحظة الوصول للكابتن
              </Text>
              <Text selectable style={styles.searchDetailHint}>
                اكتب علامة واضحة مثل اسم البوابة أو مدخل المبنى.
              </Text>
              <TextInput
                accessibilityLabel="ملاحظة الوصول للكابتن"
                multiline
                onChangeText={onChangeDestinationDetail}
                placeholder="مثلاً: الباب الرئيسي بجانب الصيدلية"
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                style={[styles.detailInput, styles.searchDetailInput]}
                value={destinationDetail}
              />
              {destinationDetail.trim() ? (
                <Text selectable style={styles.searchDetailPreview}>
                  {destinationDetail.trim()}
                </Text>
              ) : null}
            </View>

            <PremiumButton
              accessibilityLabel="متابعة من الوجهة"
              feedback="none"
              label="متابعة إلى تفاصيل الطلب"
              onPress={onContinue}
              style={styles.searchUseButton}
            >
              <ChevronLeft color={colors.text} size={17} />
            </PremiumButton>
          </GlassCard>
        </MotionSurface>
      ) : (
        <GlassCard style={styles.destinationSelectionEmpty}>
          <Text selectable style={styles.destinationSelectionEmptyText}>
            اختر وجهة من النتائج ليظهر ملخص المسافة وخيار المتابعة.
          </Text>
        </GlassCard>
      )}
    </View>
  );
}

function CustomerPickupSelectionPage({
  isMockLocationEnabled,
  onContinue,
  onEnableLocation,
  onSelectPickup,
  selectedPickup,
  selectedServiceType
}: {
  isMockLocationEnabled: boolean;
  onContinue: () => void;
  onEnableLocation: () => void;
  onSelectPickup: (pickup: PickupPoint) => void;
  selectedPickup: PickupPoint;
  selectedServiceType: ServiceType;
}) {
  return (
    <View testID="customer-pickup-selection-page" style={styles.pickupSelectionPage}>
      <MotionSurface delay={0} testID="customer-motion-pickup-selection">
        <View style={styles.pickupSelectionHeader}>
          <View style={styles.pickupSelectionIcon}>
            <MapPin color={colors.cyan} size={22} />
          </View>
          <View style={styles.pickupSelectionCopy}>
            <Text selectable style={styles.pickupSelectionTitle}>
              حدد موقع الانطلاق
            </Text>
            <Text selectable style={styles.pickupSelectionMeta}>
              استخدم موقعك الحالي أو اختر أقرب نقطة مناسبة.
            </Text>
            <Text selectable style={styles.pickupSelectionService}>
              {selectedServiceType.label}
            </Text>
          </View>
        </View>
      </MotionSurface>

      <MotionSurface delay={70} testID="customer-motion-pickup-location">
        <CustomerLocationCard
          isMockLocationEnabled={isMockLocationEnabled}
          onEnableLocation={onEnableLocation}
          onSelectPickup={onSelectPickup}
          selectedPickup={selectedPickup}
        />
      </MotionSurface>

      <MotionSurface delay={140} testID="customer-motion-pickup-continue">
        <GlassCard style={styles.pickupSelectionSummary} variant="strong">
          <View style={styles.pickupSelectionSummaryCopy}>
            <Text selectable style={styles.pickupSelectionSummaryLabel}>
              نقطة الانطلاق المختارة
            </Text>
            <Text selectable style={styles.pickupSelectionSummaryValue}>
              {selectedPickup.label}
            </Text>
            <Text selectable style={styles.pickupSelectionSummaryMeta}>
              {selectedPickup.detail}
            </Text>
          </View>
          <PremiumButton
            accessibilityLabel="متابعة من موقع الانطلاق"
            feedback="none"
            label="متابعة"
            onPress={onContinue}
            style={styles.pickupSelectionButton}
          >
            <ChevronLeft color={colors.text} size={17} />
          </PremiumButton>
        </GlassCard>
      </MotionSurface>
    </View>
  );
}

function CustomerServiceSelectionPage({
  onContinue,
  onSelect,
  selectedServiceType
}: {
  onContinue: () => void;
  onSelect: (serviceType: ServiceType) => void;
  selectedServiceType: ServiceType;
}) {
  return (
    <View testID="customer-service-selection-page" style={styles.serviceSelectionPage}>
      <MotionSurface delay={0} testID="customer-motion-service-type">
        <GlassCard
          testID="customer-service-type-picker"
          style={styles.serviceTypePicker}
          variant="strong"
        >
          <View style={styles.serviceTypeHeader}>
            <View style={styles.serviceTypeHeaderIcon}>
              <Car color={colors.cyan} size={19} />
            </View>
            <View style={styles.serviceTypeHeaderCopy}>
              <Text selectable style={styles.serviceTypeTitle}>
                اختر نوع رحلتك
              </Text>
              <Text selectable style={styles.serviceTypeMeta}>
                ثلاثة خيارات بسيطة، اختر الأنسب لمشوارك.
              </Text>
            </View>
          </View>

          <View style={styles.serviceTypeList}>
            {customerHomeMock.serviceTypes.map((serviceType) => {
              const isSelected = selectedServiceType.id === serviceType.id;

              return (
                <Pressable
                  key={serviceType.id}
                  accessibilityLabel={`اختيار ${serviceType.label}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => onSelect(serviceType)}
                  style={({ pressed }) => [
                    styles.serviceTypeOption,
                    isSelected ? styles.serviceTypeOptionActive : null,
                    pressed ? styles.pressed : null
                  ]}
                  testID={`customer-service-option-${serviceType.id}`}
                >
                  <View style={styles.serviceTypeVisual}>
                    <View style={styles.serviceTypeEmoji}>
                      <Text style={styles.serviceTypeEmojiText}>{serviceType.emoji}</Text>
                    </View>
                    <Text selectable style={styles.serviceTypeVehicleText}>
                      {serviceType.vehicle}
                    </Text>
                  </View>
                  <View style={styles.serviceTypeCopy}>
                    <Text selectable style={styles.serviceTypeOptionTitle}>
                      {serviceType.label}
                    </Text>
                    <Text selectable style={styles.serviceTypeOptionMeta}>
                      {serviceType.description}
                    </Text>
                    <Text selectable style={styles.serviceTypeBadgeText}>
                      {serviceType.badge}
                    </Text>
                  </View>
                  <View style={styles.serviceTypeMetrics}>
                    <View style={styles.serviceTypePricePill}>
                      <Text selectable style={styles.serviceTypePriceText}>
                        {serviceType.price}
                      </Text>
                    </View>
                    <View style={styles.serviceTypeEtaPill}>
                      <Text selectable style={styles.serviceTypeEtaText}>
                        {serviceType.eta}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>
      </MotionSurface>

      <MotionSurface delay={90} testID="customer-motion-service-next-step">
        <GlassCard
          testID="customer-service-next-step"
          style={styles.serviceNextStepCard}
          variant="strong"
        >
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
            accessibilityLabel="متابعة الخدمة المختارة"
            feedback="none"
            label={selectedServiceType.nextStepAction}
            onPress={onContinue}
            style={styles.serviceNextStepButton}
          >
            <ChevronLeft color={colors.text} size={17} />
          </PremiumButton>
        </GlassCard>
      </MotionSurface>
    </View>
  );
}

function CustomerBookingLauncher({ onStart }: { onStart: () => void }) {
  return (
    <MotionSurface delay={0} testID="customer-motion-booking-launcher">
      <View testID="customer-focused-home">
        <GlassCard
          testID="customer-booking-launcher"
          style={styles.bookingLauncherCard}
          variant="strong"
        >
          <View testID="customer-home-ready-status" style={styles.bookingReadyStatus}>
            <View style={styles.bookingReadyIcon}>
              <CheckCircle color={colors.cyan} size={22} />
            </View>
            <View style={styles.bookingReadyCopy}>
              <Text selectable style={styles.bookingReadyTitle}>
                جاهز الآن
              </Text>
            </View>
          </View>
          <PremiumButton
            accessibilityLabel="بدء طلب رحلة"
            feedback="none"
            label="اطلب رحلة"
            onPress={onStart}
            style={styles.bookingLauncherButton}
          >
            <MapPin color={colors.text} size={20} />
          </PremiumButton>
        </GlassCard>
      </View>
    </MotionSurface>
  );
}

function CustomerBookingProgress({ currentStep }: { currentStep: CustomerBookingStep }) {
  const activeIndex = Math.max(
    0,
    CUSTOMER_BOOKING_STEPS.findIndex((step) => step.id === currentStep)
  );
  const activeStep = CUSTOMER_BOOKING_STEPS[activeIndex] ?? CUSTOMER_BOOKING_STEPS[0];

  return (
    <MotionSurface delay={40} testID="customer-motion-booking-progress">
      <GlassCard testID="customer-booking-progress" style={styles.bookingProgressCard}>
        <View style={styles.bookingProgressHeader}>
          <Text selectable style={styles.bookingProgressCounter}>
            {`الخطوة ${activeIndex + 1} من ${CUSTOMER_BOOKING_STEPS.length}`}
          </Text>
          <View style={styles.bookingProgressCopy}>
            <Text selectable style={styles.bookingProgressTitle}>
              {activeStep.title}
            </Text>
            <Text selectable style={styles.bookingProgressHelper}>
              {activeStep.helper}
            </Text>
          </View>
        </View>

        <View style={styles.bookingProgressRail}>
          {CUSTOMER_BOOKING_STEPS.map((step, index) => {
            const isActive = index === activeIndex;
            const isComplete = index < activeIndex;

            return (
              <View key={step.id} style={styles.bookingProgressStep}>
                <View
                  style={[
                    styles.bookingProgressDot,
                    isComplete ? styles.bookingProgressDotComplete : null,
                    isActive ? styles.bookingProgressDotActive : null
                  ]}
                >
                  <Text
                    style={[
                      styles.bookingProgressDotText,
                      isComplete || isActive ? styles.bookingProgressDotTextActive : null
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                  numberOfLines={1}
                  style={[
                    styles.bookingProgressStepLabel,
                    isActive ? styles.bookingProgressStepLabelActive : null
                  ]}
                >
                  {step.shortTitle}
                </Text>
              </View>
            );
          })}
        </View>
      </GlassCard>
    </MotionSurface>
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
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
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
        returnKeyType="done"
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

      {rating ? (
        <Text selectable style={styles.feedbackText}>{`تقييمك: ${rating} نجوم`}</Text>
      ) : null}

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
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`اختيار ملاحظة ${tag}`}
                onPress={() => onToggleTag(tag)}
                style={({ pressed }) => [
                  styles.feedbackTag,
                  isSelected ? styles.feedbackTagActive : null,
                  pressed ? styles.pressed : null
                ]}
              >
                <Text
                  selectable
                  style={[styles.feedbackTagText, isSelected ? styles.feedbackTagTextActive : null]}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedTagSummary ? (
        <Text
          selectable
          style={styles.feedbackText}
        >{`ملاحظات مختارة: ${selectedTagSummary}`}</Text>
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

function CustomerPickupHandoffPanel({
  captainName,
  vehicleLabel
}: {
  captainName: string;
  vehicleLabel: string;
}) {
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
          رمز التحقق
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
    <GlassCard testID="customer-pickup-location-card" style={styles.locationCard} variant="strong">
      <View style={styles.locationHeader}>
        <Pressable
          accessibilityLabel="تفعيل الموقع الحالي"
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
            {isMockLocationEnabled ? "تحديد الموقع مفعّل" : "تحديد الموقع غير مفعّل"}
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
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
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

function CustomerNotificationCenter({
  canUndoClear,
  notifications,
  onClear,
  onClose,
  onUndoClear
}: {
  canUndoClear: boolean;
  notifications: CustomerNotification[];
  onClear: () => void;
  onClose: () => void;
  onUndoClear: () => void;
}) {
  const hasNotifications = notifications.length > 0;

  return (
    <GlassCard style={styles.notificationCenterCard} variant="strong">
      <View style={styles.notificationHeader}>
        <MotionPressable
          accessibilityLabel="إغلاق التنبيهات"
          accessibilityRole="button"
          feedback="selection"
          hitSlop={8}
          onPress={onClose}
          pressedScale={0.94}
          style={styles.notificationCloseButton}
        >
          <XCircle color={colors.textMuted} size={18} />
        </MotionPressable>
        <View style={styles.notificationHeaderCopy}>
          <Text selectable style={styles.notificationTitle}>
            مركز التنبيهات
          </Text>
          <Text selectable style={styles.notificationMeta}>
            تحديثات رحلتك المهمة في مكان واحد
          </Text>
        </View>
      </View>

      <View style={styles.notificationToolbar}>
        <MotionPressable
          accessibilityLabel="مسح سجل التنبيهات"
          disabled={!hasNotifications}
          feedback="light"
          onPress={onClear}
          pressedScale={0.96}
          style={[
            styles.notificationClearButton,
            !hasNotifications ? styles.notificationClearButtonDisabled : null
          ]}
        >
          <Trash2 color={hasNotifications ? colors.textSoft : colors.textMuted} size={15} />
          <Text selectable style={styles.notificationClearText}>
            مسح الكل
          </Text>
        </MotionPressable>
        <View style={styles.notificationFilterChip}>
          <Text selectable style={styles.notificationFilterText}>
            الكل
          </Text>
          <ChevronLeft color={colors.textMuted} size={14} />
        </View>
      </View>

      {hasNotifications ? (
        <View style={styles.notificationList}>
          {notifications.map((notification) => (
            <MotionSurface key={notification.id} style={styles.notificationRow}>
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
            </MotionSurface>
          ))}
        </View>
      ) : (
        <MotionSurface style={styles.notificationEmptyState} testID="customer-notifications-empty">
          <LinearGradient
            colors={["rgba(99, 102, 241, 0.18)", "rgba(0, 229, 255, 0.08)"]}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.notificationEmptyIcon}>
            <Bell color={colors.violetSoft} size={30} />
          </View>
          <View style={styles.notificationEmptySparkles}>
            <Sparkles color={colors.violetSoft} size={14} />
            <Sparkles color={colors.textSoft} size={10} />
            <Sparkles color={colors.violetSoft} size={12} />
          </View>
          <Text selectable style={styles.notificationEmptyTitle}>
            لا توجد إشعارات
          </Text>
          <Text selectable style={styles.notificationEmptyMeta}>
            عند وصول إشعار جديد سنجده هنا
          </Text>
        </MotionSurface>
      )}

      {!hasNotifications && canUndoClear ? (
        <MotionSurface style={styles.notificationUndoToast} testID="customer-notifications-undo">
          <CheckCircle color={colors.violetSoft} size={24} />
          <View style={styles.notificationUndoCopy}>
            <Text selectable style={styles.notificationUndoTitle}>
              تم مسح سجل التنبيهات بنجاح
            </Text>
            <Text selectable style={styles.notificationUndoMeta}>
              تم الحذف منذ ثوان
            </Text>
          </View>
          <MotionPressable
            accessibilityLabel="تراجع عن مسح سجل التنبيهات"
            feedback="selection"
            onPress={onUndoClear}
            pressedScale={0.96}
            style={styles.notificationUndoButton}
          >
            <Text selectable style={styles.notificationUndoText}>
              تراجع
            </Text>
          </MotionPressable>
        </MotionSurface>
      ) : null}
    </GlassCard>
  );
}

function CustomerSearchTab({
  activeFilter,
  destinationDetail,
  onChangeDestinationDetail,
  onChangeFilter,
  onChangeQuery,
  onSelectDestination,
  onUseDestination,
  query,
  searchCopy,
  selectedDestination
}: {
  activeFilter: CustomerSearchFilter;
  destinationDetail?: string;
  onChangeDestinationDetail: (detail: string) => void;
  onChangeFilter: (filter: CustomerSearchFilter) => void;
  onChangeQuery: (query: string) => void;
  onSelectDestination: (place: DestinationPlace) => void;
  onUseDestination: () => void;
  query: string;
  searchCopy: CustomerSearchCopy;
  selectedDestination: DestinationPlace | null;
}) {
  const searchView = getCustomerSearchTabView({
    activeFilter,
    fallbackTitle: query.trim() ? "نتائج البحث" : "اقتراحات قريبة",
    query
  });
  const results = searchView.results;

  return (
    <View style={styles.tabStack}>
      <GlassCard testID="customer-search-overview" style={styles.searchTabCard} variant="strong">
        <View style={styles.searchInputShell}>
          <Search color={colors.textMuted} size={18} />
          <TextInput
            accessibilityLabel={searchCopy.inputLabel}
            onChangeText={onChangeQuery}
            placeholder={searchCopy.inputPlaceholder}
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
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
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                onPress={() => onChangeFilter(filter)}
                style={({ pressed }) => [
                  styles.searchFilterChip,
                  isSelected ? styles.searchFilterChipActive : null,
                  pressed ? styles.pressed : null
                ]}
              >
                <Text
                  selectable
                  style={[
                    styles.searchFilterText,
                    isSelected ? styles.searchFilterTextActive : null
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </GlassCard>

      <View style={styles.sectionHeader}>
        <Text selectable style={styles.sectionTitle}>
          {searchView.title}
        </Text>
        <Text selectable style={styles.searchResultCount}>
          {searchView.resultCountLabel}
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
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
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
          <DestinationReadinessSummary
            place={selectedDestination}
            testID="customer-search-destination-summary"
          />
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
              returnKeyType="done"
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

      {searchView.isEmpty ? (
        <GlassCard style={styles.searchEmptyCard}>
          <Text selectable style={styles.feedbackText}>
            {searchView.emptyTitle}
          </Text>
        </GlassCard>
      ) : null}
    </View>
  );
}

function DestinationReadinessSummary({
  place,
  testID
}: {
  place: DestinationPlace;
  testID: string;
}) {
  return (
    <View testID={testID} style={styles.destinationSummaryGrid}>
      <View style={styles.destinationSummaryPill}>
        <Text selectable style={styles.destinationSummaryText}>
          {`المدينة: ${getDestinationCity(place)}`}
        </Text>
      </View>
      <View style={styles.destinationSummaryPill}>
        <Text selectable style={styles.destinationSummaryText}>
          {`المسافة: ${place.distance}`}
        </Text>
      </View>
      <View style={styles.destinationSummaryPill}>
        <Text selectable style={styles.destinationSummaryText}>
          {`السعر المتوقع: ${place.price}`}
        </Text>
      </View>
    </View>
  );
}

function CustomerTripsTab({ liveTrip }: { liveTrip: CustomerTripsLiveRide | null }) {
  const tripsView = getCustomerTripsOverview(liveTrip);
  const [detailView, setDetailView] = useState<CustomerTripsDetailView>(null);
  const selectedTripDetail = detailView ? getCustomerTripDetailView({ detailView, liveTrip }) : null;

  if (selectedTripDetail?.kind === "current") {
    return (
      <CustomerCurrentTripDetails
        detail={selectedTripDetail}
        liveTrip={liveTrip}
        onBack={() => setDetailView(null)}
      />
    );
  }

  if (selectedTripDetail?.kind === "completed-live" && liveTrip) {
    return (
      <View style={styles.tabStack}>
        <CustomerTripDetailsHeader onBack={() => setDetailView(null)} title={selectedTripDetail.headerTitle} />
        <CompletedTripHistoryCard liveTrip={liveTrip} />
      </View>
    );
  }

  if (selectedTripDetail?.kind === "history") {
    return <CustomerHistoryTripDetails detail={selectedTripDetail} onBack={() => setDetailView(null)} />;
  }

  return (
    <View style={styles.tabStack}>
      <Pressable
        accessibilityLabel="فتح تفاصيل الرحلة الحالية"
        accessibilityRole="button"
        onPress={() => setDetailView("current")}
        style={({ pressed }) => [styles.tripSummaryPressable, pressed ? styles.pressed : null]}
        testID="customer-current-trip-card"
      >
        <GlassCard testID="customer-trips-overview" style={styles.tripOverviewCard} variant="strong">
          <View style={styles.tabHeader}>
            <View style={styles.tabIcon}>
              <Car color={colors.cyan} size={22} />
            </View>
            <View style={styles.tabCopy}>
              <Text selectable style={styles.tabTitle}>
                {customerHomeMock.trips.activeTitle}
              </Text>
              <Text selectable style={styles.tabMeta}>
                {tripsView.activeStatus}
              </Text>
            </View>
          </View>

          <View style={styles.tripSummaryBody}>
            <Text selectable style={styles.tripSummaryRoute}>
              {tripsView.currentTrip.route}
            </Text>
            {liveTrip?.destinationDetail ? (
              <Text selectable style={styles.tripSummaryMeta}>
                {liveTrip.destinationDetail}
              </Text>
            ) : null}
            <View style={styles.tripSummaryFacts}>
              <Text selectable style={styles.tripSummaryFact}>
                {tripsView.currentTrip.price}
              </Text>
              <Text selectable style={styles.tripSummaryFact}>
                {tripsView.currentTrip.captain}
              </Text>
            </View>
            <Text selectable style={styles.tripSummaryMeta}>
              {tripsView.currentTrip.time}
            </Text>
            <Text selectable style={styles.tripOpenHint}>
              عرض تفاصيل الرحلة
            </Text>
          </View>
        </GlassCard>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text selectable style={styles.sectionTitle}>
          {tripsView.historyTitle}
        </Text>
      </View>

      <View style={styles.historyList}>
        {tripsView.historyRows.map((trip) => (
          <Pressable
            key={trip.id}
            accessibilityLabel={trip.accessibilityLabel}
            accessibilityRole="button"
            onPress={() => setDetailView(trip.detailView)}
            style={({ pressed }) => [styles.historyRow, pressed ? styles.pressed : null]}
          >
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
                {trip.meta}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function CustomerTripDetailsHeader({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <Pressable
      accessibilityLabel="العودة إلى قائمة رحلاتي"
      accessibilityRole="button"
      onPress={onBack}
      style={({ pressed }) => [styles.tripDetailsBackButton, pressed ? styles.pressed : null]}
    >
      <ChevronRight color={colors.textSoft} size={20} />
      <Text selectable style={styles.tripDetailsBackText}>
        {title}
      </Text>
    </Pressable>
  );
}

function CustomerCurrentTripDetails({
  detail,
  liveTrip,
  onBack
}: {
  detail: CustomerTripDetailViewModel;
  liveTrip: CustomerTripsLiveRide | null;
  onBack: () => void;
}) {
  return (
    <View style={styles.tabStack}>
      <CustomerTripDetailsHeader onBack={onBack} title={detail.headerTitle} />
      {detail.map ? (
        <MockRouteMap
          destinationArea={detail.map.destinationArea}
          destinationDetail={detail.map.destinationDetail}
          phase={detail.map.phase}
          pickupLabel={detail.map.pickupLabel}
        />
      ) : null}
      <GlassCard testID="customer-current-trip-details" style={styles.tripOverviewCard} variant="strong">
        <View style={styles.tabHeader}>
          <View style={styles.tabIcon}>
            <Car color={colors.cyan} size={22} />
          </View>
          <View style={styles.tabCopy}>
            <Text selectable style={styles.tabTitle}>
              {detail.cardTitle}
            </Text>
            <Text selectable style={styles.tabMeta}>
              {detail.status}
            </Text>
          </View>
        </View>

        <View style={styles.tripTimelineBox}>
          {detail.rows.map((row) => (
            <InfoRow key={row.label} label={row.label} value={row.value} />
          ))}
        </View>
      </GlassCard>
      {liveTrip ? <CustomerJourneyTimeline liveTrip={liveTrip} /> : null}
    </View>
  );
}

function CustomerHistoryTripDetails({
  detail,
  onBack
}: {
  detail: CustomerTripDetailViewModel;
  onBack: () => void;
}) {
  return (
    <View style={styles.tabStack}>
      <CustomerTripDetailsHeader onBack={onBack} title={detail.headerTitle} />
      <GlassCard testID="customer-history-trip-details" style={styles.tripOverviewCard} variant="strong">
        <View style={styles.tabHeader}>
          <View style={styles.tabIcon}>
            <CheckCircle color={colors.success} size={22} />
          </View>
          <View style={styles.tabCopy}>
            <Text selectable style={styles.tabTitle}>
              {detail.cardTitle}
            </Text>
            <Text selectable style={styles.tabMeta}>
              {detail.status}
            </Text>
          </View>
        </View>
        <View style={styles.tripTimelineBox}>
          {detail.rows.map((row) => (
            <InfoRow key={row.label} label={row.label} value={row.value} />
          ))}
        </View>
      </GlassCard>
    </View>
  );
}

function CustomerJourneyTimeline({ liveTrip }: { liveTrip: CustomerTripsLiveRide }) {
  const journeySteps = getCustomerJourneySteps(liveTrip);
  const statusText = liveTrip.isCompleted
    ? "كل الخطوات مكتملة"
    : `المرحلة الحالية: ${liveTrip.activeStatus}`;

  return (
    <GlassCard
      testID="customer-trip-journey-timeline"
      style={styles.customerJourneyTimelineCard}
      variant="strong"
    >
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
              <View
                style={[
                  styles.customerJourneyStepIcon,
                  isDone ? styles.customerJourneyStepIconDone : null
                ]}
              >
                {isDone ? (
                  <CheckCircle color={colors.success} size={15} />
                ) : (
                  <Clock color={colors.textMuted} size={15} />
                )}
              </View>
              <View style={styles.customerJourneyStepCopy}>
                <Text
                  selectable
                  style={[
                    styles.customerJourneyStepText,
                    isDone ? styles.customerJourneyStepTextDone : null
                  ]}
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
            {liveTrip.feedbackRating
              ? `تقييم الرحلة: ${liveTrip.feedbackRating} نجوم`
              : "بانتظار التقييم"}
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

function CustomerProfileTab({ onOpenSupport }: { onOpenSupport: () => void }) {
  const accountView = getCustomerAccountDetailView();
  const profile = accountView.profile;
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState<string | null>(null);

  function handleLogoutPress() {
    setLogoutNotice(null);
    setIsLogoutConfirmOpen(true);
  }

  function handleCancelLogout() {
    setIsLogoutConfirmOpen(false);
  }

  function handleConfirmLogout() {
    setIsLogoutConfirmOpen(false);
    setLogoutNotice("تم تأكيد تسجيل الخروج التجريبي");
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <View style={styles.profileStack}>
      <GlassCard testID="customer-profile-overview" style={styles.profileCard} variant="strong">
        <View testID="customer-profile-identity-card" style={styles.profileIdentityCard}>
          <LinearGradient
            colors={["rgba(139, 92, 246, 0.2)", "rgba(0, 229, 255, 0.1)"]}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.profileIdentityAvatar}>
            <Text selectable style={styles.profileIdentityInitial}>
              ع
            </Text>
            <View style={styles.profileVerifiedBadge}>
              <CheckCircle color={colors.text} size={13} />
            </View>
          </View>
          <View style={styles.profileIdentityCopy}>
            <Text selectable style={styles.profileIdentityEyebrow}>
              {profile.title}
            </Text>
            <Text selectable style={styles.profileTitle}>
              بطاقة هوية العميل
            </Text>
            <Text selectable style={styles.profileName}>
              {profile.name}
            </Text>
            <Text selectable style={styles.profileMeta}>
              {`${profile.phone} • ${profile.city}، فلسطين`}
            </Text>
            <Text selectable style={styles.profileCityChip}>
              {profile.city}
            </Text>
          </View>
        </View>

        <View style={styles.profileRows}>
          {accountView.rows.map((row) => (
            <ProfileRow
              key={row.kind}
              icon={<ProfileRowIcon kind={row.kind} />}
              label={row.label}
              value={row.value}
            />
          ))}
        </View>
      </GlassCard>

      <GlassCard
        testID="customer-profile-payment-summary"
        style={styles.profileWalletCard}
        variant="strong"
      >
        <View style={styles.profileSpendHeader}>
          <View style={styles.profileSpendIcon}>
            <TrendingUp color={colors.text} size={20} />
          </View>
          <View style={styles.profileSpendCopy}>
            <Text selectable style={styles.profileSpendEyebrow}>
              ملخص المدفوعات
            </Text>
            <Text selectable style={styles.profileSpendLabel}>
              مصروفات الشهر
            </Text>
            <Text selectable style={styles.profileSpendValue}>
              {accountView.wallet.tiles[0]?.value}
            </Text>
            <Text selectable style={styles.profileSpendMeta}>
              {accountView.wallet.meta}
            </Text>
          </View>
        </View>

        <Text selectable style={styles.profileWalletLabel}>
          مدفوعات هذا الشهر
        </Text>
      </GlassCard>

      <GlassCard testID="customer-profile-support" style={styles.profilePaymentCard}>
        <View style={styles.profileActionList}>
          <ProfileActionRow
            icon={<CreditCard color={colors.cyan} size={18} />}
            meta={accountView.wallet.tiles[1]?.value ?? profile.defaultPayment}
            title="حالة الدفع"
          />
          <ProfileActionRow
            icon={<CreditCard color={colors.text} size={18} />}
            meta={accountView.wallet.tiles[2]?.value ?? profile.defaultPayment}
            title="البطاقة / طريقة الدفع"
          />
          <ProfileActionRow
            accessibilityLabel="فتح الدعم والمساعدة"
            icon={<MessageCircle color={colors.violetSoft} size={18} />}
            meta={accountView.support.meta}
            onPress={onOpenSupport}
            title={accountView.support.title}
          />
          <ProfileActionRow
            accessibilityLabel="فتح الإبلاغ عن مشكلة"
            icon={<AlertTriangle color={colors.warning} size={18} />}
            meta="ساعدنا في تحسين تجربتك"
            onPress={onOpenSupport}
            title="الإبلاغ عن مشكلة"
          />
          <ProfileActionRow
            icon={<Settings color={colors.textSoft} size={18} />}
            meta="اللغة، الإشعارات، وخصوصيتك"
            title="الإعدادات والأمان"
          />
        </View>

        <View style={styles.profileSupportShortcuts}>
          <Text selectable style={styles.profileSupportShortcutText}>
            محادثة الدعم
          </Text>
          <Text selectable style={styles.profileSupportShortcutText}>
            مركز المساعدة
          </Text>
        </View>

        {logoutNotice ? (
          <MotionSurface style={styles.profileLogoutNotice}>
            <CheckCircle color={colors.success} size={16} />
            <Text selectable style={styles.profileLogoutNoticeText}>
              {logoutNotice}
            </Text>
          </MotionSurface>
        ) : null}

        {isLogoutConfirmOpen ? (
          <MotionSurface style={styles.profileLogoutConfirm} testID="customer-motion-logout-confirm">
            <View style={styles.profileLogoutConfirmIcon}>
              <ShieldCheck color={colors.warning} size={20} />
            </View>
            <View style={styles.profileLogoutConfirmCopy}>
              <Text selectable style={styles.profileLogoutConfirmTitle}>
                تأكيد تسجيل الخروج
              </Text>
              <Text selectable style={styles.profileLogoutConfirmMeta}>
                سيتم إغلاق جلسة واصل على هذا الجهاز
              </Text>
            </View>
            <View style={styles.profileLogoutConfirmActions}>
              <MotionPressable
                accessibilityLabel="إلغاء تسجيل الخروج"
                feedback="selection"
                onPress={handleCancelLogout}
                style={styles.profileLogoutCancelButton}
              >
                <Text selectable style={styles.profileLogoutCancelText}>
                  إلغاء
                </Text>
              </MotionPressable>
              <MotionPressable
                accessibilityLabel="تأكيد تسجيل الخروج"
                feedback="light"
                onPress={handleConfirmLogout}
                style={styles.profileLogoutConfirmButton}
              >
                <Text selectable style={styles.profileLogoutConfirmButtonText}>
                  تأكيد
                </Text>
              </MotionPressable>
            </View>
          </MotionSurface>
        ) : null}

        <MotionPressable
          accessibilityLabel="تسجيل الخروج"
          feedback="light"
          onPress={handleLogoutPress}
          pressedScale={0.97}
          style={styles.profileLogoutButton}
        >
          <LogOut color={colors.danger} size={18} />
          <View style={styles.profileLogoutCopy}>
            <Text selectable style={styles.profileLogoutTitle}>
              تسجيل الخروج
            </Text>
            <Text selectable style={styles.profileLogoutMeta}>
              سنطلب التأكيد قبل إغلاق الجلسة
            </Text>
          </View>
        </MotionPressable>
      </GlassCard>
    </View>
  );
}

function ProfileActionRow({
  accessibilityLabel,
  icon,
  meta,
  onPress,
  title
}: {
  accessibilityLabel?: string;
  icon: ReactNode;
  meta: string;
  onPress?: () => void;
  title: string;
}) {
  const content = (
    <>
      <View style={styles.profileActionRowIcon}>{icon}</View>
      <View style={styles.profileActionRowCopy}>
        <Text selectable style={styles.profilePaymentTitle}>
          {title}
        </Text>
        <Text selectable style={styles.profilePaymentMeta}>
          {meta}
        </Text>
      </View>
      {onPress ? <ChevronRight color={colors.textSoft} size={17} /> : null}
    </>
  );

  if (onPress) {
    return (
      <MotionPressable
        accessibilityLabel={accessibilityLabel ?? title}
        feedback="selection"
        onPress={onPress}
        pressedScale={0.98}
        style={styles.profileActionRow}
      >
        {content}
      </MotionPressable>
    );
  }

  return <View style={styles.profileActionRow}>{content}</View>;
}

function ProfileRowIcon({ kind }: { kind: CustomerAccountInfoRowKind }) {
  if (kind === "phone") {
    return <Phone color={colors.cyan} size={16} />;
  }

  if (kind === "area") {
    return <MapPin color={colors.success} size={16} />;
  }

  if (kind === "payment-status") {
    return <CreditCard color={colors.violetSoft} size={16} />;
  }

  return <CreditCard color={colors.cyan} size={16} />;
}

function CustomerSupportHub({
  onBack,
  onSelectAction,
  selectedAction
}: {
  onBack: () => void;
  onSelectAction: (action: CustomerSupportAction) => void;
  selectedAction: CustomerSupportActionLabel;
}) {
  const supportView = getCustomerSupportHubView(selectedAction);
  const activeAction = supportView.activeAction;

  return (
    <View testID="customer-support-hub" style={styles.supportHubStack}>
      <GlassCard style={styles.supportHubCard} variant="strong">
        <Pressable
          accessibilityLabel="العودة إلى حسابي"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.supportBackButton, pressed ? styles.pressed : null]}
        >
          <ChevronRight color={colors.textSoft} size={18} />
          <Text selectable style={styles.supportBackText}>
            حسابي
          </Text>
        </Pressable>

        <View style={styles.profileSectionHeader}>
          <View style={styles.profileSectionIcon}>
            <MessageCircle color={colors.cyan} size={18} />
          </View>
          <View style={styles.profileSectionCopy}>
            <Text selectable style={styles.profileSectionTitle}>
              الدعم والمساعدة
            </Text>
            <Text selectable style={styles.profileSectionMeta}>
              اختر نوع المساعدة بدون تعقيد
            </Text>
          </View>
        </View>

        <View style={styles.supportActionGrid}>
          {supportView.actions.map((action) => {
            const isActive = activeAction.label === action.label;

            return (
              <Pressable
                key={action.label}
                accessibilityLabel={`اختيار ${action.label}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => onSelectAction(action)}
                style={({ pressed }) => [
                  styles.supportActionCard,
                  isActive ? styles.supportActionCardActive : null,
                  pressed ? styles.pressed : null
                ]}
              >
                <View
                  style={[
                    styles.supportActionIcon,
                    isActive ? styles.supportActionIconActive : null
                  ]}
                >
                  {action.label === "محادثة الدعم" ? (
                    <MessageCircle color={isActive ? colors.text : colors.cyan} size={18} />
                  ) : action.label === "الإبلاغ عن مشكلة" ? (
                    <XCircle color={isActive ? colors.text : colors.warning} size={18} />
                  ) : (
                    <Phone color={isActive ? colors.text : colors.success} size={18} />
                  )}
                </View>
                <View style={styles.supportActionCopy}>
                  <Text selectable style={styles.supportActionTitle}>
                    {action.label}
                  </Text>
                  <Text selectable style={styles.supportActionMeta}>
                    {action.detail}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.supportApiNote}>
          <Sparkles color={colors.cyan} size={15} />
          <Text selectable style={styles.supportApiNoteText}>
            {supportView.apiNote}
          </Text>
        </View>
      </GlassCard>

      <GlassCard testID="customer-support-report-summary" style={styles.supportSummaryCard}>
        <View style={styles.profileSectionHeader}>
          <View style={styles.profileSectionIcon}>
            <ShieldCheck color={colors.success} size={18} />
          </View>
          <View style={styles.profileSectionCopy}>
            <Text selectable style={styles.profileSectionTitle}>
              {supportView.summary.title}
            </Text>
            <Text selectable style={styles.profileSectionMeta}>
              {supportView.summary.meta}
            </Text>
          </View>
        </View>

        <View style={styles.supportSummaryRows}>
          <View style={styles.supportSummaryLine}>
            <MessageCircle color={colors.cyan} size={16} />
            <Text selectable style={styles.supportSummaryLineText}>
              {supportView.summary.lines[0]}
            </Text>
          </View>
          <View style={styles.supportSummaryLine}>
            <ShieldCheck color={colors.success} size={16} />
            <Text selectable style={styles.supportSummaryLineText}>
              {supportView.summary.lines[1]}
            </Text>
          </View>
          <View style={styles.supportSummaryLine}>
            <Sparkles color={colors.violetSoft} size={16} />
            <Text selectable style={styles.supportSummaryLineText}>
              {supportView.summary.lines[2]}
            </Text>
          </View>
        </View>
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
    gap: spacing.md
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
  notificationPill: {
    minWidth: 92,
    minHeight: 52,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.34)",
    backgroundColor: "rgba(12, 19, 34, 0.86)",
    boxShadow: shadows.floating
  },
  notificationPillHighlight: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: "48%"
  },
  notificationPillIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(7, 11, 20, 0.58)"
  },
  notificationCountBadge: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: colors.blue,
    boxShadow: "0 0 18px rgba(0, 229, 255, 0.36)"
  },
  notificationCountText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
    textAlign: "center"
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
  focusedHeroCopy: {
    alignItems: "center",
    paddingTop: spacing.md
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
  bookingWorkspace: {
    gap: spacing.md
  },
  serviceSelectionPage: {
    gap: spacing.md
  },
  destinationSelectionPage: {
    gap: spacing.md
  },
  destinationSelectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm
  },
  destinationSelectionIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.11)"
  },
  destinationSelectionCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  destinationSelectionTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  destinationSelectionMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800",
    lineHeight: 20
  },
  destinationSelectionService: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  destinationSelectionEmpty: {
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md
  },
  destinationSelectionEmptyText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800",
    lineHeight: 20,
    textAlign: "center"
  },
  pickupSelectionPage: {
    gap: spacing.md
  },
  pickupSelectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm
  },
  pickupSelectionIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.11)"
  },
  pickupSelectionCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  pickupSelectionTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  pickupSelectionMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800",
    lineHeight: 20
  },
  pickupSelectionService: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  pickupSelectionSummary: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(139, 92, 246, 0.28)"
  },
  pickupSelectionSummaryCopy: {
    alignItems: "flex-end",
    gap: 3
  },
  pickupSelectionSummaryLabel: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  pickupSelectionSummaryValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  pickupSelectionSummaryMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  pickupSelectionButton: {
    minHeight: 52
  },
  bookingDetailsPage: {
    gap: spacing.md
  },
  bookingReviewCard: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor
  },
  bookingReviewHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  bookingReviewIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
    backgroundColor: "rgba(52, 211, 153, 0.1)"
  },
  bookingReviewCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  bookingReviewTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  bookingReviewMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800",
    lineHeight: 20
  },
  bookingReviewRoute: {
    minHeight: 126,
    flexDirection: "row-reverse",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor,
    boxShadow: shadows.cardSubtle
  },
  bookingReviewRouteLine: {
    width: 18,
    alignItems: "center",
    paddingVertical: 5
  },
  bookingReviewRouteDot: {
    width: 11,
    height: 11,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.cyan,
    backgroundColor: colors.background
  },
  bookingReviewRouteConnector: {
    flex: 1,
    width: 2,
    backgroundColor: "rgba(0, 229, 255, 0.34)"
  },
  bookingReviewRouteDotDestination: {
    borderColor: colors.violetSoft
  },
  bookingReviewRouteCopy: {
    flex: 1,
    justifyContent: "space-between",
    gap: spacing.md
  },
  bookingReviewRoutePoint: {
    alignItems: "flex-end",
    gap: 2
  },
  bookingReviewRouteLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  bookingReviewRouteValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  bookingReviewRouteMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  bookingReviewRouteSummary: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.compact,
    fontWeight: "900",
    textAlign: "center"
  },
  bookingReviewMetrics: {
    flexDirection: "row-reverse",
    gap: spacing.xs
  },
  bookingReviewMetric: {
    flex: 1,
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor,
    boxShadow: shadows.cardSubtle
  },
  bookingReviewMetricValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
    textAlign: "center"
  },
  bookingReviewMetricLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center"
  },
  bookingReviewNote: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(139, 92, 246, 0.09)"
  },
  bookingReviewNoteCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  bookingReviewNoteLabel: {
    ...rtlText,
    color: colors.violetSoft,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  bookingReviewNoteInput: {
    ...rtlText,
    width: "100%",
    minHeight: 44,
    paddingHorizontal: 0,
    paddingVertical: spacing.xs,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "800",
    lineHeight: 20,
    textAlignVertical: "top"
  },
  bookingReviewService: {
    minHeight: 66,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.16)",
    backgroundColor: "rgba(0, 229, 255, 0.055)"
  },
  bookingReviewServiceIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  bookingReviewServiceEmoji: {
    fontSize: 22
  },
  bookingReviewServiceCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  bookingReviewServiceTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  bookingReviewServiceMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  bookingReviewEdit: {
    minHeight: 42,
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.22)",
    backgroundColor: "rgba(0, 229, 255, 0.07)"
  },
  bookingReviewEditText: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  bookingWorkspaceBack: {
    minHeight: 42,
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  bookingWorkspaceBackText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  bookingProgressCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.2)"
  },
  bookingProgressHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  bookingProgressCounter: {
    ...rtlText,
    minWidth: 92,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900",
    textAlign: "center",
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  bookingProgressCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  bookingProgressTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  bookingProgressHelper: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 17
  },
  bookingProgressRail: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: spacing.xs
  },
  bookingProgressStep: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: spacing.xs
  },
  bookingProgressDot: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.22)",
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  bookingProgressDotActive: {
    borderColor: "rgba(0, 229, 255, 0.5)",
    backgroundColor: "rgba(0, 229, 255, 0.18)",
    boxShadow: shadows.activeControl
  },
  bookingProgressDotComplete: {
    borderColor: "rgba(51, 231, 168, 0.38)",
    backgroundColor: "rgba(51, 231, 168, 0.13)"
  },
  bookingProgressDotText: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  bookingProgressDotTextActive: {
    color: colors.text
  },
  bookingProgressStepLabel: {
    ...rtlText,
    width: "100%",
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    textAlign: "center"
  },
  bookingProgressStepLabelActive: {
    color: colors.text,
    fontWeight: "900"
  },
  bookingLauncherCard: {
    minHeight: 156,
    justifyContent: "space-between",
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor
  },
  bookingReadyStatus: {
    minHeight: 62,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.075)"
  },
  bookingReadyIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  bookingReadyCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xs
  },
  bookingReadyTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  bookingLauncherButton: {
    width: "100%",
    minHeight: 68
  },
  serviceTypePicker: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor
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
    minHeight: 104,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor
  },
  serviceTypeOptionActive: {
    borderColor: controlSurfaces.activeNavigation.borderColor,
    backgroundColor: controlSurfaces.activeNavigation.backgroundColor,
    boxShadow: shadows.activeControl
  },
  serviceTypeVisual: {
    width: 78,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  serviceTypeEmoji: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.07)"
  },
  serviceTypeEmojiText: {
    fontSize: 22
  },
  serviceTypeVehicleText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "900",
    textAlign: "center"
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
  serviceTypeBadgeText: {
    ...rtlText,
    alignSelf: "flex-end",
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900",
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.09)"
  },
  serviceTypeMetrics: {
    width: 76,
    alignItems: "stretch",
    gap: spacing.xs
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
  serviceTypeEtaPill: {
    minWidth: 70,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.055)"
  },
  serviceTypeEtaText: {
    ...rtlText,
    color: colors.textSoft,
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
  primaryButton: {
    height: 56,
    borderRadius: radii.sm
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
    minHeight: touchTargets.minimum,
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
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.16)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  paymentHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  paymentChoiceSummary: {
    flex: 1,
    minHeight: 52,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.18)",
    backgroundColor: "rgba(0, 229, 255, 0.06)"
  },
  paymentChoiceSummaryTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    lineHeight: 20
  },
  paymentChoiceSummaryMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 17
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
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor
  },
  paymentOptionActive: {
    borderColor: controlSurfaces.activeNavigation.borderColor,
    backgroundColor: controlSurfaces.activeNavigation.backgroundColor,
    boxShadow: shadows.activeControl
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
  paymentReadinessCard: {
    minHeight: 92,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.18)",
    backgroundColor: "rgba(0, 229, 255, 0.07)",
    boxShadow: shadows.cardSubtle
  },
  paymentReadinessIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.26)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  paymentReadinessCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: 3
  },
  paymentReadinessTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  paymentReadinessMethod: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  paymentReadinessMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 17
  },
  paymentReadinessStatus: {
    maxWidth: 118,
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  paymentReadinessStatusText: {
    ...rtlText,
    flexShrink: 1,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 16
  },
  requestReadinessStrip: {
    minHeight: 76,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: controlSurfaces.secondary.backgroundColor,
    boxShadow: shadows.cardSubtle
  },
  requestReadinessIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1
  },
  requestReadinessIconReady: {
    borderColor: "rgba(53, 242, 176, 0.26)",
    backgroundColor: "rgba(53, 242, 176, 0.1)"
  },
  requestReadinessIconWarning: {
    borderColor: "rgba(255, 203, 107, 0.26)",
    backgroundColor: "rgba(255, 203, 107, 0.1)"
  },
  requestReadinessCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: 3
  },
  requestReadinessTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  requestReadinessDetail: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 17
  },
  requestReadinessStatus: {
    ...rtlText,
    maxWidth: 126,
    flexShrink: 1,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "900",
    lineHeight: 17
  },
  compactConfirmationCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.3)"
  },
  compactConfirmationRoute: {
    minHeight: 64,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(0, 229, 255, 0.07)"
  },
  compactConfirmationRouteCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  compactConfirmationRouteValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  compactConfirmationRouteMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  compactConfirmationMetrics: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  compactConfirmationMetric: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  compactConfirmationMetricValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    textAlign: "center"
  },
  compactConfirmationMetricLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  compactConfirmationActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
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
    minHeight: 68,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg
  },
  navItem: {
    flex: 1,
    minWidth: 0,
    maxWidth: 72,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "transparent"
  },
  navItemActive: {
    backgroundColor: controlSurfaces.activeNavigation.backgroundColor,
    borderColor: controlSurfaces.activeNavigation.borderColor,
    boxShadow: shadows.activeControl
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
    backgroundColor: controlSurfaces.secondary.backgroundColor,
    borderWidth: 1,
    borderColor: controlSurfaces.secondary.borderColor
  },
  pickupOptionActive: {
    backgroundColor: controlSurfaces.activeNavigation.backgroundColor,
    borderColor: controlSurfaces.activeNavigation.borderColor,
    boxShadow: shadows.activeControl
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
  notificationToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  notificationClearButton: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.045)",
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.16)"
  },
  notificationClearButtonDisabled: {
    opacity: 0.5
  },
  notificationClearText: {
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  notificationFilterChip: {
    minHeight: 36,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: "rgba(3, 9, 18, 0.34)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)"
  },
  notificationFilterText: {
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
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
  notificationEmptyState: {
    minHeight: 180,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: "rgba(3, 9, 18, 0.36)",
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.12)"
  },
  notificationEmptyIcon: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(199, 183, 255, 0.3)",
    boxShadow: "0 0 32px rgba(99, 102, 241, 0.22)"
  },
  notificationEmptySparkles: {
    position: "absolute",
    top: 50,
    width: 170,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    opacity: 0.72
  },
  notificationEmptyTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    marginTop: spacing.xs
  },
  notificationEmptyMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "700",
    textAlign: "center"
  },
  notificationUndoToast: {
    minHeight: 68,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: "rgba(12, 19, 34, 0.82)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.36)",
    boxShadow: "0 0 28px rgba(139, 92, 246, 0.18)"
  },
  notificationUndoCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xxs
  },
  notificationUndoTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  notificationUndoMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "700"
  },
  notificationUndoButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)"
  },
  notificationUndoText: {
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  activeTripSurface: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor
  },
  tripCompletionSurface: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor
  },
  captainSearchSurface: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor
  },
  captainSearchStatus: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  captainSearchSummary: {
    alignItems: "flex-end",
    gap: 3,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.16)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  captainSearchSummaryRoute: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  captainSearchSummaryMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "800"
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
  captainTrackingSurface: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor
  },
  acceptedCaptainSummary: {
    gap: spacing.sm
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
  captainLiveMetrics: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  captainTripSummary: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  captainTripSummaryItem: {
    minHeight: 46,
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  captainTripSummaryValue: {
    ...rtlText,
    flexShrink: 1,
    color: colors.text,
    fontSize: typography.tiny,
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
    minHeight: touchTargets.minimum,
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
    minWidth: touchTargets.minimum,
    minHeight: touchTargets.minimum,
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
    minHeight: touchTargets.minimum,
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
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor
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
    minHeight: touchTargets.minimum,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor
  },
  searchFilterChipActive: {
    borderColor: controlSurfaces.activeNavigation.borderColor,
    backgroundColor: controlSurfaces.activeNavigation.backgroundColor,
    boxShadow: shadows.activeControl
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
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor
  },
  searchResultRowActive: {
    borderColor: controlSurfaces.activeNavigation.borderColor,
    backgroundColor: controlSurfaces.activeNavigation.backgroundColor,
    boxShadow: shadows.activeControl
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
  destinationSummaryGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  destinationSummaryPill: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.2)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  destinationSummaryText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
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
  tripSummaryPressable: {
    borderRadius: radii.lg
  },
  tripOverviewCard: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor
  },
  tripSummaryBody: {
    alignItems: "flex-end",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  tripSummaryRoute: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  tripSummaryMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  tripSummaryFacts: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  tripSummaryFact: {
    ...rtlText,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  tripOpenHint: {
    ...rtlText,
    alignSelf: "flex-start",
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  tripDetailsBackButton: {
    minHeight: touchTargets.minimum,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor
  },
  tripDetailsBackText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
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
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor
  },
  profileHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  profileIdentityCard: {
    overflow: "hidden",
    minHeight: 118,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.2)",
    backgroundColor: "rgba(7, 11, 20, 0.48)",
    boxShadow: "0 18px 42px rgba(0, 0, 0, 0.22)"
  },
  profileIdentityAvatar: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: "rgba(0, 229, 255, 0.54)",
    backgroundColor: "rgba(139, 92, 246, 0.22)",
    boxShadow: "0 0 26px rgba(0, 229, 255, 0.22)"
  },
  profileIdentityInitial: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900"
  },
  profileVerifiedBadge: {
    position: "absolute",
    right: 2,
    bottom: 3,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
    backgroundColor: colors.blue
  },
  profileIdentityCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xxs
  },
  profileIdentityEyebrow: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  profileCityChip: {
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "900",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)"
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
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor
  },
  profileSpendHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  profileSpendIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(199, 183, 255, 0.38)",
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    boxShadow: "0 0 28px rgba(139, 92, 246, 0.24)"
  },
  profileSpendCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xxs
  },
  profileSpendEyebrow: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  profileSpendLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  profileSpendValue: {
    ...rtlText,
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  profileSpendMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  profilePaymentCard: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: controlSurfaces.secondary.borderColor
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
  profileActionList: {
    gap: spacing.xs
  },
  profileActionRow: {
    minHeight: 64,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  profileActionRowIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(7, 11, 20, 0.42)"
  },
  profileActionRowCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
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
  profileActionText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profileSupportShortcuts: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  profileSupportShortcutText: {
    alignSelf: "flex-end",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "900",
    backgroundColor: "rgba(0, 229, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.14)"
  },
  profileLogoutNotice: {
    minHeight: 48,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: "rgba(51, 231, 168, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.24)"
  },
  profileLogoutNoticeText: {
    ...rtlText,
    flex: 1,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profileLogoutConfirm: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255, 198, 87, 0.28)",
    backgroundColor: "rgba(255, 198, 87, 0.08)"
  },
  profileLogoutConfirmIcon: {
    width: 42,
    height: 42,
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 198, 87, 0.24)",
    backgroundColor: "rgba(255, 198, 87, 0.1)"
  },
  profileLogoutConfirmCopy: {
    alignItems: "flex-end",
    gap: spacing.xxs
  },
  profileLogoutConfirmTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  profileLogoutConfirmMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  profileLogoutConfirmActions: {
    flexDirection: "row-reverse",
    gap: spacing.xs
  },
  profileLogoutCancelButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  profileLogoutCancelText: {
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profileLogoutConfirmButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 89, 120, 0.38)",
    backgroundColor: "rgba(255, 89, 120, 0.12)"
  },
  profileLogoutConfirmButtonText: {
    color: colors.danger,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profileLogoutButton: {
    minHeight: 68,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255, 89, 120, 0.38)",
    backgroundColor: "rgba(255, 89, 120, 0.08)"
  },
  profileLogoutCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xxs
  },
  profileLogoutTitle: {
    ...rtlText,
    color: colors.danger,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profileLogoutMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  supportHubStack: {
    gap: spacing.md
  },
  supportHubCard: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor
  },
  supportBackButton: {
    alignSelf: "flex-end",
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.16)",
    backgroundColor: "rgba(255, 255, 255, 0.045)"
  },
  supportBackText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  supportActionGrid: {
    gap: spacing.sm
  },
  supportActionCard: {
    minHeight: 74,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  supportActionCardActive: {
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.09)",
    boxShadow: shadows.activeControl
  },
  supportActionIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.22)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  supportActionIconActive: {
    borderColor: "rgba(199, 183, 255, 0.34)",
    backgroundColor: "rgba(139, 92, 246, 0.18)"
  },
  supportActionCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  supportActionTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  supportActionMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    lineHeight: 17
  },
  supportApiNote: {
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.2)",
    backgroundColor: "rgba(0, 229, 255, 0.07)"
  },
  supportApiNoteText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  supportSummaryCard: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: controlSurfaces.secondary.borderColor
  },
  supportSummaryRows: {
    gap: spacing.xs
  },
  supportSummaryLine: {
    minHeight: 46,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  supportSummaryLineText: {
    ...rtlText,
    flex: 1,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    lineHeight: 20
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
});
