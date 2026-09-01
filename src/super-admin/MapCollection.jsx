import { RefreshCw } from "lucide-react";
import MapView from "../components/ui/MapView";
import { BINS, TRUCKS, MRF_LOCATIONS } from "../mock/data";

export default function MapCollection() {
  const fullCount      = BINS.filter((b) => b.status === "full").length;
  const collectedCount = BINS.filter((b) => b.status === "collected").length;
  const missedCount    = BINS.filter((b) => b.status === "missed").length;

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Map &amp; Collection</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>Real-time bin status and truck tracking</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
          style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280" }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Bin status summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Full Bins",  count: fullCount,      color: "#DC2626", bg: "#FFEBEE" },
          { label: "Collected",  count: collectedCount, color: "#2E7D32", bg: "#E8F5E9" },
          { label: "Missed",     count: missedCount,    color: "#D97706", bg: "#FFF3E0" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-5 py-4 flex items-center gap-3"
            style={{ background: s.bg, border: `1px solid ${s.color}22` }}
          >
            <span className="rounded-full" style={{ width: 12, height: 12, background: s.color, display: "inline-block", flexShrink: 0 }} />
            <span className="font-bold" style={{ fontSize: 22, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.count}</span>
            <span className="font-medium text-text-secondary" style={{ fontSize: 14 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Full-width map */}
      <div
        className="bg-white rounded-xl p-4"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <MapView bins={BINS} trucks={TRUCKS} mrfs={MRF_LOCATIONS} height={520} />
      </div>
    </div>
  );
}
