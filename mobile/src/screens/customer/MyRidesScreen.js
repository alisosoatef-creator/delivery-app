import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useCustomerRides } from "../../hooks/useCustomerRides";
import { money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Shadows, v3Spacing } from "../../theme/v3";

function rideStatusTone(status) {
  if (status === "completed") return "success";
  if (status === "cancelled") return "danger";
  return "warning";
}

export function MyRidesScreen() {
  const { rides, status, error, load, continueRide, goToRequest, isActiveRide, paymentLabel, ratingLabel, statusLabel } = useCustomerRides();
  const activeCount = rides.filter((ride) => isActiveRide(ride)).length;

  return (
    <V3Screen contentStyle={styles.screen}>
      <V3SectionHeader
        meta="رحلاتي"
        title="سجل الرحلات"
        subtitle="كل الرحلات النشطة والسابقة في عرض بسيط وواضح."
        actionLabel="تحديث"
        onAction={load}
      />

      <V3Card tone="raised" contentStyle={styles.summaryCard}>
        <View style={styles.summaryText}>
          <V3Text variant="caption" tone="blue">متابعة الرحلات</V3Text>
          <V3Text variant="subtitle">سجل مرتب بدون ازدحام</V3Text>
          <V3Text tone="muted">تابع الرحلة النشطة أو ابدأ طلبا جديدا من هنا.</V3Text>
        </View>
        <View style={styles.summaryStats}>
          <View style={styles.statPill}>
            <V3Text variant="caption" tone="muted" align="center">الإجمالي</V3Text>
            <V3Text variant="subtitle" align="center">{rides.length}</V3Text>
          </View>
          <View style={styles.statPill}>
            <V3Text variant="caption" tone="muted" align="center">نشطة</V3Text>
            <V3Text variant="subtitle" align="center">{activeCount}</V3Text>
          </View>
        </View>
      </V3Card>

      <View style={styles.toolbar}>
        <V3Badge label={`${rides.length} رحلة`} tone={activeCount ? "primary" : "blue"} />
        <View style={styles.toolbarActions}>
          <V3Button title="طلب رحلة" size="sm" fullWidth={false} variant="secondary" onPress={goToRequest} />
          <V3Button title="تحديث" size="sm" fullWidth={false} variant="ghost" onPress={load} loading={status === "loading"} />
        </View>
      </View>

      {error ? (
        <V3Card tone="quiet" compact style={styles.errorCard}>
          <V3Text selectable tone="danger">{error}</V3Text>
        </V3Card>
      ) : null}

      {status === "loading" && !rides.length ? (
        <V3Card tone="quiet" compact>
          <V3Text tone="muted">جاري تحميل الرحلات...</V3Text>
        </V3Card>
      ) : null}

      {status !== "loading" && !rides.length ? (
        <V3Card tone="raised" contentStyle={styles.emptyState}>
          <V3Badge label="لا يوجد سجل" tone="blue" />
          <V3Text variant="subtitle">لا توجد رحلات بعد</V3Text>
          <V3Text tone="muted">اطلب رحلة لتظهر هنا تفاصيلها وحالتها.</V3Text>
          <V3Button title="طلب رحلة" onPress={goToRequest} />
        </V3Card>
      ) : null}

      <View style={styles.rideList}>
        {rides.map((ride) => {
          const active = isActiveRide(ride);
          const rating = ratingLabel(ride);

          return (
            <V3Card key={ride.id} tone="raised" style={[styles.rideShell, active && styles.rideShellActive]} contentStyle={styles.rideCard}>
              <View style={styles.rideHeader}>
                <View style={styles.rideCopy}>
                  <View style={styles.titleRow}>
                    <V3Badge label={statusLabel(ride.status)} tone={rideStatusTone(ride.status)} />
                    {active ? <V3Badge label="نشطة" tone="primary" /> : null}
                  </View>
                  <V3Text variant="subtitle" numberOfLines={1}>{ride.destination || "رحلة"}</V3Text>
                  <V3Text variant="caption" tone="muted" numberOfLines={2}>
                    {ride.pickup ? `${ride.pickup} إلى ${ride.destination || "-"}` : "تفاصيل الرحلة"}
                  </V3Text>
                </View>
                <View style={styles.pricePill}>
                  <V3Text variant="caption" tone="muted" align="center">السعر</V3Text>
                  <V3Text selectable variant="label" align="center">{money(ride.price || ride.fareIls)}</V3Text>
                </View>
              </View>

              <View style={styles.routeLine}>
                <View style={styles.routeDotBlue} />
                <View style={styles.routeStem} />
                <View style={styles.routeDotPurple} />
              </View>

              <View style={styles.metaRow}>
                <V3Badge label={paymentLabel(ride.paymentMethod)} tone="dark" />
                {rating ? <V3Badge label={rating} tone="success" /> : null}
              </View>

              {active ? (
                <V3Button title="متابعة الرحلة" onPress={() => continueRide(ride)} />
              ) : null}
            </V3Card>
          );
        })}
      </View>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: v3Spacing.sm
  },
  summaryCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.md
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xs
  },
  summaryStats: {
    flexDirection: "row-reverse",
    gap: v3Spacing.xs
  },
  statPill: {
    minWidth: 58,
    paddingVertical: v3Spacing.xs,
    paddingHorizontal: v3Spacing.sm,
    borderRadius: v3Radius.md,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.blackScrim
  },
  toolbar: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm
  },
  toolbarActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: v3Spacing.xs
  },
  errorCard: {
    borderColor: "rgba(255, 97, 116, 0.24)"
  },
  emptyState: {
    alignItems: "flex-end",
    gap: v3Spacing.sm,
    paddingVertical: v3Spacing.lg
  },
  rideList: {
    gap: v3Spacing.sm
  },
  rideShell: {
    borderColor: "rgba(255, 255, 255, 0.09)"
  },
  rideShellActive: {
    borderColor: "rgba(139, 92, 246, 0.24)",
    boxShadow: v3Shadows.soft
  },
  rideCard: {
    gap: v3Spacing.sm
  },
  rideHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: v3Spacing.sm
  },
  rideCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xs
  },
  titleRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  },
  pricePill: {
    minWidth: 78,
    paddingVertical: v3Spacing.xs,
    paddingHorizontal: v3Spacing.sm,
    borderRadius: v3Radius.md,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.blackScrim
  },
  routeLine: {
    alignSelf: "stretch",
    height: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: v3Spacing.xs
  },
  routeDotBlue: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: v3Colors.electricBlue,
    boxShadow: v3Shadows.blue
  },
  routeStem: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)"
  },
  routeDotPurple: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: v3Colors.purpleLight,
    boxShadow: v3Shadows.purple
  },
  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flexWrap: "wrap",
    gap: v3Spacing.xs,
    padding: v3Spacing.xs,
    borderRadius: v3Radius.md,
    backgroundColor: "rgba(255, 255, 255, 0.035)"
  }
});
