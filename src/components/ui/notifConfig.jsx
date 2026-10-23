// ─── Notification type → icon + color config ──────────────────────────────────
// Single source of truth for notification type display across:
//   - TopHeader notification dropdowns (SA, CA, PB)
//   - Full Notifications pages (SA, PB)
//
// CA uses only the `route` and `announcement` types from this map.
// Colors reference theme/colors.js — never bare hex.

import {
  Bell, Calendar, CheckCircle, FileText, Megaphone,
} from "lucide-react";
import { colors } from "../../theme/colors.js";

/**
 * Maps notification type string → { icon: LucideComponent, color: string, bg: string }
 * Falls back to `announcement` when an unknown type is encountered.
 */
export const NOTIF_TYPE_CONFIG = {
  task:         { icon: Bell,        color: colors.recyclable, bg: colors.infoSoft   },
  schedule:     { icon: Calendar,    color: colors.warning,    bg: colors.warningSoft },
  complete:     { icon: CheckCircle, color: colors.primary,    bg: colors.accentSoft  },
  report:       { icon: FileText,    color: colors.gray500,    bg: colors.gray100     },
  announcement: { icon: Megaphone,   color: colors.primary,    bg: colors.accentSoft  },
  // Collector Admin — route delivery notifications
  route:        { icon: CheckCircle, color: colors.recyclable, bg: colors.infoSoft   },
};
