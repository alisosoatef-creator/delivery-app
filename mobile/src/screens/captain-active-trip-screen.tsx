import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, Clock, MapPin, MessageCircle, Navigation, Phone, User, Wallet } from "lucide-react-native";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import { MockRouteMap } from "@/components/mock-route-map";
import { PremiumButton } from "@/components/premium-button";
import { colors, gradients, radii, spacing, typography } from "@/design/tokens";
import type { CaptainAvailableRequest } from "@/mock/captain-home";

type CaptainTripStep = "pickup" | "arrived" | "driving" | "completed";

type CaptainActiveTripScreenProps = {
  onBackToRequests: () => void;
  request: CaptainAvailableRequest;
};

export function CaptainActiveTripScreen({ onBackToRequests, request }: CaptainActiveTripScreenProps) {
  const insets = useSafeAreaInsets();
  const [tripStep, setTripStep] = useState<CaptainTripStep>("pickup");
  const [notice, setNotice] = useState<string | null>(null);

  const stepCopy = useMemo(() => {
    if (tripStep === "arrived") {
      return {
        label: "تم الوصول للعميل",
        meta: "العميل جاهز، ابدأ الرحلة عند الصعود",
        buttonLabel: "ابدأ الرحلة الآن",
        accessibilityLabel: "بدء الرحلة التجريبية",
        nextStep: "driving" as const
      };
    }

    if (tripStep === "driving") {
      return {
        label: "العميل في الطريق",
        meta: "تابع المسار إلى الوجهة النهائية",
        buttonLabel: "إنهاء الرحلة",
        accessibilityLabel: "إنهاء الرحلة التجريبية",
        nextStep: "completed" as const
      };
    }

    return {
      label: "الطريق إلى العميل",
      meta: "اتجه إلى نقطة الانطلاق واستعد لتأكيد الوصول",
      buttonLabel: "وصلت للعميل",
      accessibilityLabel: "تأكيد الوصول للعميل",
      nextStep: "arrived" as const
    };
  }, [tripStep]);

  function handlePrimaryAction() {
    setNotice(null);
    setTripStep(stepCopy.nextStep);
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
            paddingBottom: insets.bottom + spacing.xxl
          }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.statusPill}>
            <Navigation color={colors.cyan} size={16} />
            <Text selectable style={styles.statusPillText}>
              {tripStep === "completed" ? "مكتملة" : "نشطة"}
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

        <GlassCard style={styles.heroCard} variant="strong">
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <MapPin color={colors.cyan} size={22} />
            </View>
            <View style={styles.heroCopy}>
              <Text selectable style={styles.heroTitle}>
                {tripStep === "completed" ? "تم إنهاء الرحلة" : stepCopy.label}
              </Text>
              <Text selectable style={styles.heroMeta}>
                {tripStep === "completed" ? "تم تسجيل الرحلة ضمن بيانات mock لهذه المرحلة" : stepCopy.meta}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <ProgressNode active done label="قبول" />
            <View style={styles.progressLine} />
            <ProgressNode active={tripStep !== "pickup"} done={tripStep !== "pickup"} label="وصول" />
            <View style={styles.progressLine} />
            <ProgressNode active={tripStep === "driving" || tripStep === "completed"} done={tripStep === "completed"} label="رحلة" />
          </View>
        </GlassCard>

        <MockRouteMap />

        <GlassCard style={styles.customerCard} variant="strong">
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
            <TripInfoRow icon={<MapPin color={colors.success} size={16} />} label="نقطة الانطلاق" value={request.pickup} />
            <TripInfoRow icon={<MapPin color={colors.cyan} size={16} />} label="منطقة الوجهة" value={request.destinationArea} />
            <TripInfoRow icon={<Navigation color={colors.violetSoft} size={16} />} label="تفصيل الوجهة" value={request.destinationDetail} />
            <TripInfoRow icon={<Wallet color={colors.warning} size={16} />} label="الدفع" value={request.paymentMethod} />
          </View>

          <View style={styles.metricsGrid}>
            <TripMetric icon={<Clock color={colors.cyan} size={16} />} label="الوصول للعميل" value={request.etaToPickup} />
            <TripMetric icon={<Navigation color={colors.violetSoft} size={16} />} label="المسافة" value={request.distance} />
          </View>

          {notice ? (
            <View style={styles.noticeBox}>
              <Text selectable style={styles.noticeText}>
                {notice}
              </Text>
            </View>
          ) : null}

          {tripStep === "completed" ? (
            <View style={styles.completedBox}>
              <CheckCircle color={colors.cyan} size={34} />
              <Text selectable style={styles.completedTitle}>
                أرباح الرحلة جاهزة
              </Text>
              <Text selectable style={styles.completedMeta}>
                {`${request.price} تمت إضافتها للأرباح mock`}
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
              <PremiumButton
                accessibilityLabel={stepCopy.accessibilityLabel}
                label={stepCopy.buttonLabel}
                onPress={handlePrimaryAction}
                style={styles.primaryButton}
              />
            </View>
          )}
        </GlassCard>
      </ScrollView>
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
    gap: spacing.md,
    paddingHorizontal: spacing.lg
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
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.3)"
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
  customerCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg
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
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(147, 177, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.04)"
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
