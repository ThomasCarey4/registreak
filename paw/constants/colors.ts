/**
 * Shared colour palette — single source of truth.
 *
 * • Imported by tailwind.config.js (via require) to define Tailwind tokens.
 * • Imported directly by components that need a raw hex string
 *   (LinearGradient, tabBarActiveTintColor, SVG props, RadialProgress, etc.).
 *
 * Every colour used in the app lives here — nowhere else.
 */

import { Platform } from "react-native";

// ─── Brand ────────────────────────────────────────────
export const brandRed = {
  dark: "#910000",
  DEFAULT: "#c70000",
  bright: "#ff4e36",
  pastel: "#ff8a7a",
  faded: "#ffeded",
} as const;

export const brandGreen = {
  dark: "#156265",
  DEFAULT: "#026E7A",
  light: "#ABC6C7",
} as const;

export const brandTeal = {
  DEFAULT: "#00D0A0",
  dark: "#00A881",
} as const;

export const brandBlue = {
  dark: "#00323d",
  DEFAULT: "#003a52",
  bright: "#1a84c7",
} as const;

// ─── Semantic / UI (light + dark) ─────────────────────
export const palette = {
  light: {
    background: "#ffffff",
    foreground: "#212529",
    foregroundMuted: "#636363",
    card: "#F9FAFB",
    cardHighlight: "#F9FAFB",
    surface: "#f3f2f1",
    tint: "#3B3B3B",
    icon: "#636363",
    tabDefault: "#bcb8b3",
    tabActive: "#3B3B3B",
    border: "#c9c8c5",
    divider: "#c9c8c5",
    rankText: "#bcb8b3",
    subtleText: "#636363",

    // Calendar
    calendarWeekday: "#8E8E93",
    calendarCell: "#E5E5EA",
    calendarCellMuted: "#D1D1D6",
    calendarFuture: "#C7C7CC",

    // Toast
    toastErrorBg: "#FFF5F5",
    toastErrorBorder: "#FFCDD2",
    toastErrorIconBg: "#FFCDD2",
    toastErrorTitle: "#C62828",
    toastErrorBody: "#E57373",
    toastErrorProgress: "#EF5350",

    // Cell states (attend code input)
    cellBorder: "#D0D5DD",
    cellErrorBg: "#FBE9E7",
    cellSuccessBg: "#E8F5E9",

    // Lecture list
    lectureCardBg: "#ffffff",

    // Selection highlight
    selectionHighlight: "rgba(0,0,0,0.05)",

    // Divider (rgba)
    dividerSubtle: "rgba(0,0,0,0.06)",

    // Streak label text
    streakLabel: "rgba(55,65,81,0.4)",
    statsLabel: "rgba(55,65,81,0.35)",
    lectureDatePrimary: "rgba(55,65,81,0.7)",
    lectureDateSecondary: "rgba(55,65,81,0.35)",
    lectureSubtitle: "rgba(55,65,81,0.5)",
    lectureCode: "rgba(55,65,81,0.3)",
    lectureTime: "rgba(55,65,81,0.6)",
    lectureTimeEnd: "rgba(55,65,81,0.3)",
    noLecturesText: "rgba(55,65,81,0.3)",

    // Fade gradient
    fadeStart: "rgba(255,255,255,0)",
    fadeMid: "rgba(255,255,255,0.9)",
    fadeEnd: "rgba(255,255,255,1)",
  },
  dark: {
    background: "#0a0202",
    foreground: "#f3f2f1",
    foregroundMuted: "#6e6b6b",
    card: "#1C1C1E",
    cardHighlight: "#343436",
    surface: "#0a0202",
    tint: "#eae8e6",
    icon: "#6a645d",
    tabDefault: "#6a645d",
    tabActive: "#eae8e6",
    border: "#48484A",
    divider: "#48484A",
    rankText: "#6e6b6b",
    subtleText: "#6e6b6b",

    // Calendar
    calendarWeekday: "#8E8E93",
    calendarCell: "#2C2C2E",
    calendarCellMuted: "#3A3A3C",
    calendarFuture: "#555555",

    // Toast
    toastErrorBg: "#2B1C1C",
    toastErrorBorder: "#4A2D2D",
    toastErrorIconBg: "#4A2D2D",
    toastErrorTitle: "#EF9A9A",
    toastErrorBody: "#EF9A9A",
    toastErrorProgress: "#F44336",

    // Cell states
    cellBorder: "#333333",
    cellErrorBg: "#3a1a1a",
    cellSuccessBg: "#1a3a1a",

    // Lecture list
    lectureCardBg: "#1C1C1E",

    // Selection highlight
    selectionHighlight: "rgba(255,255,255,0.08)",

    // Divider (rgba)
    dividerSubtle: "rgba(255,255,255,0.06)",

    // Streak label text
    streakLabel: "rgba(236,237,238,0.5)",
    statsLabel: "rgba(236,237,238,0.4)",
    lectureDatePrimary: "rgba(236,237,238,0.8)",
    lectureDateSecondary: "rgba(236,237,238,0.35)",
    lectureSubtitle: "rgba(236,237,238,0.5)",
    lectureCode: "rgba(236,237,238,0.3)",
    lectureTime: "rgba(236,237,238,0.7)",
    lectureTimeEnd: "rgba(236,237,238,0.3)",
    noLecturesText: "rgba(236,237,238,0.3)",

    // Fade gradient
    fadeStart: "rgba(21,23,24,0)",
    fadeMid: "rgba(21,23,24,0.9)",
    fadeEnd: "rgba(21,23,24,1)",
  },
} as const;

// ─── Status colours (same in both themes) ─────────────
export const status = {
  success: "#4CAF50",
  error: "#F44336",
  warning: "#FF9800",
  info: "#1993bd",
  link: "#0a7ea4",
  successOverlay: "#16A34A",
} as const;

// ─── Badge / accent ───────────────────────────────────
export const accent = {
  bestBg: "rgba(255,107,53,0.1)",
  bestBgDark: "rgba(255,107,53,0.15)",
  bestText: "#FF6B35",
  progressGood: "#4CAF50",
  progressMid: "#FF9800",
  progressLow: "#F44336",
} as const;

// ─── Streak badge (leaderboard) ───────────────────────
export const streakBadge = {
  light: {
    hotBg: "rgba(199,0,0,0.1)",
    hotText: brandRed.DEFAULT,
    hotBorder: "rgba(199,0,0,0.15)",
    fireBg: brandRed.faded,
    fireText: brandRed.dark,
    fireBorder: "rgba(145,0,0,0.2)",
    defaultBg: "rgba(255,78,54,0.08)",
    defaultText: brandRed.bright,
    defaultBorder: "rgba(255,78,54,0.15)",
  },
  dark: {
    hotBg: "rgba(199,0,0,0.25)",
    hotText: brandRed.bright,
    hotBorder: "rgba(255,78,54,0.25)",
    fireBg: "rgba(145,0,0,0.35)",
    fireText: brandRed.pastel,
    fireBorder: "rgba(255,138,122,0.3)",
    defaultBg: "rgba(255,78,54,0.15)",
    defaultText: "rgba(255,138,122,0.9)",
    defaultBorder: "rgba(255,78,54,0.18)",
  },
} as const;

// ─── Fonts (platform-specific) ────────────────────────
export const fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
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
})!;
