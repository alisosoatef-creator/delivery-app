import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useCustomerRides } from "../../hooks/useCustomerRides";
import { money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

function rideStatusTone(status) {
  if (status === "completed") return "success";
  if (status === "cancelled") return "danger";
  return "warning";
}

export function MyRidesScreen() {
  const { rides, status, error, load, continueRide, goToRequest, isActiveRide, paymentLabel, ratingLabel, statusLabel } = useCustomerRides();

  return (
    <V3Screen>
      <V3SectionHeader
        meta="رحلاتي"
        title="سجل الرحلات"
        subtitle="الرحلات النشطة والسابقة في سجل واضح وسهل المتابعة."
        actionLabel="تحديث"
        onAction={load}
      />

      <View style={styles.toolbar}>
        <V3Badge label={`${rides.length} رحلة`} tone="primary" />
        <V3Button title="طلب رحلة" size="sm" fullWidth={false} variant="secondary" onPress={goToRequest} />
      </View>

      {status === "loading" ? (
        <V3Card tone="quiet" compact>
          <V3Text tone="muted">جاري تحميل الرحلات...</V3Text>
        </V3Card>
      ) : null}

      {error ? (
        <V3Card tone="quiet" compact style={styles.errorCard}>
          <V3Text selectable tone="danger">{error}</V3Text>
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

      {rides.map((ride) => {
        const active = isActiveRide(ride);
        const rating = ratingLabel(ride);

        return (
          <V3Card key={ride.id} tone={active ? "accent" : "raised"} contentStyle={styles.rideCard}>
            <View style={styles.rideHeader}>
              <View style={styles.rideCopy}>
                <V3Text variant="subtitle" numberOfLines={1}>{ride.destination || "رحلة"}</V3Text>
                <V3Text variant="caption" tone="muted" numberOfLines={2}>
                  {ride.pickup ? `${ride.pickup} إلى ${ride.destination}` : "تفاصيل الرحلة"}
                </V3Text>
              </View>
              <V3Badge label={statusLabel(ride.status)} tone={rideStatusTone(ride.status)} />
            </View>

            <View style={styles.metaRow}>
              <V3Badge label={money(ride.price || ride.fareIls)} tone="dark" />
              <V3Badge label={paymentLabel(ride.paymentMethod)} tone="blue" />
              {rating ? <V3Badge label={rating} tone="success" /> : null}
            </View>

            {active ? (
              <V3Button title="متابعة الرحلة" onPress={() => continueRide(ride)} />
            ) : null}
          </V3Card>
        );
      })}
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm
  },
  errorCard: {
    borderColor: "rgba(255, 97, 116, 0.42)"
  },
  emptyState: {
    alignItems: "flex-end",
    gap: v3Spacing.sm
  },
  rideCard: {
    gap: v3Spacing.md
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
    gap: v3Spacing.xxs
  },
  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flexWrap: "wrap",
    gap: v3Spacing.xs,
    paddingTop: v3Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: v3Colors.border,
    backgroundColor: v3Alpha.blackScrim,
    borderRadius: v3Radius.lg,
    padding: v3Spacing.sm
  }
});
