/**
 * Runtime color tokens — for style props that can't use className
 * (e.g. ActivityIndicator color, LinearGradient colors, RadialProgress props).
 *
 * These match the CSS variables in global.css exactly, keyed by light/dark.
 * Import these only when className is not an option.
 */

export const themeColors = {
  light: {
    background: "#ffffff",
    foreground: "#212529",
    card: "#F9FAFB",
    tint: "#3B3B3B",
    subtle: "#636363",
    divider: "#c9c8c5",
    muted: "#bcb8b3",
    error: "#F44336",
    success: "#4CAF50",
    warning: "#FF9800",
    calScheduled: "#D1D1D6",
    calRingBg: "#E5E5EA",
    calFuture: "#C7C7CC",
    calDotNull: "#C7C7CC",
    /** rgba base for gradients (no closing paren) */
    backgroundRgba: "rgba(255,255,255,",
  },
  dark: {
    background: "#0a0202",
    foreground: "#f3f2f1",
    card: "#1C1C1E",
    tint: "#eae8e6",
    subtle: "#6e6b6b",
    divider: "#48484A",
    muted: "#6a645d",
    error: "#F44336",
    success: "#4CAF50",
    warning: "#FF9800",
    calScheduled: "#3A3A3C",
    calRingBg: "#2C2C2E",
    calFuture: "#555555",
    calDotNull: "#3A3A3C",
    /** rgba base for gradients (no closing paren) */
    backgroundRgba: "rgba(10,2,2,",
  },
} as const;

export type ThemeColorScheme = keyof typeof themeColors;
