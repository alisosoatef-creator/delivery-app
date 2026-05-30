import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { EmptyState, InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, StatusTimeline } from "../../components/ui";
import { cancelRide, fetchActiveCustomerRide, fetchCustomerRideDetails, submitRideRating } from "../../services/ridesApi";
import { connectMobileSocket, joinRideRoom, subscribeToLocationEvents, subscribeToRideEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../../utils/errorUtils";
import { colors, depth, km, money, radii, shadows, spacing } from "../../utils/mobileTheme";
import { isActiveRide, isFinishedRide, statusLabel } from "../../utils/rideStatus";

const acceptedStatuses = ["accepted", "driver_arriving", "arrived", "in_progress", "completed"];

function hasAcceptedDriver(ride) {
  return ride?.driver && acceptedStatuses.includes(ride.status);
}

function paymentLabel(method) {
  if (method === "visa" || method === "visa-placeholder") return "بطاقة تجريبية";
  if (method === "wallet") return "المحفظة";
  return "نقدًا";
}

function ridePoint(ride, type) {
  const prefix = type === "pickup" ? "pickup" : "destination";
  const lat = Number(ride?.[`${prefix}Lat`]);
  const lng = Number(ride?.[`${prefix}Lng`]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label: ride?.[prefix] || type };
}

function timeLabel(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function CustomerRideStatusScreen() {
  const { state, dispatch } = useMobileApp();
  const [ride, setRide] = useState(state.currentRide);
  const [driverLocation, setDriverLocation] = useState(state.driverLocation);
  const [socketStatus, setSocketStatus] = useState(state.socketStatus || "offline");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [ratingDraft, setRatingDraft] = useState(5);
  const [reviewDraft, setReviewDraft] = useState("");
  const [ratingStatus, setRatingStatus] = useState("idle");
  const [ratingError, setRatingError] = useState("");
  const session = { token: state.token, role: "customer", phone: state.currentUser?.phone, userId: state.currentUser?.id };
  const pickupPoint = useMemo(() => ridePoint(ride, "pickup"), [ride]);
  const destinationPoint = useMemo(() => ridePoint(ride, "destination"), [ride]);

  useEffect(() => {
    let mounted = true;
    async function bootRide() {
      setStatus("loading");
      setError("");
      try {
        if (ride?.id) {
          const nextRide = await fetchCustomerRideDetails({ rideId: ride.id, phone: session.phone, userId: session.userId, token: session.token });
          if (mounted && nextRide) {
            setRide(nextRide);
            dispatch({ type: "setCurrentRide", ride: nextRide, area: "customer", screen: "ride-status" });
          }
        } else {
          const activeRide = await fetchActiveCustomerRide(session);
          if (mounted && activeRide) {
            setRide(activeRide);
            dispatch({ type: "setCurrentRide", ride: activeRide, area: "customer", screen: "ride-status" });
          }
        }
        dispatch({ type: "patch", patch: { connectionMessage: "" } });
      } catch (requestError) {
        if (mounted) {
          setError(apiErrorMessage(requestError, "تعذر جلب الرحلة النشطة."));
          dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
        }
      } finally {
        if (mounted) setStatus("idle");
      }
    }
    bootRide();
    return () => {
      mounted = false;
    };
  }, [state.currentUser?.id, state.currentUser?.phone, state.token]);

  useEffect(() => {
    if (!ride?.id) return undefined;
    const client = connectMobileSocket(
      { ...session, customerId: session.userId, customerPhone: session.phone, rideId: ride.id },
      {
        onConnectionChange: (connected, statusName) => {
          const nextStatus = statusName || (connected ? "connected" : "disconnected");
          setSocketStatus(nextStatus);
          dispatch({ type: "patch", patch: { socketStatus: nextStatus } });
          if (connected) joinRideRoom(ride.id);
        }
      }
    );

    const unsubscribeRide = subscribeToRideEvents((payload) => {
      const nextRide = payload?.ride;
      if (!nextRide || String(nextRide.id) !== String(ride.id)) return;
      setRide(nextRide);
      dispatch({ type: "setCurrentRide", ride: nextRide, area: "customer", screen: "ride-status" });
    });

    const unsubscribeLocation = subscribeToLocationEvents((payload, eventName) => {
      if (String(payload?.rideId || "") !== String(ride.id)) return;
      if (eventName === "driver:location-unavailable") {
        dispatch({ type: "patch", patch: { liveTrackingStatus: "unavailable" } });
        return;
      }
      const location = payload?.location || { lat: payload?.lat, lng: payload?.lng };
      const nextLocation = {
        lat: Number(location.lat),
        lng: Number(location.lng),
        label: "موقع الكابتن",
        timestamp: payload?.timestamp || new Date().toISOString()
      };
      if (!Number.isFinite(nextLocation.lat) || !Number.isFinite(nextLocation.lng)) return;
      setDriverLocation(nextLocation);
      dispatch({ type: "patch", patch: { driverLocation: nextLocation, liveTrackingStatus: "active", lastDriverLocationAt: nextLocation.timestamp } });
    });

    if (client?.connected) joinRideRoom(ride.id);
    return () => {
      unsubscribeRide();
      unsubscribeLocation();
    };
  }, [ride?.id, session.phone, session.token, session.userId]);

  async function refresh() {
    if (!ride?.id) return;
    setStatus("loading");
    setError("");
    try {
      const nextRide = await fetchCustomerRideDetails({ rideId: ride.id, phone: session.phone, userId: session.userId, token: session.token });
      setRide(nextRide);
      dispatch({ type: "setCurrentRide", ride: nextRide, area: "customer", screen: "ride-status" });
      dispatch({ type: "patch", patch: { connectionMessage: "" } });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر تحديث حالة الرحلة."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    } finally {
      setStatus("idle");
    }
  }

  async function cancel() {
    setStatus("cancel");
    setError("");
    try {
      const payload = await cancelRide(ride.id, session);
      setRide(payload.ride);
      dispatch({ type: "setCurrentRide", ride: payload.ride, area: "customer", screen: "ride-status", toast: "تم إلغاء الرحلة." });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر إلغاء الرحلة."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    } finally {
      setStatus("idle");
    }
  }

  async function submitRating() {
    if (!ride?.id || ride.status !== "completed") return;
    setRatingStatus("saving");
    setRatingError("");
    try {
      const payload = await submitRideRating(ride.id, { rating: ratingDraft, comment: reviewDraft }, session);
      setRide(payload.ride);
      dispatch({ type: "setCurrentRide", ride: payload.ride, area: "customer", screen: "ride-status", toast: "تم حفظ تقييم الرحلة." });
    } catch (requestError) {
      setRatingError(apiErrorMessage(requestError, "تعذر حفظ تقييم الرحلة."));
    } finally {
      setRatingStatus("idle");
    }
  }

  if (!ride) {
    return (
      <ScreenContainer showHeader={false}>
        <EmptyState
          title={status === "loading" ? "جاري البحث عن رحلة نشطة..." : "لا توجد رحلة نشطة الآن"}
          message={error || "يمكنك طلب رحلة جديدة والعودة لهذه الشاشة عند الحاجة."}
          actionTitle="طلب رحلة جديدة"
          onAction={() => dispatch({ type: "navigate", area: "customer", screen: "request" })}
        />
      </ScreenContainer>
    );
  }

  const accepted = hasAcceptedDriver(ride);
  const finished = isFinishedRide(ride);
  const searching = ride.status === "searching";
  const completed = ride.status === "completed";
  const cancelled = ride.status === "cancelled";
  const rideRating = ride.rating || ride.rideRating || null;
  const summaryTitle = completed ? "انتهت الرحلة" : cancelled ? "تم إلغاء الرحلة" : statusLabel(ride.status);
  const liveUnavailable = accepted && socketStatus !== "connected";
  const driverLocationTime = timeLabel(driverLocation?.timestamp || state.lastDriverLocationAt);

  return (
    <ScreenContainer showHeader={false} compact>
      <View style={styles.header}>
        <View>
          <Text selectable style={styles.title}>{finished ? "ملخص الرحلة" : "تتبع الرحلة"}</Text>
          <Text selectable style={styles.subtitle}>{ride.status === "searching" ? "جاري البحث عن كابتن قريب" : statusLabel(ride.status)}</Text>
        </View>
        <MobileBadge label={socketStatus === "connected" ? "مباشر" : "يدوي"} tone={socketStatus === "connected" ? "success" : "warning"} />
      </View>

      <View style={styles.trackingHero}>
        <MobileRideMap
          pickup={pickupPoint}
          destination={destinationPoint}
          driverLocation={accepted ? driverLocation : null}
          userLocation={state.currentLocation}
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

      <MobileCard tone={finished ? "flat" : "flat"} style={styles.customerStatusSummary}>
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
        <MobileCard tone="flat" style={styles.driverCard}>
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
        {["searching", "accepted"].includes(ride.status) ? <MobileButton title="إلغاء الرحلة" compact variant="danger" onPress={cancel} loading={status === "cancel"} /> : null}
        {finished ? <MobileButton title="طلب رحلة جديدة" compact variant="accent" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} /> : null}
        {!isActiveRide(ride) ? <MobileButton title="عرض رحلاتي" compact variant="secondary" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "rides" })} /> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
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
