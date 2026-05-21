import { StatusBar } from "expo-status-bar";
import { AppNavigator } from "./navigation/AppNavigator";
import { MobileAppProvider } from "./store/mobileStore";

export default function App() {
  return (
    <MobileAppProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </MobileAppProvider>
  );
}
