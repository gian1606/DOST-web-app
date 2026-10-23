// ─── BE-SMART Web App · Centralized constants ─────────────────────────────────
// Every magic value that appears in more than one file lives here.
// Import from here everywhere — never duplicate a string or number.

// ── Session storage keys ─────────────────────────────────────────────────────
export const SESSION_KEYS = {
  TOKEN: "bs_token",
  USER:  "bs_user",
  ROLE:  "bs_role",
};

// ── Database / app roles ───────────────────────────────────────────────────────
export const DB_ROLES = {
  SUPER_ADMIN:     "super_admin",
  COLLECTOR_ADMIN: "collector_admin",
  PUNONG_BARANGAY: "punong_barangay",
};

// ── Role → landing route mapping ──────────────────────────────────────────────
// Login uses this to redirect after authentication.
export const ROLE_ROUTES = {
  [DB_ROLES.SUPER_ADMIN]:     "/super-admin/dashboard",
  [DB_ROLES.COLLECTOR_ADMIN]: "/ca/dashboard",
  [DB_ROLES.PUNONG_BARANGAY]: "/pb/dashboard",
};

// ── Route path constants ──────────────────────────────────────────────────────
// Used by App.jsx, Sidebars, TopHeaders, and navigate() calls.
export const ROUTES = {
  LOGIN: "/login",
  ROOT:  "/",

  // Super Admin
  SA: {
    BASE:           "/super-admin",
    DASHBOARD:       "/super-admin/dashboard",
    MAP:             "/super-admin/map",
    ROUTE_MGMT:      "/super-admin/routes",
    USERS:           "/super-admin/users",
    ORGANIZATIONS:   "/super-admin/organizations",
    REPORTS:         "/super-admin/reports",
    MRF:             "/super-admin/mrf",
    NOTIFICATIONS:   "/super-admin/notifications",
    LEADERBOARD:     "/super-admin/leaderboard",
    SETTINGS:        "/super-admin/settings",
  },

  // Collector Admin
  CA: {
    BASE:      "/ca",
    DASHBOARD: "/ca/dashboard",
    MAP:       "/ca/map",
    REPORTS:   "/ca/reports",
    UNITS:     "/ca/units",
    USERS:     "/ca/users",
    SETTINGS:  "/ca/settings",
  },

  // Punong Barangay
  PB: {
    BASE:          "/pb",
    DASHBOARD:     "/pb/dashboard",
    MAP:           "/pb/map",
    QRCODES:       "/pb/qrcodes",
    REWARDS:       "/pb/rewards",
    LEADERBOARD:   "/pb/leaderboard",
    USERS:         "/pb/users",
    NOTIFICATIONS: "/pb/notifications",
    SETTINGS:      "/pb/settings",
  },
};

// ── Route labels (TopHeader breadcrumb) ───────────────────────────────────────
export const ROUTE_LABELS = {
  // Super Admin
  [ROUTES.SA.DASHBOARD]:       "Dashboard",
  [ROUTES.SA.MAP]:             "Mapa at Koleksyon",
  [ROUTES.SA.ROUTE_MGMT]:          "Pamamahala ng Ruta",
  [ROUTES.SA.USERS]:           "Pamamahala ng Gumagamit",
  [ROUTES.SA.ORGANIZATIONS]:   "Pamamahala ng Organisasyon",
  [ROUTES.SA.REPORTS]:         "Mga Ulat at Pagsusuri",
  [ROUTES.SA.MRF]:             "Pamamahala ng MRF",
  [ROUTES.SA.NOTIFICATIONS]:   "Mga Abiso",
  [ROUTES.SA.LEADERBOARD]:     "Ranggo ng mga Barangay",
  [ROUTES.SA.SETTINGS]:        "Mga Setting",

  // Collector Admin
  [ROUTES.CA.DASHBOARD]: "Dashboard",
  [ROUTES.CA.MAP]:       "Map & Collection",
  [ROUTES.CA.REPORTS]:   "Reports & Analytics",
  [ROUTES.CA.UNITS]:     "Collector Unit Management",
  [ROUTES.CA.USERS]:     "User Management",
  [ROUTES.CA.SETTINGS]:  "Settings",

  // Punong Barangay
  [ROUTES.PB.DASHBOARD]:     "Dashboard",
  [ROUTES.PB.MAP]:           "Live na Mapa",
  [ROUTES.PB.QRCODES]:       "Mga QR Code ng Basurahan",
  [ROUTES.PB.REWARDS]:       "Pamamahala ng Gantimpala",
  [ROUTES.PB.LEADERBOARD]:   "Ranggo ng mga Sambahayan",
  [ROUTES.PB.USERS]:         "Mga Tauhan ng MRF",
  [ROUTES.PB.NOTIFICATIONS]: "Mga Abiso",
  [ROUTES.PB.SETTINGS]:      "Mga Setting",
};

// ── Punong Barangay defaults ──────────────────────────────────────────────────
export const PB_BARANGAY = "Alangilan";
export const PB_CLUSTER  = "c1";

// ── Default map center (Brgy. Alangilan, Batangas City) ───────────────────────
export const DEFAULT_LAT = 13.7565;
export const DEFAULT_LNG = 121.0583;

// ── Status color map ──────────────────────────────────────────────────────────
// Maps bin/truck/route status strings to their display hex color.
// Used by MapView, StatusBadge, and any page that renders status indicators.
// Keep in sync with the mobile app's equivalent map in constants/index.js.
// References theme/colors.js — never bare hex.
import { colors } from "../theme/colors.js";

export const STATUS_COLORS = {
  full:        colors.error,
  collected:   colors.primary,
  missed:      colors.warning,
  ok:          colors.primary,
  available:   colors.primary,
  pending:     colors.warning,
  completed:   colors.primary,
  delivered:   colors.primary,
  in_progress: colors.recyclable,
  en_route:    colors.recyclable,
  idle:        colors.gray500,
  at_depot:    colors.textMuted,
};
