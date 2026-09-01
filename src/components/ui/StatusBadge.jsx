/**
 * StatusBadge — colored pill for status values
 * Matches mobile app status colors exactly.
 */
const CONFIG = {
  full:        { bg: "#FFEBEE", color: "#DC2626", label: "Full" },
  collected:   { bg: "#E8F5E9", color: "#2E7D32", label: "Collected" },
  missed:      { bg: "#FFF3E0", color: "#D97706", label: "Missed" },
  ok:          { bg: "#E8F5E9", color: "#2E7D32", label: "OK" },
  available:   { bg: "#E8F5E9", color: "#2E7D32", label: "Available" },
  pending:     { bg: "#FFF3E0", color: "#D97706", label: "Pending" },
  completed:   { bg: "#E8F5E9", color: "#2E7D32", label: "Completed" },
  delivered:   { bg: "#E8F5E9", color: "#2E7D32", label: "Delivered" },
  in_progress: { bg: "#E3F2FD", color: "#1976D2", label: "In Progress" },
  active:      { bg: "#E8F5E9", color: "#2E7D32", label: "Active" },
  inactive:    { bg: "#F3F4F6", color: "#6B7280", label: "Inactive" },
  en_route:    { bg: "#E3F2FD", color: "#1976D2", label: "En Route" },
  idle:        { bg: "#F3F4F6", color: "#6B7280", label: "Idle" },
  at_depot:    { bg: "#F3F4F6", color: "#9CA3AF", label: "At Depot" },
  on_route:    { bg: "#E3F2FD", color: "#1976D2", label: "On Route" },
  off_duty:    { bg: "#F3F4F6", color: "#9CA3AF", label: "Off Duty" },
  normal:      { bg: "#F3F4F6", color: "#6B7280", label: "Normal" },
};

export default function StatusBadge({ status, customLabel }) {
  const cfg = CONFIG[status] ?? { bg: "#F3F4F6", color: "#6B7280", label: status };
  return (
    <span
      className="inline-flex items-center font-medium rounded-full px-2.5 py-0.5"
      style={{ fontSize: 12, background: cfg.bg, color: cfg.color }}
    >
      {customLabel ?? cfg.label}
    </span>
  );
}

