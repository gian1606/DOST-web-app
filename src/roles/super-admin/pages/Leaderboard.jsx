import { colors } from "../../../theme/colors.js";
import { useState, useEffect } from "react";
import { Trophy, MapPin, Calendar, TrendingUp, BarChart2, Award, Search } from "lucide-react";
import { fetchLeaderboard, fetchClusters } from "../../../services/superAdmin.js";

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

// Generate month options from January 2026 to current month
function buildMonthOptions() {
  const startYear = 2026;
  const startMonth = 1; // January
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 0-indexed, so add 1
  
  const opts = [];
  
  // Loop from start date to current date
  for (let year = startYear; year <= currentYear; year++) {
    const startM = (year === startYear) ? startMonth : 1;
    const endM = (year === currentYear) ? currentMonth : 12;
    
    for (let month = startM; month <= endM; month++) {
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
      const label = `${monthName} ${year}`;
      opts.push({ key, label });
    }
  }
  
  // Return in descending order (newest first)
  return opts.reverse();
}
const MONTH_OPTIONS = buildMonthOptions();

// ── Podium bar heights (% of max bar height) ──────────────────────────────────
const BAR_PCT  = { 1: 100, 2: 75, 3: 55 };
const BAR_ANIM_DELAY = { 1: 60, 2: 160, 3: 260 }; // stagger ms
const MAX_BAR_H = 220; // px — full height for #1

const BAR_COLORS = {
  1: { fill: "linear-gradient(180deg,#FBBF24 0%,#D97706 100%)", text: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
  2: { fill: "linear-gradient(180deg,#9CA3AF 0%,#6B7280 100%)", text: "#374151", bg: "#F9FAFB", border: "#E5E7EB" },
  3: { fill: "linear-gradient(180deg,#CD9E6B 0%,#92400E 100%)", text: "#78350F", bg: "#FFF7ED", border: "#FED7AA" },
};

// ── Single animated bar ───────────────────────────────────────────────────────
function PodiumBar({ rank, entry, maxPoints, animate, onHover, hovered }) {
  const cfg      = BAR_COLORS[rank];
  const pct      = BAR_PCT[rank];
  const targetH  = Math.round((pct / 100) * MAX_BAR_H);
  const [h, setH] = useState(0);
  const [tip, setTip] = useState(false);

  useEffect(() => {
    if (!animate) { setH(0); return; }
    const t = setTimeout(() => setH(targetH), BAR_ANIM_DELAY[rank]);
    return () => clearTimeout(t);
  }, [animate, targetH, rank]);

  const isHov = hovered === rank;

  return (
    <div className="flex flex-col items-center gap-0" style={{ flex: rank === 1 ? "1.2" : "1", position: "relative" }}>
      {/* Tooltip on hover */}
      {isHov && entry && (
        <div className="absolute z-10 rounded-xl px-4 py-3 shadow-lg"
          style={{
            bottom: h + 70,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1C2B1E",
            color: "#fff",
            minWidth: 160,
            pointerEvents: "none",
          }}>
          <div className="font-bold" style={{ fontSize: 13 }}>{entry.name}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
            <div>{(entry.pointsEarned ?? 0).toLocaleString()} Eco Points</div>
            <div>{entry.reportsSubmitted ?? 0} Reports</div>
            <div>{entry.collectionRate ?? 0}% Collection Rate</div>
          </div>
          {/* Arrow */}
          <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0, borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent", borderTop: "6px solid #1C2B1E" }} />
        </div>
      )}

      {/* Name above bar */}
      <div className="text-center px-1 mb-2" style={{ minHeight: 48 }}>
        <div className="font-bold text-text-primary" style={{ fontSize: rank === 1 ? 15 : 13, lineHeight: 1.3 }}>
          {entry?.name ?? "—"}
        </div>
        <div className="font-black mt-0.5" style={{ fontSize: rank === 1 ? 20 : 16, color: cfg.text }}>
          {(entry?.pointsEarned ?? 0).toLocaleString()}
          <span className="font-medium ml-1" style={{ fontSize: 10, color: colors.textMuted }}>pts</span>
        </div>
      </div>

      {/* The bar */}
      <div
        className="w-full rounded-t-xl flex items-end justify-center pb-4 cursor-pointer select-none"
        style={{
          height: h,
          background: cfg.fill,
          transition: "height 0.8s cubic-bezier(0.34,1.3,0.64,1)",
          minWidth: 70,
          boxShadow: isHov ? "0 -4px 20px rgba(0,0,0,0.22)" : "0 -2px 8px rgba(0,0,0,0.10)",
          transform: isHov ? "scaleX(1.04)" : "scaleX(1)",
          transformOrigin: "bottom",
        }}
        onMouseEnter={() => onHover(rank)}
        onMouseLeave={() => onHover(null)}
      >
        <span className="font-black text-white/80 select-none" style={{ fontSize: rank === 1 ? 52 : 40 }}>
          {rank}
        </span>
      </div>
    </div>
  );
}

// ── Badge pill ────────────────────────────────────────────────────────────────
const BADGE_S = {
  gold:   { bg: "#FEF3C7", color: "#B45309", label: "Gold"   },
  silver: { bg: "#F3F4F6", color: "#4B5563", label: "Silver" },
  bronze: { bg: "#FEF0E6", color: "#92400E", label: "Bronze" },
};

function BadgePill({ badge }) {
  if (!badge) return <span className="text-text-muted" style={{ fontSize: 12 }}>—</span>;
  const s = BADGE_S[badge];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold"
      style={{ fontSize: 11, background: s.bg, color: s.color }}>
      <Award size={10} />{s.label}
    </span>
  );
}

// ── Rank chip for table ───────────────────────────────────────────────────────
function RankChip({ rank }) {
  const s = rank === 1 ? { bg: "#FEF3C7", color: "#B45309" }
          : rank === 2 ? { bg: "#F3F4F6", color: "#4B5563" }
          : rank === 3 ? { bg: "#FEF0E6", color: "#92400E" }
          : null;
  return (
    <div className="flex items-center justify-center rounded-full font-bold"
      style={{ width: 32, height: 32, fontSize: 13,
        background: s?.bg ?? "transparent",
        color: s?.color ?? colors.textMuted }}>
      {rank}
    </div>
  );
}

function RateBar({ value }) {
  const color = value >= 90 ? colors.primary : value >= 70 ? colors.warning : colors.error;
  return (
    <div className="flex items-center gap-2" style={{ minWidth: 130 }}>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: colors.gray100 }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
      <span className="font-semibold flex-shrink-0" style={{ fontSize: 12, color, minWidth: 34 }}>{value}%</span>
    </div>
  );
}

// =============================================================================
export default function Leaderboard() {
  const [month, setMonth]         = useState(CURRENT_MONTH);
  const [allData, setAllData]     = useState([]);
  const [clusters, setClusters]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [podiumIn, setPodiumIn]   = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [clusterFilter, setClusterFilter] = useState("all"); // "all" | cluster label
  const [search, setSearch]       = useState("");

  useEffect(() => {
    setLoading(true);
    setPodiumIn(false);
    Promise.all([fetchLeaderboard(month), fetchClusters()])
      .then(([lb, cl]) => { setAllData(lb); setClusters(cl); })
      .catch(() => {})
      .finally(() => { setLoading(false); setTimeout(() => setPodiumIn(true), 80); });
  }, [month]);

  // Re-animate podium on filter change
  useEffect(() => {
    setPodiumIn(false);
    setHoveredBar(null);
    const t = setTimeout(() => setPodiumIn(true), 100);
    return () => clearTimeout(t);
  }, [clusterFilter]);

  // barangay → cluster label map
  const brgyClusterMap = {};
  clusters.forEach((c) => (c.barangays ?? []).forEach((b) => { brgyClusterMap[b.name] = c.label; }));

  // Apply scope filter → re-rank within scope
  const scopeData = allData
    .filter((r) => {
      const matchCluster = clusterFilter === "all" || brgyClusterMap[r.name] === clusterFilter;
      const matchSearch  = !search.trim() || r.name.toLowerCase().includes(search.toLowerCase());
      return matchCluster && matchSearch;
    })
    .map((r, i) => ({ ...r, scopeRank: i + 1 }));

  const top3 = scopeData.slice(0, 3);
  const maxPts = top3[0]?.pointsEarned ?? 1;

  const selectedLabel = MONTH_OPTIONS.find((o) => o.key === month)?.label ?? month;
  const scopeLabel    = clusterFilter === "all" ? "City-wide" : clusterFilter;
  const totalPoints   = scopeData.reduce((s, r) => s + (r.pointsEarned ?? 0), 0);
  const avgRate       = scopeData.length
    ? Math.round(scopeData.reduce((s, r) => s + (r.collectionRate ?? 0), 0) / scopeData.length)
    : 0;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Barangay Leaderboard</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            Rankings based on waste reporting activity — <strong>{scopeLabel}</strong>, {selectedLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 rounded-lg px-3 py-2"
            style={{ background: colors.accentSoft, border: "1px solid " + colors.accentBorderLight }}>
            <MapPin size={13} color={colors.primary} />
            <span className="font-semibold" style={{ fontSize: 12, color: colors.primary }}>Batangas City</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg px-3 py-2"
            style={{ background: colors.gray100, border: "1px solid " + colors.gray200 }}>
            <Trophy size={13} color={colors.gray500} />
            <span className="font-semibold" style={{ fontSize: 12, color: colors.gray600 }}>
              {scopeData.length} Barangay{scopeData.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filters + Summary ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap"
        style={{ border: "1px solid " + colors.gray200 }}>

        {/* Period */}
        <div className="flex items-center gap-2">
          <Calendar size={14} color={colors.gray500} />
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg px-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.gray50, color: colors.textHeading, minWidth: 190 }}>
            {MONTH_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}{opt.key === CURRENT_MONTH ? " (Current)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Scope filter — City-wide or per cluster */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* City-wide pill */}
          <button
            onClick={() => { setClusterFilter("all"); setSearch(""); }}
            className="rounded-full px-4 py-1.5 font-semibold transition-colors"
            style={{
              fontSize: 13,
              background: clusterFilter === "all" ? colors.primary : "#fff",
              color:      clusterFilter === "all" ? "#fff" : colors.gray600,
              border:     clusterFilter === "all" ? `1px solid ${colors.primary}` : "1px solid " + colors.gray200,
            }}>
            City-wide
          </button>
          {/* Cluster pills */}
          {clusters.map((c) => (
            <button key={c.id}
              onClick={() => { setClusterFilter(c.label); setSearch(""); }}
              className="rounded-full px-4 py-1.5 font-semibold transition-colors"
              style={{
                fontSize: 13,
                background: clusterFilter === c.label ? colors.primary : "#fff",
                color:      clusterFilter === c.label ? "#fff" : colors.gray600,
                border:     clusterFilter === c.label ? `1px solid ${colors.primary}` : "1px solid " + colors.gray200,
              }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Barangay search */}
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-3 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search barangay…"
            className="rounded-lg pl-8 pr-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.gray50, minWidth: 170 }} />
        </div>

        {search && (
          <button onClick={() => setSearch("")}
            className="rounded-lg px-3 py-2 font-medium hover:bg-red-50 transition-colors"
            style={{ fontSize: 12, border: "1.5px solid #FECACA", color: colors.error, background: colors.errorSoft }}>
            ✕ Clear
          </button>
        )}

        {/* Summary stats */}
        <div className="ml-auto flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} color={colors.primary} />
            <div>
              <div className="font-bold text-text-primary" style={{ fontSize: 15 }}>{totalPoints.toLocaleString()}</div>
              <div className="text-text-muted" style={{ fontSize: 10 }}>Total Eco Points</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart2 size={14} color={colors.recyclable} />
            <div>
              <div className="font-bold text-text-primary" style={{ fontSize: 15 }}>{avgRate}%</div>
              <div className="text-text-muted" style={{ fontSize: 10 }}>Avg Collection Rate</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full border-4 border-t-transparent"
            style={{ width: 32, height: 32, borderColor: colors.primary, borderTopColor: "transparent" }} />
        </div>
      ) : scopeData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Trophy size={40} color={colors.textMuted} />
          <p className="text-text-muted font-medium" style={{ fontSize: 15 }}>No ranking data for this scope.</p>
          <p className="text-text-muted" style={{ fontSize: 12 }}>Rankings appear once residents start reporting bins.</p>
        </div>
      ) : (
        <>
          {/* ── Animated Podium Bar Chart ─────────────────────────────────── */}
          {top3.length >= 3 && (
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

              {/* Section label */}
              <div className="px-6 pt-5 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={16} color={colors.warning} />
                  <span className="font-bold text-text-primary" style={{ fontSize: 16 }}>
                    Top 3 — {scopeLabel}
                  </span>
                </div>
                <span className="text-text-muted" style={{ fontSize: 12 }}>Hover bar for details</span>
              </div>

              {/* Bar chart area */}
              <div className="px-6 pb-0">
                {/* Order: 2nd | 1st | 3rd */}
                <div className="flex items-end gap-4" style={{ height: MAX_BAR_H + 80 }}>
                  <PodiumBar rank={2} entry={top3[1]} maxPoints={maxPts} animate={podiumIn}
                    onHover={setHoveredBar} hovered={hoveredBar} />
                  <PodiumBar rank={1} entry={top3[0]} maxPoints={maxPts} animate={podiumIn}
                    onHover={setHoveredBar} hovered={hoveredBar} />
                  <PodiumBar rank={3} entry={top3[2]} maxPoints={maxPts} animate={podiumIn}
                    onHover={setHoveredBar} hovered={hoveredBar} />
                </div>
              </div>

              {/* Stage base */}
              <div style={{ height: 12, background: "#E5E7EB" }} />
            </div>
          )}

          {/* ── Full Rankings Table ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>

            <div className="px-6 py-4 border-b flex items-center justify-between"
              style={{ background: colors.gray50, borderColor: colors.gray200 }}>
              <span className="font-bold text-text-primary" style={{ fontSize: 15 }}>
                Full Rankings — {scopeLabel}
              </span>
              <span className="text-text-muted" style={{ fontSize: 13 }}>
                {scopeData.length} barangay{scopeData.length !== 1 ? "s" : ""} · {selectedLabel}
              </span>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid " + colors.gray200, background: colors.gray50 }}>
                  {["Rank", "Barangay", "Cluster", "Reports", "Eco Points", "Collection Rate", "Badge"].map((h) => (
                    <th key={h} className="text-left font-semibold uppercase tracking-wide px-6 py-3.5"
                      style={{ fontSize: 11, color: colors.gray500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scopeData.map((r, i) => {
                  const badge = r.badge ? BADGE_S[r.badge] : null;
                  return (
                    <tr key={r.barangayId ?? i}
                      className="transition-colors hover:bg-green-50/40"
                      style={{
                        borderBottom: "1px solid " + colors.gray100,
                        background: r.scopeRank === 1
                          ? "#FFFBF0"
                          : i % 2 === 0 ? colors.white : colors.tableRowAlt,
                      }}>
                      <td className="px-6 py-4"><RankChip rank={r.scopeRank} /></td>
                      <td className="px-6 py-4 font-semibold text-text-primary" style={{ fontSize: 14 }}>
                        {r.name}
                      </td>
                      <td className="px-6 py-4">
                        {brgyClusterMap[r.name] ? (
                          <span className="rounded-full px-3 py-0.5 font-medium"
                            style={{ fontSize: 12, background: colors.accentSoft, color: colors.primary }}>
                            {brgyClusterMap[r.name]}
                          </span>
                        ) : <span className="text-text-muted" style={{ fontSize: 12 }}>—</span>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-primary" style={{ fontSize: 14 }}>
                        {(r.reportsSubmitted ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold" style={{ fontSize: 15, color: colors.primary }}>
                          {(r.pointsEarned ?? 0).toLocaleString()}
                        </span>
                        <span className="text-text-muted ml-1" style={{ fontSize: 11 }}>pts</span>
                      </td>
                      <td className="px-6 py-4"><RateBar value={r.collectionRate ?? 0} /></td>
                      <td className="px-6 py-4"><BadgePill badge={r.badge} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
