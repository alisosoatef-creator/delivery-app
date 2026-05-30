import { I18nManager, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingState, PressableScale } from "../components/ui";
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
import { colors, layout, nav, radii, shadows, spacing } from "../utils/mobileTheme";

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
    <View style={[styles.tabsShell, { bottom: Math.max(spacing.sm, insets.bottom + spacing.xs) }]}>
      <View style={styles.tabs}>
        {tabs.map(([screen, label]) => {
          const active = state.activeScreen === screen;
          return (
            <PressableScale
              key={screen}
              accessibilityLabel={label}
              onPress={() => dispatch({ type: "navigate", area, screen })}
              style={[styles.tab, active && styles.tabActive]}
              pressedStyle={styles.tabPressed}
            >
              <View style={[styles.tabDot, active && styles.tabDotActive]} />
              <Text
                selectable={false}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.tabLabel, active && styles.tabLabelActive]}
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
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
        <LoadingState message="جاري استعادة الجلسة..." />
      </View>
    );
  }
  return (
    <View style={styles.root}>
      {state.toast ? <Text selectable style={styles.toast}>{state.toast}</Text> : null}
      {state.connectionMessage ? <Text selectable style={styles.banner}>{state.connectionMessage}</Text> : null}
      {showConnectionBanner ? <Text selectable style={styles.banner}>التحديث المباشر غير متاح الآن، يمكنك التحديث يدويًا.</Text> : null}
      {area === "driver" ? <DriverNavigator /> : state.role === "customer" || area === "customer" ? <CustomerNavigator /> : <AuthNavigator />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  restore: { flex: 1, backgroundColor: colors.background, justifyContent: "center", padding: spacing.lg },
  shell: { flex: 1 },
  tabsShell: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    minHeight: layout.bottomNavHeight,
    borderRadius: radii.pill,
    backgroundColor: nav.dock,
    borderWidth: 1,
    borderColor: nav.dockBorder,
    padding: 5,
    boxShadow: shadows.lift
  },
  tabs: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs
  },
  tab: {
    flex: 1,
    flexBasis: 0,
    flexShrink: 1,
    minWidth: 58,
    minHeight: 46,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: spacing.xs
  },
  tabActive: { backgroundColor: nav.active },
  tabPressed: { opacity: 0.9 },
  tabDot: {
    width: 5,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255, 255, 255, 0.16)"
  },
  tabDotActive: { width: 22, height: 5, backgroundColor: nav.activeLine, boxShadow: shadows.glow },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
    writingDirection: "rtl",
    includeFontPadding: false,
    alignSelf: "stretch"
  },
  tabLabelActive: { color: colors.text },
  toast: {
    color: colors.text,
    backgroundColor: "rgba(154, 105, 255, 0.16)",
    padding: spacing.sm,
    textAlign: "center",
    fontWeight: "800"
  },
  banner: {
    color: colors.text,
    backgroundColor: "rgba(255, 100, 117, 0.15)",
    padding: spacing.sm,
    textAlign: "center",
    fontWeight: "800"
  }
});
