/**
 * Support Chat UI Constants
 * Centralized UI configuration and styling constants
 */

// Color Palette
export const SUPPORT_CHAT_COLORS = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  success: {
    50: "#f0fdf4",
    500: "#22c55e",
    600: "#16a34a",
  },
  warning: {
    50: "#fffbeb",
    500: "#f59e0b",
    600: "#d97706",
  },
  error: {
    50: "#fef2f2",
    500: "#ef4444",
    600: "#dc2626",
  },
} as const;

// Spacing Scale
export const SUPPORT_CHAT_SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "0.75rem", // 12px
  lg: "1rem", // 16px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "2rem", // 32px
  "4xl": "2.5rem", // 40px
  "5xl": "3rem", // 48px
} as const;

// Border Radius
export const SUPPORT_CHAT_RADIUS = {
  none: "0",
  sm: "0.125rem", // 2px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  full: "9999px",
} as const;

// Font Sizes
export const SUPPORT_CHAT_FONT_SIZES = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
} as const;

// Shadows
export const SUPPORT_CHAT_SHADOWS = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
} as const;

// Breakpoints
export const SUPPORT_CHAT_BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Component Sizes
export const SUPPORT_CHAT_SIZES = {
  avatar: {
    sm: "2rem", // 32px
    md: "2.5rem", // 40px
    lg: "3rem", // 48px
  },
  button: {
    sm: "1.75rem", // 28px
    md: "2.25rem", // 36px
    lg: "2.75rem", // 44px
  },
  input: {
    sm: "2rem", // 32px
    md: "2.5rem", // 40px
    lg: "3rem", // 48px
  },
  widget: {
    width: "20rem", // 320px
    height: "32rem", // 512px
    minWidth: "18rem", // 288px
    minHeight: "24rem", // 384px
  },
} as const;

// Message Status Icons
export const SUPPORT_CHAT_ICONS = {
  status: {
    sending: "⏳",
    sent: "✓",
    delivered: "✓✓",
    failed: "❌",
  },
  actions: {
    edit: "✏️",
    delete: "🗑️",
    reply: "↩️",
    attach: "📎",
    emoji: "😊",
  },
  ui: {
    close: "✕",
    minimize: "−",
    maximize: "□",
    send: "➤",
    typing: "⌨️",
  },
} as const;
