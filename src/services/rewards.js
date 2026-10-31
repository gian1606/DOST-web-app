// ─── Rewards service ───────────────────────────────────────────────────────────
// Owns all HTTP calls for the eco_rewards catalog (admin CRUD).
// Only this file (and AuthContext) may import from services/api.js.

import { api } from "./api.js";

// ── Normalizer ────────────────────────────────────────────────────────────────

/**
 * Convert a raw API eco_rewards row to the shape the UI expects.
 *   eco_cost   → pointsCost
 *   is_active  → status ("available" | "unavailable")
 */
function normalizeReward(raw) {
  return {
    id:          raw.id,
    name:        raw.name,
    description: raw.description  ?? "",
    category:    raw.category     ?? "",
    partner:     raw.partner      ?? "",
    pointsCost:  raw.eco_cost     ?? raw.pointsCost ?? 0,
    stock:       raw.stock        ?? 0,
    featured:    raw.featured     ?? false,
    status:      raw.is_active    ? "available" : "unavailable",
  };
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * GET /api/eco/rewards?all=true
 * Returns all rewards (active + inactive) for the admin catalog view.
 * @returns {Promise<NormalizedReward[]>}
 */
export async function fetchRewards() {
  const data = await api.get("/eco/rewards", { all: "true" });
  return (Array.isArray(data) ? data : []).map(normalizeReward);
}

/**
 * POST /api/eco/rewards
 * Creates a new reward.
 * @param {{ name: string, description: string, pointsCost: number, stock: number, status: string }} payload
 * @returns {Promise<NormalizedReward>}
 */
export async function createReward({ name, description, pointsCost, stock, status }) {
  const data = await api.post("/eco/rewards", {
    name,
    description,
    ecoCost:  pointsCost,
    stock:    stock,
    isActive: status === "available",
  });
  return normalizeReward(data);
}

/**
 * PUT /api/eco/rewards/:id
 * Updates an existing reward.
 * @param {string} id
 * @param {{ name: string, description: string, pointsCost: number, stock: number, status: string }} payload
 * @returns {Promise<NormalizedReward>}
 */
export async function updateReward(id, { name, description, pointsCost, stock, status }) {
  const data = await api.put(`/eco/rewards/${id}`, {
    name,
    description,
    ecoCost:  pointsCost,
    stock:    stock,
    isActive: status === "available",
  });
  return normalizeReward(data);
}

/**
 * DELETE /api/eco/rewards/:id
 * Soft-deletes a reward (sets is_active = false on the backend).
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteReward(id) {
  return api.del(`/eco/rewards/${id}`);
}
