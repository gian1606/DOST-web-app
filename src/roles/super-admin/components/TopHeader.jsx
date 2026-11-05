import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown, UserCircle, Settings, LogOut,
  Bell, AlertTriangle,
} from "lucide-react";
import { NOTIFICATIONS } from "../../../mock/data";
import { useAuth } from "../../../context/AuthContext.jsx";
import { ROUTES, ROUTE_LABELS } from "../../../constants/index.js";
import { colors } from "../../../theme/colors.js";
import { NOTIF_TYPE_CONFIG } from "../../../components/ui/notifConfig.jsx";


export default function TopHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const pageLabel = ROUTE_LABELS[pathname] ?? "Dashboard";

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN);
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
      style={{
        left: 240,
        height: 60,
        background: colors.primary,
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
        <span className="font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>BE-SMART</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>/</span>
        <span className="font-semibold text-white">{pageLabel}</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
            className="relative p-2 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <Bell size={18} color="rgba(255,255,255,0.8)" />
            {unread > 0 && (
              <span
                className="absolute top-1 right-1 flex items-center justify-center rounded-full text-white font-bold"
                style={{ width: 16, height: 16, fontSize: 9, background: colors.error }}
              >
                {unread}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div
              className="absolute right-0 mt-1 rounded-xl overflow-hidden flex flex-col"
              style={{
                top: "100%",
                width: 360,
                background: colors.white,
                border: "1px solid " + colors.gray200,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 50,
                maxHeight: 440,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                style={{ borderColor: colors.gray100 }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary" style={{ fontSize: 14 }}>
                    Mga Abiso
                  </span>
                  {unread > 0 && (
                    <span
                      className="rounded-full px-2 py-0.5 font-semibold text-white"
                      style={{ fontSize: 11, background: colors.error }}
                    >
                      {unread}
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-text-muted hover:text-primary transition-colors"
                    style={{ fontSize: 12 }}
                  >
                    Markahan lahat bilang nabasa
                  </button>
                )}
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <p className="text-center text-text-muted py-8" style={{ fontSize: 13 }}>
                    Walang mga abiso.
                  </p>
                ) : (
                  notifications.map((n) => {
                    const cfg = NOTIF_TYPE_CONFIG[n.type] ?? NOTIF_TYPE_CONFIG.announcement;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                        style={{
                          borderColor: colors.gray100,
                          background: !n.read ? colors.notificationUnread : undefined,
                        }}
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                          )
                        }
                      >
                        <div
                          className="flex-shrink-0 flex items-center justify-center rounded-lg mt-0.5"
                          style={{ width: 32, height: 32, background: cfg.bg }}
                        >
                          <Icon size={15} color={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-semibold text-text-primary truncate" style={{ fontSize: 13 }}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <span
                                className="rounded-full flex-shrink-0"
                                style={{ width: 6, height: 6, background: colors.primary, display: "inline-block" }}
                              />
                            )}
                            {n.priority === "urgent" && (
                              <span
                                className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold flex-shrink-0"
                                style={{ fontSize: 10, background: colors.errorSoft, color: colors.error }}
                              >
                                <AlertTriangle size={9} />
                                Apurahan
                              </span>
                            )}
                          </div>
                          <p className="text-text-secondary" style={{ fontSize: 12, lineHeight: 1.4 }}>
                            {n.body}
                          </p>
                          <span className="text-text-muted" style={{ fontSize: 11 }}>
                            {formatTime(n.sentAt)}
                          </span>
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
            className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 32, height: 32, background: "rgba(255,255,255,0.15)" }}
            >
              <UserCircle size={20} color="rgba(255,255,255,0.85)" />
            </div>
            <div>
              <div className="font-semibold leading-tight" style={{ fontSize: 13, color: colors.white }}>
                {user?.name || "Super Admin"}
              </div>
              <div className="leading-tight" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                Tagapamahala
              </div>
            </div>
            <ChevronDown
              size={14}
              style={{ color: "rgba(255,255,255,0.5)", marginLeft: 4, transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
            />
          </button>

          {/* Dropdown menu */}
          {profileOpen && (
            <div
              className="absolute right-0 mt-1 rounded-xl overflow-hidden"
              style={{
                top: "100%",
                minWidth: 180,
                background: colors.white,
                border: "1px solid " + colors.gray200,
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                zIndex: 50,
              }}
            >
              <button
                onClick={() => { setProfileOpen(false); navigate(ROUTES.SA.SETTINGS); }}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                style={{ fontSize: 14, color: colors.gray700 }}
              >
                <Settings size={15} color={colors.gray500} />
                Mga Setting
              </button>
              <div style={{ height: 1, background: colors.gray100 }} />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 transition-colors text-left"
                style={{ fontSize: 14, color: colors.error }}
              >
                <LogOut size={15} color={colors.error} />
                Mag-logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}


