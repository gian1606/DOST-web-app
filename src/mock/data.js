// --- BE-SMART Super Admin Mock Data -------------------------------------------
// Mirrors the mobile app's data shapes for seamless future backend integration.
// Status strings, barangay names, and color mappings must stay in sync with mobile.

// -- Barangays (Batangas City) --------------------------------------------------
export const BARANGAYS = [
  "Alangilan",
  "Cuta",
  "Kumintang Ibaba",
  "Kumintang Ilaya",
  "Libjo",
  "Pallocan West",
  "Pallocan East",
  "Sta. Rita Karsada",
];

// -- Clusters ------------------------------------------------------------------
export const CLUSTERS = [
  { id: "c1", label: "Solid East" },
  { id: "c2", label: "Solid North" },
  { id: "c3", label: "Solid Poblacion" },
  { id: "c4", label: "Solid Baybay" },
  { id: "c5", label: "Solid Upland" },
];

// -- Dashboard Stats ------------------------------------------------------------
export const DASHBOARD_STATS = {
  totalBins: 248,
  fullBins: 31,
  collectedToday: 18,
  activeTrucks: 7,
};

// -- Bins ----------------------------------------------------------------------
// status: 'full' | 'ok' | 'collected' | 'missed'
// posX / posY: 0�1 percentage values (same as mobile)
export const BINS = [
  { id: "b1",  name: "Bin A-01", street: "P. Burgos St.",       barangay: "Alangilan",        cluster: "c1", status: "full",      reportedBy: "resident_01", timeReported: "2025-05-18T06:12:00Z", posX: 0.28, posY: 0.22 },
  { id: "b2",  name: "Bin A-02", street: "Rizal Ave.",          barangay: "Alangilan",        cluster: "c1", status: "ok",        reportedBy: null,          timeReported: null,                   posX: 0.32, posY: 0.30 },
  { id: "b3",  name: "Bin B-01", street: "Evangelista St.",     barangay: "Cuta",             cluster: "c1", status: "full",      reportedBy: "resident_02", timeReported: "2025-05-18T07:45:00Z", posX: 0.45, posY: 0.18 },
  { id: "b4",  name: "Bin B-02", street: "Mabini St.",          barangay: "Cuta",             cluster: "c1", status: "collected", reportedBy: "resident_03", timeReported: "2025-05-18T05:30:00Z", posX: 0.50, posY: 0.25 },
  { id: "b5",  name: "Bin C-01", street: "Kumintang Road",      barangay: "Kumintang Ibaba",  cluster: "c2", status: "full",      reportedBy: "resident_04", timeReported: "2025-05-18T08:00:00Z", posX: 0.60, posY: 0.35 },
  { id: "b6",  name: "Bin C-02", street: "Kumintang Road",      barangay: "Kumintang Ibaba",  cluster: "c2", status: "ok",        reportedBy: null,          timeReported: null,                   posX: 0.65, posY: 0.40 },
  { id: "b7",  name: "Bin D-01", street: "Ilaya Rd.",           barangay: "Kumintang Ilaya",  cluster: "c2", status: "missed",    reportedBy: "resident_05", timeReported: "2025-05-17T14:00:00Z", posX: 0.70, posY: 0.28 },
  { id: "b8",  name: "Bin D-02", street: "Ilaya Rd.",           barangay: "Kumintang Ilaya",  cluster: "c2", status: "full",      reportedBy: "resident_06", timeReported: "2025-05-18T09:10:00Z", posX: 0.75, posY: 0.32 },
  { id: "b9",  name: "Bin E-01", street: "Libjo Main St.",      barangay: "Libjo",            cluster: "c3", status: "ok",        reportedBy: null,          timeReported: null,                   posX: 0.38, posY: 0.55 },
  { id: "b10", name: "Bin E-02", street: "Libjo Main St.",      barangay: "Libjo",            cluster: "c3", status: "full",      reportedBy: "resident_07", timeReported: "2025-05-18T07:00:00Z", posX: 0.42, posY: 0.60 },
  { id: "b11", name: "Bin F-01", street: "Pallocan West Ave.",  barangay: "Pallocan West",    cluster: "c3", status: "collected", reportedBy: "resident_08", timeReported: "2025-05-18T06:00:00Z", posX: 0.22, posY: 0.65 },
  { id: "b12", name: "Bin F-02", street: "Pallocan West Ave.",  barangay: "Pallocan West",    cluster: "c3", status: "full",      reportedBy: "resident_09", timeReported: "2025-05-18T08:30:00Z", posX: 0.18, posY: 0.70 },
  { id: "b13", name: "Bin G-01", street: "Pallocan East Rd.",   barangay: "Pallocan East",    cluster: "c4", status: "ok",        reportedBy: null,          timeReported: null,                   posX: 0.55, posY: 0.68 },
  { id: "b14", name: "Bin G-02", street: "Pallocan East Rd.",   barangay: "Pallocan East",    cluster: "c4", status: "full",      reportedBy: "resident_10", timeReported: "2025-05-18T09:45:00Z", posX: 0.58, posY: 0.72 },
  { id: "b15", name: "Bin H-01", street: "Sta. Rita Road",      barangay: "Sta. Rita Karsada",cluster: "c5", status: "missed",    reportedBy: "resident_11", timeReported: "2025-05-17T16:00:00Z", posX: 0.80, posY: 0.60 },
  { id: "b16", name: "Bin H-02", street: "Sta. Rita Road",      barangay: "Sta. Rita Karsada",cluster: "c5", status: "full",      reportedBy: "resident_12", timeReported: "2025-05-18T10:00:00Z", posX: 0.84, posY: 0.65 },
];

// -- Trucks ---------------------------------------------------------------------
// status: 'en_route' | 'idle' | 'at_depot'
export const TRUCKS = [
  { id: "t1", label: "Truck 01", status: "en_route", posX: 0.35, posY: 0.26 },
  { id: "t2", label: "Truck 02", status: "en_route", posX: 0.62, posY: 0.38 },
  { id: "t3", label: "Truck 03", status: "idle",     posX: 0.20, posY: 0.50 },
  { id: "t4", label: "Truck 04", status: "at_depot", posX: 0.10, posY: 0.85 },
  { id: "t5", label: "Truck 05", status: "idle",     posX: 0.50, posY: 0.80 },
  { id: "t6", label: "Truck 06", status: "en_route", posX: 0.78, posY: 0.55 },
  { id: "t7", label: "Truck 07", status: "at_depot", posX: 0.12, posY: 0.88 },
];

// -- MRF Locations --------------------------------------------------------------
// status: 'available' | 'full'
export const MRF_LOCATIONS = [
  { id: "m1", name: "MRF Alangilan",        barangay: "Alangilan",        cluster: "c1", status: "available", posX: 0.30, posY: 0.15 },
  { id: "m2", name: "MRF Cuta",             barangay: "Cuta",             cluster: "c1", status: "full",      posX: 0.48, posY: 0.20 },
  { id: "m3", name: "MRF Kumintang Ibaba",  barangay: "Kumintang Ibaba",  cluster: "c2", status: "available", posX: 0.63, posY: 0.30 },
  { id: "m4", name: "MRF Libjo",            barangay: "Libjo",            cluster: "c3", status: "available", posX: 0.40, posY: 0.58 },
  { id: "m5", name: "MRF Pallocan West",    barangay: "Pallocan West",    cluster: "c3", status: "full",      posX: 0.20, posY: 0.68 },
];

// -- Collection Routes ----------------------------------------------------------
// status: 'delivered' | 'in_progress' | 'completed'
export const ROUTES = [
  {
    id: "r1",
    routeId: "RT-2025-001",
    date: "2025-05-18",
    cluster: "c1",
    bins: ["b1", "b3", "b4"],
    distanceKm: 4.2,
    estimatedMinutes: 35,
    sentTo: "Juan dela Cruz",
    status: "completed",
    optimizedAt: "2025-05-18T05:00:00Z",
    sentAt: "2025-05-18T05:05:00Z",
  },
  {
    id: "r2",
    routeId: "RT-2025-002",
    date: "2025-05-18",
    cluster: "c2",
    bins: ["b5", "b7", "b8"],
    distanceKm: 5.8,
    estimatedMinutes: 48,
    sentTo: "Maria Santos",
    status: "in_progress",
    optimizedAt: "2025-05-18T06:00:00Z",
    sentAt: "2025-05-18T06:10:00Z",
  },
  {
    id: "r3",
    routeId: "RT-2025-003",
    date: "2025-05-17",
    cluster: "c3",
    bins: ["b9", "b10", "b11", "b12"],
    distanceKm: 6.1,
    estimatedMinutes: 52,
    sentTo: "Pedro Reyes",
    status: "completed",
    optimizedAt: "2025-05-17T05:30:00Z",
    sentAt: "2025-05-17T05:35:00Z",
  },
  {
    id: "r4",
    routeId: "RT-2025-004",
    date: "2025-05-17",
    cluster: "c4",
    bins: ["b13", "b14"],
    distanceKm: 3.0,
    estimatedMinutes: 25,
    sentTo: "Ana Lim",
    status: "delivered",
    optimizedAt: "2025-05-17T06:00:00Z",
    sentAt: "2025-05-17T06:05:00Z",
  },
  {
    id: "r5",
    routeId: "RT-2025-005",
    date: "2025-05-16",
    cluster: "c5",
    bins: ["b15", "b16"],
    distanceKm: 2.5,
    estimatedMinutes: 20,
    sentTo: "Carlos Mendoza",
    status: "completed",
    optimizedAt: "2025-05-16T05:00:00Z",
    sentAt: "2025-05-16T05:08:00Z",
  },
];

// -- Optimized Route (current session) -----------------------------------------
export const OPTIMIZED_ROUTE = {
  routeId: "RT-2025-006",
  cluster: "c1",
  bins: ["b1", "b3", "b12"],
  distanceKm: 4.7,
  estimatedMinutes: 38,
  algorithm: "Nearest Neighbor",
  optimizedAt: "2025-05-18T10:30:00Z",
  order: [
    { label: "Truck Depot", type: "depot", posX: 0.10, posY: 0.85 },
    { binId: "b3", label: "Bin B-01", street: "Evangelista St.", posX: 0.45, posY: 0.18 },
    { binId: "b1", label: "Bin A-01", street: "P. Burgos St.",   posX: 0.28, posY: 0.22 },
    { binId: "b12", label: "Bin F-02", street: "Pallocan West Ave.", posX: 0.18, posY: 0.70 },
  ],
};

// -- Cluster Admin Users --------------------------------------------------------
// role: 'cluster_admin'
// status: 'active' | 'inactive'
export const CLUSTER_ADMINS = [
  { id: "u1", name: "Juan dela Cruz",   email: "juan.delacruz@besmart.gov.ph",   assignedCluster: "c1", role: "cluster_admin", status: "active",   lastLogin: "2025-05-18T08:00:00Z" },
  { id: "u2", name: "Maria Santos",     email: "maria.santos@besmart.gov.ph",    assignedCluster: "c2", role: "cluster_admin", status: "active",   lastLogin: "2025-05-18T07:30:00Z" },
  { id: "u3", name: "Pedro Reyes",      email: "pedro.reyes@besmart.gov.ph",     assignedCluster: "c3", role: "cluster_admin", status: "active",   lastLogin: "2025-05-17T18:00:00Z" },
  { id: "u4", name: "Ana Lim",          email: "ana.lim@besmart.gov.ph",         assignedCluster: "c4", role: "cluster_admin", status: "inactive", lastLogin: "2025-05-10T09:00:00Z" },
  { id: "u5", name: "Carlos Mendoza",   email: "carlos.mendoza@besmart.gov.ph",  assignedCluster: "c5", role: "cluster_admin", status: "active",   lastLogin: "2025-05-18T06:45:00Z" },
];

// -- Notifications / Announcements ---------------------------------------------
// type: 'task' | 'schedule' | 'complete' | 'report' | 'announcement'
// priority: 'normal' | 'urgent'
export const NOTIFICATIONS = [
  { id: "n1", type: "announcement", title: "System Maintenance Tonight",       body: "The BE-SMART system will undergo scheduled maintenance from 11 PM to 1 AM. Please complete all route assignments before 10 PM.", target: "all",  priority: "urgent",  sentAt: "2025-05-18T09:00:00Z", read: false },
  { id: "n2", type: "schedule",     title: "Route RT-2025-002 Dispatched",     body: "Collection route for Cluster 2 has been sent to Maria Santos. 3 bins scheduled.", target: "c2",   priority: "normal",  sentAt: "2025-05-18T06:10:00Z", read: true  },
  { id: "n3", type: "complete",     title: "Route RT-2025-001 Completed",      body: "Cluster 1 collection route completed successfully. 3 bins collected.", target: "c1",   priority: "normal",  sentAt: "2025-05-18T08:45:00Z", read: true  },
  { id: "n4", type: "report",       title: "Weekly Collection Report Ready",   body: "The weekly collection summary for May 11�17 is now available in Reports.", target: "all",  priority: "normal",  sentAt: "2025-05-17T17:00:00Z", read: false },
  { id: "n5", type: "task",         title: "Missed Collection � Cluster 5",    body: "Bin H-01 in Sta. Rita Karsada was not collected yesterday. Please reschedule.", target: "c5",   priority: "urgent",  sentAt: "2025-05-17T16:30:00Z", read: false },
  { id: "n6", type: "announcement", title: "New Eco Token Policy Effective",   body: "Updated Eco Token reward rates are now active across all clusters starting today.", target: "all",  priority: "normal",  sentAt: "2025-05-16T08:00:00Z", read: true  },
];

// -- Recent Activity Events -----------------------------------------------------
// event: 'bin_reported' | 'collection_confirmed' | 'route_sent' | 'route_completed'
export const RECENT_ACTIVITY = [
  { id: "a1", event: "bin_reported",        description: "Bin H-02 (Sta. Rita Karsada) reported full by resident",    timestamp: "2025-05-18T10:00:00Z" },
  { id: "a2", event: "route_sent",          description: "Route RT-2025-002 sent to Maria Santos (Cluster 2)",        timestamp: "2025-05-18T06:10:00Z" },
  { id: "a3", event: "collection_confirmed",description: "Bin B-02 (Cuta) marked as collected by Truck 01",           timestamp: "2025-05-18T08:20:00Z" },
  { id: "a4", event: "route_completed",     description: "Route RT-2025-001 completed � Cluster 1",                   timestamp: "2025-05-18T08:45:00Z" },
  { id: "a5", event: "bin_reported",        description: "Bin G-02 (Pallocan East) reported full by resident",        timestamp: "2025-05-18T09:45:00Z" },
  { id: "a6", event: "bin_reported",        description: "Bin C-01 (Kumintang Ibaba) reported full by resident",      timestamp: "2025-05-18T08:00:00Z" },
  { id: "a7", event: "collection_confirmed",description: "Bin F-01 (Pallocan West) marked as collected by Truck 03",  timestamp: "2025-05-18T07:15:00Z" },
  { id: "a8", event: "route_sent",          description: "Route RT-2025-001 sent to Juan dela Cruz (Cluster 1)",      timestamp: "2025-05-18T05:05:00Z" },
];

// -- Status Color Map (must match mobile app exactly) --------------------------
export const STATUS_COLORS = {
  full:      "#DC2626",
  collected: "#2E7D32",
  missed:    "#D97706",
  ok:        "#2E7D32",
  available: "#2E7D32",
  pending:   "#D97706",
  completed: "#2E7D32",
  delivered: "#2E7D32",
  in_progress: "#1976D2",
  en_route:  "#1976D2",
  idle:      "#6B7280",
  at_depot:  "#9CA3AF",
};

// -- Mock Credentials -----------------------------------------------------------
export const MOCK_CREDENTIALS = {
  email: "superadmin@besmart.gov.ph",
  password: "admin123",
};


// -- Punong Barangay Credentials -----------------------------------------------
export const PB_CREDENTIALS = {
  name:     "Hon. Juan dela Cruz",
  barangay: "Brgy. Alangilan",
  email:    "punongbarangay@besmart.gov.ph",
  password: "pb123",
};

// --- Collector Admin Mock Data -------------------------------------------------

export const CA_CREDENTIALS = {
  email: "collector.admin@besmart.gov.ph",
  password: "collector123",
  name: "Juan dela Cruz",
  assignedCluster: "c1",
};

// -- Collectors (field workers) -------------------------------------------------
export const COLLECTORS = [
  { id: "col1", name: "Ramon Dela Torre",  email: "ramon.delatorre@besmart.gov.ph",  cluster: "c1", role: "collector", status: "active",   lastLogin: "2025-05-18T07:00:00Z", assignedTruck: "ct1" },
  { id: "col2", name: "Efren Magpayo",     email: "efren.magpayo@besmart.gov.ph",    cluster: "c1", role: "collector", status: "active",   lastLogin: "2025-05-18T06:50:00Z", assignedTruck: "ct1" },
  { id: "col3", name: "Dante Villanueva",  email: "dante.villanueva@besmart.gov.ph", cluster: "c1", role: "collector", status: "active",   lastLogin: "2025-05-17T18:00:00Z", assignedTruck: "ct2" },
  { id: "col4", name: "Noel Castillo",     email: "noel.castillo@besmart.gov.ph",    cluster: "c1", role: "collector", status: "inactive", lastLogin: "2025-05-10T08:00:00Z", assignedTruck: null  },
  { id: "col5", name: "Arnel Bautista",    email: "arnel.bautista@besmart.gov.ph",   cluster: "c1", role: "collector", status: "active",   lastLogin: "2025-05-18T07:10:00Z", assignedTruck: "ct3" },
  { id: "col6", name: "Rodel Fernandez",   email: "rodel.fernandez@besmart.gov.ph",  cluster: "c1", role: "collector", status: "active",   lastLogin: "2025-05-18T07:05:00Z", assignedTruck: "ct3" },
];

// -- Collector Units ------------------------------------------------------------
export const COLLECTOR_UNITS = [
  { id: "ct1", name: "Unit Alpha",   plateNumber: "BTC-1021", cluster: "c1", status: "en_route", collectorIds: ["col1", "col2"], posX: 0.35, posY: 0.26 },
  { id: "ct2", name: "Unit Bravo",   plateNumber: "BTC-1034", cluster: "c1", status: "idle",     collectorIds: ["col3"],         posX: 0.20, posY: 0.50 },
  { id: "ct3", name: "Unit Charlie", plateNumber: "BTC-1047", cluster: "c1", status: "at_depot", collectorIds: ["col5", "col6"], posX: 0.10, posY: 0.85 },
];

// -- Incoming Optimized Route (sent by Super Admin to Collector Admin) ----------
export const CA_INCOMING_ROUTE = {
  routeId: "RT-2025-006",
  cluster: "c1",
  sentBy: "Super Admin",
  sentAt: "2025-05-18T10:30:00Z",
  bins: ["b1", "b3", "b12"],
  distanceKm: 4.7,
  estimatedMinutes: 38,
  algorithm: "Nearest Neighbor",
  optimizedAt: "2025-05-18T10:30:00Z",
  status: "delivered",
  order: [
    { label: "Truck Depot", type: "depot", posX: 0.10, posY: 0.85 },
    { binId: "b3", label: "Bin B-01", street: "Evangelista St.", posX: 0.45, posY: 0.18 },
    { binId: "b1", label: "Bin A-01", street: "P. Burgos St.",   posX: 0.28, posY: 0.22 },
    { binId: "b12", label: "Bin F-02", street: "Pallocan West Ave.", posX: 0.18, posY: 0.70 },
  ],
};

export const CA_DASHBOARD_STATS = {
  totalBins: 16,
  fullBins: 5,
  collectedToday: 4,
  activeUnits: 3,
};

export const CA_RECENT_ACTIVITY = [
  { id: "ca1", event: "route_sent",          description: "Optimized route RT-2025-006 received from Super Admin",      timestamp: "2025-05-18T10:30:00Z" },
  { id: "ca2", event: "collection_confirmed",description: "Bin B-02 (Cuta) marked as collected by Unit Alpha",          timestamp: "2025-05-18T08:20:00Z" },
  { id: "ca3", event: "bin_reported",        description: "Bin A-01 (Alangilan) reported full by resident",             timestamp: "2025-05-18T06:12:00Z" },
  { id: "ca4", event: "collection_confirmed",description: "Bin F-01 (Pallocan West) marked as collected by Unit Bravo", timestamp: "2025-05-18T07:15:00Z" },
  { id: "ca5", event: "route_completed",     description: "Route RT-2025-005 completed - all bins collected",           timestamp: "2025-05-17T14:00:00Z" },
  { id: "ca6", event: "bin_reported",        description: "Bin B-01 (Cuta) reported full by resident",                  timestamp: "2025-05-18T07:45:00Z" },
];

// -- Rewards --------------------------------------------------------------------
export const REWARDS = [
  { id: "rw1", name: "Lucky Me! Canton (5-pack)",  pointsCost: 30,  stock: 80,  status: "available",   description: "5-pack instant canton noodles, assorted flavors." },
  { id: "rw2", name: "Rice (1 kg)",                pointsCost: 50,  stock: 60,  status: "available",   description: "1 kilogram of well-milled white rice." },
  { id: "rw3", name: "Canned Sardines (3-pack)",   pointsCost: 40,  stock: 50,  status: "available",   description: "3 cans of sardines in tomato sauce." },
  { id: "rw4", name: "Cooking Oil (250 ml)",       pointsCost: 60,  stock: 35,  status: "available",   description: "250 ml bottle of refined cooking oil." },
  { id: "rw5", name: "Sugar (1 kg)",               pointsCost: 45,  stock: 40,  status: "available",   description: "1 kilogram of refined white sugar." },
  { id: "rw6", name: "Grocery Voucher (P50)",      pointsCost: 150, stock: 20,  status: "available",   description: "P50 grocery voucher redeemable at partner stores." },
  { id: "rw7", name: "Eco Bag",                    pointsCost: 25,  stock: 100, status: "available",   description: "Reusable eco-friendly shopping bag." },
  { id: "rw8", name: "Laundry Detergent (500 g)",  pointsCost: 55,  stock: 0,   status: "unavailable", description: "500 g powder detergent for laundry use." },
];

// -- Leaderboard � Alangilan Barangay Households -------------------------------
export const LEADERBOARD_PERIODS = {
  "2025-05": [
    { rank: 1,  residentId: "res_001", name: "Santos Household",      street: "P. Burgos St.",    reportsSubmitted: 42, pointsEarned: 840,  badge: "gold"   },
    { rank: 2,  residentId: "res_002", name: "Dela Cruz Household",   street: "Rizal Ave.",       reportsSubmitted: 38, pointsEarned: 760,  badge: "gold"   },
    { rank: 3,  residentId: "res_003", name: "Reyes Household",       street: "M. Almario St.",   reportsSubmitted: 35, pointsEarned: 700,  badge: "gold"   },
    { rank: 4,  residentId: "res_004", name: "Garcia Household",      street: "P. Burgos St.",    reportsSubmitted: 30, pointsEarned: 600,  badge: "silver" },
    { rank: 5,  residentId: "res_005", name: "Aquino Household",      street: "Evangelista St.",  reportsSubmitted: 27, pointsEarned: 540,  badge: "silver" },
    { rank: 6,  residentId: "res_006", name: "Bautista Household",    street: "Rizal Ave.",       reportsSubmitted: 24, pointsEarned: 480,  badge: "silver" },
    { rank: 7,  residentId: "res_007", name: "Fernandez Household",   street: "M. Almario St.",   reportsSubmitted: 21, pointsEarned: 420,  badge: "bronze" },
    { rank: 8,  residentId: "res_008", name: "Torres Household",      street: "P. Burgos St.",    reportsSubmitted: 18, pointsEarned: 360,  badge: "bronze" },
    { rank: 9,  residentId: "res_009", name: "Villanueva Household",  street: "Evangelista St.",  reportsSubmitted: 15, pointsEarned: 300,  badge: "bronze" },
    { rank: 10, residentId: "res_010", name: "Castillo Household",    street: "Rizal Ave.",       reportsSubmitted: 12, pointsEarned: 240,  badge: null     },
    { rank: 11, residentId: "res_011", name: "Mendoza Household",     street: "M. Almario St.",   reportsSubmitted: 10, pointsEarned: 200,  badge: null     },
    { rank: 12, residentId: "res_012", name: "Ramos Household",       street: "P. Burgos St.",    reportsSubmitted: 8,  pointsEarned: 160,  badge: null     },
  ],
  "2025-04": [
    { rank: 1,  residentId: "res_003", name: "Reyes Household",       street: "M. Almario St.",   reportsSubmitted: 50, pointsEarned: 1000, badge: "gold"   },
    { rank: 2,  residentId: "res_001", name: "Santos Household",      street: "P. Burgos St.",    reportsSubmitted: 45, pointsEarned: 900,  badge: "gold"   },
    { rank: 3,  residentId: "res_005", name: "Aquino Household",      street: "Evangelista St.",  reportsSubmitted: 40, pointsEarned: 800,  badge: "gold"   },
    { rank: 4,  residentId: "res_002", name: "Dela Cruz Household",   street: "Rizal Ave.",       reportsSubmitted: 33, pointsEarned: 660,  badge: "silver" },
    { rank: 5,  residentId: "res_007", name: "Fernandez Household",   street: "M. Almario St.",   reportsSubmitted: 29, pointsEarned: 580,  badge: "silver" },
    { rank: 6,  residentId: "res_004", name: "Garcia Household",      street: "P. Burgos St.",    reportsSubmitted: 25, pointsEarned: 500,  badge: "silver" },
    { rank: 7,  residentId: "res_010", name: "Castillo Household",    street: "Rizal Ave.",       reportsSubmitted: 22, pointsEarned: 440,  badge: "bronze" },
    { rank: 8,  residentId: "res_006", name: "Bautista Household",    street: "Rizal Ave.",       reportsSubmitted: 19, pointsEarned: 380,  badge: "bronze" },
    { rank: 9,  residentId: "res_012", name: "Ramos Household",       street: "P. Burgos St.",    reportsSubmitted: 16, pointsEarned: 320,  badge: "bronze" },
    { rank: 10, residentId: "res_008", name: "Torres Household",      street: "P. Burgos St.",    reportsSubmitted: 13, pointsEarned: 260,  badge: null     },
    { rank: 11, residentId: "res_009", name: "Villanueva Household",  street: "Evangelista St.",  reportsSubmitted: 10, pointsEarned: 200,  badge: null     },
    { rank: 12, residentId: "res_011", name: "Mendoza Household",     street: "M. Almario St.",   reportsSubmitted: 7,  pointsEarned: 140,  badge: null     },
  ],
  "2025-03": [
    { rank: 1,  residentId: "res_001", name: "Santos Household",      street: "P. Burgos St.",    reportsSubmitted: 48, pointsEarned: 960,  badge: "gold"   },
    { rank: 2,  residentId: "res_006", name: "Bautista Household",    street: "Rizal Ave.",       reportsSubmitted: 44, pointsEarned: 880,  badge: "gold"   },
    { rank: 3,  residentId: "res_002", name: "Dela Cruz Household",   street: "Rizal Ave.",       reportsSubmitted: 37, pointsEarned: 740,  badge: "gold"   },
    { rank: 4,  residentId: "res_009", name: "Villanueva Household",  street: "Evangelista St.",  reportsSubmitted: 32, pointsEarned: 640,  badge: "silver" },
    { rank: 5,  residentId: "res_003", name: "Reyes Household",       street: "M. Almario St.",   reportsSubmitted: 28, pointsEarned: 560,  badge: "silver" },
    { rank: 6,  residentId: "res_011", name: "Mendoza Household",     street: "M. Almario St.",   reportsSubmitted: 23, pointsEarned: 460,  badge: "silver" },
    { rank: 7,  residentId: "res_005", name: "Aquino Household",      street: "Evangelista St.",  reportsSubmitted: 20, pointsEarned: 400,  badge: "bronze" },
    { rank: 8,  residentId: "res_004", name: "Garcia Household",      street: "P. Burgos St.",    reportsSubmitted: 17, pointsEarned: 340,  badge: "bronze" },
    { rank: 9,  residentId: "res_007", name: "Fernandez Household",   street: "M. Almario St.",   reportsSubmitted: 14, pointsEarned: 280,  badge: "bronze" },
    { rank: 10, residentId: "res_012", name: "Ramos Household",       street: "P. Burgos St.",    reportsSubmitted: 11, pointsEarned: 220,  badge: null     },
    { rank: 11, residentId: "res_010", name: "Castillo Household",    street: "Rizal Ave.",       reportsSubmitted: 9,  pointsEarned: 180,  badge: null     },
    { rank: 12, residentId: "res_008", name: "Torres Household",      street: "P. Burgos St.",    reportsSubmitted: 6,  pointsEarned: 120,  badge: null     },
  ],
  "2025-02": [
    { rank: 1,  residentId: "res_008", name: "Torres Household",      street: "P. Burgos St.",    reportsSubmitted: 52, pointsEarned: 1040, badge: "gold"   },
    { rank: 2,  residentId: "res_004", name: "Garcia Household",      street: "P. Burgos St.",    reportsSubmitted: 46, pointsEarned: 920,  badge: "gold"   },
    { rank: 3,  residentId: "res_001", name: "Santos Household",      street: "P. Burgos St.",    reportsSubmitted: 40, pointsEarned: 800,  badge: "gold"   },
    { rank: 4,  residentId: "res_010", name: "Castillo Household",    street: "Rizal Ave.",       reportsSubmitted: 35, pointsEarned: 700,  badge: "silver" },
    { rank: 5,  residentId: "res_003", name: "Reyes Household",       street: "M. Almario St.",   reportsSubmitted: 30, pointsEarned: 600,  badge: "silver" },
    { rank: 6,  residentId: "res_012", name: "Ramos Household",       street: "P. Burgos St.",    reportsSubmitted: 26, pointsEarned: 520,  badge: "silver" },
    { rank: 7,  residentId: "res_002", name: "Dela Cruz Household",   street: "Rizal Ave.",       reportsSubmitted: 22, pointsEarned: 440,  badge: "bronze" },
    { rank: 8,  residentId: "res_005", name: "Aquino Household",      street: "Evangelista St.",  reportsSubmitted: 18, pointsEarned: 360,  badge: "bronze" },
    { rank: 9,  residentId: "res_006", name: "Bautista Household",    street: "Rizal Ave.",       reportsSubmitted: 15, pointsEarned: 300,  badge: "bronze" },
    { rank: 10, residentId: "res_007", name: "Fernandez Household",   street: "M. Almario St.",   reportsSubmitted: 12, pointsEarned: 240,  badge: null     },
    { rank: 11, residentId: "res_009", name: "Villanueva Household",  street: "Evangelista St.",  reportsSubmitted: 9,  pointsEarned: 180,  badge: null     },
    { rank: 12, residentId: "res_011", name: "Mendoza Household",     street: "M. Almario St.",   reportsSubmitted: 5,  pointsEarned: 100,  badge: null     },
  ],
  "2025-01": [
    { rank: 1,  residentId: "res_011", name: "Mendoza Household",     street: "M. Almario St.",   reportsSubmitted: 55, pointsEarned: 1100, badge: "gold"   },
    { rank: 2,  residentId: "res_007", name: "Fernandez Household",   street: "M. Almario St.",   reportsSubmitted: 49, pointsEarned: 980,  badge: "gold"   },
    { rank: 3,  residentId: "res_009", name: "Villanueva Household",  street: "Evangelista St.",  reportsSubmitted: 43, pointsEarned: 860,  badge: "gold"   },
    { rank: 4,  residentId: "res_001", name: "Santos Household",      street: "P. Burgos St.",    reportsSubmitted: 38, pointsEarned: 760,  badge: "silver" },
    { rank: 5,  residentId: "res_006", name: "Bautista Household",    street: "Rizal Ave.",       reportsSubmitted: 33, pointsEarned: 660,  badge: "silver" },
    { rank: 6,  residentId: "res_002", name: "Dela Cruz Household",   street: "Rizal Ave.",       reportsSubmitted: 28, pointsEarned: 560,  badge: "silver" },
    { rank: 7,  residentId: "res_004", name: "Garcia Household",      street: "P. Burgos St.",    reportsSubmitted: 24, pointsEarned: 480,  badge: "bronze" },
    { rank: 8,  residentId: "res_003", name: "Reyes Household",       street: "M. Almario St.",   reportsSubmitted: 20, pointsEarned: 400,  badge: "bronze" },
    { rank: 9,  residentId: "res_005", name: "Aquino Household",      street: "Evangelista St.",  reportsSubmitted: 16, pointsEarned: 320,  badge: "bronze" },
    { rank: 10, residentId: "res_010", name: "Castillo Household",    street: "Rizal Ave.",       reportsSubmitted: 13, pointsEarned: 260,  badge: null     },
    { rank: 11, residentId: "res_008", name: "Torres Household",      street: "P. Burgos St.",    reportsSubmitted: 10, pointsEarned: 200,  badge: null     },
    { rank: 12, residentId: "res_012", name: "Ramos Household",       street: "P. Burgos St.",    reportsSubmitted: 7,  pointsEarned: 140,  badge: null     },
  ],
};

export const LEADERBOARD = LEADERBOARD_PERIODS["2025-05"];

// -- Super Admin � City-wide Barangay Leaderboard ------------------------------
// Ranks all barangays across all clusters by household eco-activity.
export const SA_LEADERBOARD_PERIODS = {
  "2025-05": [
    { rank: 1,  barangayId: "br_alangilan",    name: "Alangilan",          cluster: "Solid East",      totalHouseholds: 142, reportsSubmitted: 312, pointsEarned: 6240,  collectionRate: 97, badge: "gold"   },
    { rank: 2,  barangayId: "br_cuta",         name: "Cuta",               cluster: "Solid East",      totalHouseholds: 198, reportsSubmitted: 289, pointsEarned: 5780,  collectionRate: 95, badge: "gold"   },
    { rank: 3,  barangayId: "br_kumibaba",     name: "Kumintang Ibaba",    cluster: "Solid North",     totalHouseholds: 175, reportsSubmitted: 261, pointsEarned: 5220,  collectionRate: 93, badge: "gold"   },
    { rank: 4,  barangayId: "br_kumiilaya",    name: "Kumintang Ilaya",    cluster: "Solid North",     totalHouseholds: 160, reportsSubmitted: 230, pointsEarned: 4600,  collectionRate: 90, badge: "silver" },
    { rank: 5,  barangayId: "br_libjo",        name: "Libjo",              cluster: "Solid Poblacion", totalHouseholds: 134, reportsSubmitted: 198, pointsEarned: 3960,  collectionRate: 88, badge: "silver" },
    { rank: 6,  barangayId: "br_pallocanw",    name: "Pallocan West",      cluster: "Solid Poblacion", totalHouseholds: 210, reportsSubmitted: 175, pointsEarned: 3500,  collectionRate: 85, badge: "silver" },
    { rank: 7,  barangayId: "br_pallocane",    name: "Pallocan East",      cluster: "Solid Baybay",    totalHouseholds: 188, reportsSubmitted: 148, pointsEarned: 2960,  collectionRate: 80, badge: "bronze" },
    { rank: 8,  barangayId: "br_starita",      name: "Sta. Rita Karsada",  cluster: "Solid Upland",    totalHouseholds: 120, reportsSubmitted: 112, pointsEarned: 2240,  collectionRate: 74, badge: "bronze" },
  ],
  "2025-04": [
    { rank: 1,  barangayId: "br_kumibaba",     name: "Kumintang Ibaba",    cluster: "Solid North",     totalHouseholds: 175, reportsSubmitted: 340, pointsEarned: 6800,  collectionRate: 98, badge: "gold"   },
    { rank: 2,  barangayId: "br_alangilan",    name: "Alangilan",          cluster: "Solid East",      totalHouseholds: 142, reportsSubmitted: 298, pointsEarned: 5960,  collectionRate: 96, badge: "gold"   },
    { rank: 3,  barangayId: "br_libjo",        name: "Libjo",              cluster: "Solid Poblacion", totalHouseholds: 134, reportsSubmitted: 275, pointsEarned: 5500,  collectionRate: 94, badge: "gold"   },
    { rank: 4,  barangayId: "br_cuta",         name: "Cuta",               cluster: "Solid East",      totalHouseholds: 198, reportsSubmitted: 250, pointsEarned: 5000,  collectionRate: 91, badge: "silver" },
    { rank: 5,  barangayId: "br_kumiilaya",    name: "Kumintang Ilaya",    cluster: "Solid North",     totalHouseholds: 160, reportsSubmitted: 220, pointsEarned: 4400,  collectionRate: 89, badge: "silver" },
    { rank: 6,  barangayId: "br_pallocane",    name: "Pallocan East",      cluster: "Solid Baybay",    totalHouseholds: 188, reportsSubmitted: 190, pointsEarned: 3800,  collectionRate: 86, badge: "silver" },
    { rank: 7,  barangayId: "br_pallocanw",    name: "Pallocan West",      cluster: "Solid Poblacion", totalHouseholds: 210, reportsSubmitted: 160, pointsEarned: 3200,  collectionRate: 78, badge: "bronze" },
    { rank: 8,  barangayId: "br_starita",      name: "Sta. Rita Karsada",  cluster: "Solid Upland",    totalHouseholds: 120, reportsSubmitted: 130, pointsEarned: 2600,  collectionRate: 72, badge: "bronze" },
  ],
  "2025-03": [
    { rank: 1,  barangayId: "br_pallocanw",    name: "Pallocan West",      cluster: "Solid Poblacion", totalHouseholds: 210, reportsSubmitted: 360, pointsEarned: 7200,  collectionRate: 99, badge: "gold"   },
    { rank: 2,  barangayId: "br_cuta",         name: "Cuta",               cluster: "Solid East",      totalHouseholds: 198, reportsSubmitted: 320, pointsEarned: 6400,  collectionRate: 97, badge: "gold"   },
    { rank: 3,  barangayId: "br_alangilan",    name: "Alangilan",          cluster: "Solid East",      totalHouseholds: 142, reportsSubmitted: 280, pointsEarned: 5600,  collectionRate: 95, badge: "gold"   },
    { rank: 4,  barangayId: "br_pallocane",    name: "Pallocan East",      cluster: "Solid Baybay",    totalHouseholds: 188, reportsSubmitted: 240, pointsEarned: 4800,  collectionRate: 92, badge: "silver" },
    { rank: 5,  barangayId: "br_kumibaba",     name: "Kumintang Ibaba",    cluster: "Solid North",     totalHouseholds: 175, reportsSubmitted: 210, pointsEarned: 4200,  collectionRate: 88, badge: "silver" },
    { rank: 6,  barangayId: "br_libjo",        name: "Libjo",              cluster: "Solid Poblacion", totalHouseholds: 134, reportsSubmitted: 180, pointsEarned: 3600,  collectionRate: 85, badge: "silver" },
    { rank: 7,  barangayId: "br_kumiilaya",    name: "Kumintang Ilaya",    cluster: "Solid North",     totalHouseholds: 160, reportsSubmitted: 150, pointsEarned: 3000,  collectionRate: 80, badge: "bronze" },
    { rank: 8,  barangayId: "br_starita",      name: "Sta. Rita Karsada",  cluster: "Solid Upland",    totalHouseholds: 120, reportsSubmitted: 100, pointsEarned: 2000,  collectionRate: 70, badge: "bronze" },
  ],
};

// -- Cluster Admin � Barangay Leaderboard (within cluster) --------------------
// Ranks barangays within Cluster 1 by household eco-activity.
export const CA_LEADERBOARD_PERIODS = {
  "2025-05": [
    { rank: 1, barangayId: "br1", name: "Brgy. Cuta",            captain: "Maria Lim",    reportsSubmitted: 289, pointsEarned: 5780, collectionRate: 100, badge: "gold"   },
    { rank: 2, barangayId: "br2", name: "Brgy. Alangilan",       captain: "Jose Reyes",   reportsSubmitted: 312, pointsEarned: 6240, collectionRate: 97,  badge: "gold"   },
    { rank: 3, barangayId: "br3", name: "Brgy. Kumintang Ibaba", captain: "Pedro Santos", reportsSubmitted: 261, pointsEarned: 5220, collectionRate: 80,  badge: "silver" },
    { rank: 4, barangayId: "br4", name: "Brgy. Pallocan West",   captain: "Ana Cruz",     reportsSubmitted: 175, pointsEarned: 3500, collectionRate: 50,  badge: "bronze" },
  ],
  "2025-04": [
    { rank: 1, barangayId: "br3", name: "Brgy. Kumintang Ibaba", captain: "Pedro Santos", reportsSubmitted: 340, pointsEarned: 6800, collectionRate: 98,  badge: "gold"   },
    { rank: 2, barangayId: "br2", name: "Brgy. Alangilan",       captain: "Jose Reyes",   reportsSubmitted: 298, pointsEarned: 5960, collectionRate: 96,  badge: "gold"   },
    { rank: 3, barangayId: "br1", name: "Brgy. Cuta",            captain: "Maria Lim",    reportsSubmitted: 250, pointsEarned: 5000, collectionRate: 91,  badge: "silver" },
    { rank: 4, barangayId: "br4", name: "Brgy. Pallocan West",   captain: "Ana Cruz",     reportsSubmitted: 160, pointsEarned: 3200, collectionRate: 78,  badge: "bronze" },
  ],
  "2025-03": [
    { rank: 1, barangayId: "br4", name: "Brgy. Pallocan West",   captain: "Ana Cruz",     reportsSubmitted: 360, pointsEarned: 7200, collectionRate: 99,  badge: "gold"   },
    { rank: 2, barangayId: "br1", name: "Brgy. Cuta",            captain: "Maria Lim",    reportsSubmitted: 320, pointsEarned: 6400, collectionRate: 97,  badge: "gold"   },
    { rank: 3, barangayId: "br2", name: "Brgy. Alangilan",       captain: "Jose Reyes",   reportsSubmitted: 280, pointsEarned: 5600, collectionRate: 95,  badge: "silver" },
    { rank: 4, barangayId: "br3", name: "Brgy. Kumintang Ibaba", captain: "Pedro Santos", reportsSubmitted: 210, pointsEarned: 4200, collectionRate: 88,  badge: "bronze" },
  ],
};

// -- MRF Personnel -------------------------------------------------------------
export const MRF_PERSONNEL = [
  { id: "mp1", name: "Roberto Navarro",  email: "roberto.navarro@besmart.gov.ph",  mrf: "MRF Alangilan",       role: "mrf_personnel", status: "active",   lastLogin: "2025-05-18T07:00:00Z" },
  { id: "mp2", name: "Liza Ocampo",      email: "liza.ocampo@besmart.gov.ph",      mrf: "MRF Cuta",            role: "mrf_personnel", status: "active",   lastLogin: "2025-05-18T06:30:00Z" },
  { id: "mp3", name: "Dante Soriano",    email: "dante.soriano@besmart.gov.ph",    mrf: "MRF Kumintang Ibaba", role: "mrf_personnel", status: "inactive", lastLogin: "2025-05-12T09:00:00Z" },
  { id: "mp4", name: "Cynthia Ramos",    email: "cynthia.ramos@besmart.gov.ph",    mrf: "MRF Libjo",           role: "mrf_personnel", status: "active",   lastLogin: "2025-05-17T15:00:00Z" },
  { id: "mp5", name: "Ernesto Pascual",  email: "ernesto.pascual@besmart.gov.ph",  mrf: "MRF Pallocan West",   role: "mrf_personnel", status: "active",   lastLogin: "2025-05-18T08:15:00Z" },
];

// --- Super Admin � Reports & Analytics (City-Level) ---------------------------

// -- KPI Summary Cards ---------------------------------------------------------
export const REPORT_KPI = {
  totalCollections:      1_284,
  collectionGrowth:      12.4,   // % vs previous period
  avgCollectionRate:     78.3,   // % of scheduled bins collected
  collectionRateChange:  3.1,
  missedCollections:     87,
  missedChange:          -8.5,   // negative = improvement
  activeResidents:       3_412,
  residentGrowth:        5.7,
  ecoTokensIssued:       68_240,
  tokenGrowth:           18.2,
  totalWasteKg:          24_870,
  wasteGrowth:           9.3,
};

// -- Monthly Collections � city-wide (Jan�May 2025) ----------------------------
// Used for the main bar/line chart
export const MONTHLY_COLLECTIONS = [
  { month: "Jan", collected: 198, missed: 22, target: 220 },
  { month: "Feb", collected: 212, missed: 18, target: 225 },
  { month: "Mar", collected: 235, missed: 15, target: 245 },
  { month: "Apr", collected: 221, missed: 19, target: 240 },
  { month: "May", collected: 248, missed: 13, target: 255 },
];

// -- Weekly Collections � current month (May 2025) -----------------------------
export const WEEKLY_COLLECTIONS = [
  { week: "May W1", collected: 58, missed: 4, target: 62 },
  { week: "May W2", collected: 63, missed: 3, target: 65 },
  { week: "May W3", collected: 67, missed: 3, target: 68 },
  { week: "May W4", collected: 60, missed: 3, target: 60 },
];

// -- Collection Rate by Cluster ------------------------------------------------
// Used for the horizontal bar / pie chart
export const CLUSTER_COLLECTION_RATES = [
  { cluster: "c1", label: "Cluster 1 (North Zone)", rate: 84.2, collected: 210, total: 249 },
  { cluster: "c2", label: "Cluster 2",              rate: 79.5, collected: 194, total: 244 },
  { cluster: "c3", label: "Cluster 3",              rate: 76.1, collected: 186, total: 244 },
  { cluster: "c4", label: "Cluster 4",              rate: 72.8, collected: 178, total: 244 },
  { cluster: "c5", label: "Cluster 5",              rate: 68.4, collected: 167, total: 244 },
];

// -- Full Bin Trend � daily for last 14 days -----------------------------------
export const FULL_BIN_TREND = [
  { date: "May 5",  fullBins: 28 },
  { date: "May 6",  fullBins: 31 },
  { date: "May 7",  fullBins: 25 },
  { date: "May 8",  fullBins: 22 },
  { date: "May 9",  fullBins: 19 },
  { date: "May 10", fullBins: 17 },
  { date: "May 11", fullBins: 24 },
  { date: "May 12", fullBins: 29 },
  { date: "May 13", fullBins: 33 },
  { date: "May 14", fullBins: 27 },
  { date: "May 15", fullBins: 21 },
  { date: "May 16", fullBins: 18 },
  { date: "May 17", fullBins: 26 },
  { date: "May 18", fullBins: 31 },
];

// -- Waste Volume by Type (kg) � city-wide, current month ---------------------
export const WASTE_BY_TYPE = [
  { type: "Biodegradable",  kg: 9_840,  color: "#2E7D32" },
  { type: "Recyclable",     kg: 7_210,  color: "#1976D2" },
  { type: "Residual",       kg: 5_630,  color: "#D97706" },
  { type: "Special Waste",  kg: 2_190,  color: "#DC2626" },
];

// -- Eco Token Issuance � monthly ----------------------------------------------
export const ECO_TOKEN_MONTHLY = [
  { month: "Jan", tokens: 10_420 },
  { month: "Feb", tokens: 11_850 },
  { month: "Mar", tokens: 13_200 },
  { month: "Apr", tokens: 14_530 },
  { month: "May", tokens: 18_240 },
];

// -- Top Performing Clusters (composite score) ---------------------------------
export const CLUSTER_PERFORMANCE = [
  { cluster: "c1", label: "Cluster 1",  collectionRate: 84.2, residentEngagement: 91, avgResponseMin: 38, score: 88 },
  { cluster: "c2", label: "Cluster 2",  collectionRate: 79.5, residentEngagement: 83, avgResponseMin: 44, score: 81 },
  { cluster: "c3", label: "Cluster 3",  collectionRate: 76.1, residentEngagement: 78, avgResponseMin: 51, score: 75 },
  { cluster: "c4", label: "Cluster 4",  collectionRate: 72.8, residentEngagement: 74, avgResponseMin: 57, score: 71 },
  { cluster: "c5", label: "Cluster 5",  collectionRate: 68.4, residentEngagement: 69, avgResponseMin: 63, score: 66 },
];

// -- Missed Collection Reasons � city-wide -------------------------------------
export const MISSED_REASONS = [
  { reason: "Truck Breakdown",    count: 28, color: "#DC2626" },
  { reason: "Route Not Assigned", count: 22, color: "#D97706" },
  { reason: "Bin Not Accessible", count: 19, color: "#1976D2" },
  { reason: "Weather / Road",     count: 11, color: "#6B7280" },
  { reason: "Other",              count:  7, color: "#9CA3AF" },
];

// -- Resident Engagement � monthly active reporters ----------------------------
export const RESIDENT_ENGAGEMENT = [
  { month: "Jan", activeReporters: 2_640, newSignups: 180 },
  { month: "Feb", activeReporters: 2_810, newSignups: 210 },
  { month: "Mar", activeReporters: 3_050, newSignups: 240 },
  { month: "Apr", activeReporters: 3_190, newSignups: 195 },
  { month: "May", activeReporters: 3_412, newSignups: 222 },
];

// -- Recent Report Exports Log -------------------------------------------------
export const REPORT_EXPORTS = [
  { id: "re1", name: "May 2025 Collection Summary",    generatedAt: "2025-05-18T09:00:00Z", generatedBy: "Super Admin", format: "PDF"  },
  { id: "re2", name: "April 2025 Waste Volume Report", generatedAt: "2025-05-01T08:30:00Z", generatedBy: "Super Admin", format: "CSV"  },
  { id: "re3", name: "Q1 2025 City Analytics",         generatedAt: "2025-04-02T10:00:00Z", generatedBy: "Super Admin", format: "PDF"  },
  { id: "re4", name: "March 2025 Eco Token Report",    generatedAt: "2025-04-01T09:15:00Z", generatedBy: "Super Admin", format: "XLSX" },
];

// --- Hierarchical Filter Data (Cluster ? Barangay) ----------------------------

// -- Cluster ? Barangay mapping ------------------------------------------------
export const CLUSTER_BARANGAY_MAP = {
  c1: [
    { id: "br_c1_1", name: "Brgy. Alangilan" },
    { id: "br_c1_2", name: "Brgy. Cuta" },
    { id: "br_c1_3", name: "Brgy. Kumintang Ibaba" },
  ],
  c2: [
    { id: "br_c2_1", name: "Brgy. Kumintang Ilaya" },
    { id: "br_c2_2", name: "Brgy. Libjo" },
    { id: "br_c2_3", name: "Brgy. Sta. Clara" },
  ],
  c3: [
    { id: "br_c3_1", name: "Brgy. Pallocan West" },
    { id: "br_c3_2", name: "Brgy. Pallocan East" },
    { id: "br_c3_3", name: "Brgy. Bolbok" },
  ],
  c4: [
    { id: "br_c4_1", name: "Brgy. Sta. Rita Karsada" },
    { id: "br_c4_2", name: "Brgy. Gulod Labac" },
    { id: "br_c4_3", name: "Brgy. Dumuclay" },
  ],
  c5: [
    { id: "br_c5_1", name: "Brgy. Balagtas" },
    { id: "br_c5_2", name: "Brgy. Calicanto" },
    { id: "br_c5_3", name: "Brgy. Tinga Labac" },
  ],
};

// -- Scoped KPI by cluster -----------------------------------------------------
export const REPORT_KPI_BY_CLUSTER = {
  c1: { totalCollections: 280, collectionGrowth: 14.2, avgCollectionRate: 84.2, collectionRateChange: 4.1, missedCollections: 14, missedChange: -12.0, activeResidents: 720, residentGrowth: 7.2, ecoTokensIssued: 14_800, tokenGrowth: 21.0, totalWasteKg: 5_420, wasteGrowth: 11.2 },
  c2: { totalCollections: 261, collectionGrowth: 11.8, avgCollectionRate: 79.5, collectionRateChange: 2.8, missedCollections: 18, missedChange: -7.0,  activeResidents: 690, residentGrowth: 5.1, ecoTokensIssued: 13_200, tokenGrowth: 17.5, totalWasteKg: 5_100, wasteGrowth: 8.9  },
  c3: { totalCollections: 248, collectionGrowth: 10.5, avgCollectionRate: 76.1, collectionRateChange: 2.2, missedCollections: 21, missedChange: -5.5,  activeResidents: 660, residentGrowth: 4.8, ecoTokensIssued: 12_600, tokenGrowth: 15.8, totalWasteKg: 4_870, wasteGrowth: 7.6  },
  c4: { totalCollections: 235, collectionGrowth:  9.3, avgCollectionRate: 72.8, collectionRateChange: 1.9, missedCollections: 24, missedChange: -4.2,  activeResidents: 640, residentGrowth: 4.2, ecoTokensIssued: 11_980, tokenGrowth: 14.1, totalWasteKg: 4_620, wasteGrowth: 6.8  },
  c5: { totalCollections: 260, collectionGrowth: 13.1, avgCollectionRate: 68.4, collectionRateChange: 3.5, missedCollections: 10, missedChange: -14.0, activeResidents: 702, residentGrowth: 6.5, ecoTokensIssued: 15_660, tokenGrowth: 19.3, totalWasteKg: 4_860, wasteGrowth: 10.1 },
};

// -- Scoped KPI by barangay ----------------------------------------------------
export const REPORT_KPI_BY_BARANGAY = {
  br_c1_1: { totalCollections: 98,  collectionGrowth: 15.0, avgCollectionRate: 87.5, collectionRateChange: 5.0, missedCollections: 4,  missedChange: -15.0, activeResidents: 248, residentGrowth: 8.1, ecoTokensIssued: 5_100, tokenGrowth: 22.0, totalWasteKg: 1_890, wasteGrowth: 12.5 },
  br_c1_2: { totalCollections: 102, collectionGrowth: 13.5, avgCollectionRate: 83.0, collectionRateChange: 3.8, missedCollections: 5,  missedChange: -10.0, activeResidents: 252, residentGrowth: 7.0, ecoTokensIssued: 5_300, tokenGrowth: 20.5, totalWasteKg: 1_960, wasteGrowth: 11.0 },
  br_c1_3: { totalCollections: 80,  collectionGrowth: 12.0, avgCollectionRate: 80.0, collectionRateChange: 3.2, missedCollections: 5,  missedChange: -9.0,  activeResidents: 220, residentGrowth: 6.2, ecoTokensIssued: 4_400, tokenGrowth: 18.0, totalWasteKg: 1_570, wasteGrowth: 9.8  },
  br_c2_1: { totalCollections: 90,  collectionGrowth: 12.2, avgCollectionRate: 81.0, collectionRateChange: 3.0, missedCollections: 6,  missedChange: -8.0,  activeResidents: 235, residentGrowth: 5.5, ecoTokensIssued: 4_600, tokenGrowth: 18.5, totalWasteKg: 1_760, wasteGrowth: 9.2  },
  br_c2_2: { totalCollections: 88,  collectionGrowth: 11.5, avgCollectionRate: 79.0, collectionRateChange: 2.5, missedCollections: 7,  missedChange: -6.5,  activeResidents: 228, residentGrowth: 5.0, ecoTokensIssued: 4_400, tokenGrowth: 17.0, totalWasteKg: 1_720, wasteGrowth: 8.5  },
  br_c2_3: { totalCollections: 83,  collectionGrowth: 10.8, avgCollectionRate: 77.5, collectionRateChange: 2.2, missedCollections: 5,  missedChange: -7.0,  activeResidents: 227, residentGrowth: 4.8, ecoTokensIssued: 4_200, tokenGrowth: 16.5, totalWasteKg: 1_620, wasteGrowth: 8.0  },
  br_c3_1: { totalCollections: 86,  collectionGrowth: 11.0, avgCollectionRate: 78.0, collectionRateChange: 2.4, missedCollections: 7,  missedChange: -5.0,  activeResidents: 222, residentGrowth: 4.9, ecoTokensIssued: 4_300, tokenGrowth: 16.0, totalWasteKg: 1_680, wasteGrowth: 7.8  },
  br_c3_2: { totalCollections: 82,  collectionGrowth: 10.2, avgCollectionRate: 75.5, collectionRateChange: 2.0, missedCollections: 8,  missedChange: -4.5,  activeResidents: 218, residentGrowth: 4.5, ecoTokensIssued: 4_100, tokenGrowth: 15.5, totalWasteKg: 1_600, wasteGrowth: 7.4  },
  br_c3_3: { totalCollections: 80,  collectionGrowth:  9.8, avgCollectionRate: 74.0, collectionRateChange: 1.8, missedCollections: 6,  missedChange: -6.0,  activeResidents: 220, residentGrowth: 4.6, ecoTokensIssued: 4_200, tokenGrowth: 15.8, totalWasteKg: 1_590, wasteGrowth: 7.2  },
  br_c4_1: { totalCollections: 82,  collectionGrowth:  9.5, avgCollectionRate: 74.5, collectionRateChange: 2.0, missedCollections: 8,  missedChange: -4.0,  activeResidents: 215, residentGrowth: 4.3, ecoTokensIssued: 4_050, tokenGrowth: 14.5, totalWasteKg: 1_580, wasteGrowth: 7.0  },
  br_c4_2: { totalCollections: 78,  collectionGrowth:  9.0, avgCollectionRate: 72.0, collectionRateChange: 1.7, missedCollections: 9,  missedChange: -3.8,  activeResidents: 212, residentGrowth: 4.0, ecoTokensIssued: 3_980, tokenGrowth: 13.8, totalWasteKg: 1_540, wasteGrowth: 6.5  },
  br_c4_3: { totalCollections: 75,  collectionGrowth:  8.8, avgCollectionRate: 70.5, collectionRateChange: 1.5, missedCollections: 7,  missedChange: -4.5,  activeResidents: 213, residentGrowth: 4.1, ecoTokensIssued: 3_950, tokenGrowth: 13.5, totalWasteKg: 1_500, wasteGrowth: 6.2  },
  br_c5_1: { totalCollections: 90,  collectionGrowth: 13.5, avgCollectionRate: 70.0, collectionRateChange: 3.8, missedCollections: 3,  missedChange: -16.0, activeResidents: 238, residentGrowth: 6.8, ecoTokensIssued: 5_300, tokenGrowth: 20.0, totalWasteKg: 1_660, wasteGrowth: 10.5 },
  br_c5_2: { totalCollections: 88,  collectionGrowth: 13.0, avgCollectionRate: 68.5, collectionRateChange: 3.5, missedCollections: 4,  missedChange: -14.5, activeResidents: 232, residentGrowth: 6.4, ecoTokensIssued: 5_180, tokenGrowth: 19.5, totalWasteKg: 1_620, wasteGrowth: 10.0 },
  br_c5_3: { totalCollections: 82,  collectionGrowth: 12.5, avgCollectionRate: 66.5, collectionRateChange: 3.2, missedCollections: 3,  missedChange: -13.0, activeResidents: 232, residentGrowth: 6.2, ecoTokensIssued: 5_180, tokenGrowth: 18.8, totalWasteKg: 1_580, wasteGrowth: 9.5  },
};

// -- Monthly collections scoped by cluster -------------------------------------
export const MONTHLY_COLLECTIONS_BY_CLUSTER = {
  c1: [
    { month: "Jan", collected: 48, missed: 4, target: 52 },
    { month: "Feb", collected: 52, missed: 3, target: 55 },
    { month: "Mar", collected: 58, missed: 2, target: 60 },
    { month: "Apr", collected: 55, missed: 3, target: 58 },
    { month: "May", collected: 67, missed: 2, target: 68 },
  ],
  c2: [
    { month: "Jan", collected: 44, missed: 5, target: 49 },
    { month: "Feb", collected: 47, missed: 4, target: 51 },
    { month: "Mar", collected: 52, missed: 3, target: 55 },
    { month: "Apr", collected: 49, missed: 4, target: 53 },
    { month: "May", collected: 69, missed: 2, target: 71 },
  ],
  c3: [
    { month: "Jan", collected: 40, missed: 5, target: 45 },
    { month: "Feb", collected: 43, missed: 4, target: 47 },
    { month: "Mar", collected: 48, missed: 4, target: 52 },
    { month: "Apr", collected: 45, missed: 5, target: 50 },
    { month: "May", collected: 72, missed: 3, target: 75 },
  ],
  c4: [
    { month: "Jan", collected: 38, missed: 6, target: 44 },
    { month: "Feb", collected: 40, missed: 5, target: 45 },
    { month: "Mar", collected: 44, missed: 4, target: 48 },
    { month: "Apr", collected: 42, missed: 5, target: 47 },
    { month: "May", collected: 71, missed: 4, target: 75 },
  ],
  c5: [
    { month: "Jan", collected: 28, missed: 2, target: 30 },
    { month: "Feb", collected: 30, missed: 2, target: 32 },
    { month: "Mar", collected: 33, missed: 2, target: 35 },
    { month: "Apr", collected: 30, missed: 2, target: 32 },
    { month: "May", collected: 69, missed: 2, target: 71 },
  ],
};

// -- Monthly collections scoped by barangay ------------------------------------
export const MONTHLY_COLLECTIONS_BY_BARANGAY = {
  br_c1_1: [
    { month: "Jan", collected: 17, missed: 1, target: 18 },
    { month: "Feb", collected: 18, missed: 1, target: 19 },
    { month: "Mar", collected: 21, missed: 1, target: 22 },
    { month: "Apr", collected: 19, missed: 1, target: 20 },
    { month: "May", collected: 23, missed: 0, target: 23 },
  ],
  br_c1_2: [
    { month: "Jan", collected: 18, missed: 2, target: 20 },
    { month: "Feb", collected: 19, missed: 1, target: 20 },
    { month: "Mar", collected: 22, missed: 1, target: 23 },
    { month: "Apr", collected: 20, missed: 1, target: 21 },
    { month: "May", collected: 23, missed: 1, target: 24 },
  ],
  br_c1_3: [
    { month: "Jan", collected: 13, missed: 1, target: 14 },
    { month: "Feb", collected: 15, missed: 1, target: 16 },
    { month: "Mar", collected: 15, missed: 0, target: 15 },
    { month: "Apr", collected: 16, missed: 1, target: 17 },
    { month: "May", collected: 21, missed: 1, target: 21 },
  ],
  br_c2_1: [{ month: "Jan", collected: 31, missed: 2, target: 33 }, { month: "Feb", collected: 33, missed: 1, target: 34 }, { month: "Mar", collected: 36, missed: 1, target: 37 }, { month: "Apr", collected: 34, missed: 2, target: 36 }, { month: "May", collected: 23, missed: 1, target: 24 }],
  br_c2_2: [{ month: "Jan", collected: 30, missed: 2, target: 32 }, { month: "Feb", collected: 31, missed: 2, target: 33 }, { month: "Mar", collected: 34, missed: 1, target: 35 }, { month: "Apr", collected: 32, missed: 1, target: 33 }, { month: "May", collected: 23, missed: 1, target: 24 }],
  br_c2_3: [{ month: "Jan", collected: 28, missed: 1, target: 29 }, { month: "Feb", collected: 29, missed: 1, target: 30 }, { month: "Mar", collected: 32, missed: 1, target: 33 }, { month: "Apr", collected: 30, missed: 1, target: 31 }, { month: "May", collected: 23, missed: 0, target: 23 }],
  br_c3_1: [{ month: "Jan", collected: 29, missed: 2, target: 31 }, { month: "Feb", collected: 30, missed: 2, target: 32 }, { month: "Mar", collected: 33, missed: 1, target: 34 }, { month: "Apr", collected: 31, missed: 2, target: 33 }, { month: "May", collected: 25, missed: 1, target: 26 }],
  br_c3_2: [{ month: "Jan", collected: 27, missed: 2, target: 29 }, { month: "Feb", collected: 28, missed: 1, target: 29 }, { month: "Mar", collected: 31, missed: 2, target: 33 }, { month: "Apr", collected: 29, missed: 2, target: 31 }, { month: "May", collected: 24, missed: 1, target: 25 }],
  br_c3_3: [{ month: "Jan", collected: 26, missed: 1, target: 27 }, { month: "Feb", collected: 27, missed: 1, target: 28 }, { month: "Mar", collected: 30, missed: 1, target: 31 }, { month: "Apr", collected: 28, missed: 1, target: 29 }, { month: "May", collected: 23, missed: 1, target: 24 }],
  br_c4_1: [{ month: "Jan", collected: 28, missed: 3, target: 31 }, { month: "Feb", collected: 29, missed: 2, target: 31 }, { month: "Mar", collected: 32, missed: 2, target: 34 }, { month: "Apr", collected: 30, missed: 2, target: 32 }, { month: "May", collected: 24, missed: 2, target: 26 }],
  br_c4_2: [{ month: "Jan", collected: 26, missed: 2, target: 28 }, { month: "Feb", collected: 27, missed: 2, target: 29 }, { month: "Mar", collected: 30, missed: 1, target: 31 }, { month: "Apr", collected: 28, missed: 2, target: 30 }, { month: "May", collected: 23, missed: 1, target: 24 }],
  br_c4_3: [{ month: "Jan", collected: 24, missed: 1, target: 25 }, { month: "Feb", collected: 25, missed: 1, target: 26 }, { month: "Mar", collected: 28, missed: 1, target: 29 }, { month: "Apr", collected: 26, missed: 1, target: 27 }, { month: "May", collected: 24, missed: 1, target: 25 }],
  br_c5_1: [{ month: "Jan", collected: 10, missed: 1, target: 11 }, { month: "Feb", collected: 11, missed: 1, target: 12 }, { month: "Mar", collected: 12, missed: 0, target: 12 }, { month: "Apr", collected: 11, missed: 1, target: 12 }, { month: "May", collected: 24, missed: 1, target: 25 }],
  br_c5_2: [{ month: "Jan", collected: 10, missed: 0, target: 10 }, { month: "Feb", collected: 10, missed: 1, target: 11 }, { month: "Mar", collected: 11, missed: 1, target: 12 }, { month: "Apr", collected: 10, missed: 0, target: 10 }, { month: "May", collected: 23, missed: 1, target: 24 }],
  br_c5_3: [{ month: "Jan", collected: 8,  missed: 1, target: 9  }, { month: "Feb", collected: 9,  missed: 0, target: 9  }, { month: "Mar", collected: 10, missed: 1, target: 11 }, { month: "Apr", collected: 9,  missed: 1, target: 10 }, { month: "May", collected: 22, missed: 0, target: 22 }],
};

// -- Waste by type scoped by cluster ------------------------------------------
export const WASTE_BY_TYPE_BY_CLUSTER = {
  c1: [{ type: "Biodegradable", kg: 2_180, color: "#2E7D32" }, { type: "Recyclable", kg: 1_590, color: "#1976D2" }, { type: "Residual", kg: 1_200, color: "#D97706" }, { type: "Special Waste", kg: 450, color: "#DC2626" }],
  c2: [{ type: "Biodegradable", kg: 2_040, color: "#2E7D32" }, { type: "Recyclable", kg: 1_490, color: "#1976D2" }, { type: "Residual", kg: 1_140, color: "#D97706" }, { type: "Special Waste", kg: 430, color: "#DC2626" }],
  c3: [{ type: "Biodegradable", kg: 1_950, color: "#2E7D32" }, { type: "Recyclable", kg: 1_420, color: "#1976D2" }, { type: "Residual", kg: 1_080, color: "#D97706" }, { type: "Special Waste", kg: 420, color: "#DC2626" }],
  c4: [{ type: "Biodegradable", kg: 1_850, color: "#2E7D32" }, { type: "Recyclable", kg: 1_350, color: "#1976D2" }, { type: "Residual", kg: 1_020, color: "#D97706" }, { type: "Special Waste", kg: 400, color: "#DC2626" }],
  c5: [{ type: "Biodegradable", kg: 1_820, color: "#2E7D32" }, { type: "Recyclable", kg: 1_360, color: "#1976D2" }, { type: "Residual", kg: 1_190, color: "#D97706" }, { type: "Special Waste", kg: 490, color: "#DC2626" }],
};

// -- Waste by type scoped by barangay -----------------------------------------
export const WASTE_BY_TYPE_BY_BARANGAY = {
  br_c1_1: [{ type: "Biodegradable", kg: 760, color: "#2E7D32" }, { type: "Recyclable", kg: 555, color: "#1976D2" }, { type: "Residual", kg: 420, color: "#D97706" }, { type: "Special Waste", kg: 155, color: "#DC2626" }],
  br_c1_2: [{ type: "Biodegradable", kg: 790, color: "#2E7D32" }, { type: "Recyclable", kg: 575, color: "#1976D2" }, { type: "Residual", kg: 435, color: "#D97706" }, { type: "Special Waste", kg: 160, color: "#DC2626" }],
  br_c1_3: [{ type: "Biodegradable", kg: 630, color: "#2E7D32" }, { type: "Recyclable", kg: 460, color: "#1976D2" }, { type: "Residual", kg: 345, color: "#D97706" }, { type: "Special Waste", kg: 135, color: "#DC2626" }],
  br_c2_1: [{ type: "Biodegradable", kg: 705, color: "#2E7D32" }, { type: "Recyclable", kg: 515, color: "#1976D2" }, { type: "Residual", kg: 390, color: "#D97706" }, { type: "Special Waste", kg: 150, color: "#DC2626" }],
  br_c2_2: [{ type: "Biodegradable", kg: 690, color: "#2E7D32" }, { type: "Recyclable", kg: 500, color: "#1976D2" }, { type: "Residual", kg: 380, color: "#D97706" }, { type: "Special Waste", kg: 150, color: "#DC2626" }],
  br_c2_3: [{ type: "Biodegradable", kg: 645, color: "#2E7D32" }, { type: "Recyclable", kg: 475, color: "#1976D2" }, { type: "Residual", kg: 370, color: "#D97706" }, { type: "Special Waste", kg: 130, color: "#DC2626" }],
  br_c3_1: [{ type: "Biodegradable", kg: 672, color: "#2E7D32" }, { type: "Recyclable", kg: 490, color: "#1976D2" }, { type: "Residual", kg: 372, color: "#D97706" }, { type: "Special Waste", kg: 146, color: "#DC2626" }],
  br_c3_2: [{ type: "Biodegradable", kg: 640, color: "#2E7D32" }, { type: "Recyclable", kg: 466, color: "#1976D2" }, { type: "Residual", kg: 354, color: "#D97706" }, { type: "Special Waste", kg: 140, color: "#DC2626" }],
  br_c3_3: [{ type: "Biodegradable", kg: 638, color: "#2E7D32" }, { type: "Recyclable", kg: 464, color: "#1976D2" }, { type: "Residual", kg: 354, color: "#D97706" }, { type: "Special Waste", kg: 134, color: "#DC2626" }],
  br_c4_1: [{ type: "Biodegradable", kg: 632, color: "#2E7D32" }, { type: "Recyclable", kg: 460, color: "#1976D2" }, { type: "Residual", kg: 348, color: "#D97706" }, { type: "Special Waste", kg: 140, color: "#DC2626" }],
  br_c4_2: [{ type: "Biodegradable", kg: 616, color: "#2E7D32" }, { type: "Recyclable", kg: 448, color: "#1976D2" }, { type: "Residual", kg: 340, color: "#D97706" }, { type: "Special Waste", kg: 136, color: "#DC2626" }],
  br_c4_3: [{ type: "Biodegradable", kg: 602, color: "#2E7D32" }, { type: "Recyclable", kg: 442, color: "#1976D2" }, { type: "Residual", kg: 332, color: "#D97706" }, { type: "Special Waste", kg: 124, color: "#DC2626" }],
  br_c5_1: [{ type: "Biodegradable", kg: 664, color: "#2E7D32" }, { type: "Recyclable", kg: 484, color: "#1976D2" }, { type: "Residual", kg: 348, color: "#D97706" }, { type: "Special Waste", kg: 164, color: "#DC2626" }],
  br_c5_2: [{ type: "Biodegradable", kg: 648, color: "#2E7D32" }, { type: "Recyclable", kg: 472, color: "#1976D2" }, { type: "Residual", kg: 340, color: "#D97706" }, { type: "Special Waste", kg: 160, color: "#DC2626" }],
  br_c5_3: [{ type: "Biodegradable", kg: 508, color: "#2E7D32" }, { type: "Recyclable", kg: 404, color: "#1976D2" }, { type: "Residual", kg: 502, color: "#D97706" }, { type: "Special Waste", kg: 166, color: "#DC2626" }],
};

// -- Missed reasons scoped by cluster -----------------------------------------
export const MISSED_REASONS_BY_CLUSTER = {
  c1: [{ reason: "Truck Breakdown", count: 5, color: "#DC2626" }, { reason: "Route Not Assigned", count: 4, color: "#D97706" }, { reason: "Bin Not Accessible", count: 3, color: "#1976D2" }, { reason: "Weather / Road", count: 1, color: "#6B7280" }, { reason: "Other", count: 1, color: "#9CA3AF" }],
  c2: [{ reason: "Truck Breakdown", count: 6, color: "#DC2626" }, { reason: "Route Not Assigned", count: 5, color: "#D97706" }, { reason: "Bin Not Accessible", count: 4, color: "#1976D2" }, { reason: "Weather / Road", count: 2, color: "#6B7280" }, { reason: "Other", count: 1, color: "#9CA3AF" }],
  c3: [{ reason: "Truck Breakdown", count: 7, color: "#DC2626" }, { reason: "Route Not Assigned", count: 5, color: "#D97706" }, { reason: "Bin Not Accessible", count: 5, color: "#1976D2" }, { reason: "Weather / Road", count: 3, color: "#6B7280" }, { reason: "Other", count: 1, color: "#9CA3AF" }],
  c4: [{ reason: "Truck Breakdown", count: 8, color: "#DC2626" }, { reason: "Route Not Assigned", count: 6, color: "#D97706" }, { reason: "Bin Not Accessible", count: 5, color: "#1976D2" }, { reason: "Weather / Road", count: 3, color: "#6B7280" }, { reason: "Other", count: 2, color: "#9CA3AF" }],
  c5: [{ reason: "Truck Breakdown", count: 2, color: "#DC2626" }, { reason: "Route Not Assigned", count: 2, color: "#D97706" }, { reason: "Bin Not Accessible", count: 2, color: "#1976D2" }, { reason: "Weather / Road", count: 2, color: "#6B7280" }, { reason: "Other", count: 2, color: "#9CA3AF" }],
};

// -- Missed reasons scoped by barangay ----------------------------------------
export const MISSED_REASONS_BY_BARANGAY = {
  br_c1_1: [{ reason: "Truck Breakdown", count: 2, color: "#DC2626" }, { reason: "Route Not Assigned", count: 1, color: "#D97706" }, { reason: "Bin Not Accessible", count: 1, color: "#1976D2" }, { reason: "Other", count: 0, color: "#9CA3AF" }],
  br_c1_2: [{ reason: "Truck Breakdown", count: 2, color: "#DC2626" }, { reason: "Route Not Assigned", count: 2, color: "#D97706" }, { reason: "Bin Not Accessible", count: 1, color: "#1976D2" }, { reason: "Other", count: 0, color: "#9CA3AF" }],
  br_c1_3: [{ reason: "Truck Breakdown", count: 1, color: "#DC2626" }, { reason: "Route Not Assigned", count: 1, color: "#D97706" }, { reason: "Bin Not Accessible", count: 1, color: "#1976D2" }, { reason: "Other", count: 2, color: "#9CA3AF" }],
  br_c2_1: [{ reason: "Truck Breakdown", count: 2, color: "#DC2626" }, { reason: "Route Not Assigned", count: 2, color: "#D97706" }, { reason: "Bin Not Accessible", count: 1, color: "#1976D2" }, { reason: "Other", count: 1, color: "#9CA3AF" }],
  br_c2_2: [{ reason: "Truck Breakdown", count: 3, color: "#DC2626" }, { reason: "Route Not Assigned", count: 2, color: "#D97706" }, { reason: "Bin Not Accessible", count: 1, color: "#1976D2" }, { reason: "Other", count: 1, color: "#9CA3AF" }],
  br_c2_3: [{ reason: "Truck Breakdown", count: 1, color: "#DC2626" }, { reason: "Route Not Assigned", count: 1, color: "#D97706" }, { reason: "Bin Not Accessible", count: 2, color: "#1976D2" }, { reason: "Other", count: 1, color: "#9CA3AF" }],
  br_c3_1: [{ reason: "Truck Breakdown", count: 3, color: "#DC2626" }, { reason: "Route Not Assigned", count: 2, color: "#D97706" }, { reason: "Bin Not Accessible", count: 1, color: "#1976D2" }, { reason: "Other", count: 1, color: "#9CA3AF" }],
  br_c3_2: [{ reason: "Truck Breakdown", count: 3, color: "#DC2626" }, { reason: "Route Not Assigned", count: 2, color: "#D97706" }, { reason: "Bin Not Accessible", count: 2, color: "#1976D2" }, { reason: "Other", count: 1, color: "#9CA3AF" }],
  br_c3_3: [{ reason: "Truck Breakdown", count: 2, color: "#DC2626" }, { reason: "Route Not Assigned", count: 1, color: "#D97706" }, { reason: "Bin Not Accessible", count: 2, color: "#1976D2" }, { reason: "Other", count: 1, color: "#9CA3AF" }],
  br_c4_1: [{ reason: "Truck Breakdown", count: 3, color: "#DC2626" }, { reason: "Route Not Assigned", count: 2, color: "#D97706" }, { reason: "Bin Not Accessible", count: 2, color: "#1976D2" }, { reason: "Other", count: 1, color: "#9CA3AF" }],
  br_c4_2: [{ reason: "Truck Breakdown", count: 4, color: "#DC2626" }, { reason: "Route Not Assigned", count: 2, color: "#D97706" }, { reason: "Bin Not Accessible", count: 2, color: "#1976D2" }, { reason: "Other", count: 1, color: "#9CA3AF" }],
  br_c4_3: [{ reason: "Truck Breakdown", count: 1, color: "#DC2626" }, { reason: "Route Not Assigned", count: 2, color: "#D97706" }, { reason: "Bin Not Accessible", count: 1, color: "#1976D2" }, { reason: "Other", count: 3, color: "#9CA3AF" }],
  br_c5_1: [{ reason: "Truck Breakdown", count: 1, color: "#DC2626" }, { reason: "Route Not Assigned", count: 1, color: "#D97706" }, { reason: "Bin Not Accessible", count: 1, color: "#1976D2" }, { reason: "Other", count: 0, color: "#9CA3AF" }],
  br_c5_2: [{ reason: "Truck Breakdown", count: 2, color: "#DC2626" }, { reason: "Route Not Assigned", count: 1, color: "#D97706" }, { reason: "Bin Not Accessible", count: 1, color: "#1976D2" }, { reason: "Other", count: 0, color: "#9CA3AF" }],
  br_c5_3: [{ reason: "Truck Breakdown", count: 1, color: "#DC2626" }, { reason: "Route Not Assigned", count: 0, color: "#D97706" }, { reason: "Bin Not Accessible", count: 0, color: "#1976D2" }, { reason: "Other", count: 2, color: "#9CA3AF" }],
};

