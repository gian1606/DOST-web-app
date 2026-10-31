// ─── Collector Units service ──────────────────────────────────────────────────
// Owns all HTTP calls for collector unit management (Collector Admin portal).
// Only this file (and AuthContext) may import from services/api.js.

import { api } from "./api.js";

// ── Normalizers ───────────────────────────────────────────────────────────────

/**
 * Normalize a single collector row nested inside a unit response.
 * Maps API camelCase fields → the shape the pages use.
 */
function normalizeUnitCollector(raw) {
  return {
    id:        raw.id,
    name:      raw.name,
    email:     raw.email,
    // Pages read c.status as "active"/"inactive" for StatusBadge
    status:    raw.isActive ? "active" : "inactive",
    lastLogin: raw.lastLogin ?? null,
  };
}

/**
 * Normalize a raw unit row from the API into the shape the pages use.
 *
 * Mock shape the pages expect:
 *   { id, name, plateNumber, status, collectorIds: string[] }
 *
 * The pages derive their collector display by calling getUnitCollectors(unit),
 * which filters the separate `collectors` list by collectorIds. We replicate
 * that by carrying both the full collector objects AND the id array.
 */
function normalizeUnit(raw) {
  const collectors = (raw.collectors ?? []).map(normalizeUnitCollector);
  return {
    id:             raw.id,
    name:           raw.name,
    plateNumber:    raw.plateNumber,
    // API returns "idle" | "en_route" | "at_depot" — matches mock values directly
    status:         raw.status,
    collectorIds:   collectors.map((c) => c.id),
    // Extra field carried for the expanded-row table (avoids a second fetch)
    collectors,
    createdAt:      raw.createdAt,
    updatedAt:      raw.updatedAt,
  };
}

/**
 * Normalize the summary response for the 4 stat cards.
 */
function normalizeSummary(raw) {
  return {
    totalUnits:         raw.totalUnits,
    enRoute:            raw.enRoute,
    idleOrAtDepot:      raw.idleOrAtDepot,
    collectorsAssigned: raw.collectorsAssigned,
  };
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * GET /api/collector-units/summary
 * Returns the 4 stat card values.
 * @returns {Promise<{ totalUnits, enRoute, idleOrAtDepot, collectorsAssigned }>}
 */
export async function getCollectorUnitsSummary() {
  const data = await api.get("/collector-units/summary");
  return normalizeSummary(data);
}

/**
 * GET /api/collector-units
 * Returns all units with their assigned collectors.
 * @returns {Promise<NormalizedUnit[]>}
 */
export async function getCollectorUnits() {
  const data = await api.get("/collector-units");
  return data.map(normalizeUnit);
}

/**
 * GET /api/collector-units/:id
 * @param {string} id
 * @returns {Promise<NormalizedUnit>}
 */
export async function getCollectorUnit(id) {
  const data = await api.get(`/collector-units/${id}`);
  return normalizeUnit(data);
}

/**
 * POST /api/collector-units
 * Creates a new unit. Status defaults to "idle" on the server.
 * @param {{ name: string, plateNumber: string }} payload
 * @returns {Promise<NormalizedUnit>}
 */
export async function createCollectorUnit({ name, plateNumber }) {
  const data = await api.post("/collector-units", { name, plateNumber });
  return normalizeUnit(data);
}

/**
 * PATCH /api/collector-units/:id
 * Partial update — only include the fields you want to change.
 * @param {string} id
 * @param {{ name?: string, plateNumber?: string, status?: string }} payload
 * @returns {Promise<NormalizedUnit>}
 */
export async function updateCollectorUnit(id, { name, plateNumber, status } = {}) {
  const body = {};
  if (name        !== undefined) body.name        = name;
  if (plateNumber !== undefined) body.plateNumber = plateNumber;
  if (status      !== undefined) body.status      = status;

  const data = await api.patch(`/collector-units/${id}`, body);
  return normalizeUnit(data);
}

/**
 * DELETE /api/collector-units/:id
 * Deletes the unit and unassigns its collectors (accounts are kept).
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteCollectorUnit(id) {
  return api.del(`/collector-units/${id}`);
}

/**
 * POST /api/collector-units/:id/collectors
 * Assigns a collector to a unit.
 * @param {string} unitId
 * @param {string} collectorId
 * @returns {Promise<NormalizedUnit>} — updated unit with the new collector included
 */
export async function assignCollectorToUnit(unitId, collectorId) {
  const data = await api.post(`/collector-units/${unitId}/collectors`, { collectorId });
  return normalizeUnit(data);
}

/**
 * DELETE /api/collector-units/:id/collectors/:collectorId
 * Removes a collector from a unit.
 * @param {string} unitId
 * @param {string} collectorId
 * @returns {Promise<NormalizedUnit>} — updated unit without the removed collector
 */
export async function removeCollectorFromUnit(unitId, collectorId) {
  return api.del(`/collector-units/${unitId}/collectors/${collectorId}`);
}
