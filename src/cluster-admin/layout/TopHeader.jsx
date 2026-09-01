import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown, UserCircle, Settings, LogOut,
  Bell, Calendar, CheckCircle, FileText, Megaphone, AlertTriangle,
} from "lucide-react";
import { NOTIFICATIONS, CLUSTER_INFO } from "../mock/data";

const ROUTE_LABELS = {
  "/cluster-admin/dashboard":     "Dashboard",
  "/cluster-admin/map":           "Map & Collection",
  "/cluster-admin/users":         "User Management",
  "/cluster-admin/reports":       "Reports & Analytics",
  "/cluster-admin/notifications": "Notifications",
  "/cluster-admin/leaderboard":   "Leaderboard",
  "/cluster-admin/settings":      "Settings",
};

const NOTIF_TYPE_CONFIG = {
  task:         { icon: Bell,        color: "#1976D2", bg: "#E3F2FD" },
  schedule:     { icon: Calendar,    color: "#D97706", bg: "#FFF3E0" },
  complete:     { icon: CheckCircle, color: "#2E7D32", bg: "#E8F5E9" },
  report:       { icon: FileText,    color: "#6B7280", bg: "#F3F4F6" },
  announcement: { icon: Megaphone,   color: "#2E7D32", bg: "#E8F5E9" },
  route:        { icon: CheckCircle, color: "#1976D2", bg: "#E3F2FD" },
};

export default function TopHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pageLabel = ROUTE_LABELS[pathname] ?? "Dashboard";

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("bs_auth");
    sessionStorage.removeItem("bs_role");
    navigate("/login");
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleString("en-PH", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center justify-between px-6"
      style={{ left: 240, height: 60, background: "#fff", borderBottom: "1px solid #E5E7EB" }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
        <span className="text-text-secondary font-medium">BE-SMART</span>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary font-semibold">{pageLabel}</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} className="text-text-secondary" />
            {unread > 0 && (
              <span
                className="absolute top-1 right-1 flex items-center justify-center rounded-full text-white font-bold"
                style={{ width: 16, height: 16, fontSize: 9, background: "#DC2626" }}
              >
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 mt-1 rounded-xl overflow-hidden flex flex-col"
              style={{ top: "100%", width: 360, background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50, maxHeight: 440 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "#F3F4F6" }}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary" style={{ fontSize: 14 }}>Notifications</span>
                  {unread > 0 && (
                    <span className="rounded-full px-2 py-0.5 font-semibold text-white" style={{ fontSize: 11, background: "#DC2626" }}>{unread}</span>
                  )}
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-text-muted hover:text-green-700 transition-colors" style={{ fontSize: 12 }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <p className="text-center text-text-muted py-8" style={{ fontSize: 13 }}>No notifications.</p>
                ) : (
                  notifications.map((n) => {
                    const cfg = NOTIF_TYPE_CONFIG[n.type] ?? NOTIF_TYPE_CONFIG.announcement;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                        style={{ borderColor: "#F3F4F6", background: !n.read ? "#FAFFFE" : undefined }}
                        onClick={() => setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                      >
                        <div className="flex-shrink-0 flex items-center justify-center rounded-lg mt-0.5" style={{ width: 32, height: 32, background: cfg.bg }}>
                          <Icon size={15} color={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-semibold text-text-primary truncate" style={{ fontSize: 13 }}>{n.title}</span>
                            {!n.read && <span className="rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: "#2E7D32", display: "inline-block" }} />}
                            {n.priority === "urgent" && (
                              <span className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold flex-shrink-0" style={{ fontSize: 10, background: "#FFEBEE", color: "#DC2626" }}>
                                <AlertTriangle size={9} />Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-text-secondary" style={{ fontSize: 12, lineHeight: 1.4 }}>{n.body}</p>
                          <span className="text-text-muted" style={{ fontSize: 11 }}>{formatTime(n.sentAt)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#E8F5E9" }}>
              <UserCircle size={20} color="#2E7D32" />
            </div>
            <div>
              <div className="font-semibold text-text-primary leading-tight" style={{ fontSize: 13 }}>{CLUSTER_INFO.adminName}</div>
              <div className="text-text-muted leading-tight" style={{ fontSize: 11 }}>Cluster Admin · {CLUSTER_INFO.label}</div>
            </div>
            <ChevronDown size={14} className="text-text-muted ml-1 transition-transform" style={{ transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-1 rounded-xl overflow-hidden"
              style={{ top: "100%", minWidth: 180, background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 50 }}
            >
              <button
                onClick={() => { setProfileOpen(false); navigate("/cluster-admin/settings"); }}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                style={{ fontSize: 14, color: "#374151" }}
              >
                <Settings size={15} color="#6B7280" />
                Settings
              </button>
              <div style={{ height: 1, background: "#F3F4F6" }} />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 transition-colors text-left"
                style={{ fontSize: 14, color: "#DC2626" }}
              >
                <LogOut size={15} color="#DC2626" />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}


