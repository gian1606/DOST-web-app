import { useState, useMemo } from "react";
import { Plus, Eye, Send, ChevronLeft, ChevronRight, Route, MapPin, Clock, CheckCircle, Truck, X, AlertTriangle, Cpu, Ruler } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import Modal from "../components/ui/Modal";
import MapView from "../components/ui/MapView";
import { ROUTES, CLUSTERS, CLUSTER_ADMINS, BINS, TRUCKS, MRF_LOCATIONS, OPTIMIZED_ROUTE } from "../mock/data";

// -- Per-cluster optimized route builder --------------------------------------
function buildClusterRoute(clusterId, allBins) {
  const fullBins = allBins.filter((b) => b.cluster === clusterId && b.status === "full");
  if (fullBins.length === 0) return null;
  const order = [
    { label: "Truck Depot", type: "depot", posX: 0.10, posY: 0.85 },
    ...fullBins.map((b) => ({ binId: b.id, label: b.name, street: b.street, posX: b.posX, posY: b.posY })),
  ];
  const distanceKm = parseFloat((fullBins.length * 1.4 + 0.8).toFixed(1));
  const estimatedMinutes = Math.round(fullBins.length * 11 + 8);
  const clusterNum = clusterId.replace("c", "");
  const routeNum = String(parseInt(clusterNum) + 5).padStart(3, "0");
  return {
    routeId: `RT-2025-0${routeNum}`,
    cluster: clusterId,
    bins: fullBins.map((b) => b.id),
    distanceKm,
    estimatedMinutes,
    algorithm: "Nearest Neighbor",
    optimizedAt: new Date().toISOString(),
    order,
  };
}

const PAGE_SIZE = 5;

// -- Status colour helper ------------------------------------------------------
const STATUS_COLORS = {
  completed:   { bg: "#E8F5E9", color: "#2E7D32" },
  in_progress: { bg: "#E3F2FD", color: "#1976D2" },
  delivered:   { bg: "#FFF3E0", color: "#D97706" },
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0"
      style={{ borderColor: "#F3F4F6" }}>
      <span className="text-text-muted font-medium flex-shrink-0" style={{ fontSize: 13 }}>{label}</span>
      <span className="text-text-primary font-semibold text-right" style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}

export default function RouteManagement() {
  const [routes, setRoutes] = useState(ROUTES);

  // -- Optimize Route state -----------------------------------------------------
  const [selectedCluster, setSelectedCluster]     = useState("c1");
  const [optimized, setOptimized]                 = useState(false);
  const [sending, setSending]                     = useState(false);
  const [sent, setSent]                           = useState(false);
  const [showRouteDetails, setShowRouteDetails]   = useState(false); // modal after optimize

  function handleClusterChange(val) {
    setSelectedCluster(val);
    setOptimized(false);
    setSent(false);
    setShowRouteDetails(false);
  }

  const filteredBins = useMemo(() =>
    BINS.filter((b) => b.cluster === selectedCluster),
    [selectedCluster]
  );
  const filteredMRFs = useMemo(() =>
    MRF_LOCATIONS.filter((m) => m.cluster === selectedCluster),
    [selectedCluster]
  );
  const fullBinCount = filteredBins.filter((b) => b.status === "full").length;

  const optimizeRoute = useMemo(() => {
    return buildClusterRoute(selectedCluster, BINS) ?? OPTIMIZED_ROUTE;
  }, [selectedCluster]);

  const clusterLabel = CLUSTERS.find((c) => c.id === selectedCluster)?.label ?? selectedCluster;

  const sentToAdmin = CLUSTER_ADMINS.find((u) => u.assignedCluster === selectedCluster);

  function handleOptimize() { setOptimized(true); setSent(false); setShowRouteDetails(true); }
  function handleSendRoute() {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setShowRouteDetails(false);
      const admin = sentToAdmin;
      const newRoute = {
        id:               `r${Date.now()}`,
        routeId:          optimizeRoute.routeId,
        date:             new Date().toISOString().split("T")[0],
        cluster:          selectedCluster,
        bins:             optimizeRoute.bins,
        distanceKm:       optimizeRoute.distanceKm,
        estimatedMinutes: optimizeRoute.estimatedMinutes,
        sentTo:           admin?.name ?? "Cluster Admin",
        status:           "delivered",
        optimizedAt:      optimizeRoute.optimizedAt,
        sentAt:           new Date().toISOString(),
      };
      setRoutes((prev) => [newRoute, ...prev]);
    }, 800);
  }

  const optimizedAt = new Date(optimizeRoute.optimizedAt).toLocaleTimeString("en-PH", {
    hour: "2-digit", minute: "2-digit",
  });

  // -- Filters -----------------------------------------------------------------
  const [monthFilter, setMonthFilter]     = useState("all");
  const [clusterFilter, setClusterFilter] = useState("all");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [page, setPage]                   = useState(1);

  // Build last 12 months options (current month first)
  const monthOptions = (() => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-PH", { month: "long", year: "numeric" });
      opts.push({ value, label });
    }
    return opts;
  })();

  // -- Modal states -------------------------------------------------------------
  const [viewRoute,   setViewRoute]   = useState(null);   // View details modal
  const [resendRoute, setResendRoute] = useState(null);   // Resend confirmation modal
  const [resendTo,    setResendTo]    = useState("");     // selected admin for resend
  const [resendDone,  setResendDone]  = useState(false);  // success state

  const [createOpen,  setCreateOpen]  = useState(false);  // Generate new route modal
  const [createStep,  setCreateStep]  = useState(1);      // 1 = form, 2 = preview, 3 = success
  const [createForm,  setCreateForm]  = useState({
    cluster: "", assignTo: "", date: new Date().toISOString().split("T")[0], bins: [],
  });
  const [createErrors, setCreateErrors] = useState({});

  // -- Derived data -------------------------------------------------------------
  const filtered = routes.filter((r) => {
    if (clusterFilter !== "all" && r.cluster !== clusterFilter) return false;
    if (statusFilter  !== "all" && r.status  !== statusFilter)  return false;
    if (monthFilter   !== "all" && !r.date.startsWith(monthFilter)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getClusterLabel(id) {
    return CLUSTERS.find((c) => c.id === id)?.label ?? id;
  }
  function getAdminsForCluster(clusterId) {
    return CLUSTER_ADMINS.filter((a) => a.assignedCluster === clusterId && a.status === "active");
  }
  function getBinsForCluster(clusterId) {
    return BINS.filter((b) => b.cluster === clusterId);
  }
  function getBinLabel(binId) {
    const b = BINS.find((x) => x.id === binId);
    return b ? `${b.name} — ${b.street}, ${b.barangay}` : binId;
  }
  function nextRouteId() {
    const nums = routes.map((r) => parseInt(r.routeId.replace("RT-2025-", ""), 10));
    return `RT-2025-${String(Math.max(...nums) + 1).padStart(3, "0")}`;
  }

  // -- Resend -------------------------------------------------------------------
  function openResend(r) {
    setResendRoute(r);
    setResendTo(getAdminsForCluster(r.cluster)[0]?.id ?? "");
    setResendDone(false);
  }
  function handleResend() {
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === resendRoute.id
          ? { ...r, status: "delivered", sentAt: new Date().toISOString(),
              sentTo: CLUSTER_ADMINS.find((a) => a.id === resendTo)?.name ?? r.sentTo }
          : r
      )
    );
    setResendDone(true);
  }

  // -- Create -------------------------------------------------------------------
  function openCreate() {
    setCreateForm({ cluster: "", assignTo: "", date: new Date().toISOString().split("T")[0], bins: [] });
    setCreateErrors({});
    setCreateStep(1);
    setCreateOpen(true);
  }
  function validateCreate() {
    const e = {};
    if (!createForm.cluster)          e.cluster  = "Select a cluster.";
    if (!createForm.assignTo)         e.assignTo = "Select a cluster admin.";
    if (createForm.bins.length === 0) e.bins     = "Select at least one bin.";
    return e;
  }
  function handleCreateNext() {
    const e = validateCreate();
    if (Object.keys(e).length) { setCreateErrors(e); return; }
    setCreateStep(2);
  }
  function handleCreateConfirm() {
    const admin = CLUSTER_ADMINS.find((a) => a.id === createForm.assignTo);
    const newRoute = {
      id:                 `r${Date.now()}`,
      routeId:            nextRouteId(),
      date:               createForm.date,
      cluster:            createForm.cluster,
      bins:               createForm.bins,
      distanceKm:         parseFloat((createForm.bins.length * 1.4 + 0.8).toFixed(1)),
      estimatedMinutes:   Math.round(createForm.bins.length * 11 + 8),
      sentTo:             admin?.name ?? "—",
      status:             "delivered",
      optimizedAt:        new Date().toISOString(),
      sentAt:             new Date().toISOString(),
    };
    setRoutes((prev) => [newRoute, ...prev]);
    setCreateStep(3);
  }
  function toggleBin(binId) {
    setCreateForm((prev) => ({
      ...prev,
      bins: prev.bins.includes(binId)
        ? prev.bins.filter((b) => b !== binId)
        : [...prev.bins, binId],
    }));
  }

  // -- Render -------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Route Management</h1>
      </div>

      {/* -- OPTIMIZE ROUTE PANEL -------------------------------------------- */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center gap-2">
            <Cpu size={17} color="#2E7D32" />
            <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>Optimize Route</h2>
          </div>
          {sent && (
            <span className="flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold"
              style={{ fontSize: 12, background: "#E8F5E9", color: "#2E7D32" }}>
              <CheckCircle size={13} /> Sent Successfully
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Controls row */}
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-text-muted font-medium" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Optimize for
              </label>
              <select
                value={selectedCluster}
                onChange={(e) => handleClusterChange(e.target.value)}
                className="rounded-lg px-3 py-2 font-semibold outline-none"
                style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#1A1A1A", minWidth: 200 }}
              >
                {CLUSTERS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-text-muted font-medium" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Full bins
                </label>
                <span className="rounded-lg px-3 py-2 font-bold text-center"
                  style={{
                    fontSize: 13,
                    background: fullBinCount > 0 ? "#FFEBEE" : "#E8F5E9",
                    color: fullBinCount > 0 ? "#DC2626" : "#2E7D32",
                    border: `1.5px solid ${fullBinCount > 0 ? "#FFCDD2" : "#C8E6C9"}`,
                    minWidth: 60,
                  }}>
                  {fullBinCount} {fullBinCount === 1 ? "bin" : "bins"}
                </span>
              </div>

            {!optimized ? (
              <button
                onClick={handleOptimize}
                disabled={fullBinCount === 0}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontSize: 13, background: "#2E7D32" }}
              >
                <Cpu size={14} />
                Optimize Route
              </button>
            ) : sent ? (
              <button
                onClick={() => { setOptimized(false); setSent(false); setSelectedCluster("c1"); }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors"
                style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280" }}
              >
                Optimize Another
              </button>
            ) : (
              <button
                onClick={() => setShowRouteDetails(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: "#2E7D32" }}
              >
                <Send size={14} />
                Send to Collector Admin
              </button>
            )}
          </div>

          {optimized && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "#E8F5E9", border: "1px solid #A5D6A7" }}>
              <CheckCircle size={16} color="#2E7D32" />
              <span className="font-semibold" style={{ fontSize: 13, color: "#2E7D32" }}>
                Route Optimized — {clusterLabel}
              </span>
              <span className="text-text-secondary" style={{ fontSize: 13 }}>
                · {optimizeRoute.bins.length} bins · Est. {optimizeRoute.estimatedMinutes} min · {optimizeRoute.distanceKm} km
              </span>
            </div>
          )}

          {fullBinCount === 0 && !optimized && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "#FFF3E0", border: "1px solid #FFE0B2" }}>
              <MapPin size={16} color="#D97706" className="flex-shrink-0" />
              <p style={{ fontSize: 13, color: "#E65100" }}>
                No full bins in <strong>{clusterLabel}</strong>. Select a different cluster or switch to City-wide view.
              </p>
            </div>
          )}

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              <MapView
                bins={filteredBins}
                trucks={TRUCKS}
                mrfs={filteredMRFs}
                routeOrder={optimized ? optimizeRoute.order : []}
                showRoute={optimized}
                height={380}
              />
            </div>

            <div className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
              {!optimized ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                  <MapPin size={36} color="#9CA3AF" />
                  <p className="text-text-muted text-center" style={{ fontSize: 13 }}>
                    Click "Optimize Route" to calculate the best collection path for {clusterLabel}.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-text-primary" style={{ fontSize: 15 }}>Route Details</h3>
                    <span className="rounded-full px-2.5 py-0.5 font-semibold"
                      style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}>
                      {clusterLabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: <Ruler size={13} color="#6B7280" />, label: "Distance",   value: `${optimizeRoute.distanceKm} km` },
                      { icon: <Clock size={13} color="#6B7280" />, label: "Est. Time",  value: `${optimizeRoute.estimatedMinutes} min` },
                      { icon: <MapPin size={13} color="#6B7280" />, label: "Bins",      value: optimizeRoute.bins.length },
                      { icon: <Cpu size={13} color="#6B7280" />,   label: "Algorithm", value: "Nearest Neighbor" },
                    ].map((t) => (
                      <div key={t.label} className="rounded-lg p-2.5 flex flex-col gap-1"
                        style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
                        <div className="flex items-center gap-1">
                          {t.icon}
                          <span className="text-text-muted" style={{ fontSize: 10 }}>{t.label}</span>
                        </div>
                        <span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{t.value}</span>
                      </div>
                    ))}
                  </div>
                  {sentToAdmin && (
                    <div className="rounded-lg px-3 py-2 flex items-center gap-2"
                      style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
                      <div className="flex items-center justify-center rounded-full flex-shrink-0"
                        style={{ width: 26, height: 26, background: "#E8F5E9" }}>
                        <span style={{ fontSize: 11 }}>??</span>
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary" style={{ fontSize: 12 }}>{sentToAdmin.name}</p>
                        <p className="text-text-muted" style={{ fontSize: 10 }}>Cluster Admin · {clusterLabel}</p>
                      </div>
                    </div>
                  )}
                  <p className="text-text-muted" style={{ fontSize: 11 }}>Optimized at {optimizedAt}</p>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2" style={{ fontSize: 13 }}>Collection Order</h4>
                    <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: 160 }}>
                      {optimizeRoute.order.map((stop, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-white"
                            style={{ width: 22, height: 22, fontSize: 10, background: stop.type === "depot" ? "#D97706" : "#2E7D32" }}>
                            {stop.type === "depot" ? "D" : i}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary" style={{ fontSize: 12 }}>{stop.label}</div>
                            {stop.street && <div className="text-text-muted" style={{ fontSize: 10 }}>{stop.street}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* -- ROUTE HISTORY --------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-text-primary" style={{ fontSize: 18 }}>Route History</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 flex items-center gap-3 flex-wrap"
        style={{ border: "1px solid #E5E7EB" }}>
        {/* Month & Year */}
        <select value={monthFilter}
          onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
          className="rounded-lg px-3 py-1.5 outline-none"
          style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A", minWidth: 160 }}>
          <option value="all">All Months</option>
          {monthOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Cluster */}
        <select value={clusterFilter}
          onChange={(e) => { setClusterFilter(e.target.value); setPage(1); }}
          className="rounded-lg px-3 py-1.5 outline-none"
          style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}>
          <option value="all">All Clusters</option>
          {CLUSTERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        {/* Status */}
        <select value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg px-3 py-1.5 outline-none"
          style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}>
          <option value="all">All Statuses</option>
          <option value="delivered">Delivered</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {(monthFilter !== "all" || clusterFilter !== "all" || statusFilter !== "all") && (
          <button
            onClick={() => { setMonthFilter("all"); setClusterFilter("all"); setStatusFilter("all"); setPage(1); }}
            className="rounded-lg px-3 py-1.5 font-medium hover:bg-red-50 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #FECACA", color: "#DC2626", background: "#FFF5F5" }}>
            ? Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Route ID", "Date", "Cluster", "Bins", "Distance", "Est. Time", "Sent To", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                  style={{ fontSize: 11, color: "#6B7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-text-muted py-10" style={{ fontSize: 14 }}>
                  No routes match the selected filters.
                </td>
              </tr>
            ) : (
              paginated.map((r, i) => (
                <tr key={r.id}
                  style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                  <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{r.routeId}</td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{r.date}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13 }}>
                    <span className="rounded-full px-2.5 py-0.5 font-medium"
                      style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}>
                      {getClusterLabel(r.cluster)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{r.bins.length} bins</td>
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{r.distanceKm} km</td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{r.estimatedMinutes} min</td>
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{r.sentTo}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewRoute(r)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium hover:bg-gray-100 transition-colors"
                        style={{ fontSize: 12, color: "#6B7280", border: "1px solid #E5E7EB" }}
                        title="View details">
                        <Eye size={13} /> View
                      </button>
                      <button onClick={() => openResend(r)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium hover:bg-green-50 transition-colors"
                        style={{ fontSize: 12, color: "#2E7D32", border: "1px solid #C8E6C9" }}
                        title="Resend route">
                        <Send size={13} /> Resend
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "#F3F4F6" }}>
          <span className="text-text-muted" style={{ fontSize: 13 }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} routes
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors">
              <ChevronLeft size={16} color="#6B7280" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg font-medium transition-colors"
                style={{ fontSize: 13, background: p === page ? "#2E7D32" : "transparent", color: p === page ? "#fff" : "#6B7280" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors">
              <ChevronRight size={16} color="#6B7280" />
            </button>
          </div>
        </div>
      </div>

      {/* -- ROUTE DETAILS MODAL (shown after Optimize, before Send) -------- */}
      <Modal
        open={showRouteDetails}
        onClose={() => setShowRouteDetails(false)}
        title="Route Details"
        footer={
          <>
            <button
              onClick={() => setShowRouteDetails(false)}
              className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSendRoute}
              disabled={sending}
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, background: "#2E7D32", opacity: sending ? 0.7 : 1 }}
            >
              <Send size={14} />
              {sending ? "Sending…" : "Send to Collector Admin"}
            </button>
          </>
        }
      >
        {/* Route ID banner */}
        <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-1"
          style={{ background: "#FFF8F0", border: "1px solid #FFE0B2" }}>
          <div className="flex items-center gap-2">
            <Route size={18} color="#D97706" />
            <span className="font-bold text-text-primary" style={{ fontSize: 16 }}>{optimizeRoute.routeId}</span>
          </div>
          <span className="rounded-full px-3 py-0.5 font-semibold"
            style={{ fontSize: 12, background: "#E8F5E9", color: "#2E7D32" }}>
            Ready to Send
          </span>
        </div>

        {/* Key info rows */}
        <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #F3F4F6" }}>
          <InfoRow label="Date"           value={new Date().toISOString().split("T")[0]} />
          <InfoRow label="Cluster"        value={clusterLabel} />
          <InfoRow label="Sent To"        value={sentToAdmin?.name ?? "Cluster Admin"} />
          <InfoRow label="Distance"       value={`${optimizeRoute.distanceKm} km`} />
          <InfoRow label="Est. Duration"  value={`${optimizeRoute.estimatedMinutes} min`} />
          <InfoRow label="Bins Scheduled" value={`${optimizeRoute.bins.length} bins`} />
        </div>

        {/* Scheduled bins */}
        <p className="font-semibold text-text-primary mb-2" style={{ fontSize: 13 }}>Scheduled Bins</p>
        <div className="flex flex-col gap-1.5">
          {optimizeRoute.bins.map((binId, idx) => {
            const bin = BINS.find((b) => b.id === binId);
            return (
              <div key={binId} className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                <span className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
                  style={{ width: 22, height: 22, fontSize: 10, background: "#2E7D32" }}>
                  {idx + 1}
                </span>
                <MapPin size={13} color="#6B7280" className="flex-shrink-0" />
                <span className="text-text-secondary" style={{ fontSize: 13 }}>
                  {bin ? `${bin.name} — ${bin.street}, ${bin.barangay}` : binId}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* -- VIEW DETAILS MODAL ----------------------------------------------- */}
      <Modal
        open={!!viewRoute}
        onClose={() => setViewRoute(null)}
        title="Route Details"
        footer={
          <button onClick={() => setViewRoute(null)}
            className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90"
            style={{ fontSize: 14, background: "#2E7D32" }}>
            Close
          </button>
        }
      >
        {viewRoute && (
          <div className="flex flex-col gap-4">
            {/* Route ID + status */}
            <div className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: STATUS_COLORS[viewRoute.status]?.bg ?? "#F3F4F6", border: "1px solid #E5E7EB" }}>
              <div className="flex items-center gap-2">
                <Route size={18} color={STATUS_COLORS[viewRoute.status]?.color ?? "#6B7280"} />
                <span className="font-bold text-text-primary" style={{ fontSize: 16 }}>{viewRoute.routeId}</span>
              </div>
              <StatusBadge status={viewRoute.status} />
            </div>

            {/* Key info */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              <InfoRow label="Date"           value={viewRoute.date} />
              <InfoRow label="Cluster"        value={getClusterLabel(viewRoute.cluster)} />
              <InfoRow label="Sent To"        value={viewRoute.sentTo} />
              <InfoRow label="Distance"       value={`${viewRoute.distanceKm} km`} />
              <InfoRow label="Est. Duration"  value={`${viewRoute.estimatedMinutes} min`} />
              <InfoRow label="Bins Scheduled" value={`${viewRoute.bins.length} bins`} />
            </div>

            {/* Bin list */}
            <div>
              <p className="font-semibold text-text-primary mb-2" style={{ fontSize: 13 }}>Scheduled Bins</p>
              <div className="flex flex-col gap-1.5">
                {viewRoute.bins.map((binId, idx) => {
                  const bin = BINS.find((b) => b.id === binId);
                  return (
                    <div key={binId} className="flex items-center gap-3 rounded-lg px-3 py-2"
                      style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                      <span className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
                        style={{ width: 22, height: 22, fontSize: 10, background: "#2E7D32" }}>
                        {idx + 1}
                      </span>
                      <MapPin size={13} color="#6B7280" className="flex-shrink-0" />
                      <span className="text-text-secondary" style={{ fontSize: 13 }}>
                        {bin ? `${bin.name} — ${bin.street}, ${bin.barangay}` : binId}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* -- RESEND MODAL ----------------------------------------------------- */}
      <Modal
        open={!!resendRoute}
        onClose={() => { setResendRoute(null); setResendDone(false); }}
        title="Resend Route"
        footer={
          resendDone ? (
            <button onClick={() => { setResendRoute(null); setResendDone(false); }}
              className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90"
              style={{ fontSize: 14, background: "#2E7D32" }}>
              Done
            </button>
          ) : (
            <>
              <button onClick={() => setResendRoute(null)}
                className="rounded-lg px-4 py-2 font-medium"
                style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>
                Cancel
              </button>
              <button onClick={handleResend} disabled={!resendTo}
                className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ fontSize: 14, background: "#2E7D32" }}>
                <Send size={14} /> Resend Route
              </button>
            </>
          )
        }
      >
        {resendRoute && (
          resendDone ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex items-center justify-center rounded-full"
                style={{ width: 56, height: 56, background: "#E8F5E9" }}>
                <CheckCircle size={28} color="#2E7D32" />
              </div>
              <p className="font-semibold text-text-primary text-center" style={{ fontSize: 15 }}>
                Route resent successfully!
              </p>
              <p className="text-text-secondary text-center" style={{ fontSize: 13 }}>
                <strong>{resendRoute.routeId}</strong> has been resent to{" "}
                <strong>{CLUSTER_ADMINS.find((a) => a.id === resendTo)?.name}</strong>.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "#FFF3E0", border: "1px solid #FFE0B2" }}>
                <AlertTriangle size={16} color="#D97706" className="flex-shrink-0" />
                <p style={{ fontSize: 13, color: "#E65100" }}>
                  This will mark the route as <strong>Delivered</strong> and notify the assigned admin.
                </p>
              </div>
              <InfoRow label="Route ID" value={resendRoute.routeId} />
              <InfoRow label="Cluster"  value={getClusterLabel(resendRoute.cluster)} />
              <InfoRow label="Bins"     value={`${resendRoute.bins.length} bins · ${resendRoute.distanceKm} km`} />
              <div className="flex flex-col gap-1">
                <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Send To</label>
                <select value={resendTo} onChange={(e) => setResendTo(e.target.value)}
                  className="rounded-lg px-3 py-2.5 outline-none"
                  style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}>
                  {getAdminsForCluster(resendRoute.cluster).map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                  {getAdminsForCluster(resendRoute.cluster).length === 0 && (
                    <option value="">No active admins for this cluster</option>
                  )}
                </select>
              </div>
            </div>
          )
        )}
      </Modal>

      {/* -- CREATE ROUTE MODAL ----------------------------------------------- */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={
          createStep === 1 ? "Generate New Route"
          : createStep === 2 ? "Preview Route"
          : "Route Created"
        }
        footer={
          createStep === 1 ? (
            <>
              <button onClick={() => setCreateOpen(false)}
                className="rounded-lg px-4 py-2 font-medium"
                style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>
                Cancel
              </button>
              <button onClick={handleCreateNext}
                className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 14, background: "#2E7D32" }}>
                Preview Route
              </button>
            </>
          ) : createStep === 2 ? (
            <>
              <button onClick={() => setCreateStep(1)}
                className="rounded-lg px-4 py-2 font-medium"
                style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>
                Back to Edit
              </button>
              <button onClick={handleCreateConfirm}
                className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 14, background: "#2E7D32" }}>
                <Send size={14} /> Confirm &amp; Send
              </button>
            </>
          ) : (
            <button onClick={() => setCreateOpen(false)}
              className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90"
              style={{ fontSize: 14, background: "#2E7D32" }}>
              Done
            </button>
          )
        }
      >
        {/* Step 1 — Form */}
        {createStep === 1 && (
          <div className="flex flex-col gap-4">
            {/* Cluster */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Cluster</label>
              <select
                value={createForm.cluster}
                onChange={(e) => {
                  setCreateForm((p) => ({ ...p, cluster: e.target.value, assignTo: "", bins: [] }));
                  setCreateErrors((p) => ({ ...p, cluster: undefined }));
                }}
                className="rounded-lg px-3 py-2.5 outline-none"
                style={{ fontSize: 14, border: createErrors.cluster ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}
              >
                <option value="">Select a cluster…</option>
                {CLUSTERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              {createErrors.cluster && <span style={{ fontSize: 12, color: "#DC2626" }}>{createErrors.cluster}</span>}
            </div>

            {/* Assign To */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Assign To</label>
              <select
                value={createForm.assignTo}
                onChange={(e) => {
                  setCreateForm((p) => ({ ...p, assignTo: e.target.value }));
                  setCreateErrors((p) => ({ ...p, assignTo: undefined }));
                }}
                disabled={!createForm.cluster}
                className="rounded-lg px-3 py-2.5 outline-none"
                style={{ fontSize: 14, border: createErrors.assignTo ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: !createForm.cluster ? "#F3F4F6" : "#F9FAFB", color: !createForm.cluster ? "#9CA3AF" : "#1A1A1A" }}
              >
                <option value="">{createForm.cluster ? "Select a cluster admin…" : "Select a cluster first"}</option>
                {createForm.cluster && getAdminsForCluster(createForm.cluster).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {createErrors.assignTo && <span style={{ fontSize: 12, color: "#DC2626" }}>{createErrors.assignTo}</span>}
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Collection Date</label>
              <input
                type="date"
                value={createForm.date}
                onChange={(e) => setCreateForm((p) => ({ ...p, date: e.target.value }))}
                className="rounded-lg px-3 py-2.5 outline-none"
                style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }}
              />
            </div>

            {/* Bin selector */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
                Select Bins
                {createForm.bins.length > 0 && (
                  <span className="ml-2 rounded-full px-2 py-0.5 font-semibold text-white"
                    style={{ fontSize: 11, background: "#2E7D32" }}>
                    {createForm.bins.length} selected
                  </span>
                )}
              </label>
              {!createForm.cluster ? (
                <p className="text-text-muted rounded-lg px-3 py-3 text-center"
                  style={{ fontSize: 13, background: "#F9FAFB", border: "1.5px solid #E5E7EB" }}>
                  Select a cluster to see available bins
                </p>
              ) : (
                <div className="rounded-lg overflow-hidden flex flex-col gap-0"
                  style={{ border: createErrors.bins ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", maxHeight: 220, overflowY: "auto" }}>
                  {getBinsForCluster(createForm.cluster).map((bin, i) => {
                    const selected = createForm.bins.includes(bin.id);
                    return (
                      <button
                        key={bin.id}
                        type="button"
                        onClick={() => {
                          toggleBin(bin.id);
                          setCreateErrors((p) => ({ ...p, bins: undefined }));
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 text-left transition-colors w-full"
                        style={{
                          background: selected ? "#E8F5E9" : i % 2 === 0 ? "#fff" : "#FAFAFA",
                          borderBottom: "1px solid #F3F4F6",
                        }}
                      >
                        {/* Checkbox */}
                        <div className="flex-shrink-0 flex items-center justify-center rounded"
                          style={{ width: 18, height: 18, background: selected ? "#2E7D32" : "#fff", border: selected ? "none" : "1.5px solid #D1D5DB" }}>
                          {selected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <MapPin size={13} color={selected ? "#2E7D32" : "#9CA3AF"} className="flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-text-primary" style={{ fontSize: 13 }}>{bin.name}</span>
                          <span className="text-text-muted ml-2" style={{ fontSize: 12 }}>{bin.street}, {bin.barangay}</span>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 font-semibold flex-shrink-0"
                          style={{
                            fontSize: 10,
                            background: bin.status === "full" ? "#FFEBEE" : bin.status === "missed" ? "#FFF3E0" : "#F3F4F6",
                            color: bin.status === "full" ? "#DC2626" : bin.status === "missed" ? "#D97706" : "#6B7280",
                          }}
                        >
                          {bin.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {createErrors.bins && <span style={{ fontSize: 12, color: "#DC2626" }}>{createErrors.bins}</span>}
            </div>
          </div>
        )}

        {/* Step 2 — Preview */}
        {createStep === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "#E8F5E9", border: "1px solid #C8E6C9" }}>
              <Route size={16} color="#2E7D32" className="flex-shrink-0" />
              <p style={{ fontSize: 13, color: "#1B5E20" }}>
                Review the route details below before sending to the cluster admin.
              </p>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              <InfoRow label="Route ID"       value={nextRouteId()} />
              <InfoRow label="Date"           value={createForm.date} />
              <InfoRow label="Cluster"        value={getClusterLabel(createForm.cluster)} />
              <InfoRow label="Assign To"      value={CLUSTER_ADMINS.find((a) => a.id === createForm.assignTo)?.name ?? "—"} />
              <InfoRow label="Bins Selected"  value={`${createForm.bins.length} bins`} />
              <InfoRow label="Est. Distance"  value={`${(createForm.bins.length * 1.4 + 0.8).toFixed(1)} km`} />
              <InfoRow label="Est. Duration"  value={`${Math.round(createForm.bins.length * 11 + 8)} min`} />
            </div>

            <div>
              <p className="font-semibold text-text-primary mb-2" style={{ fontSize: 13 }}>Selected Bins</p>
              <div className="flex flex-col gap-1.5">
                {createForm.bins.map((binId, idx) => {
                  const bin = BINS.find((b) => b.id === binId);
                  return (
                    <div key={binId} className="flex items-center gap-3 rounded-lg px-3 py-2"
                      style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                      <span className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
                        style={{ width: 22, height: 22, fontSize: 10, background: "#2E7D32" }}>
                        {idx + 1}
                      </span>
                      <MapPin size={13} color="#6B7280" className="flex-shrink-0" />
                      <span className="text-text-secondary" style={{ fontSize: 13 }}>
                        {bin ? `${bin.name} — ${bin.street}, ${bin.barangay}` : binId}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Success */}
        {createStep === 3 && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex items-center justify-center rounded-full"
              style={{ width: 64, height: 64, background: "#E8F5E9" }}>
              <CheckCircle size={32} color="#2E7D32" />
            </div>
            <p className="font-bold text-text-primary text-center" style={{ fontSize: 17 }}>
              Route Created &amp; Sent!
            </p>
            <p className="text-text-secondary text-center" style={{ fontSize: 13 }}>
              Route <strong>{routes[0]?.routeId}</strong> has been sent to{" "}
              <strong>{CLUSTER_ADMINS.find((a) => a.id === createForm.assignTo)?.name}</strong> for{" "}
              <strong>{getClusterLabel(createForm.cluster)}</strong>.
            </p>
            <div className="flex items-center gap-4 mt-2 rounded-xl px-5 py-3 w-full justify-center"
              style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-bold text-text-primary" style={{ fontSize: 18 }}>{createForm.bins.length}</span>
                <span className="text-text-muted" style={{ fontSize: 11 }}>Bins</span>
              </div>
              <div style={{ width: 1, height: 32, background: "#E5E7EB" }} />
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-bold text-text-primary" style={{ fontSize: 18 }}>
                  {(createForm.bins.length * 1.4 + 0.8).toFixed(1)} km
                </span>
                <span className="text-text-muted" style={{ fontSize: 11 }}>Distance</span>
              </div>
              <div style={{ width: 1, height: 32, background: "#E5E7EB" }} />
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-bold text-text-primary" style={{ fontSize: 18 }}>
                  {Math.round(createForm.bins.length * 11 + 8)} min
                </span>
                <span className="text-text-muted" style={{ fontSize: 11 }}>Est. Time</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

