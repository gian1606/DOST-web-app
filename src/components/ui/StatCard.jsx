/**
 * StatCard — dashboard KPI tile
 * Props: icon (ReactNode), value, label, subLabel, subLabelColor
 */
export default function StatCard({ icon, value, label, subLabel, subLabelColor = "#6B7280" }) {
  return (
    <div
      className="bg-white rounded-xl p-5 flex flex-col gap-2"
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 38, height: 38, background: "#F4F6F9" }}
        >
          {icon}
        </div>
      </div>
      <div
        className="font-bold leading-none"
        style={{ fontSize: 32, fontVariantNumeric: "tabular-nums", color: "#1A1A1A" }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: "#6B7280" }}>{label}</div>
      {subLabel && (
        <div className="font-medium" style={{ fontSize: 12, color: subLabelColor }}>
          {subLabel}
        </div>
      )}
    </div>
  );
}

