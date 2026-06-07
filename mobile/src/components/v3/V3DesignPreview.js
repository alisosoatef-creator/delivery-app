import { StyleSheet, View } from "react-native";
import { V3Badge, V3Button, V3Card, V3IconButton, V3Input, V3Screen, V3SectionHeader, V3Text } from "./ui";
import { v3Alpha, v3Colors, v3Radius, v3Spacing } from "../../theme/v3";

export function V3DesignPreview() {
  return (
    <V3Screen>
      <V3SectionHeader
        meta="Wasel V3"
        title="واجهة واصل الجديدة"
        subtitle="تجربة عربية هادئة بخلفية داكنة وبطاقات واضحة للحجز والتتبع."
        actionLabel="معاينة"
      />

      <V3Card tone="accent">
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <V3Badge tone="blue" label="رحلة نشطة" icon="+" />
            <V3Text variant="title" numberOfLines={2}>جاهز ننقلك؟</V3Text>
            <V3Text tone="muted" numberOfLines={3}>اختر الوجهة وشاهد تفاصيل الرحلة قبل تأكيد الطلب.</V3Text>
          </View>
          <V3IconButton tone="primary" icon="⌁" label="الموقع" />
        </View>
        <View style={styles.mapPreview}>
          <View style={styles.routeLineOne} />
          <View style={styles.routeLineTwo} />
          <View style={[styles.pin, styles.pinStart]} />
          <View style={[styles.pin, styles.pinEnd]} />
          <View style={styles.carDot} />
        </View>
        <V3Button title="تأكيد الطلب" />
      </V3Card>

      <V3Input label="الوجهة" placeholder="إلى أين وجهتك؟" leading={<V3Text variant="label" tone="blue">⌕</V3Text>} />

      <View style={styles.grid}>
        <V3Card compact tone="quiet" style={styles.gridCard}>
          <V3Text variant="caption" tone="muted">السعر المتوقع</V3Text>
          <V3Text variant="subtitle">₪ 25.00</V3Text>
        </V3Card>
        <V3Card compact tone="blue" style={styles.gridCard}>
          <V3Text variant="caption" tone="muted">وقت الوصول</V3Text>
          <V3Text variant="subtitle">8 دقائق</V3Text>
        </V3Card>
      </View>

      <V3Card tone="raised">
        <V3SectionHeader title="حالة السائق" subtitle="تحديثات مختصرة وواضحة أثناء الرحلة." />
        <View style={styles.badgeRow}>
          <V3Badge tone="primary" label="في الطريق" />
          <V3Badge tone="success" label="متصل" />
          <V3Badge tone="dark" label="3.2 كم" />
        </View>
        <View style={styles.actions}>
          <V3Button title="مشاركة الرحلة" variant="secondary" size="sm" />
          <V3Button title="إلغاء" variant="ghost" size="sm" />
        </View>
      </V3Card>
    </V3Screen>
  );
}

const styles = StyleSheet.create({
  heroTop: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: v3Spacing.md
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: v3Spacing.xs
  },
  mapPreview: {
    height: 168,
    borderRadius: v3Radius.xl,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Colors.backgroundAlt,
    overflow: "hidden"
  },
  routeLineOne: {
    position: "absolute",
    width: 92,
    height: 3,
    right: 78,
    top: 80,
    backgroundColor: v3Colors.purpleLight,
    transform: [{ rotate: "-38deg" }],
    borderRadius: v3Radius.pill
  },
  routeLineTwo: {
    position: "absolute",
    width: 70,
    height: 3,
    right: 142,
    top: 55,
    backgroundColor: v3Colors.electricBlue,
    transform: [{ rotate: "45deg" }],
    borderRadius: v3Radius.pill
  },
  pin: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: v3Colors.purpleLight,
    backgroundColor: v3Colors.black
  },
  pinStart: {
    right: 66,
    top: 102
  },
  pinEnd: {
    right: 198,
    top: 30,
    borderColor: v3Colors.electricBlue
  },
  carDot: {
    position: "absolute",
    right: 130,
    top: 69,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: v3Colors.white,
    borderWidth: 5,
    borderColor: v3Alpha.purpleWash
  },
  grid: {
    flexDirection: "row-reverse",
    gap: v3Spacing.sm
  },
  gridCard: {
    flex: 1
  },
  badgeRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: v3Spacing.xs
  },
  actions: {
    flexDirection: "row-reverse",
    gap: v3Spacing.sm
  }
});
