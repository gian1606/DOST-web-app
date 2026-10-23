// ─── ProtectedShell — shared layout + auth guard for role portals ──────────────
//
// Replaces the three near-identical AppShell components. Each role portal
// passes its own Sidebar and TopHeader components and the role it guards.
// If the user isn't authenticated (or is authenticated as a different role),
// they're redirected to the login page.

import { Outlet, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROUTES } from "../../constants/index.js";

/** Simple full-height loading indicator shown while a lazy page chunk loads. */
function PageLoader() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: "50vh" }}>
      <span className="text-text-muted" style={{ fontSize: 14 }}>Loading…</span>
    </div>
  );
}

/**
 * @param {string}   role      — the DB_ROLES value this portal requires
 * @param {Component} Sidebar   — role-specific sidebar component
 * @param {Component} TopHeader — role-specific top header component
 */
export default function ProtectedShell({ role, Sidebar, TopHeader }) {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated || userRole !== role) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="min-h-screen" style={{ background: "#F4F6F9" }}>
      <Sidebar />
      <TopHeader />
      <main
        className="overflow-y-auto"
        style={{ marginLeft: 240, paddingTop: 60, minHeight: "100vh" }}
      >
        <div className="p-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
