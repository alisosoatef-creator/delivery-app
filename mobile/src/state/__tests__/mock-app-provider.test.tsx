import { describe, expect, it } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";

import { MockAppProvider, useMockAppSession, useMockRideRequests } from "@/state/mock-app-context";
import { captainHomeMock } from "@/mock/captain-home";

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

function RideRequestsProbe() {
  const [rideRequests, dispatchRideRequests] = useMockRideRequests();

  return (
    <View>
      <Text>{rideRequests.availableRequests[0]?.id ?? "no-requests"}</Text>
      <Text>{String(rideRequests.availableRequests.length)}</Text>
      <Pressable
        accessibilityLabel="submit live request"
        onPress={() =>
          dispatchRideRequests({
            request: {
              ...captainHomeMock.availableRequests[0],
              id: "request-live-provider",
              price: "31 شيكل",
            },
            type: "submit-customer-request",
          })
        }
      >
        <Text>submit live request</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="accept live request"
        onPress={() => dispatchRideRequests({ requestId: "request-live-provider", type: "accept-request" })}
      >
        <Text>accept live request</Text>
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

  it("provides app-level mock ride requests to children", async () => {
    const screen = await render(
      <MockAppProvider>
        <RideRequestsProbe />
      </MockAppProvider>
    );

    expect(screen.getByText("request-001")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("submit live request"));

    expect(screen.getByText("request-live-provider")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("accept live request"));

    expect(screen.getByText("request-001")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });
});
