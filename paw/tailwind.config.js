/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        "foreground-muted": "var(--color-foreground-muted)",
        card: "var(--color-card)",
        "card-highlight": "var(--color-card-highlight)",
        surface: "var(--color-surface)",
        tint: "var(--color-tint)",
        icon: "var(--color-icon)",
        "tab-default": "var(--color-tab-default)",
        "tab-active": "var(--color-tab-active)",
        border: "var(--color-border)",
        divider: "var(--color-divider)",
        "rank-text": "var(--color-rank-text)",
        "subtle-text": "var(--color-subtle-text)",

        // Calendar
        "calendar-weekday": "var(--color-calendar-weekday)",
        "calendar-cell": "var(--color-calendar-cell)",
        "calendar-cell-muted": "var(--color-calendar-cell-muted)",
        "calendar-future": "var(--color-calendar-future)",

        // Toast
        "toast-error-bg": "var(--color-toast-error-bg)",
        "toast-error-border": "var(--color-toast-error-border)",
        "toast-error-icon-bg": "var(--color-toast-error-icon-bg)",
        "toast-error-title": "var(--color-toast-error-title)",
        "toast-error-body": "var(--color-toast-error-body)",
        "toast-error-progress": "var(--color-toast-error-progress)",

        // Cell states
        "cell-border": "var(--color-cell-border)",
        "cell-error-bg": "var(--color-cell-error-bg)",
        "cell-success-bg": "var(--color-cell-success-bg)",

        // Lecture
        "lecture-card": "var(--color-lecture-card)",

        // Status
        success: "#4CAF50",
        error: "#F44336",
        warning: "#FF9800",
        info: "#1993bd",
        link: "#0a7ea4",
        "success-overlay": "#16A34A",

        // Badge / accent
        "badge-best-bg": "var(--color-badge-best-bg)",
        "badge-best-text": "#FF6B35",

        // Brand
        "brand-red": {
          dark: "#910000",
          DEFAULT: "#c70000",
          bright: "#ff4e36",
          pastel: "#ff8a7a",
          faded: "#ffeded",
        },
        "brand-green": {
          dark: "#156265",
          DEFAULT: "#026E7A",
          light: "#ABC6C7",
        },
        "brand-teal": {
          DEFAULT: "#00D0A0",
          dark: "#00A881",
        },
        "brand-blue": {
          dark: "#00323d",
          DEFAULT: "#003a52",
          bright: "#1a84c7",
        },
      },
      fontFamily: {
        sans: ["system-ui"],
        serif: ["ui-serif"],
        rounded: ["ui-rounded"],
        mono: ["ui-monospace"],
      },
    },
  },
  plugins: [],
};
