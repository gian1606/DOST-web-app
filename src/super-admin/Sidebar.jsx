import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Map,
  Route,
  BarChart2,
  Users,
  Building2,
  Trophy,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/super-admin/dashboard",     icon: LayoutGrid, label: "Dashboard" },
  { to: "/super-admin/map",           icon: Map,        label: "Map & Collection" },
  { to: "/super-admin/routes",        icon: Route,      label: "Route Management" },
  { to: "/super-admin/users",         icon: Users,      label: "User Management" },
  { to: "/super-admin/organizations", icon: Building2,  label: "Organization Management" },
  { to: "/super-admin/reports",       icon: BarChart2,  label: "Reports & Analytics" },
  { to: "/super-admin/leaderboard",   icon: Trophy,     label: "Leaderboard" },
  { to: "/super-admin/settings",      icon: Settings,   label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-30"
      style={{ width: 240, background: "#1C2B1E" }}
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
              Logged in as
            </div>
            <div className="text-white font-semibold" style={{ fontSize: 12 }}>
              Super Admin
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
            style={({ isActive }) => (isActive ? { background: "#2E7D32" } : {})}
          >
            <Icon size={17} />
            <span style={{ fontSize: 14 }}>{label}</span>
            {soon && (
              <span
                className="ml-auto rounded-full px-2 py-0.5 font-medium"
                style={{
                  fontSize: 10,
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.5)",
                }}
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

