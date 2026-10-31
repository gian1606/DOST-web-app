// ─── Users service ─────────────────────────────────────────────────────────────
// Owns all HTTP calls for user account management (mrf_worker CRUD).
// Only this file (and AuthContext) may import from services/api.js.

import { api } from "./api.js";

// ── Normalizers ───────────────────────────────────────────────────────────────

/**
 * Convert a raw API mrf_worker row to a clean camelCase shape.
 * The `barangay` column doubles as the MRF facility assignment.
 */
function normalizeMrfWorker(raw) {
  return {
    id:        raw.id,
    name:      raw.name,
    email:     raw.email,
    phone:     raw.phone     ?? null,
    mrf:       raw.barangay  ?? "",   // UI label for the assigned MRF facility
    isActive:  raw.is_active,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    // last_login is null until the mrf_worker logs in for the first time
    lastLogin: raw.last_login ?? null,
  };
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * GET /api/users/mrf-workers
 * Returns all mrf_worker accounts.
 * @returns {Promise<NormalizedMrfWorker[]>}
 */
export async function getMrfWorkers() {
  const data = await api.get("/users/mrf-workers");
  return data.map(normalizeMrfWorker);
}

/**
 * POST /api/users/mrf-workers
 * Creates a new mrf_worker account.
 * @param {{ name: string, email: string, barangay: string, tempPassword: string }} payload
 * @returns {Promise<NormalizedMrfWorker>}
 */
export async function createMrfWorker({ name, email, barangay, tempPassword }) {
  const data = await api.post("/users/mrf-workers", {
    name,
    email,
    barangay,
    tempPassword,
  });
  return normalizeMrfWorker(data);
}

/**
 * PUT /api/users/mrf-workers/:id
 * Updates an mrf_worker's name, email, barangay, or isActive flag.
 * Only include the fields you want to change.
 * @param {string} id
 * @param {{ name?: string, email?: string, barangay?: string, isActive?: boolean }} payload
 * @returns {Promise<NormalizedMrfWorker>}
 */
export async function updateMrfWorker(id, { name, email, barangay, isActive }) {
  const body = {};
  if (name     !== undefined) body.name      = name;
  if (email    !== undefined) body.email     = email;
  if (barangay !== undefined) body.barangay  = barangay;
  if (isActive !== undefined) body.isActive  = isActive;

  const data = await api.put(`/users/mrf-workers/${id}`, body);
  return normalizeMrfWorker(data);
}

/**
 * DELETE /api/users/mrf-workers/:id
 * Hard-deletes an mrf_worker account.
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteMrfWorker(id) {
  return api.del(`/users/mrf-workers/${id}`);
}
