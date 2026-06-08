import { StyleSheet, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { V3Badge, V3Button, V3Card, V3Input, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useRideRequestFlow } from "../../hooks/useRideRequestFlow";
import { km, money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Shadows, v3Spacing } from "../../theme/v3";

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
    <V3Screen contentStyle={styles.screen}>
      <V3SectionHeader
        meta="مشوار جديد"
        title="طلب رحلة"
        subtitle="حدد نقطة الانطلاق والوجهة، ثم راجع السعر قبل تأكيد الطلب."
      />

      <V3Card tone="raised" style={styles.mapDeck} contentStyle={styles.mapContent}>
        <MobileRideMap pickup={pickup} destination={destination} rideStatus="searching" height={286} />
        <View pointerEvents="none" style={styles.mapStatus}>
          <V3Badge label={destination ? "الوجهة محددة" : "حدد الوجهة"} tone={destination ? "success" : "primary"} />
        </View>
      </V3Card>

      <V3Card tone="raised" style={styles.bottomPanel} contentStyle={styles.panelContent}>
        <View style={styles.sheetHandle} />

        <View style={styles.panelHeader}>
          <View style={styles.panelCopy}>
            <V3Text variant="subtitle">تفاصيل الرحلة</V3Text>
            <V3Text variant="caption" tone="muted">مسار واضح، سعر متوقع، وطريقة دفع قبل التأكيد.</V3Text>
          </View>
          <V3Button
            title={status === "location" ? "جاري..." : "موقعي"}
            size="sm"
            fullWidth={false}
            variant="secondary"
            onPress={useGpsLocation}
            loading={status === "location"}
            style={styles.locationButton}
          />
        </View>

        <View style={styles.routeBox}>
          <View style={styles.routeRail}>
            <View style={styles.routeDotStart} />
            <View style={styles.routeLine} />
            <View style={styles.routeDotEnd} />
          </View>
          <View style={styles.routeFields}>
            <View style={styles.routePoint}>
              <V3Badge label="من" tone="blue" />
              <View style={styles.routeCopy}>
                <V3Text variant="caption" tone="muted">نقطة الانطلاق</V3Text>
                <V3Text selectable variant="label" numberOfLines={1}>{pickup?.label || "-"}</V3Text>
              </View>
            </View>
            <View style={styles.routePoint}>
              <V3Badge label="إلى" tone={destination ? "success" : "primary"} />
              <View style={styles.routeCopy}>
                <V3Text variant="caption" tone="muted">الوجهة</V3Text>
                <V3Input
                  value={destinationQuery}
                  onChangeText={searchDestination}
                  placeholder="إلى أين تريد الذهاب؟"
                  style={styles.destinationInput}
                />
              </View>
            </View>
          </View>
        </View>

        {suggestions.length ? (
          <View style={styles.suggestions}>
            {suggestions.map((place) => (
              <V3Card
                key={`${place.city}-${place.label}`}
                tone="quiet"
                compact
                onPress={() => chooseDestination(place)}
                accessibilityLabel={place.label}
                style={styles.suggestion}
                contentStyle={styles.suggestionContent}
              >
                <View style={styles.suggestionCopy}>
                  <V3Text selectable variant="label" numberOfLines={1}>{place.label}</V3Text>
                  <V3Text selectable variant="caption" tone="muted" numberOfLines={1}>{place.category || "مكان"} - {place.city}</V3Text>
                </View>
                <V3Badge label="اختيار" tone="blue" />
              </V3Card>
            ))}
          </View>
        ) : null}

        <View style={styles.cityRail}>
          {cityChoices.map((city) => (
            <V3Button
              key={city.value}
              title={city.label}
              size="sm"
              fullWidth={false}
              variant={cityId === city.value ? "primary" : "ghost"}
              onPress={() => useCityFallback(city.value)}
              style={styles.choiceButton}
            />
          ))}
        </View>

        {status === "quote" ? <V3Text tone="muted">نحسب السعر والمسافة الآن...</V3Text> : null}

        <View style={styles.summaryGrid}>
          <V3Card tone="quiet" compact style={styles.summaryCard} contentStyle={styles.summaryContent}>
            <V3Text variant="caption" tone="muted">السعر المتوقع</V3Text>
            <V3Text selectable variant="title" style={styles.price}>{quote ? money(quote.fareIls) : "--"}</V3Text>
          </V3Card>
          <V3Card tone="quiet" compact style={styles.summaryCard} contentStyle={styles.summaryContent}>
            <V3Text variant="caption" tone="muted">المسافة</V3Text>
            <V3Text selectable variant="subtitle" tone="blue">{quote ? km(quote.distanceKm) : "اختر الوجهة"}</V3Text>
          </V3Card>
        </View>

        <View style={styles.metrics}>
          <V3Badge label={destination?.label || "اختر الوجهة"} tone="primary" />
          <V3Badge label={quote?.etaMinutes ? `${quote.etaMinutes} دقيقة` : "الوقت"} tone="blue" />
        </View>

        <View style={styles.paymentSection}>
          <V3Text variant="label">طريقة الدفع</V3Text>
          <View style={styles.paymentRail}>
            {paymentMethods.map((method) => (
              <V3Button
                key={method.value}
                title={method.label}
                size="sm"
                fullWidth={false}
                variant={paymentMethod === method.value ? "primary" : "secondary"}
                onPress={() => setPaymentMethod(method.value)}
                style={styles.paymentButton}
              />
            ))}
          </View>
        </View>

        {error ? (
          <V3Card tone="quiet" compact style={styles.errorCard}>
            <V3Text selectable tone="danger">{error}</V3Text>
          </V3Card>
        ) : null}

        <V3Button
          title={status === "create" ? "جاري الطلب..." : "طلب الرحلة الآن"}
          onPress={submitRide}
          loading={status === "create"}
        />
      </V3Card>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: v3Spacing.md
  },
  mapDeck: {
    borderColor: v3Colors.border,
    boxShadow: v3Shadows.card
  },
  mapContent: {
    padding: 0,
    overflow: "hidden"
  },
  mapStatus: {
    position: "absolute",
    top: v3Spacing.sm,
    left: v3Spacing.sm
  },
  bottomPanel: {
    borderColor: v3Colors.border,
    borderTopLeftRadius: v3Radius.screen,
    borderTopRightRadius: v3Radius.screen,
    backgroundColor: "rgba(11, 8, 18, 0.98)"
  },
  panelContent: {
    gap: v3Spacing.md
  },
  sheetHandle: {
    alignSelf: "center",
    width: 54,
    height: 4,
    borderRadius: v3Radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.14)"
  },
  panelHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.sm
  },
  panelCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  locationButton: {
    minWidth: 102
  },
  routeBox: {
    flexDirection: "row-reverse",
    gap: v3Spacing.sm,
    borderRadius: v3Radius.xl,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Colors.backgroundDeep,
    padding: v3Spacing.md
  },
  routeRail: {
    width: 24,
    alignItems: "center",
    paddingTop: v3Spacing.xs
  },
  routeDotStart: {
    width: 12,
    height: 12,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.electricBlue
  },
  routeLine: {
    width: 1,
    flex: 1,
    minHeight: 54,
    backgroundColor: v3Alpha.purpleWash
  },
  routeDotEnd: {
    width: 12,
    height: 12,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.purpleLight
  },
  routeFields: {
    flex: 1,
    minWidth: 0,
    gap: v3Spacing.md
  },
  routePoint: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: v3Spacing.sm
  },
  routeCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xs
  },
  destinationInput: {
    alignSelf: "stretch"
  },
  suggestions: {
    gap: v3Spacing.xs
  },
  suggestion: {
    borderColor: v3Colors.border
  },
  suggestionContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.sm
  },
  suggestionCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  cityRail: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  },
  choiceButton: {
    flexGrow: 1,
    minWidth: 92
  },
  summaryGrid: {
    flexDirection: "row-reverse",
    gap: v3Spacing.sm
  },
  summaryCard: {
    flex: 1
  },
  summaryContent: {
    alignItems: "flex-end",
    gap: v3Spacing.xs
  },
  price: {
    color: v3Colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontVariant: ["tabular-nums"]
  },
  metrics: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  },
  paymentSection: {
    alignItems: "flex-end",
    gap: v3Spacing.xs
  },
  paymentRail: {
    alignSelf: "stretch",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  },
  paymentButton: {
    flexGrow: 1,
    minWidth: 100
  },
  errorCard: {
    borderColor: "rgba(255, 97, 116, 0.28)"
  }
});
