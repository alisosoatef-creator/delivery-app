import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { EmptyState, InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, StatusTimeline } from "../../components/ui";
import { useCustomerRideTracking } from "../../hooks/useCustomerRideTracking";
import { useRideRating } from "../../hooks/useRideRating";
import { colors, depth, km, money, radii, shadows, spacing } from "../../utils/mobileTheme";

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
      <ScreenContainer showHeader={false}>
        <EmptyState
          title={status === "loading" ? "جاري البحث عن رحلة نشطة..." : "لا توجد رحلة نشطة الآن"}
          message={error || "يمكنك طلب رحلة جديدة والعودة لهذه الشاشة عند الحاجة."}
          actionTitle="طلب رحلة جديدة"
          onAction={goToRequest}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer showHeader={false} compact>
      <MobileCard tone="command" style={styles.statusCommand}>
        <View>
          <Text selectable style={styles.title}>{finished ? "ملخص الرحلة" : "تتبع الرحلة"}</Text>
          <Text selectable style={styles.subtitle}>{ride.status === "searching" ? "جاري البحث عن كابتن قريب" : statusLabel(ride.status)}</Text>
        </View>
        <View style={styles.commandMeta}>
          <MobileBadge label={socketStatus === "connected" ? "مباشر" : "يدوي"} tone={socketStatus === "connected" ? "success" : "warning"} />
          <Text selectable style={styles.commandPrice}>{money(ride.price || ride.fareIls)}</Text>
        </View>
      </MobileCard>

      <View style={styles.trackingHero}>
        <MobileRideMap
          pickup={pickupPoint}
          destination={destinationPoint}
          driverLocation={accepted ? driverLocation : null}
          userLocation={currentLocation}
          rideStatus={ride.status}
          height={278}
        />
        <View style={styles.livePill}>
          <View style={[styles.liveDot, socketStatus !== "connected" && styles.liveDotOff]} />
          <Text selectable style={styles.liveText}>{socketStatus === "connected" ? "تتبع مباشر" : "تحديث يدوي"}</Text>
        </View>
      </View>
      {liveUnavailable ? (
        <Text selectable style={styles.mapNotice}>التحديث المباشر غير متاح مؤقتًا، يمكنك التحديث يدويًا.</Text>
      ) : null}

      {searching ? (
        <MobileCard tone="hero" style={styles.searchingCard}>
          <View style={styles.scanVisual}>
            <View style={styles.scanDot} />
            <View style={[styles.scanDot, styles.scanDotMuted]} />
            <View style={styles.scanDot} />
          </View>
          <Text selectable style={styles.searchingTitle}>جاري البحث عن كابتن قريب...</Text>
          <Text selectable style={styles.muted}>سنظهر بيانات الكابتن فور قبول الرحلة.</Text>
        </MobileCard>
      ) : null}

      <MobileCard tone={finished ? "flat" : "glass"} style={styles.customerStatusSummary}>
        <View style={styles.rowBetween}>
          <Text selectable style={styles.statusTitle}>{summaryTitle}</Text>
          <Text selectable style={styles.price}>{money(ride.price || ride.fareIls)}</Text>
        </View>
        <StatusTimeline status={ride.status} />
        <InfoRow label="المسار" value={`${ride.pickup} ← ${ride.destination}`} accent />
        <InfoRow label="المسافة" value={km(ride.routeDistanceKm || ride.distanceKm)} />
        <InfoRow label="الدفع" value={paymentLabel(ride.paymentMethod)} />
      </MobileCard>

      {accepted ? (
        <MobileCard tone="command" style={styles.driverCard}>
          <View style={styles.driverHeader}>
            <View style={styles.avatar}>
              <Text selectable={false} style={styles.avatarText}>ك</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text selectable style={styles.cardTitle}>الكابتن</Text>
              <Text selectable style={styles.driverName}>{ride.driver.fullName}</Text>
              <Text selectable style={styles.muted}>{ride.driver.vehicleType || ride.driver.vehicle || "مركبة"} · {ride.driver.vehiclePlate || ride.driver.plate || "بدون لوحة"}</Text>
            </View>
          </View>
          <View style={styles.driverMeta}>
            <MobileBadge label={`تقييم ${ride.driver.rating || "5.0"}`} tone="success" />
            <MobileBadge label={driverLocation ? "التتبع مباشر" : "بانتظار الموقع"} tone={driverLocation ? "success" : "warning"} />
          </View>
          {driverLocationTime ? <Text selectable style={styles.muted}>آخر تحديث للموقع: {driverLocationTime}</Text> : null}
          {!driverLocation ? <Text selectable style={styles.muted}>بانتظار تفعيل موقع الكابتن المباشر.</Text> : null}
        </MobileCard>
      ) : !finished ? (
        <Text selectable style={styles.muted}>لن تظهر بيانات الكابتن قبل قبول الرحلة.</Text>
      ) : null}

      {finished ? (
        <MobileCard tone={completed ? "hero" : "flat"} style={styles.finishedCard}>
          <Text selectable style={styles.statusTitle}>{completed ? "ملخص الرحلة المنتهية" : "ملخص الرحلة الملغية"}</Text>
          <InfoRow label="الوجهة" value={ride.destination || "-"} accent />
          <InfoRow label="السعر" value={money(ride.price || ride.fareIls)} />
          <InfoRow label="الدفع" value={paymentLabel(ride.paymentMethod)} />
          {accepted ? <InfoRow label="الكابتن" value={ride.driver.fullName || "-"} /> : null}
          {cancelled ? <Text selectable style={styles.muted}>تم إلغاء الرحلة. يمكنك طلب رحلة جديدة في أي وقت.</Text> : null}
        </MobileCard>
      ) : null}
      {completed ? (
        <MobileCard tone="flat" style={styles.ratingCard}>
          <Text selectable style={styles.statusTitle}>قيّم الرحلة</Text>
          {rideRating ? (
            <>
              <Text selectable style={styles.savedRating}>تقييمك: {"★".repeat(Number(rideRating.rating || rideRating.value || 0))}</Text>
              {rideRating.comment || rideRating.review ? <Text selectable style={styles.muted}>{rideRating.comment || rideRating.review}</Text> : null}
              <MobileBadge label="تم حفظ التقييم" tone="success" />
            </>
          ) : (
            <>
              <Text selectable style={styles.muted}>اختر من 1 إلى 5 نجوم، ويمكنك إضافة تعليق اختياري.</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    accessibilityRole="button"
                    accessibilityLabel={`تقييم ${star} نجوم`}
                    onPress={() => setRatingDraft(star)}
                    style={[styles.starButton, ratingDraft >= star && styles.starButtonActive]}
                  >
                    <Text selectable={false} style={[styles.starText, ratingDraft >= star && styles.starTextActive]}>★</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={reviewDraft}
                onChangeText={setReviewDraft}
                placeholder="تعليق اختياري عن الرحلة"
                placeholderTextColor={colors.muted}
                multiline
                maxLength={500}
                style={styles.reviewInput}
                textAlign="right"
              />
              {ratingError ? <Text selectable style={styles.error}>{ratingError}</Text> : null}
              <MobileButton title="إرسال التقييم" variant="accent" onPress={submitRating} loading={ratingStatus === "saving"} />
            </>
          )}
        </MobileCard>
      ) : null}
      {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        {!finished ? <MobileButton title={status === "loading" ? "جاري التحديث..." : "تحديث"} compact variant="secondary" onPress={refresh} loading={status === "loading"} /> : null}
        {showCancelAction ? <MobileButton title="إلغاء الرحلة" compact variant="danger" onPress={cancel} loading={status === "cancel"} /> : null}
        {finished ? <MobileButton title="طلب رحلة جديدة" compact variant="accent" onPress={goToRequest} /> : null}
        {showRidesAction ? <MobileButton title="عرض رحلاتي" compact variant="secondary" onPress={goToRides} /> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  statusCommand: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderColor: depth.violetLine
  },
  commandMeta: { alignItems: "flex-start", gap: spacing.xs },
  commandPrice: { color: colors.primary, fontSize: 22, fontWeight: "900", textAlign: "left" },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.primary, fontSize: 13, textAlign: "right", marginTop: 2, fontWeight: "800" },
  trackingHero: { borderRadius: radii.xxl, borderWidth: 1, borderColor: depth.violetLine, overflow: "hidden", boxShadow: shadows.glow },
  livePill: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: "rgba(2, 6, 10, 0.72)",
    borderWidth: 1,
    borderColor: depth.glassLine
  },
  liveDot: { width: 7, height: 7, borderRadius: radii.pill, backgroundColor: colors.primary, boxShadow: "0 0 13px rgba(154, 105, 255, 0.56)" },
  liveDotOff: { backgroundColor: colors.accent, boxShadow: "0 0 12px rgba(243, 184, 106, 0.44)" },
  liveText: { color: colors.text, fontSize: 11.5, fontWeight: "900" },
  searchingCard: { alignItems: "flex-end", gap: spacing.xs, borderColor: depth.violetLine, backgroundColor: "rgba(154, 105, 255, 0.085)" },
  scanVisual: { flexDirection: "row-reverse", gap: spacing.xs, alignSelf: "stretch", justifyContent: "center", paddingVertical: spacing.xs },
  scanDot: { width: 9, height: 9, borderRadius: 999, backgroundColor: colors.primary, boxShadow: "0 0 14px rgba(154, 105, 255, 0.48)" },
  scanDotMuted: { opacity: 0.38 },
  searchingTitle: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "right" },
  mapNotice: { color: colors.muted, textAlign: "right", fontSize: 12, fontWeight: "800", marginTop: -spacing.xs },
  customerStatusSummary: { gap: spacing.xs, backgroundColor: "rgba(255, 255, 255, 0.043)", borderColor: depth.hairline },
  rowBetween: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  statusTitle: { color: colors.text, fontSize: 18, fontWeight: "900", textAlign: "right" },
  price: { color: colors.primary, fontSize: 24, fontWeight: "900" },
  driverCard: { gap: spacing.xs, borderColor: depth.amberLine, backgroundColor: "rgba(243, 184, 106, 0.06)", boxShadow: shadows.accentGlow },
  driverHeader: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
  avatar: { width: 48, height: 48, borderRadius: radii.lg, alignItems: "center", justifyContent: "center", backgroundColor: colors.accent, boxShadow: shadows.accentGlow },
  avatarText: { color: colors.black, fontSize: 20, fontWeight: "900" },
  driverInfo: { flex: 1, alignItems: "flex-end" },
  driverMeta: { flexDirection: "row-reverse", gap: spacing.xs, flexWrap: "wrap" },
  cardTitle: { color: colors.muted, textAlign: "right", fontSize: 12, fontWeight: "700" },
  driverName: { color: colors.text, textAlign: "right", fontSize: 18, fontWeight: "800" },
  finishedCard: { gap: spacing.xs, backgroundColor: "rgba(255, 255, 255, 0.045)", borderColor: depth.hairline },
  ratingCard: { gap: spacing.sm, alignItems: "stretch", borderColor: depth.amberLine, backgroundColor: "rgba(243, 184, 106, 0.06)", boxShadow: shadows.accentGlow },
  savedRating: { color: colors.accent, fontSize: 18, fontWeight: "900", textAlign: "right" },
  starsRow: { flexDirection: "row-reverse", justifyContent: "center", gap: spacing.xs },
  starButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    borderWidth: 1,
    borderColor: colors.border
  },
  starButtonActive: { backgroundColor: "rgba(243, 184, 106, 0.2)", borderColor: colors.accent, boxShadow: shadows.accentGlow },
  starText: { color: colors.muted, fontSize: 22, fontWeight: "900" },
  starTextActive: { color: colors.accent },
  reviewInput: {
    minHeight: 76,
    borderRadius: radii.md,
    padding: spacing.sm,
    color: colors.text,
    backgroundColor: "rgba(255, 255, 255, 0.052)",
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: "top",
    fontWeight: "700"
  },
  muted: { color: colors.muted, textAlign: "right", lineHeight: 21, fontWeight: "600" },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" },
  actions: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs }
});
