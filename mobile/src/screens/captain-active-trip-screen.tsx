import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  User,
  Wallet
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useMemo, useReducer, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CaptainRouteMap } from "@/components/captain-route-map";
import { GlassCard } from "@/components/glass-card";
import { PremiumButton } from "@/components/premium-button";
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
import type { CaptainAvailableRequest } from "@/mock/captain-home";
import {
  getCaptainActiveTripView,
  type CaptainActionGuideView,
  type CaptainActiveTripDetailRowKind
} from "@/screens/captain-home/captain-ux-model";
import { useMockRideRequests } from "@/state/mock-app-context";
import {
  captainTripFlowReducer,
  createInitialCaptainTripFlow
} from "@/state/mock-trip-flow";

type CaptainActiveTripScreenProps = {
  onBackToRequests: () => void;
  request: CaptainAvailableRequest;
};

export function CaptainActiveTripScreen({
  onBackToRequests,
  request
}: CaptainActiveTripScreenProps) {
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();
  const [tripFlow, dispatchTripFlow] = useReducer(
    captainTripFlowReducer,
    createInitialCaptainTripFlow()
  );
  const [, dispatchRideRequests] = useMockRideRequests();
  const [notice, setNotice] = useState<string | null>(null);
  const { step: tripStep } = tripFlow;

  const tripView = useMemo(() => getCaptainActiveTripView(tripStep, request), [request, tripStep]);

  function handlePrimaryAction() {
    if (!tripView.primaryAction) {
      return;
    }

    setNotice(null);
    dispatchTripFlow(tripView.primaryAction.nextAction);
    dispatchRideRequests({
      requestId: request.id,
      step: tripView.primaryAction.nextStep,
      type: "update-accepted-trip-step"
    });
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
        testID="captain-active-trip-scroll"
        contentContainerStyle={[
          styles.content,
          {
            alignSelf: "center",
            maxWidth: responsive.contentMaxWidth,
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xxl,
            paddingHorizontal: responsive.horizontalPadding,
            width: "100%"
          }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.statusPill}>
            <Navigation color={colors.cyan} size={16} />
            <Text selectable style={styles.statusPillText}>
              {tripView.hero.status}
            </Text>
          </View>
          <View style={styles.brandCopy}>
            <Text selectable style={styles.brandMeta}>
              تطبيق الكابتن
            </Text>
            <Text selectable style={styles.brandTitle}>
              الرحلة الحالية
            </Text>
          </View>
        </View>

        <GlassCard testID="captain-active-trip-hero" style={styles.heroCard} variant="strong">
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <MapPin color={colors.cyan} size={22} />
            </View>
            <View style={styles.heroCopy}>
              <Text selectable style={styles.heroTitle}>
                {tripView.hero.title}
              </Text>
              <Text selectable style={styles.heroMeta}>
                {tripView.hero.meta}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <ProgressNode active done label="قبول" />
            <View style={styles.progressLine} />
            <ProgressNode
              active={tripStep !== "pickup"}
              done={tripStep !== "pickup"}
              label="وصول"
            />
            <View style={styles.progressLine} />
            <ProgressNode
              active={tripStep === "driving" || tripStep === "completed"}
              done={tripStep === "completed"}
              label="رحلة"
            />
          </View>
        </GlassCard>

        <CaptainTripActionGuide guide={tripView.actionGuide} />

        <CaptainRouteMap request={request} step={tripStep} />

        <GlassCard
          testID="captain-active-trip-customer"
          style={styles.customerCard}
          variant="strong"
        >
          <View style={styles.customerTop}>
            <View style={styles.customerAvatar}>
              <User color={colors.text} size={20} />
            </View>
            <View style={styles.customerCopy}>
              <Text selectable style={styles.customerName}>
                {request.customerName}
              </Text>
              <Text selectable style={styles.customerPhone}>
                {request.customerPhone}
              </Text>
            </View>
            <View style={styles.pricePill}>
              <Text selectable style={styles.priceText}>
                {request.price}
              </Text>
            </View>
          </View>

          <View style={styles.detailsBox}>
            {tripView.detailRows.map((row) => (
              <TripInfoRow
                key={row.kind}
                icon={<TripInfoRowIcon kind={row.kind} />}
                label={row.label}
                value={row.value}
              />
            ))}
          </View>

          <View style={styles.metricsGrid}>
            <TripMetric
              icon={<Clock color={colors.cyan} size={16} />}
              label="الوصول للعميل"
              value={request.etaToPickup}
            />
            <TripMetric
              icon={<Navigation color={colors.violetSoft} size={16} />}
              label="المسافة"
              value={request.distance}
            />
          </View>

          {tripStep !== "completed" ? (
            <CaptainSupportPanel
              onReportIssue={() => setNotice("تم تسجيل مشكلة الرحلة mock")}
              onShareLocation={() => setNotice("تم تجهيز مشاركة موقع الكابتن mock")}
            />
          ) : null}

          {notice ? (
            <View style={styles.noticeBox}>
              <Text
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                selectable
                style={styles.noticeText}
              >
                {notice}
              </Text>
            </View>
          ) : null}

          {tripStep === "completed" ? (
            <View style={styles.completedBox}>
              <CheckCircle color={colors.cyan} size={34} />
              <Text selectable style={styles.completedTitle}>
                {tripView.completedSummary?.title}
              </Text>
              <Text selectable style={styles.completedMeta}>
                {tripView.completedSummary?.meta}
              </Text>
              <PremiumButton
                accessibilityLabel="العودة لقائمة الطلبات"
                label="العودة للطلبات"
                onPress={onBackToRequests}
                style={styles.fullButton}
                variant="secondary"
              />
            </View>
          ) : (
            <View style={styles.actionsRow}>
              <Pressable
                accessibilityLabel="اتصال بالعميل أثناء الرحلة"
                accessibilityRole="button"
                onPress={() => setNotice("زر الاتصال mock فقط الآن")}
                style={styles.iconAction}
              >
                <Phone color={colors.textSoft} size={18} />
              </Pressable>
              <Pressable
                accessibilityLabel="رسالة للعميل أثناء الرحلة"
                accessibilityRole="button"
                onPress={() => setNotice("زر الرسالة mock فقط الآن")}
                style={styles.iconAction}
              >
                <MessageCircle color={colors.textSoft} size={18} />
              </Pressable>
              {tripView.primaryAction ? (
                <PremiumButton
                  accessibilityLabel={tripView.primaryAction.accessibilityLabel}
                  label={tripView.primaryAction.buttonLabel}
                  onPress={handlePrimaryAction}
                  style={styles.primaryButton}
                />
              ) : null}
            </View>
          )}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

function CaptainTripActionGuide({
  guide
}: {
  guide: CaptainActionGuideView;
}) {
  return (
    <GlassCard testID="captain-trip-action-guide" style={styles.actionGuideCard}>
      <View style={styles.actionGuideTop}>
        <View style={styles.actionGuideStepBadge}>
          <Text selectable style={styles.actionGuideStepText}>
            {guide.stepLabel}
          </Text>
        </View>
        <View style={styles.actionGuideCopy}>
          <Text selectable style={styles.actionGuideTitle}>
            {guide.title}
          </Text>
          <Text selectable style={styles.actionGuideMeta}>
            {guide.meta}
          </Text>
        </View>
      </View>

      <View style={styles.actionGuideDetails}>
        <View style={styles.actionGuideDetailBox}>
          <Text selectable style={styles.actionGuideDetailLabel}>
            {guide.detailLabel}
          </Text>
          <Text selectable style={styles.actionGuideDetailValue}>
            {guide.detailValue}
          </Text>
        </View>
        <View style={styles.actionGuideDetailBox}>
          <Text selectable style={styles.actionGuideDetailLabel}>
            {guide.distanceLabel}
          </Text>
          <Text selectable style={styles.actionGuideDetailValue}>
            {guide.distanceValue}
          </Text>
        </View>
      </View>

      <View style={styles.nextActionPill}>
        <Navigation color={colors.cyan} size={16} />
        <Text selectable style={styles.nextActionText}>
          {`الزر التالي: ${guide.nextButtonLabel}`}
        </Text>
      </View>
    </GlassCard>
  );
}

function TripInfoRowIcon({ kind }: { kind: CaptainActiveTripDetailRowKind }) {
  if (kind === "pickup") {
    return <MapPin color={colors.success} size={16} />;
  }

  if (kind === "destination") {
    return <MapPin color={colors.cyan} size={16} />;
  }

  if (kind === "destination-detail") {
    return <Navigation color={colors.violetSoft} size={16} />;
  }

  if (kind === "service") {
    return <Wallet color={colors.cyan} size={16} />;
  }

  return <Wallet color={colors.warning} size={16} />;
}

function CaptainSupportPanel({
  onReportIssue,
  onShareLocation
}: {
  onReportIssue: () => void;
  onShareLocation: () => void;
}) {
  return (
    <View style={styles.supportPanel}>
      <View style={styles.supportHeader}>
        <View style={styles.supportIcon}>
          <ShieldCheck color={colors.success} size={16} />
        </View>
        <View style={styles.supportCopy}>
          <Text selectable style={styles.supportTitle}>
            مركز دعم الكابتن
          </Text>
          <Text selectable style={styles.supportMeta}>
            مشاركة الموقع أو تسجيل مشكلة بدون مغادرة الرحلة
          </Text>
        </View>
      </View>
      <View style={styles.supportActions}>
        <Pressable
          accessibilityLabel="مشاركة موقع الكابتن مع الدعم"
          accessibilityRole="button"
          onPress={onShareLocation}
          style={styles.supportButton}
        >
          <Navigation color={colors.cyan} size={16} />
          <Text selectable style={styles.supportButtonText}>
            مشاركة موقعي
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="تسجيل مشكلة في الرحلة"
          accessibilityRole="button"
          onPress={onReportIssue}
          style={[styles.supportButton, styles.supportButtonWarning]}
        >
          <MessageCircle color={colors.warning} size={16} />
          <Text selectable style={styles.supportButtonText}>
            مشكلة بالرحلة
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ProgressNode({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <View style={styles.progressNodeWrap}>
      <View style={[styles.progressNode, active ? styles.progressNodeActive : null]}>
        {done ? <CheckCircle color={colors.text} size={14} /> : <View style={styles.progressDot} />}
      </View>
      <Text selectable style={[styles.progressLabel, active ? styles.progressLabelActive : null]}>
        {label}
      </Text>
    </View>
  );
}

function TripInfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      {icon}
      <View style={styles.infoCopy}>
        <Text selectable style={styles.infoLabel}>
          {label}
        </Text>
        <Text selectable style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function TripMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <View style={styles.tripMetric}>
      {icon}
      <Text selectable style={styles.tripMetricValue}>
        {value}
      </Text>
      <Text selectable style={styles.tripMetricLabel}>
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
    gap: spacing.md
  },
  header: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  statusPill: {
    minHeight: 40,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  statusPillText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  brandCopy: {
    alignItems: "flex-end",
    gap: 2
  },
  brandMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  brandTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900"
  },
  heroCard: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor,
    boxShadow: glass.strong.shadow
  },
  heroTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md
  },
  heroIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.34)",
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  heroCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  heroTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  heroMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  progressTrack: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs
  },
  progressNodeWrap: {
    alignItems: "center",
    gap: 4
  },
  progressNode: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  progressNodeActive: {
    borderColor: "rgba(0, 229, 255, 0.4)",
    backgroundColor: "rgba(0, 229, 255, 0.16)"
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.textMuted
  },
  progressLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  progressLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  progressLabelActive: {
    color: colors.text
  },
  actionGuideCard: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.22)",
    backgroundColor: "rgba(10, 21, 43, 0.72)",
    boxShadow: glass.strong.shadow
  },
  actionGuideTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  actionGuideStepBadge: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.34)",
    backgroundColor: "rgba(139, 92, 246, 0.14)"
  },
  actionGuideStepText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  actionGuideCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  actionGuideTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  actionGuideMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "800",
    lineHeight: 20
  },
  actionGuideDetails: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  actionGuideDetailBox: {
    flex: 1,
    minHeight: 62,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor,
    boxShadow: shadows.cardSubtle
  },
  actionGuideDetailLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  actionGuideDetailValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  nextActionPill: {
    minHeight: touchTargets.minimum,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.24)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  nextActionText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  customerCard: {
    gap: spacing.md,
    padding: layoutRhythm.cardPadding,
    borderRadius: radii.lg,
    borderColor: glass.strong.borderColor,
    backgroundColor: glass.strong.backgroundColor,
    boxShadow: glass.strong.shadow
  },
  customerTop: {
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
  customerCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4
  },
  customerName: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  customerPhone: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  pricePill: {
    minHeight: 40,
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
  detailsBox: {
    gap: spacing.xs,
    padding: layoutRhythm.denseCardPadding,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: controlSurfaces.secondary.borderColor,
    backgroundColor: controlSurfaces.secondary.backgroundColor,
    boxShadow: shadows.cardSubtle
  },
  infoRow: {
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  infoCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  infoLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  infoValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  metricsGrid: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  tripMetric: {
    flex: 1,
    minHeight: 68,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSoft
  },
  tripMetricValue: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  tripMetricLabel: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  supportPanel: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.18)",
    backgroundColor: "rgba(51, 231, 168, 0.07)"
  },
  supportHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  supportIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(51, 231, 168, 0.24)",
    backgroundColor: "rgba(51, 231, 168, 0.1)"
  },
  supportCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  supportTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  supportMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  supportActions: {
    flexDirection: "row-reverse",
    gap: spacing.sm
  },
  supportButton: {
    flex: 1,
    minHeight: touchTargets.minimum,
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
  supportButtonWarning: {
    borderColor: "rgba(255, 209, 102, 0.22)",
    backgroundColor: "rgba(255, 209, 102, 0.08)"
  },
  supportButtonText: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  noticeBox: {
    alignItems: "flex-end",
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  },
  noticeText: {
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
  primaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.sm
  },
  fullButton: {
    alignSelf: "stretch",
    minHeight: 52,
    borderRadius: radii.sm
  },
  completedBox: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.2)",
    backgroundColor: "rgba(0, 229, 255, 0.08)"
  },
  completedTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  completedMeta: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "800"
  }
});
