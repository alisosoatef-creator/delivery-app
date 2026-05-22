import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { appConfig } from "./config/appConfig";
import { AppNavigator } from "./navigation/AppNavigator";
import { MobileAppProvider } from "./store/mobileStore";
import { devLogStartup } from "./utils/startupDiagnostics";

export default function App() {
  useEffect(() => {
    devLogStartup("app started", { apiBaseUrl: appConfig.apiBaseUrl, socketUrl: appConfig.socketUrl });
  }, []);

  return (
    <ErrorBoundary>
      <MobileAppProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </MobileAppProvider>
    </ErrorBoundary>
  );
}
