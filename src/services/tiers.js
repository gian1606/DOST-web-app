// ─── Tiers service ────────────────────────────────────────────────────────────
// Owns all /tiers endpoints. Pages call these functions; they never
// call api.* directly.

import { api } from "./api.js";

/**
 * GET /tiers
 * @returns {Promise<Tier[]>}  normalized tier list
 */
export async function fetchTiers() {
  const data = await api.get("/tiers");
  const tiers = Array.isArray(data) ? data : (data.tiers ?? []);
  return tiers.map(normalizeTier);
}

/**
 * POST /tiers
 * @param {{ name: string, capacityLiters?: number }} payload
 * @returns {Promise<Tier>}
 */
export async function createTier(payload) {
  const data = await api.post("/tiers", {
    name:             payload.name,
    capacity_liters:  payload.capacityLiters ?? null,
  });
  return normalizeTier(data);
}

/**
 * PUT /tiers/:id
 * @param {string} id
 * @param {{ name: string, capacityLiters?: number }} payload
 * @returns {Promise<Tier>}
 */
export async function updateTier(id, payload) {
  const data = await api.put(`/tiers/${id}`, {
    name:             payload.name,
    capacity_liters:  payload.capacityLiters ?? null,
  });
  return normalizeTier(data);
}

/**
 * DELETE /tiers/:id
 */
export async function deleteTier(id) {
  return api.del(`/tiers/${id}`);
}

/**
 * snake_case → camelCase tier normalization.
 */
function normalizeTier(raw) {
  if (!raw) return null;
  return {
    id:           raw.id,
    name:         raw.name,
    capacityLiters: raw.capacity_liters ?? raw.capacityLiters ?? null,
    ecoReward:    raw.eco_reward    ?? raw.ecoReward    ?? null,
  };
}
