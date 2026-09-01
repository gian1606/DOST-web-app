import MapView from "../components/ui/MapView";
import { BINS, TRUCKS, MRF_LOCATIONS } from "../mock/data";

const PB_BARANGAY = "Alangilan";

export default function PBMapView() {
  const bins = BINS.filter((b) => b.barangay === PB_BARANGAY);
  const mrfs = MRF_LOCATIONS.filter((m) => m.barangay === PB_BARANGAY);

  const fullCount   = bins.filter((b) => b.status === "full").length;
  const okCount     = bins.filter((b) => b.status === "ok").length;
  const collectedCount = bins.filter((b) => b.status === "collected").length;
  const missedCount = bins.filter((b) => b.status === "missed").length;

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>
            Live Map
          </h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            Real-time bin and truck monitoring — Barangay {PB_BARANGAY}
          </p>
        </div>
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium"
          style={{ fontSize: 12, background: "#E8F5E9", color: "#2E7D32", border: "1px solid #A5D6A7" }}
        >
          <span
            className="rounded-full"
            style={{ width: 7, height: 7, background: "#2E7D32", display: "inline-block" }}
          />
          Live
        </span>
      </div>

      {/* Bin status summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Bins",  value: bins.length,     bg: "#F9FAFB", color: "#1A1A1A", border: "#E5E7EB" },
          { label: "Full",        value: fullCount,       bg: "#FFEBEE", color: "#DC2626", border: "#FFCDD2" },
          { label: "Collected",   value: collectedCount,  bg: "#E8F5E9", color: "#2E7D32", border: "#A5D6A7" },
          { label: "Missed",      value: missedCount,     bg: "#FFF3E0", color: "#D97706", border: "#FFCC80" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-4 py-3 flex flex-col gap-0.5"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}
          >
            <span className="font-bold" style={{ fontSize: 22, color: s.color }}>
              {s.value}
            </span>
            <span style={{ fontSize: 12, color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div
        className="bg-white rounded-xl p-4"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <MapView
          bins={bins}
          trucks={TRUCKS}
          mrfs={mrfs}
          height={520}
        />
      </div>

      {/* Bin list */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: "#E5E7EB", background: "#F9FAFB" }}
        >
          <span className="font-semibold text-text-secondary uppercase tracking-wide" style={{ fontSize: 12 }}>
            Bin Status — Brgy. {PB_BARANGAY}
          </span>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Bin", "Street", "Status", "Reported By", "Time Reported"].map((h) => (
                <th
                  key={h}
                  className="text-left font-semibold uppercase tracking-wide px-5 py-3"
                  style={{ fontSize: 12, color: "#6B7280" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bins.map((b, i) => (
              <tr
                key={b.id}
                style={{
                  background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                  borderBottom: "1px solid #F3F4F6",
                }}
              >
                <td className="px-5 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>
                  {b.name}
                </td>
                <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>
                  {b.street}
                </td>
                <td className="px-5 py-3">
                  <StatusPill status={b.status} />
                </td>
                <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>
                  {b.reportedBy ?? "—"}
                </td>
                <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>
                  {b.timeReported
                    ? new Date(b.timeReported).toLocaleString("en-PH", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  full:      { bg: "#FFEBEE", color: "#DC2626", label: "Full" },
  ok:        { bg: "#E8F5E9", color: "#2E7D32", label: "OK" },
  collected: { bg: "#E8F5E9", color: "#2E7D32", label: "Collected" },
  missed:    { bg: "#FFF3E0", color: "#D97706", label: "Missed" },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] ?? { bg: "#F3F4F6", color: "#6B7280", label: status };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 font-medium"
      style={{ fontSize: 12, background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

