import { ActivityIndicator, StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useAvailableDriverRides } from "../../hooks/useAvailableDriverRides";
import { km, money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

export function AvailableRidesScreen() {
  const { rides, status, socketStatus, error, dispatchMessage, load, accept, paymentLabel, statusLabel } = useAvailableDriverRides();
  const liveConnected = socketStatus === "connected";
  const loading = status === "loading";

  return (
    <V3Screen contentStyle={styles.requestQueue}>
      <V3SectionHeader
        meta="طلبات الكابتن"
        title="الطلبات المتاحة"
        subtitle={liveConnected ? "الطلبات الجديدة تظهر مباشرة عند توفرها." : "حدث قائمة الطلبات يدويا عند الحاجة."}
        actionLabel="تحديث"
        onAction={load}
      />

      <V3Card tone={liveConnected ? "blue" : "raised"} contentStyle={styles.statusPanel}>
        <View style={styles.rowBetween}>
          <V3Badge label={liveConnected ? "مباشر" : "يدوي"} tone={liveConnected ? "success" : "warning"} />
          <View style={styles.statusCopy}>
            <V3Text variant="label" tone="primary">قائمة الطلبات</V3Text>
            <V3Text variant="caption" tone="muted">
              {rides.length ? `${rides.length} طلب متاح الآن` : "بانتظار طلب مناسب لحالتك الحالية."}
            </V3Text>
          </View>
        </View>
        <V3Button title={loading ? "جاري التحديث..." : "تحديث الطلبات"} variant="secondary" size="sm" loading={loading} onPress={load} />
      </V3Card>

      {error ? (
        <V3Card tone="quiet" style={styles.errorCard}>
          <V3Text selectable variant="caption" tone="danger">{error}</V3Text>
        </V3Card>
      ) : null}

      {status === "loading" ? (
        <V3Card tone="quiet" contentStyle={styles.loadingCard}>
          <ActivityIndicator color={v3Colors.purpleLight} size="small" />
          <V3Text variant="label" tone="soft" align="center">جاري تحميل الطلبات المتاحة...</V3Text>
        </V3Card>
      ) : null}

      {status !== "loading" && !rides.length ? (
        <V3Card tone="accent" contentStyle={styles.emptyCard}>
          <V3Badge label="لا توجد طلبات" tone="primary" />
          <V3Text variant="subtitle" tone="primary">لا توجد طلبات الآن</V3Text>
          <V3Text variant="caption" tone="muted" align="center" style={styles.centerCopy}>
            {dispatchMessage || "عند طلب رحلة من زبون ستظهر هنا."}
          </V3Text>
          <V3Button title="تحديث" variant="primary" size="sm" onPress={load} />
        </V3Card>
      ) : null}

      {rides.map((ride) => (
        <V3Card key={ride.id} tone="default" style={styles.requestCard} contentStyle={styles.requestContent}>
          <View style={styles.requestHeader}>
            <V3Badge label={statusLabel(ride.status || "searching")} tone="warning" />
            <View style={styles.routeCopy}>
              <V3Text selectable variant="subtitle" tone="primary" numberOfLines={2}>
                {ride.destination || "وجهة جديدة"}
              </V3Text>
              <V3Text selectable variant="caption" tone="muted" numberOfLines={1}>
                من {ride.pickup || "-"} إلى {ride.destination || "-"}
              </V3Text>
            </View>
          </View>

          <View style={styles.routeLine}>
            <View style={styles.routeRail}>
              <View style={styles.routePin} />
              <View style={styles.routeStroke} />
              <View style={[styles.routePin, styles.routePinEnd]} />
            </View>
            <View style={styles.routeStops}>
              <V3Text selectable variant="label" tone="soft" numberOfLines={1}>{ride.pickup || "-"}</V3Text>
              <V3Text selectable variant="label" tone="primary" numberOfLines={1}>{ride.destination || "-"}</V3Text>
            </View>
          </View>

          <View style={styles.detailBadges}>
            <V3Badge label={ride.city || ride.cityId || "المدينة"} tone="neutral" />
            <V3Badge label={km(ride.routeDistanceKm || ride.distanceKm)} tone="blue" />
            <V3Badge label={money(ride.price || ride.fareIls)} tone="primary" />
            <V3Badge label={paymentLabel(ride.paymentMethod)} tone="neutral" />
          </View>

          <V3Button title="قبول الرحلة" variant="primary" onPress={() => accept(ride.id)} />
        </V3Card>
      ))}
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  requestQueue: {
    gap: v3Spacing.lg
  },
  statusPanel: {
    gap: v3Spacing.md
  },
  rowBetween: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.md
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  errorCard: {
    borderColor: "rgba(255, 97, 116, 0.32)"
  },
  loadingCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: v3Spacing.sm,
    minHeight: 118
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: v3Spacing.sm,
    minHeight: 210
  },
  centerCopy: {
    maxWidth: 280
  },
  requestCard: {
    borderColor: v3Colors.borderStrong
  },
  requestContent: {
    gap: v3Spacing.md
  },
  requestHeader: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: v3Spacing.md
  },
  routeCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
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
  routeStops: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.sm
  },
  detailBadges: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs,
    justifyContent: "flex-start"
  }
});
