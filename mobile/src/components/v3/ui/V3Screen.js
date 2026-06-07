import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { v3Alpha, v3Colors, v3Layout, v3Spacing } from "../../../theme/v3";

export function V3Screen({
  children,
  scroll = true,
  padded = true,
  style,
  contentStyle,
  topInset = true,
  bottomInset = true
}) {
  const insets = useSafeAreaInsets();
  const paddingTop = topInset ? Math.max(v3Spacing.lg, insets.top + v3Layout.screenTopPadding) : v3Spacing.lg;
  const paddingBottom = bottomInset ? Math.max(v3Layout.screenBottomPadding, insets.bottom + v3Spacing.xxl) : v3Spacing.xxl;
  const content = [
    styles.content,
    padded && styles.padded,
    { paddingTop, paddingBottom },
    !scroll && styles.flexContent,
    contentStyle
  ];

  return (
    <View style={[styles.root, style]}>
      <View pointerEvents="none" style={styles.topTrace} />
      <View pointerEvents="none" style={styles.gridLine} />
      {scroll ? (
        <ScrollView
          style={styles.scroller}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={content}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={content}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: v3Colors.background,
    writingDirection: "rtl"
  },
  scroller: {
    flex: 1
  },
  content: {
    gap: v3Spacing.md
  },
  flexContent: {
    flex: 1
  },
  padded: {
    paddingHorizontal: v3Layout.screenPadding
  },
  topTrace: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 118,
    backgroundColor: v3Alpha.purpleSoft,
    borderBottomWidth: 1,
    borderBottomColor: v3Colors.border
  },
  gridLine: {
    position: "absolute",
    top: 118,
    right: v3Layout.screenPadding,
    left: v3Layout.screenPadding,
    height: 1,
    backgroundColor: v3Alpha.blueWash
  }
});
