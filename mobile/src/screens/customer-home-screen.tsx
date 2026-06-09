import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  Car,
  CheckCircle,
  ChevronLeft,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  XCircle
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import { MockRouteMap } from "@/components/mock-route-map";
import { PremiumButton } from "@/components/premium-button";
import { colors, gradients, radii, spacing, typography } from "@/design/tokens";
import { customerHomeMock } from "@/mock/customer-home";

type RideStage = "idle" | "searching" | "captain" | "active" | "completed";
type DestinationPlace = (typeof customerHomeMock.savedPlaces)[number];
type PaymentMethod = (typeof customerHomeMock.paymentMethods)[number];

export function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDestination, setSelectedDestination] = useState<DestinationPlace | null>(null);
  const [activeNav, setActiveNav] = useState<string>(customerHomeMock.navItems[0].label);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [rideStage, setRideStage] = useState<RideStage>("idle");
  const [rating, setRating] = useState<number | null>(null);
  const [destinationDetail, setDestinationDetail] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(customerHomeMock.defaultPaymentMethod);
  const [showConfirmation, setShowConfirmation] = useState(false);

  function resetRide() {
    setRideStage("idle");
    setRequestStatus(null);
    setRating(null);
    setShowConfirmation(false);
  }

  function selectDestination(place: DestinationPlace) {
    setSelectedDestination(place);
    setDestinationDetail(place.detail);
    setShowConfirmation(false);
    setRequestStatus(null);
    setNotice(null);
    resetRide();
  }

  function requestTrip() {
    if (!selectedDestination) {
      setNotice("اختر وجهتك قبل تأكيد الطلب");
      setShowConfirmation(false);
      return;
    }

    setNotice(null);
    setRequestStatus(null);
    setRideStage("idle");
    setShowConfirmation(true);
  }

  function confirmTrip() {
    setRequestStatus("تم تأكيد طلبك التجريبي");
    setRideStage("searching");
    setRating(null);
    setNotice(null);
    setShowConfirmation(false);
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
          <InfoRow label="المسافة" value={selectedDestination.distance} />
          <InfoRow label="السعر التقديري" value={selectedDestination.price} />
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
    if (rideStage === "idle") {
      return null;
    }

    if (rideStage === "searching") {
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
          <View style={styles.searchRings}>
            <View style={[styles.ring, styles.ringLarge]} />
            <View style={[styles.ring, styles.ringMedium]} />
            <View style={styles.searchCore}>
              <Car color={colors.text} size={20} />
            </View>
          </View>
          <View style={styles.stageActions}>
            <PremiumButton
              accessibilityLabel="إلغاء البحث"
              label="إلغاء البحث"
              onPress={resetRide}
              style={styles.secondaryButton}
              variant="secondary"
            >
              <XCircle color={colors.textMuted} size={16} />
            </PremiumButton>
            <PremiumButton
              accessibilityLabel="عرض الكابتن التجريبي"
              label="عرض الكابتن"
              onPress={() => setRideStage("captain")}
              style={styles.stagePrimaryButton}
            />
          </View>
        </GlassCard>
      );
    }

    if (rideStage === "captain") {
      return (
        <GlassCard style={styles.stageCard}>
          <View style={styles.captainRow}>
            <View style={styles.captainAvatar}>
              <Text style={styles.captainInitial}>أ</Text>
            </View>
            <View style={styles.stageCopy}>
              <Text style={styles.stageTitle}>أحمد محمد</Text>
              <Text style={styles.stageMeta}>تويوتا كامري • أبيض • 1234</Text>
            </View>
            <View style={styles.ratingPill}>
              <Star color={colors.warning} fill={colors.warning} size={14} />
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>
          <View style={styles.captainStats}>
            <View style={styles.miniMetric}>
              <Clock color={colors.cyan} size={16} />
              <Text style={styles.metricValue}>3 د</Text>
              <Text style={styles.metricLabel}>وصول</Text>
            </View>
            <View style={styles.miniMetric}>
              <Car color={colors.violetSoft} size={16} />
              <Text style={styles.metricValue}>{customerHomeMock.service.price}</Text>
              <Text style={styles.metricLabel}>السعر</Text>
            </View>
          </View>
          <View style={styles.stageActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="اتصال بالكابتن" style={styles.iconAction}>
              <Phone color={colors.textSoft} size={18} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="رسالة للكابتن" style={styles.iconAction}>
              <MessageCircle color={colors.textSoft} size={18} />
            </Pressable>
            <PremiumButton
              accessibilityLabel="بدء الرحلة التجريبية"
              label="بدء الرحلة"
              onPress={() => setRideStage("active")}
              style={styles.stagePrimaryButton}
            />
          </View>
        </GlassCard>
      );
    }

    if (rideStage === "active") {
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
            onPress={() => setRideStage("completed")}
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
              onPress={() => setRating(star)}
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
        <PremiumButton
          accessibilityLabel="رحلة جديدة"
          label="رحلة جديدة"
          onPress={resetRide}
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

        <View style={styles.heroCopy}>
          <Text selectable style={styles.greeting}>
            {customerHomeMock.greeting}
          </Text>
          <Text selectable style={styles.subtitle}>
            {customerHomeMock.subtitle}
          </Text>
        </View>

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
              {customerHomeMock.suggestedFare}
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
            <Text style={styles.tripPrice}>{selectedDestination?.price ?? customerHomeMock.service.price}</Text>
          </View>
          <View style={styles.tripCopy}>
            <Text style={styles.tripLabel}>{customerHomeMock.service.label}</Text>
            <Text style={styles.tripMeta}>{customerHomeMock.service.meta}</Text>
            <Text style={styles.tripMeta}>
              {selectedDestination ? `${selectedDestination.distance} • ${customerHomeMock.service.eta}` : customerHomeMock.service.eta}
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
              `الطلب المحدد: ${customerHomeMock.service.label} • ${customerHomeMock.service.price}`}
          </Text>
          {requestStatus ? (
            <Text style={styles.feedbackMeta}>
              {`الطلب المحدد: ${customerHomeMock.service.label} • ${selectedDestination?.price ?? customerHomeMock.service.price}`}
            </Text>
          ) : null}
          {selectedDestination ? (
            <>
              <Text style={styles.feedbackMeta}>{`الوجهة المختارة: ${selectedDestination.label}`}</Text>
              <Text style={styles.feedbackMeta}>{`${customerHomeMock.pickup} ← ${selectedDestination.area}`}</Text>
            </>
          ) : null}
        </GlassCard>
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
              accessibilityRole="tab"
              accessibilityState={{ selected: activeNav === item.label }}
              hitSlop={8}
              onPress={() => setActiveNav(item.label)}
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
  paymentGroup: {
    gap: spacing.xs
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
    height: 128,
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
