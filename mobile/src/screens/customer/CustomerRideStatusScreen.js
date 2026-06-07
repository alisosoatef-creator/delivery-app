import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { V3Badge, V3Button, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useCustomerRideTracking } from "../../hooks/useCustomerRideTracking";
import { useRideRating } from "../../hooks/useRideRating";
import { km, money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Shadows, v3Spacing } from "../../theme/v3";

const statusSteps = [
  ["searching", "بحث"],
  ["accepted", "قبول"],
  ["driver_arriving", "بالطريق"],
  ["arrived", "وصل"],
  ["in_progress", "بدأت"],
  ["completed", "انتهت"]
];

const statusOrder = statusSteps.map(([key]) => key);

function StatusRail({ status }) {
  if (status === "cancelled") {
    return (
      <View style={styles.cancelledRail}>
        <View style={styles.cancelledMark} />
        <V3Text variant="caption" tone="danger" align="center">تم إلغاء الرحلة</V3Text>
      </View>
    );
  }

  const activeIndex = Math.max(statusOrder.indexOf(status), 0);

  return (
    <View style={styles.statusTimeline}>
      {statusSteps.map(([key, label], index) => {
        const active = index <= activeIndex;
        const current = index === activeIndex;
        return (
          <View key={key} style={styles.timelineStep}>
            <View style={[styles.timelineDot, active && styles.timelineDotActive, current && styles.timelineDotCurrent]} />
            <V3Text variant="caption" tone={active ? "soft" : "faint"} align="center" numberOfLines={1}>{label}</V3Text>
          </View>
        );
      })}
    </View>
  );
}

export function CustomerRideStatusScreen() {
  const {
    ride,
    setTrackedRide,
    driverLocation,
    socketStatus,
    status,
    error,
    currentLocation,
    pickupPoint,
    destinationPoint,
    accepted,
    finished,
    searching,
    completed,
    cancelled,
    rideRating,
    summaryTitle,
    liveUnavailable,
    driverLocationTime,
    showCancelAction,
    showRidesAction,
    paymentLabel,
    statusLabel,
    refresh,
    cancel,
    goToRequest,
    goToRides
  } = useCustomerRideTracking();
  const {
    ratingDraft,
    setRatingDraft,
    reviewDraft,
    setReviewDraft,
    ratingStatus,
    ratingError,
    submitRating
  } = useRideRating({ ride, onRideUpdated: setTrackedRide });

  if (!ride) {
    return (
      <V3Screen>
        <V3Card tone="raised" contentStyle={styles.emptyState}>
          <V3Badge label={status === "loading" ? "جاري البحث" : "لا توجد رحلة"} tone={status === "loading" ? "primary" : "blue"} />
          <V3Text variant="subtitle" align="center">
            {status === "loading" ? "جاري البحث عن رحلة نشطة..." : "لا توجد رحلة نشطة الآن"}
          </V3Text>
          <V3Text tone="muted" align="center">
            {error || "يمكنك طلب رحلة جديدة والعودة لهذه الشاشة عند الحاجة."}
          </V3Text>
          <V3Button title="طلب رحلة جديدة" onPress={goToRequest} />
        </V3Card>
      </V3Screen>
    );
  }

  return (
    <V3Screen>
      <V3SectionHeader
        meta={socketStatus === "connected" ? "تتبع مباشر" : "تحديث يدوي"}
        title={finished ? "ملخص الرحلة" : "تتبع الرحلة"}
        subtitle={ride.status === "searching" ? "جاري البحث عن كابتن قريب" : statusLabel(ride.status)}
        actionLabel={!finished ? "تحديث" : undefined}
        onAction={!finished ? refresh : undefined}
      />

      <V3Card tone="raised" style={styles.trackingHero} contentStyle={styles.mapContent}>
        <MobileRideMap
          pickup={pickupPoint}
          destination={destinationPoint}
          driverLocation={accepted ? driverLocation : null}
          userLocation={currentLocation}
          rideStatus={ride.status}
          height={292}
        />
        <View style={styles.livePill}>
          <View style={[styles.liveDot, socketStatus !== "connected" && styles.liveDotOff]} />
          <V3Text variant="caption" tone="soft" numberOfLines={1}>
            {socketStatus === "connected" ? "تتبع مباشر" : "تحديث يدوي"}
          </V3Text>
        </View>
      </V3Card>

      {liveUnavailable ? (
        <V3Card tone="quiet" compact>
          <V3Text selectable tone="muted">التحديث المباشر غير متاح مؤقتا، يمكنك التحديث يدويا.</V3Text>
        </V3Card>
      ) : null}

      <V3Card tone={finished ? "raised" : "accent"} style={styles.statusPanel} contentStyle={styles.statusPanelContent}>
        <View style={styles.statusHeader}>
          <View style={styles.statusCopy}>
            <V3Text variant="subtitle">{summaryTitle}</V3Text>
            <V3Text variant="caption" tone="muted">{`${ride.pickup || "-"} إلى ${ride.destination || "-"}`}</V3Text>
          </View>
          <V3Badge label={money(ride.price || ride.fareIls)} tone="dark" />
        </View>

        <StatusRail status={ride.status} />

        <View style={styles.metrics}>
          <V3Badge label={km(ride.routeDistanceKm || ride.distanceKm)} tone="blue" />
          <V3Badge label={paymentLabel(ride.paymentMethod)} tone="primary" />
          <V3Badge label={statusLabel(ride.status)} tone={cancelled ? "danger" : completed ? "success" : "warning"} />
        </View>
      </V3Card>

      {searching ? (
        <V3Card tone="blue" style={styles.searchingCard} contentStyle={styles.searchingContent}>
          <View style={styles.searchPulseRow}>
            <View style={styles.searchPulse} />
            <View style={[styles.searchPulse, styles.searchPulseMuted]} />
            <View style={styles.searchPulse} />
          </View>
          <V3Text variant="subtitle">جاري البحث عن كابتن قريب...</V3Text>
          <V3Text tone="muted">سنظهر بيانات الكابتن فور قبول الرحلة.</V3Text>
        </V3Card>
      ) : null}

      {accepted ? (
        <V3Card tone="raised" style={styles.driverCard} contentStyle={styles.driverContent}>
          <View style={styles.driverHeader}>
            <View style={styles.avatar}>
              <V3Text variant="label" align="center" style={styles.avatarText}>ك</V3Text>
            </View>
            <View style={styles.driverInfo}>
              <V3Text variant="caption" tone="muted">الكابتن</V3Text>
              <V3Text selectable variant="subtitle" numberOfLines={1}>{ride.driver.fullName}</V3Text>
              <V3Text selectable variant="caption" tone="muted" numberOfLines={1}>
                {ride.driver.vehicleType || ride.driver.vehicle || "مركبة"} · {ride.driver.vehiclePlate || ride.driver.plate || "بدون لوحة"}
              </V3Text>
            </View>
          </View>
          <View style={styles.driverMeta}>
            <V3Badge label={`تقييم ${ride.driver.rating || "5.0"}`} tone="success" />
            <V3Badge label={driverLocation ? "التتبع مباشر" : "بانتظار الموقع"} tone={driverLocation ? "success" : "warning"} />
          </View>
          {driverLocationTime ? <V3Text selectable variant="caption" tone="muted">آخر تحديث للموقع: {driverLocationTime}</V3Text> : null}
          {!driverLocation ? <V3Text selectable variant="caption" tone="muted">بانتظار تفعيل موقع الكابتن المباشر.</V3Text> : null}
        </V3Card>
      ) : !finished ? (
        <V3Text tone="muted">لن تظهر بيانات الكابتن قبل قبول الرحلة.</V3Text>
      ) : null}

      {finished ? (
        <V3Card tone={completed ? "accent" : "raised"} contentStyle={styles.finishedContent}>
          <V3SectionHeader
            title={completed ? "ملخص الرحلة المنتهية" : "ملخص الرحلة الملغية"}
            subtitle={cancelled ? "تم إلغاء الرحلة. يمكنك طلب رحلة جديدة في أي وقت." : "شكرا لاستخدام واصل."}
          />
          <View style={styles.summaryRows}>
            <View style={styles.summaryRow}>
              <V3Text variant="caption" tone="muted">الوجهة</V3Text>
              <V3Text selectable variant="caption" tone="soft" numberOfLines={1}>{ride.destination || "-"}</V3Text>
            </View>
            <View style={styles.summaryRow}>
              <V3Text variant="caption" tone="muted">السعر</V3Text>
              <V3Text selectable variant="caption" tone="soft">{money(ride.price || ride.fareIls)}</V3Text>
            </View>
            <View style={styles.summaryRow}>
              <V3Text variant="caption" tone="muted">الدفع</V3Text>
              <V3Text selectable variant="caption" tone="soft">{paymentLabel(ride.paymentMethod)}</V3Text>
            </View>
            {accepted ? (
              <View style={styles.summaryRow}>
                <V3Text variant="caption" tone="muted">الكابتن</V3Text>
                <V3Text selectable variant="caption" tone="soft" numberOfLines={1}>{ride.driver.fullName || "-"}</V3Text>
              </View>
            ) : null}
          </View>
        </V3Card>
      ) : null}

      {completed ? (
        <V3Card tone="raised" style={styles.ratingCard} contentStyle={styles.ratingContent}>
          <V3SectionHeader title="قيّم الرحلة" subtitle="اختر من 1 إلى 5 نجوم ويمكنك إضافة تعليق اختياري." />
          {rideRating ? (
            <>
              <V3Text selectable variant="subtitle" tone="warning">تقييمك: {"★".repeat(Number(rideRating.rating || rideRating.value || 0))}</V3Text>
              {rideRating.comment || rideRating.review ? <V3Text selectable tone="muted">{rideRating.comment || rideRating.review}</V3Text> : null}
              <V3Badge label="تم حفظ التقييم" tone="success" />
            </>
          ) : (
            <>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    accessibilityRole="button"
                    accessibilityLabel={`تقييم ${star} نجوم`}
                    onPress={() => setRatingDraft(star)}
                    style={[styles.starButton, ratingDraft >= star && styles.starButtonActive]}
                  >
                    <V3Text align="center" style={[styles.starText, ratingDraft >= star && styles.starTextActive]}>★</V3Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={reviewDraft}
                onChangeText={setReviewDraft}
                placeholder="تعليق اختياري عن الرحلة"
                placeholderTextColor={v3Colors.textMuted}
                multiline
                maxLength={500}
                style={styles.reviewInput}
                textAlign="right"
              />
              {ratingError ? <V3Text selectable tone="danger">{ratingError}</V3Text> : null}
              <V3Button title="إرسال التقييم" onPress={submitRating} loading={ratingStatus === "saving"} />
            </>
          )}
        </V3Card>
      ) : null}

      {error ? (
        <V3Card tone="quiet" compact style={styles.errorCard}>
          <V3Text selectable tone="danger">{error}</V3Text>
        </V3Card>
      ) : null}

      <View style={styles.actions}>
        {!finished ? (
          <V3Button title={status === "loading" ? "جاري التحديث..." : "تحديث"} size="sm" fullWidth={false} variant="secondary" onPress={refresh} loading={status === "loading"} />
        ) : null}
        {showCancelAction ? (
          <V3Button title="إلغاء الرحلة" size="sm" fullWidth={false} variant="danger" onPress={cancel} loading={status === "cancel"} />
        ) : null}
        {finished ? (
          <V3Button title="طلب رحلة جديدة" size="sm" fullWidth={false} onPress={goToRequest} />
        ) : null}
        {showRidesAction ? (
          <V3Button title="عرض رحلاتي" size="sm" fullWidth={false} variant="secondary" onPress={goToRides} />
        ) : null}
      </View>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    gap: v3Spacing.md
  },
  trackingHero: {
    borderColor: v3Colors.borderStrong
  },
  mapContent: {
    padding: 0,
    overflow: "hidden"
  },
  livePill: {
    position: "absolute",
    top: v3Spacing.sm,
    left: v3Spacing.sm,
    minHeight: 32,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: v3Spacing.xs,
    paddingHorizontal: v3Spacing.sm,
    borderRadius: v3Radius.pill,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.blackScrim
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: v3Colors.success,
    boxShadow: "0 0 14px rgba(69, 224, 164, 0.48)"
  },
  liveDotOff: {
    backgroundColor: v3Colors.warning,
    boxShadow: "0 0 14px rgba(248, 199, 109, 0.38)"
  },
  statusPanel: {
    borderColor: v3Colors.borderStrong
  },
  statusPanelContent: {
    gap: v3Spacing.md
  },
  statusHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.sm
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  statusTimeline: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: v3Spacing.xs,
    padding: v3Spacing.sm,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.blackScrim
  },
  timelineStep: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: v3Spacing.xs
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Colors.graphite
  },
  timelineDotActive: {
    backgroundColor: v3Colors.purple,
    borderColor: v3Colors.purpleLight
  },
  timelineDotCurrent: {
    width: 15,
    height: 15,
    borderRadius: 8,
    boxShadow: v3Shadows.purple
  },
  cancelledRail: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: v3Spacing.xs,
    padding: v3Spacing.sm,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 97, 116, 0.32)",
    backgroundColor: "rgba(255, 97, 116, 0.1)"
  },
  cancelledMark: {
    width: 24,
    height: 4,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.danger
  },
  metrics: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  },
  searchingCard: {
    borderColor: v3Colors.borderBlue
  },
  searchingContent: {
    alignItems: "flex-end",
    gap: v3Spacing.sm
  },
  searchPulseRow: {
    alignSelf: "stretch",
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: v3Spacing.xs,
    paddingVertical: v3Spacing.xs
  },
  searchPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: v3Colors.electricBlue,
    boxShadow: v3Shadows.blue
  },
  searchPulseMuted: {
    opacity: 0.38
  },
  driverCard: {
    borderColor: v3Colors.borderBlue
  },
  driverContent: {
    gap: v3Spacing.md
  },
  driverHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: v3Spacing.sm
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: v3Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: v3Alpha.blueWash,
    borderWidth: 1,
    borderColor: v3Colors.borderBlue
  },
  avatarText: {
    color: v3Colors.electricBlue
  },
  driverInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  driverMeta: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  },
  finishedContent: {
    gap: v3Spacing.md
  },
  summaryRows: {
    gap: v3Spacing.xs
  },
  summaryRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.sm,
    padding: v3Spacing.sm,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.whiteSoft
  },
  ratingCard: {
    borderColor: "rgba(248, 199, 109, 0.32)"
  },
  ratingContent: {
    gap: v3Spacing.md
  },
  starsRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: v3Spacing.xs
  },
  starButton: {
    width: 44,
    height: 44,
    borderRadius: v3Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.whiteSoft
  },
  starButtonActive: {
    borderColor: "rgba(248, 199, 109, 0.52)",
    backgroundColor: "rgba(248, 199, 109, 0.16)",
    boxShadow: "0 18px 42px rgba(248, 199, 109, 0.16)"
  },
  starText: {
    color: v3Colors.textFaint,
    fontSize: 22,
    lineHeight: 26
  },
  starTextActive: {
    color: v3Colors.warning
  },
  reviewInput: {
    minHeight: 88,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Colors.input,
    color: v3Colors.text,
    padding: v3Spacing.md,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    textAlignVertical: "top",
    writingDirection: "rtl"
  },
  errorCard: {
    borderColor: "rgba(255, 97, 116, 0.42)"
  },
  actions: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  }
});
