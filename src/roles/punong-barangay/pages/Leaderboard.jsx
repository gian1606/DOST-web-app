import { colors } from "../../../theme/colors.js";
import { useState } from "react";
import { Trophy, Medal, Star, Calendar, Home } from "lucide-react";
import { LEADERBOARD_PERIODS } from "../../../mock/data";
import { PB_BARANGAY } from "../../../constants/index.js";

const BADGE_CONFIG = {
  gold:   { bg: colors.rankGoldBg, color: colors.warning, label: "Gold",   icon: "🥇" },
  silver: { bg: colors.gray100, color: colors.gray500, label: "Silver", icon: "🥈" },
  bronze: { bg: colors.rankBronzeBg, color: colors.rankBronzeText, label: "Bronze", icon: "🥉" },
};

// All available months in descending order (newest first)
const MONTH_OPTIONS = [
  { key: "2025-05", label: "May 2025" },
  { key: "2025-04", label: "April 2025" },
  { key: "2025-03", label: "March 2025" },
  { key: "2025-02", label: "February 2025" },
  { key: "2025-01", label: "January 2025" },
];

const CURRENT_MONTH = new Date().toISOString().slice(0, 7); // e.g. "2025-05"

export default function Leaderboard() {
  const [month, setMonth] = useState(CURRENT_MONTH);

  const data = LEADERBOARD_PERIODS[month] ?? [];
  const ranked = data.map((r, i) => ({ ...r, displayRank: i + 1 }));
  const topThree = ranked.slice(0, 3);
  const selectedLabel = MONTH_OPTIONS.find((o) => o.key === month)?.label ?? month;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>
            Household Leaderboard
          </h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            Top households in Barangay {PB_BARANGAY} by waste reporting activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: colors.accentSoft, border: "1px solid " + colors.accentBorderLight }}
          >
            <Home size={14} color={colors.primary} />
            <span className="font-semibold" style={{ fontSize: 13, color: colors.primary }}>
              Brgy. {PB_BARANGAY}
            </span>
          </div>
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: colors.rankGoldBg, border: "1px solid #FDE68A" }}
          >
            <Trophy size={14} color={colors.warning} />
            <span className="font-semibold" style={{ fontSize: 13, color: colors.warning }}>
              {ranked.length} Households
            </span>
          </div>
        </div>
      </div>

      {/* Month filter — dropdown */}
      <div
        className="bg-white rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ border: "1px solid " + colors.gray200 }}
      >
        <Calendar size={15} color={colors.gray500} />
        <label
          className="font-medium text-text-secondary"
          style={{ fontSize: 13 }}
          htmlFor="month-select"
        >
          Month:
        </label>
        <select
          id="month-select"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg px-3 py-2 outline-none"
          style={{
            fontSize: 13,
            border: "1.5px solid " + colors.gray200,
            background: colors.gray50,
            color: colors.textHeading,
            minWidth: 180,
          }}
        >
          {MONTH_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}{opt.key === CURRENT_MONTH ? " (Current)" : ""}
            </option>
          ))}
        </select>
        <span className="ml-auto text-text-muted" style={{ fontSize: 12 }}>
          {selectedLabel}
        </span>
      </div>

      {/* Podium — top 3 */}
      {topThree.length >= 1 && (
        <div
          className="bg-white rounded-xl p-6"
          style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-end gap-2">

            {/* 2nd place — silver */}
            <div
              className="flex-1 flex flex-col items-center justify-between rounded-t-xl px-3 py-5 overflow-hidden"
              style={{ height: 280, background: "linear-gradient(180deg, #BDC3C7 0%, #95A5A6 100%)" }}
            >
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="font-bold text-white text-center leading-tight" style={{ fontSize: 14 }}>{topThree[1]?.name ?? "—"}</div>
                <div className="text-white/80 text-center" style={{ fontSize: 11 }}>{topThree[1]?.street ?? ""}</div>
                <div className="font-black text-white" style={{ fontSize: 24 }}>{topThree[1]?.pointsEarned.toLocaleString() ?? "—"}</div>
                <div className="text-white/70" style={{ fontSize: 10 }}>Eco Points</div>
                <div className="rounded-full px-2.5 py-0.5 font-semibold" style={{ fontSize: 11, background: "rgba(255,255,255,0.25)", color: colors.white }}>
                  {topThree[1]?.reportsSubmitted} reports
                </div>
              </div>
              <div className="font-black text-white/90" style={{ fontSize: 52 }}>2</div>
            </div>

            {/* 1st place — gold */}
            <div
              className="flex-1 flex flex-col items-center justify-between rounded-t-xl px-3 py-5 overflow-hidden"
              style={{ height: 360, background: "linear-gradient(180deg, #F7DC6F 0%, #D4A017 100%)" }}
            >
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="font-bold text-white text-center leading-tight" style={{ fontSize: 15 }}>{topThree[0]?.name ?? "—"}</div>
                <div className="text-white/80 text-center" style={{ fontSize: 11 }}>{topThree[0]?.street ?? ""}</div>
                <div className="font-black text-white" style={{ fontSize: 28 }}>{topThree[0]?.pointsEarned.toLocaleString() ?? "—"}</div>
                <div className="text-white/70" style={{ fontSize: 10 }}>Eco Points</div>
                <div className="rounded-full px-2.5 py-0.5 font-semibold" style={{ fontSize: 11, background: "rgba(255,255,255,0.25)", color: colors.white }}>
                  {topThree[0]?.reportsSubmitted} reports
                </div>
              </div>
              <div className="font-black text-white/90" style={{ fontSize: 64 }}>1</div>
            </div>

            {/* 3rd place — bronze */}
            <div
              className="flex-1 flex flex-col items-center justify-between rounded-t-xl px-3 py-5 overflow-hidden"
              style={{ height: 230, background: "linear-gradient(180deg, #D4956A 0%, #A0522D 100%)" }}
            >
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="font-bold text-white text-center leading-tight" style={{ fontSize: 14 }}>{topThree[2]?.name ?? "—"}</div>
                <div className="text-white/80 text-center" style={{ fontSize: 11 }}>{topThree[2]?.street ?? ""}</div>
                <div className="font-black text-white" style={{ fontSize: 22 }}>{topThree[2]?.pointsEarned.toLocaleString() ?? "—"}</div>
                <div className="text-white/70" style={{ fontSize: 10 }}>Eco Points</div>
                <div className="rounded-full px-2.5 py-0.5 font-semibold" style={{ fontSize: 11, background: "rgba(255,255,255,0.25)", color: colors.white }}>
                  {topThree[2]?.reportsSubmitted} reports
                </div>
              </div>
              <div className="font-black text-white/90" style={{ fontSize: 44 }}>3</div>
            </div>

          </div>
          <div className="rounded-b-lg" style={{ height: 14, background: colors.gray500 }} />
        </div>
      )}

      {/* Full rankings table */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <div
          className="px-5 py-3 border-b flex items-center justify-between"
          style={{ borderColor: colors.gray200, background: colors.gray50 }}
        >
          <div className="flex items-center gap-2">
            <Medal size={15} color={colors.gray500} />
            <span
              className="font-semibold text-text-secondary uppercase tracking-wide"
              style={{ fontSize: 12 }}
            >
              Full Rankings — Brgy. {PB_BARANGAY}
            </span>
          </div>
          <span className="text-text-muted" style={{ fontSize: 12 }}>
            {selectedLabel}
          </span>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: colors.gray50, borderBottom: "1px solid " + colors.gray200 }}>
              {["Rank", "Household", "Street", "Reports", "Eco Points", "Badge"].map((h) => (
                <th
                  key={h}
                  className="text-left font-semibold uppercase tracking-wide px-5 py-3"
                  style={{ fontSize: 12, color: colors.gray500 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-text-muted py-10" style={{ fontSize: 14 }}>
                  No data for this period.
                </td>
              </tr>
            ) : (
              ranked.map((r, i) => {
                const badge = r.badge ? BADGE_CONFIG[r.badge] : null;
                return (
                  <tr
                    key={r.residentId}
                    style={{
                      background:
                        r.displayRank <= 3
                          ? r.displayRank === 1 ? colors.amberHighlight : colors.tableRowAlt
                          : i % 2 === 0 ? "#fff" : colors.tableRowAlt,
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    {/* Rank */}
                    <td className="px-5 py-3">
                      {r.displayRank <= 3 ? (
                        <span style={{ fontSize: 18 }}>
                          {r.displayRank === 1 ? "🥇" : r.displayRank === 2 ? "🥈" : "🥉"}
                        </span>
                      ) : (
                        <span
                          className="font-bold text-text-secondary"
                          style={{ fontSize: 14, minWidth: 24, display: "inline-block", textAlign: "center" }}
                        >
                          {r.displayRank}
                        </span>
                      )}
                    </td>

                    {/* Household */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex-shrink-0 flex items-center justify-center rounded-full"
                          style={{ width: 32, height: 32, background: colors.accentSoft }}
                        >
                          <Home size={15} color={colors.primary} />
                        </div>
                        <span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>
                          {r.name}
                        </span>
                      </div>
                    </td>

                    {/* Street */}
                    <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>
                      {r.street}
                    </td>

                    {/* Reports */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <Star size={13} color={colors.warning} />
                        <span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>
                          {r.reportsSubmitted}
                        </span>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-5 py-3">
                      <span className="font-bold text-primary" style={{ fontSize: 14 }}>
                        {r.pointsEarned.toLocaleString()}
                      </span>
                      <span className="text-text-muted ml-1" style={{ fontSize: 12 }}>pts</span>
                    </td>

                    {/* Badge */}
                    <td className="px-5 py-3">
                      {badge ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium"
                          style={{ fontSize: 12, background: badge.bg, color: badge.color }}
                        >
                          {badge.icon} {badge.label}
                        </span>
                      ) : (
                        <span className="text-text-muted" style={{ fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

