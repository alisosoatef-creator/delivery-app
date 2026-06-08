import { ActivityIndicator, I18nManager, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { V3Card, V3Text } from "../components/v3/ui";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { OtpScreen } from "../screens/auth/OtpScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { AccountScreen } from "../screens/customer/AccountScreen";
import { CustomerHomeScreen } from "../screens/customer/CustomerHomeScreen";
import { CustomerRideStatusScreen } from "../screens/customer/CustomerRideStatusScreen";
import { MyRidesScreen } from "../screens/customer/MyRidesScreen";
import { RequestRideScreen } from "../screens/customer/RequestRideScreen";
import { SupportScreen } from "../screens/customer/SupportScreen";
import { WalletScreen } from "../screens/customer/WalletScreen";
import { useCustomerActiveRide } from "../hooks/useCustomerActiveRide";
import { useCustomerRideRealtime } from "../hooks/useCustomerRideRealtime";
import { AvailableRidesScreen } from "../screens/driver/AvailableRidesScreen";
import { CurrentRideScreen } from "../screens/driver/CurrentRideScreen";
import { DevDriverLoginScreen } from "../screens/driver/DevDriverLoginScreen";
import { DriverEarningsScreen } from "../screens/driver/DriverEarningsScreen";
import { DriverHomeScreen } from "../screens/driver/DriverHomeScreen";
import { DriverSupportScreen } from "../screens/driver/DriverSupportScreen";
import { useMobileApp } from "../store/mobileStore";
import { v3Alpha, v3Colors, v3Layout, v3Radius, v3Shadows, v3Spacing } from "../theme/v3";

I18nManager.allowRTL(true);

const customerScreens = {
  home: CustomerHomeScreen,
  request: RequestRideScreen,
  "ride-status": CustomerRideStatusScreen,
  rides: MyRidesScreen,
  wallet: WalletScreen,
  support: SupportScreen,
  account: AccountScreen
};

const driverScreens = {
  home: DriverHomeScreen,
  available: AvailableRidesScreen,
  current: CurrentRideScreen,
  earnings: DriverEarningsScreen,
  support: DriverSupportScreen,
  "dev-login": DevDriverLoginScreen
};

const customerTabs = [
  ["home", "الرئيسية"],
  ["request", "اطلب"],
  ["rides", "رحلاتي"],
  ["account", "حسابي"]
];

const driverTabs = [
  ["home", "الرئيسية"],
  ["available", "طلبات"],
  ["current", "رحلتي"],
  ["earnings", "الأرباح"]
];

function AuthNavigator() {
  const { state } = useMobileApp();
  if (state.activeScreen === "register") return <RegisterScreen />;
  if (state.activeScreen === "otp") return <OtpScreen />;
  return <LoginScreen />;
}

function AppTabs({ area }) {
  const { state, dispatch } = useMobileApp();
  const insets = useSafeAreaInsets();
  const tabs = area === "driver" ? driverTabs : customerTabs;

  return (
    <View style={[styles.bottomNavShell, { bottom: Math.max(v3Spacing.md, insets.bottom + v3Spacing.xs) }]}>
      <View style={styles.bottomNavDock}>
        {tabs.map(([screen, label]) => {
          const active = state.activeScreen === screen;
          return (
            <Pressable
              key={screen}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => dispatch({ type: "navigate", area, screen })}
              style={({ pressed }) => [
                styles.tab,
                active && styles.tabActive,
                pressed && styles.tabPressed
              ]}
            >
              <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
              <Text
                selectable={false}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.tabLabel, active && styles.tabLabelActive]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function GlobalMessageLayer({ toast, connectionMessage, showConnectionBanner }) {
  const insets = useSafeAreaInsets();
  const message = toast
    || (connectionMessage ? "تعذر الاتصال مؤقتا. سنحاول التحديث تلقائيا." : "")
    || (showConnectionBanner ? "التحديث المباشر غير متاح الآن." : "");
  const tone = toast ? "soft" : showConnectionBanner ? "warning" : "danger";

  if (!message) return null;

  return (
    <View pointerEvents="none" style={[styles.messageLayer, { top: insets.top + v3Spacing.xs }]}>
      <View style={[styles.messagePill, !toast && styles.messagePillWarning]}>
        <V3Text selectable variant="caption" tone={tone} align="center" numberOfLines={2}>{message}</V3Text>
      </View>
    </View>
  );
}

function CustomerNavigator() {
  const { state } = useMobileApp();
  useCustomerActiveRide({ enabled: state.role === "customer" });
  useCustomerRideRealtime();
  const Screen = customerScreens[state.activeScreen] || CustomerHomeScreen;
  return (
    <View style={styles.shell}>
      <Screen />
      <AppTabs area="customer" />
    </View>
  );
}

function DriverNavigator() {
  const { state } = useMobileApp();
  const screenKey = state.role === "driver" ? state.activeScreen : "dev-login";
  const Screen = driverScreens[screenKey] || DriverHomeScreen;
  return (
    <View style={styles.shell}>
      <Screen />
      {state.role === "driver" ? <AppTabs area="driver" /> : null}
    </View>
  );
}

export function AppNavigator() {
  const { state } = useMobileApp();
  const area = state.activeArea;
  const showConnectionBanner = state.currentRide && state.socketStatus && !["connected", "connecting"].includes(state.socketStatus);
  if (state.restoreStatus === "loading") {
    return (
      <View style={styles.restore}>
        <V3Card tone="default" contentStyle={styles.restoreCard}>
          <ActivityIndicator color={v3Colors.purpleLight} size="small" />
          <V3Text variant="label" tone="soft" align="center">جاري استعادة الجلسة...</V3Text>
        </V3Card>
      </View>
    );
  }
  return (
    <View style={styles.root}>
      {area === "driver" ? <DriverNavigator /> : state.role === "customer" || area === "customer" ? <CustomerNavigator /> : <AuthNavigator />}
      <GlobalMessageLayer toast={state.toast} connectionMessage={state.connectionMessage} showConnectionBanner={showConnectionBanner} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: v3Colors.background
  },
  restore: {
    flex: 1,
    backgroundColor: v3Colors.background,
    justifyContent: "center",
    padding: v3Spacing.lg
  },
  restoreCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: v3Spacing.sm,
    minHeight: 112
  },
  shell: {
    flex: 1,
    backgroundColor: v3Colors.background
  },
  bottomNavShell: {
    position: "absolute",
    left: 28,
    right: 28,
    minHeight: v3Layout.bottomNavHeight,
    borderRadius: v3Radius.pill,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: "rgba(8, 9, 14, 0.92)",
    padding: 3,
    boxShadow: v3Shadows.soft
  },
  bottomNavDock: {
    minHeight: v3Layout.bottomNavHeight - 6,
    borderRadius: v3Radius.pill,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: "rgba(12, 13, 19, 0.96)",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.xs
  },
  tab: {
    flex: 1,
    flexBasis: 0,
    flexShrink: 1,
    minWidth: 48,
    minHeight: 38,
    borderRadius: v3Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    gap: v3Spacing.xxs,
    paddingHorizontal: v3Spacing.xs
  },
  tabActive: {
    backgroundColor: "rgba(139, 92, 246, 0.18)"
  },
  tabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }]
  },
  tabIndicator: {
    width: 5,
    height: 5,
    borderRadius: v3Radius.pill,
    backgroundColor: v3Colors.textFaint
  },
  tabIndicatorActive: {
    width: 20,
    height: 4,
    backgroundColor: v3Colors.purpleLight,
    boxShadow: v3Shadows.soft
  },
  tabLabel: {
    color: v3Colors.textMuted,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
    textAlign: "center",
    writingDirection: "rtl",
    includeFontPadding: false,
    alignSelf: "stretch"
  },
  tabLabelActive: {
    color: v3Colors.text
  },
  messageLayer: {
    position: "absolute",
    right: v3Spacing.lg,
    left: v3Spacing.lg,
    zIndex: 30,
    alignItems: "center"
  },
  messagePill: {
    maxWidth: 320,
    borderRadius: v3Radius.pill,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: "rgba(13, 14, 20, 0.94)",
    paddingVertical: v3Spacing.xs,
    paddingHorizontal: v3Spacing.md,
    boxShadow: v3Shadows.soft
  },
  messagePillWarning: {
    borderColor: "rgba(255, 97, 116, 0.22)",
    backgroundColor: "rgba(23, 12, 18, 0.9)"
  }
});
