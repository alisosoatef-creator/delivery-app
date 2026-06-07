import { StyleSheet, Text, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { BrandMark, ChoiceChip, InfoRow, MobileBadge, MobileButton, MobileCard, MobileInput, PressableScale, ScreenContainer, SectionHeader } from "../../components/ui";
import { useRideRequestFlow } from "../../hooks/useRideRequestFlow";
import { km, money } from "../../utils/formatters";
import { colors, depth, radii, shadows, spacing } from "../../utils/mobileTheme";

export function RequestRideScreen() {
  const {
    cityId,
    pickup,
    destination,
    destinationQuery,
    suggestions,
    quote,
    paymentMethod,
    setPaymentMethod,
    status,
    error,
    cityChoices,
    paymentMethods,
    useGpsLocation,
    useCityFallback,
    searchDestination,
    chooseDestination,
    submitRide
  } = useRideRequestFlow();

  return (
    <ScreenContainer showHeader={false} compact>
      <View style={styles.commandHeader}>
        <BrandMark compact />
        <View style={styles.headerCopy}>
          <Text selectable style={styles.eyebrow}>مشوار جديد</Text>
          <Text selectable style={styles.title}>ابن الرحلة من الخريطة</Text>
        </View>
      </View>

      <View style={styles.mapDeck}>
        <MobileRideMap pickup={pickup} destination={destination} rideStatus="searching" height={246} />
        <View style={styles.mapPulse} />
        <View pointerEvents="none" style={styles.mapStatus}>
          <MobileBadge label={destination ? "الوجهة محددة" : "حدد الوجهة"} tone={destination ? "success" : "info"} />
        </View>
      </View>

      <MobileCard tone="command" style={styles.composer}>
        <SectionHeader title="تفاصيل الرحلة" subtitle="نقطة الانطلاق والوجهة والسعر في مسار واحد واضح." />
        <View style={styles.composerTop}>
          <View style={styles.stepBlock}>
            <Text selectable style={styles.stepNumber}>01</Text>
            <Text selectable style={styles.stepLabel}>نقطة الانطلاق</Text>
          </View>
          <MobileButton title={status === "location" ? "جاري..." : "موقعي"} compact variant="secondary" onPress={useGpsLocation} loading={status === "location"} />
        </View>
        <View style={styles.cityRail}>
          {cityChoices.map((city) => (
            <ChoiceChip key={city.value} label={city.label} selected={cityId === city.value} onPress={() => useCityFallback(city.value)} />
          ))}
        </View>
        <InfoRow label="من" value={pickup?.label || "-"} accent />

        <View style={styles.stepBlockWide}>
          <Text selectable style={styles.stepNumber}>02</Text>
          <Text selectable style={styles.stepLabel}>الوجهة</Text>
        </View>
        <MobileInput value={destinationQuery} onChangeText={searchDestination} placeholder="إلى أين تريد الذهاب؟" />
        {status === "quote" ? <Text selectable style={styles.muted}>نحسب السعر والمسافة الآن...</Text> : null}
        {suggestions.map((place) => (
          <PressableScale key={`${place.city}-${place.label}`} onPress={() => chooseDestination(place)} style={styles.suggestion} pressedStyle={styles.pressed}>
            <View style={styles.suggestionCopy}>
              <Text selectable numberOfLines={1} style={styles.suggestionTitle}>{place.label}</Text>
              <Text selectable numberOfLines={1} style={styles.suggestionMeta}>{place.category || "مكان"} · {place.city}</Text>
            </View>
            <Text selectable={false} style={styles.suggestionArrow}>↗</Text>
          </PressableScale>
        ))}
      </MobileCard>

      <MobileCard tone="action" style={styles.summarySticky}>
        <View style={styles.summaryHeader}>
          <View>
            <Text selectable style={styles.stepNumber}>03</Text>
            <Text selectable style={styles.stepLabel}>تأكيد الطلب</Text>
          </View>
          <Text selectable style={styles.price}>{quote ? money(quote.fareIls) : "--"}</Text>
        </View>
        <View style={styles.metrics}>
          <Text selectable numberOfLines={1} style={styles.metric}>{destination?.label || "اختر الوجهة"}</Text>
          <Text selectable style={styles.metric}>{quote ? km(quote.distanceKm) : "المسافة"}</Text>
          <Text selectable style={styles.metric}>{quote?.etaMinutes ? `${quote.etaMinutes} دقيقة` : "الوقت"}</Text>
        </View>
        <View style={styles.cityRail}>
          {paymentMethods.map((method) => (
            <ChoiceChip key={method.value} label={method.label} selected={paymentMethod === method.value} onPress={() => setPaymentMethod(method.value)} />
          ))}
        </View>
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
        <MobileButton title={status === "create" ? "جاري الطلب..." : "طلب الرحلة الآن"} variant="accent" onPress={submitRide} loading={status === "create"} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  commandHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  headerCopy: { flex: 1, alignItems: "flex-end" },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  title: { color: colors.text, fontSize: 22, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  mapDeck: { borderRadius: radii.xxl, overflow: "hidden", borderWidth: 1, borderColor: depth.violetLine, boxShadow: shadows.glow },
  mapPulse: { position: "absolute", right: 18, top: 18, width: 9, height: 9, borderRadius: radii.pill, backgroundColor: colors.primary, boxShadow: "0 0 20px rgba(166, 130, 255, 0.66)" },
  mapStatus: { position: "absolute", left: spacing.sm, top: spacing.sm },
  composer: { gap: spacing.sm },
  composerTop: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  stepBlock: { alignItems: "flex-end" },
  stepBlockWide: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.xs, justifyContent: "flex-start" },
  stepNumber: { color: colors.primary, fontSize: 11, fontWeight: "900", textAlign: "right" },
  stepLabel: { color: colors.text, fontSize: 15, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  cityRail: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs },
  suggestion: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    borderWidth: 1,
    borderColor: depth.hairline
  },
  suggestionCopy: { flex: 1, alignItems: "flex-end", minWidth: 0 },
  pressed: { opacity: 0.9 },
  suggestionTitle: { color: colors.text, fontWeight: "900", textAlign: "right", writingDirection: "rtl", alignSelf: "stretch" },
  suggestionMeta: { color: colors.muted, textAlign: "right", marginTop: 2, fontSize: 12, writingDirection: "rtl", alignSelf: "stretch" },
  suggestionArrow: { color: colors.primary, fontSize: 16, fontWeight: "900" },
  summarySticky: { gap: spacing.sm },
  summaryHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  price: { color: colors.text, fontSize: 30, fontWeight: "900", textAlign: "right" },
  metrics: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs },
  metric: { color: colors.textSoft, backgroundColor: "rgba(0, 0, 0, 0.16)", paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radii.pill, fontSize: 12, fontWeight: "800", overflow: "hidden", maxWidth: "100%" },
  muted: { color: colors.muted, textAlign: "right", fontWeight: "700", writingDirection: "rtl" },
  error: { color: colors.red, textAlign: "right", fontWeight: "800", writingDirection: "rtl" }
});
