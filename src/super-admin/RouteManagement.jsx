import { useState, useMemo } from "react";
import {
  Eye, Send, ChevronLeft, ChevronRight, Route, MapPin, Clock,
  CheckCircle, Truck, Cpu, Ruler, Filter, X,
} from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import Modal       from "../components/ui/Modal";
import MapView     from "../components/ui/MapView";
import { ROUTES, BINS, TRUCKS, MRF_LOCATIONS, OPTIMIZED_ROUTE } from "../mock/data";

// ── Build optimized route from all full bins ──────────────────────────────────
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

const STATUS_STYLE = {
  completed:   { bg: "#E8F5E9", color: "#2E7D32" },
  in_progress: { bg: "#E3F2FD", color: "#1976D2" },
  delivered:   { bg: "#FFF3E0", color: "#D97706" },
  cancelled:   { bg: "#FFEBEE", color: "#DC2626" },
};

// Unique truck numbers derived from mock data + any dynamically added routes
const TRUCK_OPTIONS = ["Truck #01", "Truck #02", "Truck #03", "Truck #04", "Truck #05", "Truck #06", "Truck #07"];

const MONTH_NAMES = [
  "Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo",
  "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre",
];

// ── Small helper components ───────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0" style={{ borderColor: "#F3F4F6" }}>
      <span className="text-text-muted font-medium flex-shrink-0" style={{ fontSize: 13 }}>{label}</span>
      <span className="text-text-primary font-semibold text-right" style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-text-muted font-medium" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>}
      <div className="relative flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded-lg pl-3 pr-8 py-2 outline-none font-medium"
          style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", minWidth: 140 }}
        >
          {children}
        </select>
        <svg className="absolute right-2.5 pointer-events-none" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2.5}><path d="M6 9l6 6 6-6"/></svg>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RouteManagement() {
  const [routes, setRoutes] = useState(ROUTES);

  // ── Optimize panel state ──────────────────────────────────────────────────
  const [optimized,        setOptimized]        = useState(false);
  const [sending,          setSending]          = useState(false);
  const [sent,             setSent]             = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);

  const fullBinCount  = BINS.filter((b) => b.status === "full").length;
  const optimizeRoute = buildRoute(BINS) ?? OPTIMIZED_ROUTE;

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
          truckNo:          "Truck #01",
          status:           "delivered",
          optimizedAt:      optimizeRoute.optimizedAt,
          sentAt:           new Date().toISOString(),
        },
        ...prev,
      ]);
    }, 800);
  }

  const optimizedAtLabel = new Date(optimizeRoute.optimizedAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

  // ── History filter state ──────────────────────────────────────────────────
  const [yearFilter,   setYearFilter]   = useState("all");
  const [monthFilter,  setMonthFilter]  = useState("all");
  const [dayFilter,    setDayFilter]    = useState("");        // YYYY-MM-DD or ""
  const [statusFilter, setStatusFilter] = useState("all");
  const [truckFilter,  setTruckFilter]  = useState("all");
  const [page,         setPage]         = useState(1);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [viewRoute,   setViewRoute]   = useState(null);
  const [resendRoute, setResendRoute] = useState(null);
  const [resendDone,  setResendDone]  = useState(false);

  // ── Derive year options from route data ───────────────────────────────────
  const yearOptions = useMemo(() => {
    const years = [...new Set(routes.map((r) => r.date.slice(0, 4)))].sort((a, b) => b - a);
    return years;
  }, [routes]);

  // ── Days available for the selected year+month ────────────────────────────
  const dayOptions = useMemo(() => {
    if (yearFilter === "all" || monthFilter === "all") return [];
    const mm = monthFilter.padStart(2, "0");
    const days = [...new Set(
      routes
        .filter((r) => r.date.startsWith(`${yearFilter}-${mm}`))
        .map((r) => r.date)
    )].sort();
    return days;
  }, [routes, yearFilter, monthFilter]);

  // ── Active filter count for badge ─────────────────────────────────────────
  const activeFilters = [
    yearFilter   !== "all",
    monthFilter  !== "all",
    dayFilter    !== "",
    statusFilter !== "all",
    truckFilter  !== "all",
  ].filter(Boolean).length;

  function clearFilters() {
    setYearFilter("all"); setMonthFilter("all"); setDayFilter("");
    setStatusFilter("all"); setTruckFilter("all"); setPage(1);
  }

  // ── Filtered + paginated data ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    return routes.filter((r) => {
      if (statusFilter !== "all" && r.status  !== statusFilter)  return false;
      if (truckFilter  !== "all" && r.truckNo !== truckFilter)   return false;
      if (yearFilter   !== "all" && !r.date.startsWith(yearFilter)) return false;
      if (monthFilter  !== "all") {
        const mm = monthFilter.padStart(2, "0");
        if (!r.date.startsWith(`${yearFilter !== "all" ? yearFilter : ""}`)) {
          // if no year selected, match just the month part
          if (yearFilter === "all" && r.date.slice(5, 7) !== mm) return false;
        } else {
          if (!r.date.startsWith(`${yearFilter}-${mm}`)) return false;
        }
      }
      if (dayFilter && r.date !== dayFilter) return false;
      return true;
    });
  }, [routes, statusFilter, truckFilter, yearFilter, monthFilter, dayFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openResend(r) { setResendRoute(r); setResendDone(false); }
  function handleResend() {
    setRoutes((prev) => prev.map((r) => r.id === resendRoute.id
      ? { ...r, status: "delivered", sentAt: new Date().toISOString() } : r));
    setResendDone(true);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Pamamahala ng Ruta</h1>
      </div>

      {/* ── OPTIMIZE PANEL ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center gap-2">
            <Cpu size={17} color="#2E7D32" />
            <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>I-optimize ang Ruta</h2>
          </div>
          {sent && (
            <span className="flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold"
              style={{ fontSize: 12, background: "#E8F5E9", color: "#2E7D32" }}>
              <CheckCircle size={13} /> Matagumpay na Naipadala
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-text-muted font-medium" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Mga puno na basurahan
              </label>
              <span className="rounded-lg px-3 py-2 font-bold text-center"
                style={{
                  fontSize: 13, minWidth: 60,
                  background: fullBinCount > 0 ? "#FFEBEE" : "#E8F5E9",
                  color:      fullBinCount > 0 ? "#DC2626" : "#2E7D32",
                  border:     `1.5px solid ${fullBinCount > 0 ? "#FFCDD2" : "#C8E6C9"}`,
                }}>
                {fullBinCount} {fullBinCount === 1 ? "basurahan" : "basurahan"}
              </span>
            </div>

            {!optimized ? (
              <button onClick={handleOptimize} disabled={fullBinCount === 0}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontSize: 13, background: "#2E7D32" }}>
                <Cpu size={14} /> I-optimize ang Ruta
              </button>
            ) : sent ? (
              <button onClick={() => { setOptimized(false); setSent(false); }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors"
                style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280" }}>
                Mag-optimize muli
              </button>
            ) : (
              <button onClick={() => setShowRouteDetails(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: "#2E7D32" }}>
                <Send size={14} /> Ipadala sa Collector Admin
              </button>
            )}
          </div>

          {optimized && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "#E8F5E9", border: "1px solid #A5D6A7" }}>
              <CheckCircle size={16} color="#2E7D32" />
              <span className="font-semibold" style={{ fontSize: 13, color: "#2E7D32" }}>Ruta na-optimize — Lungsod ng Batangas</span>
              <span className="text-text-secondary" style={{ fontSize: 13 }}>
                — {optimizeRoute.bins.length} basurahan · Est. {optimizeRoute.estimatedMinutes} min · {optimizeRoute.distanceKm} km
              </span>
            </div>
          )}

          {fullBinCount === 0 && !optimized && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "#FFF3E0", border: "1px solid #FFE0B2" }}>
              <MapPin size={16} color="#D97706" className="flex-shrink-0" />
              <p style={{ fontSize: 13, color: "#E65100" }}>Walang puno na basurahan. Lahat ng basurahan ay maayos o nakolekta na.</p>
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
                    Pindutin ang "I-optimize ang Ruta" para kalkulahin ang pinakamaikling landas ng koleksyon.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-text-primary" style={{ fontSize: 15 }}>Detalye ng Ruta</h3>
                    <span className="rounded-full px-2.5 py-0.5 font-semibold"
                      style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}>Lungsod ng Batangas</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: <Ruler size={13} color="#6B7280" />, label: "Distansya",   value: `${optimizeRoute.distanceKm} km` },
                      { icon: <Clock size={13} color="#6B7280" />, label: "Est. Oras",   value: `${optimizeRoute.estimatedMinutes} min` },
                      { icon: <MapPin size={13} color="#6B7280" />, label: "Basurahan",  value: optimizeRoute.bins.length },
                      { icon: <Cpu size={13} color="#6B7280" />,   label: "Algoritmo",  value: "Nearest Neighbor" },
                    ].map((t) => (
                      <div key={t.label} className="rounded-lg p-2.5 flex flex-col gap-1"
                        style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
                        <div className="flex items-center gap-1">{t.icon}<span className="text-text-muted" style={{ fontSize: 10 }}>{t.label}</span></div>
                        <span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{t.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-text-muted" style={{ fontSize: 11 }}>Na-optimize noong {optimizedAtLabel}</p>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2" style={{ fontSize: 13 }}>Pagkakasunod ng Koleksyon</h4>
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

      {/* ── ROUTE HISTORY ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="font-semibold text-text-primary" style={{ fontSize: 18 }}>Kasaysayan ng Ruta</h2>
          <span className="rounded-full px-2.5 py-0.5 font-semibold"
            style={{ fontSize: 12, background: "#F3F4F6", color: "#6B7280" }}>
            {filtered.length} ruta
          </span>
        </div>
        {activeFilters > 0 && (
          <button onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium hover:bg-red-50 transition-colors"
            style={{ fontSize: 12, border: "1.5px solid #FECACA", color: "#DC2626", background: "#FFF5F5" }}>
            <X size={12} /> I-clear lahat ({activeFilters})
          </button>
        )}
      </div>

      {/* ── ENHANCED FILTER BAR ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} color="#6B7280" />
          <span className="font-semibold text-text-secondary" style={{ fontSize: 13 }}>Salain ang Kasaysayan</span>
          {activeFilters > 0 && (
            <span className="rounded-full px-2 py-0.5 font-bold text-white"
              style={{ fontSize: 10, background: "#2E7D32" }}>{activeFilters}</span>
          )}
        </div>

        <div className="flex items-end gap-3 flex-wrap">

          {/* Year */}
          <FilterSelect label="Taon" value={yearFilter} onChange={(v) => { setYearFilter(v); setMonthFilter("all"); setDayFilter(""); setPage(1); }}>
            <option value="all">Lahat ng Taon</option>
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </FilterSelect>

          {/* Month */}
          <FilterSelect label="Buwan" value={monthFilter} onChange={(v) => { setMonthFilter(v); setDayFilter(""); setPage(1); }}>
            <option value="all">Lahat ng Buwan</option>
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={String(i + 1)}>{name}</option>
            ))}
          </FilterSelect>

          {/* Day — shown whenever year AND month are both selected */}
          {yearFilter !== "all" && monthFilter !== "all" && (
            <FilterSelect label="Araw" value={dayFilter} onChange={(v) => { setDayFilter(v); setPage(1); }}>
              <option value="">Lahat ng Araw</option>
              {dayOptions.length > 0
                ? dayOptions.map((d) => (
                    <option key={d} value={d}>
                      {new Date(d + "T00:00:00").toLocaleDateString("fil-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </option>
                  ))
                : <option disabled>Walang rutang natagpuan</option>
              }
            </FilterSelect>
          )}

          {/* Divider */}
          <div className="self-stretch" style={{ width: 1, background: "#E5E7EB", marginBottom: 2 }} />

          {/* Status */}
          <FilterSelect label="Katayuan" value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <option value="all">Lahat ng Katayuan</option>
            <option value="completed">Natapos</option>
            <option value="in_progress">Isinasagawa</option>
            <option value="delivered">Naihatid</option>
            <option value="cancelled">Nakansela</option>
          </FilterSelect>

          {/* Truck */}
          <FilterSelect label="Truck No." value={truckFilter} onChange={(v) => { setTruckFilter(v); setPage(1); }}>
            <option value="all">Lahat ng Trak</option>
            {TRUCK_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </FilterSelect>

        </div>

        {/* Active filter chips */}
        {activeFilters > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {yearFilter !== "all" && (
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
                style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32", border: "1px solid #C8E6C9" }}>
                Taon: {yearFilter}
                <button onClick={() => { setYearFilter("all"); setMonthFilter("all"); setDayFilter(""); setPage(1); }} className="hover:opacity-70"><X size={10} /></button>
              </span>
            )}
            {monthFilter !== "all" && (
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
                style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32", border: "1px solid #C8E6C9" }}>
                Buwan: {MONTH_NAMES[parseInt(monthFilter) - 1]}
                <button onClick={() => { setMonthFilter("all"); setDayFilter(""); setPage(1); }} className="hover:opacity-70"><X size={10} /></button>
              </span>
            )}
            {dayFilter && (
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
                style={{ fontSize: 11, background: "#E3F2FD", color: "#1976D2", border: "1px solid #BBDEFB" }}>
                Araw: {dayFilter}
                <button onClick={() => { setDayFilter(""); setPage(1); }} className="hover:opacity-70"><X size={10} /></button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
                style={{ fontSize: 11, background: "#FFF3E0", color: "#D97706", border: "1px solid #FFE0B2" }}>
                Katayuan: {statusFilter === "completed" ? "Natapos" : statusFilter === "in_progress" ? "Isinasagawa" : statusFilter === "delivered" ? "Naihatid" : "Nakansela"}
                <button onClick={() => { setStatusFilter("all"); setPage(1); }} className="hover:opacity-70"><X size={10} /></button>
              </span>
            )}
            {truckFilter !== "all" && (
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
                style={{ fontSize: 11, background: "#F3E8FF", color: "#7C3AED", border: "1px solid #DDD6FE" }}>
                <Truck size={10} /> {truckFilter}
                <button onClick={() => { setTruckFilter("all"); setPage(1); }} className="hover:opacity-70"><X size={10} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── TABLE ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 860 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Route ID", "Petsa", "Truck No.", "Binasurahan", "Distansya", "Est. Oras", "Ipinadala Kay", "Katayuan", "Aksyon"].map((h) => (
                  <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                    style={{ fontSize: 11, color: "#6B7280", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="flex flex-col items-center gap-3 py-12">
                      <div className="flex items-center justify-center rounded-full"
                        style={{ width: 48, height: 48, background: "#F3F4F6" }}>
                        <Route size={22} color="#9CA3AF" />
                      </div>
                      <p className="text-text-muted font-medium" style={{ fontSize: 14 }}>
                        Walang rutang natutuon sa mga napiling salain.
                      </p>
                      {activeFilters > 0 && (
                        <button onClick={clearFilters}
                          className="rounded-lg px-4 py-2 font-medium hover:bg-red-50 transition-colors"
                          style={{ fontSize: 13, border: "1.5px solid #FECACA", color: "#DC2626" }}>
                          I-clear ang mga salain
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paginated.map((r, i) => (
                <tr key={r.id}
                  style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}
                  className="hover:bg-green-50/30 transition-colors">

                  {/* Route ID */}
                  <td className="px-4 py-3">
                    <span className="font-bold" style={{ fontSize: 13, color: "#2E7D32" }}>{r.routeId}</span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                    {new Date(r.date + "T00:00:00").toLocaleDateString("fil-PH", { year: "numeric", month: "short", day: "numeric" })}
                  </td>

                  {/* Truck No. */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                        style={{ width: 26, height: 26, background: "#E3F2FD" }}>
                        <Truck size={13} color="#1976D2" />
                      </div>
                      <span className="font-semibold" style={{ fontSize: 13, color: "#1976D2", whiteSpace: "nowrap" }}>
                        {r.truckNo ?? "—"}
                      </span>
                    </div>
                  </td>

                  {/* Bins */}
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 font-semibold"
                      style={{ fontSize: 12, background: "#F3F4F6", color: "#374151" }}>
                      {r.bins.length} basurahan
                    </span>
                  </td>

                  {/* Distance */}
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{r.distanceKm} km</td>

                  {/* Est Time */}
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{r.estimatedMinutes} min</td>

                  {/* Sent To */}
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13, whiteSpace: "nowrap" }}>{r.sentTo}</td>

                  {/* Status */}
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewRoute(r)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium hover:bg-gray-100 transition-colors"
                        style={{ fontSize: 12, color: "#6B7280", border: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>
                        <Eye size={13} /> Tingnan
                      </button>
                      <button onClick={() => openResend(r)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium hover:bg-green-50 transition-colors"
                        style={{ fontSize: 12, color: "#2E7D32", border: "1px solid #C8E6C9", whiteSpace: "nowrap" }}>
                        <Send size={13} /> Ipadala muli
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "#F3F4F6" }}>
          <span className="text-text-muted" style={{ fontSize: 13 }}>
            Ipinapakita ang {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} mula sa {filtered.length} ruta
          </span>
          <div className="flex items-center gap-1.5">
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

      {/* ── MODAL: Route Details (after Optimize) ─────────────────────────── */}
      <Modal open={showRouteDetails} onClose={() => setShowRouteDetails(false)} title="Detalye ng Ruta"
        footer={<>
          <button onClick={() => setShowRouteDetails(false)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Kanselahin</button>
          <button onClick={handleSendRoute} disabled={sending}
            className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: "#2E7D32", opacity: sending ? 0.7 : 1 }}>
            <Send size={14} />{sending ? "Nagpapadala…" : "Ipadala sa Collector Admin"}
          </button>
        </>}>
        <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-1"
          style={{ background: "#FFF8F0", border: "1px solid #FFE0B2" }}>
          <div className="flex items-center gap-2">
            <Route size={18} color="#D97706" />
            <span className="font-bold text-text-primary" style={{ fontSize: 16 }}>{optimizeRoute.routeId}</span>
          </div>
          <span className="rounded-full px-3 py-0.5 font-semibold"
            style={{ fontSize: 12, background: "#E8F5E9", color: "#2E7D32" }}>Handa nang Ipadala</span>
        </div>
        <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #F3F4F6" }}>
          <InfoRow label="Petsa"              value={new Date().toISOString().split("T")[0]} />
          <InfoRow label="Ipapadala Kay"      value="Collector Admin" />
          <InfoRow label="Distansya"          value={`${optimizeRoute.distanceKm} km`} />
          <InfoRow label="Est. Tagal"         value={`${optimizeRoute.estimatedMinutes} min`} />
          <InfoRow label="Bilang ng Basurahan" value={`${optimizeRoute.bins.length} basurahan`} />
        </div>
        <p className="font-semibold text-text-primary mb-2" style={{ fontSize: 13 }}>Mga Nakatakdang Basurahan</p>
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

      {/* ── MODAL: View Route ──────────────────────────────────────────────── */}
      <Modal open={!!viewRoute} onClose={() => setViewRoute(null)} title="Detalye ng Ruta"
        footer={<button onClick={() => setViewRoute(null)}
          className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90"
          style={{ fontSize: 14, background: "#2E7D32" }}>Isara</button>}>
        {viewRoute && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: STATUS_STYLE[viewRoute.status]?.bg ?? "#F3F4F6", border: "1px solid #E5E7EB" }}>
              <div className="flex items-center gap-2">
                <Route size={18} color={STATUS_STYLE[viewRoute.status]?.color ?? "#6B7280"} />
                <span className="font-bold text-text-primary" style={{ fontSize: 16 }}>{viewRoute.routeId}</span>
              </div>
              <StatusBadge status={viewRoute.status} />
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              <InfoRow label="Petsa"               value={viewRoute.date} />
              <InfoRow label="Truck No."           value={viewRoute.truckNo ?? "—"} />
              <InfoRow label="Ipinadala Kay"       value={viewRoute.sentTo} />
              <InfoRow label="Distansya"           value={`${viewRoute.distanceKm} km`} />
              <InfoRow label="Est. Tagal"          value={`${viewRoute.estimatedMinutes} min`} />
              <InfoRow label="Bilang ng Basurahan" value={`${viewRoute.bins.length} basurahan`} />
            </div>
            <div>
              <p className="font-semibold text-text-primary mb-2" style={{ fontSize: 13 }}>Mga Nakatakdang Basurahan</p>
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

      {/* ── MODAL: Resend Route ────────────────────────────────────────────── */}
      <Modal open={!!resendRoute} onClose={() => { setResendRoute(null); setResendDone(false); }} title="Ipadala Muli ang Ruta"
        footer={resendDone ? (
          <button onClick={() => { setResendRoute(null); setResendDone(false); }}
            className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90"
            style={{ fontSize: 14, background: "#2E7D32" }}>Tapos na</button>
        ) : (
          <>
            <button onClick={() => setResendRoute(null)}
              className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Kanselahin</button>
            <button onClick={handleResend}
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, background: "#2E7D32" }}>
              <Send size={14} /> Ipadala Muli
            </button>
          </>
        )}>
        {resendRoute && (resendDone ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: "#E8F5E9" }}>
              <CheckCircle size={28} color="#2E7D32" />
            </div>
            <p className="font-semibold text-text-primary text-center" style={{ fontSize: 15 }}>Matagumpay na naipadala muli!</p>
            <p className="text-text-secondary text-center" style={{ fontSize: 13 }}>
              Ang <strong>{resendRoute.routeId}</strong> ay naipadala na muli sa <strong>Collector Admin</strong>.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "#FFF3E0", border: "1px solid #FFE0B2" }}>
              <Send size={16} color="#D97706" className="flex-shrink-0" />
              <p style={{ fontSize: 13, color: "#E65100" }}>
                Ito ay magtatanda sa ruta bilang <strong>Naihatid</strong> at aabisuhan ang Collector Admin.
              </p>
            </div>
            <InfoRow label="Route ID"   value={resendRoute.routeId} />
            <InfoRow label="Truck No."  value={resendRoute.truckNo ?? "—"} />
            <InfoRow label="Basurahan"  value={`${resendRoute.bins.length} basurahan — ${resendRoute.distanceKm} km`} />
            <InfoRow label="Ipapadala Kay" value="Collector Admin" />
          </div>
        ))}
      </Modal>
    </div>
  );
}
