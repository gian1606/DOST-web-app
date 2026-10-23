/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Primary ───────────────────────────────────────────────────────────
        primary:           "#2E7D32",   // Forest Green — buttons, active states, CTAs
        "primary-light":   "#388E3C",   // Mid Green — hover states
        "primary-dark":    "#1B5E20",   // Deep Forest — sidebar active item bg

        // ── Accent / Success ──────────────────────────────────────────────────
        accent:            "#66BB6A",   // Leaf Green — soft highlights
        "accent-soft":     "#E8F5E9",   // Mint Tint — badge/chip backgrounds
        "accent-border":   "#C8E6C9",   // Green border — companion to accent-soft
        "accent-border-light": "#A5D6A7", // Lighter green border — stat banners

        // ── Sidebar ───────────────────────────────────────────────────────────
        "sidebar-bg":      "#1C2B1E",   // Charcoal — sidebar background (all roles)
        "sidebar-active":  "#2E7D32",   // Forest Green — active nav item

        // ── Surfaces ──────────────────────────────────────────────────────────
        surface:           "#FFFFFF",   // White — cards, modals, panels
        background:        "#F4F6F9",   // Cool Off-White — page background

        // ── Borders ───────────────────────────────────────────────────────────
        "card-border":     "#DDE3ED",   // Slate Border — card/divider borders

        // ── Text ──────────────────────────────────────────────────────────────
        "text-primary":    "#111827",   // Near Black — headings, primary content
        "text-heading":    "#1A1A1A",   // True Black — large stat numbers, emphasis
        "text-secondary":  "#4B5563",   // Slate Gray — labels, subtext
        "text-muted":      "#9CA3AF",   // Light Gray — timestamps, hints

        // ── Semantic — solid colors ────────────────────────────────────────────
        success:           "#15803D",   // Green — collected, completed
        warning:           "#D97706",   // Amber — missed, pending
        error:             "#DC2626",   // Red — full bins, urgent alerts
        "error-dark":      "#B71C1C",   // Dark Red — destructive action warning text
        info:              "#1D4ED8",   // Blue — general info badge
        recyclable:        "#1976D2",   // Material Blue — en route, in progress, recyclable

        // ── Semantic — soft backgrounds ────────────────────────────────────────
        "error-soft":      "#FFEBEE",   // Red Tint — error/full badge backgrounds
        "warning-soft":    "#FFF3E0",   // Amber Tint — missed/pending badge backgrounds
        "info-soft":       "#E3F2FD",   // Blue Tint — in-progress/recyclable backgrounds
        "locked-soft":     "#EDE9FE",   // Purple Tint — locked bin badge backgrounds
        "locked":          "#7C3AED",   // Purple — locked bin badge text/icon

        // ── Semantic — borders ────────────────────────────────────────────────
        "error-border":    "#FFCDD2",   // Red border — error cards, delete modals
        "warning-border":  "#FFE0B2",   // Amber border — missed/pending banners
        "info-border":     "#BBDEFB",   // Blue border — in-progress banners
        "input-error-border": "#FECACA", // Red-200 — form field validation error

        // ── Notification ──────────────────────────────────────────────────────
        "notification-unread": "#FAFFFE", // Barely tinted white — unread notification row bg
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
      },
    },
  },
  plugins: [],
};
