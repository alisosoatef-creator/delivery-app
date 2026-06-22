import { useWindowDimensions } from "react-native";

import { spacing } from "@/design/tokens";

const COMPACT_SCREEN_MAX_WIDTH = 359;
const CONTENT_MAX_WIDTH = 640;
const FLOATING_NAV_MAX_WIDTH = 520;

export type ResponsiveLayout = {
  contentMaxWidth: number;
  horizontalPadding: number;
  isCompact: boolean;
  navInset: number;
  navItemGap: number;
};

export function getResponsiveLayout(width: number): ResponsiveLayout {
  const safeWidth = Math.max(width, 280);
  const isCompact = safeWidth <= COMPACT_SCREEN_MAX_WIDTH;
  const horizontalPadding = isCompact ? spacing.sm : spacing.lg;
  const navInset = Math.max(
    horizontalPadding,
    Math.round((safeWidth - FLOATING_NAV_MAX_WIDTH) / 2)
  );

  return {
    contentMaxWidth: CONTENT_MAX_WIDTH,
    horizontalPadding,
    isCompact,
    navInset,
    navItemGap: isCompact ? spacing.xxs : spacing.xs
  };
}

export function useResponsiveLayout(): ResponsiveLayout {
  const { width } = useWindowDimensions();

  return getResponsiveLayout(width);
}
