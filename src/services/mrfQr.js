// ─── MRF QR Codes service ─────────────────────────────────────────────────────
// Owns all /mrf-qr endpoints.
// Pages call these functions; they never call api.* directly.

import { api } from "./api.js";

/**
 * GET /mrf-qr?barangay=<barangay>
 * @param {string} barangay
 * @returns {Promise<MrfQrCode[]>}  normalized MRF QR code list
 */
export async function fetchMrfQrCodes(barangay) {
  const data = await api.get("/mrf-qr", { barangay });
  const records = data.mrfQrCodes ?? data ?? [];
  return records.map(normalizeMrfQrCode);
}

/**
 * POST /mrf-qr
 * @param {{ name: string, barangay: string, address?: string, latitude?: number, longitude?: number }} payload
 * @returns {Promise<MrfQrCode>}  the created record
 */
export async function createMrfQrCode(payload) {
  const data = await api.post("/mrf-qr", {
    name:      payload.name,
    barangay:  payload.barangay,
    address:   payload.address,
    latitude:  payload.latitude,
    longitude: payload.longitude,
  });
  return normalizeMrfQrCode(data.mrfQrCode);
}

/**
 * DELETE /mrf-qr/:id
 * @param {string} id
 */
export async function deleteMrfQrCode(id) {
  return api.del(`/mrf-qr/${id}`);
}

// ── snake_case → camelCase normalization ─────────────────────────────────────
function normalizeMrfQrCode(raw) {
  if (!raw) return null;
  return {
    id:         raw.id,
    name:       raw.name,
    barangay:   raw.barangay,
    address:    raw.address    ?? null,
    latitude:   raw.latitude   != null ? Number(raw.latitude)  : null,
    longitude:  raw.longitude  != null ? Number(raw.longitude) : null,
    qrPayload:  raw.qr_payload ?? raw.qrPayload ?? null,
    createdBy:  raw.created_by ?? raw.createdBy ?? null,
    createdAt:  raw.created_at ?? raw.createdAt ?? null,
  };
}
