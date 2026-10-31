// ─── Collectors service ───────────────────────────────────────────────────────
// Owns all HTTP calls for collector account management (Collector Admin portal).
// Only this file (and AuthContext) may import from services/api.js.

import { api } from "./api.js";

// ── Normalizer ────────────────────────────────────────────────────────────────

/**
 * Normalize a raw API collector row into the shape the pages use.
 *
 * Mock shape the pages expect:
 *   { id, name, email, role, status, lastLogin, assignedTruck }
 *
 * "status" in the pages is "active" | "inactive" (string), so we convert
 * the boolean isActive → string here so StatusBadge keeps working unchanged.
 * "assignedTruck" in the mock was the unit id; we keep it as assignedUnitId
 * but also carry assignedUnit (name) so UserManagement's getAssignedUnit
 * helper can be replaced with a direct field read.
 */
function normalizeCollector(raw) {
  return {
    id:             raw.id,
    name:           raw.name,
    email:          raw.email,
    role:           "collector",
    // Pages filter/display by "active" / "inactive" strings
    status:         raw.isActive ? "active" : "inactive",
    lastLogin:      raw.lastLogin  ?? null,
    // assignedUnit is the unit name string (or null); replaces mock's lookup
    assignedUnit:   raw.assignedUnit   ?? null,
    assignedUnitId: raw.assignedUnitId ?? null,
    createdAt:      raw.createdAt,
    updatedAt:      raw.updatedAt,
  };
}

/**
 * Normalize the summary response for the 3 stat cards.
 */
function normalizeSummary(raw) {
  return {
    totalCollectors: raw.totalCollectors,
    active:          raw.active,
    inactive:        raw.inactive,
  };
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * GET /api/collectors/summary
 * Returns the 3 stat card values.
 * @returns {Promise<{ totalCollectors, active, inactive }>}
 */
export async function getCollectorsSummary() {
  const data = await api.get("/collectors/summary");
  return normalizeSummary(data);
}

/**
 * GET /api/collectors
 * Returns all collector accounts with their assigned unit name.
 * @returns {Promise<NormalizedCollector[]>}
 */
export async function getCollectors() {
  const data = await api.get("/collectors");
  return data.map(normalizeCollector);
}

/**
 * GET /api/collectors/:id
 * @param {string} id
 * @returns {Promise<NormalizedCollector>}
 */
export async function getCollector(id) {
  const data = await api.get(`/collectors/${id}`);
  return normalizeCollector(data);
}

/**
 * POST /api/collectors
 * Creates a new collector account.
 * Role is always "collector" and status defaults to active on the server.
 * @param {{ name: string, email: string, tempPassword: string }} payload
 * @returns {Promise<NormalizedCollector>}
 */
export async function createCollector({ name, email, tempPassword }) {
  const data = await api.post("/collectors", { name, email, tempPassword });
  return normalizeCollector(data);
}

/**
 * PATCH /api/collectors/:id
 * Partial update — only include the fields you want to change.
 * Pass newPassword to trigger a password reset.
 * @param {string} id
 * @param {{ name?: string, email?: string, isActive?: boolean, newPassword?: string }} payload
 * @returns {Promise<NormalizedCollector>}
 */
export async function updateCollector(id, { name, email, isActive, newPassword } = {}) {
  const body = {};
  if (name        !== undefined) body.name        = name;
  if (email       !== undefined) body.email       = email;
  if (isActive    !== undefined) body.isActive    = isActive;
  if (newPassword !== undefined) body.newPassword = newPassword;

  const data = await api.patch(`/collectors/${id}`, body);
  return normalizeCollector(data);
}

/**
 * DELETE /api/collectors/:id
 * Deletes the collector account and unassigns them from their unit.
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteCollector(id) {
  return api.del(`/collectors/${id}`);
}
