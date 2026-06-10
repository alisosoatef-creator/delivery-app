import { AppEntryScreen } from "@/screens/app-entry-screen";
import { MockAppProvider } from "@/state/mock-app-context";

export default function IndexRoute() {
  return (
    <MockAppProvider>
      <AppEntryScreen />
    </MockAppProvider>
  );
}
