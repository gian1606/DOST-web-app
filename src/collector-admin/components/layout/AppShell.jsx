import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

export default function CAAppShell() {
  const isAuth =
    sessionStorage.getItem("bs_token") !== null &&
    sessionStorage.getItem("bs_role") === "collector_admin";
  if (!isAuth) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen" style={{ background: "#F4F6F9" }}>
      <Sidebar />
      <TopHeader />
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

