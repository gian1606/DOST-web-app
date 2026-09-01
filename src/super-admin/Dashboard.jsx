import { useNavigate } from "react-router-dom";
import { Trash2, Truck, CheckCircle, Activity, RefreshCw, Route } from "lucide-react";
import StatCard    from "../components/ui/StatCard";
import AlertRow    from "../components/ui/AlertRow";
import ActivityRow from "../components/ui/ActivityRow";
import MapView     from "../components/ui/MapView";
import { DASHBOARD_STATS, BINS, TRUCKS, MRF_LOCATIONS, RECENT_ACTIVITY } from "../mock/data";

export default function Dashboard() {
  const navigate = useNavigate();

  const fullBins = BINS.filter((b) => b.status === "full");

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>City-Wide Dashboard</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280" }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => navigate("/super-admin/routes")}
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
            style={{ fontSize: 13, background: "#2E7D32" }}
          >
            <Route size={14} />
            Optimize Route
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Trash2 size={18} color="#6B7280" />}
          value={DASHBOARD_STATS.totalBins}
          label="Total Bins"
          subLabel="City-wide"
        />
        <StatCard
          icon={<Trash2 size={18} color="#DC2626" />}
          value={DASHBOARD_STATS.fullBins}
          label="Full Bins"
          subLabel={DASHBOARD_STATS.fullBins > 5 ? `${Math.min(DASHBOARD_STATS.fullBins, 3)} critical` : "Needs collection"}
          subLabelColor="#DC2626"
        />
        <StatCard
          icon={<CheckCircle size={18} color="#2E7D32" />}
          value={DASHBOARD_STATS.collectedToday}
          label="Collected Today"
          subLabel={`${Math.round((DASHBOARD_STATS.collectedToday / Math.max(DASHBOARD_STATS.totalBins, 1)) * 100)}% of target`}
          subLabelColor="#2E7D32"
        />
        <StatCard
          icon={<Truck size={18} color="#1976D2" />}
          value={DASHBOARD_STATS.activeTrucks}
          label="Active Trucks"
          subLabel="2 on route"
          subLabelColor="#1976D2"
        />
      </div>

      {/* 2-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 420px" }}>
        {/* Left: Live Map */}
        <div
          className="bg-white rounded-xl p-4 flex flex-col gap-3"
          style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>Live Map</h2>
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
              style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}
            >
              <span className="rounded-full" style={{ width: 6, height: 6, background: "#2E7D32", display: "inline-block" }} />
              Live
            </span>
          </div>
          <MapView bins={BINS} trucks={TRUCKS} mrfs={MRF_LOCATIONS} height={420} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Full Bin Alerts */}
          <div
            className="bg-white rounded-xl p-4 flex flex-col gap-2"
            style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>Full Bin Alerts</h2>
              <span className="rounded-full px-2.5 py-0.5 font-semibold"
                style={{ fontSize: 12, background: "#FFEBEE", color: "#DC2626" }}>
                {fullBins.length}
              </span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
              {fullBins.length === 0 ? (
                <p className="text-text-muted text-center py-6" style={{ fontSize: 13 }}>No full bins reported.</p>
              ) : (
                fullBins.map((b) => (
                  <AlertRow
                    key={b.id}
                    name={b.name}
                    description={`${b.street}, ${b.barangay} — Reported full`}
                    timeReported={b.timeReported}
                  />
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className="bg-white rounded-xl p-4 flex flex-col gap-2 flex-1"
            style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} color="#6B7280" />
              <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>Recent Activity</h2>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
              {RECENT_ACTIVITY.map((a) => (
                <ActivityRow key={a.id} event={a.event} description={a.description} timestamp={a.timestamp} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
