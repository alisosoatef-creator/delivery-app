import { describe, expect, it } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";

import { MockAppProvider, useMockAppSession } from "@/state/mock-app-context";

function SessionProbe() {
  const [session, dispatchSession] = useMockAppSession();

  return (
    <View>
      <Text>{session.entryMode}</Text>
      <Text>{session.activeRole}</Text>
      <Pressable
        accessibilityLabel="open customer login"
        onPress={() => dispatchSession({ type: "open-customer-login" })}
      >
        <Text>open customer login</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="complete customer auth"
        onPress={() => dispatchSession({ type: "complete-customer-auth" })}
      >
        <Text>complete customer auth</Text>
      </Pressable>
    </View>
  );
}

describe("MockAppProvider", () => {
  it("provides app-level mock session state to children", async () => {
    const screen = await render(
      <MockAppProvider>
        <SessionProbe />
      </MockAppProvider>
    );

    expect(screen.getByText("welcome")).toBeTruthy();
    expect(screen.getByText("guest")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("open customer login"));
    expect(screen.getByText("customer-login")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("complete customer auth"));
    expect(screen.getByText("customer-home")).toBeTruthy();
    expect(screen.getByText("customer")).toBeTruthy();
  });
});
