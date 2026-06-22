import { describe, expect, it } from "@jest/globals";

import { getResponsiveLayout } from "@/design/responsive";

describe("responsive layout", () => {
  it("protects compact Android screens from horizontal overflow", () => {
    expect(getResponsiveLayout(320)).toEqual({
      contentMaxWidth: 640,
      horizontalPadding: 12,
      isCompact: true,
      navInset: 12,
      navItemGap: 4
    });
  });

  it("keeps the standard phone spacing at regular widths", () => {
    expect(getResponsiveLayout(390)).toEqual({
      contentMaxWidth: 640,
      horizontalPadding: 20,
      isCompact: false,
      navInset: 20,
      navItemGap: 8
    });
  });

  it("centers content and the floating nav on wide screens", () => {
    expect(getResponsiveLayout(800)).toEqual({
      contentMaxWidth: 640,
      horizontalPadding: 20,
      isCompact: false,
      navInset: 140,
      navItemGap: 8
    });
  });
});
