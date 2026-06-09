import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";

import { PremiumButton } from "@/components/premium-button";
import {
  accents,
  glass,
  mapStyle,
  shadows,
  touchTargets,
  waselVisualDirection
} from "../tokens";

describe("Wasel design system", () => {
  it("codifies the approved premium mobile visual direction", () => {
    expect(waselVisualDirection.theme).toBe("luxury-futuristic-rtl");
    expect(waselVisualDirection.currency).toBe("شيكل");
    expect(waselVisualDirection.background).toEqual(["deep navy", "graphite"]);
    expect(waselVisualDirection.required).toEqual(
      expect.arrayContaining(["glassmorphism", "map-first", "compact floating bottom nav", "Arabic RTL"])
    );
    expect(waselVisualDirection.forbidden).toEqual(
      expect.arrayContaining(["ride types", "heavy neon borders", "old prototype look"])
    );
  });

  it("keeps reusable visual tokens aligned with the reference", () => {
    expect(accents.primary).toEqual(["#8B5CF6", "#4D75FF", "#00E5FF"]);
    expect(glass.default.blurIntensity).toBeGreaterThanOrEqual(28);
    expect(shadows.card).toContain("rgba(0, 0, 0");
    expect(touchTargets.minimum).toBeGreaterThanOrEqual(44);
    expect(mapStyle.routeGlow).toBe("rgba(0, 229, 255, 0.78)");
  });

  it("renders a premium CTA as a real pressable button", async () => {
    const onPress = jest.fn();
    const screen = await render(
      <PremiumButton accessibilityLabel="تأكيد الطلب" label="تأكيد الطلب" onPress={onPress} />
    );

    await fireEvent.press(screen.getByLabelText("تأكيد الطلب"));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText("تأكيد الطلب")).toBeTruthy();
  });
});
