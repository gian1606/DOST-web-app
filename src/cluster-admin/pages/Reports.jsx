import { useState } from "react";
import { CheckCircle, Trash2, Truck, TrendingUp, TrendingDown, AlertTriangle, Download, Users } from "lucide-react";
import { BINS, CLUSTER_INFO } from "../mock/data";

// ── Inline analytics mock data ────────────────────────────────────────────────
const MONTHLY_COLLECTIONS = [
  { month: "Jan", collected: 48, target: 55, missed: 7 },
  { month: "Feb", collected: 53, target: 55, missed: 2 },
  { month: "Mar", collected: 50, target: 58, missed: 8 },
  { month: "Apr", collected: 57, target: 60, missed: 3 },
  { month: "May", collected: 44, target: 60, missed: 16 },
];

const BARANGAY_PERFORMANCE = [
  { barangay: "Alangilan",       binsReported: 12, collected: 10, missed: 2, rate: 83 },
  { barangay: "Cuta",            binsReported: 10, collected: 9,  missed: 1, rate: 90 },
  { barangay: "Kumintang Ibaba", binsReported: 8,  collected: 6,  missed: 2, rate: 75 },
  { barangay: "Pallocan West",   binsReported: 7,  collected: 7,  missed: 0, rate: 100 },
];

const DAILY_TREND = [
  { day: "Mon", collected: 9 }, { day: "Tue", collected: 12 }, { day: "Wed", collected: 8 },
  { day: "Thu", collected: 14 }, { day: "Fri", collected: 10 }, { day: "Sat", collected: 5 }, { day: "Sun", collected: 2 },
];

const MISSED_REASONS = [
  { reason: "Bin not accessible",   count: 8, color: "#DC2626" },
  { reason: "Route not dispatched", count: 5, color: "#D97706" },
  { reason: "Truck breakdown",      count: 2, color: "#1976D2" },
  { reason: "Weather conditions",   count: 1, color: "#9C27B0" },
];

// ── Reusable chart components ─────────────────────────────────────────────────
function GrowthBadge({ value }) {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
      style={{ fontSize: 11, background: up ? "#E8F5E9" : "#FFEBEE", color: up ? "#2E7D32" : "#DC2626" }}>
      <Icon size={10} />{Math.abs(value)}%
    </span>
  );
}

function BarChart({ data, valueKey, targetKey, labelKey, height = 140 }) {
  const max = Math.max(...data.map((d) => Math.max(d[valueKey] ?? 0, d[targetKey] ?? 0)), 1);
  return (
    <div className="flex items-end gap-2 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className="flex items-end gap-0.5 w-full" style={{ height: height - 20 }}>
            {targetKey && (
              <div className="flex-1 rounded-t-sm opacity-25"
                style={{ height: `${(d[targetKey] / max) * 100}%`, background: "#9CA3AF", minHeight: 2 }} />
            )}
            <div className="flex-1 rounded-t-sm"
              style={{ height: `${(d[valueKey] / max) * 100}%`, background: "#2E7D32", minHeight: 2 }} />
          </div>
          <span className="text-text-muted text-center" style={{ fontSize: 10 }}>{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ data, valueKey, color = "#2E7D32", height = 60 }) {
  const vals = data.map((d) => d[valueKey]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pts = vals.map((v) => ((v - min) / range) * (height - 8) + 4);
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${data.length * 30} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
        points={pts.map((y, i) => `${i * 30 + 15},${height - y}`).join(" ")} />
      {pts.map((y, i) => <circle key={i} cx={i * 30 + 15} cy={height - y} r="3" fill={color} />)}
    </svg>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl p-5 flex flex-col gap-4"
      style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <h2 className="font-semibold text-text-primary" style={{ fontSize: 16 }}>{title}</h2>
      {children}
    </div>
  );
}

function KpiCard({ icon, label, value, growth, sub, bg = "#F9FAFB" }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: bg, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center rounded-lg"
          style={{ width: 34, height: 34, background: "#fff" }}>{icon}</div>
        <GrowthBadge value={growth} />
      </div>
      <div>
        <div className="font-bold text-text-primary" style={{ fontSize: 24 }}>{value}</div>
        <div className="font-medium text-text-secondary" style={{ fontSize: 13 }}>{label}</div>
        {sub && <div className="text-text-muted mt-0.5" style={{ fontSize: 11 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Reports() {
  const [period, setPeriod] = useState("monthly");

  const clusterBins    = BINS.filter((b) => b.cluster === "c1");
  const collectedBins  = clusterBins.filter((b) => b.status === "collected").length;
  const fullBins       = clusterBins.filter((b) => b.status === "full").length;
  const missedBins     = clusterBins.filter((b) => b.status === "missed").length;
  const totalBins      = clusterBins.length;
  const collectionRate = totalBins > 0 ? Math.round((collectedBins / totalBins) * 100) : 0;

  const totalMissed = MISSED_REASONS.reduce((s, r) => s + r.count, 0);
  const chartData   = period === "monthly" ? MONTHLY_COLLECTIONS : DAILY_TREND;
  const labelKey    = period === "monthly" ? "month" : "day";

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Reports &amp; Analytics</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            {CLUSTER_INFO.label} — {CLUSTER_INFO.zone} · May 2026
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 13, background: "#2E7D32" }}>
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard icon={<CheckCircle size={18} color="#2E7D32" />} label="Bins Collected" value={collectedBins} growth={10} sub="this period" bg="#E8F5E9" />
        <KpiCard icon={<Trash2 size={18} color="#DC2626" />} label="Full Bins" value={fullBins} growth={-4} sub="awaiting collection" bg="#FFEBEE" />
        <KpiCard icon={<AlertTriangle size={18} color="#D97706" />} label="Missed Collections" value={missedBins} growth={-6} sub="lower is better" bg="#FFF3E0" />
        <KpiCard icon={<Users size={18} color="#1976D2" />} label="Active Barangays" value={BARANGAY_PERFORMANCE.length} growth={0} sub="under this cluster" bg="#E3F2FD" />
      </div>

      {/* Collection rate ring + Collections chart */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "260px 1fr" }}>

        {/* Collection rate donut */}
        <div className="bg-white rounded-xl p-5 flex flex-col items-center justify-center gap-3"
          style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h2 className="font-semibold text-text-primary self-start" style={{ fontSize: 16 }}>Collection Rate</h2>
          <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
            <svg viewBox="0 0 36 36" style={{ width: 130, height: 130, transform: "rotate(-90deg)" }}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F3F4F6" strokeWidth="3.2" />
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={collectionRate >= 80 ? "#2E7D32" : collectionRate >= 60 ? "#D97706" : "#DC2626"}
                strokeWidth="3.2"
                strokeDasharray={`${collectionRate} ${100 - collectionRate}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-bold text-text-primary" style={{ fontSize: 24 }}>{collectionRate}%</span>
              <span className="text-text-muted" style={{ fontSize: 10 }}>rate</span>
            </div>
          </div>
          <div className="w-full flex flex-col gap-1.5">
            {[
              { label: "Collected", value: collectedBins, color: "#2E7D32" },
              { label: "Full",      value: fullBins,      color: "#DC2626" },
              { label: "Missed",    value: missedBins,    color: "#D97706" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full" style={{ width: 8, height: 8, background: s.color, display: "inline-block" }} />
                  <span className="text-text-secondary" style={{ fontSize: 12 }}>{s.label}</span>
                </div>
                <span className="font-semibold text-text-primary" style={{ fontSize: 12 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Collections bar chart */}
        <Section title="Collections Overview">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-4">
              {[["#2E7D32", "Collected"], ["#9CA3AF", "Target"]].map(([color, label]) => (
                <span key={label} className="flex items-center gap-1.5 text-text-muted" style={{ fontSize: 12 }}>
                  <span className="inline-block rounded-sm" style={{ width: 10, height: 10, background: color, opacity: label === "Target" ? 0.4 : 1 }} />
                  {label}
                </span>
              ))}
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1.5px solid #E5E7EB" }}>
              {["monthly", "daily"].map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 capitalize font-medium transition-colors"
                  style={{ fontSize: 12, background: period === p ? "#2E7D32" : "#fff", color: period === p ? "#fff" : "#6B7280" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <BarChart data={chartData} valueKey="collected" targetKey={period === "monthly" ? "target" : undefined} labelKey={labelKey} height={160} />
          {period === "monthly" && (
            <div className="flex gap-2 mt-1">
              {MONTHLY_COLLECTIONS.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="rounded-full font-semibold text-white flex items-center justify-center"
                    style={{ width: 18, height: 18, fontSize: 9, background: "#DC2626" }}>
                    {d.missed}
                  </span>
                  <span className="text-text-muted" style={{ fontSize: 9 }}>missed</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Daily trend + Missed reasons */}
      <div className="grid grid-cols-2 gap-4">
        <Section title="Daily Collection Trend — This Week">
          <div className="flex items-end justify-between mb-1">
            <div>
              <span className="font-bold text-text-primary" style={{ fontSize: 24 }}>
                {DAILY_TREND[DAILY_TREND.length - 1].collected}
              </span>
              <span className="text-text-muted ml-1" style={{ fontSize: 13 }}>bins today</span>
            </div>
            <GrowthBadge value={-20} />
          </div>
          <Sparkline data={DAILY_TREND} valueKey="collected" color="#2E7D32" height={80} />
          <div className="flex items-center justify-between mt-1">
            {DAILY_TREND.map((d) => (
              <span key={d.day} className="text-text-muted" style={{ fontSize: 10 }}>{d.day}</span>
            ))}
          </div>
        </Section>

        <Section title="Missed Collections — Top Reasons">
          <div className="flex flex-col gap-3">
            {MISSED_REASONS.map((r) => (
              <div key={r.reason} className="flex items-center gap-3">
                <div className="flex-shrink-0 rounded-full" style={{ width: 10, height: 10, background: r.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-text-secondary font-medium truncate" style={{ fontSize: 12 }}>{r.reason}</span>
                    <span className="font-semibold text-text-primary ml-2" style={{ fontSize: 12 }}>{r.count}</span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: 5, background: "#F3F4F6" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(r.count / totalMissed) * 100}%`, background: r.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg px-3 py-2 mt-1" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
            <p className="text-text-muted" style={{ fontSize: 11 }}>
              Total missed: <strong style={{ color: "#DC2626" }}>{totalMissed}</strong> this period
            </p>
          </div>
        </Section>
      </div>

      {/* Barangay performance table */}
      <Section title="Barangay Collection Performance">
        <div className="overflow-hidden rounded-lg" style={{ border: "1px solid #F3F4F6" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Barangay", "Bins Reported", "Collected", "Missed", "Collection Rate"].map((h) => (
                  <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                    style={{ fontSize: 11, color: "#6B7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BARANGAY_PERFORMANCE.map((b, i) => (
                <tr key={b.barangay} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                  <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{b.barangay}</td>
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{b.binsReported}</td>
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{b.collected}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13 }}>
                    <span className="rounded-full px-2 py-0.5 font-semibold"
                      style={{ fontSize: 11, background: b.missed > 0 ? "#FFEBEE" : "#E8F5E9", color: b.missed > 0 ? "#DC2626" : "#2E7D32" }}>
                      {b.missed}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "#F3F4F6", maxWidth: 80 }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${b.rate}%`, background: b.rate >= 90 ? "#2E7D32" : b.rate >= 75 ? "#D97706" : "#DC2626" }} />
                      </div>
                      <span className="font-semibold" style={{ fontSize: 13, color: b.rate >= 90 ? "#2E7D32" : b.rate >= 75 ? "#D97706" : "#DC2626" }}>
                        {b.rate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg px-4 py-3 flex items-center justify-between"
          style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
          <span className="text-text-muted" style={{ fontSize: 12 }}>
            Cluster average: <strong style={{ color: "#2E7D32" }}>
              {Math.round(BARANGAY_PERFORMANCE.reduce((s, b) => s + b.rate, 0) / BARANGAY_PERFORMANCE.length)}%
            </strong>
          </span>
          <span className="text-text-muted" style={{ fontSize: 12 }}>
            Total bins: <strong style={{ color: "#1A1A1A" }}>
              {BARANGAY_PERFORMANCE.reduce((s, b) => s + b.binsReported, 0)}
            </strong>
          </span>
        </div>
      </Section>

    </div>
  );
}

