import { LinearGradient } from "expo-linear-gradient";
import { Car, CheckCircle, ClipboardList, Clock, Home, MapPin, Phone, Power, Route, Star, User, Wallet, XCircle } from "lucide-react-native";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import { PremiumButton } from "@/components/premium-button";
import { RealtimeActivityFeed, RealtimeStatusCard } from "@/components/realtime-status-card";
import { colors, gradients, radii, spacing, typography } from "@/design/tokens";
import { captainHomeMock, type CaptainAvailableRequest } from "@/mock/captain-home";
import {
  getLatestMockRealtimeEvent,
  getMockRealtimeConnectionSummary,
  getRecentMockRealtimeEvents
} from "@/realtime/mock-realtime";
import { CaptainActiveTripScreen } from "@/screens/captain-active-trip-screen";
import { useMockRideRequests } from "@/state/mock-app-context";
import type { CustomerRideFeedback } from "@/state/mock-ride-requests";

const captainTabs = [
  { key: "home", label: "الرئيسية", icon: Home },
  { key: "requests", label: "الطلبات", icon: ClipboardList },
  { key: "earnings", label: "الأرباح", icon: Wallet },
  { key: "profile", label: "حسابي", icon: User }
] as const;

type CaptainTab = (typeof captainTabs)[number]["key"];

export function CaptainHomeScreen() {
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeRequest, setActiveRequest] = useState<CaptainAvailableRequest | null>(null);
  const [previewRequest, setPreviewRequest] = useState<CaptainAvailableRequest | null>(null);
  const [activeTab, setActiveTab] = useState<CaptainTab>("home");
  const [rideRequests, dispatchRideRequests] = useMockRideRequests();
  const request = rideRequests.availableRequests[0];
  const captainRatingDisplay = createCaptainRatingDisplay(rideRequests.customerFeedback);
  const latestRealtimeEvent = getLatestMockRealtimeEvent(rideRequests.realtime, "captain");
  const realtimeConnectionSummary = getMockRealtimeConnectionSummary(rideRequests.realtime, "captain");
  const recentRealtimeEvents = getRecentMockRealtimeEvents(rideRequests.realtime, "captain", 4);

  if (activeRequest) {
    return (
      <CaptainActiveTripScreen
        request={activeRequest}
        onBackToRequests={() => {
          dispatchRideRequests({ type: "clear-accepted-request" });
          setActiveRequest(null);
          setNotice(null);
          setActiveTab("requests");
        }}
      />
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
            accessibilityLabel="تغيير حالة الكابتن"
            accessibilityRole="button"
            onPress={() => setIsOnline((value) => !value)}
            style={({ pressed }) => [styles.statusToggle, isOnline ? styles.statusOnline : styles.statusOffline, pressed ? styles.pressed : null]}
          >
            <Power color={isOnline ? colors.success : colors.textMuted} size={18} />
            <Text selectable style={styles.statusText}>
              {isOnline ? captainHomeMock.onlineLabel : captainHomeMock.offlineLabel}
            </Text>
          </Pressable>

          <View style={styles.brandLockup}>
            <View style={styles.brandCopy}>
              <Text selectable style={styles.brandName}>
                واصل
              </Text>
              <Text selectable style={styles.brandMeta}>
                {captainHomeMock.appLabel}
              </Text>
            </View>
            <LinearGradient colors={gradients.primary} style={styles.logoMark}>
              <Text selectable style={styles.logoLetter}>
                W
              </Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <Text selectable style={styles.greeting}>
            {activeTab === "earnings"
              ? "ملخص الدخل"
              : activeTab === "profile"
                ? "ملف التشغيل"
                : captainHomeMock.greeting}
          </Text>
          <Text selectable style={styles.subtitle}>
            {activeTab === "earnings"
              ? "ملخص دخل الكابتن بدون ربط API"
              : activeTab === "profile"
                ? "بيانات تشغيلية mock للكابتن"
                : "الطلبات القريبة تظهر هنا بدون ربط API"}
          </Text>
        </View>

        {notice ? (
          <GlassCard style={styles.noticeCard} variant="subtle">
            <Text selectable style={styles.noticeText}>
              {notice}
            </Text>
          </GlassCard>
        ) : null}

        {latestRealtimeEvent ? (
          <RealtimeStatusCard event={latestRealtimeEvent} summary={realtimeConnectionSummary} />
        ) : null}
        <RealtimeActivityFeed events={recentRealtimeEvents} />

        {activeTab === "earnings" ? (
          <CaptainEarningsTab
            completedRequests={rideRequests.completedRequests}
            ratingDisplay={captainRatingDisplay}
            onReview={() => setNotice("مراجعة الأداء اليومي mock فقط الآن")}
            onWithdraw={() => setNotice(captainHomeMock.earnings.withdrawNotice)}
          />
        ) : activeTab === "profile" ? (
          <CaptainProfileTab
            customerFeedback={rideRequests.customerFeedback}
            onUpdateProfile={() => setNotice("تحديث بيانات الكابتن mock فقط الآن")}
          />
        ) : (
          <>
            <CaptainOperationsPanel isOnline={isOnline} requestCount={rideRequests.availableRequests.length} />

            <View style={styles.metricsRow}>
              <MetricCard icon={<Wallet color={colors.cyan} size={18} />} label="أرباح اليوم" value={captainHomeMock.metrics.earningsToday} />
              <MetricCard icon={<Route color={colors.violetSoft} size={18} />} label="رحلات اليوم" value={captainHomeMock.metrics.tripsToday} />
              <MetricCard icon={<Star color={colors.warning} fill={colors.warning} size={18} />} label="تقييمك" value={captainRatingDisplay} />
            </View>

            <View style={styles.sectionHeader}>
              <Text selectable style={styles.sectionTitle}>
                الطلبات المتاحة
              </Text>
              <Text selectable style={styles.sectionMeta}>
                طلب واحد مطابق قريب منك
              </Text>
            </View>

            {previewRequest ? (
              <CaptainAcceptPreviewCard
                request={previewRequest}
                onCancel={() => setPreviewRequest(null)}
                onConfirm={() => {
                  setNotice(null);
                  dispatchRideRequests({ requestId: previewRequest.id, type: "accept-request" });
                  setActiveRequest(previewRequest);
                  setPreviewRequest(null);
                }}
              />
            ) : null}

            {request ? (
              <GlassCard style={styles.requestCard} variant="strong">
                <View style={styles.requestTop}>
                  <View style={styles.customerAvatar}>
                    <User color={colors.text} size={20} />
                  </View>
                  <View style={styles.requestCopy}>
                    <Text selectable style={styles.requestTitle}>
                      {request.customerName}
                    </Text>
                    <Text selectable style={styles.requestMeta}>
                      {request.customerPhone}
                    </Text>
                  </View>
                  <View style={styles.pricePill}>
                    <Text selectable style={styles.priceText}>
                      {request.price}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeBox}>
                  <RouteRow icon={<MapPin color={colors.success} size={16} />} label="نقطة الانطلاق" value={request.pickup} />
                  <RouteRow icon={<MapPin color={colors.cyan} size={16} />} label="منطقة الوجهة" value={request.destinationArea} />
                  <RouteRow icon={<Car color={colors.violetSoft} size={16} />} label="تفصيل الوجهة" value={request.destinationDetail} />
                  <RouteRow icon={<Star color={colors.warning} fill={colors.warning} size={16} />} label="نوع الرحلة" value={request.serviceLabel} />
                  <RouteRow icon={<Clock color={colors.warning} size={16} />} label="الوصول للعميل" value={request.etaToPickup} />
                </View>

                <View style={styles.requestMetaGrid}>
                  <MiniInfo label="المسافة" value={request.distance} />
                  <MiniInfo label="الدفع" value={request.paymentMethod} />
                </View>

                <Pressable
                  accessibilityLabel="معاينة قبول الطلب التجريبي"
                  accessibilityRole="button"
                  onPress={() => setPreviewRequest(request)}
                  style={({ pressed }) => [styles.acceptPreviewTrigger, pressed ? styles.pressed : null]}
                >
                  <View style={styles.previewTriggerIcon}>
                    <ClipboardList color={colors.cyan} size={18} />
                  </View>
                  <View style={styles.previewTriggerCopy}>
                    <Text selectable style={styles.previewTriggerTitle}>
                      معاينة الطلب الذكية
                    </Text>
                    <Text selectable style={styles.previewTriggerMeta}>
                      راجع المسار والدخل قبل بدء الرحلة
                    </Text>
                  </View>
                </Pressable>

                <View style={styles.actionsRow}>
                  <Pressable
                    accessibilityLabel="اتصال بالعميل"
                    accessibilityRole="button"
                    onPress={() => setNotice("زر الاتصال بالعميل mock فقط الآن")}
                    style={styles.iconAction}
                  >
                    <Phone color={colors.textSoft} size={18} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="رفض الطلب التجريبي"
                    accessibilityRole="button"
                    onPress={() => {
                      dispatchRideRequests({ requestId: request.id, type: "decline-request" });
                      setPreviewRequest(null);
                      setNotice("تم رفض الطلب التجريبي");
                    }}
                    style={({ pressed }) => [styles.declineButton, pressed ? styles.pressed : null]}
                  >
                    <XCircle color={colors.textSoft} size={17} />
                    <Text selectable style={styles.declineButtonText}>
                      رفض
                    </Text>
                  </Pressable>
                  <PremiumButton
                    accessibilityLabel="قبول الطلب التجريبي"
                    label="قبول الطلب"
                    onPress={() => {
                      setNotice(null);
                      dispatchRideRequests({ requestId: request.id, type: "accept-request" });
                      setActiveRequest(request);
                    }}
                    style={styles.acceptButton}
                  >
                    <CheckCircle color={colors.text} size={18} />
                  </PremiumButton>
                </View>
              </GlassCard>
            ) : (
              <GlassCard style={styles.requestCard} variant="subtle">
                <Text selectable style={styles.sectionTitle}>
                  لا توجد طلبات متاحة الآن
                </Text>
                <Text selectable style={styles.sectionMeta}>
                  ستظهر طلبات العملاء هنا عند تأكيدها من التطبيق
                </Text>
              </GlassCard>
            )}
          </>
        )}
      </ScrollView>
      <GlassCard
        testID="captain-bottom-nav"
        style={[
          styles.bottomNav,
          {
            bottom: insets.bottom + spacing.md
          }
        ]}
      >
        {captainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              accessibilityLabel={`فتح تبويب ${tab.label}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              hitSlop={8}
              onPress={() => {
                setNotice(null);
                setActiveTab(tab.key);
              }}
              style={({ pressed }) => [
                styles.navItem,
                isActive ? styles.navItemActive : null,
                pressed ? styles.navItemPressed : null
              ]}
            >
              <Icon color={isActive ? colors.text : colors.textMuted} size={18} />
              <Text selectable style={[styles.navLabel, isActive ? styles.navLabelActive : null]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </GlassCard>
    </View>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <GlassCard style={styles.metricCard}>
      {icon}
      <Text selectable style={styles.metricValue}>
        {value}
      </Text>
      <Text selectable style={styles.metricLabel}>
        {label}
      </Text>
    </GlassCard>
  );
}

function CaptainOperationsPanel({ isOnline, requestCount }: { isOnline: boolean; requestCount: number }) {
  return (
    <GlassCard style={styles.operationsCard} variant="strong">
      <View style={styles.operationsHeader}>
        <View style={styles.operationsIcon}>
          <Power color={isOnline ? colors.success : colors.textMuted} size={20} />
        </View>
        <View style={styles.operationsCopy}>
          <Text selectable style={styles.operationsTitle}>
            مركز تشغيل الكابتن
          </Text>
          <Text selectable style={styles.operationsStatus}>
            {isOnline ? "جاهز لاستقبال الطلبات" : "متوقف مؤقتًا"}
          </Text>
        </View>
      </View>

      <View style={styles.operationsGrid}>
        <View style={styles.operationMetric}>
          <Text selectable style={styles.operationMetricText}>
            {`طلبات قريبة الآن: ${requestCount}`}
          </Text>
        </View>
        <View style={styles.operationMetric}>
          <Text selectable style={styles.operationMetricText}>
            قوة المطابقة: 96%
          </Text>
        </View>
        <View style={styles.operationMetric}>
          <Text selectable style={styles.operationMetricText}>
            وقت الاستجابة المتوقع: أقل من دقيقة
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

function CaptainAcceptPreviewCard({
  onCancel,
  onConfirm,
  request
}: {
  onCancel: () => void;
  onConfirm: () => void;
  request: CaptainAvailableRequest;
}) {
  return (
    <GlassCard style={styles.acceptPreviewCard} variant="strong">
      <View style={styles.acceptPreviewHeader}>
        <View style={styles.acceptPreviewIcon}>
          <CheckCircle color={colors.cyan} size={20} />
        </View>
        <View style={styles.acceptPreviewCopy}>
          <Text selectable style={styles.acceptPreviewTitle}>
            تفاصيل الطلب قبل القبول
          </Text>
          <Text selectable style={styles.acceptPreviewMeta}>
            تأكد من المسار والدخل قبل تحويل الطلب إلى رحلة نشطة
          </Text>
        </View>
      </View>

      <View style={styles.previewRows}>
        <PreviewRow label="العميل المحدد" value={request.customerName} />
        <PreviewRow label="المسار المقترح" value={`${request.pickup} ← ${request.destinationArea}`} />
        <PreviewRow label="الدخل المتوقع" value={request.price} />
        <PreviewRow label="جاهز للانطلاق" value={`الوصول خلال ${request.etaToPickup}`} />
      </View>

      <View style={styles.previewActions}>
        <PremiumButton accessibilityLabel="تأكيد قبول الطلب" label="تأكيد قبول الطلب" onPress={onConfirm} style={styles.previewConfirmButton}>
          <CheckCircle color={colors.text} size={18} />
        </PremiumButton>
        <Pressable accessibilityLabel="إلغاء معاينة قبول الطلب" accessibilityRole="button" onPress={onCancel} style={styles.previewCancelButton}>
          <Text selectable style={styles.previewCancelText}>
            إلغاء
          </Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewRow}>
      <Text selectable style={styles.previewRowValue}>
        {value}
      </Text>
      <Text selectable style={styles.previewRowLabel}>
        {label}
      </Text>
    </View>
  );
}

function RouteRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <View style={styles.routeRow}>
      {icon}
      <View style={styles.routeCopy}>
        <Text selectable style={styles.routeLabel}>
          {label}
        </Text>
        <Text selectable style={styles.routeValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniInfo}>
      <Text selectable style={styles.miniValue}>
        {value}
      </Text>
      <Text selectable style={styles.miniLabel}>
        {label}
      </Text>
    </View>
  );
}

function CaptainEarningsCommandCenter({
  averageTrip,
  dailyGoalProgress,
  onReview,
  withdrawableBalance
}: {
  averageTrip: string;
  dailyGoalProgress: string;
  onReview: () => void;
  withdrawableBalance: string;
}) {
  return (
    <View style={styles.earningsCommandPanel}>
      <View style={styles.earningsCommandHeader}>
        <View style={styles.earningsCommandIcon}>
          <Wallet color={colors.cyan} size={20} />
        </View>
        <View style={styles.earningsCommandCopy}>
          <Text selectable style={styles.earningsCommandTitle}>
            مركز أرباح الكابتن
          </Text>
          <Text selectable style={styles.earningsCommandMeta}>
            قراءة سريعة لدخل اليوم قبل السحب
          </Text>
        </View>
      </View>

      <View style={styles.earningsCommandGrid}>
        <View style={styles.earningsCommandMetric}>
          <Text selectable style={styles.earningsCommandValue}>
            صافي اليوم
          </Text>
          <Text selectable style={styles.earningsCommandLabel}>
            هدف اليوم: {dailyGoalProgress}
          </Text>
        </View>
        <View style={styles.earningsCommandMetric}>
          <Text selectable style={styles.earningsCommandValue}>
            رصيد قابل للسحب
          </Text>
          <Text selectable style={styles.earningsCommandLabel}>
            {withdrawableBalance}
          </Text>
        </View>
      </View>

      <View style={styles.earningsInsightList}>
        <Text selectable style={styles.earningsInsightText}>
          متوسط الرحلة: {averageTrip}
        </Text>
        <Text selectable style={styles.earningsInsightText}>
          أفضل فترة: 6 م - 9 م
        </Text>
      </View>

      <Pressable accessibilityLabel="مراجعة الأداء اليومي" accessibilityRole="button" onPress={onReview} style={({ pressed }) => [styles.earningsReviewButton, pressed ? styles.pressed : null]}>
        <Text selectable style={styles.earningsReviewText}>
          مراجعة الأداء اليومي
        </Text>
      </Pressable>
    </View>
  );
}

function CaptainEarningsTab({
  completedRequests,
  onReview,
  ratingDisplay,
  onWithdraw
}: {
  completedRequests: CaptainAvailableRequest[];
  onReview: () => void;
  ratingDisplay: string;
  onWithdraw: () => void;
}) {
  const earnings = captainHomeMock.earnings;
  const earningsSummary = createCaptainEarningsSummary(completedRequests);
  const earningsTotal = parseDisplayNumber(earningsSummary.todayTotal);
  const completedTrips = parseDisplayNumber(earningsSummary.completedTrips);
  const averageTrip = `${Math.round(earningsTotal / Math.max(completedTrips, 1))} شيكل`;
  const dailyGoalProgress = `${Math.min(Math.round((earningsTotal / 800) * 100), 100)}%`;

  return (
    <GlassCard style={styles.earningsCard} variant="strong">
      <View style={styles.earningsHeader}>
        <View style={styles.earningsIcon}>
          <Wallet color={colors.cyan} size={22} />
        </View>
        <View style={styles.earningsCopy}>
          <Text selectable style={styles.earningsTitle}>
            {earnings.title}
          </Text>
          <Text selectable style={styles.earningsMeta}>
            {earnings.todayLabel}
          </Text>
        </View>
      </View>

      <CaptainEarningsCommandCenter
        averageTrip={averageTrip}
        dailyGoalProgress={dailyGoalProgress}
        onReview={onReview}
        withdrawableBalance={earnings.lastPayout}
      />

      <View style={styles.earningsTotalBox}>
        <Text selectable style={styles.earningsTotal}>
          {earningsSummary.todayTotal}
        </Text>
        <Text selectable style={styles.earningsMeta}>
          {earningsSummary.completedTrips}
        </Text>
      </View>

      <View style={styles.earningsGrid}>
        <MiniInfo label={earnings.lastPayoutLabel} value={earnings.lastPayout} />
        <MiniInfo label="التقييم" value={ratingDisplay} />
      </View>

      {completedRequests.length > 0 ? (
        <View style={styles.completedEarningsBox}>
          <Text selectable style={styles.weeklyTitle}>
            رحلات مكتملة من التطبيق
          </Text>
          {completedRequests.map((completedRequest) => (
            <View key={completedRequest.id} style={styles.completedEarningRow}>
              <View style={styles.completedEarningPrice}>
                <Text selectable style={styles.completedEarningPriceText}>
                  {completedRequest.price}
                </Text>
                <Text selectable style={styles.completedEarningMeta}>
                  أجرة الرحلة
                </Text>
              </View>
              <View style={styles.completedEarningCopy}>
                <Text selectable style={styles.completedEarningTitle}>
                  {completedRequest.customerName}
                </Text>
                <Text selectable style={styles.completedEarningMeta}>
                  {completedRequest.destinationDetail}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.weeklyBox}>
        <Text selectable style={styles.weeklyTitle}>
          {earnings.weeklyLabel}
        </Text>
        <View style={styles.barChart}>
          {earnings.weeklyBars.map((bar, index) => (
            <View key={`${bar}-${index}`} style={styles.barColumn}>
              <View style={[styles.barFill, { height: Number(bar) }]} />
              <Text selectable style={styles.barLabel}>
                {index + 1}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <PremiumButton
        accessibilityLabel="سحب أرباح تجريبي"
        label={earnings.withdrawLabel}
        onPress={onWithdraw}
        style={styles.withdrawButton}
      />
    </GlassCard>
  );
}

function createCaptainEarningsSummary(completedRequests: CaptainAvailableRequest[]) {
  const baseTotal = parseDisplayNumber(captainHomeMock.earnings.todayTotal);
  const baseTrips = parseDisplayNumber(captainHomeMock.earnings.completedTrips);
  const completedTotal = completedRequests.reduce((total, request) => total + parseDisplayNumber(request.price), 0);

  return {
    todayTotal: `${baseTotal + completedTotal} شيكل`,
    completedTrips: `${baseTrips + completedRequests.length} رحلة مكتملة`
  };
}

function parseDisplayNumber(value: string) {
  return Number(value.match(/\d+(?:\.\d+)?/)?.[0] ?? 0);
}

function createCaptainRatingDisplay(customerFeedback: CustomerRideFeedback | null) {
  return customerFeedback ? customerFeedback.rating.toFixed(1) : captainHomeMock.metrics.rating;
}

function CaptainProfileReadinessPanel({ onUpdateProfile }: { onUpdateProfile: () => void }) {
  return (
    <View style={styles.profileReadinessPanel}>
      <View style={styles.profileReadinessHeader}>
        <View style={styles.profileReadinessIcon}>
          <CheckCircle color={colors.success} size={20} />
        </View>
        <View style={styles.profileReadinessCopy}>
          <Text selectable style={styles.profileReadinessTitle}>
            مركز ملف الكابتن
          </Text>
          <Text selectable style={styles.profileReadinessMeta}>
            جاهزية الحساب
          </Text>
        </View>
      </View>

      <View style={styles.profileReadinessGrid}>
        <View style={styles.profileReadinessMetric}>
          <Text selectable style={styles.profileReadinessValue}>
            موثق للتشغيل
          </Text>
          <Text selectable style={styles.profileReadinessLabel}>
            الهوية والرخصة
          </Text>
        </View>
        <View style={styles.profileReadinessMetric}>
          <Text selectable style={styles.profileReadinessValue}>
            مستوى الخدمة: ممتاز
          </Text>
          <Text selectable style={styles.profileReadinessLabel}>
            بناءً على التقييمات
          </Text>
        </View>
      </View>

      <View style={styles.profileReadinessList}>
        <Text selectable style={styles.profileReadinessText}>
          فحص المركبة: مكتمل
        </Text>
        <Text selectable style={styles.profileReadinessText}>
          تأمين الرحلات: فعال
        </Text>
      </View>

      <Pressable accessibilityLabel="تحديث بيانات الكابتن" accessibilityRole="button" onPress={onUpdateProfile} style={({ pressed }) => [styles.profileUpdateButton, pressed ? styles.pressed : null]}>
        <Text selectable style={styles.profileUpdateText}>
          تحديث بيانات الكابتن
        </Text>
      </Pressable>
    </View>
  );
}

function CaptainProfileTab({
  customerFeedback,
  onUpdateProfile
}: {
  customerFeedback: CustomerRideFeedback | null;
  onUpdateProfile: () => void;
}) {
  const profile = captainHomeMock.profile;

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
            {profile.status}
          </Text>
        </View>
      </View>

      <CaptainProfileReadinessPanel onUpdateProfile={onUpdateProfile} />

      <View style={styles.profileRows}>
        <ProfileRow label="رقم الجوال" value={profile.phone} />
        <ProfileRow label="المركبة" value={profile.vehicle} />
        <ProfileRow label="رقم اللوحة" value={profile.plate} />
        <ProfileRow label="أرباح اليوم" value={captainHomeMock.metrics.earningsToday} />
      </View>

      {customerFeedback ? (
        <View style={styles.customerFeedbackBox}>
          <Text selectable style={styles.customerFeedbackLabel}>
            آخر تقييم من العميل
          </Text>
          <Text selectable style={styles.customerFeedbackScore}>
            {`${customerFeedback.rating} نجوم`}
          </Text>
          {customerFeedback.note ? (
            <Text selectable style={styles.customerFeedbackNote}>
              {customerFeedback.note}
            </Text>
          ) : null}
        </View>
      ) : null}
    </GlassCard>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileRow}>
      <Text selectable style={styles.profileRowValue}>
        {value}
      </Text>
      <Text selectable style={styles.profileRowLabel}>
        {label}
      </Text>
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
    justifyContent: "space-between",
    gap: spacing.md
  },
  statusToggle: {
    minHeight: 44,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1
  },
  statusOnline: {
    borderColor: "rgba(51, 231, 168, 0.32)",
    backgroundColor: "rgba(51, 231, 168, 0.12)"
  },
  statusOffline: {
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  statusText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
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
    fontWeight: "900"
  },
  brandMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
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
    fontWeight: "900"
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
    fontWeight: "900"
  },
  subtitle: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.body,
    fontWeight: "700"
  },
  noticeCard: {
    padding: spacing.md,
    alignItems: "flex-end"
  },
  noticeText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  operationsCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.24)"
  },
  operationsHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  operationsIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.3)",
    backgroundColor: "rgba(51, 231, 168, 0.1)"
  },
  operationsCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  operationsTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  operationsStatus: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  operationsGrid: {
    gap: spacing.xs
  },
  operationMetric: {
    minHeight: 38,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  operationMetricText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  metricsRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  metricCard: {
    flex: 1,
    minHeight: 106,
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: spacing.md
  },
  metricValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  metricLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  sectionHeader: {
    alignItems: "flex-end",
    gap: 2,
    paddingTop: spacing.xs
  },
  sectionTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  sectionMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  requestCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.28)"
  },
  requestTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  customerAvatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  requestCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  requestTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  requestMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  pricePill: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  priceText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  routeBox: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  routeRow: {
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  routeCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  routeLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  routeValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  requestMetaGrid: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  acceptPreviewTrigger: {
    minHeight: 62,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  previewTriggerIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  previewTriggerCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  previewTriggerTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  previewTriggerMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  acceptPreviewCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(139, 92, 246, 0.32)",
    backgroundColor: "rgba(18, 34, 58, 0.78)"
  },
  acceptPreviewHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  acceptPreviewIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  acceptPreviewCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  acceptPreviewTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  acceptPreviewMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  previewRows: {
    gap: spacing.xs
  },
  previewRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  previewRowLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  previewRowValue: {
    ...rtlText,
    flex: 1,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  previewActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  previewConfirmButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: radii.sm
  },
  previewCancelButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  previewCancelText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  miniInfo: {
    flex: 1,
    minHeight: 58,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSoft
  },
  miniValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  miniLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  earningsCommandPanel: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.07)"
  },
  earningsCommandHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  earningsCommandIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  earningsCommandCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  earningsCommandTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  earningsCommandMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  earningsCommandGrid: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  earningsCommandMetric: {
    flex: 1,
    minHeight: 68,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  earningsCommandValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  earningsCommandLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800",
    fontVariant: ["tabular-nums"]
  },
  earningsInsightList: {
    gap: spacing.xs
  },
  earningsInsightText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  earningsReviewButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.32)",
    backgroundColor: "rgba(139, 92, 246, 0.14)"
  },
  earningsReviewText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  actionsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  iconAction: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft
  },
  acceptButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.sm
  },
  declineButton: {
    minHeight: 52,
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
  declineButtonText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }]
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
    fontWeight: "800"
  },
  navLabelActive: {
    color: colors.text
  },
  earningsCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.3)"
  },
  earningsHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  earningsIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.32)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  earningsCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  earningsTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  earningsMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  earningsTotalBox: {
    alignItems: "flex-end",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.22)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  earningsTotal: {
    ...rtlText,
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  earningsGrid: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  completedEarningsBox: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.24)",
    backgroundColor: "rgba(139, 92, 246, 0.08)"
  },
  completedEarningRow: {
    minHeight: 64,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  completedEarningCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  completedEarningTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  completedEarningMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  completedEarningPrice: {
    minWidth: 82,
    alignItems: "flex-end",
    gap: 3
  },
  completedEarningPriceText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  weeklyBox: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  weeklyTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  barChart: {
    height: 150,
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.xs
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6
  },
  barFill: {
    width: "100%",
    maxWidth: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
    boxShadow: "0 0 14px rgba(0, 229, 255, 0.52)"
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    fontVariant: ["tabular-nums"]
  },
  withdrawButton: {
    minHeight: 52,
    borderRadius: radii.sm
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
  profileReadinessPanel: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.24)",
    backgroundColor: "rgba(51, 231, 168, 0.07)"
  },
  profileReadinessHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  profileReadinessIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.3)",
    backgroundColor: "rgba(51, 231, 168, 0.12)"
  },
  profileReadinessCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  profileReadinessTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  profileReadinessMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  profileReadinessGrid: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  profileReadinessMetric: {
    flex: 1,
    minHeight: 68,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  profileReadinessValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profileReadinessLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  profileReadinessList: {
    gap: spacing.xs
  },
  profileReadinessText: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profileUpdateButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  profileUpdateText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  profileRows: {
    gap: spacing.xs
  },
  customerFeedbackBox: {
    alignItems: "flex-end",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  customerFeedbackLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  customerFeedbackScore: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  customerFeedbackNote: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  },
  profileRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  profileRowLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  profileRowValue: {
    ...rtlText,
    flex: 1,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  }
});
