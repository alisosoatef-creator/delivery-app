import { Component } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { clearMobileSession } from "../services/sessionStorage";
import { disconnectMobileSocket } from "../services/socketClient";
import { colors, radii, shadows, spacing } from "../utils/mobileTheme";
import { MobileButton } from "./ui";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.error("[Wasel Mobile] runtime error", error, info?.componentStack);
    }
  }

  retry = () => {
    this.setState((state) => ({ error: null, info: null, resetKey: state.resetKey + 1 }));
  };

  clearSession = async () => {
    disconnectMobileSocket();
    await clearMobileSession();
    this.retry();
  };

  render() {
    if (!this.state.error) {
      return <View key={this.state.resetKey} style={styles.fill}>{this.props.children}</View>;
    }

    return (
      <ScrollView style={styles.root} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text selectable style={styles.title}>حدث خطأ في تطبيق الموبايل</Text>
          <Text selectable style={styles.message}>تم التقاط الخطأ داخل التطبيق بدل شاشة Expo العامة. جرّب إعادة المحاولة، أو امسح الجلسة إذا كان الخطأ متعلقًا بتسجيل الدخول.</Text>
          {typeof __DEV__ !== "undefined" && __DEV__ ? (
            <View style={styles.devBox}>
              <Text selectable style={styles.devTitle}>تفاصيل DEV</Text>
              <Text selectable style={styles.devText}>{this.state.error?.message || String(this.state.error)}</Text>
              {this.state.info?.componentStack ? <Text selectable style={styles.stack}>{this.state.info.componentStack}</Text> : null}
            </View>
          ) : null}
          <MobileButton title="إعادة المحاولة" onPress={this.retry} />
          <MobileButton title="تسجيل الخروج ومسح الجلسة" variant="danger" onPress={this.clearSession} />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.background },
  content: { minHeight: "100%", justifyContent: "center", padding: spacing.lg },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    boxShadow: shadows.soft
  },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", textAlign: "right" },
  message: { color: colors.muted, lineHeight: 22, textAlign: "right" },
  devBox: { gap: spacing.sm, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.surfaceSoft },
  devTitle: { color: colors.primary, fontWeight: "900", textAlign: "right" },
  devText: { color: colors.text, textAlign: "right" },
  stack: { color: colors.muted, fontSize: 12, lineHeight: 18 }
});
