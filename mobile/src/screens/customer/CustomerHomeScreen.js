import { StyleSheet, Text, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { BrandMark, InfoRow, MobileBadge, MobileButton, MobileCard, PressableScale, ScreenContainer, StatCard } from "../../components/ui";
import { useCustomerActiveRide } from "../../hooks/useCustomerActiveRide";
import { useMobileApp } from "../../store/mobileStore";
import { money } from "../../utils/formatters";
import { colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";
import { isActiveRide, statusLabel } from "../../utils/rideStatus";

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
    ["المحفظة", "wallet", "الدفع والرصيد"],
    ["الدعم", "support", "مساعدة منظمة"],
    ["الحساب", "account", "بياناتك"],
    ["السجل", "rides", "كل الرحلات"]
  ];

  return (
    <ScreenContainer showHeader={false} compact>
      <View style={styles.topBar}>
        <BrandMark compact />
        <MobileBadge label={activeRide ? "رحلة نشطة" : "جاهز"} tone={activeRide ? "warning" : "success"} />
      </View>

      <MobileCard tone="map" style={styles.mapHero}>
        <MobileRideMap
          pickup={previewPickup}
          destination={previewDestination}
          userLocation={state.currentLocation}
          driverLocation={state.driverLocation}
          rideStatus={activeRide?.status || "searching"}
          height={188}
        />
        <View pointerEvents="none" style={styles.mapCaption}>
          <Text selectable={false} style={styles.mapCaptionText}>{activeRide ? statusLabel(activeRide.status) : "خريطة مشوارك"}</Text>
        </View>
      </MobileCard>

      <MobileCard tone="command" style={styles.heroSystem}>
        <View style={styles.heroCopy}>
          <Text selectable style={styles.greeting}>أهلا {firstName}</Text>
          <Text selectable style={styles.title}>إلى أين اليوم؟</Text>
          <Text selectable style={styles.subtitle}>ابدأ من الخريطة، اختر الوجهة، وشاهد السعر قبل تأكيد الطلب.</Text>
        </View>
        <PressableScale
          accessibilityLabel="اختيار الوجهة"
          onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })}
          style={styles.searchBar}
          pressedStyle={styles.quickPressed}
        >
          <Text selectable={false} style={styles.searchHint}>اكتب وجهتك أو اختر من الخريطة</Text>
          <View style={styles.searchGlyph}><Text selectable={false} style={styles.searchGlyphText}>↗</Text></View>
        </PressableScale>
        <View style={styles.heroActions}>
          <MobileButton title="طلب رحلة" variant="accent" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "request" })} />
          <MobileButton title="تحديث الحالة" variant="secondary" compact onPress={refreshActiveRide} />
        </View>
      </MobileCard>

      {activeRide ? (
        <MobileCard tone="hero" style={styles.activeRideCard}>
          <View style={styles.rowBetween}>
            <MobileBadge label={statusLabel(activeRide.status)} tone="warning" />
            <Text selectable style={styles.cardTitle}>متابعة المشوار</Text>
          </View>
          <InfoRow label="المسار" value={`${activeRide.pickup || "-"} ← ${activeRide.destination || "-"}`} accent />
          <View style={styles.activeFooter}>
            <Text selectable style={styles.activePrice}>{money(activeRide.price || activeRide.fareIls)}</Text>
            {driverName ? <Text selectable style={styles.muted}>الكابتن: {driverName}</Text> : <Text selectable style={styles.muted}>بانتظار قبول كابتن</Text>}
          </View>
          <MobileButton title="فتح التتبع" compact variant="accent" onPress={() => dispatch({ type: "navigate", area: "customer", screen: "ride-status" })} />
        </MobileCard>
      ) : null}

      <View style={styles.statDeck}>
        <StatCard label="الجاهزية" value="فورية" hint="طلب وتتبع" tone="blue" />
        <StatCard label="الدفع" value="مرن" hint="نقدا أو تجريبي" />
      </View>

      <View style={styles.quickActionGrid}>
        {shortcuts.map(([label, screen, hint]) => (
          <PressableScale
            key={screen}
            accessibilityLabel={label}
            onPress={() => dispatch({ type: "navigate", area: "customer", screen })}
            style={styles.quickAction}
            pressedStyle={styles.quickPressed}
          >
            <Text selectable={false} style={styles.quickMark}>{label.slice(0, 1)}</Text>
            <View style={styles.quickCopy}>
              <Text selectable numberOfLines={1} ellipsizeMode="tail" style={styles.quickLabel}>{label}</Text>
              <Text selectable numberOfLines={2} ellipsizeMode="tail" style={styles.quickHint}>{hint}</Text>
            </View>
          </PressableScale>
        ))}
      </View>

      {state.activeRideStatus === "loading" ? <Text selectable style={styles.muted}>جاري فحص الرحلة النشطة...</Text> : null}
      {state.activeRideError ? <Text selectable style={styles.error}>{state.activeRideError}</Text> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  mapHero: { padding: 0, borderRadius: radii.xxl, borderColor: depth.violetLine },
  mapCaption: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: "rgba(4, 3, 8, 0.72)",
    borderWidth: 1,
    borderColor: depth.glassLine
  },
  mapCaptionText: { color: colors.text, fontSize: 11, fontWeight: "900", writingDirection: "rtl" },
  heroSystem: { gap: spacing.md, borderColor: depth.violetLine },
  heroCopy: { alignItems: "flex-end", gap: 4 },
  greeting: { color: colors.primary, fontSize: 14, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  title: { color: colors.text, fontSize: 31, lineHeight: 37, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  subtitle: { color: colors.textSoft, fontSize: 13.5, lineHeight: 21, textAlign: "right", writingDirection: "rtl" },
  searchBar: {
    minHeight: 56,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: depth.violetLine,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    paddingHorizontal: spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  searchHint: { color: colors.text, fontWeight: "900", textAlign: "right", writingDirection: "rtl", flex: 1 },
  searchGlyph: { width: 32, height: 32, borderRadius: radii.pill, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  searchGlyphText: { color: colors.black, fontWeight: "900", fontSize: 16 },
  heroActions: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.xs, flexWrap: "wrap" },
  activeRideCard: { gap: spacing.xs, borderColor: depth.violetLine },
  rowBetween: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  activeFooter: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  activePrice: { color: colors.primary, fontSize: 21, fontWeight: "900" },
  statDeck: { flexDirection: "row-reverse", gap: spacing.sm },
  quickActionGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm },
  quickAction: {
    width: "47.5%",
    flexBasis: "47.5%",
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 132,
    maxWidth: "48.5%",
    minHeight: 88,
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    borderWidth: 1,
    borderColor: depth.hairline,
    boxShadow: shadows.soft
  },
  quickPressed: { opacity: 0.9 },
  quickMark: { color: colors.primary, fontSize: 18, fontWeight: "900" },
  quickCopy: { alignItems: "flex-end", gap: 2, alignSelf: "stretch", minWidth: 0 },
  quickLabel: { color: colors.text, fontSize: 14.5, lineHeight: 18, fontWeight: "900", textAlign: "right", writingDirection: "rtl", alignSelf: "stretch" },
  quickHint: { color: colors.muted, fontSize: 11.5, lineHeight: 16, fontWeight: "700", textAlign: "right", writingDirection: "rtl", alignSelf: "stretch" },
  muted: { color: colors.muted, textAlign: "right", fontWeight: "700", writingDirection: "rtl" },
  error: { color: colors.red, textAlign: "right", fontWeight: "800", writingDirection: "rtl" }
});
