import { CaptainAuthScreen } from "@/screens/captain-auth-screen";
import { CaptainHomeScreen } from "@/screens/captain-home-screen";
import { CustomerAuthScreen } from "@/screens/customer-auth-screen";
import { CustomerHomeScreen } from "@/screens/customer-home-screen";
import { WelcomeScreen } from "@/screens/welcome-screen";
import { useMockAppSession } from "@/state/mock-app-context";

export function AppEntryScreen() {
  const [session, dispatch] = useMockAppSession();
  const { entryMode } = session;

  if (entryMode === "customer-home") {
    return <CustomerHomeScreen />;
  }

  if (entryMode === "captain-home") {
    return <CaptainHomeScreen />;
  }

  if (entryMode === "captain-auth") {
    return (
      <CaptainAuthScreen
        onBack={() => dispatch({ type: "back-to-welcome" })}
        onSubmit={() => dispatch({ type: "complete-captain-auth" })}
      />
    );
  }

  if (entryMode === "customer-login" || entryMode === "customer-register") {
    const authMode = entryMode === "customer-register" ? "register" : "login";

    return (
      <CustomerAuthScreen
        mode={authMode}
        onBack={() => dispatch({ type: "back-to-welcome" })}
        onSubmit={() => dispatch({ type: "complete-customer-auth" })}
      />
    );
  }

  return (
    <WelcomeScreen
      onCaptainEntry={() => dispatch({ type: "open-captain-auth" })}
      onCustomerLogin={() => dispatch({ type: "open-customer-login" })}
      onCustomerRegister={() => dispatch({ type: "open-customer-register" })}
    />
  );
}
