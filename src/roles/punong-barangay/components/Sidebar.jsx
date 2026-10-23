import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Map,
  Gift,
  Trophy,
  Users,
  QrCode,
  Settings,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { ROUTES } from "../../../constants/index.js";
import { colors } from "../../../theme/colors.js";

const NAV_ITEMS = [
  { to: ROUTES.PB.DASHBOARD,   icon: LayoutGrid, label: "Dashboard" },
  { to: ROUTES.PB.MAP,         icon: Map,        label: "Live na Mapa" },
  { to: ROUTES.PB.QRCODES,     icon: QrCode,     label: "Mga QR Code ng Basurahan" },
  { to: ROUTES.PB.REWARDS,     icon: Gift,       label: "Pamamahala ng Gantimpala" },
  { to: ROUTES.PB.LEADERBOARD, icon: Trophy,     label: "Ranggo ng mga Sambahayan" },
  { to: ROUTES.PB.USERS,       icon: Users,      label: "Mga Tauhan ng MRF" },
  { to: ROUTES.PB.SETTINGS,    icon: Settings,   label: "Mga Setting" },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-30"
      style={{ width: 240, background: colors.sidebarBg }}
    >
      {/* Brand */}
      <div className="px-4 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <img src="/Batangas_logo.png" alt="Batangas City Seal" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
          <div>
            <div className="font-bold text-white leading-tight" style={{ fontSize: 17 }}>
              BE-SMART
            </div>
            <div className="text-white/50 leading-tight" style={{ fontSize: 11 }}>
              Batangas City
            </div>
          </div>
        </div>

        {/* Logged-in chip */}
        <div
          className="rounded-full px-3 py-1.5 flex items-center gap-2"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div>
            <div className="text-white/50 uppercase tracking-widest" style={{ fontSize: 9 }}>
              Naka-login bilang
            </div>
            <div className="text-white font-semibold" style={{ fontSize: 12 }}>
              {user?.name || "Punong Barangay"}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label, soon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors relative ${
                isActive
                  ? "text-white font-semibold"
                  : "text-white/65 hover:text-white hover:bg-white/10"
              }`
            }
            style={({ isActive }) => (isActive ? { background: colors.primary } : {})}
          >
            <Icon size={17} />
            <span style={{ fontSize: 14 }}>{label}</span>
            {soon && (
              <span
                className="ml-auto rounded-full px-2 py-0.5 font-medium"
                style={{ fontSize: 10, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}
              >
                Soon
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

