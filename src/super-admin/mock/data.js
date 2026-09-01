// ─── BE-SMART Super Admin Mock Data ───────────────────────────────────────────
// Single-cluster architecture — Batangas City.

// ── Barangay Accounts — full records for CRUD ─────────────────────────────────
// status: 'active' | 'inactive'
export const BARANGAY_ACCOUNTS = [
  { id: "ba1",  name: "Brgy. Alangilan",        captain: "Jose Reyes",        email: "alangilan@besmart.gov.ph",        totalBins: 18, activeResidents: 142, status: "active",   lastActivity: "2025-05-18" },
  { id: "ba2",  name: "Brgy. Cuta",             captain: "Maria Lim",         email: "cuta@besmart.gov.ph",             totalBins: 22, activeResidents: 198, status: "active",   lastActivity: "2025-05-18" },
  { id: "ba3",  name: "Brgy. Kumintang Ibaba",  captain: "Pedro Santos",      email: "kumintang.ibaba@besmart.gov.ph",  totalBins: 20, activeResidents: 175, status: "active",   lastActivity: "2025-05-16" },
  { id: "ba4",  name: "Brgy. Kumintang Ilaya",  captain: "Rosa Dela Cruz",    email: "kumintang.ilaya@besmart.gov.ph",  totalBins: 16, activeResidents: 130, status: "active",   lastActivity: "2025-05-17" },
  { id: "ba5",  name: "Brgy. Libjo",            captain: "Carlos Navarro",    email: "libjo@besmart.gov.ph",            totalBins: 14, activeResidents: 118, status: "active",   lastActivity: "2025-05-15" },
  { id: "ba6",  name: "Brgy. Sta. Clara",       captain: "Lorna Bautista",    email: "sta.clara@besmart.gov.ph",        totalBins: 12, activeResidents: 102, status: "inactive", lastActivity: "2025-05-10" },
  { id: "ba7",  name: "Brgy. Pallocan West",    captain: "Ana Cruz",          email: "pallocan.west@besmart.gov.ph",    totalBins: 24, activeResidents: 210, status: "active",   lastActivity: "2025-05-18" },
  { id: "ba8",  name: "Brgy. Pallocan East",    captain: "Ramon Torres",      email: "pallocan.east@besmart.gov.ph",    totalBins: 19, activeResidents: 165, status: "active",   lastActivity: "2025-05-17" },
  { id: "ba9",  name: "Brgy. Bolbok",           captain: "Nena Villanueva",   email: "bolbok@besmart.gov.ph",           totalBins: 11, activeResidents: 95,  status: "inactive", lastActivity: "2025-05-08" },
  { id: "ba10", name: "Brgy. Sta. Rita Karsada",captain: "Ernesto Pascual",   email: "sta.rita@besmart.gov.ph",         totalBins: 15, activeResidents: 128, status: "active",   lastActivity: "2025-05-16" },
  { id: "ba11", name: "Brgy. Gulod Labac",      captain: "Teresita Ramos",    email: "gulod.labac@besmart.gov.ph",      totalBins: 13, activeResidents: 110, status: "active",   lastActivity: "2025-05-14" },
  { id: "ba12", name: "Brgy. Dumuclay",         captain: "Alfredo Mendoza",   email: "dumuclay@besmart.gov.ph",         totalBins: 10, activeResidents: 88,  status: "inactive", lastActivity: "2025-05-05" },
  { id: "ba13", name: "Brgy. Balagtas",         captain: "Gloria Castillo",   email: "balagtas@besmart.gov.ph",         totalBins: 17, activeResidents: 145, status: "active",   lastActivity: "2025-05-18" },
  { id: "ba14", name: "Brgy. Calicanto",        captain: "Rodrigo Aquino",    email: "calicanto@besmart.gov.ph",        totalBins: 15, activeResidents: 132, status: "active",   lastActivity: "2025-05-17" },
  { id: "ba15", name: "Brgy. Tinga Labac",      captain: "Marites Fernandez", email: "tinga.labac@besmart.gov.ph",      totalBins: 12, activeResidents: 98,  status: "active",   lastActivity: "2025-05-15" },
];

// ── Dashboard Stats ────────────────────────────────────────────────────────────
export const DASHBOARD_STATS = {
  totalBins:      248,
  fullBins:        31,
  collectedToday:  18,
  activeTrucks:     7,
};

// ── Bins ──────────────────────────────────────────────────────────────────────
export const BINS = [
  { id: "b1",  name: "Bin A-01", street: "P. Burgos St.",       barangay: "Alangilan",        status: "full",      reportedBy: "resident_01", timeReported: "2025-05-18T06:12:00Z", posX: 0.28, posY: 0.22 },
  { id: "b2",  name: "Bin A-02", street: "Rizal Ave.",          barangay: "Alangilan",        status: "ok",        reportedBy: null,          timeReported: null,                   posX: 0.32, posY: 0.30 },
  { id: "b3",  name: "Bin B-01", street: "Evangelista St.",     barangay: "Cuta",             status: "full",      reportedBy: "resident_02", timeReported: "2025-05-18T07:45:00Z", posX: 0.45, posY: 0.18 },
  { id: "b4",  name: "Bin B-02", street: "Mabini St.",          barangay: "Cuta",             status: "collected", reportedBy: "resident_03", timeReported: "2025-05-18T05:30:00Z", posX: 0.50, posY: 0.25 },
  { id: "b5",  name: "Bin C-01", street: "Kumintang Road",      barangay: "Kumintang Ibaba",  status: "full",      reportedBy: "resident_04", timeReported: "2025-05-18T08:00:00Z", posX: 0.60, posY: 0.35 },
  { id: "b6",  name: "Bin C-02", street: "Kumintang Road",      barangay: "Kumintang Ibaba",  status: "ok",        reportedBy: null,          timeReported: null,                   posX: 0.65, posY: 0.40 },
  { id: "b7",  name: "Bin D-01", street: "Ilaya Rd.",           barangay: "Kumintang Ilaya",  status: "missed",    reportedBy: "resident_05", timeReported: "2025-05-17T14:00:00Z", posX: 0.70, posY: 0.28 },
  { id: "b8",  name: "Bin D-02", street: "Ilaya Rd.",           barangay: "Kumintang Ilaya",  status: "full",      reportedBy: "resident_06", timeReported: "2025-05-18T09:10:00Z", posX: 0.75, posY: 0.32 },
  { id: "b9",  name: "Bin E-01", street: "Libjo Main St.",      barangay: "Libjo",            status: "ok",        reportedBy: null,          timeReported: null,                   posX: 0.38, posY: 0.55 },
  { id: "b10", name: "Bin E-02", street: "Libjo Main St.",      barangay: "Libjo",            status: "full",      reportedBy: "resident_07", timeReported: "2025-05-18T07:00:00Z", posX: 0.42, posY: 0.60 },
  { id: "b11", name: "Bin F-01", street: "Pallocan West Ave.",  barangay: "Pallocan West",    status: "collected", reportedBy: "resident_08", timeReported: "2025-05-18T06:00:00Z", posX: 0.22, posY: 0.65 },
  { id: "b12", name: "Bin F-02", street: "Pallocan West Ave.",  barangay: "Pallocan West",    status: "full",      reportedBy: "resident_09", timeReported: "2025-05-18T08:30:00Z", posX: 0.18, posY: 0.70 },
  { id: "b13", name: "Bin G-01", street: "Pallocan East Rd.",   barangay: "Pallocan East",    status: "ok",        reportedBy: null,          timeReported: null,                   posX: 0.55, posY: 0.68 },
  { id: "b14", name: "Bin G-02", street: "Pallocan East Rd.",   barangay: "Pallocan East",    status: "full",      reportedBy: "resident_10", timeReported: "2025-05-18T09:45:00Z", posX: 0.58, posY: 0.72 },
  { id: "b15", name: "Bin H-01", street: "Sta. Rita Road",      barangay: "Sta. Rita Karsada",status: "missed",    reportedBy: "resident_11", timeReported: "2025-05-17T16:00:00Z", posX: 0.80, posY: 0.60 },
  { id: "b16", name: "Bin H-02", street: "Sta. Rita Road",      barangay: "Sta. Rita Karsada",status: "full",      reportedBy: "resident_12", timeReported: "2025-05-18T10:00:00Z", posX: 0.84, posY: 0.65 },
];

// ── Trucks ─────────────────────────────────────────────────────────────────────
export const TRUCKS = [
  { id: "t1", label: "Truck 01", status: "en_route", posX: 0.35, posY: 0.26 },
  { id: "t2", label: "Truck 02", status: "en_route", posX: 0.62, posY: 0.38 },
  { id: "t3", label: "Truck 03", status: "idle",     posX: 0.20, posY: 0.50 },
  { id: "t4", label: "Truck 04", status: "at_depot", posX: 0.10, posY: 0.85 },
  { id: "t5", label: "Truck 05", status: "idle",     posX: 0.50, posY: 0.80 },
  { id: "t6", label: "Truck 06", status: "en_route", posX: 0.78, posY: 0.55 },
  { id: "t7", label: "Truck 07", status: "at_depot", posX: 0.12, posY: 0.88 },
];

// ── MRF Locations ──────────────────────────────────────────────────────────────
export const MRF_LOCATIONS = [
  { id: "m1", name: "MRF Alangilan",       barangay: "Alangilan",       status: "available", posX: 0.30, posY: 0.15 },
  { id: "m2", name: "MRF Cuta",            barangay: "Cuta",            status: "full",      posX: 0.48, posY: 0.20 },
  { id: "m3", name: "MRF Kumintang Ibaba", barangay: "Kumintang Ibaba", status: "available", posX: 0.63, posY: 0.30 },
  { id: "m4", name: "MRF Libjo",           barangay: "Libjo",           status: "available", posX: 0.40, posY: 0.58 },
  { id: "m5", name: "MRF Pallocan West",   barangay: "Pallocan West",   status: "full",      posX: 0.20, posY: 0.68 },
];

// ── Collection Routes ──────────────────────────────────────────────────────────
export const ROUTES = [
  { id: "r1", routeId: "RT-2025-001", date: "2025-05-18", bins: ["b1", "b3", "b4"],          distanceKm: 4.2, estimatedMinutes: 35, sentTo: "Juan dela Cruz", status: "completed",   optimizedAt: "2025-05-18T05:00:00Z", sentAt: "2025-05-18T05:05:00Z" },
  { id: "r2", routeId: "RT-2025-002", date: "2025-05-18", bins: ["b5", "b7", "b8"],          distanceKm: 5.8, estimatedMinutes: 48, sentTo: "Maria Santos",   status: "in_progress", optimizedAt: "2025-05-18T06:00:00Z", sentAt: "2025-05-18T06:10:00Z" },
  { id: "r3", routeId: "RT-2025-003", date: "2025-05-17", bins: ["b9", "b10", "b11", "b12"], distanceKm: 6.1, estimatedMinutes: 52, sentTo: "Pedro Reyes",    status: "completed",   optimizedAt: "2025-05-17T05:30:00Z", sentAt: "2025-05-17T05:35:00Z" },
  { id: "r4", routeId: "RT-2025-004", date: "2025-05-17", bins: ["b13", "b14"],              distanceKm: 3.0, estimatedMinutes: 25, sentTo: "Ana Lim",        status: "delivered",   optimizedAt: "2025-05-17T06:00:00Z", sentAt: "2025-05-17T06:05:00Z" },
  { id: "r5", routeId: "RT-2025-005", date: "2025-05-16", bins: ["b15", "b16"],              distanceKm: 2.5, estimatedMinutes: 20, sentTo: "Carlos Mendoza", status: "completed",   optimizedAt: "2025-05-16T05:00:00Z", sentAt: "2025-05-16T05:08:00Z" },
];

// ── Optimized Route (current session) ─────────────────────────────────────────
export const OPTIMIZED_ROUTE = {
  routeId:          "RT-2025-006",
  bins:             ["b1", "b3", "b12"],
  distanceKm:       4.7,
  estimatedMinutes: 38,
  algorithm:        "Nearest Neighbor",
  optimizedAt:      "2025-05-18T10:30:00Z",
  order: [
    { label: "Truck Depot", type: "depot", posX: 0.10, posY: 0.85 },
    { binId: "b3", label: "Bin B-01", street: "Evangelista St.", posX: 0.45, posY: 0.18 },
    { binId: "b1", label: "Bin A-01", street: "P. Burgos St.",   posX: 0.28, posY: 0.22 },
    { binId: "b12", label: "Bin F-02", street: "Pallocan West Ave.", posX: 0.18, posY: 0.70 },
  ],
};

// ── Notifications / Announcements ─────────────────────────────────────────────
export const NOTIFICATIONS = [
  { id: "n1", type: "announcement", title: "System Maintenance Tonight",     body: "The BE-SMART system will undergo scheduled maintenance from 11 PM to 1 AM.", target: "all", priority: "urgent", sentAt: "2025-05-18T09:00:00Z", read: false },
  { id: "n2", type: "schedule",     title: "Route RT-2025-002 Dispatched",   body: "Collection route has been sent to Maria Santos. 3 bins scheduled.",          target: "all", priority: "normal", sentAt: "2025-05-18T06:10:00Z", read: true  },
  { id: "n3", type: "complete",     title: "Route RT-2025-001 Completed",    body: "Collection route completed successfully. 3 bins collected.",                  target: "all", priority: "normal", sentAt: "2025-05-18T08:45:00Z", read: true  },
  { id: "n4", type: "report",       title: "Weekly Collection Report Ready", body: "The weekly collection summary for May 11–17 is now available in Reports.",    target: "all", priority: "normal", sentAt: "2025-05-17T17:00:00Z", read: false },
  { id: "n5", type: "task",         title: "Missed Collection",              body: "Bin H-01 in Sta. Rita Karsada was not collected yesterday. Please reschedule.", target: "all", priority: "urgent", sentAt: "2025-05-17T16:30:00Z", read: false },
  { id: "n6", type: "announcement", title: "New Eco Token Policy Effective", body: "Updated Eco Token reward rates are now active starting today.",               target: "all", priority: "normal", sentAt: "2025-05-16T08:00:00Z", read: true  },
];

// ── Recent Activity Events ─────────────────────────────────────────────────────
export const RECENT_ACTIVITY = [
  { id: "a1", event: "bin_reported",         description: "Bin H-02 (Sta. Rita Karsada) reported full by resident",   timestamp: "2025-05-18T10:00:00Z" },
  { id: "a2", event: "route_sent",           description: "Route RT-2025-002 sent to Maria Santos",                   timestamp: "2025-05-18T06:10:00Z" },
  { id: "a3", event: "collection_confirmed", description: "Bin B-02 (Cuta) marked as collected by Truck 01",          timestamp: "2025-05-18T08:20:00Z" },
  { id: "a4", event: "route_completed",      description: "Route RT-2025-001 completed",                              timestamp: "2025-05-18T08:45:00Z" },
  { id: "a5", event: "bin_reported",         description: "Bin G-02 (Pallocan East) reported full by resident",       timestamp: "2025-05-18T09:45:00Z" },
  { id: "a6", event: "bin_reported",         description: "Bin C-01 (Kumintang Ibaba) reported full by resident",     timestamp: "2025-05-18T08:00:00Z" },
  { id: "a7", event: "collection_confirmed", description: "Bin F-01 (Pallocan West) marked as collected by Truck 03", timestamp: "2025-05-18T07:15:00Z" },
  { id: "a8", event: "route_sent",           description: "Route RT-2025-001 sent to Juan dela Cruz",                 timestamp: "2025-05-18T05:05:00Z" },
];

// ── Status Color Map ──────────────────────────────────────────────────────────
export const STATUS_COLORS = {
  full:        "#DC2626",
  collected:   "#2E7D32",
  missed:      "#D97706",
  ok:          "#2E7D32",
  available:   "#2E7D32",
  pending:     "#D97706",
  completed:   "#2E7D32",
  delivered:   "#2E7D32",
  in_progress: "#1976D2",
  en_route:    "#1976D2",
  idle:        "#6B7280",
  at_depot:    "#9CA3AF",
};

// ── Mock Credentials ───────────────────────────────────────────────────────────
export const MOCK_CREDENTIALS = {
  email:    "superadmin@besmart.gov.ph",
  password: "admin123",
};
