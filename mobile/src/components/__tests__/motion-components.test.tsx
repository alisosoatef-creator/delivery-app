import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { Text } from "react-native";

import { MotionPressable } from "@/components/motion-pressable";
import { getMotionDuration, MotionSurface } from "@/components/motion-surface";

describe("Wasel motion components", () => {
  it("provides an accessible default touch target contract", async () => {
    const screen = await render(
      <MotionPressable accessibilityLabel="زر وصول" disabled>
        <Text>زر وصول</Text>
      </MotionPressable>
    );

    const button = screen.getByLabelText("زر وصول");

    expect(button.props.accessible).toBe(true);
    expect(button.props.accessibilityRole).toBe("button");
    expect(button.props.accessibilityState).toEqual({ disabled: true });
    expect(button.props.hitSlop).toEqual({ bottom: 8, left: 8, right: 8, top: 8 });
  });

  it("keeps press interactions functional while using the shared motion control", async () => {
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const screen = await render(
      <MotionPressable
        accessibilityLabel="زر متحرك"
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Text>تنفيذ</Text>
      </MotionPressable>
    );

    const button = screen.getByLabelText("زر متحرك");
    await fireEvent(button, "pressIn");
    await fireEvent(button, "pressOut");
    await fireEvent.press(button);

    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("emits optional selection feedback only when requested", async () => {
    const hapticSpy = jest.spyOn(Haptics, "selectionAsync").mockResolvedValue();
    const screen = await render(
      <MotionPressable
        accessibilityLabel="تبديل التبويب"
        feedback="selection"
        onPress={() => undefined}
      >
        <Text>تبديل</Text>
      </MotionPressable>
    );

    await fireEvent.press(screen.getByLabelText("تبديل التبويب"));

    expect(hapticSpy).toHaveBeenCalledTimes(1);
    hapticSpy.mockRestore();
  });

  it("removes entrance duration when the device requests reduced motion", async () => {
    expect(getMotionDuration(false, 220)).toBe(220);
    expect(getMotionDuration(true, 220)).toBe(0);

    const screen = await render(
      <MotionSurface testID="reduced-motion-aware-surface">
        <Text>محتوى سريع</Text>
      </MotionSurface>
    );

    expect(screen.getByTestId("reduced-motion-aware-surface")).toBeTruthy();
  });
});
