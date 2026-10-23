/**
 * StatusBadge — colored pill for status values.
 * Matches mobile app status colors exactly.
 * Colors reference theme/colors.js — never bare hex.
 */
import { colors } from "../../theme/colors.js";

const CONFIG = {
  full:        { bg: colors.errorSoft,   color: colors.error,      label: "Full" },
  collected:   { bg: colors.accentSoft,  color: colors.primary,    label: "Collected" },
  missed:      { bg: colors.warningSoft, color: colors.warning,    label: "Missed" },
  ok:          { bg: colors.accentSoft,  color: colors.primary,    label: "OK" },
  available:   { bg: colors.accentSoft,  color: colors.primary,    label: "Available" },
  pending:     { bg: colors.warningSoft, color: colors.warning,    label: "Pending" },
  completed:   { bg: colors.accentSoft,  color: colors.primary,    label: "Completed" },
  delivered:   { bg: colors.accentSoft,  color: colors.primary,    label: "Delivered" },
  in_progress: { bg: colors.infoSoft,    color: colors.recyclable, label: "In Progress" },
  active:      { bg: colors.accentSoft,  color: colors.primary,    label: "Active" },
  inactive:    { bg: colors.gray100,     color: colors.gray500,    label: "Inactive" },
  en_route:    { bg: colors.infoSoft,    color: colors.recyclable, label: "En Route" },
  idle:        { bg: colors.gray100,     color: colors.gray500,    label: "Idle" },
  at_depot:    { bg: colors.gray100,     color: colors.textMuted,  label: "At Depot" },
  on_route:    { bg: colors.infoSoft,    color: colors.recyclable, label: "On Route" },
  off_duty:    { bg: colors.gray100,     color: colors.textMuted,  label: "Off Duty" },
  normal:      { bg: colors.gray100,     color: colors.gray500,    label: "Normal" },
};

export default function StatusBadge({ status, customLabel }) {
  const cfg = CONFIG[status] ?? { bg: colors.gray100, color: colors.gray500, label: status };
  return (
    <span
      className="inline-flex items-center font-medium rounded-full px-2.5 py-0.5"
      style={{ fontSize: 12, background: cfg.bg, color: cfg.color }}
    >
      {customLabel ?? cfg.label}
    </span>
  );
}
