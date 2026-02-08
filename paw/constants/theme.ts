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
