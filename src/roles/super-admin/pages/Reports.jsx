import { colors } from "../../../theme/colors.js";
import { useState, useMemo } from "react";
import {
  Trash2, CheckCircle, Users, Leaf, TrendingUp, TrendingDown,
  Download, BarChart2, AlertTriangle, ChevronDown, Fuel, Wind,
} from "lucide-react";
import {
  BARANGAY_FILTER_OPTIONS,
  REPORT_KPI,
  REPORT_KPI_BY_BARANGAY,
  MONTHLY_COLLECTIONS,
  MONTHLY_COLLECTIONS_BY_BARANGAY,
  WEEKLY_COLLECTIONS,
  FULL_BIN_TREND,
  WASTE_BY_TYPE,
  WASTE_BY_TYPE_BY_BARANGAY,
  ECO_TOKEN_MONTHLY,
  MISSED_REASONS,
  MISSED_REASONS_BY_BARANGAY,
  RESIDENT_ENGAGEMENT,
  REPORT_EXPORTS,
} from "../../../mock/data";

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
              <div className="flex-1 rounded-t-sm opacity-30"
                style={{ height: `${(d[targetKey] / max) * 100}%`, background: colors.textMuted, minHeight: 2 }} />
            )}
            <div className="flex-1 rounded-t-sm"
              style={{ height: `${(d[valueKey] / max) * 100}%`, background: colors.primary, minHeight: 2 }} />
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
      <div className="rounded-full overflow-hidden" style={{ height: 8, background: colors.gray100 }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
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
      style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center rounded-lg" style={{ width: 36, height: 36, background: colors.gray100 }}>{icon}</div>
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
      style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-text-primary" style={{ fontSize: 16 }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

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
          border: "1.5px solid " + colors.gray200,
          background: disabled ? colors.gray50 : colors.white,
          color: disabled ? colors.textMuted : colors.textHeading,
          cursor: disabled ? "not-allowed" : "pointer",
          minWidth: 200,
        }}
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 pointer-events-none"
        style={{ color: disabled ? colors.gray300 : colors.gray500 }} />
    </div>
  );
}

// -- Fuel Savings Gauge --------------------------------------------------------
// Estimates litres saved by using optimized routes vs unoptimized.
// Formula: each optimized collection km saves ~0.12 L vs an unoptimized baseline.
function FuelSavingsGauge({ totalCollections, collectionRate }) {
  const BASELINE_LITRES_PER_COLLECTION = 0.85;  // unoptimized
  const OPTIMIZED_LITRES_PER_COLLECTION = 0.62; // with route optimization
  const savedLitres = Math.round(
    totalCollections * (BASELINE_LITRES_PER_COLLECTION - OPTIMIZED_LITRES_PER_COLLECTION)
  );
  const maxLitres   = Math.round(totalCollections * BASELINE_LITRES_PER_COLLECTION);
  const pct         = Math.min(Math.round((savedLitres / maxLitres) * 100), 100);
  const costPerLitre = 65; // PHP
  const savedPHP    = (savedLitres * costPerLitre).toLocaleString();

  // Arc gauge from -150° to 150° (300° sweep)
  const SWEEP = 300;
  const START_DEG = -150;
  const r = 52;
  const cx = 70; const cy = 70;
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
  const gaugeColor = pct >= 60 ? colors.primary : pct >= 35 ? colors.warning : colors.error;

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
        {/* Arc gauge */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <svg width={140} height={90} viewBox="0 0 140 90">
            {/* Track */}
            <path d={arcPath(START_DEG, START_DEG + SWEEP, r)} fill="none" stroke={colors.gray100} strokeWidth={10} strokeLinecap="round" />
            {/* Active */}
            {pct > 0 && (
              <path d={arcPath(START_DEG, activeDeg, r)} fill="none" stroke={gaugeColor} strokeWidth={10} strokeLinecap="round" />
            )}
            {/* Needle dot */}
            {(() => { const p = polarToXY(activeDeg, r); return <circle cx={p.x} cy={p.y} r={5} fill={gaugeColor} />; })()}
            {/* Centre label */}
            <text x={cx} y={cy - 4} textAnchor="middle" fill={colors.textHeading} fontWeight="800" fontSize={18}>{pct}%</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill={colors.textMuted} fontSize={9}>saved</text>
            {/* Scale ticks */}
            <text x={18} y={84} textAnchor="middle" fill={colors.textMuted} fontSize={8}>0</text>
            <text x={122} y={84} textAnchor="middle" fill={colors.textMuted} fontSize={8}>100%</text>
          </svg>

          {/* Color legend */}
          <div className="flex items-center gap-3 mt-1">
            {[[colors.error, "Low"], [colors.warning, "Mid"], [colors.primary, "High"]].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1" style={{ fontSize: 10, color: colors.textMuted }}>
                <span className="rounded-full inline-block" style={{ width: 7, height: 7, background: c }} />{l}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Litres Saved",    value: `${savedLitres.toLocaleString()} L`, color: colors.primary, bg: colors.accentSoft },
              { label: "Cost Saved",      value: `₱${savedPHP}`,                      color: colors.recyclable, bg: colors.infoSoft },
              { label: "Baseline Usage",  value: `${maxLitres.toLocaleString()} L`,   color: colors.gray500, bg: colors.gray100 },
              { label: "Optimized Usage", value: `${(maxLitres - savedLitres).toLocaleString()} L`, color: colors.warning, bg: colors.warningSoft },
            ].map((s) => (
              <div key={s.label} className="rounded-lg px-3 py-2 flex flex-col gap-0.5"
                style={{ background: s.bg }}>
                <span className="text-text-muted" style={{ fontSize: 10 }}>{s.label}</span>
                <span className="font-bold" style={{ fontSize: 15, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg px-3 py-2 flex items-center gap-2"
            style={{ background: colors.gray50, border: "1px solid #F3F4F6" }}>
            <Fuel size={12} color={colors.textMuted} />
            <p style={{ fontSize: 11, color: colors.gray500 }}>
              Based on {totalCollections.toLocaleString()} collections · ₱65/L · route optimization at {collectionRate}% efficiency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Carbon Reduction Counter --------------------------------------------------
// CO₂ reduction estimated from fuel savings. Diesel combustion ≈ 2.68 kg CO₂/L.
function CarbonReductionCounter({ totalCollections, collectionRate }) {
  const BASELINE_L   = 0.85;
  const OPTIMIZED_L  = 0.62;
  const CO2_PER_L    = 2.68; // kg CO₂ per litre diesel
  const savedLitres  = totalCollections * (BASELINE_L - OPTIMIZED_L);
  const co2Saved_kg  = Math.round(savedLitres * CO2_PER_L);
  const co2Saved_t   = (co2Saved_kg / 1000).toFixed(2);
  const treesEquiv   = Math.round(co2Saved_kg / 21); // 1 tree absorbs ~21 kg CO₂/yr
  const kmEquiv      = Math.round(co2Saved_kg / 0.21); // avg car 0.21 kg CO₂/km

  // Progress toward a monthly city target of 500 kg CO₂
  const TARGET_KG = 500;
  const pct = Math.min(Math.round((co2Saved_kg / TARGET_KG) * 100), 100);
  const barColor = pct >= 80 ? colors.primary : pct >= 50 ? colors.warning : colors.recyclable;

  return (
    <div className="bg-white rounded-xl p-5 flex flex-col gap-4"
      style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center rounded-lg"
          style={{ width: 32, height: 32, background: colors.accentSoft }}>
          <Wind size={16} color={colors.primary} />
        </div>
        <h2 className="font-semibold text-text-primary" style={{ fontSize: 16 }}>Carbon Reduction Counter</h2>
        <span className="ml-auto rounded-full px-2.5 py-0.5 font-semibold"
          style={{ fontSize: 11, background: colors.accentSoft, color: colors.primary }}>
          CO₂ vs. baseline
        </span>
      </div>

      {/* Hero number */}
      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <span className="font-black text-text-primary" style={{ fontSize: 48, lineHeight: 1, letterSpacing: -1 }}>
            {co2Saved_kg.toLocaleString()}
          </span>
          <span className="font-semibold" style={{ fontSize: 14, color: colors.primary }}>kg CO₂ reduced</span>
          <span className="text-text-muted mt-0.5" style={{ fontSize: 12 }}>≈ {co2Saved_t} metric tons</span>
        </div>
        <div className="flex-1 flex flex-col gap-1 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-text-muted" style={{ fontSize: 11 }}>Monthly target: {TARGET_KG} kg</span>
            <span className="font-bold" style={{ fontSize: 12, color: barColor }}>{pct}%</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 10, background: colors.gray100 }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: barColor }} />
          </div>
        </div>
      </div>

      {/* Equivalence cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { emoji: "🌳", value: treesEquiv, label: "Trees equivalent", sub: "CO₂ absorbed in 1 year" },
          { emoji: "🚗", value: `${kmEquiv.toLocaleString()} km`, label: "Car trips avoided", sub: "avg passenger car" },
          { emoji: "⛽", value: `${Math.round(savedLitres).toLocaleString()} L`, label: "Diesel saved", sub: "route optimization" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl p-3 flex flex-col items-center gap-1 text-center"
            style={{ background: colors.gray50, border: "1px solid #F3F4F6" }}>
            <span style={{ fontSize: 22 }}>{c.emoji}</span>
            <span className="font-bold text-text-primary" style={{ fontSize: 16 }}>{c.value}</span>
            <span className="font-medium text-text-secondary" style={{ fontSize: 11 }}>{c.label}</span>
            <span className="text-text-muted" style={{ fontSize: 10 }}>{c.sub}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg px-3 py-2 flex items-center gap-2"
        style={{ background: colors.accentSoft, border: "1px solid #BBF7D0" }}>
        <Wind size={12} color={colors.greenDark} />
        <p style={{ fontSize: 11, color: colors.successClassic }}>
          Diesel combustion factor: 2.68 kg CO₂/L · based on {totalCollections.toLocaleString()} collections this period
        </p>
      </div>
    </div>
  );
}

// -- Main Component ------------------------------------------------------------
export default function Reports() {
  const [period, setPeriod]                 = useState("monthly");
  const [selectedBarangay, setSelectedBarangay] = useState("all");

  const scopeLabel = useMemo(() => {
    if (selectedBarangay !== "all") {
      const br = BARANGAY_FILTER_OPTIONS.find((b) => b.id === selectedBarangay);
      return br ? br.name : "Barangay";
    }
    return "City-wide — Batangas City";
  }, [selectedBarangay]);

  const kpi = useMemo(() =>
    selectedBarangay !== "all" ? (REPORT_KPI_BY_BARANGAY[selectedBarangay] ?? REPORT_KPI) : REPORT_KPI,
    [selectedBarangay]
  );

  const monthlyData = useMemo(() =>
    selectedBarangay !== "all" ? (MONTHLY_COLLECTIONS_BY_BARANGAY[selectedBarangay] ?? MONTHLY_COLLECTIONS) : MONTHLY_COLLECTIONS,
    [selectedBarangay]
  );

  const wasteData = useMemo(() =>
    selectedBarangay !== "all" ? (WASTE_BY_TYPE_BY_BARANGAY[selectedBarangay] ?? WASTE_BY_TYPE) : WASTE_BY_TYPE,
    [selectedBarangay]
  );

  const missedData = useMemo(() =>
    selectedBarangay !== "all" ? (MISSED_REASONS_BY_BARANGAY[selectedBarangay] ?? MISSED_REASONS) : MISSED_REASONS,
    [selectedBarangay]
  );

  const collectionData   = period === "monthly" ? monthlyData : WEEKLY_COLLECTIONS;
  const collectionLabelKey = period === "monthly" ? "month" : "week";
  const totalWaste       = wasteData.reduce((s, w) => s + w.kg, 0);
  const totalMissed      = missedData.reduce((s, r) => s + r.count, 0);

  function formatExportDate(ts) {
    return new Date(ts).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Reports &amp; Analytics</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>{scopeLabel} — May 2025</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Barangay filter */}
          <FilterSelect value={selectedBarangay} onChange={setSelectedBarangay}>
            <option value="all">🌐 City-wide (All Barangays)</option>
            {BARANGAY_FILTER_OPTIONS.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </FilterSelect>

          {selectedBarangay !== "all" && (
            <button
              onClick={() => setSelectedBarangay("all")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium transition-colors hover:bg-red-50"
              style={{ fontSize: 12, border: "1.5px solid " + colors.inputErrorBorder, color: colors.error, background: colors.errorSoft }}
            >
              ✕ Clear filter
            </button>
          )}

          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 13, background: colors.primary }}
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>

      {/* Scope indicator strip */}
      {selectedBarangay !== "all" && (
        <div className="flex items-center gap-2 rounded-lg px-4 py-2.5"
          style={{ background: colors.accentSoft, border: "1px solid " + colors.accentBorder }}>
          <span className="rounded-full font-semibold text-white px-2 py-0.5"
            style={{ fontSize: 11, background: colors.primary }}>Filtered</span>
          <span className="text-text-secondary font-medium" style={{ fontSize: 13 }}>
            Showing data for: <strong style={{ color: colors.primaryDark }}>{scopeLabel}</strong>
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard icon={<CheckCircle size={18} color={colors.primary} />} label="Total Collections"
          value={fmt(kpi.totalCollections)} growth={kpi.collectionGrowth} sub="vs. previous period" />
        <KpiCard icon={<BarChart2 size={18} color={colors.recyclable} />} label="Avg Collection Rate"
          value={`${kpi.avgCollectionRate}%`} growth={kpi.collectionRateChange} sub="of scheduled bins collected" />
        <KpiCard icon={<AlertTriangle size={18} color={colors.error} />} label="Missed Collections"
          value={kpi.missedCollections} growth={kpi.missedChange} sub="lower is better" />
        <KpiCard icon={<Users size={18} color={colors.warning} />} label="Active Residents"
          value={fmt(kpi.activeResidents)} growth={kpi.residentGrowth} sub="reporting this period" />
        <KpiCard icon={<Leaf size={18} color={colors.primary} />} label="Eco Tokens Issued"
          value={fmt(kpi.ecoTokensIssued)} growth={kpi.tokenGrowth} sub="total this scope" />
        <KpiCard icon={<Trash2 size={18} color={colors.gray500} />} label="Total Waste Collected"
          value={`${(kpi.totalWasteKg / 1000).toFixed(1)}t`} growth={kpi.wasteGrowth} sub="metric tons this period" />
      </div>

      {/* Collections chart + Collection rate */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>
        <Section
          title="Collections Overview"
          action={
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1.5px solid " + colors.gray200 }}>
              {["monthly", "weekly"].map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 capitalize font-medium transition-colors"
                  style={{ fontSize: 12, background: period === p ? colors.primary : colors.white, color: period === p ? "#fff" : colors.gray500 }}>
                  {p}
                </button>
              ))}
            </div>
          }
        >
          <div className="flex items-center gap-4 mb-1">
            {[[colors.primary, "Collected"], [colors.textMuted, "Target"], [colors.error, "Missed"]].map(([color, label]) => (
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
                  style={{ width: 20, height: 20, fontSize: 9, background: colors.error }}>{d.missed}</span>
                <span className="text-text-muted" style={{ fontSize: 9 }}>missed</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Collection rate card */}
        <Section title={selectedBarangay !== "all" ? "Barangay Collection Rate" : "City Collection Rate"}>
          <div className="flex flex-col items-center justify-center flex-1 gap-3 py-4">
            <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
              <svg viewBox="0 0 36 36" style={{ width: 120, height: 120, transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={colors.gray100} strokeWidth="3.2" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={kpi.avgCollectionRate >= 80 ? colors.primary : kpi.avgCollectionRate >= 70 ? colors.warning : colors.error}
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
                {kpi.totalCollections} collected — {kpi.missedCollections} missed
              </p>
            </div>
            <GrowthBadge value={kpi.collectionRateChange} />
          </div>
          <div className="rounded-lg px-3 py-2" style={{ background: colors.gray50, border: "1px solid #F3F4F6" }}>
            <p className="text-text-muted" style={{ fontSize: 11 }}>
              Target: <strong>85%</strong>
            </p>
          </div>
        </Section>
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
          <Sparkline data={FULL_BIN_TREND} valueKey="fullBins" color={colors.error} height={80} />
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
                <div className="rounded-full overflow-hidden" style={{ height: 8, background: colors.gray100 }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(w.kg / totalWaste) * 100}%`, background: w.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg px-3 py-2 mt-1" style={{ background: colors.gray50, border: "1px solid #F3F4F6" }}>
            <p className="text-text-muted" style={{ fontSize: 11 }}>
              Total: <strong style={{ color: colors.textHeading }}>{totalWaste.toLocaleString()} kg</strong>
              &nbsp;—&nbsp;{(totalWaste / 1000).toFixed(1)} metric tons
            </p>
          </div>
        </Section>
      </div>

      {/* Eco tokens + Resident engagement — city-wide only */}
      {selectedBarangay === "all" && (
        <div className="grid grid-cols-2 gap-4">
          <Section title="Eco Token Issuance — Monthly">
            <BarChart data={ECO_TOKEN_MONTHLY} valueKey="tokens" labelKey="month" height={140} />
            <div className="flex items-center justify-between mt-1">
              <span className="text-text-muted" style={{ fontSize: 12 }}>
                Total issued: <strong style={{ color: colors.primary }}>{fmt(REPORT_KPI.ecoTokensIssued)}</strong>
              </span>
              <GrowthBadge value={REPORT_KPI.tokenGrowth} />
            </div>
          </Section>
          <Section title="Resident Engagement — Monthly">
            <BarChart data={RESIDENT_ENGAGEMENT} valueKey="activeReporters" labelKey="month" height={140} />
            <div className="flex items-center justify-between mt-1">
              <span className="text-text-muted" style={{ fontSize: 12 }}>
                Active reporters: <strong style={{ color: colors.primary }}>{fmt(REPORT_KPI.activeResidents)}</strong>
              </span>
              <GrowthBadge value={REPORT_KPI.residentGrowth} />
            </div>
          </Section>
        </div>
      )}

      {/* Fuel Savings Gauge + Carbon Reduction Counter */}
      <div className="grid grid-cols-2 gap-4">
        <FuelSavingsGauge
          totalCollections={kpi.totalCollections}
          collectionRate={kpi.avgCollectionRate}
        />
        <CarbonReductionCounter
          totalCollections={kpi.totalCollections}
          collectionRate={kpi.avgCollectionRate}
        />
      </div>

      {/* Performance summary + Missed reasons */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 300px" }}>
        <Section title="Performance Summary">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Collection Rate",     value: `${kpi.avgCollectionRate}%`,              color: kpi.avgCollectionRate >= 80 ? colors.primary : kpi.avgCollectionRate >= 70 ? colors.warning : colors.error },
              { label: "Resident Engagement", value: `${kpi.activeResidents.toLocaleString()}`, color: colors.warning },
              { label: "Eco Tokens Issued",   value: fmt(kpi.ecoTokensIssued),                 color: colors.primary },
              { label: "Waste Collected",     value: `${(kpi.totalWasteKg / 1000).toFixed(1)}t`, color: colors.gray500 },
            ].map((item) => (
              <div key={item.label} className="rounded-lg p-3 flex flex-col gap-1"
                style={{ background: colors.gray50, border: "1px solid #F3F4F6" }}>
                <span className="text-text-muted" style={{ fontSize: 11 }}>{item.label}</span>
                <span className="font-bold" style={{ fontSize: 20, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Section>

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
                  <div className="rounded-full overflow-hidden" style={{ height: 5, background: colors.gray100 }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${totalMissed > 0 ? (r.count / totalMissed) * 100 : 0}%`, background: r.color }} />
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

      {/* Recent exports */}
      <Section title="Recent Report Exports">
        <div className="overflow-hidden rounded-lg" style={{ border: "1px solid #F3F4F6" }}>
          {REPORT_EXPORTS.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              style={{ borderBottom: i < REPORT_EXPORTS.length - 1 ? "1px solid #F3F4F6" : "none" }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 32, height: 32, background: colors.gray100 }}>
                  <BarChart2 size={15} color={colors.gray500} />
                </div>
                <div>
                  <div className="font-medium text-text-primary" style={{ fontSize: 13 }}>{r.name}</div>
                  <div className="text-text-muted" style={{ fontSize: 11 }}>
                    {new Date(r.generatedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })} — {r.generatedBy}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full px-2.5 py-0.5 font-semibold"
                  style={{ fontSize: 11, background: r.format === "PDF" ? colors.errorSoft : r.format === "CSV" ? colors.accentSoft : colors.infoSoft, color: r.format === "PDF" ? colors.error : r.format === "CSV" ? colors.primary : colors.recyclable }}>
                  {r.format}
                </span>
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium hover:bg-gray-100 transition-colors"
                  style={{ fontSize: 12, color: colors.gray500, border: "1px solid " + colors.gray200 }}>
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
