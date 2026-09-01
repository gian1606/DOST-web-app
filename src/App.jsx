import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Single shared login ────────────────────────────────────────────────────────
import Login from "./super-admin/Login";

// ── Super Admin ────────────────────────────────────────────────────────────────
import SuperAdminShell          from "./super-admin/AppShell";
import SADashboard              from "./super-admin/Dashboard";
import SAMapCollection          from "./super-admin/MapCollection";
import SARouteManagement        from "./super-admin/RouteManagement";
import SAUserManagement         from "./super-admin/UserManagement";
import SAOrganizationManagement from "./super-admin/OrganizationManagement";
import SAReports                from "./super-admin/Reports";
import SAMRFManagement          from "./super-admin/MRFManagement";
import SANotifications          from "./super-admin/Notifications";
import SALeaderboard            from "./super-admin/Leaderboard";
import SASettings               from "./super-admin/Settings";

// ── Collector Admin ────────────────────────────────────────────────────────────
import CollectorAdminShell    from "./collector-admin/components/layout/AppShell";
import CollectorDashboard     from "./collector-admin/pages/Dashboard";
import CollectorMapCollection from "./collector-admin/pages/MapCollection";
import CollectorReports       from "./collector-admin/pages/Reports";
import CollectorUnits         from "./collector-admin/pages/CollectorUnitManagement";
import CollectorUserMgmt      from "./collector-admin/pages/UserManagement";
import CollectorSettings      from "./collector-admin/pages/Settings";

// ── Punong Barangay ────────────────────────────────────────────────────────────
import PBAppShell      from "./punong-barangay/PBAppShell";
import PBDashboard     from "./punong-barangay/PBDashboard";
import PBMapView       from "./punong-barangay/PBMapView";
import PBNotifications from "./punong-barangay/PBNotifications";
import Rewards         from "./punong-barangay/Rewards";
import Leaderboard     from "./punong-barangay/Leaderboard";
import MRFPersonnel    from "./punong-barangay/MRFPersonnel";
import BinQRCodes      from "./punong-barangay/BinQRCodes";
import PBSettings      from "./punong-barangay/PBSettings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Login (shared — role determined by credentials) ───────────────── */}
        <Route path="/"      element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* ── Super Admin ───────────────────────────────────────────────────── */}
        <Route path="/super-admin" element={<SuperAdminShell />}>
          <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
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
        <Route path="/ca" element={<CollectorAdminShell />}>
          <Route index element={<Navigate to="/ca/dashboard" replace />} />
          <Route path="dashboard" element={<CollectorDashboard />} />
          <Route path="map"       element={<CollectorMapCollection />} />
          <Route path="reports"   element={<CollectorReports />} />
          <Route path="units"     element={<CollectorUnits />} />
          <Route path="users"     element={<CollectorUserMgmt />} />
          <Route path="settings"  element={<CollectorSettings />} />
        </Route>

        {/* ── Punong Barangay ───────────────────────────────────────────────── */}
        <Route path="/pb" element={<PBAppShell />}>
          <Route index element={<Navigate to="/pb/dashboard" replace />} />
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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
