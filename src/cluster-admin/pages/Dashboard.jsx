import { useState } from "react";
import { Trash2, Truck, CheckCircle, Activity, RefreshCw, Trophy } from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import AlertRow from "../../components/ui/AlertRow";
import ActivityRow from "../../components/ui/ActivityRow";
import MapView from "../../components/ui/MapView";
import {
  DASHBOARD_STATS,
  BINS,
  TRUCKS,
  RECENT_ACTIVITY,
  BARANGAYS,
  LEADERBOARD,
  CLUSTER_INFO,
  ACTIVE_ROUTE,
} from "../mock/data";

const BARANGAY_FILTERS = [
  { id: "all", name: "All Barangays" },
  ...BARANGAYS.map((b) => ({ id: b.id, name: b.name })),
];

export default function Dashboard() {
  const [barangayFilter, setBarangayFilter] = useState("all");

  const filteredBins =
    barangayFilter === "all"
      ? BINS
      : BINS.filter((b) => {
          const br = BARANGAYS.find((x) => x.id === barangayFilter);
          return br && b.barangay === br.name.replace("Brgy. ", "");
        });

  const fullBins = filteredBins.filter((b) => b.status === "full");

  const stats =
    barangayFilter === "all"
      ? DASHBOARD_STATS
      : {
          totalBins:      filteredBins.length,
          fullBins:       fullBins.length,
          collectedToday: filteredBins.filter((b) => b.status === "collected").length,
          activeTrucks:   DASHBOARD_STATS.activeTrucks,
        };

  const collectionRate =
    stats.fullBins > 0
      ? Math.round((stats.collectedToday / (stats.collectedToday + stats.fullBins)) * 100)
      : 100;

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>
            {CLUSTER_INFO.label} Dashboard
          </h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            {CLUSTER_INFO.label} — {CLUSTER_INFO.zone} · Batangas City · {today}
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
          style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280" }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Barangay filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {BARANGAY_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setBarangayFilter(f.id)}
            className="rounded-full px-4 py-1.5 font-medium transition-colors"
            style={{
              fontSize: 13,
              background: barangayFilter === f.id ? "#2E7D32" : "#fff",
              color: barangayFilter === f.id ? "#fff" : "#6B7280",
              border: barangayFilter === f.id ? "1.5px solid #2E7D32" : "1.5px solid #E5E7EB",
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Trash2 size={18} color="#6B7280" />}
          value={stats.totalBins}
          label="Total Bins"
          subLabel="In this cluster"
        />
        <StatCard
          icon={<Trash2 size={18} color="#DC2626" />}
          value={stats.fullBins}
          label="Full Bins"
          subLabel={stats.fullBins > 3 ? "2 critical" : "Needs collection"}
          subLabelColor="#DC2626"
        />
        <StatCard
          icon={<CheckCircle size={18} color="#2E7D32" />}
          value={stats.collectedToday}
          label="Collected Today"
          subLabel="Resets daily at midnight"
          subLabelColor="#2E7D32"
        />
        <StatCard
          icon={<Truck size={18} color="#1976D2" />}
          value={stats.activeTrucks}
          label="Active Trucks"
          subLabel="1 on route"
          subLabelColor="#1976D2"
        />
      </div>

      {/* Collection rate card */}
      <div
        className="bg-white rounded-xl p-5"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-text-primary" style={{ fontSize: 15 }}>
            Collection Rate — {collectionRate}%
          </span>
          <span className="text-text-secondary" style={{ fontSize: 13 }}>
            {stats.collectedToday} of {stats.collectedToday + stats.fullBins} reported full bins collected today
          </span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 10, background: "#E5E7EB" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${collectionRate}%`, background: collectionRate >= 75 ? "#2E7D32" : collectionRate >= 50 ? "#D97706" : "#DC2626" }}
          />
        </div>
      </div>

      {/* Active route banner */}
      {ACTIVE_ROUTE && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "#E0F2F1", border: "1px solid #80CBC4" }}
        >
          <Truck size={18} color="#00796B" />
          <div className="flex-1">
            <span className="font-semibold" style={{ fontSize: 14, color: "#00796B" }}>
              Active Route Received from Super Admin
            </span>
            <span className="text-text-secondary ml-2" style={{ fontSize: 13 }}>
              {ACTIVE_ROUTE.routeId} · {ACTIVE_ROUTE.bins.length} bins · Est. {ACTIVE_ROUTE.estimatedMinutes} min
            </span>
          </div>
        </div>
      )}

      {/* 2-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 380px" }}>
        {/* Left: Live Map */}
        <div
          className="bg-white rounded-xl p-4 flex flex-col gap-3"
          style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>
              Live Map — {CLUSTER_INFO.label}
            </h2>
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
              style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}
            >
              <span className="rounded-full" style={{ width: 6, height: 6, background: "#2E7D32", display: "inline-block" }} />
              Live
            </span>
          </div>
          <MapView
            bins={filteredBins}
            trucks={TRUCKS}
            mrfs={[]}
            routeOrder={ACTIVE_ROUTE ? ACTIVE_ROUTE.order : []}
            showRoute={!!ACTIVE_ROUTE}
            height={380}
          />
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
              <span className="rounded-full px-2.5 py-0.5 font-semibold" style={{ fontSize: 12, background: "#FFEBEE", color: "#DC2626" }}>
                {fullBins.length}
              </span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 180 }}>
              {fullBins.length === 0 ? (
                <p className="text-text-muted text-center py-6" style={{ fontSize: 13 }}>
                  ✓ All bins are OK
                </p>
              ) : (
                fullBins.map((b) => (
                  <AlertRow
                    key={b.id}
                    name={b.name}
                    description={`${b.street}, ${b.barangay} — Needs collection`}
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
            <div className="overflow-y-auto" style={{ maxHeight: 180 }}>
              {RECENT_ACTIVITY.map((a) => (
                <ActivityRow key={a.id} event={a.event} description={a.description} timestamp={a.timestamp} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Barangay Leaderboard */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "#E5E7EB" }}>
          <Trophy size={17} color="#D97706" />
          <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>
            Barangay Collection Leaderboard
          </h2>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Rank", "Barangay Name", "Bins Reported", "Bins Collected", "Collection Rate"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-5 py-3" style={{ fontSize: 12, color: "#6B7280" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEADERBOARD.map((row, i) => (
              <tr
                key={row.rank}
                style={{
                  background: i === 0 ? "#FFFDE7" : i % 2 === 0 ? "#fff" : "#FAFAFA",
                  borderBottom: "1px solid #F3F4F6",
                }}
              >
                <td className="px-5 py-3 font-bold" style={{ fontSize: 14, color: i === 0 ? "#D97706" : "#6B7280" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : row.rank}
                </td>
                <td className="px-5 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{row.barangay}</td>
                <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>{row.binsReported}</td>
                <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>{row.binsCollected}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "#E5E7EB", maxWidth: 80 }}>
                      <div className="h-full rounded-full" style={{ width: `${row.rate}%`, background: row.rate >= 80 ? "#2E7D32" : row.rate >= 60 ? "#D97706" : "#DC2626" }} />
                    </div>
                    <span className="font-semibold" style={{ fontSize: 13, color: row.rate >= 80 ? "#2E7D32" : row.rate >= 60 ? "#D97706" : "#DC2626" }}>
                      {row.rate}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

