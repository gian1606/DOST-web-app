import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

export default function ClusterAdminAppShell() {
  const isAuth =
    sessionStorage.getItem("bs_token") !== null &&
    sessionStorage.getItem("bs_role") === "cluster_admin";
  if (!isAuth) return <Navigate to="/login" replace />;  // redirects to shared login

  return (
    <div className="min-h-screen" style={{ background: "#F4F6F9" }}>
      <Sidebar />
      <TopHeader />
      {/* Main content: sidebar 240px left, header 60px top */}
      <main
        className="overflow-y-auto"
        style={{ marginLeft: 240, paddingTop: 60, minHeight: "100vh" }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

