// ─── Super Admin service ──────────────────────────────────────────────────────
// Owns all /api/sa/* endpoints.
// Only this file and context/AuthContext.jsx may import from services/api.js.

import { api } from "./api.js";

// ── normalizers ───────────────────────────────────────────────────────────────

/**
 * Format last login timestamp into human-readable "Active X ago" format
 */
function formatLastLogin(lastLogin) {
  if (!lastLogin) return "Never logged in";
  
  const now = new Date();
  const loginDate = new Date(lastLogin);
  const diffMs = now - loginDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Active now";
  if (diffMins < 60) return `Active ${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `Active ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return "Active yesterday";
  if (diffDays < 30) return `Active ${diffDays} days ago`;
  
  // Format as date for older logins
  return `Last seen ${loginDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function normalizeBarangayAdmin(raw) {
  return {
    id:              raw.id,
    name:            raw.name            ?? "",
    captain:         raw.captain         ?? "",
    email:           raw.email           ?? "",
    totalBins:       Number(raw.totalBins       ?? 0),
    activeResidents: Number(raw.activeResidents ?? 0),
    isActive:        raw.isActive        ?? true,
    onlineStatus:    raw.onlineStatus    ?? "never",
    lastLogin:       raw.lastLogin       ?? null,
    lastLoginText:   formatLastLogin(raw.lastLogin),
    createdAt:       raw.createdAt       ?? null,
  };
}

function normalizeBarangay(raw) {
  return {
    id:              raw.id,
    name:            raw.name            ?? "",
    captain:         raw.captain         ?? "",
    email:           raw.email           ?? "",
    totalBins:       Number(raw.totalBins       ?? 0),
    activeResidents: Number(raw.activeResidents ?? 0),
    status:          raw.status          ?? "active",
    lastActivity:    raw.lastActivity    ?? null,
  };
}

function normalizeRoute(raw) {
  return {
    id:               raw.id,
    routeId:          raw.routeId,
    date:             raw.date,
    bins:             raw.bins          ?? [],
    distanceKm:       Number(raw.distanceKm       ?? 0),
    estimatedMinutes: Number(raw.estimatedMinutes ?? 0),
    algorithm:        raw.algorithm     ?? "Nearest Neighbor",
    truckNo:          raw.truckNo       ?? null,
    sentTo:           raw.sentTo        ?? "Collector Admin",
    status:           raw.status        ?? "delivered",
    optimizedAt:      raw.optimizedAt   ?? null,
    sentAt:           raw.sentAt        ?? null,
  };
}

// =============================================================================
// BARANGAY ADMINS
// =============================================================================

export async function fetchBarangayAdmins() {
  const data = await api.get("/sa/barangay-admins");
  return (data.barangayAdmins ?? []).map(normalizeBarangayAdmin);
}

export async function createBarangayAdmin({ name, captain, email, tempPassword, useExisting, existingUserId }) {
  const data = await api.post("/sa/barangay-admins", { 
    name, 
    captain, 
    email, 
    tempPassword, 
    useExisting, 
    existingUserId 
  });
  return normalizeBarangayAdmin(data.barangayAdmin);
}

export async function deleteBarangayAdmin(id) {
  return api.del(`/sa/barangay-admins/${id}`);
}

export async function updateBarangayAdminStatus(id, isActive) {
  const data = await api.patch(`/sa/barangay-admins/${id}/status`, { isActive });
  return data;
}

export async function fetchDeletedBarangayAdmins(filters = {}) {
  const params = {};
  if (filters.year) params.year = filters.year;
  if (filters.month) params.month = filters.month;
  if (filters.day) params.day = filters.day;
  
  const data = await api.get("/sa/barangay-admins/deleted", params);
  return data.deletedAccounts ?? [];
}

// =============================================================================
// BARANGAYS
// =============================================================================

export async function fetchBarangays() {
  const data = await api.get("/sa/barangays");
  return (data.barangays ?? []).map(normalizeBarangay);
}

export async function createBarangay({ name, captain, email }) {
  const data = await api.post("/sa/barangays", { name, captain, email });
  return normalizeBarangay(data.barangay);
}

export async function updateBarangay(id, { name, captain, email, status }) {
  const data = await api.put(`/sa/barangays/${id}`, { name, captain, email, status });
  return normalizeBarangay(data.barangay);
}

export async function deleteBarangay(id) {
  return api.del(`/sa/barangays/${id}`);
}

export async function fetchDeletedBarangays(filters = {}) {
  const params = {};
  if (filters.year) params.year = filters.year;
  if (filters.month) params.month = filters.month;
  if (filters.day) params.day = filters.day;
  
  const data = await api.get("/sa/barangays/deleted", params);
  return data.deletedBarangays ?? [];
}

// =============================================================================
// DASHBOARD
// =============================================================================

export async function fetchDashboardStats() {
  return api.get("/sa/dashboard/stats");
}

export async function fetchDashboardActivity() {
  const data = await api.get("/sa/dashboard/activity");
  return data.activity ?? [];
}

export async function fetchDashboardMapData() {
  return api.get("/sa/dashboard/map-data");
}

// =============================================================================
// COLLECTION ROUTES
// =============================================================================

export async function fetchRoutes(params = {}) {
  const data = await api.get("/sa/routes", params);
  return {
    routes: (data.routes ?? []).map(normalizeRoute),
    total:  data.total ?? 0,
    page:   data.page  ?? 1,
  };
}

export async function createRoute(payload) {
  const data = await api.post("/sa/routes", {
    routeId:          payload.routeId,
    date:             payload.date,
    bins:             payload.bins             ?? [],
    distanceKm:       payload.distanceKm,
    estimatedMinutes: payload.estimatedMinutes,
    algorithm:        payload.algorithm,
    truckNo:          payload.truckNo,
    sentTo:           payload.sentTo,
  });
  return normalizeRoute(data.route);
}

export async function updateRoute(id, { status, truckNo, sentTo }) {
  const data = await api.put(`/sa/routes/${id}`, { status, truckNo, sentTo });
  return normalizeRoute(data.route);
}

// =============================================================================
// LEADERBOARD
// =============================================================================

export async function fetchLeaderboard(month) {
  const data = await api.get("/sa/leaderboard", { month });
  return data.leaderboard ?? [];
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export async function fetchNotifications() {
  const data = await api.get("/sa/notifications");
  return data.notifications ?? [];
}

export async function sendNotification({ title, body, priority, type, target }) {
  const data = await api.post("/sa/notifications", { title, body, priority, type, target });
  return data.notification;
}

// =============================================================================
// CLUSTERS
// =============================================================================

export async function fetchClusters() {
  const data = await api.get("/sa/clusters");
  return data.clusters ?? [];
}

export async function createCluster({ name, label }) {
  const data = await api.post("/sa/clusters", { name, label });
  return data.cluster;
}

export async function updateCluster(id, { label }) {
  const data = await api.put(`/sa/clusters/${id}`, { label });
  return data.cluster;
}

export async function deleteCluster(id) {
  return api.del(`/sa/clusters/${id}`);
}

// Assign a barangay to a cluster
export async function assignBarangayToCluster(clusterId, barangayId) {
  const data = await api.post(`/sa/clusters/${clusterId}/barangays`, { barangay_id: barangayId });
  return data.barangays ?? [];
}

// Remove a barangay from a cluster
export async function unassignBarangayFromCluster(clusterId, barangayId) {
  return api.del(`/sa/clusters/${clusterId}/barangays/${barangayId}`);
}

// Full list of all barangays (for dropdown)
export async function fetchAllBarangays() {
  const data = await api.get("/sa/barangays/all");
  return data.barangays ?? [];
}

// Available barangays (no active admin account assigned)
export async function fetchAvailableBarangays() {
  const data = await api.get("/sa/barangays/available");
  return data.barangays ?? [];
}

// Get cluster info for current user's barangay (accessible by PB)
export async function fetchMyClusterInfo() {
  const data = await api.get("/sa/barangays/my-cluster");
  return data.clusterLabel ?? null;
}
