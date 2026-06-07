import { StyleSheet, View } from "react-native";
import { MobileRideMap } from "../../components/map/MobileRideMap";
import { V3Badge, V3Button, V3Card, V3Input, V3Screen, V3SectionHeader, V3Text } from "../../components/v3/ui";
import { useRideRequestFlow } from "../../hooks/useRideRequestFlow";
import { km, money } from "../../utils/formatters";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

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
    <V3Screen>
      <V3SectionHeader
        meta="مشوار جديد"
        title="ابن الرحلة من الخريطة"
        subtitle="حدد نقطة الانطلاق والوجهة ثم راجع السعر قبل تأكيد الطلب."
      />

      <V3Card tone="raised" style={styles.mapDeck} contentStyle={styles.mapContent}>
        <MobileRideMap pickup={pickup} destination={destination} rideStatus="searching" height={260} />
        <View pointerEvents="none" style={styles.mapStatus}>
          <V3Badge label={destination ? "الوجهة محددة" : "حدد الوجهة"} tone={destination ? "success" : "primary"} />
        </View>
      </V3Card>

      <V3Card tone="accent" style={styles.bottomPanel} contentStyle={styles.panelContent}>
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
          />
        </View>

        <View style={styles.routeBox}>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <V3Badge label="من" tone="blue" />
            <View style={styles.routeCopy}>
              <V3Text variant="caption" tone="muted">نقطة الانطلاق</V3Text>
              <V3Text selectable numberOfLines={2}>{pickup?.label || "-"}</V3Text>
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
                  <V3Text selectable variant="caption" tone="muted" numberOfLines={1}>{place.category || "مكان"} · {place.city}</V3Text>
                </View>
                <V3Badge label="اختيار" tone="blue" />
              </V3Card>
            ))}
          </View>
        ) : null}

        <V3Card tone="raised" compact contentStyle={styles.quoteCard}>
          <View style={styles.quoteHeader}>
            <View style={styles.quoteCopy}>
              <V3Text variant="caption" tone="muted">السعر المتوقع</V3Text>
              <V3Text selectable variant="title" style={styles.price}>{quote ? money(quote.fareIls) : "--"}</V3Text>
            </View>
            <V3Badge label={quote ? km(quote.distanceKm) : "المسافة"} tone="dark" />
          </View>
          <View style={styles.metrics}>
            <V3Badge label={destination?.label || "اختر الوجهة"} tone="primary" />
            <V3Badge label={quote?.etaMinutes ? `${quote.etaMinutes} دقيقة` : "الوقت"} tone="blue" />
          </View>
        </V3Card>

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
  mapDeck: {
    borderColor: v3Colors.borderStrong
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
    borderTopLeftRadius: v3Radius.screen,
    borderTopRightRadius: v3Radius.screen,
    borderColor: v3Colors.borderStrong
  },
  panelContent: {
    gap: v3Spacing.md
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
  routeBox: {
    gap: v3Spacing.sm,
    borderRadius: v3Radius.xl,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Alpha.blackScrim,
    padding: v3Spacing.md
  },
  routeLine: {
    position: "absolute",
    right: 32,
    top: 48,
    bottom: 48,
    width: 1,
    backgroundColor: v3Colors.borderStrong
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
  cityRail: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  },
  choiceButton: {
    minWidth: 98,
    flexGrow: 1
  },
  suggestions: {
    gap: v3Spacing.xs
  },
  suggestion: {
    borderColor: v3Colors.borderBlue
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
  quoteCard: {
    borderColor: v3Colors.border
  },
  quoteHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.sm
  },
  quoteCopy: {
    alignItems: "flex-end",
    gap: v3Spacing.xxs
  },
  price: {
    color: v3Colors.white,
    fontSize: 34,
    lineHeight: 40,
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
    minWidth: 104
  },
  errorCard: {
    borderColor: "rgba(255, 97, 116, 0.42)"
  }
});
