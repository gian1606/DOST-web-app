/**
 * AlertRow — full bin alert item
 * Props: name, description, timeReported
 */
export default function AlertRow({ name, description, timeReported }) {
  const time = timeReported
    ? new Date(timeReported).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Red icon bg */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-lg"
        style={{ width: 34, height: 34, background: "#FFEBEE" }}
      >
        <span style={{ fontSize: 16 }}>🗑️</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text-primary truncate" style={{ fontSize: 13 }}>
          {name}
        </div>
        <div className="text-text-secondary truncate" style={{ fontSize: 12 }}>
          {description}
          {time && <span className="text-text-muted ml-1">· {time}</span>}
        </div>
      </div>

      {/* Red dot */}
      <div
        className="flex-shrink-0 rounded-full"
        style={{ width: 8, height: 8, background: "#DC2626" }}
      />
    </div>
  );
}

