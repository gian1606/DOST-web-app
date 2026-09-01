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
        // ── Accent ────────────────────────────────────────────────────────────
        accent:            "#66BB6A",   // Leaf Green — soft highlights
        "accent-soft":     "#E8F5E9",   // Mint Tint — badge/chip backgrounds
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
        "text-secondary":  "#4B5563",   // Slate Gray — labels, subtext
        "text-muted":      "#9CA3AF",   // Light Gray — timestamps, hints
        // ── Semantic ──────────────────────────────────────────────────────────
        success:           "#15803D",   // Green — collected, completed
        warning:           "#D97706",   // Amber — missed, pending
        error:             "#DC2626",   // Red — full bins, urgent alerts
        info:              "#1D4ED8",   // Blue — en route, in progress
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