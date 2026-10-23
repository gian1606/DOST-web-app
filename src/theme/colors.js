// ─── BE-SMART Web App · Design token color constants ─────────────────────────
// These values MUST stay in sync with tailwind.config.js.
// They exist so JavaScript config objects (StatusBadge, notifConfig, stat card
// arrays, chart data, etc.) can reference named constants instead of bare hex
// strings — mirroring the pattern used in DOST-mobile-app/theme/colors.js.
//
// For JSX elements: prefer Tailwind classes (bg-primary, text-error, etc.)
// For JS config objects / runtime style props: import from here.

export const colors = {
  // ── Primary ─────────────────────────────────────────────────────────────
  primary:          "#2E7D32",
  primaryLight:     "#388E3C",
  primaryDark:      "#1B5E20",

  // ── Accent / Success ────────────────────────────────────────────────────
  accent:           "#66BB6A",
  accentSoft:       "#E8F5E9",
  accentBorder:     "#C8E6C9",
  accentBorderLight: "#A5D6A7",

  // ── Sidebar ─────────────────────────────────────────────────────────────
  sidebarBg:        "#1C2B1E",
  sidebarActive:    "#2E7D32",

  // ── Surfaces ────────────────────────────────────────────────────────────
  surface:          "#FFFFFF",
  background:       "#F4F6F9",

  // ── Borders ─────────────────────────────────────────────────────────────
  cardBorder:       "#DDE3ED",

  // ── Text ────────────────────────────────────────────────────────────────
  textPrimary:      "#111827",
  textHeading:      "#1A1A1A",
  textSecondary:    "#4B5563",
  textMuted:        "#9CA3AF",

  // ── Semantic — solid ────────────────────────────────────────────────────
  success:          "#15803D",
  warning:          "#D97706",
  error:            "#DC2626",
  errorDark:        "#B71C1C",
  info:             "#1D4ED8",
  recyclable:       "#1976D2",
  locked:           "#7C3AED",

  // ── Semantic — soft backgrounds ─────────────────────────────────────────
  errorSoft:        "#FFEBEE",
  warningSoft:      "#FFF3E0",
  infoSoft:         "#E3F2FD",
  lockedSoft:       "#EDE9FE",

  // ── Semantic — borders ───────────────────────────────────────────────────
  errorBorder:      "#FFCDD2",
  warningBorder:    "#FFE0B2",
  infoBorder:       "#BBDEFB",
  inputErrorBorder: "#FECACA",

  // ── Notification ────────────────────────────────────────────────────────
  notificationUnread: "#FAFFFE",

  // ── Tailwind built-in aliases (for use in JS config objects) ────────────
  gray50:   "#F9FAFB",
  gray100:  "#F3F4F6",
  gray200:  "#E5E7EB",
  gray300:  "#D1D5DB",
  gray400:  "#9CA3AF",
  gray500:  "#6B7280",
  gray700:  "#374151",
  white:    "#FFFFFF",

  // ── Table ────────────────────────────────────────────────────────────────
  tableRowAlt: "#FAFAFA",     // Alternating table row background (near-white)
  rankGoldBg:     "#FEF3C7",   // amber-100 — gold rank highlight bg
  rankGoldBorder: "#FDE68A",   // amber-200 — gold rank border
  rankGoldText:   "#D97706",   // amber-600 — gold rank text
  rankSilverBg:   "#F3F4F6",   // gray-100  — silver rank bg
  rankBronzeBg:   "#FEF0E7",   // orange-50 — bronze rank bg
  rankBronzeText: "#C2410C",   // orange-700 — bronze rank text
  amberHighlight: "#FFFBEB",   // amber-50 — first-place row highlight

  // ── Leaderboard podium gradients ─────────────────────────────────────────
  podiumSilverGradient: "linear-gradient(180deg, #BDC3C7 0%, #95A5A6 100%)",
  podiumGoldGradient:   "linear-gradient(180deg, #F7DC6F 0%, #D4A017 100%)",
  podiumBronzeGradient: "linear-gradient(180deg, #D4956A 0%, #A0522D 100%)",

  // ── Locked / purple status ───────────────────────────────────────────────
  lockedText:     "#7C3AED",   // violet-600 — locked bin text
  lockedBorder:   "#DDD6FE",   // violet-200 — locked bin border

  // ── Other one-off semantic colors ────────────────────────────────────────
  orangeAlert:    "#E65100",   // deep orange — Tagalog "no bins" alert text
  blueDark:       "#1565C0",   // blue-800 — info paragraph text
  greenDark:      "#16A34A",   // green-600 — carbon saved icon
  infoClassic:    "#1D4ED8",   // blue-700 — info badge (matches info token)
  successClassic: "#15803D",   // green-700 — success (matches success token)
};

// ── Login page specific ────────────────────────────────────────────────────
//   (appended separately — Login uses a dark background with custom tints)
export const loginColors = {
  bg:          "#111827",   // Dark page background
  labelFocus:  "#86EFAC",   // Floating label color when focused
  labelError:  "#FCA5A5",   // Floating label color on error
};

// ── Map placeholder ────────────────────────────────────────────────────────
export const MAP_PLACEHOLDER_BG = "#D6EAE0";
