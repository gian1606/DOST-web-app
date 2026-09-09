/**
 * BinQRCodes.jsx — BE-SMART Punong Barangay · Bin QR Code Management
 *
 * Features:
 *  • Fetches bins + tiers from real API (with mock-data fallback)
 *  • Dynamic Tier filter dropdown
 *  • Manage Tiers modal (add / edit / delete tiers)
 *  • Add Bin modal with tier selector and optional lat/lng
 *  • Delete individual bin + bulk delete with confirmation dialogs
 *  • Print QR stickers via qrcode library
 *  • Download QR as PNG
 *  • Preview modal with encoded-data inspector
 */

import { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  QrCode, Download, Printer, Search, Plus, X,
  MapPin, Trash2, Settings, RefreshCw, ChevronDown,
} from "lucide-react";
import { BINS } from "../mock/data";

// ── Default center: Brgy. Alangilan, Batangas City ────────────────────────────
const DEFAULT_LAT = 13.7565;
const DEFAULT_LNG = 121.0583;

// ── LocationPicker — iframe OpenStreetMap with two-way coordinate sync ─────────
function LocationPicker({ lat, lng, onChange }) {
  const hasPin  = lat !== "" && lng !== "" && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
  const pinLat  = hasPin ? parseFloat(lat) : DEFAULT_LAT;
  const pinLng  = hasPin ? parseFloat(lng) : DEFAULT_LNG;
  const zoom    = 16;

  // Build the iframe URL — uses OpenStreetMap tile + optional marker
  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${pinLng - 0.005},${pinLat - 0.005},${pinLng + 0.005},${pinLat + 0.005}&layer=mapnik${hasPin ? `&marker=${pinLat},${pinLng}` : ""}`;

  // When user clicks "Pick from map" we open OSM in a new tab and ask them to
  // copy the coordinates — or they can just type them directly.
  // For a true in-page click-to-pin we use a hidden Leaflet via CDN script.
  const mapContainerId = "bin-location-map";

  useEffect(() => {
    // Inject Leaflet CSS + JS from CDN once
    if (document.getElementById("leaflet-css-cdn")) return;

    const css  = document.createElement("link");
    css.id     = "leaflet-css-cdn";
    css.rel    = "stylesheet";
    css.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);

    const js   = document.createElement("script");
    js.id      = "leaflet-js-cdn";
    js.src     = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload  = () => initMap(pinLat, pinLng, hasPin);
    document.head.appendChild(js);
  }, []);

  // Init / reinit Leaflet map inside the div
  useEffect(() => {
    const L = window.L;
    if (!L) return;
    initMap(pinLat, pinLng, hasPin);
  }, []);

  function initMap(centerLat, centerLng, showMarker) {
    const L = window.L;
    if (!L) return;

    const container = document.getElementById(mapContainerId);
    if (!container) return;

    // Destroy existing map instance if any
    if (container._leaflet_id) {
      container._leaflet_id = null;
      container.innerHTML   = "";
    }

    // Fix default icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(container).setView([centerLat, centerLng], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    let marker = null;
    if (showMarker) {
      marker = L.marker([centerLat, centerLng], { draggable: true }).addTo(map);
      marker.on("dragend", (e) => {
        const p = e.target.getLatLng();
        onChange(p.lat.toFixed(6), p.lng.toFixed(6));
      });
    }

    map.on("click", (e) => {
      const { lat: la, lng: lo } = e.latlng;
      if (marker) map.removeLayer(marker);
      marker = L.marker([la, lo], { draggable: true }).addTo(map);
      marker.on("dragend", (ev) => {
        const p = ev.target.getLatLng();
        onChange(p.lat.toFixed(6), p.lng.toFixed(6));
      });
      onChange(la.toFixed(6), lo.toFixed(6));
    });

    container._leafletMapInstance = map;
  }

  // Move map + update marker when lat/lng inputs change
  useEffect(() => {
    const L   = window.L;
    const container = document.getElementById(mapContainerId);
    if (!L || !container || !container._leafletMapInstance) return;
    const la = parseFloat(lat);
    const lo = parseFloat(lng);
    if (!isNaN(la) && !isNaN(lo)) {
      container._leafletMapInstance.setView([la, lo], 16);
    }
  }, [lat, lng]);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
        Pin Location
        <span className="ml-1 font-normal text-text-muted" style={{ fontSize: 12 }}>
          — click the map to place a pin, or type coordinates below
        </span>
      </label>

      {/* Leaflet map div */}
      <div
        id={mapContainerId}
        className="rounded-xl overflow-hidden"
        style={{ height: 240, border: "1.5px solid #E5E7EB", background: "#F3F4F6", zIndex: 0 }}
      />

      {/* Coordinate inputs */}
      <div className="flex gap-2 items-end">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-text-muted" style={{ fontSize: 11 }}>Latitude</label>
          <input
            type="number"
            value={lat}
            onChange={(e) => onChange(e.target.value, lng)}
            placeholder="13.7565"
            className="rounded-lg px-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }}
            step="any"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-text-muted" style={{ fontSize: 11 }}>Longitude</label>
          <input
            type="number"
            value={lng}
            onChange={(e) => onChange(lat, e.target.value)}
            placeholder="121.0583"
            className="rounded-lg px-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }}
            step="any"
          />
        </div>
        {hasPin && (
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="rounded-lg px-3 py-2 font-medium hover:bg-red-50"
            style={{ fontSize: 12, border: "1.5px solid #FECACA", color: "#DC2626", background: "#FFF5F5" }}
          >
            ✕ Clear
          </button>
        )}
      </div>
      <p className="text-text-muted" style={{ fontSize: 11 }}>
        Click anywhere on the map to drop a pin. Drag the pin to fine-tune. Coordinates update automatically.
      </p>
    </div>
  );
}

const PB_BARANGAY = "Alangilan";
const PB_CLUSTER  = "c1";
const API_URL     = import.meta.env.VITE_API_URL;

// ── Payload builder ────────────────────────────────────────────────────────────
// Uses the server-signed qr_payload when available (real bins).
// Falls back to a simple JSON for mock/display-only bins.
function buildPayload(bin) {
  if (bin.qr_payload) return bin.qr_payload;
  return JSON.stringify({
    system:   "BE-SMART",
    bin_id:   bin.id,
    name:     bin.name,
    street:   bin.street || "",
    barangay: bin.barangay,
    tier:     bin.tier || "",
  });
}

// ── Status badge ──────────────────────────────────────────────────────────────
function statusColor(s) {
  const key = (s || "").toLowerCase();
  if (key === "full")      return { bg: "#FFEBEE", color: "#DC2626" };
  if (key === "missed")    return { bg: "#FFF3E0", color: "#D97706" };
  if (key === "collected") return { bg: "#E8F5E9", color: "#2E7D32" };
  if (key === "locked")    return { bg: "#EDE9FE", color: "#7C3AED" };
  return { bg: "#F3F4F6", color: "#6B7280" };
}

// ── QR card ───────────────────────────────────────────────────────────────────
function QRCard({ bin, size = 180 }) {
  const payload = buildPayload(bin);
  return (
    <QRCodeCanvas
      value={payload}
      size={size}
      level="M"
      includeMargin={true}
      style={{ borderRadius: 4, border: "1px solid #E5E7EB" }}
    />
  );
}

// ── Download helper ───────────────────────────────────────────────────────────
function handleDownload(bin) {
  const payload = buildPayload(bin);
  import("qrcode").then((mod) => {
    const QRCode = mod.default ?? mod;
    QRCode.toDataURL(payload, { width: 400, margin: 2 }, (err, url) => {
      if (err) return;
      const a = document.createElement("a");
      a.href     = url;
      a.download = `QR_${bin.name.replace(/\s+/g, "_")}.png`;
      a.click();
    });
  });
}

// ── Print helper ──────────────────────────────────────────────────────────────
async function handlePrint(printBins) {
  if (!printBins.length) return;
  const QRCode = await import("qrcode").then((m) => m.default ?? m);
  const cards  = await Promise.all(printBins.map(async (bin) => {
    const url = await QRCode.toDataURL(buildPayload(bin), { width: 320, margin: 2 });
    return `
      <div class="card">
        <img src="${url}" alt="QR ${bin.name}" />
        <div class="name">${bin.name}</div>
        <div class="sub">${bin.street ?? ""}</div>
        <div class="badge">${bin.status ?? "—"}</div>
      </div>`;
  }));
  const html = `<!DOCTYPE html><html><head>
    <title>BE-SMART Bin QR Codes — Brgy. ${PB_BARANGAY}</title>
    <style>
      body{font-family:sans-serif;margin:0;padding:16px}
      .grid{display:flex;flex-wrap:wrap;gap:24px}
      .card{border:1px solid #E5E7EB;border-radius:12px;padding:16px;
            display:flex;flex-direction:column;align-items:center;gap:8px;
            width:200px;page-break-inside:avoid}
      .card img{width:160px;height:160px}
      .name{font-weight:700;font-size:13px;text-align:center}
      .sub{font-size:11px;color:#6B7280;text-align:center}
      .badge{background:#E8F5E9;color:#2E7D32;border-radius:99px;
             padding:2px 8px;font-size:10px;font-weight:600}
      h2{font-size:16px;margin-bottom:16px;color:#1C2B1E}
      @media print{@page{margin:12mm}}
    </style></head><body>
    <h2>BE-SMART · Brgy. ${PB_BARANGAY} · Bin QR Codes</h2>
    <div class="grid">${cards.join("")}</div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
    </body></html>`;
  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(html);
  win.document.close();
}

// ── Form field ────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, error, placeholder, required, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
        {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg px-3 py-2.5 outline-none"
        style={{ fontSize: 14, border: error ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }}
      />
      {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 w-full" style={{ maxWidth: 360 }}>
        <p className="text-text-primary font-medium text-center" style={{ fontSize: 15 }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 rounded-lg py-2.5 font-semibold hover:bg-gray-100"
            style={{ border: "1.5px solid #E5E7EB", fontSize: 14, color: "#374151" }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 rounded-lg py-2.5 font-semibold text-white hover:opacity-90"
            style={{ background: "#DC2626", fontSize: 14 }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Manage Tiers Modal ────────────────────────────────────────────────────────
function ManageTiersModal({ token, onClose, onTiersChanged }) {
  const [tiers, setTiers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [newName, setNewName]       = useState("");
  const [newCap, setNewCap]         = useState("");
  const [saving, setSaving]         = useState(false);
  const [editId, setEditId]         = useState(null);
  const [editName, setEditName]     = useState("");
  const [editCap, setEditCap]       = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [error, setError]           = useState("");

  async function loadTiers() {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/tiers`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTiers(data.tiers ?? data ?? []);
    } catch { setError("Failed to load tiers."); }
    finally   { setLoading(false); }
  }

  useEffect(() => { loadTiers(); }, []);

  async function handleAdd() {
    if (!newName.trim()) { setError("Tier name is required."); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch(`${API_URL}/tiers`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ name: newName.trim(), capacity_liters: newCap ? parseInt(newCap) : null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setNewName(""); setNewCap("");
      await loadTiers();
      onTiersChanged();
    } catch { setError("Failed to create tier."); }
    finally   { setSaving(false); }
  }

  async function handleUpdate(id) {
    if (!editName.trim()) { setError("Tier name is required."); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch(`${API_URL}/tiers/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ name: editName.trim(), capacity_liters: editCap ? parseInt(editCap) : null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setEditId(null);
      await loadTiers();
      onTiersChanged();
    } catch { setError("Failed to update tier."); }
    finally   { setSaving(false); }
  }

  async function handleDelete(id) {
    setSaving(true); setError("");
    try {
      const res  = await fetch(`${API_URL}/tiers/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setConfirmDel(null);
      await loadTiers();
      onTiersChanged();
    } catch { setError("Failed to delete tier."); }
    finally   { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 w-full overflow-y-auto"
        style={{ maxWidth: 480, maxHeight: "90vh" }}>

        <div className="flex items-center justify-between">
          <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>Manage Tiers</h2>
          <button onClick={onClose}><X size={20} color="#6B7280" /></button>
        </div>

        {error && (
          <div className="rounded-lg px-3 py-2 text-center"
            style={{ background: "#FFEBEE", color: "#DC2626", fontSize: 13 }}>{error}</div>
        )}

        {loading ? (
          <div className="text-center py-4" style={{ color: "#9CA3AF", fontSize: 14 }}>Loading…</div>
        ) : (
          <div className="flex flex-col gap-2">
            {tiers.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ border: "1.5px solid #E5E7EB", background: editId === t.id ? "#F9FAFB" : "#fff" }}>
                {editId === t.id ? (
                  <>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-lg px-2 py-1 outline-none"
                      style={{ fontSize: 13, border: "1px solid #E5E7EB" }} placeholder="Tier name" />
                    <input value={editCap} onChange={(e) => setEditCap(e.target.value)}
                      className="rounded-lg px-2 py-1 outline-none w-20"
                      style={{ fontSize: 13, border: "1px solid #E5E7EB" }} placeholder="Liters" type="number" />
                    <button onClick={() => handleUpdate(t.id)} disabled={saving}
                      className="rounded-lg px-3 py-1 text-white font-medium text-xs hover:opacity-90"
                      style={{ background: "#2E7D32" }}>Save</button>
                    <button onClick={() => setEditId(null)}
                      className="rounded-lg px-2 py-1 text-xs font-medium hover:bg-gray-100"
                      style={{ color: "#6B7280" }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-semibold text-text-primary" style={{ fontSize: 14 }}>{t.name}</span>
                    <span className="rounded-full px-2 py-0.5 font-medium"
                      style={{ fontSize: 11, background: "#DBEAFE", color: "#1D4ED8" }}>
                      {t.capacity_liters ? `${t.capacity_liters}L` : "Bulk"}
                    </span>
                    <button onClick={() => { setEditId(t.id); setEditName(t.name); setEditCap(t.capacity_liters ?? ""); }}
                      className="text-text-muted hover:text-text-primary" title="Edit">
                      <Settings size={14} />
                    </button>
                    <button onClick={() => setConfirmDel(t.id)}
                      className="text-text-muted hover:text-red-500" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add new tier */}
        <div className="border-t pt-4 flex flex-col gap-3">
          <p className="font-semibold text-text-primary" style={{ fontSize: 13 }}>Add New Tier</p>
          <div className="flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 outline-none"
              style={{ fontSize: 13, border: "1.5px solid #E5E7EB" }} placeholder="Tier name (e.g. Tier 4)" />
            <input value={newCap} onChange={(e) => setNewCap(e.target.value)} type="number"
              className="rounded-lg px-3 py-2 outline-none w-24"
              style={{ fontSize: 13, border: "1.5px solid #E5E7EB" }} placeholder="Liters" />
            <button onClick={handleAdd} disabled={saving}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90"
              style={{ background: "#2E7D32", fontSize: 13 }}>
              <Plus size={13} /> Add
            </button>
          </div>
        </div>
      </div>

      {confirmDel && (
        <ConfirmDialog
          message="Delete this tier? This cannot be undone."
          onConfirm={() => handleDelete(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════
const EMPTY_FORM = { name: "", street: "", tier_id: "", lat: "", lng: "" };

export default function BinQRCodes() {
  // Seed from mock; API bins replace/extend on mount
  const [bins, setBins]               = useState(() => BINS.filter((b) => b.barangay === PB_BARANGAY));
  const [tiers, setTiers]             = useState([]);
  const [loadingBins, setLoadingBins] = useState(true);
  const [fetchError, setFetchError]   = useState(null);

  const [search, setSearch]           = useState("");
  const [filterTier, setFilterTier]   = useState("");
  const [selected, setSelected]       = useState([]);
  const [previewBin, setPreviewBin]   = useState(null);

  // Add-bin modal
  const [addOpen, setAddOpen]         = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [addedBin, setAddedBin]       = useState(null);
  const [addLoading, setAddLoading]   = useState(false);
  const [addError, setAddError]       = useState("");

  // Manage tiers modal
  const [tiersOpen, setTiersOpen]     = useState(false);

  // Delete confirmations
  const [confirmDel, setConfirmDel]         = useState(null);
  const [confirmBulkDel, setConfirmBulkDel] = useState(false);

  const token = sessionStorage.getItem("bs_token");

  // ── Data fetching ────────────────────────────────────────────────────────────
  async function fetchTiers() {
    try {
      const res  = await fetch(`${API_URL}/tiers`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTiers(Array.isArray(data) ? data : (data.tiers ?? []));
    } catch { /* keep existing tiers */ }
  }

  async function fetchBins() {
    setLoadingBins(true); setFetchError(null);
    try {
      const res  = await fetch(`${API_URL}/bins?barangay=${encodeURIComponent(PB_BARANGAY)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch bins.");
      if (data.bins && data.bins.length > 0) {
        // API bins take precedence; keep mock bins that don't clash by id
        setBins((prev) => {
          const apiIds = new Set(data.bins.map((b) => b.id));
          return [...data.bins, ...prev.filter((b) => !apiIds.has(b.id))];
        });
      }
    } catch (err) {
      setFetchError(err.message); // mock data remains visible
    } finally {
      setLoadingBins(false);
    }
  }

  useEffect(() => {
    if (!token) { setLoadingBins(false); return; }
    fetchTiers();
    fetchBins();
  }, []);

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = bins.filter((b) => {
    const matchSearch = !search.trim() ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.street ?? "").toLowerCase().includes(search.toLowerCase());
    const matchTier = !filterTier || String(b.tier_id) === String(filterTier);
    return matchSearch && matchTier;
  });

  // ── Selection ────────────────────────────────────────────────────────────────
  function toggleSelect(id)  { setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]); }
  function selectAll()       { setSelected(filtered.map((b) => b.id)); }
  function clearSelection()  { setSelected([]); }

  // ── Delete single bin ────────────────────────────────────────────────────────
  async function deleteBin(id) {
    try {
      const res = await fetch(`${API_URL}/bins/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setBins((prev) => prev.filter((b) => b.id !== id));
      setSelected((prev) => prev.filter((x) => x !== id));
    } catch (err) { alert(err.message); }
    setConfirmDel(null);
  }

  // ── Bulk delete ──────────────────────────────────────────────────────────────
  async function bulkDelete() {
    try {
      const res = await fetch(`${API_URL}/bins/bulk-delete`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ ids: selected }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setBins((prev) => prev.filter((b) => !selected.includes(b.id)));
      setSelected([]);
    } catch (err) { alert(err.message); }
    setConfirmBulkDel(false);
  }

  // ── Add bin ──────────────────────────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM); setFormErrors({});
    setAddedBin(null);  setAddError("");
    setAddOpen(true);
  }
  function handleAddClose() { setAddOpen(false); setAddedBin(null); }

  function validateForm() {
    const e = {};
    if (!form.name.trim())   e.name    = "Bin name is required.";
    if (!form.street.trim()) e.street  = "Street / location is required.";
    if (!form.tier_id)       e.tier_id = "Please select a bin tier.";
    if (form.lat && isNaN(parseFloat(form.lat))) e.lat = "Must be a valid number.";
    if (form.lng && isNaN(parseFloat(form.lng))) e.lng = "Must be a valid number.";
    return e;
  }

  async function handleAddBin() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setAddLoading(true); setAddError("");
    try {
      const res = await fetch(`${API_URL}/bins`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          name:       form.name.trim(),
          street:     form.street.trim(),
          barangay:   PB_BARANGAY,
          cluster_id: PB_CLUSTER,
          tier_id:    form.tier_id,
          latitude:   form.lat ? parseFloat(form.lat) : undefined,
          longitude:  form.lng ? parseFloat(form.lng) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error || "Failed to create bin."); return; }
      const newBin = { ...data.bin, status: data.bin.status ?? "ok" };
      setBins((prev) => [newBin, ...prev]);
      setAddedBin(newBin);
    } catch {
      setAddError("Unable to connect to the server.");
    } finally {
      setAddLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Bin QR Codes</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            Generate &amp; print QR codes for Brgy. {PB_BARANGAY} bins
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {selected.length > 0 && (
            <>
              <span className="rounded-full px-3 py-1 font-semibold text-white"
                style={{ fontSize: 12, background: "#2E7D32" }}>
                {selected.length} selected
              </span>
              <button onClick={clearSelection}
                className="rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
                style={{ fontSize: 13, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>
                Clear
              </button>
              <button onClick={() => handlePrint(bins.filter((b) => selected.includes(b.id)))}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: "#1976D2" }}>
                <Printer size={14} /> Print Selected
              </button>
              <button onClick={() => setConfirmBulkDel(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: "#DC2626" }}>
                <Trash2 size={14} /> Delete Selected
              </button>
            </>
          )}
          <button onClick={selectAll}
            className="rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", color: "#374151" }}>
            Select All
          </button>
          <button onClick={() => setTiersOpen(true)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", color: "#374151" }}>
            <Settings size={14} /> Manage Tiers
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 13, background: "#2E7D32" }}>
            <Plus size={14} /> Add Bin
          </button>
        </div>
      </div>

      {/* ── Info banner ── */}
      <div className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: "#E8F5E9", border: "1px solid #C8E6C9" }}>
        <QrCode size={16} color="#2E7D32" className="flex-shrink-0 mt-0.5" />
        <p style={{ fontSize: 13, color: "#1C2B1E" }}>
          Each QR code encodes the bin's ID, name, street, and barangay. Residents scan these
          with the BE-SMART mobile app to report bin status. Print and attach them to the physical bins.
          <strong className="ml-1">Total: {bins.length} bins</strong>
        </p>
      </div>

      {/* ── Fetch error ── */}
      {fetchError && (
        <div className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: "#FFF3E0", border: "1px solid #FFE0B2" }}>
          <span style={{ fontSize: 13, color: "#D97706" }}>
            Could not load bins from server — showing local data. ({fetchError})
          </span>
          <button onClick={fetchBins}
            className="flex items-center gap-1.5 font-semibold hover:opacity-80"
            style={{ fontSize: 13, color: "#D97706" }}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* ── Search + Tier filter ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex items-center" style={{ maxWidth: 320, flex: 1 }}>
          <Search size={14} className="absolute left-3 text-text-muted" color="#9CA3AF" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bin name or street…"
            className="w-full rounded-lg pl-9 pr-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
        </div>
        <div className="relative flex items-center">
          <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)}
            className="rounded-lg pl-3 pr-8 py-2 outline-none appearance-none"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#374151", minWidth: 160 }}>
            <option value="">All Tiers</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}{t.capacity_liters ? ` (${t.capacity_liters}L)` : ""}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2 pointer-events-none" color="#9CA3AF" />
        </div>
      </div>

      {/* ── QR Grid ── */}
      {loadingBins ? (
        <div className="text-center py-16 text-text-muted" style={{ fontSize: 14 }}>Loading bins…</div>
      ) : (
        <div className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {filtered.map((bin) => {
            const sc         = statusColor(bin.status);
            const isSelected = selected.includes(bin.id);
            const isNew      = String(bin.id).startsWith("pb_bin_");
            return (
              <div key={bin.id}
                className="bg-white rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all"
                style={{
                  border:     isSelected ? "2px solid #2E7D32" : "1px solid #E5E7EB",
                  boxShadow:  isSelected ? "0 0 0 3px rgba(46,125,50,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
                }}
                onClick={() => toggleSelect(bin.id)}>

                {/* Card header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded flex-shrink-0"
                      style={{ width: 18, height: 18, background: isSelected ? "#2E7D32" : "#fff", border: isSelected ? "none" : "1.5px solid #D1D5DB" }}>
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{bin.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isNew && (
                      <span className="rounded-full px-2 py-0.5 font-semibold"
                        style={{ fontSize: 9, background: "#E3F2FD", color: "#1976D2" }}>NEW</span>
                    )}
                    <span className="rounded-full px-2 py-0.5 font-semibold"
                      style={{ fontSize: 10, background: sc.bg, color: sc.color }}>{bin.status ?? "—"}</span>
                  </div>
                </div>

                {/* QR */}
                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <QRCard bin={bin} size={160} />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-0.5">
                  <p className="text-text-secondary" style={{ fontSize: 12 }}>{bin.street}</p>
                  <p className="text-text-muted" style={{ fontSize: 11 }}>ID: {bin.id}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setPreviewBin(bin)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium hover:bg-gray-100 transition-colors"
                    style={{ fontSize: 12, color: "#6B7280", border: "1px solid #E5E7EB" }}>
                    <QrCode size={12} /> Preview
                  </button>
                  <button onClick={() => handleDownload(bin)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium hover:bg-green-50 transition-colors"
                    style={{ fontSize: 12, color: "#2E7D32", border: "1px solid #C8E6C9" }}>
                    <Download size={12} /> Download
                  </button>
                  <button onClick={() => setConfirmDel(bin.id)}
                    className="flex items-center justify-center rounded-lg py-1.5 px-2 hover:bg-red-50 transition-colors"
                    style={{ border: "1px solid #FFCDD2", color: "#DC2626" }}
                    title="Delete bin">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && !loadingBins && (
            <div className="col-span-full text-center text-text-muted py-12" style={{ fontSize: 14 }}>
              No bins match your search.
            </div>
          )}
        </div>
      )}

      {/* ── ADD BIN MODAL ─────────────────────────────────────────────────────── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={handleAddClose}>
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-5 relative"
            style={{ width: 620, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "92vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>

            <button onClick={handleAddClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={16} color="#6B7280" />
            </button>

            {addedBin ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="flex items-center justify-center rounded-full"
                  style={{ width: 64, height: 64, background: "#E8F5E9" }}>
                  <QrCode size={30} color="#2E7D32" />
                </div>
                <div className="text-center">
                  <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>Bin Added!</h2>
                  <p className="text-text-secondary mt-1" style={{ fontSize: 13 }}>
                    <strong>{addedBin.name}</strong> has been registered and its QR code is ready.
                  </p>
                </div>
                <div className="flex justify-center">
                  <QRCard bin={addedBin} size={180} />
                </div>
                <div className="rounded-xl px-4 py-3 w-full flex flex-col gap-1"
                  style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                  <div className="flex justify-between">
                    <span className="text-text-muted" style={{ fontSize: 12 }}>Bin ID</span>
                    <span className="font-semibold text-text-primary" style={{ fontSize: 12 }}>{addedBin.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted" style={{ fontSize: 12 }}>Location</span>
                    <span className="font-semibold text-text-primary" style={{ fontSize: 12 }}>{addedBin.street}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted" style={{ fontSize: 12 }}>Barangay</span>
                    <span className="font-semibold text-text-primary" style={{ fontSize: 12 }}>Brgy. {addedBin.barangay}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <button onClick={() => handleDownload(addedBin)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold hover:opacity-90 transition-opacity"
                    style={{ fontSize: 13, background: "#E8F5E9", color: "#2E7D32", border: "1px solid #C8E6C9" }}>
                    <Download size={14} /> Download QR
                  </button>
                  <button onClick={() => handlePrint([addedBin])}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ fontSize: 13, background: "#1976D2" }}>
                    <Printer size={14} /> Print QR
                  </button>
                </div>
                <button onClick={handleAddClose}
                  className="w-full rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ fontSize: 14, background: "#2E7D32" }}>
                  Done
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div>
                  <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>Add New Bin</h2>
                  <p className="text-text-secondary mt-0.5" style={{ fontSize: 13 }}>
                    Register a new bin for Brgy. {PB_BARANGAY}. A QR code will be generated automatically.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <Field label="Bin Name" required value={form.name}
                    onChange={(v) => { setForm((p) => ({ ...p, name: v })); setFormErrors((p) => ({ ...p, name: undefined })); }}
                    error={formErrors.name} placeholder="e.g. Bin A-03" />
                  <Field label="Street / Location" required value={form.street}
                    onChange={(v) => { setForm((p) => ({ ...p, street: v })); setFormErrors((p) => ({ ...p, street: undefined })); }}
                    error={formErrors.street} placeholder="e.g. P. Burgos St." />

                  {/* Tier selector */}
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
                      Bin Tier <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <select
                      value={form.tier_id}
                      onChange={(e) => { setForm((p) => ({ ...p, tier_id: e.target.value })); setFormErrors((p) => ({ ...p, tier_id: undefined })); }}
                      className="rounded-lg px-3 py-2.5 outline-none"
                      style={{ fontSize: 14, border: formErrors.tier_id ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }}>
                      <option value="">Select a tier…</option>
                      {tiers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}{t.capacity_liters ? ` (${t.capacity_liters}L)` : ""}{t.eco_reward != null ? ` — ${t.eco_reward} ECO` : ""}
                        </option>
                      ))}
                    </select>
                    {formErrors.tier_id && <span style={{ fontSize: 12, color: "#DC2626" }}>{formErrors.tier_id}</span>}
                  </div>

                  {/* Location picker — embedded map */}
                  <LocationPicker
                    lat={form.lat}
                    lng={form.lng}
                    onChange={(la, lo) => {
                      setForm((p) => ({ ...p, lat: la, lng: lo }));
                      setFormErrors((p) => ({ ...p, lat: undefined, lng: undefined }));
                    }}
                  />
                  {(formErrors.lat || formErrors.lng) && (
                    <span style={{ fontSize: 12, color: "#DC2626" }}>
                      {formErrors.lat || formErrors.lng}
                    </span>
                  )}

                  {addError && (
                    <div className="rounded-lg px-4 py-3 text-center font-medium"
                      style={{ background: "#FFEBEE", color: "#DC2626", fontSize: 13, border: "1px solid #FFCDD2" }}>
                      {addError}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={handleAddClose}
                    className="flex-1 rounded-xl py-2.5 font-medium"
                    style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>
                    Cancel
                  </button>
                  <button onClick={handleAddBin} disabled={addLoading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ fontSize: 14, background: "#2E7D32", opacity: addLoading ? 0.7 : 1 }}>
                    <Plus size={14} /> {addLoading ? "Creating…" : "Add & Generate QR"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ─────────────────────────────────────────────────────── */}
      {previewBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setPreviewBin(null)}>
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-5 relative"
            style={{ width: 380, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}>

            <button onClick={() => setPreviewBin(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={16} color="#6B7280" />
            </button>

            <div>
              <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>{previewBin.name}</h2>
              <p className="text-text-secondary mt-0.5" style={{ fontSize: 13 }}>
                {previewBin.street}, Brgy. {previewBin.barangay}
              </p>
            </div>

            <div className="flex justify-center">
              <QRCard bin={previewBin} size={220} />
            </div>

            <div className="rounded-xl p-3 flex flex-col gap-1.5"
              style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
              <p className="font-semibold text-text-primary" style={{ fontSize: 12 }}>Encoded Data</p>
              <code className="text-text-muted break-all" style={{ fontSize: 10, lineHeight: 1.6 }}>
                {buildPayload(previewBin)}
              </code>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-text-secondary font-medium" style={{ fontSize: 13 }}>Status:</span>
              <span className="rounded-full px-2.5 py-0.5 font-semibold"
                style={{ fontSize: 12, background: statusColor(previewBin.status).bg, color: statusColor(previewBin.status).color }}>
                {previewBin.status ?? "—"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => handleDownload(previewBin)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: "#E8F5E9", color: "#2E7D32", border: "1px solid #C8E6C9" }}>
                <Download size={14} /> Download PNG
              </button>
              <button onClick={() => { setPreviewBin(null); handlePrint([previewBin]); }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: "#1976D2" }}>
                <Printer size={14} /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MANAGE TIERS MODAL ────────────────────────────────────────────────── */}
      {tiersOpen && (
        <ManageTiersModal
          token={token}
          onClose={() => setTiersOpen(false)}
          onTiersChanged={() => { fetchTiers(); fetchBins(); }}
        />
      )}

      {/* ── CONFIRM SINGLE DELETE ─────────────────────────────────────────────── */}
      {confirmDel && (
        <ConfirmDialog
          message="Delete this bin and its QR code? This cannot be undone."
          onConfirm={() => deleteBin(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {/* ── CONFIRM BULK DELETE ───────────────────────────────────────────────── */}
      {confirmBulkDel && (
        <ConfirmDialog
          message={`Delete ${selected.length} selected bin(s)? This cannot be undone.`}
          onConfirm={bulkDelete}
          onCancel={() => setConfirmBulkDel(false)}
        />
      )}
    </div>
  );
}
