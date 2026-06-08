import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useDriverAvailability } from "../../hooks/useDriverAvailability";
import { money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Shadows, v3Spacing } from "../../theme/v3";

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
  const driverName = driver?.fullName || currentUser?.fullName || "كابتن واصل";
  const vehicleLabel = `${driver?.vehicleType || driver?.vehicle || "مركبة"} · ${driver?.vehiclePlate || driver?.plate || "بدون لوحة"}`;
  const availabilityLabel = available ? "متاح" : "غير متاح";
  const socketLabel = socketStatus === "connected" ? "مباشر" : "يدوي";
  const rideRoute = currentRide ? `${currentRide.pickup || "-"} إلى ${currentRide.destination || "-"}` : "";

  return (
    <V3Screen contentStyle={styles.screen}>
      <V3SectionHeader
        meta="تطبيق الكابتن"
        title={`أهلا ${driverName}`}
        subtitle="إدارة التوفر والرحلات من لوحة واحدة هادئة وواضحة."
      />

      <V3Card tone="raised" style={styles.availabilityPanel} contentStyle={styles.heroContent}>
        <View style={styles.heroTop}>
          <V3Badge label={availabilityLabel} tone={available ? "success" : "warning"} />
          <View style={styles.identity}>
            <V3Text variant="caption" tone="blue">حالة التشغيل</V3Text>
            <V3Text variant="title" numberOfLines={2}>{available ? "جاهز للطلبات" : "خارج الخدمة"}</V3Text>
            <V3Text selectable variant="caption" tone="muted" numberOfLines={1}>{vehicleLabel}</V3Text>
          </View>
        </View>

        <View style={styles.availabilityStatus}>
          <View style={[styles.statusOrb, available ? styles.statusOrbOnline : styles.statusOrbOffline]}>
            <View style={[styles.statusDot, available ? styles.statusDotOnline : styles.statusDotOffline]} />
          </View>
          <View style={styles.statusCopy}>
            <V3Text variant="label" tone={available ? "success" : "warning"}>
              {available ? "استقبال الطلبات يعمل" : "استقبال الطلبات متوقف"}
            </V3Text>
            <V3Text variant="caption" tone="muted" numberOfLines={2}>
              {available ? "ستظهر الطلبات المناسبة فور توفرها." : "فعّل التوفر عندما تكون جاهزا للانطلاق."}
            </V3Text>
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
          <V3Text variant="caption" tone={available ? "success" : "warning"}>{available ? "نشط" : "متوقف"}</V3Text>
        </V3Card>

        <V3Card compact tone="quiet" style={styles.statCard}>
          <V3Text variant="caption" tone="muted">أرباح اليوم</V3Text>
          <V3Text variant="subtitle">{money(0)}</V3Text>
          <V3Text variant="caption" tone="muted">ملخص سريع</V3Text>
        </V3Card>

        <V3Card compact tone="quiet" style={styles.statCard}>
          <V3Text variant="caption" tone="muted">الاتصال</V3Text>
          <V3Text variant="subtitle" tone={socketStatus === "connected" ? "success" : "warning"}>{socketLabel}</V3Text>
          <V3Text variant="caption" tone="muted">تحديث الطلبات</V3Text>
        </V3Card>
      </View>

      {currentRide ? (
        <V3Card tone="raised" contentStyle={styles.currentRideCard}>
          <View style={styles.rowBetween}>
            <V3Badge label={currentRide.status || "-"} tone="blue" />
            <View style={styles.identity}>
              <V3Text variant="caption" tone="muted">الرحلة الحالية</V3Text>
              <V3Text variant="subtitle">تابع الطلب النشط</V3Text>
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

      <V3SectionHeader title="اختصارات العمل" subtitle="إجراءات سريعة بدون ازدحام." />

      <View style={styles.actionGrid}>
        <V3Card compact tone="raised" onPress={goToAvailable} accessibilityLabel="الطلبات المتاحة" style={styles.actionTile}>
          <V3Text variant="subtitle" tone="accent">{String(availableCount)}</V3Text>
          <V3Text variant="label">الطلبات</V3Text>
          <V3Text variant="caption" tone="muted">طلبات قريبة</V3Text>
        </V3Card>

        <V3Card compact tone="quiet" onPress={goToCurrent} accessibilityLabel="رحلتي الحالية" style={styles.actionTile}>
          <V3Text variant="subtitle" tone="blue">{currentRide ? "نشطة" : "-"}</V3Text>
          <V3Text variant="label">رحلتي</V3Text>
          <V3Text variant="caption" tone="muted">تتبع مباشر</V3Text>
        </V3Card>

        <V3Card compact tone="quiet" onPress={goToEarnings} accessibilityLabel="الأرباح" style={styles.actionTile}>
          <V3Text variant="subtitle" tone="accent">{money(0)}</V3Text>
          <V3Text variant="label">الأرباح</V3Text>
          <V3Text variant="caption" tone="muted">ملخص اليوم</V3Text>
        </V3Card>

        <V3Card compact tone="quiet" onPress={goToSupport} accessibilityLabel="الدعم" style={styles.actionTile}>
          <V3Text variant="subtitle" tone="blue">24/7</V3Text>
          <V3Text variant="label">الدعم</V3Text>
          <V3Text variant="caption" tone="muted">مساعدة الكابتن</V3Text>
        </V3Card>
      </View>

      <V3Card tone="quiet" contentStyle={styles.sessionCard}>
        <View style={styles.rowBetween}>
          <V3Badge label={socketLabel} tone={socketStatus === "connected" ? "success" : "warning"} />
          <View style={styles.identity}>
            <V3Text variant="label">جلسة الكابتن</V3Text>
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
    gap: v3Spacing.sm
  },
  availabilityPanel: {
    borderColor: "rgba(139, 92, 246, 0.2)",
    boxShadow: v3Shadows.soft
  },
  heroContent: {
    gap: v3Spacing.sm
  },
  heroTop: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
    borderRadius: v3Radius.md,
    backgroundColor: "rgba(255, 255, 255, 0.035)",
    padding: v3Spacing.sm
  },
  statusOrb: {
    width: 48,
    height: 48,
    borderRadius: v3Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  statusOrbOnline: {
    borderColor: "rgba(69, 224, 164, 0.28)",
    backgroundColor: "rgba(69, 224, 164, 0.09)"
  },
  statusOrbOffline: {
    borderColor: "rgba(248, 199, 109, 0.28)",
    backgroundColor: "rgba(248, 199, 109, 0.08)"
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7
  },
  statusDotOnline: {
    backgroundColor: v3Colors.success,
    boxShadow: "0 0 18px rgba(69, 224, 164, 0.45)"
  },
  statusDotOffline: {
    backgroundColor: v3Colors.warning,
    boxShadow: "0 0 18px rgba(248, 199, 109, 0.3)"
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  captainStats: {
    flexDirection: "row-reverse",
    gap: v3Spacing.xs
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.08)"
  },
  currentRideCard: {
    gap: v3Spacing.sm
  },
  routeLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: v3Spacing.sm,
    borderRadius: v3Radius.md,
    backgroundColor: v3Alpha.blackScrim,
    padding: v3Spacing.sm
  },
  routeRail: {
    width: 18,
    alignItems: "center"
  },
  routePin: {
    width: 8,
    height: 8,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.electricBlue
  },
  routePinEnd: {
    backgroundColor: v3Colors.purpleLight
  },
  routeStroke: {
    width: 2,
    height: 28,
    backgroundColor: v3Alpha.purpleWash
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
    minHeight: 92
  },
  sessionCard: {
    gap: v3Spacing.sm
  }
});
