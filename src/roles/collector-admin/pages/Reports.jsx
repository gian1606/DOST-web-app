import { colors } from "../../../theme/colors.js";
import { useState, useEffect } from "react";
import {
  CheckCircle, Trash2, Truck, TrendingUp, TrendingDown, AlertTriangle,
  Download, BarChart2, FileWarning, CheckCheck, Clock, ChevronDown, ChevronUp, Fuel,
} from "lucide-react";
import { COLLECTOR_UNITS, COLLECTORS, BINS, CA_DASHBOARD_STATS, CA_MONTHLY_COLLECTIONS, CA_UNIT_PERFORMANCE, CA_DAILY_TREND, CA_MISSED_REASONS } from "../../../mock/data";
import { fetchCollectorReports, resolveCollectorReport } from "../../../services/reports.js";

// ── Reusable chart components ─────────────────────────────────────────────────
function GrowthBadge({ value }) {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
      style={{ fontSize: 11, background: up ? colors.accentSoft : colors.errorSoft, color: up ? colors.primary : colors.error }}>
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
                style={{ height: `${(d[targetKey] / max) * 100}%`, background: colors.textMuted, minHeight: 2 }} />
            )}
            <div className="flex-1 rounded-t-sm"
              style={{ height: `${(d[valueKey] / max) * 100}%`, background: colors.primary, minHeight: 2 }} />
          </div>
          <span className="text-text-muted text-center" style={{ fontSize: 10 }}>{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ data, valueKey, color = colors.primary, height = 60 }) {
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
      style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <h2 className="font-semibold text-text-primary" style={{ fontSize: 16 }}>{title}</h2>
      {children}
    </div>
  );
}

function KpiCard({ icon, label, value, growth, sub, bg = colors.gray50 }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: bg, border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center rounded-lg"
          style={{ width: 34, height: 34, background: colors.white }}>{icon}</div>
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

// ── Fuel Savings Gauge ────────────────────────────────────────────────────────
function FuelSavingsGauge({ totalCollections, collectionRate }) {
  const BASELINE_L   = 0.85;
  const OPTIMIZED_L  = 0.62;
  const savedLitres  = Math.round(totalCollections * (BASELINE_L - OPTIMIZED_L));
  const maxLitres    = Math.round(totalCollections * BASELINE_L);
  const pct          = Math.min(Math.round((savedLitres / maxLitres) * 100), 100);
  const costPerLitre = 65;
  const savedPHP     = (savedLitres * costPerLitre).toLocaleString();
  const gaugeColor   = pct >= 60 ? colors.primary : pct >= 35 ? colors.warning : colors.error;

  const SWEEP = 300; const START_DEG = -150;
  const r = 52; const cx = 70; const cy = 70;
  function polarToXY(deg, radius) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }
  function arcPath(fromDeg, toDeg, radius) {
    const s = polarToXY(fromDeg, radius);
    const e = polarToXY(toDeg, radius);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }
  const activeDeg = START_DEG + (SWEEP * pct) / 100;

  return (
    <div className="bg-white rounded-xl p-5 flex flex-col gap-4"
      style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center rounded-lg"
          style={{ width: 32, height: 32, background: colors.accentSoft }}>
          <Fuel size={16} color={colors.primary} />
        </div>
        <h2 className="font-semibold text-text-primary" style={{ fontSize: 16 }}>Fuel Savings Gauge</h2>
        <span className="ml-auto rounded-full px-2.5 py-0.5 font-semibold"
          style={{ fontSize: 11, background: colors.accentSoft, color: colors.primary }}>
          vs. unoptimized baseline
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex-shrink-0 flex flex-col items-center">
          <svg width={140} height={90} viewBox="0 0 140 90">
            <path d={arcPath(START_DEG, START_DEG + SWEEP, r)} fill="none" stroke={colors.gray100} strokeWidth={10} strokeLinecap="round" />
            {pct > 0 && <path d={arcPath(START_DEG, activeDeg, r)} fill="none" stroke={gaugeColor} strokeWidth={10} strokeLinecap="round" />}
            {(() => { const p = polarToXY(activeDeg, r); return <circle cx={p.x} cy={p.y} r={5} fill={gaugeColor} />; })()}
            <text x={cx} y={cy - 4} textAnchor="middle" fill={colors.textHeading} fontWeight="800" fontSize={18}>{pct}%</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill={colors.textMuted} fontSize={9}>saved</text>
            <text x={18} y={84} textAnchor="middle" fill={colors.textMuted} fontSize={8}>0</text>
            <text x={122} y={84} textAnchor="middle" fill={colors.textMuted} fontSize={8}>100%</text>
          </svg>
          <div className="flex items-center gap-3 mt-1">
            {[[colors.error, "Low"], [colors.warning, "Mid"], [colors.primary, "High"]].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1" style={{ fontSize: 10, color: colors.textMuted }}>
                <span className="rounded-full inline-block" style={{ width: 7, height: 7, background: c }} />{l}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Litres Saved",    value: `${savedLitres.toLocaleString()} L`, color: colors.primary, bg: colors.accentSoft },
              { label: "Cost Saved",      value: `₱${savedPHP}`,                      color: colors.recyclable, bg: colors.infoSoft },
              { label: "Baseline Usage",  value: `${maxLitres.toLocaleString()} L`,   color: colors.gray500, bg: colors.gray100 },
              { label: "Optimized Usage", value: `${(maxLitres - savedLitres).toLocaleString()} L`, color: colors.warning, bg: colors.warningSoft },
            ].map((s) => (
              <div key={s.label} className="rounded-lg px-3 py-2 flex flex-col gap-0.5" style={{ background: s.bg }}>
                <span className="text-text-muted" style={{ fontSize: 10 }}>{s.label}</span>
                <span className="font-bold" style={{ fontSize: 15, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg px-3 py-2 flex items-center gap-2"
            style={{ background: colors.gray50, border: "1px solid #F3F4F6" }}>
            <Fuel size={12} color={colors.textMuted} />
            <p style={{ fontSize: 11, color: colors.gray500 }}>
              {totalCollections} collections · ₱65/L · {collectionRate}% route efficiency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Issue type badge colours ───────────────────────────────────────────────────
const ISSUE_COLORS = {
  "Vehicle Problem":   { bg: colors.errorSoft, color: colors.error },
  "Traffic Jam":       { bg: colors.warningSoft, color: colors.warning },
  "Road Closure":      { bg: colors.lockedSoft, color: colors.lockedText },
  "Weather Condition": { bg: colors.infoSoft, color: colors.recyclable },
  "Other":             { bg: colors.gray100, color: colors.gray500 },
};

function IssueBadge({ type }) {
  const style = ISSUE_COLORS[type] ?? ISSUE_COLORS["Other"];
  return (
    <span className="rounded-full px-2.5 py-0.5 font-semibold"
      style={{ fontSize: 11, background: style.bg, color: style.color }}>
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const isPending = status === "pending";
  return (
    <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold"
      style={{ fontSize: 11, background: isPending ? colors.warningSoft : colors.accentSoft, color: isPending ? colors.warning : colors.primary }}>
      {isPending ? <Clock size={10} /> : <CheckCheck size={10} />}
      {isPending ? "Pending" : "Resolved"}
    </span>
  );
}

// ── Incident Reports Tab ───────────────────────────────────────────────────────
function IncidentReports() {
  const [reports, setReports]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId]     = useState(null);
  const [resolving, setResolving]       = useState(null);

  async function fetchReports() {
    setLoading(true); setFetchError(null);
    try {
      setReports(await fetchCollectorReports(filterStatus));
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReports(); }, [filterStatus]);

  async function handleResolve(id) {
    setResolving(id);
    try {
      const updated = await resolveCollectorReport(id);
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      alert(err.message);
    } finally {
      setResolving(null);
    }
  }

  const pending  = reports.filter((r) => r.status === "pending").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{ background: colors.warningSoft, border: "1px solid " + colors.warningBorder }}>
          <Clock size={15} color={colors.warning} />
          <span className="font-semibold" style={{ fontSize: 14, color: colors.warning }}>{pending} Pending</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{ background: colors.accentSoft, border: "1px solid " + colors.accentBorder }}>
          <CheckCheck size={15} color={colors.primary} />
          <span className="font-semibold" style={{ fontSize: 14, color: colors.primary }}>{resolved} Resolved</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex rounded-lg overflow-hidden" style={{ border: "1.5px solid " + colors.gray200 }}>
          {["all", "pending", "resolved"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-4 py-2 capitalize font-medium transition-colors"
              style={{ fontSize: 13, background: filterStatus === s ? colors.primary : colors.white, color: filterStatus === s ? "#fff" : colors.gray500 }}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={fetchReports}
          className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
          style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>
          Refresh
        </button>
      </div>

      {fetchError && (
        <div className="rounded-xl px-4 py-3"
          style={{ background: colors.errorSoft, border: "1px solid " + colors.errorBorder, color: colors.error, fontSize: 13 }}>
          {fetchError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-text-muted" style={{ fontSize: 14 }}>Loading reports…</div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <FileWarning size={36} color={colors.gray300} />
          <p className="text-text-muted" style={{ fontSize: 14 }}>No incident reports found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => {
            const isExpanded = expandedId === r.id;
            const isPending  = r.status === "pending";
            return (
              <div key={r.id} className="bg-white rounded-xl overflow-hidden"
                style={{ border: `1.5px solid ${isPending ? "#FFE0B2" : colors.gray200}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-text-primary" style={{ fontSize: 14 }}>{r.collectorName}</span>
                      <IssueBadge type={r.issueType} />
                      <StatusBadge status={r.status} />
                    </div>
                    <span className="text-text-muted" style={{ fontSize: 12 }}>
                      {new Date(r.reportedAt).toLocaleString()} · {r.stopsCompleted}/{r.stopsTotal} stops completed
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isPending && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResolve(r.id); }}
                        disabled={resolving === r.id}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold hover:opacity-90 transition-opacity"
                        style={{ fontSize: 12, background: colors.primary, color: colors.white, opacity: resolving === r.id ? 0.6 : 1 }}>
                        <CheckCheck size={13} />
                        {resolving === r.id ? "Resolving…" : "Mark Resolved"}
                      </button>
                    )}
                    {isExpanded ? <ChevronUp size={16} color={colors.textMuted} /> : <ChevronDown size={16} color={colors.textMuted} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-4 flex flex-col gap-3 border-t" style={{ borderColor: colors.gray100 }}>
                    <div className="grid grid-cols-3 gap-4 pt-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-text-muted uppercase tracking-wide" style={{ fontSize: 10, fontWeight: 600 }}>Collector</span>
                        <span className="font-medium text-text-primary" style={{ fontSize: 13 }}>{r.collectorName}</span>
                        <span className="text-text-muted" style={{ fontSize: 11 }}>{r.collectorEmail}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-text-muted uppercase tracking-wide" style={{ fontSize: 10, fontWeight: 600 }}>Progress at Report</span>
                        <span className="font-medium text-text-primary" style={{ fontSize: 13 }}>
                          {r.stopsCompleted} of {r.stopsTotal} stops
                        </span>
                        <span className="text-text-muted" style={{ fontSize: 11 }}>
                          {r.stopsTotal > 0 ? Math.round((r.stopsCompleted / r.stopsTotal) * 100) : 0}% complete
                        </span>
                      </div>
                      {r.resolvedAt && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-text-muted uppercase tracking-wide" style={{ fontSize: 10, fontWeight: 600 }}>Resolved</span>
                          <span className="font-medium text-text-primary" style={{ fontSize: 13 }}>
                            {new Date(r.resolvedAt).toLocaleString()}
                          </span>
                          {r.resolvedByName && (
                            <span className="text-text-muted" style={{ fontSize: 11 }}>by {r.resolvedByName}</span>
                          )}
                        </div>
                      )}
                    </div>
                    {r.notes && (
                      <div className="rounded-lg px-4 py-3" style={{ background: colors.gray50, border: "1px solid #F3F4F6" }}>
                        <p className="text-text-muted uppercase tracking-wide mb-1" style={{ fontSize: 10, fontWeight: 600 }}>Notes</p>
                        <p className="text-text-primary" style={{ fontSize: 13, lineHeight: 1.6 }}>{r.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CAReports() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [period, setPeriod]       = useState("monthly");

  const clusterBins    = BINS;
  const collectedBins  = clusterBins.filter((b) => b.status === "collected").length;
  const fullBins       = clusterBins.filter((b) => b.status === "full").length;
  const missedBins     = clusterBins.filter((b) => b.status === "missed").length;
  const totalBins      = clusterBins.length;
  const collectionRate = totalBins > 0 ? Math.round((collectedBins / totalBins) * 100) : 0;

  const totalMissed = CA_MISSED_REASONS.reduce((s, r) => s + r.count, 0);
  const chartData   = period === "monthly" ? CA_MONTHLY_COLLECTIONS : CA_DAILY_TREND;
  const labelKey    = period === "monthly" ? "month" : "day";

  const totalBinsCollected = CA_UNIT_PERFORMANCE.reduce((s, u) => s + u.binsCollected, 0);
  const avgRate            = Math.round(CA_UNIT_PERFORMANCE.reduce((s, u) => s + u.rate, 0) / CA_UNIT_PERFORMANCE.length);

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Reports &amp; Analytics</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>Batangas City · May 2026</p>
        </div>
        {activeTab === "analytics" && (
          <button className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 13, background: colors.primary }}>
            <Download size={14} /> Export Report
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid " + colors.gray200, width: "fit-content" }}>
        {[
          { id: "analytics",        label: "Analytics",        icon: <BarChart2 size={14} /> },
          { id: "incident-reports", label: "Incident Reports", icon: <FileWarning size={14} /> },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-2.5 font-semibold transition-colors"
            style={{ fontSize: 13, background: activeTab === tab.id ? colors.primary : colors.white, color: activeTab === tab.id ? "#fff" : colors.gray500 }}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── Analytics Tab ── */}
      {activeTab === "analytics" && (<>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard icon={<CheckCircle size={18} color={colors.primary} />} label="Bins Collected"     value={collectedBins}              growth={12}  sub="this period"       bg={colors.accentSoft} />
          <KpiCard icon={<Trash2 size={18} color={colors.error} />}      label="Full Bins"           value={fullBins}                   growth={-5}  sub="awaiting collection" bg={colors.errorSoft} />
          <KpiCard icon={<AlertTriangle size={18} color={colors.warning} />} label="Missed Collections" value={missedBins}               growth={-8}  sub="lower is better"   bg={colors.warningSoft} />
          <KpiCard icon={<Truck size={18} color={colors.recyclable} />}        label="Active Units"        value={CA_DASHBOARD_STATS.activeUnits} growth={0} sub="collector units" bg={colors.infoSoft} />
        </div>

        {/* Collection rate ring + Collections chart */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "260px 1fr" }}>
          <div className="bg-white rounded-xl p-5 flex flex-col items-center justify-center gap-3"
            style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h2 className="font-semibold text-text-primary self-start" style={{ fontSize: 16 }}>Collection Rate</h2>
            <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
              <svg viewBox="0 0 36 36" style={{ width: 130, height: 130, transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={colors.gray100} strokeWidth="3.2" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={collectionRate >= 80 ? colors.primary : collectionRate >= 60 ? colors.warning : colors.error}
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
                { label: "Collected", value: collectedBins, color: colors.primary },
                { label: "Full",      value: fullBins,      color: colors.error },
                { label: "Missed",    value: missedBins,    color: colors.warning },
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

          <Section title="Collections Overview">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-4">
                {[[colors.primary, "Collected"], [colors.textMuted, "Target"]].map(([color, label]) => (
                  <span key={label} className="flex items-center gap-1.5 text-text-muted" style={{ fontSize: 12 }}>
                    <span className="inline-block rounded-sm" style={{ width: 10, height: 10, background: color, opacity: label === "Target" ? 0.4 : 1 }} />
                    {label}
                  </span>
                ))}
              </div>
              <div className="flex rounded-lg overflow-hidden" style={{ border: "1.5px solid " + colors.gray200 }}>
                {["monthly", "daily"].map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className="px-3 py-1.5 capitalize font-medium transition-colors"
                    style={{ fontSize: 12, background: period === p ? colors.primary : colors.white, color: period === p ? "#fff" : colors.gray500 }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <BarChart data={chartData} valueKey="collected" targetKey={period === "monthly" ? "target" : undefined} labelKey={labelKey} height={160} />
            {period === "monthly" && (
              <div className="flex gap-2 mt-1">
                {CA_MONTHLY_COLLECTIONS.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <span className="rounded-full font-semibold text-white flex items-center justify-center"
                      style={{ width: 18, height: 18, fontSize: 9, background: colors.error }}>{d.missed}</span>
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
                  {CA_DAILY_TREND[CA_DAILY_TREND.length - 1].collected}
                </span>
                <span className="text-text-muted ml-1" style={{ fontSize: 13 }}>bins today</span>
              </div>
              <GrowthBadge value={-15} />
            </div>
            <Sparkline data={CA_DAILY_TREND} valueKey="collected" color={colors.primary} height={80} />
            <div className="flex items-center justify-between mt-1">
              {CA_DAILY_TREND.map((d) => (
                <span key={d.day} className="text-text-muted" style={{ fontSize: 10 }}>{d.day}</span>
              ))}
            </div>
          </Section>

          <Section title="Missed Collections — Top Reasons">
            <div className="flex flex-col gap-3">
              {CA_MISSED_REASONS.map((r) => (
                <div key={r.reason} className="flex items-center gap-3">
                  <div className="flex-shrink-0 rounded-full" style={{ width: 10, height: 10, background: r.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-text-secondary font-medium truncate" style={{ fontSize: 12 }}>{r.reason}</span>
                      <span className="font-semibold text-text-primary ml-2" style={{ fontSize: 12 }}>{r.count}</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 5, background: colors.gray100 }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(r.count / totalMissed) * 100}%`, background: r.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg px-3 py-2 mt-1" style={{ background: colors.gray50, border: "1px solid #F3F4F6" }}>
              <p className="text-text-muted" style={{ fontSize: 11 }}>
                Total missed: <strong style={{ color: colors.error }}>{totalMissed}</strong> this period
              </p>
            </div>
          </Section>
        </div>

        {/* Fuel Savings Gauge */}
        <FuelSavingsGauge totalCollections={totalBinsCollected} collectionRate={avgRate} />

        {/* Unit performance table */}
        <Section title="Collector Unit Performance">
          <div className="overflow-hidden rounded-lg" style={{ border: "1px solid #F3F4F6" }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: colors.gray50, borderBottom: "1px solid " + colors.gray200 }}>
                  {["Unit", "Plate No.", "Trips", "Bins Collected", "Missed", "Collection Rate"].map((h) => (
                    <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                      style={{ fontSize: 11, color: colors.gray500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CA_UNIT_PERFORMANCE.map((u, i) => (
                  <tr key={u.unit} style={{ background: i % 2 === 0 ? "#fff" : colors.tableRowAlt, borderBottom: "1px solid #F3F4F6" }}>
                    <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{u.unit}</td>
                    <td className="px-4 py-3 text-text-secondary font-mono" style={{ fontSize: 12 }}>{u.plate}</td>
                    <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{u.trips}</td>
                    <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{u.binsCollected}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13 }}>
                      <span className="rounded-full px-2 py-0.5 font-semibold"
                        style={{ fontSize: 11, background: colors.errorSoft, color: colors.error }}>{u.missedBins}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: colors.gray100, maxWidth: 80 }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${u.rate}%`, background: u.rate >= 90 ? colors.primary : u.rate >= 80 ? colors.warning : colors.error }} />
                        </div>
                        <span className="font-semibold"
                          style={{ fontSize: 13, color: u.rate >= 90 ? colors.primary : u.rate >= 80 ? colors.warning : colors.error }}>
                          {u.rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-lg px-4 py-3 flex items-center justify-between"
            style={{ background: colors.gray50, border: "1px solid #F3F4F6" }}>
            <span className="text-text-muted" style={{ fontSize: 12 }}>
              Overall rate: <strong style={{ color: colors.primary }}>{avgRate}%</strong>
            </span>
            <span className="text-text-muted" style={{ fontSize: 12 }}>
              Total trips: <strong style={{ color: colors.textHeading }}>
                {CA_UNIT_PERFORMANCE.reduce((s, u) => s + u.trips, 0)}
              </strong>
            </span>
          </div>
        </Section>

      </>)}

      {/* ── Incident Reports Tab ── */}
      {activeTab === "incident-reports" && <IncidentReports />}

    </div>
  );
}
