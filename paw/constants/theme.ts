/**
 * University of Leeds Design System colours
 * https://designsystem.leeds.ac.uk/docs/colours.html
 */

import { Platform } from "react-native";

// ── Brand Reds ──
export const LeedsRed = {
  dark: "#910000",
  base: "#c70000",
  bright: "#ff4e36",
  pastel: "#ff8a7a",
  faded: "#ffeded",
} as const;

// ── Brand Greens / Teal ──
export const LeedsGreen = {
  dark: "#156265",
  bright: "#026E7A",
  light: "#ABC6C7",
} as const;

// ── New Brand Teal ──
export const LeedsTeal = {
  base: "#00D0A0",
  dark: "#00A881",
} as const;

// ── Tertiary Blues ──
export const LeedsBlue = {
  dark: "#00323d",
  base: "#003a52",
  bright: "#1a84c7",
} as const;

// ── Blacks ──
export const LeedsBlack = {
  dark: "#0a0202",
  base: "#212121",
  light: "#6e6b6b",
  faded: "#dedede",
} as const;

// ── Cool Greys ──
export const LeedsGrey = {
  dark: "#6a645d",
  medium: "#bcb8b3",
  base: "#ddd9d5",
  light: "#eae8e6",
  faded: "#f3f2f1",
} as const;

// ── Warm Greys ──
export const LeedsWarmGrey = {
  dark: "#5f5754",
  medium: "#81746e",
  base: "#b7aaa4",
  light: "#cac2ba",
  faded: "#efeae6",
} as const;

// ── Creams ──
export const LeedsCream = {
  dark: "#ddcfc0",
  medium: "#e9e1d8",
  base: "#f6eee5",
  light: "#faf6f1",
} as const;

// ── Whites ──
export const LeedsWhite = {
  dark: "#fffbf5",
  base: "#ffffff",
} as const;

// ── Text ──
export const LeedsFont = {
  dark: "#0e0c0c",
  base: "#212529",
  light: "#3B3B3B",
  xLight: "#636363",
} as const;

// ── Borders ──
export const LeedsBorder = {
  light: "#c9c8c5",
  base: "#51504c",
} as const;

// ── Alerts ──
export const LeedsAlert = {
  error: "#d4351c",
  warning: "#e76f16",
  success: "#3a9018",
  info: "#1993bd",
} as const;

// ── App theme (monochromatic, mapped from Leeds palette) ──
export const Colors = {
  light: {
    text: LeedsFont.base,
    background: LeedsWhite.base,
    tint: LeedsFont.light,
    icon: LeedsFont.xLight,
    tabIconDefault: LeedsGrey.medium,
    tabIconSelected: LeedsFont.light,
    card: "#F9FAFB",
    cardHighlight: "#F9FAFB",
    subtleText: LeedsFont.xLight,
    rankText: LeedsGrey.medium,
    divider: LeedsBorder.light,
    surfaceBg: LeedsGrey.faded,
  },
  dark: {
    text: LeedsGrey.faded,
    background: LeedsBlack.dark,
    tint: LeedsGrey.light,
    icon: LeedsGrey.dark,
    tabIconDefault: LeedsGrey.dark,
    tabIconSelected: LeedsGrey.light,
    card: "#1C1C1E",
    cardHighlight: "#343436",
    subtleText: LeedsBlack.light,
    rankText: LeedsBlack.light,
    divider: "#48484A",
    surfaceBg: LeedsBlack.dark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
