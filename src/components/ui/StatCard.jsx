/**
 * StatCard — dashboard KPI tile
 * Props: icon (ReactNode), value, label, subLabel, subLabelColor
 */
export default function StatCard({ icon, value, label, subLabel, subLabelColor }) {
  return (
    <div
      className="bg-white rounded-xl p-5 flex flex-col gap-2 border border-gray-200"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center rounded-lg bg-background"
          style={{ width: 38, height: 38 }}>
          {icon}
        </div>
      </div>
      <div className="font-bold leading-none text-text-heading"
        style={{ fontSize: 32, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      <div className="text-text-muted" style={{ fontSize: 13 }}>{label}</div>
      {subLabel && (
        <div className="font-medium" style={{ fontSize: 12, color: subLabelColor }}>
          {subLabel}
        </div>
      )}
    </div>
  );
}
