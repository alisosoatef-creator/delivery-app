import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CaptainAuthScreen } from "../captain-auth-screen";

async function renderCaptainAuthScreen() {
  const actions = {
    onBack: jest.fn(),
    onSubmit: jest.fn()
  };

  const screen = await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 48, right: 0, bottom: 34, left: 0 }
      }}
    >
      <CaptainAuthScreen {...actions} />
    </SafeAreaProvider>
  );

  return { actions, screen };
}

describe("CaptainAuthScreen", () => {
  it("renders a premium mock captain login form and submits captain data", async () => {
    const { actions, screen } = await renderCaptainAuthScreen();

    expect(screen.getByText("دخول الكابتن")).toBeTruthy();
    expect(screen.getByText("بيانات الكابتن")).toBeTruthy();
    expect(screen.getByText("رقم الجوال")).toBeTruthy();
    expect(screen.getByText("رقم المركبة")).toBeTruthy();
    expect(screen.getByText("المدينة")).toBeTruthy();
    expect(screen.getByText("دخول الكابتن التجريبي")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("رقم الجوال"), "05995551212");
    await fireEvent.changeText(screen.getByLabelText("رقم المركبة"), "12-345-67");
    await fireEvent.changeText(screen.getByLabelText("المدينة"), "نابلس");
    await fireEvent.press(screen.getByLabelText("دخول الكابتن التجريبي"));

    expect(actions.onSubmit).toHaveBeenCalledWith({
      city: "نابلس",
      phone: "05995551212",
      vehicleNumber: "12-345-67"
    });
  });

  it("can return to the welcome screen flow", async () => {
    const { actions, screen } = await renderCaptainAuthScreen();

    await fireEvent.press(screen.getByLabelText("رجوع"));

    expect(actions.onBack).toHaveBeenCalledTimes(1);
  });
});
