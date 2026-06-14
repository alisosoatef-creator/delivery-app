import { LinearGradient } from "expo-linear-gradient";
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
  ShieldCheck,
  Sparkles,
  Star,
  User,
  XCircle
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useReducer, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import { MockRouteMap } from "@/components/mock-route-map";
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
type PaymentMethod = (typeof customerHomeMock.paymentMethods)[number];
type RideOption = (typeof customerHomeMock.rideOptions)[number];

type CustomerHomeScreenProps = {
  onPreviewCaptainRequests?: () => void;
};

type CustomerTripsLiveRide = {
  activeStatus: string;
  captain: string;
  destinationDetail: string;
  isCompleted: boolean;
  payment: string;
  price: string;
  route: string;
  serviceLabel: string;
  time: string;
};

const LIVE_CUSTOMER_REQUEST_ID = "request-live-customer";

function mapAcceptedTripStepToCustomerStage(step: CaptainTripStep | null): CustomerTripStage {
  if (step === "driving") {
    return "active";
  }

  if (step === "completed") {
    return "completed";
  }

  return "captain";
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

function mapAcceptedTripStepToCaptainStatus(step: CaptainTripStep | null): string {
  if (step === "arrived") {
    return "الكابتن وصل إليك";
  }

  return customerHomeMock.captain.status;
}

export function CustomerHomeScreen({ onPreviewCaptainRequests }: CustomerHomeScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const [selectedDestination, setSelectedDestination] = useState<DestinationPlace | null>(null);
  const [activeNav, setActiveNav] = useState<string>(customerHomeMock.navItems[0].label);
  const [tripFlow, dispatchTripFlow] = useReducer(customerTripFlowReducer, createInitialCustomerTripFlow());
  const [rideRequests, dispatchRideRequests] = useMockRideRequests();
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [completionNote, setCompletionNote] = useState<string>("");
  const [destinationDetail, setDestinationDetail] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(customerHomeMock.defaultPaymentMethod);
  const [selectedRideOption, setSelectedRideOption] = useState<RideOption>(customerHomeMock.rideOptions[0]);
  const { showConfirmation, stage: rideStage } = tripFlow;
  const acceptedCustomerRequest =
    rideRequests.acceptedRequest?.id === LIVE_CUSTOMER_REQUEST_ID ? rideRequests.acceptedRequest : null;
  const effectiveRideStage =
    acceptedCustomerRequest && rideStage !== "idle"
      ? mapAcceptedTripStepToCustomerStage(rideRequests.acceptedTripStep)
      : rideStage;
  const liveCustomerTrip: CustomerTripsLiveRide | null = acceptedCustomerRequest
    ? {
        activeStatus: mapAcceptedTripStepToTripsStatus(rideRequests.acceptedTripStep),
        captain: customerHomeMock.captain.name,
        destinationDetail: acceptedCustomerRequest.destinationDetail,
        isCompleted: rideRequests.acceptedTripStep === "completed",
        payment: acceptedCustomerRequest.paymentMethod,
        price: acceptedCustomerRequest.price,
        route: `${acceptedCustomerRequest.pickup} ← ${acceptedCustomerRequest.destinationArea}`,
        serviceLabel: acceptedCustomerRequest.serviceLabel,
        time: rideRequests.acceptedTripStep === "completed" ? "اكتملت الآن" : "نشطة الآن",
      }
    : null;
  const latestRealtimeEvent = getLatestMockRealtimeEvent(rideRequests.realtime, "customer");
  const realtimeConnectionSummary = getMockRealtimeConnectionSummary(rideRequests.realtime, "customer");
  const recentRealtimeEvents = getRecentMockRealtimeEvents(rideRequests.realtime, "customer", 4);

  function resetRide() {
    dispatchTripFlow({ type: "reset" });
    setRequestStatus(null);
    setRating(null);
    setCompletionNote("");
  }

  function startNewTrip() {
    dispatchRideRequests({ type: "reset-requests" });
    resetRide();
    setSelectedDestination(null);
    setDestinationDetail("");
    setPaymentMethod(customerHomeMock.defaultPaymentMethod);
    setSelectedRideOption(customerHomeMock.rideOptions[0]);
    setNotice(null);
  }

  function selectDestination(place: DestinationPlace) {
    setSelectedDestination(place);
    setDestinationDetail(place.detail);
    setRequestStatus(null);
    setNotice(null);
    resetRide();
  }

  function requestTrip() {
    if (!selectedDestination) {
      setNotice("اختر وجهتك قبل تأكيد الطلب");
      dispatchTripFlow({ type: "reset" });
      return;
    }

    setNotice(null);
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
      destinationDetail,
      distance: selectedDestination.distance,
      etaToPickup: customerHomeMock.captain.arrivalEta,
      id: LIVE_CUSTOMER_REQUEST_ID,
      paymentMethod,
      pickup: customerHomeMock.pickup,
      price: selectedRideOption.price,
      serviceLabel: selectedRideOption.label,
    };

    dispatchRideRequests({ request, type: "submit-customer-request" });
    setRequestStatus("تم تأكيد طلبك التجريبي");
    dispatchTripFlow({ type: "confirm-request" });
    setRating(null);
    setNotice(null);
  }

  function cancelSearch() {
    resetRide();
    setNotice("تم إلغاء البحث عن كابتن");
  }

  function submitCustomerFeedback(nextRating: number | null, nextNote: string) {
    if (!acceptedCustomerRequest || effectiveRideStage !== "completed" || !nextRating) {
      return;
    }

    dispatchRideRequests({
      feedback: {
        note: nextNote.trim(),
        rating: nextRating,
        requestId: acceptedCustomerRequest.id,
      },
      type: "submit-customer-feedback",
    });
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

        <View style={styles.confirmationRows}>
          <InfoRow label="نقطة الانطلاق" value={customerHomeMock.pickup} />
          <InfoRow label="منطقة الوجهة" value={selectedDestination.area} />
          <InfoRow label="تفصيل الوجهة" value={destinationDetail} />
          <InfoRow label="نوع الرحلة" value={selectedRideOption.label} />
          <InfoRow label="المسافة" value={selectedDestination.distance} />
          <InfoRow label="السعر التقديري" value={selectedRideOption.price} />
          <InfoRow label="طريقة الدفع" value={paymentMethod} />
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
                  {`${customerHomeMock.pickup} ← ${selectedDestination.area} • ${destinationDetail}`}
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
                <InfoRow label="نقطة الانطلاق" value={customerHomeMock.pickup} />
                <InfoRow label="منطقة الوجهة" value={selectedDestination.area} />
                <InfoRow label="تفصيل الوجهة" value={destinationDetail} />
                <InfoRow label="نوع الرحلة" value={selectedRideOption.label} />
                <InfoRow label="السعر" value={selectedRideOption.price} />
                <InfoRow label="طريقة الدفع" value={paymentMethod} />
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
              <Text style={styles.metricValue}>{selectedRideOption.price}</Text>
              <Text style={styles.metricLabel}>السعر</Text>
            </View>
          </View>

          <View style={styles.captainDetailsGrid}>
            <InfoRow label="رقم الكابتن" value={captain.phone} />
            <InfoRow label="نقطة الانطلاق" value={customerHomeMock.pickup} />
            {selectedDestination ? <InfoRow label="منطقة الوجهة" value={selectedDestination.area} /> : null}
            {selectedDestination ? <InfoRow label="تفصيل الوجهة" value={destinationDetail} /> : null}
          </View>

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
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={`تقييم ${star} نجوم`}
              hitSlop={8}
              onPress={() => {
                setRating(star);
                submitCustomerFeedback(star, completionNote);
              }}
            >
              <Star
                color={colors.cyan}
                fill={rating && rating >= star ? colors.cyan : "transparent"}
                size={28}
              />
            </Pressable>
          ))}
        </View>
        {rating ? <Text style={styles.feedbackText}>{`تقييمك: ${rating} نجوم`}</Text> : null}
        <View style={styles.detailField}>
          <Text selectable style={styles.detailLabel}>
            ملاحظة الرحلة
          </Text>
          <TextInput
            accessibilityLabel="ملاحظة الرحلة"
            multiline
            onChangeText={(note) => {
              setCompletionNote(note);
              submitCustomerFeedback(rating, note);
            }}
            placeholder="اكتب ملاحظة اختيارية"
            placeholderTextColor={colors.textMuted}
            style={[styles.detailInput, styles.completionNoteInput]}
            value={completionNote}
          />
        </View>
        {completionNote.trim() ? (
          <Text style={styles.feedbackText}>{`ملاحظتك: ${completionNote.trim()}`}</Text>
        ) : null}
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
            onPress={() => setNotice("لا توجد تنبيهات جديدة الآن")}
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
                : customerHomeMock.greeting}
          </Text>
          <Text selectable style={styles.subtitle}>
            {activeNav === "رحلاتي"
              ? "تابع رحلتك الحالية وسجل رحلاتك السابقة"
              : activeNav === "حسابي"
                ? "بياناتك الأساسية وتجربة الدفع mock"
                : customerHomeMock.subtitle}
          </Text>
        </View>

        {activeNav === "رحلاتي" ? (
          <CustomerTripsTab liveTrip={liveCustomerTrip} />
        ) : activeNav === "حسابي" ? (
          <CustomerProfileTab />
        ) : (
          <>
            {activeNav === "البحث" ? <CustomerSearchTabIntro /> : null}

            <MockRouteMap />

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
                <Text style={styles.searchLabel}>{customerHomeMock.pickupDetail}</Text>
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
              {selectedRideOption.price}
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

            <View style={styles.rideOptionsGroup}>
              <Text selectable style={styles.detailLabel}>
                اختر نوع الرحلة
              </Text>
              <View style={styles.rideOptionsList}>
                {customerHomeMock.rideOptions.map((option) => {
                  const isSelected = selectedRideOption.label === option.label;

                  return (
                    <Pressable
                      key={option.label}
                      accessibilityLabel={`اختيار ${option.label}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setSelectedRideOption(option)}
                      style={({ pressed }) => [
                        styles.rideOption,
                        isSelected ? styles.rideOptionActive : null,
                        pressed ? styles.pressed : null
                      ]}
                    >
                      <View style={styles.rideOptionPriceBox}>
                        <Text selectable style={styles.rideOptionPrice}>
                          {option.price}
                        </Text>
                        <Text selectable style={styles.rideOptionEta}>
                          {option.eta}
                        </Text>
                      </View>
                      <View style={styles.rideOptionCopy}>
                        <View style={styles.rideOptionTitleRow}>
                          <View style={[styles.rideOptionBadge, isSelected ? styles.rideOptionBadgeActive : null]}>
                            <Text selectable style={styles.rideOptionBadgeText}>
                              {option.badge}
                            </Text>
                          </View>
                          <Text selectable style={styles.rideOptionLabel}>
                            {option.label}
                          </Text>
                        </View>
                        <Text selectable style={styles.rideOptionMeta}>
                          {option.meta}
                        </Text>
                      </View>
                      {isSelected ? <CheckCircle color={colors.cyan} size={18} /> : null}
                    </Pressable>
                  );
                })}
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
                    onPress={() => setPaymentMethod(method)}
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
            <Text style={styles.tripPrice}>{selectedRideOption.price}</Text>
          </View>
          <View style={styles.tripCopy}>
            <Text style={styles.tripLabel}>{selectedRideOption.label}</Text>
            <Text style={styles.tripMeta}>{selectedRideOption.meta}</Text>
            <Text style={styles.tripMeta}>
              {selectedDestination ? `${selectedDestination.distance} • ${selectedRideOption.eta}` : selectedRideOption.eta}
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

        <GlassCard style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>
            {requestStatus ??
              `الطلب المحدد: ${selectedRideOption.label} • ${selectedRideOption.price}`}
          </Text>
          {requestStatus ? (
            <Text style={styles.feedbackMeta}>
              {`الطلب المحدد: ${selectedRideOption.label} • ${selectedRideOption.price}`}
            </Text>
          ) : null}
          {selectedDestination ? (
            <>
              <Text style={styles.feedbackMeta}>{`الوجهة المختارة: ${selectedDestination.label}`}</Text>
              <Text style={styles.feedbackMeta}>{`${customerHomeMock.pickup} ← ${selectedDestination.area}`}</Text>
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

function CustomerSearchTabIntro() {
  return (
    <GlassCard style={styles.tabIntroCard} variant="strong">
      <View style={styles.tabHeader}>
        <View style={styles.tabIcon}>
          <MapPin color={colors.cyan} size={22} />
        </View>
        <View style={styles.tabCopy}>
          <Text selectable style={styles.tabTitle}>
            {customerHomeMock.searchTab.title}
          </Text>
          <Text selectable style={styles.tabMeta}>
            {customerHomeMock.searchTab.subtitle}
          </Text>
          <Text selectable style={styles.tabMeta}>
            {customerHomeMock.searchTab.hint}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

function CustomerTripsTab({ liveTrip }: { liveTrip: CustomerTripsLiveRide | null }) {
  const trips = customerHomeMock.trips;
  const currentTrip = liveTrip ?? trips.current;
  const activeStatus = liveTrip?.activeStatus ?? trips.activeStatus;
  const historyTrips = liveTrip?.isCompleted
    ? [
        {
          id: "live-completed-trip",
          date: "الآن",
          destination: liveTrip.destinationDetail,
          price: liveTrip.price,
          status: "مكتملة",
        },
        ...trips.history,
      ]
    : trips.history;

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
          {liveTrip ? <InfoRow label="نوع الرحلة" value={liveTrip.serviceLabel} /> : null}
          <InfoRow label="الكابتن" value={currentTrip.captain} />
          <InfoRow label="السعر" value={currentTrip.price} />
          <InfoRow label="الدفع" value={currentTrip.payment} />
          <InfoRow label="الوقت" value={currentTrip.time} />
        </View>
      </GlassCard>

      <View style={styles.sectionHeader}>
        <Text selectable style={styles.sectionTitle}>
          {trips.historyTitle}
        </Text>
      </View>

      <View style={styles.historyList}>
        {historyTrips.map((trip) => (
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

function CustomerProfileTab() {
  const profile = customerHomeMock.profile;

  return (
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

      <View style={styles.profileRows}>
        <ProfileRow icon={<Phone color={colors.cyan} size={16} />} label="رقم الجوال" value={profile.phone} />
        <ProfileRow icon={<MapPin color={colors.success} size={16} />} label="المنطقة" value={profile.homeArea} />
        <ProfileRow icon={<CreditCard color={colors.violetSoft} size={16} />} label="طريقة الدفع" value={profile.defaultPayment} />
        <ProfileRow icon={<Star color={colors.warning} fill={colors.warning} size={16} />} label="تقييمك" value={profile.rating} />
      </View>
    </GlassCard>
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
  completionNoteInput: {
    minHeight: 82,
    textAlignVertical: "top"
  },
  paymentGroup: {
    gap: spacing.xs
  },
  rideOptionsGroup: {
    gap: spacing.xs
  },
  rideOptionsList: {
    gap: spacing.xs
  },
  rideOption: {
    minHeight: 72,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  rideOptionActive: {
    borderColor: "rgba(0, 229, 255, 0.46)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  rideOptionCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  rideOptionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs
  },
  rideOptionLabel: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  rideOptionMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  rideOptionPriceBox: {
    minWidth: 78,
    alignItems: "flex-end",
    gap: 3
  },
  rideOptionPrice: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  rideOptionEta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  rideOptionBadge: {
    minHeight: 24,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(139, 92, 246, 0.14)"
  },
  rideOptionBadgeActive: {
    backgroundColor: "rgba(0, 229, 255, 0.16)"
  },
  rideOptionBadgeText: {
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
  confirmationCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.3)"
  },
  confirmationRows: {
    gap: spacing.xs
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
  previewCaptainButton: {
    alignSelf: "stretch",
    minHeight: 44,
    marginTop: spacing.xs,
    borderRadius: radii.sm
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
  captainDetailsGrid: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.04)"
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
  starsRow: {
    flexDirection: "row",
    alignSelf: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs
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
  historyList: {
    gap: spacing.sm
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
  profileRows: {
    gap: spacing.xs
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
