import { useState } from "react";

import { CaptainAuthScreen } from "@/screens/captain-auth-screen";
import { CaptainHomeScreen } from "@/screens/captain-home-screen";
import { CustomerAuthScreen } from "@/screens/customer-auth-screen";
import { CustomerHomeScreen } from "@/screens/customer-home-screen";
import { WelcomeScreen } from "@/screens/welcome-screen";

type EntryMode = "welcome" | "login" | "register" | "customer" | "captain-auth" | "captain";

export function AppEntryScreen() {
  const [entryMode, setEntryMode] = useState<EntryMode>("welcome");

  if (entryMode === "customer") {
    return <CustomerHomeScreen />;
  }

  if (entryMode === "captain") {
    return <CaptainHomeScreen />;
  }

  if (entryMode === "captain-auth") {
    return <CaptainAuthScreen onBack={() => setEntryMode("welcome")} onSubmit={() => setEntryMode("captain")} />;
  }

  if (entryMode === "login" || entryMode === "register") {
    return (
      <CustomerAuthScreen
        mode={entryMode}
        onBack={() => setEntryMode("welcome")}
        onSubmit={() => setEntryMode("customer")}
      />
    );
  }

  return (
    <WelcomeScreen
      onCaptainEntry={() => setEntryMode("captain-auth")}
      onCustomerLogin={() => setEntryMode("login")}
      onCustomerRegister={() => setEntryMode("register")}
    />
  );
}
