import { Outlet, Navigate } from "react-router-dom";
import PBSidebar from "./PBSidebar";
import PBTopHeader from "./PBTopHeader";

export default function PBAppShell() {
  const isAuth = sessionStorage.getItem("bs_pb_auth") === "true";
  if (!isAuth) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen" style={{ background: "#F4F6F9" }}>
      <PBSidebar />
      <PBTopHeader />
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

