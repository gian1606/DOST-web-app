// ─── Collector reports service ────────────────────────────────────────────────
// Owns all /collector-reports endpoints. Pages call these functions; they
// never call api.* directly.

import { api } from "./api.js";

/**
 * GET /collector-reports?status=<status>
 * @param {string} [status]  "pending" | "resolved" | undefined (all)
 * @returns {Promise<Report[]>}  normalized report list
 */
export async function fetchCollectorReports(status) {
  const params = status && status !== "all" ? { status } : undefined;
  const data = await api.get("/collector-reports", params);
  return (data.reports ?? []).map(normalizeReport);
}

/**
 * PUT /collector-reports/:id  — mark a report as resolved.
 * @param {string} id
 * @returns {Promise<Report>}  the updated report
 */
export async function resolveCollectorReport(id) {
  const data = await api.put(`/collector-reports/${id}`);
  return normalizeReport(data.report);
}

/**
 * snake_case → camelCase report normalization.
 */
function normalizeReport(raw) {
  if (!raw) return null;
  return {
    id:              raw.id,
    collectorName:   raw.collector_name   ?? raw.collectorName   ?? null,
    collectorEmail:  raw.collector_email  ?? raw.collectorEmail  ?? null,
    issueType:       raw.issue_type       ?? raw.issueType       ?? null,
    status:          raw.status,
    reportedAt:      raw.reported_at      ?? raw.reportedAt      ?? null,
    resolvedAt:      raw.resolved_at      ?? raw.resolvedAt      ?? null,
    resolvedByName:  raw.resolved_by_name ?? raw.resolvedByName  ?? null,
    stopsCompleted:  raw.stops_completed  ?? raw.stopsCompleted  ?? 0,
    stopsTotal:      raw.stops_total      ?? raw.stopsTotal      ?? 0,
    notes:           raw.notes            ?? null,
  };
}
