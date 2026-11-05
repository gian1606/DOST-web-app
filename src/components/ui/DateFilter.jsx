import { colors } from "../../theme/colors.js";
import { Calendar } from "lucide-react";

/**
 * DateFilter Component
 * Provides Year/Month/Day dropdown filters for historical data
 */
export default function DateFilter({ year, month, day, onYearChange, onMonthChange, onDayChange, onClear }) {
  const currentYear = new Date().getFullYear();
  // Start from 2026 (implementation year) and go forward to current year + 5
  const startYear = 2026;
  const endYear = currentYear + 5;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];
  
  const getDaysInMonth = (year, month) => {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
  };
  
  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2" style={{ color: colors.textSecondary, fontSize: 13 }}>
        <Calendar size={16} color={colors.primary} />
        <span className="font-medium">Filter by Date:</span>
      </div>
      
      <select
        value={year || ""}
        onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value) : null)}
        className="rounded-lg px-3 py-1.5 outline-none"
        style={{ 
          fontSize: 13, 
          border: `1.5px solid ${colors.gray200}`, 
          background: year ? colors.accentSoft : colors.gray50,
          color: year ? colors.primary : colors.textSecondary
        }}>
        <option value="">All Years</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select
        value={month || ""}
        onChange={(e) => onMonthChange(e.target.value ? parseInt(e.target.value) : null)}
        disabled={!year}
        className="rounded-lg px-3 py-1.5 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ 
          fontSize: 13, 
          border: `1.5px solid ${colors.gray200}`, 
          background: month ? colors.accentSoft : colors.gray50,
          color: month ? colors.primary : colors.textSecondary
        }}>
        <option value="">All Months</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      <select
        value={day || ""}
        onChange={(e) => onDayChange(e.target.value ? parseInt(e.target.value) : null)}
        disabled={!month}
        className="rounded-lg px-3 py-1.5 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ 
          fontSize: 13, 
          border: `1.5px solid ${colors.gray200}`, 
          background: day ? colors.accentSoft : colors.gray50,
          color: day ? colors.primary : colors.textSecondary
        }}>
        <option value="">All Days</option>
        {days.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {(year || month || day) && (
        <button
          onClick={onClear}
          className="rounded-lg px-3 py-1.5 font-medium hover:opacity-80 transition-opacity"
          style={{ 
            fontSize: 13, 
            background: colors.errorSoft, 
            color: colors.error 
          }}>
          Clear Filters
        </button>
      )}
    </div>
  );
}
