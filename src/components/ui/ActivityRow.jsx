/**
 * ActivityRow — recent activity event item
 */
import { colors } from "../../theme/colors.js";

const EVENT_COLORS = {
  bin_reported:         colors.error,
  collection_confirmed: colors.primary,
  route_sent:           colors.recyclable,
  route_received:       colors.recyclable,
  route_completed:      colors.primary,
  barangay_created:     colors.gray500,
};

export default function ActivityRow({ event, description, timestamp }) {
  const color = EVENT_COLORS[event] ?? colors.gray500;
  const time = new Date(timestamp).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Date(timestamp).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div
        className="flex-shrink-0 rounded-full mt-1"
        style={{ width: 8, height: 8, background: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-text-primary" style={{ fontSize: 13 }}>
          {description}
        </div>
        <div className="text-text-muted" style={{ fontSize: 11 }}>
          {date} · {time}
        </div>
      </div>
    </div>
  );
}
