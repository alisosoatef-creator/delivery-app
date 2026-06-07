import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useDriverAvailability } from "../../hooks/useDriverAvailability";
import { money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

export function DriverHomeScreen() {
  const {
    driver,
    currentUser,
    available,
    status,
    error,
    availableCount,
    currentRide,
    socketStatus,
    toggleAvailability,
    logout,
    goToAvailable,
    goToCurrent,
    goToEarnings,
    goToSupport
  } = useDriverAvailability();

  const isSaving = status === "saving";
  const driverName = driver.fullName || currentUser.fullName || "كابتن واصل";
  const vehicleLabel = `${driver.vehicleType || driver.vehicle || "مركبة"} - ${driver.vehiclePlate || driver.plate || "بدون لوحة"}`;
  const availabilityLabel = available ? "متاح" : "غير متاح";
  const availabilityCopy = available ? "القناة مفتوحة لاستقبال الطلبات المناسبة." : "الطلبات الجديدة متوقفة مؤقتا.";
  const socketLabel = socketStatus === "connected" ? "متصل" : "يدوي";
  const rideRoute = currentRide ? `${currentRide.pickup || "-"} ← ${currentRide.destination || "-"}` : "";

  return (
    <V3Screen contentStyle={styles.screen}>
      <V3SectionHeader
        meta="لوحة الكابتن"
        title={`أهلا ${driverName}`}
        subtitle="تحكم بحالة التوفر وتابع الطلبات النشطة من مكان واحد."
      />

      <V3Card tone={available ? "blue" : "raised"} style={styles.availabilityPanel} contentStyle={styles.availabilityContent}>
        <View style={styles.rowBetween}>
          <V3Badge label={availabilityLabel} tone={available ? "success" : "warning"} />
          <View style={styles.identity}>
            <V3Text variant="caption" tone="muted">حالة التشغيل</V3Text>
            <V3Text variant="title" tone="primary" numberOfLines={2}>{available ? "جاهز للطلبات" : "خارج الخدمة"}</V3Text>
            <V3Text variant="caption" tone="soft" numberOfLines={2}>{vehicleLabel}</V3Text>
          </View>
        </View>

        <View style={styles.availabilityStatus}>
          <View style={[styles.statusDot, available ? styles.statusDotOnline : styles.statusDotOffline]} />
          <View style={styles.statusCopy}>
            <V3Text variant="label" tone={available ? "success" : "warning"}>{available ? "استقبال الطلبات يعمل" : "استقبال الطلبات متوقف"}</V3Text>
            <V3Text variant="caption" tone="muted" numberOfLines={2}>{availabilityCopy}</V3Text>
          </View>
        </View>

        <V3Button
          title={isSaving ? "جاري التحديث..." : available ? "إيقاف استقبال الطلبات" : "تشغيل استقبال الطلبات"}
          variant={available ? "secondary" : "primary"}
          loading={status === "saving"}
          disabled={status === "saving"}
          onPress={toggleAvailability}
        />

        {error ? <V3Text selectable variant="caption" tone="danger">{error}</V3Text> : null}
      </V3Card>

      <View style={styles.captainStats}>
        <V3Card compact tone="quiet" style={styles.statCard}>
          <V3Text variant="caption" tone="muted">طلبات متاحة</V3Text>
          <V3Text variant="subtitle" tone={available ? "blue" : "muted"}>{String(availableCount)}</V3Text>
          <V3Text variant="caption" tone={available ? "success" : "warning"}>{available ? "جاهز" : "متوقف"}</V3Text>
        </V3Card>

        <V3Card compact tone="quiet" style={styles.statCard}>
          <V3Text variant="caption" tone="muted">اليوم</V3Text>
          <V3Text variant="subtitle" tone="primary">{money(0)}</V3Text>
          <V3Text variant="caption" tone="muted">أرباح تجريبية</V3Text>
        </V3Card>

        <V3Card compact tone="quiet" style={styles.statCard}>
          <V3Text variant="caption" tone="muted">التحديث المباشر</V3Text>
          <V3Text variant="subtitle" tone={socketStatus === "connected" ? "success" : "warning"}>{socketLabel}</V3Text>
          <V3Text variant="caption" tone="muted">حالة الاتصال</V3Text>
        </V3Card>
      </View>

      {currentRide ? (
        <V3Card tone="accent" contentStyle={styles.currentRideCard}>
          <View style={styles.rowBetween}>
            <V3Badge label={currentRide.status || "-"} tone="blue" />
            <View style={styles.identity}>
              <V3Text variant="caption" tone="muted">الرحلة الحالية</V3Text>
              <V3Text variant="subtitle" tone="primary">تابع الطلب النشط</V3Text>
            </View>
          </View>
          <View style={styles.routeLine}>
            <View style={styles.routeRail}>
              <View style={styles.routePin} />
              <View style={styles.routeStroke} />
              <View style={[styles.routePin, styles.routePinEnd]} />
            </View>
            <V3Text variant="caption" tone="soft" numberOfLines={2} style={styles.routeText}>{rideRoute}</V3Text>
          </View>
          <V3Button title="فتح الرحلة" size="sm" variant="secondary" onPress={goToCurrent} />
        </V3Card>
      ) : null}

      <V3SectionHeader title="اختصارات العمل" subtitle="كل إجراء يفتح نفس مسارات الكابتن الحالية." />

      <View style={styles.actionGrid}>
        <V3Card compact tone="accent" onPress={goToAvailable} accessibilityLabel="الطلبات المتاحة" style={styles.actionTile}>
          <V3Text variant="subtitle" tone="accent">{String(availableCount)}</V3Text>
          <V3Text variant="label" tone="primary">الطلبات</V3Text>
          <V3Text variant="caption" tone="muted">طلبات قريبة</V3Text>
        </V3Card>

        <V3Card compact tone="quiet" onPress={goToCurrent} accessibilityLabel="رحلتي الحالية" style={styles.actionTile}>
          <V3Text variant="subtitle" tone="blue">{currentRide ? "نشطة" : "-"}</V3Text>
          <V3Text variant="label" tone="primary">رحلتي</V3Text>
          <V3Text variant="caption" tone="muted">تفاصيل مباشرة</V3Text>
        </V3Card>

        <V3Card compact tone="quiet" onPress={goToEarnings} accessibilityLabel="الأرباح" style={styles.actionTile}>
          <V3Text variant="subtitle" tone="accent">{money(0)}</V3Text>
          <V3Text variant="label" tone="primary">الأرباح</V3Text>
          <V3Text variant="caption" tone="muted">ملخص اليوم</V3Text>
        </V3Card>

        <V3Card compact tone="quiet" onPress={goToSupport} accessibilityLabel="الدعم" style={styles.actionTile}>
          <V3Text variant="subtitle" tone="blue">24/7</V3Text>
          <V3Text variant="label" tone="primary">الدعم</V3Text>
          <V3Text variant="caption" tone="muted">مساعدة الكابتن</V3Text>
        </V3Card>
      </View>

      <V3Card tone="default" contentStyle={styles.sessionCard}>
        <View style={styles.rowBetween}>
          <V3Badge label={socketLabel} tone={socketStatus === "connected" ? "success" : "warning"} />
          <View style={styles.identity}>
            <V3Text variant="label" tone="primary">جلسة الكابتن</V3Text>
            <V3Text variant="caption" tone="muted">الخروج ينهي الجلسة المحلية ويفصل الاتصال.</V3Text>
          </View>
        </View>
        <V3Button title="خروج" variant="danger" size="sm" onPress={logout} />
      </V3Card>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: v3Spacing.lg
  },
  availabilityPanel: {
    borderColor: v3Colors.borderBlue
  },
  availabilityContent: {
    gap: v3Spacing.md
  },
  rowBetween: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.md
  },
  identity: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  availabilityStatus: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: v3Spacing.sm,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.whiteSoft,
    padding: v3Spacing.sm
  },
  statusDot: {
    width: 46,
    height: 46,
    borderRadius: v3Radius.pill,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.whiteWash
  },
  statusDotOnline: {
    backgroundColor: "rgba(69, 224, 164, 0.2)",
    borderColor: "rgba(69, 224, 164, 0.44)"
  },
  statusDotOffline: {
    backgroundColor: "rgba(248, 199, 109, 0.14)",
    borderColor: "rgba(248, 199, 109, 0.38)"
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  captainStats: {
    flexDirection: "row-reverse",
    gap: v3Spacing.sm
  },
  statCard: {
    flex: 1,
    minWidth: 0
  },
  currentRideCard: {
    gap: v3Spacing.md
  },
  routeLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: v3Spacing.sm,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.blackScrim,
    padding: v3Spacing.sm
  },
  routeRail: {
    width: 18,
    alignItems: "center"
  },
  routePin: {
    width: 9,
    height: 9,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.electricBlue
  },
  routePinEnd: {
    backgroundColor: v3Colors.purpleLight
  },
  routeStroke: {
    width: 2,
    height: 30,
    backgroundColor: v3Colors.borderStrong
  },
  routeText: {
    flex: 1
  },
  actionGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.sm
  },
  actionTile: {
    width: "47.5%",
    minHeight: 116
  },
  sessionCard: {
    gap: v3Spacing.md
  }
});
