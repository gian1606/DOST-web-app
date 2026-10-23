// ─── Auth service ──────────────────────────────────────────────────────────────
// Owns the /auth/login endpoint and user normalization.
// AuthContext calls loginUser(); pages never import from here directly.

import { api } from "./api.js";

/**
 * POST /auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: NormalizedUser }>}
 *
 * Normalizes the raw API user object (snake_case → camelCase).
 */
export async function loginUser(email, password) {
  const data = await api.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  return {
    token: data.token,
    user: normalizeUser(data.user),
  };
}

/**
 * Convert raw API user fields to a clean camelCase shape.
 * Add field renames here as the API grows.
 */
function normalizeUser(raw) {
  if (!raw) return null;
  return {
    id:        raw.id,
    name:      raw.name,
    email:     raw.email,
    role:      raw.role,
    barangay:  raw.barangay  ?? null,
    clusterId: raw.cluster_id ?? raw.clusterId ?? null,
  };
}
