// ─── BE-SMART Cluster Admin Mock Data ─────────────────────────────────────────
// Scoped to Cluster 1 — North Zone for mock purposes.

// ── Cluster Info ──────────────────────────────────────────────────────────────
export const CLUSTER_INFO = {
  id: "c1",
  label: "Cluster 1",
  zone: "North Zone",
  adminName: "Juan dela Cruz",
  adminEmail: "cluster1@besmart.gov.ph",
};

// ── Barangays under this cluster ──────────────────────────────────────────────
export const BARANGAYS = [
  { id: "br1", name: "Brgy. Alangilan",       captain: "Jose Reyes",    email: "alangilan@besmart.gov.ph",   totalBins: 18, activeResidents: 142, status: "active",   lastActivity: "2026-05-17" },
  { id: "br2", name: "Brgy. Cuta",            captain: "Maria Lim",     email: "cuta@besmart.gov.ph",        totalBins: 22, activeResidents: 198, status: "active",   lastActivity: "2026-05-18" },
  { id: "br3", name: "Brgy. Kumintang Ibaba", captain: "Pedro Santos",  email: "kumintang@besmart.gov.ph",   totalBins: 20, activeResidents: 175, status: "active",   lastActivity: "2026-05-16" },
  { id: "br4", name: "Brgy. Pallocan West",   captain: "Ana Cruz",      email: "pallocan@besmart.gov.ph",    totalBins: 24, activeResidents: 210, status: "inactive", lastActivity: "2026-05-10" },
];

// ── Dashboard Stats ────────────────────────────────────────────────────────────
export const DASHBOARD_STATS = {
  totalBins:      84,
  fullBins:       12,
  collectedToday: 9,
  activeTrucks:   3,
};

// ── Bins (cluster-scoped) ─────────────────────────────────────────────────────
export const BINS = [
  { id: "b1",  name: "Bin A-01", street: "P. Burgos St.",      barangay: "Alangilan",        status: "full",      timeReported: "2026-05-18T06:12:00Z", posX: 0.28, posY: 0.22 },
  { id: "b2",  name: "Bin A-02", street: "Rizal Ave.",         barangay: "Alangilan",        status: "ok",        timeReported: null,                   posX: 0.32, posY: 0.30 },
  { id: "b3",  name: "Bin B-01", street: "Evangelista St.",    barangay: "Cuta",             status: "full",      timeReported: "2026-05-18T07:45:00Z", posX: 0.45, posY: 0.18 },
  { id: "b4",  name: "Bin B-02", street: "Mabini St.",         barangay: "Cuta",             status: "collected", timeReported: "2026-05-18T05:30:00Z", posX: 0.50, posY: 0.25 },
  { id: "b5",  name: "Bin C-01", street: "Kumintang Road",     barangay: "Kumintang Ibaba",  status: "full",      timeReported: "2026-05-18T08:00:00Z", posX: 0.60, posY: 0.35 },
  { id: "b6",  name: "Bin C-02", street: "Kumintang Road",     barangay: "Kumintang Ibaba",  status: "ok",        timeReported: null,                   posX: 0.65, posY: 0.40 },
  { id: "b7",  name: "Bin D-01", street: "Pallocan West Ave.", barangay: "Pallocan West",    status: "missed",    timeReported: "2026-05-17T14:00:00Z", posX: 0.22, posY: 0.65 },
  { id: "b8",  name: "Bin D-02", street: "Pallocan West Ave.", barangay: "Pallocan West",    status: "full",      timeReported: "2026-05-18T08:30:00Z", posX: 0.18, posY: 0.70 },
];

// ── Trucks ─────────────────────────────────────────────────────────────────────
export const TRUCKS = [
  { id: "t1", label: "Truck 01", status: "en_route", posX: 0.35, posY: 0.26 },
  { id: "t2", label: "Truck 02", status: "en_route", posX: 0.55, posY: 0.38 },
  { id: "t3", label: "Truck 03", status: "idle",     posX: 0.20, posY: 0.50 },
];

// ── Collectors / Drivers ───────────────────────────────────────────────────────
export const COLLECTORS = [
  { id: "col1", name: "Pedro Santos",   collectorId: "COL-2024-0042", assignedTruck: "Truck 01", zone: "Alangilan",       status: "on_route",  schedule: "Mon–Fri, 6:00 AM", lastActive: "2026-05-18T08:00:00Z" },
  { id: "col2", name: "Maria Reyes",    collectorId: "COL-2024-0043", assignedTruck: "Truck 02", zone: "Cuta",            status: "on_route",  schedule: "Mon–Fri, 6:00 AM", lastActive: "2026-05-18T07:30:00Z" },
  { id: "col3", name: "Jose Cruz",      collectorId: "COL-2024-0044", assignedTruck: "Truck 03", zone: "Kumintang Ibaba", status: "active",    schedule: "Mon–Sat, 7:00 AM", lastActive: "2026-05-17T18:00:00Z" },
  { id: "col4", name: "Ana Mendoza",    collectorId: "COL-2024-0045", assignedTruck: "Truck 04", zone: "Pallocan West",   status: "off_duty",  schedule: "Tue–Sat, 6:00 AM", lastActive: "2026-05-16T09:00:00Z" },
  { id: "col5", name: "Carlos Lim",     collectorId: "COL-2024-0046", assignedTruck: "Truck 05", zone: "Alangilan",       status: "active",    schedule: "Mon–Fri, 6:00 AM", lastActive: "2026-05-18T06:45:00Z" },
];

// ── Active Route (received from Super Admin) ───────────────────────────────────
export const ACTIVE_ROUTE = {
  routeId: "RT-2025-006",
  receivedFrom: "Super Admin",
  receivedAt: "2026-05-18T05:05:00Z",
  bins: ["b1", "b3", "b5"],
  distanceKm: 4.7,
  estimatedMinutes: 38,
  order: [
    { label: "Truck Depot", type: "depot", posX: 0.10, posY: 0.85 },
    { binId: "b3", label: "Bin B-01", street: "Evangelista St.",  posX: 0.45, posY: 0.18 },
    { binId: "b1", label: "Bin A-01", street: "P. Burgos St.",    posX: 0.28, posY: 0.22 },
    { binId: "b5", label: "Bin C-01", street: "Kumintang Road",   posX: 0.60, posY: 0.35 },
  ],
};

// ── Notifications ──────────────────────────────────────────────────────────────
export const NOTIFICATIONS = [
  { id: "n1", type: "announcement", title: "System Maintenance Tonight",     body: "The BE-SMART system will undergo scheduled maintenance from 11 PM to 1 AM.", target: "cluster", priority: "urgent",  sentAt: "2026-05-18T09:00:00Z", read: false, from: "Super Admin" },
  { id: "n2", type: "route",        title: "Route RT-2025-006 Received",     body: "A new collection route has been sent to your cluster. 3 bins scheduled.",    target: "cluster", priority: "normal",  sentAt: "2026-05-18T05:05:00Z", read: true,  from: "Super Admin" },
  { id: "n3", type: "report",       title: "Weekly Collection Report Ready", body: "The weekly collection summary for May 11–17 is now available in Reports.",   target: "cluster", priority: "normal",  sentAt: "2026-05-17T17:00:00Z", read: false, from: "Super Admin" },
  { id: "n4", type: "announcement", title: "New Eco Token Policy Effective", body: "Updated Eco Token reward rates are now active across all clusters.",          target: "cluster", priority: "normal",  sentAt: "2026-05-16T08:00:00Z", read: true,  from: "Super Admin" },
];

// ── Recent Activity ────────────────────────────────────────────────────────────
export const RECENT_ACTIVITY = [
  { id: "a1", event: "bin_reported",         description: "Bin D-02 (Pallocan West) reported full by resident",   timestamp: "2026-05-18T08:30:00Z" },
  { id: "a2", event: "route_received",       description: "Route RT-2025-006 received from Super Admin",          timestamp: "2026-05-18T05:05:00Z" },
  { id: "a3", event: "collection_confirmed", description: "Bin B-02 (Cuta) marked as collected by Truck 01",      timestamp: "2026-05-18T08:20:00Z" },
  { id: "a4", event: "bin_reported",         description: "Bin C-01 (Kumintang Ibaba) reported full by resident", timestamp: "2026-05-18T08:00:00Z" },
  { id: "a5", event: "barangay_created",     description: "Barangay account Brgy. Cuta updated by Cluster Admin", timestamp: "2026-05-17T14:00:00Z" },
];

// ── Barangay Leaderboard ───────────────────────────────────────────────────────
export const LEADERBOARD = [
  { rank: 1, barangay: "Brgy. Cuta",            binsReported: 8, binsCollected: 8, rate: 100 },
  { rank: 2, barangay: "Brgy. Alangilan",        binsReported: 6, binsCollected: 5, rate: 83  },
  { rank: 3, barangay: "Brgy. Kumintang Ibaba",  binsReported: 5, binsCollected: 4, rate: 80  },
  { rank: 4, barangay: "Brgy. Pallocan West",    binsReported: 4, binsCollected: 2, rate: 50  },
];

// ── Status Color Map ───────────────────────────────────────────────────────────
export const STATUS_COLORS = {
  full:        "#DC2626",
  collected:   "#2E7D32",
  missed:      "#D97706",
  ok:          "#2E7D32",
  on_route:    "#1976D2",
  active:      "#2E7D32",
  off_duty:    "#9CA3AF",
  en_route:    "#1976D2",
  idle:        "#6B7280",
  at_depot:    "#9CA3AF",
};

// ── Mock Credentials ───────────────────────────────────────────────────────────
export const MOCK_CREDENTIALS = {
  email: "cluster1@besmart.gov.ph",
  password: "cluster123",
};

