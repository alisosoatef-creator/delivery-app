import { StyleSheet, Text, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { EmptyState, InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, StatusTimeline } from "../../components/ui";
import { useDriverCurrentRide } from "../../hooks/useDriverCurrentRide";
import { useDriverLiveTracking } from "../../hooks/useDriverLiveTracking";
import { km, money } from "../../utils/formatters";
import { colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";

export function CurrentRideScreen() {
  const {
    session,
    currentRide,
    action,
    completed,
    error,
    socketStatus,
    setSocketStatus,
    pickupPoint,
    destinationPoint,
    load,
    update,
    clearError,
    goToAvailable,
    paymentLabel,
    statusLabel
  } = useDriverCurrentRide();
  const {
    trackingStatus,
    driverLocation,
    driverLocationTime,
    trackingError,
    trackingLabel,
    trackingTone,
    startTracking,
    stopTracking
  } = useDriverLiveTracking({ currentRide, session, setSocketStatus, clearRideError: clearError });
  const displayError = error || trackingError;

  return (
    <ScreenContainer showHeader={false} compact>
      {displayError ? <Text selectable style={styles.error}>{displayError}</Text> : null}
      {!currentRide ? <EmptyState title="لا توجد رحلة نشطة" message="اقبل رحلة من شاشة الطلبات." actionTitle="عرض الطلبات" onAction={goToAvailable} /> : null}
      {currentRide ? (
        <>
          <MobileCard tone="command" style={styles.statusCommand}>
            <View>
              <Text selectable style={styles.title}>رحلتي الحالية</Text>
              <Text selectable style={styles.subtitle}>{statusLabel(currentRide.status)}</Text>
            </View>
            <View style={styles.commandMeta}>
              <MobileBadge label={socketStatus === "connected" ? "مباشر" : "يدوي"} tone={socketStatus === "connected" ? "success" : "warning"} />
              <Text selectable style={styles.commandPrice}>{money(currentRide.price || currentRide.fareIls)}</Text>
            </View>
          </MobileCard>
          <View style={styles.mapStage}>
            <MobileRideMap pickup={pickupPoint} destination={destinationPoint} driverLocation={driverLocation} userLocation={driverLocation} rideStatus={currentRide.status} height={270} />
          </View>
          {socketStatus !== "connected" ? <Text selectable style={styles.mapNotice}>التحديث المباشر غير متاح مؤقتًا، ويمكنك المتابعة يدويًا.</Text> : null}
          <MobileCard tone="glass" style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <MobileBadge label={statusLabel(currentRide.status)} tone={completed ? "success" : "info"} />
              <Text selectable style={styles.cardTitle}>مسار الرحلة</Text>
            </View>
            <View style={styles.routePoints}>
              <View style={styles.routePoint}>
                <Text selectable style={styles.pointLabel}>نقطة الانطلاق</Text>
                <Text selectable style={styles.pointValue} numberOfLines={1}>{currentRide.pickup || "-"}</Text>
              </View>
              <View style={styles.routePoint}>
                <Text selectable style={styles.pointLabel}>الوجهة</Text>
                <Text selectable style={styles.pointValue} numberOfLines={1}>{currentRide.destination || "-"}</Text>
              </View>
            </View>
          </MobileCard>

          <MobileCard tone="flat">
            <StatusTimeline status={currentRide.status} />
            <InfoRow label="الزبون" value={currentRide.customerName || "-"} accent />
            <InfoRow label="الهاتف" value={currentRide.customerPhone || "-"} />
            <InfoRow label="السعر" value={money(currentRide.price || currentRide.fareIls)} />
            <InfoRow label="المسافة" value={km(currentRide.routeDistanceKm || currentRide.distanceKm)} />
            <InfoRow label="الدفع" value={paymentLabel(currentRide.paymentMethod)} />
          </MobileCard>
          {!completed ? (
            <MobileCard tone="flat">
              <View style={styles.trackingHeader}>
                <Text selectable style={styles.cardTitle}>التتبع</Text>
                <View style={styles.trackingPills}>
                  <MobileBadge label={trackingLabel(trackingStatus)} tone={trackingTone(trackingStatus)} />
                </View>
              </View>
              {driverLocationTime ? <Text selectable style={styles.muted}>آخر تحديث للموقع: {driverLocationTime}</Text> : null}
              <View style={styles.trackingActions}>
                <MobileButton title="تفعيل موقعي المباشر" compact variant="secondary" onPress={startTracking} disabled={trackingStatus === "requesting" || trackingStatus === "active"} />
                <MobileButton title="إيقاف التتبع" compact variant="danger" onPress={() => stopTracking(true)} disabled={trackingStatus !== "active"} />
              </View>
            </MobileCard>
          ) : (
            <MobileCard tone="hero" style={styles.completedCard}>
              <Text selectable style={styles.cardTitle}>تم إنهاء الرحلة</Text>
              <Text selectable style={styles.muted}>تم حفظ الرحلة ضمن سجل الكابتن. يمكنك العودة للطلبات لاستقبال رحلة جديدة.</Text>
              <MobileButton title="عرض الطلبات" compact variant="secondary" onPress={goToAvailable} />
            </MobileCard>
          )}
          {action ? (
            <MobileCard tone="hero" style={styles.nextActionCard}>
              <Text selectable style={styles.nextActionHint}>الخطوة التالية</Text>
              <MobileButton title={action[1]} variant="accent" onPress={() => update(action[0], { onCompleted: () => stopTracking(false) })} />
            </MobileCard>
          ) : null}
        </>
      ) : null}
      <MobileButton title="تحديث" compact variant="secondary" onPress={load} />
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
    borderColor: depth.greenLine
  },
  commandMeta: { alignItems: "flex-start", gap: spacing.xs },
  commandPrice: { color: colors.green, fontSize: 22, fontWeight: "900", textAlign: "left" },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.primary, fontSize: 13, textAlign: "right", marginTop: 2 },
  cardTitle: { color: colors.text, fontSize: 14.5, fontWeight: "900", textAlign: "right" },
  error: { color: colors.red, textAlign: "right", fontWeight: "700" },
  mapNotice: { color: colors.muted, textAlign: "right", fontSize: 12, fontWeight: "800", marginTop: -spacing.xs },
  muted: { color: colors.muted, lineHeight: 21, textAlign: "right", fontWeight: "600" },
  mapStage: { borderRadius: radii.xxl, overflow: "hidden", borderWidth: 1, borderColor: depth.violetLine, boxShadow: shadows.glow },
  routeCard: { gap: spacing.xs, backgroundColor: "rgba(255, 255, 255, 0.052)", borderColor: depth.violetLine },
  routeHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  routePoints: { gap: spacing.xs },
  routePoint: { paddingVertical: spacing.xs, paddingHorizontal: spacing.xs, borderTopWidth: 1, borderTopColor: depth.hairline, borderRadius: radii.sm },
  pointLabel: { color: colors.primary, textAlign: "right", fontSize: 12, fontWeight: "900" },
  pointValue: { color: colors.text, textAlign: "right", fontSize: 14, fontWeight: "800", marginTop: 2 },
  trackingHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  trackingPills: { flexDirection: "row-reverse", gap: spacing.xs, flexWrap: "wrap" },
  trackingActions: { flexDirection: "row-reverse", gap: spacing.xs, flexWrap: "wrap" },
  nextActionCard: { gap: spacing.xs, borderColor: depth.amberLine, boxShadow: shadows.accentGlow, backgroundColor: "rgba(243, 184, 106, 0.07)" },
  nextActionHint: { color: colors.muted, textAlign: "right", fontWeight: "900", fontSize: 12 },
  completedCard: { gap: spacing.sm, borderColor: "rgba(68, 227, 157, 0.24)", backgroundColor: "rgba(68, 227, 157, 0.06)" }
});
