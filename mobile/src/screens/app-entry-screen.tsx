import { useState } from "react";

import { CustomerAuthScreen } from "@/screens/customer-auth-screen";
import { CustomerHomeScreen } from "@/screens/customer-home-screen";
import { WelcomeScreen } from "@/screens/welcome-screen";

type EntryMode = "welcome" | "login" | "register" | "customer";

export function AppEntryScreen() {
  const [entryMode, setEntryMode] = useState<EntryMode>("welcome");
  const [captainNotice, setCaptainNotice] = useState<string | null>(null);

  if (entryMode === "customer") {
    return <CustomerHomeScreen />;
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
      captainNotice={captainNotice}
      onCaptainEntry={() => setCaptainNotice("واجهة الكابتن التجريبية ستكون في المرحلة القادمة")}
      onCustomerLogin={() => setEntryMode("login")}
      onCustomerRegister={() => setEntryMode("register")}
    />
  );
}
