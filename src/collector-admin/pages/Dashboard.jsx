import { useNavigate } from "react-router-dom";
import { Trash2, Truck, CheckCircle, RefreshCw } from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import AlertRow from "../../components/ui/AlertRow";
import ActivityRow from "../../components/ui/ActivityRow";
import MapView from "../../components/ui/MapView";
import { CA_DASHBOARD_STATS, BINS, COLLECTOR_UNITS, CA_INCOMING_ROUTE, CA_RECENT_ACTIVITY } from "../../mock/data";

export default function CADashboard() {
  const navigate = useNavigate();
  const clusterBins = BINS;
  const fullBins = clusterBins.filter((b) => b.status === "full");
  const unitTrucks = COLLECTOR_UNITS.map((u) => ({ id: u.id, label: u.name, status: u.status, posX: u.posX, posY: u.posY }));
  const today = new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const hasPendingRoute = CA_INCOMING_ROUTE.status === "delivered";

  return (
    <div className="flex flex-col gap-6">
      {hasPendingRoute && (
        <div className="flex items-center justify-between rounded-xl px-5 py-3.5" style={{ background: "#E8F5E9", border: "1px solid #A5D6A7" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg" style={{ width: 34, height: 34, background: "#2E7D32" }}><Truck size={17} color="#fff" /></div>
            <div>
              <div className="font-semibold text-primary" style={{ fontSize: 14 }}>New Optimized Route Received</div>
              <div className="text-text-secondary" style={{ fontSize: 13 }}>Route {CA_INCOMING_ROUTE.routeId} sent by Super Admin · {CA_INCOMING_ROUTE.bins.length} bins · {CA_INCOMING_ROUTE.distanceKm} km</div>
            </div>
          </div>
          <button onClick={() => navigate("/ca/map")} className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity" style={{ fontSize: 13, background: "#2E7D32" }}>View Optimized Route</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Dashboard</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>{today} · Batangas City</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors" style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280" }}><RefreshCw size={14} />Refresh</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Trash2 size={18} color="#6B7280" />} value={CA_DASHBOARD_STATS.totalBins} label="Total Bins" subLabel="Batangas City" />
        <StatCard icon={<Trash2 size={18} color="#DC2626" />} value={CA_DASHBOARD_STATS.fullBins} label="Full Bins" subLabel="Needs collection" subLabelColor="#DC2626" />
        <StatCard icon={<CheckCircle size={18} color="#2E7D32" />} value={CA_DASHBOARD_STATS.collectedToday} label="Collected Today" subLabel={`${Math.round((CA_DASHBOARD_STATS.collectedToday / CA_DASHBOARD_STATS.totalBins) * 100)}% of target`} subLabelColor="#2E7D32" />
        <StatCard icon={<Truck size={18} color="#1976D2" />} value={CA_DASHBOARD_STATS.activeUnits} label="Collector Units" subLabel="1 en route" subLabelColor="#1976D2" />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 420px" }}>
        <div className="bg-white rounded-xl p-4 flex flex-col gap-3" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>Live Map</h2>
            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium" style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}>
              <span className="rounded-full" style={{ width: 6, height: 6, background: "#2E7D32", display: "inline-block" }} />Live
            </span>
          </div>
          <MapView bins={clusterBins} trucks={unitTrucks} mrfs={[]} height={420} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl p-4 flex flex-col gap-2" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>Full Bin Alerts</h2>
              <span className="rounded-full px-2.5 py-0.5 font-semibold" style={{ fontSize: 12, background: "#FFEBEE", color: "#DC2626" }}>{fullBins.length}</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
              {fullBins.length === 0
                ? <p className="text-text-muted text-center py-6" style={{ fontSize: 13 }}>No full bins reported.</p>
                : fullBins.map((b) => <AlertRow key={b.id} name={b.name} description={`${b.street}, ${b.barangay} — Reported full`} timeReported={b.timeReported} />)
              }
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 flex flex-col gap-2 flex-1" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h2 className="font-semibold text-text-primary mb-1" style={{ fontSize: 17 }}>Recent Activity</h2>
            <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
              {CA_RECENT_ACTIVITY.map((a) => <ActivityRow key={a.id} event={a.event} description={a.description} timestamp={a.timestamp} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

