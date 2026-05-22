import { I18nManager, Pressable, StyleSheet, Text, View } from "react-native";
import { LoadingState } from "../components/ui";
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
import { colors, radii, shadows, spacing } from "../utils/mobileTheme";

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
  ["home", "الرئيسية", "بيت"],
  ["request", "طلب", "رحلة"],
  ["rides", "رحلاتي", "سجل"],
  ["wallet", "محفظة", "دفع"],
  ["support", "دعم", "مساعدة"],
  ["account", "حسابي", "ملف"]
];

const driverTabs = [
  ["home", "الرئيسية", "كابتن"],
  ["available", "المتاحة", "طلبات"],
  ["current", "الحالية", "رحلة"],
  ["earnings", "الأرباح", "مال"],
  ["support", "الدعم", "مساعدة"]
];

function AuthNavigator() {
  const { state } = useMobileApp();
  if (state.activeScreen === "register") return <RegisterScreen />;
  if (state.activeScreen === "otp") return <OtpScreen />;
  return <LoginScreen />;
}

function AppTabs({ area }) {
  const { state, dispatch } = useMobileApp();
  const tabs = area === "driver" ? driverTabs : customerTabs;

  return (
    <View style={styles.tabsShell}>
      <View style={styles.tabs}>
        {tabs.map(([screen, label, hint]) => {
          const active = state.activeScreen === screen;
          return (
            <Pressable
              key={screen}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => dispatch({ type: "navigate", area, screen })}
              style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.tabPressed]}
            >
              <Text selectable={false} style={[styles.tabHint, active && styles.tabHintActive]}>{hint}</Text>
              <Text selectable={false} style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
            </Pressable>
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
    bottom: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: "rgba(8, 12, 20, 0.86)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    padding: spacing.xs,
    boxShadow: shadows.soft
  },
  tabs: {
    flexDirection: "row-reverse",
    gap: spacing.xs
  },
  tab: {
    flex: 1,
    minHeight: 50,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  tabActive: {
    backgroundColor: colors.gold
  },
  tabPressed: {
    transform: [{ scale: 0.98 }]
  },
  tabHint: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800"
  },
  tabHintActive: {
    color: "#1b1205"
  },
  tabLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900"
  },
  tabLabelActive: {
    color: "#1b1205"
  },
  toast: {
    color: colors.text,
    backgroundColor: "rgba(231, 195, 111, 0.16)",
    padding: spacing.sm,
    textAlign: "center",
    fontWeight: "800"
  },
  banner: {
    color: colors.text,
    backgroundColor: "rgba(255, 111, 124, 0.16)",
    padding: spacing.sm,
    textAlign: "center",
    fontWeight: "800"
  }
});
