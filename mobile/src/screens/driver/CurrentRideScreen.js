import { StyleSheet, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { V3Badge, V3Button, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useDriverCurrentRide } from "../../hooks/useDriverCurrentRide";
import { useDriverLiveTracking } from "../../hooks/useDriverLiveTracking";
import { km, money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

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
        <V3Text selectable variant="label" tone="primary" numberOfLines={1}>{value || "-"}</V3Text>
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
        subtitle="تابع المسار، حالة الرحلة، وموقعك المباشر من شاشة واحدة."
      />

      {displayError ? (
        <V3Card tone="quiet" style={styles.errorPanel}>
          <V3Text selectable variant="caption" tone="danger">{displayError}</V3Text>
        </V3Card>
      ) : null}

      {!currentRide ? (
        <V3Card tone="accent" contentStyle={styles.emptyPanel}>
          <V3Badge label="لا توجد رحلة" tone="primary" />
          <V3Text variant="subtitle" tone="primary">لا توجد رحلة نشطة</V3Text>
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
          </View>

          <V3Card tone="accent" style={styles.statusPanel} contentStyle={styles.statusContent}>
            <View style={styles.rowBetween}>
              <View style={styles.badgeRow}>
                <V3Badge label={socketLive ? "مباشر" : "يدوي"} tone={socketLive ? "success" : "warning"} />
                <V3Badge label={statusLabel(currentRide.status)} tone={completed ? "success" : "blue"} />
              </View>
              <View style={styles.statusCopy}>
                <V3Text variant="caption" tone="muted">حالة الرحلة</V3Text>
                <V3Text variant="title" tone="primary" numberOfLines={2}>{statusLabel(currentRide.status)}</V3Text>
              </View>
            </View>
            <View style={styles.priceStrip}>
              <V3Text variant="caption" tone="muted">قيمة الرحلة</V3Text>
              <V3Text selectable variant="subtitle" tone="success">{money(currentRide.price || currentRide.fareIls)}</V3Text>
            </View>
          </V3Card>

          {!socketLive ? (
            <V3Card tone="quiet" contentStyle={styles.noticePanel}>
              <V3Text selectable variant="caption" tone="warning">
                التحديث المباشر غير متاح مؤقتا، ويمكنك المتابعة يدويا.
              </V3Text>
            </V3Card>
          ) : null}

          <V3Card tone="default" style={styles.routePanel} contentStyle={styles.routeContent}>
            <View style={styles.rowBetween}>
              <V3Badge label={km(currentRide.routeDistanceKm || currentRide.distanceKm)} tone="blue" />
              <View style={styles.statusCopy}>
                <V3Text variant="caption" tone="muted">مسار الرحلة</V3Text>
                <V3Text variant="subtitle" tone="primary">نقاط الالتقاط والوصول</V3Text>
              </View>
            </View>
            <RoutePoint label="نقطة الانطلاق" value={currentRide.pickup} />
            <RoutePoint label="الوجهة" value={currentRide.destination} end />
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
            <V3Card tone="blue" style={styles.trackingPanel} contentStyle={styles.trackingContent}>
              <View style={styles.rowBetween}>
                <V3Badge label={trackingLabel(trackingStatus)} tone={trackingBadgeTone} />
                <View style={styles.statusCopy}>
                  <V3Text variant="caption" tone="muted">التتبع المباشر</V3Text>
                  <V3Text variant="subtitle" tone="primary">موقع الكابتن</V3Text>
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
            <V3Card tone="blue" contentStyle={styles.completedPanel}>
              <V3Badge label="مكتملة" tone="success" />
              <V3Text variant="subtitle" tone="primary">تم إنهاء الرحلة</V3Text>
              <V3Text selectable variant="caption" tone="muted">
                تم حفظ الرحلة ضمن سجل الكابتن. يمكنك العودة للطلبات لاستقبال رحلة جديدة.
              </V3Text>
              <V3Button title="عرض الطلبات" variant="secondary" size="sm" onPress={goToAvailable} />
            </V3Card>
          )}

          {action ? (
            <V3Card tone="accent" style={styles.nextActionPanel} contentStyle={styles.nextActionContent}>
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
    gap: v3Spacing.lg
  },
  errorPanel: {
    borderColor: "rgba(255, 97, 116, 0.32)"
  },
  emptyPanel: {
    alignItems: "center",
    justifyContent: "center",
    gap: v3Spacing.sm,
    minHeight: 220
  },
  centerCopy: {
    maxWidth: 280
  },
  mapStage: {
    borderRadius: v3Radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: v3Colors.borderStrong,
    backgroundColor: v3Colors.backgroundDeep
  },
  statusPanel: {
    borderColor: v3Colors.borderStrong
  },
  statusContent: {
    gap: v3Spacing.md
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
  priceStrip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.sm,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.blackScrim,
    padding: v3Spacing.sm
  },
  noticePanel: {
    gap: v3Spacing.xs
  },
  routePanel: {
    borderColor: v3Colors.borderBlue
  },
  routeContent: {
    gap: v3Spacing.md
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
    width: 10,
    height: 10,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.electricBlue
  },
  routeDotEnd: {
    backgroundColor: v3Colors.purpleLight
  },
  routeStroke: {
    width: 2,
    height: 38,
    backgroundColor: v3Colors.borderStrong
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
    borderTopColor: v3Colors.border,
    paddingTop: v3Spacing.sm
  },
  detailValue: {
    flex: 1
  },
  trackingPanel: {
    borderColor: v3Colors.borderBlue
  },
  trackingContent: {
    gap: v3Spacing.md
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
    borderColor: v3Colors.borderStrong
  },
  nextActionContent: {
    gap: v3Spacing.sm
  }
});
