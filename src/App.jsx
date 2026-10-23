import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// ── Shared login (role-agnostic) ──────────────────────────────────────────────
import Login from "./components/auth/Login.jsx";

// ── Shared layout shell ───────────────────────────────────────────────────────
import ProtectedShell from "./components/layout/ProtectedShell.jsx";

// ── Role-specific layout (eager — small, always needed for their portal) ──────
import SASidebar      from "./roles/super-admin/components/Sidebar.jsx";
import SATopHeader    from "./roles/super-admin/components/TopHeader.jsx";
import CASidebar      from "./roles/collector-admin/components/Sidebar.jsx";
import CATopHeader    from "./roles/collector-admin/components/TopHeader.jsx";
import PBSidebar      from "./roles/punong-barangay/components/PBSidebar.jsx";
import PBTopHeader    from "./roles/punong-barangay/components/PBTopHeader.jsx";

// ── Constants ──────────────────────────────────────────────────────────────────
import { ROUTES, DB_ROLES } from "./constants/index.js";

// ── Lazy-loaded pages (each chunk loads only when the route is visited) ───────

// Super Admin
const SADashboard              = lazy(() => import("./roles/super-admin/pages/Dashboard.jsx"));
const SAMapCollection          = lazy(() => import("./roles/super-admin/pages/MapCollection.jsx"));
const SARouteManagement        = lazy(() => import("./roles/super-admin/pages/RouteManagement.jsx"));
const SAUserManagement         = lazy(() => import("./roles/super-admin/pages/UserManagement.jsx"));
const SAOrganizationManagement = lazy(() => import("./roles/super-admin/pages/OrganizationManagement.jsx"));
const SAReports               = lazy(() => import("./roles/super-admin/pages/Reports.jsx"));
const SAMRFManagement          = lazy(() => import("./roles/super-admin/pages/MRFManagement.jsx"));
const SANotifications          = lazy(() => import("./roles/super-admin/pages/Notifications.jsx"));
const SALeaderboard            = lazy(() => import("./roles/super-admin/pages/Leaderboard.jsx"));
const SASettings               = lazy(() => import("./roles/super-admin/pages/Settings.jsx"));

// Collector Admin
const CollectorDashboard     = lazy(() => import("./roles/collector-admin/pages/Dashboard.jsx"));
const CollectorMapCollection = lazy(() => import("./roles/collector-admin/pages/MapCollection.jsx"));
const CollectorReports       = lazy(() => import("./roles/collector-admin/pages/Reports.jsx"));
const CollectorUnits         = lazy(() => import("./roles/collector-admin/pages/CollectorUnitManagement.jsx"));
const CollectorUserMgmt      = lazy(() => import("./roles/collector-admin/pages/UserManagement.jsx"));
const CollectorSettings      = lazy(() => import("./roles/collector-admin/pages/Settings.jsx"));

// Punong Barangay
const PBDashboard     = lazy(() => import("./roles/punong-barangay/pages/PBDashboard.jsx"));
const PBMapView       = lazy(() => import("./roles/punong-barangay/pages/PBMapView.jsx"));
const PBNotifications = lazy(() => import("./roles/punong-barangay/pages/PBNotifications.jsx"));
const Rewards         = lazy(() => import("./roles/punong-barangay/pages/Rewards.jsx"));
const Leaderboard     = lazy(() => import("./roles/punong-barangay/pages/Leaderboard.jsx"));
const MRFPersonnel    = lazy(() => import("./roles/punong-barangay/pages/MRFPersonnel.jsx"));
const BinQRCodes      = lazy(() => import("./roles/punong-barangay/pages/BinQRCodes.jsx"));
const PBSettings      = lazy(() => import("./roles/punong-barangay/pages/PBSettings.jsx"));

function PortalLoader() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
      <span className="text-text-muted" style={{ fontSize: 14 }}>Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PortalLoader />}>
        <Routes>

          {/* ── Login (shared — role determined by credentials) ───────────────── */}
          <Route path={ROUTES.ROOT}  element={<Login />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />

          {/* ── Super Admin ───────────────────────────────────────────────────── */}
          <Route
            path={ROUTES.SA.BASE}
            element={
              <ProtectedShell
                role={DB_ROLES.SUPER_ADMIN}
                Sidebar={SASidebar}
                TopHeader={SATopHeader}
              />
            }
          >
            <Route index element={<Navigate to={ROUTES.SA.DASHBOARD} replace />} />
            <Route path="dashboard"     element={<SADashboard />} />
            <Route path="map"           element={<SAMapCollection />} />
            <Route path="routes"        element={<SARouteManagement />} />
            <Route path="users"         element={<SAUserManagement />} />
            <Route path="organizations" element={<SAOrganizationManagement />} />
            <Route path="reports"       element={<SAReports />} />
            <Route path="mrf"           element={<SAMRFManagement />} />
            <Route path="notifications" element={<SANotifications />} />
            <Route path="leaderboard"   element={<SALeaderboard />} />
            <Route path="settings"      element={<SASettings />} />
          </Route>

          {/* ── Collector Admin ───────────────────────────────────────────────── */}
          <Route
            path={ROUTES.CA.BASE}
            element={
              <ProtectedShell
                role={DB_ROLES.COLLECTOR_ADMIN}
                Sidebar={CASidebar}
                TopHeader={CATopHeader}
              />
            }
          >
            <Route index element={<Navigate to={ROUTES.CA.DASHBOARD} replace />} />
            <Route path="dashboard" element={<CollectorDashboard />} />
            <Route path="map"       element={<CollectorMapCollection />} />
            <Route path="reports"   element={<CollectorReports />} />
            <Route path="units"     element={<CollectorUnits />} />
            <Route path="users"     element={<CollectorUserMgmt />} />
            <Route path="settings"  element={<CollectorSettings />} />
          </Route>

          {/* ── Punong Barangay ───────────────────────────────────────────────── */}
          <Route
            path={ROUTES.PB.BASE}
            element={
              <ProtectedShell
                role={DB_ROLES.PUNONG_BARANGAY}
                Sidebar={PBSidebar}
                TopHeader={PBTopHeader}
              />
            }
          >
            <Route index element={<Navigate to={ROUTES.PB.DASHBOARD} replace />} />
            <Route path="dashboard"     element={<PBDashboard />} />
            <Route path="map"           element={<PBMapView />} />
            <Route path="qrcodes"       element={<BinQRCodes />} />
            <Route path="rewards"       element={<Rewards />} />
            <Route path="leaderboard"   element={<Leaderboard />} />
            <Route path="users"         element={<MRFPersonnel />} />
            <Route path="notifications" element={<PBNotifications />} />
            <Route path="settings"      element={<PBSettings />} />
          </Route>

          {/* ── Catch-all ─────────────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
