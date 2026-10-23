// ─── Bins service ─────────────────────────────────────────────────────────────
// Owns all /bins endpoints. Pages call these functions; they never
// call api.* directly.

import { api } from "./api.js";

/**
 * GET /bins?barangay=<barangay>
 * @param {string} barangay
 * @returns {Promise<Bin[]>}  normalized bin list
 */
export async function fetchBins(barangay) {
  const data = await api.get("/bins", { barangay });
  const bins = data.bins ?? data ?? [];
  return bins.map(normalizeBin);
}

/**
 * POST /bins
 * @param {{ name: string, street: string, barangay: string, clusterId: string, tierId: string, latitude?: number, longitude?: number }} payload
 * @returns {Promise<Bin>}  the created bin
 */
export async function createBin(payload) {
  const data = await api.post("/bins", {
    name:       payload.name,
    street:     payload.street,
    barangay:   payload.barangay,
    cluster_id: payload.clusterId,
    tier_id:    payload.tierId,
    latitude:   payload.latitude,
    longitude:  payload.longitude,
  });
  return normalizeBin(data.bin);
}

/**
 * DELETE /bins/:id
 */
export async function deleteBin(id) {
  return api.del(`/bins/${id}`);
}

/**
 * POST /bins/bulk-delete
 * @param {string[]} ids
 */
export async function bulkDeleteBins(ids) {
  return api.post("/bins/bulk-delete", { ids });
}

/**
 * snake_case → camelCase bin normalization.
 */
function normalizeBin(raw) {
  if (!raw) return null;
  return {
    id:          raw.id,
    name:        raw.name,
    street:      raw.street      ?? null,
    barangay:    raw.barangay,
    status:      raw.status       ?? "ok",
    tierId:      raw.tier_id      ?? raw.tierId      ?? null,
    qrPayload:   raw.qr_payload   ?? raw.qrPayload   ?? null,
    latitude:    raw.latitude     ?? null,
    longitude:   raw.longitude    ?? null,
    reportedBy:  raw.reported_by ?? raw.reportedBy   ?? null,
    timeReported: raw.time_reported ?? raw.timeReported ?? null,
    posX:        raw.posX         ?? raw.pos_x       ?? null,
    posY:        raw.posY         ?? raw.pos_y       ?? null,
  };
}
