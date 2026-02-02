/**
 * Design System Tokens
 *
 * Centralized design tokens for consistent styling throughout the application.
 * These tokens form the foundation of the design system and should be used
 * instead of hardcoded values.
 *
 * Design Direction: Modern Minimal
 * - Clean whites/grays, lots of whitespace
 * - Subtle gradients
 * - Professional SaaS aesthetic (inspired by Linear, Vercel)
 */

/**
 * Color palette following a semantic naming convention.
 * Each color has a full scale from 50 (lightest) to 950 (darkest).
 */
export const colors = {
  // Primary brand color - Blue
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
    950: "#172554",
  },

  // Neutral grays for text, backgrounds, and borders
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },

  // Semantic colors for feedback states
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
  },

  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
  },

  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
  },

  // Background colors
  background: {
    primary: "#ffffff",
    secondary: "#fafafa",
    tertiary: "#f5f5f5",
    inverse: "#171717",
  },

  // Text colors
  text: {
    primary: "#171717",
    secondary: "#525252",
    tertiary: "#737373",
    inverse: "#ffffff",
    muted: "#a3a3a3",
  },

  // Border colors
  border: {
    default: "#e5e5e5",
    hover: "#d4d4d4",
    focus: "#3b82f6",
  },
} as const;

/**
 * Typography scale following a modular scale.
 * Includes Tailwind CSS class equivalents for easy use.
 */
export const typography = {
  // Display - for hero sections and large headings
  display: {
    large: "text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
    medium: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
    small: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
  },

  // Headings
  heading: {
    h1: "text-3xl md:text-4xl font-semibold tracking-tight",
    h2: "text-2xl md:text-3xl font-semibold tracking-tight",
    h3: "text-xl md:text-2xl font-semibold",
    h4: "text-lg md:text-xl font-medium",
    h5: "text-base md:text-lg font-medium",
    h6: "text-sm md:text-base font-medium",
  },

  // Body text
  body: {
    large: "text-lg leading-relaxed",
    base: "text-base leading-relaxed",
    small: "text-sm leading-relaxed",
  },

  // UI text
  ui: {
    label: "text-sm font-medium",
    caption: "text-xs text-neutral-500",
    button: "text-sm font-medium",
    link: "text-sm font-medium text-primary-600 hover:text-primary-700",
  },
} as const;

/**
 * Spacing scale for consistent margins and padding.
 * Maps to Tailwind CSS spacing utilities.
 */
export const spacing = {
  0: "0",
  px: "1px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
} as const;

/**
 * Shadow definitions for depth and elevation.
 */
export const shadows = {
  none: "shadow-none",
  sm: "shadow-sm",
  base: "shadow",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",

  // Custom shadows for specific use cases
  card: "shadow-sm hover:shadow-md transition-shadow",
  button: "shadow-sm active:shadow-none",
  modal: "shadow-2xl",
  dropdown: "shadow-lg",
} as const;

/**
 * Border radius definitions.
 */
export const radius = {
  none: "rounded-none",
  sm: "rounded-sm",
  base: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
} as const;

/**
 * Transition presets for animations.
 */
export const transitions = {
  fast: "transition-all duration-150 ease-in-out",
  base: "transition-all duration-200 ease-in-out",
  slow: "transition-all duration-300 ease-in-out",
  colors: "transition-colors duration-200 ease-in-out",
  transform: "transition-transform duration-200 ease-in-out",
  opacity: "transition-opacity duration-200 ease-in-out",
} as const;

/**
 * Z-index scale for consistent layering.
 */
export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
} as const;

/**
 * Common component class combinations for reuse.
 * These can be composed with cn() utility.
 */
export const components = {
  // Container widths
  container: {
    sm: "max-w-screen-sm mx-auto px-4",
    md: "max-w-screen-md mx-auto px-4 sm:px-6",
    lg: "max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8",
    xl: "max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8",
    full: "w-full px-4 sm:px-6 lg:px-8",
  },

  // Card styles
  card: {
    base: "bg-white rounded-xl border border-neutral-200 shadow-sm",
    hover: "bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all",
    interactive: "bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer",
  },

  // Input styles
  input: {
    base: "w-full px-4 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
    error: "w-full px-4 py-2 bg-white border border-error-500 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-error-500 focus:border-transparent transition-all",
  },

  // Focus ring for accessibility
  focusRing: "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
} as const;

/**
 * Type exports for type-safe usage.
 */
export type ColorScale = keyof typeof colors.primary;
export type TypographyStyle = keyof typeof typography;
export type SpacingValue = keyof typeof spacing;
