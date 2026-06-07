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
    <View style={[styles.bottomNavShell, { bottom: Math.max(v3Spacing.sm, insets.bottom + v3Spacing.xs) }]}>
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
      {state.toast ? (
        <View style={styles.toast}>
          <V3Text selectable variant="caption" tone="soft" align="center">{state.toast}</V3Text>
        </View>
      ) : null}
      {state.connectionMessage ? (
        <View style={styles.banner}>
          <V3Text selectable variant="caption" tone="danger" align="center">{state.connectionMessage}</V3Text>
        </View>
      ) : null}
      {showConnectionBanner ? (
        <View style={styles.banner}>
          <V3Text selectable variant="caption" tone="warning" align="center">
            التحديث المباشر غير متاح الآن، يمكنك التحديث يدويا.
          </V3Text>
        </View>
      ) : null}
      {area === "driver" ? <DriverNavigator /> : state.role === "customer" || area === "customer" ? <CustomerNavigator /> : <AuthNavigator />}
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
    minHeight: 132
  },
  shell: {
    flex: 1,
    backgroundColor: v3Colors.background
  },
  bottomNavShell: {
    position: "absolute",
    left: v3Spacing.md,
    right: v3Spacing.md,
    minHeight: v3Layout.bottomNavHeight,
    borderRadius: v3Radius.pill,
    borderWidth: 1,
    borderColor: v3Colors.borderStrong,
    backgroundColor: v3Alpha.blackScrim,
    padding: 6,
    boxShadow: v3Shadows.card
  },
  bottomNavDock: {
    minHeight: v3Layout.bottomNavHeight - 12,
    borderRadius: v3Radius.pill,
    borderWidth: 1,
    borderColor: v3Colors.border,
    backgroundColor: v3Colors.surface,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v3Spacing.xs
  },
  tab: {
    flex: 1,
    flexBasis: 0,
    flexShrink: 1,
    minWidth: 58,
    minHeight: 48,
    borderRadius: v3Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    gap: v3Spacing.xxs,
    paddingHorizontal: v3Spacing.xs
  },
  tabActive: {
    backgroundColor: v3Alpha.purpleWash
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
    width: 24,
    height: 5,
    backgroundColor: v3Colors.purpleLight,
    boxShadow: v3Shadows.purple
  },
  tabLabel: {
    color: v3Colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
    writingDirection: "rtl",
    includeFontPadding: false,
    alignSelf: "stretch"
  },
  tabLabelActive: {
    color: v3Colors.text
  },
  toast: {
    backgroundColor: v3Alpha.purpleWash,
    borderBottomWidth: 1,
    borderBottomColor: v3Colors.borderStrong,
    padding: v3Spacing.sm
  },
  banner: {
    backgroundColor: "rgba(255, 97, 116, 0.11)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 97, 116, 0.26)",
    padding: v3Spacing.sm
  }
});
