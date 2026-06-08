import { StyleSheet, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { V3Badge, V3Button, V3Card, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useCustomerActiveRide } from "../../hooks/useCustomerActiveRide";
import { useMobileApp } from "../../store/mobileStore";
import { money } from "../../utils/formatters";
import { isActiveRide, statusLabel } from "../../utils/rideStatus";
import { v3Alpha, v3Colors, v3Radius, v3Shadows, v3Spacing } from "../../theme/v3";

function acceptedDriverName(ride) {
  const visible = ["accepted", "driver_arriving", "arrived", "in_progress"].includes(ride?.status);
  return visible ? ride?.driver?.fullName || ride?.driverName || "" : "";
}

function ridePoint(ride, type) {
  const prefix = type === "pickup" ? "pickup" : "destination";
  const lat = Number(ride?.[`${prefix}Lat`]);
  const lng = Number(ride?.[`${prefix}Lng`]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label: ride?.[prefix] || type };
}

export function CustomerHomeScreen() {
  const { state, dispatch } = useMobileApp();
  const { refreshActiveRide } = useCustomerActiveRide();
  const activeRide = isActiveRide(state.currentRide) ? state.currentRide : null;
  const driverName = acceptedDriverName(activeRide);
  const firstName = state.currentUser?.fullName?.split(" ")?.[0] || "علي";
  const previewPickup = activeRide ? ridePoint(activeRide, "pickup") : state.pickup || state.currentLocation;
  const previewDestination = activeRide ? ridePoint(activeRide, "destination") : state.destination;

  const shortcuts = [
    ["المحفظة", "wallet", "الدفع والرصيد", "محفظة"],
    ["الدعم", "support", "مساعدة منظمة", "دعم"],
    ["الحساب", "account", "بياناتك", "حساب"],
    ["السجل", "rides", "كل الرحلات", "رحلات"]
  ];

  return (
    <V3Screen contentStyle={styles.screen}>
      <View style={styles.appHeader}>
        <View style={styles.brandLockup}>
          <View style={styles.brandMark}>
            <V3Text variant="subtitle" align="center" style={styles.brandGlyph}>W</V3Text>
          </View>
          <View style={styles.brandCopy}>
            <V3Text variant="caption" tone="muted">تطبيق الزبون</V3Text>
            <V3Text variant="subtitle" numberOfLines={1}>واصل</V3Text>
          </View>
        </View>
        <V3Badge label={activeRide ? "رحلة نشطة" : "جاهز"} tone={activeRide ? "warning" : "success"} />
      </View>

      <View style={styles.heroCopy}>
        <V3Text variant="caption" tone="blue">مرحبا {firstName}</V3Text>
        <V3Text variant="title" numberOfLines={2}>أين وجهتك اليوم؟</V3Text>
      </View>

      <V3Card
        tone="quiet"
        compact
        onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })}
        accessibilityLabel="طلب رحلة"
        style={styles.searchCard}
        contentStyle={styles.searchContent}
      >
        <View style={styles.searchIcon}>
          <V3Text variant="caption" align="center" tone="accent">بحث</V3Text>
        </View>
        <View style={styles.searchCopy}>
          <V3Text variant="label" numberOfLines={1}>إلى أين تريد الذهاب؟</V3Text>
          <V3Text variant="caption" tone="muted" numberOfLines={1}>اختر الوجهة وشاهد السعر قبل الطلب</V3Text>
        </View>
      </V3Card>

      <V3Card tone="raised" style={styles.mapHero} contentStyle={styles.mapContent}>
        <MobileRideMap
          pickup={previewPickup}
          destination={previewDestination}
          userLocation={state.currentLocation}
          driverLocation={state.driverLocation}
          rideStatus={activeRide?.status || "searching"}
          height={184}
        />
        <View pointerEvents="none" style={styles.mapCaption}>
          <V3Text variant="caption" tone="soft" numberOfLines={1}>
            {activeRide ? statusLabel(activeRide.status) : "خريطة مشوارك"}
          </V3Text>
        </View>
      </V3Card>

      <View style={styles.rideStarter}>
        <V3Button title="طلب رحلة" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} />
        <V3Button
          title="تحديث"
          size="sm"
          fullWidth={false}
          variant="secondary"
          onPress={refreshActiveRide}
          loading={state.activeRideStatus === "loading"}
          style={styles.refreshButton}
        />
      </View>

      <V3Card tone="raised" contentStyle={styles.statusStrip}>
        <View style={styles.statusItem}>
          <V3Text variant="caption" tone="muted">الحالة</V3Text>
          <V3Text variant="label" tone={activeRide ? "warning" : "success"}>{activeRide ? "رحلة قيد المتابعة" : "جاهز للطلب"}</V3Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <V3Text variant="caption" tone="muted">الدفع</V3Text>
          <V3Text variant="label">نقدا / محفظة</V3Text>
        </View>
      </V3Card>

      {activeRide ? (
        <V3Card tone="blue" style={styles.activeRideCard} contentStyle={styles.activeRideContent}>
          <View style={styles.rowBetween}>
            <V3Badge label={statusLabel(activeRide.status)} tone="warning" />
            <V3Text variant="subtitle">متابعة المشوار</V3Text>
          </View>
          <View style={styles.routeCard}>
            <V3Text variant="caption" tone="muted">المسار</V3Text>
            <V3Text selectable numberOfLines={2}>
              {`${activeRide.pickup || "-"} إلى ${activeRide.destination || "-"}`}
            </V3Text>
          </View>
          <View style={styles.activeFooter}>
            <V3Badge label={money(activeRide.price || activeRide.fareIls)} tone="dark" />
            {driverName ? (
              <V3Text selectable variant="caption" tone="muted" numberOfLines={1}>الكابتن: {driverName}</V3Text>
            ) : (
              <V3Text selectable variant="caption" tone="muted" numberOfLines={1}>بانتظار قبول كابتن</V3Text>
            )}
          </View>
          <V3Button title="فتح التتبع" size="sm" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "ride-status" })} />
        </V3Card>
      ) : null}

      <V3Card tone="raised" contentStyle={styles.quickSection}>
        <V3SectionHeader
          title="اختصارات"
          subtitle="الوصول السريع لأهم مساحات حسابك."
        />
        <View style={styles.quickActionGrid}>
          {shortcuts.map(([label, screen, hint, mark]) => (
            <V3Card
              key={screen}
              tone="quiet"
              compact
              onPress={() => dispatch({ type: "navigate", area: "customer", screen })}
              accessibilityLabel={label}
              style={styles.quickAction}
              contentStyle={styles.quickActionContent}
            >
              <V3Badge label={mark} tone="primary" />
              <View style={styles.quickCopy}>
                <V3Text variant="label" numberOfLines={1}>{label}</V3Text>
                <V3Text variant="caption" tone="muted" numberOfLines={2}>{hint}</V3Text>
              </View>
            </V3Card>
          ))}
        </View>
      </V3Card>

      {state.activeRideStatus === "loading" ? (
        <V3Card tone="quiet" compact>
          <V3Text tone="muted">جاري فحص الرحلة النشطة...</V3Text>
        </V3Card>
      ) : null}
      {state.activeRideError ? (
        <V3Card tone="quiet" compact style={styles.errorCard}>
          <V3Text selectable tone="danger">{state.activeRideError}</V3Text>
        </V3Card>
      ) : null}
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: v3Spacing.md
  },
  appHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.md
  },
  brandLockup: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: v3Spacing.sm,
    flex: 1,
    minWidth: 0
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: v3Radius.lg,
    backgroundColor: v3Alpha.purpleWash,
    borderWidth: 1,
    borderColor: v3Colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  brandGlyph: {
    color: v3Colors.purpleLight,
    lineHeight: 24
  },
  brandCopy: {
    alignItems: "flex-end",
    gap: v3Spacing.xxs,
    minWidth: 0
  },
  heroCopy: {
    alignItems: "flex-end",
    gap: v3Spacing.xs
  },
  searchCard: {
    borderColor: v3Colors.border,
    backgroundColor: v3Colors.surfaceRaised
  },
  searchContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: v3Spacing.sm
  },
  searchIcon: {
    width: 34,
    height: 34,
    borderRadius: v3Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: v3Alpha.blueWash,
    borderWidth: 1,
    borderColor: v3Colors.border
  },
  searchCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  mapHero: {
    borderColor: v3Colors.border,
    boxShadow: v3Shadows.card
  },
  mapContent: {
    padding: 0,
    overflow: "hidden"
  },
  mapCaption: {
    position: "absolute",
    top: v3Spacing.sm,
    right: v3Spacing.sm,
    minHeight: 30,
    paddingHorizontal: v3Spacing.sm,
    borderRadius: v3Radius.pill,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.blackScrim,
    alignItems: "center",
    justifyContent: "center"
  },
  rideStarter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: v3Spacing.sm
  },
  refreshButton: {
    minWidth: 108
  },
  statusStrip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between"
  },
  statusItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  statusDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: v3Colors.border
  },
  activeRideCard: {
    borderColor: v3Colors.border
  },
  activeRideContent: {
    gap: v3Spacing.sm
  },
  rowBetween: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.sm
  },
  routeCard: {
    alignItems: "flex-end",
    gap: v3Spacing.xs,
    borderRadius: v3Radius.lg,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.whiteSoft,
    padding: v3Spacing.sm
  },
  activeFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: v3Spacing.sm
  },
  quickSection: {
    gap: v3Spacing.md
  },
  quickActionGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.sm
  },
  quickAction: {
    flexBasis: "47.5%",
    flexGrow: 1,
    minWidth: 132
  },
  quickActionContent: {
    minHeight: 76,
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  quickCopy: {
    alignSelf: "stretch",
    alignItems: "flex-end",
    gap: v3Spacing.xxs,
    minWidth: 0
  },
  errorCard: {
    borderColor: "rgba(255, 97, 116, 0.42)"
  }
});
