import { useState, useMemo } from "react";
import {
  Trash2, CheckCircle, Users, Leaf, TrendingUp, TrendingDown,
  Download, BarChart2, AlertTriangle, ChevronDown,
} from "lucide-react";
import {
  CLUSTERS,
  CLUSTER_BARANGAY_MAP,
  REPORT_KPI,
  REPORT_KPI_BY_CLUSTER,
  REPORT_KPI_BY_BARANGAY,
  MONTHLY_COLLECTIONS,
  MONTHLY_COLLECTIONS_BY_CLUSTER,
  MONTHLY_COLLECTIONS_BY_BARANGAY,
  WEEKLY_COLLECTIONS,
  CLUSTER_COLLECTION_RATES,
  FULL_BIN_TREND,
  WASTE_BY_TYPE,
  WASTE_BY_TYPE_BY_CLUSTER,
  WASTE_BY_TYPE_BY_BARANGAY,
  ECO_TOKEN_MONTHLY,
  CLUSTER_PERFORMANCE,
  MISSED_REASONS,
  MISSED_REASONS_BY_CLUSTER,
  MISSED_REASONS_BY_BARANGAY,
  RESIDENT_ENGAGEMENT,
  REPORT_EXPORTS,
} from "../mock/data";

// -- Helpers -------------------------------------------------------------------
function fmt(n) {
  if (typeof n !== "number") return "—";
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : n.toString();
}

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
              <div className="flex-1 rounded-t-sm opacity-30"
                style={{ height: `${(d[targetKey] / max) * 100}%`, background: "#9CA3AF", minHeight: 2 }} />
            )}
            <div className="flex-1 rounded-t-sm"
              style={{ height: `${(d[valueKey] / max) * 100}%`, background: "#2E7D32", minHeight: 2 }} />
          </div>
          <span className="text-text-muted text-center leading-tight" style={{ fontSize: 10 }}>{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

function HBar({ label, value, max, color, suffix = "%" }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary font-medium" style={{ fontSize: 13 }}>{label}</span>
        <span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{value}{suffix}</span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: 8, background: "#F3F4F6" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
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
    <svg width="100%" height={height} viewBox={`0 0 ${data.length * 20} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
        points={pts.map((y, i) => `${i * 20 + 10},${height - y}`).join(" ")} />
      {pts.map((y, i) => <circle key={i} cx={i * 20 + 10} cy={height - y} r="2.5" fill={color} />)}
    </svg>
  );
}

function KpiCard({ icon, label, value, growth, sub }) {
  return (
    <div className="bg-white rounded-xl p-4 flex flex-col gap-2"
      style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center rounded-lg" style={{ width: 36, height: 36, background: "#F3F4F6" }}>{icon}</div>
        <GrowthBadge value={growth} />
      </div>
      <div>
        <div className="font-bold text-text-primary" style={{ fontSize: 26 }}>{value}</div>
        <div className="font-medium text-text-secondary" style={{ fontSize: 13 }}>{label}</div>
        {sub && <div className="text-text-muted mt-0.5" style={{ fontSize: 11 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl p-5 flex flex-col gap-4"
      style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-text-primary" style={{ fontSize: 16 }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// -- Styled select -------------------------------------------------------------
function FilterSelect({ value, onChange, disabled, children }) {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none rounded-lg pl-3 pr-8 py-2 font-medium outline-none transition-colors"
        style={{
          fontSize: 13,
          border: "1.5px solid #E5E7EB",
          background: disabled ? "#F9FAFB" : "#fff",
          color: disabled ? "#9CA3AF" : "#1A1A1A",
          cursor: disabled ? "not-allowed" : "pointer",
          minWidth: 180,
        }}
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 pointer-events-none"
        style={{ color: disabled ? "#D1D5DB" : "#6B7280" }} />
    </div>
  );
}

// -- Main Component ------------------------------------------------------------
export default function Reports() {
  const [period, setPeriod] = useState("monthly");
  const [selectedCluster, setSelectedCluster] = useState("all");
  const [selectedBarangay, setSelectedBarangay] = useState("all");

  // When cluster changes, reset barangay
  function handleClusterChange(val) {
    setSelectedCluster(val);
    setSelectedBarangay("all");
  }

  // Barangay options for the active cluster
  const barangayOptions = selectedCluster !== "all"
    ? (CLUSTER_BARANGAY_MAP[selectedCluster] ?? [])
    : [];

  // -- Derive scope label for subtitle ----------------------------------------
  const scopeLabel = useMemo(() => {
    if (selectedBarangay !== "all") {
      const br = barangayOptions.find((b) => b.id === selectedBarangay);
      return br ? br.name : "Barangay";
    }
    if (selectedCluster !== "all") {
      const cl = CLUSTERS.find((c) => c.id === selectedCluster);
      return cl ? cl.label : "Cluster";
    }
    return "City-wide — Batangas City";
  }, [selectedCluster, selectedBarangay, barangayOptions]);

  // -- Resolve scoped data -----------------------------------------------------
  const kpi = useMemo(() => {
    if (selectedBarangay !== "all") return REPORT_KPI_BY_BARANGAY[selectedBarangay] ?? REPORT_KPI;
    if (selectedCluster !== "all") return REPORT_KPI_BY_CLUSTER[selectedCluster] ?? REPORT_KPI;
    return REPORT_KPI;
  }, [selectedCluster, selectedBarangay]);

  const monthlyData = useMemo(() => {
    if (selectedBarangay !== "all") return MONTHLY_COLLECTIONS_BY_BARANGAY[selectedBarangay] ?? MONTHLY_COLLECTIONS;
    if (selectedCluster !== "all") return MONTHLY_COLLECTIONS_BY_CLUSTER[selectedCluster] ?? MONTHLY_COLLECTIONS;
    return MONTHLY_COLLECTIONS;
  }, [selectedCluster, selectedBarangay]);

  const wasteData = useMemo(() => {
    if (selectedBarangay !== "all") return WASTE_BY_TYPE_BY_BARANGAY[selectedBarangay] ?? WASTE_BY_TYPE;
    if (selectedCluster !== "all") return WASTE_BY_TYPE_BY_CLUSTER[selectedCluster] ?? WASTE_BY_TYPE;
    return WASTE_BY_TYPE;
  }, [selectedCluster, selectedBarangay]);

  const missedData = useMemo(() => {
    if (selectedBarangay !== "all") return MISSED_REASONS_BY_BARANGAY[selectedBarangay] ?? MISSED_REASONS;
    if (selectedCluster !== "all") return MISSED_REASONS_BY_CLUSTER[selectedCluster] ?? MISSED_REASONS;
    return MISSED_REASONS;
  }, [selectedCluster, selectedBarangay]);

  const collectionData = period === "monthly" ? monthlyData : WEEKLY_COLLECTIONS;
  const collectionLabelKey = period === "monthly" ? "month" : "week";

  const totalWaste = wasteData.reduce((s, w) => s + w.kg, 0);
  const totalMissed = missedData.reduce((s, r) => s + r.count, 0);

  function formatExportDate(ts) {
    return new Date(ts).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>
            Reports &amp; Analytics
          </h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            {scopeLabel} · May 2025
          </p>
        </div>

        {/* Filter + Export row */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Cluster dropdown */}
          <FilterSelect value={selectedCluster} onChange={handleClusterChange}>
            <option value="all">?? City-wide (All)</option>
            {CLUSTERS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </FilterSelect>

          {/* Barangay dropdown */}
          <FilterSelect
            value={selectedBarangay}
            onChange={setSelectedBarangay}
            disabled={selectedCluster === "all"}
          >
            <option value="all">All Barangays</option>
            {barangayOptions.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </FilterSelect>

          {/* Active scope badge */}
          {(selectedCluster !== "all" || selectedBarangay !== "all") && (
            <button
              onClick={() => { setSelectedCluster("all"); setSelectedBarangay("all"); }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium transition-colors hover:bg-red-50"
              style={{ fontSize: 12, border: "1.5px solid #FECACA", color: "#DC2626", background: "#FFF5F5" }}
            >
              ? Clear filter
            </button>
          )}

          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 13, background: "#2E7D32" }}
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>

      {/* Scope indicator strip */}
      {selectedCluster !== "all" && (
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-2.5"
          style={{ background: "#E8F5E9", border: "1px solid #C8E6C9" }}
        >
          <span className="rounded-full font-semibold text-white px-2 py-0.5"
            style={{ fontSize: 11, background: "#2E7D32" }}>
            Filtered
          </span>
          <span className="text-text-secondary font-medium" style={{ fontSize: 13 }}>
            Showing data for: <strong style={{ color: "#1B5E20" }}>{scopeLabel}</strong>
          </span>
          {selectedBarangay === "all" && (
            <span className="text-text-muted" style={{ fontSize: 12 }}>
              — select a barangay below to drill down further
            </span>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard icon={<CheckCircle size={18} color="#2E7D32" />} label="Total Collections"
          value={fmt(kpi.totalCollections)} growth={kpi.collectionGrowth} sub="vs. previous period" />
        <KpiCard icon={<BarChart2 size={18} color="#1976D2" />} label="Avg Collection Rate"
          value={`${kpi.avgCollectionRate}%`} growth={kpi.collectionRateChange} sub="of scheduled bins collected" />
        <KpiCard icon={<AlertTriangle size={18} color="#DC2626" />} label="Missed Collections"
          value={kpi.missedCollections} growth={kpi.missedChange} sub="lower is better" />
        <KpiCard icon={<Users size={18} color="#D97706" />} label="Active Residents"
          value={fmt(kpi.activeResidents)} growth={kpi.residentGrowth} sub="reporting this period" />
        <KpiCard icon={<Leaf size={18} color="#2E7D32" />} label="Eco Tokens Issued"
          value={fmt(kpi.ecoTokensIssued)} growth={kpi.tokenGrowth} sub="total this scope" />
        <KpiCard icon={<Trash2 size={18} color="#6B7280" />} label="Total Waste Collected"
          value={`${(kpi.totalWasteKg / 1000).toFixed(1)}t`} growth={kpi.wasteGrowth} sub="metric tons this period" />
      </div>

      {/* Collections chart + Cluster rates */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>

        <Section
          title="Collections Overview"
          action={
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1.5px solid #E5E7EB" }}>
              {["monthly", "weekly"].map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 capitalize font-medium transition-colors"
                  style={{ fontSize: 12, background: period === p ? "#2E7D32" : "#fff", color: period === p ? "#fff" : "#6B7280" }}>
                  {p}
                </button>
              ))}
            </div>
          }
        >
          <div className="flex items-center gap-4 mb-1">
            {[["#2E7D32", "Collected"], ["#9CA3AF", "Target"], ["#DC2626", "Missed"]].map(([color, label]) => (
              <span key={label} className="flex items-center gap-1.5 text-text-muted" style={{ fontSize: 12 }}>
                <span className="inline-block rounded-sm" style={{ width: 10, height: 10, background: color, opacity: label === "Target" ? 0.4 : 1 }} />
                {label}
              </span>
            ))}
          </div>
          <BarChart data={collectionData} valueKey="collected" targetKey="target" labelKey={collectionLabelKey} height={160} />
          <div className="flex gap-2 mt-1">
            {collectionData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <span className="rounded-full font-semibold text-white flex items-center justify-center"
                  style={{ width: 20, height: 20, fontSize: 9, background: "#DC2626" }}>
                  {d.missed}
                </span>
                <span className="text-text-muted" style={{ fontSize: 9 }}>missed</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Cluster rates — only show at city-wide scope */}
        {selectedCluster === "all" ? (
          <Section title="Collection Rate by Cluster">
            <div className="flex flex-col gap-3">
              {CLUSTER_COLLECTION_RATES.map((c) => (
                <HBar key={c.cluster} label={c.label.replace(" (North Zone)", "")} value={c.rate} max={100}
                  color={c.rate >= 80 ? "#2E7D32" : c.rate >= 70 ? "#D97706" : "#DC2626"} />
              ))}
            </div>
            <div className="rounded-lg px-3 py-2 mt-1" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
              <p className="text-text-muted" style={{ fontSize: 11 }}>
                City average: <strong style={{ color: "#2E7D32" }}>{REPORT_KPI.avgCollectionRate}%</strong>
                &nbsp;·&nbsp;Target: <strong>85%</strong>
              </p>
            </div>
          </Section>
        ) : (
          /* Scoped: show a single rate card */
          <Section title={selectedBarangay !== "all" ? "Barangay Collection Rate" : "Cluster Collection Rate"}>
            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-4">
              <div className="relative flex items-center justify-center"
                style={{ width: 120, height: 120 }}>
                <svg viewBox="0 0 36 36" style={{ width: 120, height: 120, transform: "rotate(-90deg)" }}>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F3F4F6" strokeWidth="3.2" />
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={kpi.avgCollectionRate >= 80 ? "#2E7D32" : kpi.avgCollectionRate >= 70 ? "#D97706" : "#DC2626"}
                    strokeWidth="3.2"
                    strokeDasharray={`${kpi.avgCollectionRate} ${100 - kpi.avgCollectionRate}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-bold text-text-primary" style={{ fontSize: 22 }}>{kpi.avgCollectionRate}%</span>
                  <span className="text-text-muted" style={{ fontSize: 10 }}>rate</span>
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-text-primary" style={{ fontSize: 14 }}>{scopeLabel}</p>
                <p className="text-text-muted mt-0.5" style={{ fontSize: 12 }}>
                  {kpi.totalCollections} collected · {kpi.missedCollections} missed
                </p>
              </div>
              <GrowthBadge value={kpi.collectionRateChange} />
            </div>
            <div className="rounded-lg px-3 py-2" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
              <p className="text-text-muted" style={{ fontSize: 11 }}>
                City average: <strong style={{ color: "#2E7D32" }}>{REPORT_KPI.avgCollectionRate}%</strong>
                &nbsp;·&nbsp;Target: <strong>85%</strong>
              </p>
            </div>
          </Section>
        )}
      </div>

      {/* Full bin trend + Waste by type */}
      <div className="grid grid-cols-2 gap-4">
        <Section title="Full Bin Reports — Last 14 Days">
          <div className="flex items-end justify-between mb-1">
            <div>
              <span className="font-bold text-text-primary" style={{ fontSize: 24 }}>
                {FULL_BIN_TREND[FULL_BIN_TREND.length - 1].fullBins}
              </span>
              <span className="text-text-muted ml-1" style={{ fontSize: 13 }}>bins today</span>
            </div>
            <GrowthBadge value={-6} />
          </div>
          <Sparkline data={FULL_BIN_TREND} valueKey="fullBins" color="#DC2626" height={80} />
          <div className="flex items-center justify-between mt-1">
            {FULL_BIN_TREND.filter((_, i) => i % 2 === 0).map((d) => (
              <span key={d.date} className="text-text-muted" style={{ fontSize: 10 }}>{d.date}</span>
            ))}
          </div>
        </Section>

        <Section title="Waste Volume by Type (kg)">
          <div className="flex flex-col gap-3">
            {wasteData.map((w) => (
              <div key={w.type} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-medium" style={{ fontSize: 13 }}>{w.type}</span>
                  <span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>
                    {w.kg.toLocaleString()} kg
                    <span className="text-text-muted font-normal ml-1" style={{ fontSize: 11 }}>
                      ({Math.round((w.kg / totalWaste) * 100)}%)
                    </span>
                  </span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 8, background: "#F3F4F6" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(w.kg / totalWaste) * 100}%`, background: w.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg px-3 py-2 mt-1" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
            <p className="text-text-muted" style={{ fontSize: 11 }}>
              Total: <strong style={{ color: "#1A1A1A" }}>{totalWaste.toLocaleString()} kg</strong>
              &nbsp;·&nbsp;{(totalWaste / 1000).toFixed(1)} metric tons
            </p>
          </div>
        </Section>
      </div>

      {/* Eco tokens + Resident engagement — city-wide only */}
      {selectedCluster === "all" && (
        <div className="grid grid-cols-2 gap-4">
          <Section title="Eco Token Issuance — Monthly">
            <BarChart data={ECO_TOKEN_MONTHLY} valueKey="tokens" labelKey="month" height={140} />
            <div className="flex items-center justify-between mt-1">
              <span className="text-text-muted" style={{ fontSize: 12 }}>
                Total issued: <strong style={{ color: "#2E7D32" }}>{fmt(REPORT_KPI.ecoTokensIssued)}</strong>
              </span>
              <GrowthBadge value={REPORT_KPI.tokenGrowth} />
            </div>
          </Section>
          <Section title="Resident Engagement — Monthly">
            <BarChart data={RESIDENT_ENGAGEMENT} valueKey="activeReporters" labelKey="month" height={140} />
            <div className="flex items-center justify-between mt-1">
              <span className="text-text-muted" style={{ fontSize: 12 }}>
                Active reporters: <strong style={{ color: "#2E7D32" }}>{fmt(REPORT_KPI.activeResidents)}</strong>
              </span>
              <GrowthBadge value={REPORT_KPI.residentGrowth} />
            </div>
          </Section>
        </div>
      )}

      {/* Cluster performance table + Missed reasons */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 300px" }}>

        {/* Cluster scorecard — city-wide only; scoped shows a summary card */}
        {selectedCluster === "all" ? (
          <Section title="Cluster Performance Scorecard">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #F3F4F6" }}>
                    {["Cluster", "Collection Rate", "Resident Engagement", "Avg Response", "Score"].map((h) => (
                      <th key={h} className="text-left pb-2 font-semibold text-text-muted"
                        style={{ fontSize: 12, paddingRight: 16 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CLUSTER_PERFORMANCE.map((c, i) => (
                    <tr key={c.cluster}
                      style={{ borderBottom: i < CLUSTER_PERFORMANCE.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                      <td className="py-2.5 font-medium text-text-primary" style={{ fontSize: 13, paddingRight: 16 }}>{c.label}</td>
                      <td className="py-2.5" style={{ fontSize: 13, paddingRight: 16 }}>
                        <span style={{ color: c.collectionRate >= 80 ? "#2E7D32" : c.collectionRate >= 70 ? "#D97706" : "#DC2626", fontWeight: 600 }}>
                          {c.collectionRate}%
                        </span>
                      </td>
                      <td className="py-2.5 text-text-secondary" style={{ fontSize: 13, paddingRight: 16 }}>{c.residentEngagement}%</td>
                      <td className="py-2.5 text-text-secondary" style={{ fontSize: 13, paddingRight: 16 }}>{c.avgResponseMin} min</td>
                      <td className="py-2.5" style={{ fontSize: 13 }}>
                        <span className="rounded-full px-2.5 py-0.5 font-semibold"
                          style={{ background: c.score >= 85 ? "#E8F5E9" : c.score >= 75 ? "#FFF3E0" : "#FFEBEE", color: c.score >= 85 ? "#2E7D32" : c.score >= 75 ? "#D97706" : "#DC2626" }}>
                          {c.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        ) : (
          <Section title="Scoped Performance Summary">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Collection Rate",    value: `${kpi.avgCollectionRate}%`,              color: kpi.avgCollectionRate >= 80 ? "#2E7D32" : kpi.avgCollectionRate >= 70 ? "#D97706" : "#DC2626" },
                { label: "Resident Engagement",value: `${kpi.activeResidents.toLocaleString()}`, color: "#D97706" },
                { label: "Eco Tokens Issued",  value: fmt(kpi.ecoTokensIssued),                 color: "#2E7D32" },
                { label: "Waste Collected",    value: `${(kpi.totalWasteKg / 1000).toFixed(1)}t`, color: "#6B7280" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg p-3 flex flex-col gap-1"
                  style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                  <span className="text-text-muted" style={{ fontSize: 11 }}>{item.label}</span>
                  <span className="font-bold" style={{ fontSize: 20, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Missed reasons — always scoped */}
        <Section title="Missed — Top Reasons">
          <div className="flex flex-col gap-3">
            {missedData.filter((r) => r.count > 0).map((r) => (
              <div key={r.reason} className="flex items-center gap-3">
                <div className="flex-shrink-0 rounded-full" style={{ width: 10, height: 10, background: r.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-text-secondary font-medium truncate" style={{ fontSize: 12 }}>{r.reason}</span>
                    <span className="font-semibold text-text-primary ml-2" style={{ fontSize: 12 }}>{r.count}</span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: 5, background: "#F3F4F6" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${totalMissed > 0 ? (r.count / totalMissed) * 100 : 0}%`, background: r.color }} />
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

      {/* Recent exports */}
      <Section title="Recent Report Exports">
        <div className="overflow-hidden rounded-lg" style={{ border: "1px solid #F3F4F6" }}>
          {REPORT_EXPORTS.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              style={{ borderBottom: i < REPORT_EXPORTS.length - 1 ? "1px solid #F3F4F6" : "none" }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 32, height: 32, background: "#F3F4F6" }}>
                  <BarChart2 size={15} color="#6B7280" />
                </div>
                <div>
                  <div className="font-medium text-text-primary" style={{ fontSize: 13 }}>{r.name}</div>
                  <div className="text-text-muted" style={{ fontSize: 11 }}>{formatExportDate(r.generatedAt)} · {r.generatedBy}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full px-2.5 py-0.5 font-semibold"
                  style={{ fontSize: 11, background: r.format === "PDF" ? "#FFEBEE" : r.format === "CSV" ? "#E8F5E9" : "#E3F2FD", color: r.format === "PDF" ? "#DC2626" : r.format === "CSV" ? "#2E7D32" : "#1976D2" }}>
                  {r.format}
                </span>
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium hover:bg-gray-100 transition-colors"
                  style={{ fontSize: 12, color: "#6B7280", border: "1px solid #E5E7EB" }}>
                  <Download size={12} />Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
}


