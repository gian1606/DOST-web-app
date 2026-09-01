import { useState, useMemo } from "react";
import { Plus, Eye, Send, ChevronLeft, ChevronRight, Route, MapPin, Clock, CheckCircle, Truck, Cpu, Ruler } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import Modal       from "../components/ui/Modal";
import MapView     from "../components/ui/MapView";
import { ROUTES, BINS, TRUCKS, MRF_LOCATIONS, OPTIMIZED_ROUTE } from "../mock/data";

// Build optimized route from all full bins
function buildRoute(allBins) {
  const fullBins = allBins.filter((b) => b.status === "full");
  if (fullBins.length === 0) return null;
  return {
    routeId:          "RT-2025-006",
    bins:             fullBins.map((b) => b.id),
    distanceKm:       parseFloat((fullBins.length * 1.4 + 0.8).toFixed(1)),
    estimatedMinutes: Math.round(fullBins.length * 11 + 8),
    algorithm:        "Nearest Neighbor",
    optimizedAt:      new Date().toISOString(),
    order: [
      { label: "Truck Depot", type: "depot", posX: 0.10, posY: 0.85 },
      ...fullBins.map((b) => ({ binId: b.id, label: b.name, street: b.street, posX: b.posX, posY: b.posY })),
    ],
  };
}

const PAGE_SIZE = 5;

const STATUS_COLORS = {
  completed:   { bg: "#E8F5E9", color: "#2E7D32" },
  in_progress: { bg: "#E3F2FD", color: "#1976D2" },
  delivered:   { bg: "#FFF3E0", color: "#D97706" },
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0" style={{ borderColor: "#F3F4F6" }}>
      <span className="text-text-muted font-medium flex-shrink-0" style={{ fontSize: 13 }}>{label}</span>
      <span className="text-text-primary font-semibold text-right" style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}

export default function RouteManagement() {
  const [routes, setRoutes] = useState(ROUTES);

  // Optimize panel
  const [optimized, setOptimized]               = useState(false);
  const [sending, setSending]                   = useState(false);
  const [sent, setSent]                         = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);

  const fullBinCount   = BINS.filter((b) => b.status === "full").length;
  const optimizeRoute  = buildRoute(BINS) ?? OPTIMIZED_ROUTE;

  function handleOptimize() { setOptimized(true); setSent(false); setShowRouteDetails(true); }

  function handleSendRoute() {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setShowRouteDetails(false);
      setRoutes((prev) => [
        {
          id:               `r${Date.now()}`,
          routeId:          optimizeRoute.routeId,
          date:             new Date().toISOString().split("T")[0],
          bins:             optimizeRoute.bins,
          distanceKm:       optimizeRoute.distanceKm,
          estimatedMinutes: optimizeRoute.estimatedMinutes,
          sentTo:           "Collector Admin",
          status:           "delivered",
          optimizedAt:      optimizeRoute.optimizedAt,
          sentAt:           new Date().toISOString(),
        },
        ...prev,
      ]);
    }, 800);
  }

  const optimizedAt = new Date(optimizeRoute.optimizedAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

  // History filters
  const [monthFilter, setMonthFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]                 = useState(1);

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

  const [viewRoute,  setViewRoute]  = useState(null);
  const [resendRoute, setResendRoute] = useState(null);
  const [resendDone,  setResendDone]  = useState(false);

  const filtered = routes.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (monthFilter  !== "all" && !r.date.startsWith(monthFilter)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getBinLabel(binId) {
    const b = BINS.find((x) => x.id === binId);
    return b ? `${b.name} — ${b.street}, ${b.barangay}` : binId;
  }
  function nextRouteId() {
    const nums = routes.map((r) => parseInt(r.routeId.replace("RT-2025-", ""), 10));
    return `RT-2025-${String(Math.max(...nums) + 1).padStart(3, "0")}`;
  }

  function openResend(r) { setResendRoute(r); setResendDone(false); }
  function handleResend() {
    setRoutes((prev) =>
      prev.map((r) => r.id === resendRoute.id
        ? { ...r, status: "delivered", sentAt: new Date().toISOString() } : r)
    );
    setResendDone(true);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Route Management</h1>
      </div>

      {/* OPTIMIZE PANEL */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
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
          <div className="flex items-end gap-4 flex-wrap">
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
              <button onClick={handleOptimize} disabled={fullBinCount === 0}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontSize: 13, background: "#2E7D32" }}>
                <Cpu size={14} /> Optimize Route
              </button>
            ) : sent ? (
              <button onClick={() => { setOptimized(false); setSent(false); }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors"
                style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280" }}>
                Optimize Another
              </button>
            ) : (
              <button onClick={() => setShowRouteDetails(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: "#2E7D32" }}>
                <Send size={14} /> Send to Collector Admin
              </button>
            )}
          </div>

          {optimized && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "#E8F5E9", border: "1px solid #A5D6A7" }}>
              <CheckCircle size={16} color="#2E7D32" />
              <span className="font-semibold" style={{ fontSize: 13, color: "#2E7D32" }}>Route Optimized — Batangas City</span>
              <span className="text-text-secondary" style={{ fontSize: 13 }}>
                — {optimizeRoute.bins.length} bins · Est. {optimizeRoute.estimatedMinutes} min · {optimizeRoute.distanceKm} km
              </span>
            </div>
          )}

          {fullBinCount === 0 && !optimized && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "#FFF3E0", border: "1px solid #FFE0B2" }}>
              <MapPin size={16} color="#D97706" className="flex-shrink-0" />
              <p style={{ fontSize: 13, color: "#E65100" }}>No full bins reported. All bins are currently OK or collected.</p>
            </div>
          )}

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              <MapView bins={BINS} trucks={TRUCKS} mrfs={MRF_LOCATIONS}
                routeOrder={optimized ? optimizeRoute.order : []}
                showRoute={optimized} height={380} />
            </div>

            <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
              {!optimized ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                  <MapPin size={36} color="#9CA3AF" />
                  <p className="text-text-muted text-center" style={{ fontSize: 13 }}>
                    Click "Optimize Route" to calculate the best collection path for Batangas City.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-text-primary" style={{ fontSize: 15 }}>Route Details</h3>
                    <span className="rounded-full px-2.5 py-0.5 font-semibold"
                      style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}>Batangas City</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: <Ruler size={13} color="#6B7280" />, label: "Distance",  value: `${optimizeRoute.distanceKm} km` },
                      { icon: <Clock size={13} color="#6B7280" />, label: "Est. Time", value: `${optimizeRoute.estimatedMinutes} min` },
                      { icon: <MapPin size={13} color="#6B7280" />, label: "Bins",     value: optimizeRoute.bins.length },
                      { icon: <Cpu size={13} color="#6B7280" />,   label: "Algorithm",value: "Nearest Neighbor" },
                    ].map((t) => (
                      <div key={t.label} className="rounded-lg p-2.5 flex flex-col gap-1"
                        style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
                        <div className="flex items-center gap-1">{t.icon}<span className="text-text-muted" style={{ fontSize: 10 }}>{t.label}</span></div>
                        <span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{t.value}</span>
                      </div>
                    ))}
                  </div>
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

      {/* ROUTE HISTORY */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-text-primary" style={{ fontSize: 18 }}>Route History</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 flex items-center gap-3 flex-wrap" style={{ border: "1px solid #E5E7EB" }}>
        <select value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
          className="rounded-lg px-3 py-1.5 outline-none"
          style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A", minWidth: 160 }}>
          <option value="all">All Months</option>
          {monthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg px-3 py-1.5 outline-none"
          style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}>
          <option value="all">All Statuses</option>
          <option value="delivered">Delivered</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {(monthFilter !== "all" || statusFilter !== "all") && (
          <button onClick={() => { setMonthFilter("all"); setStatusFilter("all"); setPage(1); }}
            className="rounded-lg px-3 py-1.5 font-medium hover:bg-red-50 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #FECACA", color: "#DC2626", background: "#FFF5F5" }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Route ID", "Date", "Bins", "Distance", "Est. Time", "Sent To", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                  style={{ fontSize: 11, color: "#6B7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-text-muted py-10" style={{ fontSize: 14 }}>
                No routes match the selected filters.
              </td></tr>
            ) : paginated.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{r.routeId}</td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{r.date}</td>
                <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{r.bins.length} bins</td>
                <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{r.distanceKm} km</td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{r.estimatedMinutes} min</td>
                <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{r.sentTo}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setViewRoute(r)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium hover:bg-gray-100 transition-colors"
                      style={{ fontSize: 12, color: "#6B7280", border: "1px solid #E5E7EB" }}>
                      <Eye size={13} /> View
                    </button>
                    <button onClick={() => openResend(r)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium hover:bg-green-50 transition-colors"
                      style={{ fontSize: 12, color: "#2E7D32", border: "1px solid #C8E6C9" }}>
                      <Send size={13} /> Resend
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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

      {/* Route Details Modal (after Optimize) */}
      <Modal open={showRouteDetails} onClose={() => setShowRouteDetails(false)} title="Route Details"
        footer={<>
          <button onClick={() => setShowRouteDetails(false)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
          <button onClick={handleSendRoute} disabled={sending}
            className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: "#2E7D32", opacity: sending ? 0.7 : 1 }}>
            <Send size={14} />{sending ? "Sending…" : "Send to Collector Admin"}
          </button>
        </>}>
        <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-1"
          style={{ background: "#FFF8F0", border: "1px solid #FFE0B2" }}>
          <div className="flex items-center gap-2">
            <Route size={18} color="#D97706" />
            <span className="font-bold text-text-primary" style={{ fontSize: 16 }}>{optimizeRoute.routeId}</span>
          </div>
          <span className="rounded-full px-3 py-0.5 font-semibold"
            style={{ fontSize: 12, background: "#E8F5E9", color: "#2E7D32" }}>Ready to Send</span>
        </div>
        <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #F3F4F6" }}>
          <InfoRow label="Date"           value={new Date().toISOString().split("T")[0]} />
          <InfoRow label="Sent To"        value="Collector Admin" />
          <InfoRow label="Distance"       value={`${optimizeRoute.distanceKm} km`} />
          <InfoRow label="Est. Duration"  value={`${optimizeRoute.estimatedMinutes} min`} />
          <InfoRow label="Bins Scheduled" value={`${optimizeRoute.bins.length} bins`} />
        </div>
        <p className="font-semibold text-text-primary mb-2" style={{ fontSize: 13 }}>Scheduled Bins</p>
        <div className="flex flex-col gap-1.5">
          {optimizeRoute.bins.map((binId, idx) => {
            const bin = BINS.find((b) => b.id === binId);
            return (
              <div key={binId} className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                <span className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
                  style={{ width: 22, height: 22, fontSize: 10, background: "#2E7D32" }}>{idx + 1}</span>
                <MapPin size={13} color="#6B7280" className="flex-shrink-0" />
                <span className="text-text-secondary" style={{ fontSize: 13 }}>
                  {bin ? `${bin.name} — ${bin.street}, ${bin.barangay}` : binId}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal open={!!viewRoute} onClose={() => setViewRoute(null)} title="Route Details"
        footer={<button onClick={() => setViewRoute(null)}
          className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90"
          style={{ fontSize: 14, background: "#2E7D32" }}>Close</button>}>
        {viewRoute && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: STATUS_COLORS[viewRoute.status]?.bg ?? "#F3F4F6", border: "1px solid #E5E7EB" }}>
              <div className="flex items-center gap-2">
                <Route size={18} color={STATUS_COLORS[viewRoute.status]?.color ?? "#6B7280"} />
                <span className="font-bold text-text-primary" style={{ fontSize: 16 }}>{viewRoute.routeId}</span>
              </div>
              <StatusBadge status={viewRoute.status} />
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              <InfoRow label="Date"           value={viewRoute.date} />
              <InfoRow label="Sent To"        value={viewRoute.sentTo} />
              <InfoRow label="Distance"       value={`${viewRoute.distanceKm} km`} />
              <InfoRow label="Est. Duration"  value={`${viewRoute.estimatedMinutes} min`} />
              <InfoRow label="Bins Scheduled" value={`${viewRoute.bins.length} bins`} />
            </div>
            <div>
              <p className="font-semibold text-text-primary mb-2" style={{ fontSize: 13 }}>Scheduled Bins</p>
              <div className="flex flex-col gap-1.5">
                {viewRoute.bins.map((binId, idx) => {
                  const bin = BINS.find((b) => b.id === binId);
                  return (
                    <div key={binId} className="flex items-center gap-3 rounded-lg px-3 py-2"
                      style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                      <span className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
                        style={{ width: 22, height: 22, fontSize: 10, background: "#2E7D32" }}>{idx + 1}</span>
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

      {/* Resend Modal */}
      <Modal open={!!resendRoute} onClose={() => { setResendRoute(null); setResendDone(false); }} title="Resend Route"
        footer={resendDone ? (
          <button onClick={() => { setResendRoute(null); setResendDone(false); }}
            className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90"
            style={{ fontSize: 14, background: "#2E7D32" }}>Done</button>
        ) : (
          <>
            <button onClick={() => setResendRoute(null)}
              className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
            <button onClick={handleResend}
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, background: "#2E7D32" }}>
              <Send size={14} /> Resend Route
            </button>
          </>
        )}>
        {resendRoute && (resendDone ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: "#E8F5E9" }}>
              <CheckCircle size={28} color="#2E7D32" />
            </div>
            <p className="font-semibold text-text-primary text-center" style={{ fontSize: 15 }}>Route resent successfully!</p>
            <p className="text-text-secondary text-center" style={{ fontSize: 13 }}>
              <strong>{resendRoute.routeId}</strong> has been resent to <strong>Collector Admin</strong>.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "#FFF3E0", border: "1px solid #FFE0B2" }}>
              <Send size={16} color="#D97706" className="flex-shrink-0" />
              <p style={{ fontSize: 13, color: "#E65100" }}>
                This will mark the route as <strong>Delivered</strong> and notify the Collector Admin.
              </p>
            </div>
            <InfoRow label="Route ID" value={resendRoute.routeId} />
            <InfoRow label="Bins"     value={`${resendRoute.bins.length} bins — ${resendRoute.distanceKm} km`} />
            <InfoRow label="Send To"  value="Collector Admin" />
          </div>
        ))}
      </Modal>
    </div>
  );
}
