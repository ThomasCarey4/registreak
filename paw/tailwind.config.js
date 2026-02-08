/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        /* ── Surfaces ── */
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        "card-highlight": "rgb(var(--color-card-highlight) / <alpha-value>)",

        /* ── Text ── */
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        subtle: "rgb(var(--color-subtle) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        rank: "rgb(var(--color-rank) / <alpha-value>)",

        /* ── Accent ── */
        tint: "rgb(var(--color-tint) / <alpha-value>)",

        /* ── Icon ── */
        icon: "rgb(var(--color-icon) / <alpha-value>)",
        "tab-default": "rgb(var(--color-tab-default) / <alpha-value>)",
        "tab-active": "rgb(var(--color-tab-active) / <alpha-value>)",

        /* ── Borders / Dividers ── */
        divider: "rgb(var(--color-divider) / <alpha-value>)",
        "input-border": "rgb(var(--color-input-border) / <alpha-value>)",
        "input-bg": "rgb(var(--color-input-bg) / <alpha-value>)",

        /* ── Semantic ── */
        error: "rgb(var(--color-error) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",

        /* ── Toast ── */
        "toast-bg": "rgb(var(--color-toast-bg) / <alpha-value>)",
        "toast-border": "rgb(var(--color-toast-border) / <alpha-value>)",
        "toast-icon-bg": "rgb(var(--color-toast-icon-bg) / <alpha-value>)",
        "toast-title": "rgb(var(--color-toast-title) / <alpha-value>)",
        "toast-subtitle": "rgb(var(--color-toast-subtitle) / <alpha-value>)",
        "toast-progress": "rgb(var(--color-toast-progress) / <alpha-value>)",

        /* ── Digit cells ── */
        "digit-border": "rgb(var(--color-digit-border) / <alpha-value>)",
        "digit-bg": "rgb(var(--color-digit-bg) / <alpha-value>)",
        "error-cell-bg": "rgb(var(--color-error-cell-bg) / <alpha-value>)",
        "success-cell-bg": "rgb(var(--color-success-cell-bg) / <alpha-value>)",

        /* ── Calendar ── */
        "cal-scheduled": "rgb(var(--color-calendar-scheduled) / <alpha-value>)",
        "cal-ring-bg": "rgb(var(--color-calendar-ring-bg) / <alpha-value>)",
        "cal-future": "rgb(var(--color-calendar-future) / <alpha-value>)",
        "cal-dot-null": "rgb(var(--color-calendar-dot-null) / <alpha-value>)",

        /* ── Account ── */
        "account-card": "rgb(var(--color-account-card) / <alpha-value>)",
        "account-label": "rgb(var(--color-account-label) / <alpha-value>)",

        /* ── Auth buttons ── */
        "btn-primary": "rgb(var(--color-btn-primary) / <alpha-value>)",
        "btn-primary-pressed": "rgb(var(--color-btn-primary-pressed) / <alpha-value>)",

        /* ── Leeds static brand ── */
        "leeds-red": {
          dark: "#910000",
          DEFAULT: "#c70000",
          bright: "#ff4e36",
          pastel: "#ff8a7a",
          faded: "#ffeded",
        },
        "leeds-alert": {
          error: "#d4351c",
          warning: "#e76f16",
          success: "#3a9018",
          info: "#1993bd",
        },
      },
    },
  },
  plugins: [],
};
