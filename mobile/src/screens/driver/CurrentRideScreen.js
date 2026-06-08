import { StyleSheet, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { V3Badge, V3Button, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useDriverCurrentRide } from "../../hooks/useDriverCurrentRide";
import { useDriverLiveTracking } from "../../hooks/useDriverLiveTracking";
import { km, money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Shadows, v3Spacing } from "../../theme/v3";

function DetailLine({ label, value, tone = "soft" }) {
  return (
    <View style={styles.detailLine}>
      <V3Text variant="caption" tone="muted">{label}</V3Text>
      <V3Text selectable variant="label" tone={tone} numberOfLines={1} style={styles.detailValue}>{value}</V3Text>
    </View>
  );
}

function RoutePoint({ label, value, end = false }) {
  return (
    <View style={styles.routePoint}>
      <View style={styles.routeMarkerColumn}>
        <View style={[styles.routeDot, end && styles.routeDotEnd]} />
        {!end ? <View style={styles.routeStroke} /> : null}
      </View>
      <View style={styles.routeCopy}>
        <V3Text variant="caption" tone={end ? "accent" : "blue"}>{label}</V3Text>
        <V3Text selectable variant="label" numberOfLines={1}>{value || "-"}</V3Text>
      </View>
    </View>
  );
}

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
  const socketLive = socketStatus === "connected";
  const trackingToneName = trackingTone(trackingStatus);
  const trackingBadgeTone = trackingToneName === "info" ? "blue" : trackingToneName;

  return (
    <V3Screen contentStyle={styles.driverRideShell}>
      <V3SectionHeader
        meta="الرحلة الجارية"
        title="رحلتي الحالية"
        subtitle="تابع المسار وحالة الرحلة وموقعك المباشر من شاشة واحدة."
      />

      {displayError ? (
        <V3Card tone="quiet" compact style={styles.errorPanel}>
          <V3Text selectable variant="caption" tone="danger">{displayError}</V3Text>
        </V3Card>
      ) : null}

      {!currentRide ? (
        <V3Card tone="raised" contentStyle={styles.emptyPanel}>
          <V3Badge label="لا توجد رحلة" tone="blue" />
          <V3Text variant="subtitle">لا توجد رحلة نشطة</V3Text>
          <V3Text variant="caption" tone="muted" align="center" style={styles.centerCopy}>
            اقبل رحلة من شاشة الطلبات لتظهر تفاصيلها هنا.
          </V3Text>
          <V3Button title="عرض الطلبات" variant="primary" onPress={goToAvailable} />
        </V3Card>
      ) : null}

      {currentRide ? (
        <>
          <View style={styles.mapStage}>
            <MobileRideMap
              pickup={pickupPoint}
              destination={destinationPoint}
              driverLocation={driverLocation}
              userLocation={driverLocation}
              rideStatus={currentRide.status}
              height={290}
            />
            <View style={styles.mapBadge}>
              <V3Badge label={socketLive ? "مباشر" : "يدوي"} tone={socketLive ? "success" : "warning"} />
            </View>
          </View>

          <V3Card tone="raised" style={styles.statusPanel} contentStyle={styles.statusContent}>
            <View style={styles.sheetHandle} />
            <View style={styles.rowBetween}>
              <View style={styles.badgeRow}>
                <V3Badge label={statusLabel(currentRide.status)} tone={completed ? "success" : "blue"} />
                <V3Badge label={money(currentRide.price || currentRide.fareIls)} tone="dark" />
              </View>
              <View style={styles.statusCopy}>
                <V3Text variant="caption" tone="muted">حالة الرحلة</V3Text>
                <V3Text variant="title" numberOfLines={2}>{statusLabel(currentRide.status)}</V3Text>
              </View>
            </View>
          </V3Card>

          {!socketLive ? (
            <V3Card tone="quiet" compact style={styles.noticePanel}>
              <V3Text selectable variant="caption" tone="warning">
                التحديث المباشر غير متاح مؤقتا، ويمكنك المتابعة يدويا.
              </V3Text>
            </V3Card>
          ) : null}

          <V3Card tone="raised" style={styles.routePanel} contentStyle={styles.routeContent}>
            <View style={styles.rowBetween}>
              <V3Badge label={km(currentRide.routeDistanceKm || currentRide.distanceKm)} tone="blue" />
              <View style={styles.statusCopy}>
                <V3Text variant="caption" tone="muted">مسار الرحلة</V3Text>
                <V3Text variant="subtitle">نقاط الالتقاط والوصول</V3Text>
              </View>
            </View>
            <View style={styles.routeBox}>
              <RoutePoint label="نقطة الانطلاق" value={currentRide.pickup} />
              <RoutePoint label="الوجهة" value={currentRide.destination} end />
            </View>
          </V3Card>

          <V3Card tone="quiet" contentStyle={styles.detailsPanel}>
            <V3SectionHeader title="معلومات الرحلة" subtitle="بيانات الزبون والدفع الحالية." />
            <DetailLine label="الزبون" value={currentRide.customerName || "-"} tone="primary" />
            <DetailLine label="الهاتف" value={currentRide.customerPhone || "-"} />
            <DetailLine label="السعر" value={money(currentRide.price || currentRide.fareIls)} tone="success" />
            <DetailLine label="المسافة" value={km(currentRide.routeDistanceKm || currentRide.distanceKm)} />
            <DetailLine label="الدفع" value={paymentLabel(currentRide.paymentMethod)} />
          </V3Card>

          {!completed ? (
            <V3Card tone="raised" style={styles.trackingPanel} contentStyle={styles.trackingContent}>
              <View style={styles.rowBetween}>
                <V3Badge label={trackingLabel(trackingStatus)} tone={trackingBadgeTone} />
                <View style={styles.statusCopy}>
                  <V3Text variant="caption" tone="muted">التتبع المباشر</V3Text>
                  <V3Text variant="subtitle">موقع الكابتن</V3Text>
                </View>
              </View>
              {driverLocationTime ? (
                <V3Text selectable variant="caption" tone="muted">
                  آخر تحديث للموقع: {driverLocationTime}
                </V3Text>
              ) : (
                <V3Text variant="caption" tone="muted">فعّل موقعك المباشر عند بدء التحرك.</V3Text>
              )}
              <View style={styles.trackingActions}>
                <V3Button
                  title="تفعيل موقعي المباشر"
                  variant="secondary"
                  size="sm"
                  disabled={trackingStatus === "requesting" || trackingStatus === "active"}
                  onPress={startTracking}
                />
                <V3Button
                  title="إيقاف التتبع"
                  variant="danger"
                  size="sm"
                  disabled={trackingStatus !== "active"}
                  onPress={() => stopTracking(true)}
                />
              </View>
            </V3Card>
          ) : (
            <V3Card tone="raised" contentStyle={styles.completedPanel}>
              <V3Badge label="مكتملة" tone="success" />
              <V3Text variant="subtitle">تم إنهاء الرحلة</V3Text>
              <V3Text selectable variant="caption" tone="muted">
                تم حفظ الرحلة ضمن سجل الكابتن. يمكنك العودة للطلبات لاستقبال رحلة جديدة.
              </V3Text>
              <V3Button title="عرض الطلبات" variant="secondary" size="sm" onPress={goToAvailable} />
            </V3Card>
          )}

          {action ? (
            <V3Card tone="raised" style={styles.nextActionPanel} contentStyle={styles.nextActionContent}>
              <V3Text variant="caption" tone="muted">الخطوة التالية</V3Text>
              <V3Button title={action[1]} variant="primary" onPress={() => update(action[0], { onCompleted: () => stopTracking(false) })} />
            </V3Card>
          ) : null}
        </>
      ) : null}

      <V3Button title="تحديث" variant="secondary" size="sm" onPress={load} />
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  driverRideShell: {
    gap: v3Spacing.sm
  },
  errorPanel: {
    borderColor: "rgba(255, 97, 116, 0.24)"
  },
  emptyPanel: {
    alignItems: "center",
    justifyContent: "center",
    gap: v3Spacing.sm,
    minHeight: 180
  },
  centerCopy: {
    maxWidth: 280
  },
  mapStage: {
    position: "relative",
    borderRadius: v3Radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: v3Colors.backgroundDeep,
    boxShadow: v3Shadows.soft
  },
  mapBadge: {
    position: "absolute",
    top: v3Spacing.xs,
    left: v3Spacing.xs
  },
  statusPanel: {
    marginTop: -v3Spacing.xs,
    borderColor: "rgba(139, 92, 246, 0.22)"
  },
  statusContent: {
    gap: v3Spacing.sm
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: v3Radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.14)"
  },
  rowBetween: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.md
  },
  badgeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  noticePanel: {
    borderColor: "rgba(248, 199, 109, 0.22)"
  },
  routePanel: {
    borderColor: "rgba(255, 255, 255, 0.09)"
  },
  routeContent: {
    gap: v3Spacing.sm
  },
  routeBox: {
    borderRadius: v3Radius.md,
    backgroundColor: v3Alpha.blackScrim,
    padding: v3Spacing.sm,
    gap: v3Spacing.xs
  },
  routePoint: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: v3Spacing.sm
  },
  routeMarkerColumn: {
    width: 18,
    alignItems: "center",
    paddingTop: 3
  },
  routeDot: {
    width: 9,
    height: 9,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.electricBlue
  },
  routeDotEnd: {
    backgroundColor: v3Colors.purpleLight
  },
  routeStroke: {
    width: 2,
    height: 32,
    backgroundColor: v3Alpha.purpleWash
  },
  routeCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  detailsPanel: {
    gap: v3Spacing.sm
  },
  detailLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.07)",
    paddingTop: v3Spacing.sm
  },
  detailValue: {
    flex: 1
  },
  trackingPanel: {
    borderColor: "rgba(34, 211, 238, 0.18)"
  },
  trackingContent: {
    gap: v3Spacing.sm
  },
  trackingActions: {
    flexDirection: "row-reverse",
    gap: v3Spacing.sm,
    flexWrap: "wrap"
  },
  completedPanel: {
    gap: v3Spacing.sm
  },
  nextActionPanel: {
    borderColor: "rgba(139, 92, 246, 0.22)"
  },
  nextActionContent: {
    gap: v3Spacing.sm
  }
});
