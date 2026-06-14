import { Radio } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { GlassCard } from "@/components/glass-card";
import { colors, radii, spacing, typography } from "@/design/tokens";
import type { MockRealtimeConnectionSummary, MockRealtimeEvent } from "@/realtime/mock-realtime";

export function RealtimeStatusCard({
  event,
  summary,
}: {
  event: MockRealtimeEvent;
  summary: MockRealtimeConnectionSummary;
}) {
  const connectionColor = getConnectionColor(summary.tone);

  return (
    <GlassCard style={styles.card} variant="subtle">
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: getConnectionBackground(summary.tone),
            borderColor: getConnectionBorder(summary.tone),
          },
        ]}
      >
        <Radio color={connectionColor} size={18} />
      </View>
      <View style={styles.copy}>
        <View style={styles.metaRow}>
          <Text selectable style={styles.statusText}>
            {summary.label}
          </Text>
          <Text selectable style={[styles.liveText, { color: connectionColor }]}>
            {getConnectionPillLabel(summary.tone)}
          </Text>
        </View>
        <Text selectable style={[styles.syncText, { color: connectionColor }]}>
          {summary.detail}
        </Text>
        <Text selectable style={styles.title}>
          {event.title}
        </Text>
        <Text selectable style={styles.detail}>
          {event.detail}
        </Text>
      </View>
    </GlassCard>
  );
}

export function RealtimeActivityFeed({ events }: { events: MockRealtimeEvent[] }) {
  if (events.length === 0) {
    return null;
  }

  return (
    <GlassCard style={styles.feedCard} variant="subtle">
      <View style={styles.feedHeader}>
        <Text selectable style={styles.feedTitle}>
          سجل التحديثات المباشرة
        </Text>
        <Text selectable style={styles.feedMeta}>
          {`${events.length} أحداث`}
        </Text>
      </View>
      <View style={styles.feedRows}>
        {events.map((event) => (
          <View key={event.id} style={styles.feedRow}>
            <View style={styles.sequencePill}>
              <Text selectable style={styles.sequenceText}>
                {event.sequence}
              </Text>
            </View>
            <View style={styles.feedCopy}>
              <Text selectable style={styles.feedRowTitle}>
                {event.title}
              </Text>
              <Text selectable style={styles.feedRowDetail}>
                {event.detail}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const rtlText = {
  textAlign: "right" as const,
  writingDirection: "rtl" as const
};

function getConnectionColor(tone: MockRealtimeConnectionSummary["tone"]) {
  if (tone === "offline") {
    return colors.warning;
  }

  if (tone === "syncing") {
    return colors.violetSoft;
  }

  return colors.cyan;
}

function getConnectionBackground(tone: MockRealtimeConnectionSummary["tone"]) {
  if (tone === "offline") {
    return "rgba(255, 209, 102, 0.12)";
  }

  if (tone === "syncing") {
    return "rgba(139, 92, 246, 0.14)";
  }

  return "rgba(0, 229, 255, 0.1)";
}

function getConnectionBorder(tone: MockRealtimeConnectionSummary["tone"]) {
  if (tone === "offline") {
    return "rgba(255, 209, 102, 0.28)";
  }

  if (tone === "syncing") {
    return "rgba(139, 92, 246, 0.3)";
  }

  return "rgba(0, 229, 255, 0.26)";
}

function getConnectionPillLabel(tone: MockRealtimeConnectionSummary["tone"]) {
  if (tone === "offline") {
    return "محفوظ";
  }

  if (tone === "syncing") {
    return "مزامنة";
  }

  return "مباشر";
}

const styles = StyleSheet.create({
  card: {
    minHeight: 78,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(0, 229, 255, 0.28)"
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.26)",
    backgroundColor: "rgba(0, 229, 255, 0.1)"
  },
  copy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3
  },
  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs
  },
  liveText: {
    ...rtlText,
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  statusText: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  title: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  detail: {
    ...rtlText,
    color: colors.textSoft,
    fontSize: typography.compact,
    fontWeight: "700"
  },
  syncText: {
    ...rtlText,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  feedCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderColor: "rgba(139, 92, 246, 0.24)"
  },
  feedHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  feedTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  feedMeta: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  },
  feedRows: {
    gap: spacing.xs
  },
  feedRow: {
    minHeight: 54,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  sequencePill: {
    minWidth: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "rgba(0, 229, 255, 0.12)"
  },
  sequenceText: {
    color: colors.cyan,
    fontSize: typography.tiny,
    fontWeight: "900",
    fontVariant: ["tabular-nums"]
  },
  feedCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  feedRowTitle: {
    ...rtlText,
    color: colors.text,
    fontSize: typography.compact,
    fontWeight: "900"
  },
  feedRowDetail: {
    ...rtlText,
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "800"
  }
});
