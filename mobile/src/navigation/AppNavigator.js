import { I18nManager, StyleSheet, Text, View } from "react-native";
import { MobileButton } from "../components/ui";
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
import { AvailableRidesScreen } from "../screens/driver/AvailableRidesScreen";
import { CurrentRideScreen } from "../screens/driver/CurrentRideScreen";
import { DevDriverLoginScreen } from "../screens/driver/DevDriverLoginScreen";
import { DriverEarningsScreen } from "../screens/driver/DriverEarningsScreen";
import { DriverHomeScreen } from "../screens/driver/DriverHomeScreen";
import { DriverSupportScreen } from "../screens/driver/DriverSupportScreen";
import { useMobileApp } from "../store/mobileStore";
import { colors } from "../utils/mobileTheme";

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

function AuthNavigator() {
  const { state } = useMobileApp();
  if (state.activeScreen === "register") return <RegisterScreen />;
  if (state.activeScreen === "otp") return <OtpScreen />;
  return <LoginScreen />;
}

function AppTabs({ area }) {
  const { state, dispatch } = useMobileApp();
  const tabs = area === "driver"
    ? [["home", "الرئيسية"], ["available", "المتاحة"], ["current", "الحالية"], ["earnings", "الأرباح"], ["support", "الدعم"]]
    : [["home", "الرئيسية"], ["request", "طلب"], ["rides", "رحلاتي"], ["wallet", "محفظة"], ["support", "الدعم"], ["account", "حسابي"]];

  return (
    <View style={styles.tabs}>
      {tabs.map(([screen, label]) => (
        <MobileButton
          key={screen}
          title={label}
          variant={state.activeScreen === screen ? "primary" : "secondary"}
          onPress={() => dispatch({ type: "navigate", area, screen })}
        />
      ))}
    </View>
  );
}

function CustomerNavigator() {
  const { state } = useMobileApp();
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
  return (
    <View style={styles.root}>
      {state.toast ? <Text selectable style={styles.toast}>{state.toast}</Text> : null}
      {area === "driver" ? <DriverNavigator /> : state.role === "customer" || area === "customer" ? <CustomerNavigator /> : <AuthNavigator />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  shell: { flex: 1 },
  tabs: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
    backgroundColor: "#090d13",
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  toast: {
    color: colors.text,
    backgroundColor: "rgba(215, 181, 109, 0.18)",
    padding: 10,
    textAlign: "center"
  }
});
