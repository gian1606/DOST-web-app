import { colors } from "../../../theme/colors.js";
/**
 * QRCodes.jsx — BE-SMART Punong Barangay · QR Code Management
 *
 * Two tabs:
 *   1. Bin QR Codes  — CRUD for smart waste bins
 *   2. MRF QR Codes  — CRUD for MRF facility QR codes
 *
 * Bin tab features:
 *  • Fetch bins + tiers from real API (with mock-data fallback)
 *  • Tier filter, Manage Tiers modal
 *  • Add Bin modal with tier selector + LocationPicker
 *  • Delete individual bin + bulk delete
 *  • Print / Download / Preview QR
 *
 * MRF tab features:
 *  • Fetch MRF QR records from real API (no mock fallback)
 *  • Add MRF QR modal with Name, Address + LocationPicker
 *  • Delete individual MRF QR (no edit — immutable after creation)
 *  • Print / Download / Preview QR
 */

import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  QrCode, Download, Printer, Search, Plus, X,
  Trash2, Settings, RefreshCw, ChevronDown, MapPin,
} from "lucide-react";
import { BINS } from "../../../mock/data";
import {
  fetchBins as fetchBinsApi,
  createBin as createBinApi,
  deleteBin as deleteBinApi,
  bulkDeleteBins,
} from "../../../services/bins.js";
import {
  fetchTiers as fetchTiersApi,
  createTier,
  updateTier,
  deleteTier,
} from "../../../services/tiers.js";
import {
  fetchMrfQrCodes,
  createMrfQrCode,
  deleteMrfQrCode,
} from "../../../services/mrfQr.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { DEFAULT_LAT, DEFAULT_LNG } from "../../../constants/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS (used by both tabs)
// ─────────────────────────────────────────────────────────────────────────────

// ── LocationPicker — Leaflet map with two-way coordinate sync ─────────────────
function LocationPicker({ lat, lng, onChange, mapId }) {
  const hasPin  = lat !== "" && lng !== "" && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
  const pinLat  = hasPin ? parseFloat(lat) : DEFAULT_LAT;
  const pinLng  = hasPin ? parseFloat(lng) : DEFAULT_LNG;

  useEffect(() => {
    // Inject Leaflet CSS + JS from CDN once
    if (document.getElementById("leaflet-css-cdn")) {
      // Already injected — init map directly
      if (window.L) initMap(pinLat, pinLng, hasPin);
      return;
    }

    const css      = document.createElement("link");
    css.id         = "leaflet-css-cdn";
    css.rel        = "stylesheet";
    css.href       = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);

    const js       = document.createElement("script");
    js.id          = "leaflet-js-cdn";
    js.src         = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload      = () => initMap(pinLat, pinLng, hasPin);
    document.head.appendChild(js);
  }, []);

  useEffect(() => {
    if (window.L) initMap(pinLat, pinLng, hasPin);
  }, []);

  // Move map + update marker when coordinate inputs change
  useEffect(() => {
    const L         = window.L;
    const container = document.getElementById(mapId);
    if (!L || !container || !container._leafletMapInstance) return;
    const la = parseFloat(lat);
    const lo = parseFloat(lng);
    if (!isNaN(la) && !isNaN(lo)) {
      container._leafletMapInstance.setView([la, lo], 16);
    }
  }, [lat, lng]);

  function initMap(centerLat, centerLng, showMarker) {
    const L         = window.L;
    if (!L) return;
    const container = document.getElementById(mapId);
    if (!container) return;

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

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
        Pin Location
        <span className="ml-1 font-normal text-text-muted" style={{ fontSize: 12 }}>
          — click the map to place a pin, or type coordinates below
        </span>
      </label>

      <div
        id={mapId}
        className="rounded-xl overflow-hidden"
        style={{ height: 240, border: "1.5px solid " + colors.gray200, background: colors.gray100, zIndex: 0 }}
      />

      <div className="flex gap-2 items-end">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-text-muted" style={{ fontSize: 11 }}>Latitude</label>
          <input
            type="number"
            value={lat}
            onChange={(e) => onChange(e.target.value, lng)}
            placeholder="13.7565"
            className="rounded-lg px-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.gray50 }}
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
            style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.gray50 }}
            step="any"
          />
        </div>
        {hasPin && (
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="rounded-lg px-3 py-2 font-medium hover:bg-red-50"
            style={{ fontSize: 12, border: "1.5px solid " + colors.inputErrorBorder, color: colors.error, background: colors.errorSoft }}
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

// ── Form field ────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, error, placeholder, required, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
        {label}{required && <span style={{ color: colors.error }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg px-3 py-2.5 outline-none"
        style={{
          fontSize: 14,
          border: error
            ? "1.5px solid " + colors.error
            : "1.5px solid " + colors.gray200,
          background: colors.gray50,
        }}
      />
      {error && <span style={{ fontSize: 12, color: colors.error }}>{error}</span>}
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 w-full" style={{ maxWidth: 360 }}>
        <p className="text-text-primary font-medium text-center" style={{ fontSize: 15 }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg py-2.5 font-semibold hover:bg-gray-100"
            style={{ border: "1.5px solid " + colors.gray200, fontSize: 14, color: colors.gray700 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg py-2.5 font-semibold text-white hover:opacity-90"
            style={{ background: colors.error, fontSize: 14 }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Download helper ───────────────────────────────────────────────────────────
function handleDownload(name, qrPayload) {
  import("qrcode").then((mod) => {
    const QRCode = mod.default ?? mod;
    QRCode.toDataURL(qrPayload, { width: 400, margin: 2 }, (err, url) => {
      if (err) return;
      const a      = document.createElement("a");
      a.href       = url;
      a.download   = `QR_${name.replace(/\s+/g, "_")}.png`;
      a.click();
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BIN TAB HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildBinPayload(bin) {
  if (bin.qrPayload) return bin.qrPayload;
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

function binStatusColor(s) {
  const key = (s || "").toLowerCase();
  if (key === "full")      return { bg: colors.errorSoft,    color: colors.error    };
  if (key === "missed")    return { bg: colors.warningSoft,  color: colors.warning  };
  if (key === "collected") return { bg: colors.accentSoft,   color: colors.primary  };
  if (key === "locked")    return { bg: colors.lockedSoft,   color: colors.lockedText };
  return { bg: colors.gray100, color: colors.gray500 };
}

async function handleBinPrint(printBins, barangayName) {
  if (!printBins.length) return;
  const QRCode = await import("qrcode").then((m) => m.default ?? m);
  const cards  = await Promise.all(
    printBins.map(async (bin) => {
      const url = await QRCode.toDataURL(buildBinPayload(bin), { width: 320, margin: 2 });
      return `
        <div class="card">
          <img src="${url}" alt="QR ${bin.name}" />
          <div class="name">${bin.name}</div>
          <div class="sub">${bin.street ?? ""}</div>
          <div class="badge">${bin.status ?? "—"}</div>
        </div>`;
    })
  );
  const html = `<!DOCTYPE html><html><head>
    <title>BE-SMART Bin QR Codes — Brgy. ${barangayName}</title>
    <style>
      body{font-family:sans-serif;margin:0;padding:16px}
      .grid{display:flex;flex-wrap:wrap;gap:24px}
      .card{border:1px solid ${colors.gray200};border-radius:12px;padding:16px;
            display:flex;flex-direction:column;align-items:center;gap:8px;
            width:200px;page-break-inside:avoid}
      .card img{width:160px;height:160px}
      .name{font-weight:700;font-size:13px;text-align:center}
      .sub{font-size:11px;color:${colors.gray500};text-align:center}
      .badge{background:${colors.accentSoft};color:${colors.primary};border-radius:99px;
             padding:2px 8px;font-size:10px;font-weight:600}
      h2{font-size:16px;margin-bottom:16px;color:${colors.sidebarBg}}
      @media print{@page{margin:12mm}}
    </style></head><body>
    <h2>BE-SMART · Brgy. ${barangayName} · Bin QR Codes</h2>
    <div class="grid">${cards.join("")}</div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
    </body></html>`;
  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(html);
  win.document.close();
}

// ── Manage Tiers Modal ────────────────────────────────────────────────────────
function ManageTiersModal({ onClose, onTiersChanged }) {
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
      setTiers(await fetchTiersApi());
    } catch {
      setError("Failed to load tiers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTiers(); }, []);

  async function handleAdd() {
    if (!newName.trim()) { setError("Tier name is required."); return; }
    setSaving(true); setError("");
    try {
      await createTier({ name: newName.trim(), capacityLiters: newCap ? parseInt(newCap) : null });
      setNewName(""); setNewCap("");
      await loadTiers();
      onTiersChanged();
    } catch (err) {
      setError(err.message || "Failed to create tier.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id) {
    if (!editName.trim()) { setError("Tier name is required."); return; }
    setSaving(true); setError("");
    try {
      await updateTier(id, { name: editName.trim(), capacityLiters: editCap ? parseInt(editCap) : null });
      setEditId(null);
      await loadTiers();
      onTiersChanged();
    } catch (err) {
      setError(err.message || "Failed to update tier.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setSaving(true); setError("");
    try {
      await deleteTier(id);
      setConfirmDel(null);
      await loadTiers();
      onTiersChanged();
    } catch (err) {
      setError(err.message || "Failed to delete tier.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="bg-white rounded-2xl p-6 flex flex-col gap-4 w-full overflow-y-auto"
        style={{ maxWidth: 480, maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>Manage Tiers</h2>
          <button onClick={onClose}><X size={20} color={colors.gray500} /></button>
        </div>

        {error && (
          <div
            className="rounded-lg px-3 py-2 text-center"
            style={{ background: colors.errorSoft, color: colors.error, fontSize: 13 }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4" style={{ color: colors.textMuted, fontSize: 14 }}>Loading…</div>
        ) : (
          <div className="flex flex-col gap-2">
            {tiers.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{
                  border: "1.5px solid " + colors.gray200,
                  background: editId === t.id ? colors.gray50 : colors.white,
                }}
              >
                {editId === t.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-lg px-2 py-1 outline-none"
                      style={{ fontSize: 13, border: "1px solid " + colors.gray200 }}
                      placeholder="Tier name"
                    />
                    <input
                      value={editCap}
                      onChange={(e) => setEditCap(e.target.value)}
                      className="rounded-lg px-2 py-1 outline-none w-20"
                      style={{ fontSize: 13, border: "1px solid " + colors.gray200 }}
                      placeholder="Liters"
                      type="number"
                    />
                    <button
                      onClick={() => handleUpdate(t.id)}
                      disabled={saving}
                      className="rounded-lg px-3 py-1 text-white font-medium text-xs hover:opacity-90"
                      style={{ background: colors.primary }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="rounded-lg px-2 py-1 text-xs font-medium hover:bg-gray-100"
                      style={{ color: colors.gray500 }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-semibold text-text-primary" style={{ fontSize: 14 }}>
                      {t.name}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 font-medium"
                      style={{ fontSize: 11, background: colors.infoSoft, color: colors.infoClassic }}
                    >
                      {t.capacityLiters ? `${t.capacityLiters}L` : "Bulk"}
                    </span>
                    <button
                      onClick={() => { setEditId(t.id); setEditName(t.name); setEditCap(t.capacityLiters ?? ""); }}
                      className="text-text-muted hover:text-text-primary"
                      title="Edit"
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmDel(t.id)}
                      className="text-text-muted hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-4 flex flex-col gap-3">
          <p className="font-semibold text-text-primary" style={{ fontSize: 13 }}>Add New Tier</p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 outline-none"
              style={{ fontSize: 13, border: "1.5px solid " + colors.gray200 }}
              placeholder="Tier name (e.g. Tier 4)"
            />
            <input
              value={newCap}
              onChange={(e) => setNewCap(e.target.value)}
              type="number"
              className="rounded-lg px-3 py-2 outline-none w-24"
              style={{ fontSize: 13, border: "1.5px solid " + colors.gray200 }}
              placeholder="Liters"
            />
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90"
              style={{ background: colors.primary, fontSize: 13 }}
            >
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

// ─────────────────────────────────────────────────────────────────────────────
// BIN QR CODES TAB
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_BIN_FORM = { name: "", street: "", tier_id: "", lat: "", lng: "" };

function BinTab({ barangayName }) {
  const { token } = useAuth();

  const [bins, setBins]               = useState(() => BINS.filter((b) => b.barangay === barangayName));
  const [tiers, setTiers]             = useState([]);
  const [loadingBins, setLoadingBins] = useState(true);
  const [fetchError, setFetchError]   = useState(null);

  const [search, setSearch]           = useState("");
  const [filterTier, setFilterTier]   = useState("");
  const [selected, setSelected]       = useState([]);
  const [previewBin, setPreviewBin]   = useState(null);

  const [addOpen, setAddOpen]         = useState(false);
  const [form, setForm]               = useState(EMPTY_BIN_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [addedBin, setAddedBin]       = useState(null);
  const [addLoading, setAddLoading]   = useState(false);
  const [addError, setAddError]       = useState("");

  const [tiersOpen, setTiersOpen]     = useState(false);

  const [confirmDel, setConfirmDel]         = useState(null);
  const [confirmBulkDel, setConfirmBulkDel] = useState(false);

  async function loadTiers() {
    try { setTiers(await fetchTiersApi()); } catch { /* keep existing */ }
  }

  async function loadBins() {
    setLoadingBins(true); setFetchError(null);
    try {
      const apiBins = await fetchBinsApi(barangayName);
      if (apiBins.length > 0) {
        setBins((prev) => {
          const apiIds = new Set(apiBins.map((b) => b.id));
          return [...apiBins, ...prev.filter((b) => !apiIds.has(b.id))];
        });
      }
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoadingBins(false);
    }
  }

  useEffect(() => {
    if (!token) { setLoadingBins(false); return; }
    loadTiers();
    loadBins();
  }, []);

  const filtered = bins.filter((b) => {
    const matchSearch =
      !search.trim() ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.street ?? "").toLowerCase().includes(search.toLowerCase());
    const matchTier = !filterTier || String(b.tierId) === String(filterTier);
    return matchSearch && matchTier;
  });

  function toggleSelect(id)  { setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]); }
  function selectAll()       { setSelected(filtered.map((b) => b.id)); }
  function clearSelection()  { setSelected([]); }

  async function handleDeleteBin(id) {
    const bin       = bins.find((b) => b.id === id);
    const isMock    = !bin || bin.id.toString().startsWith("bin-") || bin.id.toString().length < 20;
    if (isMock) {
      setBins((p) => p.filter((b) => b.id !== id));
      setSelected((p) => p.filter((x) => x !== id));
      setConfirmDel(null);
      return;
    }
    try {
      await deleteBinApi(id);
      setBins((p) => p.filter((b) => b.id !== id));
      setSelected((p) => p.filter((x) => x !== id));
    } catch (err) { alert(err.message); }
    setConfirmDel(null);
  }

  async function handleBulkDelete() {
    const mockIds = selected.filter((id) => {
      const b = bins.find((b) => b.id === id);
      return !b || b.id.toString().startsWith("bin-") || b.id.toString().length < 20;
    });
    const realIds = selected.filter((id) => !mockIds.includes(id));
    if (mockIds.length > 0) setBins((p) => p.filter((b) => !mockIds.includes(b.id)));
    if (realIds.length > 0) {
      try {
        await bulkDeleteBins(realIds);
        setBins((p) => p.filter((b) => !realIds.includes(b.id)));
      } catch (err) { alert(err.message); }
    }
    setSelected([]);
    setConfirmBulkDel(false);
  }

  function openAdd() {
    setForm(EMPTY_BIN_FORM); setFormErrors({});
    setAddedBin(null); setAddError("");
    setAddOpen(true);
  }
  function handleAddClose() { setAddOpen(false); setAddedBin(null); }

  function validateBinForm() {
    const e = {};
    if (!form.name.trim())   e.name    = "Bin name is required.";
    if (!form.street.trim()) e.street  = "Street / location is required.";
    if (!form.tier_id)       e.tier_id = "Please select a bin tier.";
    if (form.lat && isNaN(parseFloat(form.lat))) e.lat = "Must be a valid number.";
    if (form.lng && isNaN(parseFloat(form.lng))) e.lng = "Must be a valid number.";
    return e;
  }

  async function handleAddBin() {
    const e = validateBinForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setAddLoading(true); setAddError("");
    try {
      const newBin = await createBinApi({
        name:      form.name.trim(),
        street:    form.street.trim(),
        barangay:  barangayName,
        tierId:    form.tier_id,
        latitude:  form.lat ? parseFloat(form.lat) : undefined,
        longitude: form.lng ? parseFloat(form.lng) : undefined,
      });
      setBins((p) => [{ ...newBin, status: newBin.status ?? "ok" }, ...p]);
      setAddedBin(newBin);
    } catch (err) {
      setAddError(err.message || "Unable to connect to the server.");
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {selected.length > 0 && (
          <>
            <span className="rounded-full px-3 py-1 font-semibold text-white"
              style={{ fontSize: 12, background: colors.primary }}>
              {selected.length} selected
            </span>
            <button
              onClick={clearSelection}
              className="rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
              style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}
            >
              Clear
            </button>
            <button
              onClick={() => handleBinPrint(bins.filter((b) => selected.includes(b.id)), barangayName)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 13, background: colors.recyclable }}
            >
              <Printer size={14} /> Print Selected
            </button>
            <button
              onClick={() => setConfirmBulkDel(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 13, background: colors.error }}
            >
              <Trash2 size={14} /> Delete Selected
            </button>
          </>
        )}
        <button
          onClick={selectAll}
          className="rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
          style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, color: colors.gray700 }}
        >
          Select All
        </button>
        <button
          onClick={() => setTiersOpen(true)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
          style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, color: colors.gray700 }}
        >
          <Settings size={14} /> Manage Tiers
        </button>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 13, background: colors.primary }}
        >
          <Plus size={14} /> Add Bin
        </button>
      </div>

      {/* ── Info banner ── */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: colors.accentSoft, border: "1px solid " + colors.accentBorder }}
      >
        <QrCode size={16} color={colors.primary} className="flex-shrink-0 mt-0.5" />
        <p style={{ fontSize: 13, color: colors.sidebarBg }}>
          Each QR code encodes the bin's ID, name, street, and barangay. Residents scan these
          with the BE-SMART mobile app to report bin status. Print and attach them to the physical bins.
          <strong className="ml-1">Total: {bins.length} bins</strong>
        </p>
      </div>

      {/* ── Fetch error ── */}
      {fetchError && (
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: colors.warningSoft, border: "1px solid " + colors.warningBorder }}
        >
          <span style={{ fontSize: 13, color: colors.warning }}>
            Could not load bins from server — showing local data. ({fetchError})
          </span>
          <button
            onClick={loadBins}
            className="flex items-center gap-1.5 font-semibold hover:opacity-80"
            style={{ fontSize: 13, color: colors.warning }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* ── Search + Tier filter ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex items-center" style={{ maxWidth: 320, flex: 1 }}>
          <Search size={14} className="absolute left-3" color={colors.textMuted} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bin name or street…"
            className="w-full rounded-lg pl-9 pr-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.gray50 }}
          />
        </div>
        <div className="relative flex items-center">
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="rounded-lg pl-3 pr-8 py-2 outline-none appearance-none"
            style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.gray50, color: colors.gray700, minWidth: 160 }}
          >
            <option value="">All Tiers</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}{t.capacityLiters ? ` (${t.capacityLiters}L)` : ""}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2 pointer-events-none" color={colors.textMuted} />
        </div>
      </div>

      {/* ── Bin Grid ── */}
      {loadingBins ? (
        <div className="text-center py-16 text-text-muted" style={{ fontSize: 14 }}>Loading bins…</div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {filtered.map((bin) => {
            const sc         = binStatusColor(bin.status);
            const isSelected = selected.includes(bin.id);
            const isNew      = String(bin.id).startsWith("pb_bin_");
            const payload    = buildBinPayload(bin);
            return (
              <div
                key={bin.id}
                className="bg-white rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all"
                style={{
                  border:    isSelected ? `2px solid ${colors.primary}` : `1px solid ${colors.gray200}`,
                  boxShadow: isSelected ? "0 0 0 3px rgba(46,125,50,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
                }}
                onClick={() => toggleSelect(bin.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center rounded flex-shrink-0"
                      style={{
                        width: 18, height: 18,
                        background: isSelected ? colors.primary : colors.white,
                        border: isSelected ? "none" : `1.5px solid ${colors.gray300}`,
                      }}
                    >
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
                        style={{ fontSize: 9, background: colors.infoSoft, color: colors.recyclable }}>NEW</span>
                    )}
                    <span className="rounded-full px-2 py-0.5 font-semibold"
                      style={{ fontSize: 10, background: sc.bg, color: sc.color }}>
                      {bin.status ?? "—"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <QRCodeCanvas
                    value={payload}
                    size={160}
                    level="M"
                    includeMargin={true}
                    style={{ borderRadius: 4, border: "1px solid " + colors.gray200 }}
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <p className="text-text-secondary" style={{ fontSize: 12 }}>{bin.street}</p>
                  <p className="text-text-muted" style={{ fontSize: 11 }}>ID: {bin.id}</p>
                </div>

                <div className="flex items-center gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setPreviewBin(bin)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium hover:bg-gray-100 transition-colors"
                    style={{ fontSize: 12, color: colors.gray500, border: "1px solid " + colors.gray200 }}
                  >
                    <QrCode size={12} /> Preview
                  </button>
                  <button
                    onClick={() => handleDownload(bin.name, payload)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium hover:bg-green-50 transition-colors"
                    style={{ fontSize: 12, color: colors.primary, border: "1px solid " + colors.accentBorder }}
                  >
                    <Download size={12} /> Download
                  </button>
                  <button
                    onClick={() => setConfirmDel(bin.id)}
                    className="flex items-center justify-center rounded-lg py-1.5 px-2 hover:bg-red-50 transition-colors"
                    style={{ border: "1px solid " + colors.errorBorder, color: colors.error }}
                    title="Delete bin"
                  >
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={handleAddClose}
        >
          <div
            className="bg-white rounded-2xl p-6 flex flex-col gap-5 relative"
            style={{ width: 620, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "92vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleAddClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} color={colors.gray500} />
            </button>

            {addedBin ? (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="flex items-center justify-center rounded-full"
                  style={{ width: 64, height: 64, background: colors.accentSoft }}>
                  <QrCode size={30} color={colors.primary} />
                </div>
                <div className="text-center">
                  <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>Bin Added!</h2>
                  <p className="text-text-secondary mt-1" style={{ fontSize: 13 }}>
                    <strong>{addedBin.name}</strong> has been registered and its QR code is ready.
                  </p>
                </div>
                <div className="flex justify-center">
                  <QRCodeCanvas
                    value={buildBinPayload(addedBin)}
                    size={180}
                    level="M"
                    includeMargin={true}
                    style={{ borderRadius: 4, border: "1px solid " + colors.gray200 }}
                  />
                </div>
                <div
                  className="rounded-xl px-4 py-3 w-full flex flex-col gap-1"
                  style={{ background: colors.gray50, border: `1px solid ${colors.gray100}` }}
                >
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
                  <button
                    onClick={() => handleDownload(addedBin.name, buildBinPayload(addedBin))}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold hover:opacity-90 transition-opacity"
                    style={{ fontSize: 13, background: colors.accentSoft, color: colors.primary, border: "1px solid " + colors.accentBorder }}
                  >
                    <Download size={14} /> Download QR
                  </button>
                  <button
                    onClick={() => handleBinPrint([addedBin], barangayName)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ fontSize: 13, background: colors.recyclable }}
                  >
                    <Printer size={14} /> Print QR
                  </button>
                </div>
                <button
                  onClick={handleAddClose}
                  className="w-full rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ fontSize: 14, background: colors.primary }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>Add New Bin</h2>
                  <p className="text-text-secondary mt-0.5" style={{ fontSize: 13 }}>
                    Register a new bin for Brgy. {barangayName}. A QR code will be generated automatically.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <Field
                    label="Bin Name" required value={form.name}
                    onChange={(v) => { setForm((p) => ({ ...p, name: v })); setFormErrors((p) => ({ ...p, name: undefined })); }}
                    error={formErrors.name} placeholder="e.g. Bin A-03"
                  />
                  <Field
                    label="Street / Location" required value={form.street}
                    onChange={(v) => { setForm((p) => ({ ...p, street: v })); setFormErrors((p) => ({ ...p, street: undefined })); }}
                    error={formErrors.street} placeholder="e.g. P. Burgos St."
                  />
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
                      Bin Tier <span style={{ color: colors.error }}>*</span>
                    </label>
                    <select
                      value={form.tier_id}
                      onChange={(e) => { setForm((p) => ({ ...p, tier_id: e.target.value })); setFormErrors((p) => ({ ...p, tier_id: undefined })); }}
                      className="rounded-lg px-3 py-2.5 outline-none"
                      style={{
                        fontSize: 14,
                        border: formErrors.tier_id ? "1.5px solid " + colors.error : "1.5px solid " + colors.gray200,
                        background: colors.gray50,
                      }}
                    >
                      <option value="">Select a tier…</option>
                      {tiers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}{t.capacityLiters ? ` (${t.capacityLiters}L)` : ""}{t.ecoReward != null ? ` — ${t.ecoReward} ECO` : ""}
                        </option>
                      ))}
                    </select>
                    {formErrors.tier_id && <span style={{ fontSize: 12, color: colors.error }}>{formErrors.tier_id}</span>}
                  </div>
                  <LocationPicker
                    mapId="bin-location-map"
                    lat={form.lat}
                    lng={form.lng}
                    onChange={(la, lo) => {
                      setForm((p) => ({ ...p, lat: la, lng: lo }));
                      setFormErrors((p) => ({ ...p, lat: undefined, lng: undefined }));
                    }}
                  />
                  {(formErrors.lat || formErrors.lng) && (
                    <span style={{ fontSize: 12, color: colors.error }}>
                      {formErrors.lat || formErrors.lng}
                    </span>
                  )}
                  {addError && (
                    <div
                      className="rounded-lg px-4 py-3 text-center font-medium"
                      style={{ background: colors.errorSoft, color: colors.error, fontSize: 13, border: "1px solid " + colors.errorBorder }}
                    >
                      {addError}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddClose}
                    className="flex-1 rounded-xl py-2.5 font-medium"
                    style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBin}
                    disabled={addLoading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ fontSize: 14, background: colors.primary, opacity: addLoading ? 0.7 : 1 }}
                  >
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setPreviewBin(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 flex flex-col gap-5 relative"
            style={{ width: 380, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewBin(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} color={colors.gray500} />
            </button>
            <div>
              <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>{previewBin.name}</h2>
              <p className="text-text-secondary mt-0.5" style={{ fontSize: 13 }}>
                {previewBin.street}, Brgy. {previewBin.barangay}
              </p>
            </div>
            <div className="flex justify-center">
              <QRCodeCanvas
                value={buildBinPayload(previewBin)}
                size={220}
                level="M"
                includeMargin={true}
                style={{ borderRadius: 4, border: "1px solid " + colors.gray200 }}
              />
            </div>
            <div
              className="rounded-xl p-3 flex flex-col gap-1.5"
              style={{ background: colors.gray50, border: `1px solid ${colors.gray100}` }}
            >
              <p className="font-semibold text-text-primary" style={{ fontSize: 12 }}>Encoded Data</p>
              <code className="text-text-muted break-all" style={{ fontSize: 10, lineHeight: 1.6 }}>
                {buildBinPayload(previewBin)}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary font-medium" style={{ fontSize: 13 }}>Status:</span>
              <span
                className="rounded-full px-2.5 py-0.5 font-semibold"
                style={{ fontSize: 12, background: binStatusColor(previewBin.status).bg, color: binStatusColor(previewBin.status).color }}
              >
                {previewBin.status ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownload(previewBin.name, buildBinPayload(previewBin))}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: colors.accentSoft, color: colors.primary, border: "1px solid " + colors.accentBorder }}
              >
                <Download size={14} /> Download PNG
              </button>
              <button
                onClick={() => { setPreviewBin(null); handleBinPrint([previewBin], barangayName); }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: colors.recyclable }}
              >
                <Printer size={14} /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MANAGE TIERS MODAL ────────────────────────────────────────────────── */}
      {tiersOpen && (
        <ManageTiersModal
          onClose={() => setTiersOpen(false)}
          onTiersChanged={() => { loadTiers(); loadBins(); }}
        />
      )}

      {confirmDel && (
        <ConfirmDialog
          message="Delete this bin and its QR code? This cannot be undone."
          onConfirm={() => handleDeleteBin(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
      {confirmBulkDel && (
        <ConfirmDialog
          message={`Delete ${selected.length} selected bin(s)? This cannot be undone.`}
          onConfirm={handleBulkDelete}
          onCancel={() => setConfirmBulkDel(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MRF QR CODES TAB
// ─────────────────────────────────────────────────────────────────────────────

async function handleMrfPrint(records, barangayName) {
  if (!records.length) return;
  const QRCode = await import("qrcode").then((m) => m.default ?? m);
  const cards  = await Promise.all(
    records.map(async (rec) => {
      const url = await QRCode.toDataURL(rec.qrPayload, { width: 320, margin: 2 });
      return `
        <div class="card">
          <img src="${url}" alt="QR ${rec.name}" />
          <div class="name">${rec.name}</div>
          <div class="sub">${rec.address ?? ""}</div>
          <div class="sub">${rec.barangay}</div>
        </div>`;
    })
  );
  const html = `<!DOCTYPE html><html><head>
    <title>BE-SMART MRF QR Codes — Brgy. ${barangayName}</title>
    <style>
      body{font-family:sans-serif;margin:0;padding:16px}
      .grid{display:flex;flex-wrap:wrap;gap:24px}
      .card{border:1px solid ${colors.gray200};border-radius:12px;padding:16px;
            display:flex;flex-direction:column;align-items:center;gap:8px;
            width:200px;page-break-inside:avoid}
      .card img{width:160px;height:160px}
      .name{font-weight:700;font-size:13px;text-align:center}
      .sub{font-size:11px;color:${colors.gray500};text-align:center}
      h2{font-size:16px;margin-bottom:16px;color:${colors.sidebarBg}}
      @media print{@page{margin:12mm}}
    </style></head><body>
    <h2>BE-SMART · Brgy. ${barangayName} · MRF QR Codes</h2>
    <div class="grid">${cards.join("")}</div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
    </body></html>`;
  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(html);
  win.document.close();
}

const EMPTY_MRF_FORM = { name: "", address: "", lat: "", lng: "" };

function MrfTab({ barangayName }) {
  const { token } = useAuth();

  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState(null);

  const [search, setSearch]           = useState("");

  const [addOpen, setAddOpen]         = useState(false);
  const [form, setForm]               = useState(EMPTY_MRF_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [addedRec, setAddedRec]       = useState(null);
  const [addLoading, setAddLoading]   = useState(false);
  const [addError, setAddError]       = useState("");

  const [previewRec, setPreviewRec]   = useState(null);
  const [confirmDel, setConfirmDel]   = useState(null);

  async function loadRecords() {
    setLoading(true); setFetchError(null);
    try {
      const data = await fetchMrfQrCodes(barangayName);
      setRecords(data);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    loadRecords();
  }, []);

  const filtered = records.filter((r) =>
    !search.trim() ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.address ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setForm(EMPTY_MRF_FORM); setFormErrors({});
    setAddedRec(null); setAddError("");
    setAddOpen(true);
  }
  function handleAddClose() { setAddOpen(false); setAddedRec(null); }

  function validateMrfForm() {
    const e = {};
    if (!form.name.trim()) e.name = "MRF name is required.";
    if (form.lat && isNaN(parseFloat(form.lat))) e.lat = "Must be a valid number.";
    if (form.lng && isNaN(parseFloat(form.lng))) e.lng = "Must be a valid number.";
    return e;
  }

  async function handleAddMrf() {
    const e = validateMrfForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setAddLoading(true); setAddError("");
    try {
      const newRec = await createMrfQrCode({
        name:      form.name.trim(),
        barangay:  barangayName,
        address:   form.address.trim() || undefined,
        latitude:  form.lat ? parseFloat(form.lat) : undefined,
        longitude: form.lng ? parseFloat(form.lng) : undefined,
      });
      setRecords((p) => [newRec, ...p]);
      setAddedRec(newRec);
    } catch (err) {
      setAddError(err.message || "Unable to connect to the server.");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteMrfQrCode(id);
      setRecords((p) => p.filter((r) => r.id !== id));
    } catch (err) { alert(err.message); }
    setConfirmDel(null);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 13, background: colors.primary }}
        >
          <Plus size={14} /> Add MRF QR
        </button>
      </div>

      {/* ── Info banner ── */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: colors.accentSoft, border: "1px solid " + colors.accentBorder }}
      >
        <MapPin size={16} color={colors.primary} className="flex-shrink-0 mt-0.5" />
        <p style={{ fontSize: 13, color: colors.sidebarBg }}>
          Each MRF QR code encodes the facility's ID, name, barangay, address, and GPS location.
          MRF personnel scan this when the facility has materials ready. MRF buyers scan it to
          purchase the materials.
          <strong className="ml-1">Total: {records.length} MRF QR codes</strong>
        </p>
      </div>

      {/* ── Fetch error ── */}
      {fetchError && (
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: colors.warningSoft, border: "1px solid " + colors.warningBorder }}
        >
          <span style={{ fontSize: 13, color: colors.warning }}>
            Could not load MRF QR codes from server. ({fetchError})
          </span>
          <button
            onClick={loadRecords}
            className="flex items-center gap-1.5 font-semibold hover:opacity-80"
            style={{ fontSize: 13, color: colors.warning }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* ── Search ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex items-center" style={{ maxWidth: 320, flex: 1 }}>
          <Search size={14} className="absolute left-3" color={colors.textMuted} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by MRF name or address…"
            className="w-full rounded-lg pl-9 pr-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.gray50 }}
          />
        </div>
      </div>

      {/* ── MRF Grid ── */}
      {loading ? (
        <div className="text-center py-16 text-text-muted" style={{ fontSize: 14 }}>Loading MRF QR codes…</div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {filtered.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl p-4 flex flex-col gap-3"
              style={{ border: `1px solid ${colors.gray200}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{rec.name}</p>
                  <p className="text-text-muted" style={{ fontSize: 11 }}>Brgy. {rec.barangay}</p>
                </div>
              </div>

              {rec.qrPayload ? (
                <div className="flex justify-center">
                  <QRCodeCanvas
                    value={rec.qrPayload}
                    size={160}
                    level="M"
                    includeMargin={true}
                    style={{ borderRadius: 4, border: "1px solid " + colors.gray200 }}
                  />
                </div>
              ) : (
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ height: 160, background: colors.gray100, border: "1px dashed " + colors.gray300 }}
                >
                  <span className="text-text-muted" style={{ fontSize: 12 }}>No QR yet</span>
                </div>
              )}

              <div className="flex flex-col gap-0.5">
                {rec.address && (
                  <p className="text-text-secondary" style={{ fontSize: 12 }}>{rec.address}</p>
                )}
                {rec.latitude != null && rec.longitude != null && (
                  <p className="text-text-muted flex items-center gap-1" style={{ fontSize: 11 }}>
                    <MapPin size={10} /> {Number(rec.latitude).toFixed(5)}, {Number(rec.longitude).toFixed(5)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={() => setPreviewRec(rec)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium hover:bg-gray-100 transition-colors"
                  style={{ fontSize: 12, color: colors.gray500, border: "1px solid " + colors.gray200 }}
                  disabled={!rec.qrPayload}
                >
                  <QrCode size={12} /> Preview
                </button>
                <button
                  onClick={() => handleDownload(rec.name, rec.qrPayload)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium hover:bg-green-50 transition-colors"
                  style={{ fontSize: 12, color: colors.primary, border: "1px solid " + colors.accentBorder }}
                  disabled={!rec.qrPayload}
                >
                  <Download size={12} /> Download
                </button>
                <button
                  onClick={() => setConfirmDel(rec.id)}
                  className="flex items-center justify-center rounded-lg py-1.5 px-2 hover:bg-red-50 transition-colors"
                  style={{ border: "1px solid " + colors.errorBorder, color: colors.error }}
                  title="Delete MRF QR"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center text-text-muted py-12" style={{ fontSize: 14 }}>
              {records.length === 0
                ? "No MRF QR codes yet. Click \"Add MRF QR\" to create one."
                : "No MRF QR codes match your search."}
            </div>
          )}
        </div>
      )}

      {/* ── ADD MRF QR MODAL ──────────────────────────────────────────────────── */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={handleAddClose}
        >
          <div
            className="bg-white rounded-2xl p-6 flex flex-col gap-5 relative"
            style={{ width: 620, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "92vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleAddClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} color={colors.gray500} />
            </button>

            {addedRec ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center gap-4 py-2">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 64, height: 64, background: colors.accentSoft }}
                >
                  <QrCode size={30} color={colors.primary} />
                </div>
                <div className="text-center">
                  <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>MRF QR Created!</h2>
                  <p className="text-text-secondary mt-1" style={{ fontSize: 13 }}>
                    <strong>{addedRec.name}</strong> has been registered and its QR code is ready.
                  </p>
                </div>
                {addedRec.qrPayload && (
                  <div className="flex justify-center">
                    <QRCodeCanvas
                      value={addedRec.qrPayload}
                      size={180}
                      level="M"
                      includeMargin={true}
                      style={{ borderRadius: 4, border: "1px solid " + colors.gray200 }}
                    />
                  </div>
                )}
                <div
                  className="rounded-xl px-4 py-3 w-full flex flex-col gap-1"
                  style={{ background: colors.gray50, border: `1px solid ${colors.gray100}` }}
                >
                  <div className="flex justify-between">
                    <span className="text-text-muted" style={{ fontSize: 12 }}>MRF ID</span>
                    <span className="font-semibold text-text-primary" style={{ fontSize: 12 }}>{addedRec.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted" style={{ fontSize: 12 }}>Address</span>
                    <span className="font-semibold text-text-primary" style={{ fontSize: 12 }}>{addedRec.address || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted" style={{ fontSize: 12 }}>Barangay</span>
                    <span className="font-semibold text-text-primary" style={{ fontSize: 12 }}>Brgy. {addedRec.barangay}</span>
                  </div>
                  {addedRec.latitude != null && addedRec.longitude != null && (
                    <div className="flex justify-between">
                      <span className="text-text-muted" style={{ fontSize: 12 }}>Coordinates</span>
                      <span className="font-semibold text-text-primary" style={{ fontSize: 12 }}>
                        {Number(addedRec.latitude).toFixed(5)}, {Number(addedRec.longitude).toFixed(5)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={() => handleDownload(addedRec.name, addedRec.qrPayload)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold hover:opacity-90 transition-opacity"
                    style={{ fontSize: 13, background: colors.accentSoft, color: colors.primary, border: "1px solid " + colors.accentBorder }}
                  >
                    <Download size={14} /> Download QR
                  </button>
                  <button
                    onClick={() => handleMrfPrint([addedRec], barangayName)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ fontSize: 13, background: colors.recyclable }}
                  >
                    <Printer size={14} /> Print QR
                  </button>
                </div>
                <button
                  onClick={handleAddClose}
                  className="w-full rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ fontSize: 14, background: colors.primary }}
                >
                  Done
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div>
                  <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>Add MRF QR Code</h2>
                  <p className="text-text-secondary mt-0.5" style={{ fontSize: 13 }}>
                    Register a new MRF for Brgy. {barangayName}. A QR code will be generated automatically.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <Field
                    label="MRF Name" required value={form.name}
                    onChange={(v) => { setForm((p) => ({ ...p, name: v })); setFormErrors((p) => ({ ...p, name: undefined })); }}
                    error={formErrors.name} placeholder="e.g. MRF Alangilan"
                  />
                  <Field
                    label="Address" value={form.address}
                    onChange={(v) => setForm((p) => ({ ...p, address: v }))}
                    placeholder="e.g. Purok 3, P. Burgos St."
                  />
                  <LocationPicker
                    mapId="mrf-location-map"
                    lat={form.lat}
                    lng={form.lng}
                    onChange={(la, lo) => {
                      setForm((p) => ({ ...p, lat: la, lng: lo }));
                      setFormErrors((p) => ({ ...p, lat: undefined, lng: undefined }));
                    }}
                  />
                  {(formErrors.lat || formErrors.lng) && (
                    <span style={{ fontSize: 12, color: colors.error }}>
                      {formErrors.lat || formErrors.lng}
                    </span>
                  )}
                  {addError && (
                    <div
                      className="rounded-lg px-4 py-3 text-center font-medium"
                      style={{ background: colors.errorSoft, color: colors.error, fontSize: 13, border: "1px solid " + colors.errorBorder }}
                    >
                      {addError}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddClose}
                    className="flex-1 rounded-xl py-2.5 font-medium"
                    style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMrf}
                    disabled={addLoading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ fontSize: 14, background: colors.primary, opacity: addLoading ? 0.7 : 1 }}
                  >
                    <Plus size={14} /> {addLoading ? "Creating…" : "Add & Generate QR"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ─────────────────────────────────────────────────────── */}
      {previewRec && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setPreviewRec(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 flex flex-col gap-5 relative"
            style={{ width: 380, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewRec(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} color={colors.gray500} />
            </button>
            <div>
              <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>{previewRec.name}</h2>
              <p className="text-text-secondary mt-0.5" style={{ fontSize: 13 }}>
                {previewRec.address ? `${previewRec.address}, ` : ""}Brgy. {previewRec.barangay}
              </p>
            </div>
            <div className="flex justify-center">
              <QRCodeCanvas
                value={previewRec.qrPayload}
                size={220}
                level="M"
                includeMargin={true}
                style={{ borderRadius: 4, border: "1px solid " + colors.gray200 }}
              />
            </div>
            <div
              className="rounded-xl p-3 flex flex-col gap-1.5"
              style={{ background: colors.gray50, border: `1px solid ${colors.gray100}` }}
            >
              <p className="font-semibold text-text-primary" style={{ fontSize: 12 }}>Encoded Data</p>
              <code className="text-text-muted break-all" style={{ fontSize: 10, lineHeight: 1.6 }}>
                {previewRec.qrPayload}
              </code>
            </div>
            {previewRec.latitude != null && previewRec.longitude != null && (
              <div className="flex items-center gap-2">
                <MapPin size={13} color={colors.primary} />
                <span className="text-text-secondary font-medium" style={{ fontSize: 13 }}>
                  {Number(previewRec.latitude).toFixed(6)}, {Number(previewRec.longitude).toFixed(6)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownload(previewRec.name, previewRec.qrPayload)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: colors.accentSoft, color: colors.primary, border: "1px solid " + colors.accentBorder }}
              >
                <Download size={14} /> Download PNG
              </button>
              <button
                onClick={() => { setPreviewRec(null); handleMrfPrint([previewRec], barangayName); }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: colors.recyclable }}
              >
                <Printer size={14} /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <ConfirmDialog
          message="Delete this MRF QR code? This cannot be undone."
          onConfirm={() => handleDelete(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE — two-tab shell
// ─────────────────────────────────────────────────────────────────────────────

export default function QRCodes() {
  const { user }     = useAuth();
  const barangayName = user?.barangay || "Unknown";
  const [activeTab, setActiveTab] = useState("bins");

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ── */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 rounded-xl px-5 py-4"
        style={{
          background: colors.white,
          border: "1px solid " + colors.gray200,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Mga QR Code</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            Pamahalaan ang QR codes ng Basurahan at MRF para sa Brgy. {barangayName}
          </p>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div
        className="flex rounded-xl p-1 gap-1"
        style={{ background: colors.gray100, border: "1px solid " + colors.gray200, maxWidth: 400 }}
      >
        {[
          { key: "bins", label: "Bin QR Codes" },
          { key: "mrf",  label: "MRF QR Codes" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex-1 rounded-lg py-2 font-semibold transition-all"
            style={{
              fontSize: 13,
              background: activeTab === key ? colors.white : "transparent",
              color: activeTab === key ? colors.primary : colors.gray500,
              boxShadow: activeTab === key ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Active tab content ── */}
      {activeTab === "bins"
        ? <BinTab barangayName={barangayName} />
        : <MrfTab barangayName={barangayName} />
      }
    </div>
  );
}
