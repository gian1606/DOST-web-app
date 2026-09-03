/**
 * BinQRCodes.jsx — BE-SMART Punong Barangay · Bin QR Code Management
 *
 * Features:
 *  • Fetches bins + tiers from real API
 *  • Dynamic Tier filter dropdown (from GET /api/tiers)
 *  • Manage Tiers modal (add / edit / delete tiers)
 *  • Add Bin modal (no waste type — tier only)
 *  • Delete individual bin + bulk delete from Select All
 *  • Print 15cm × 15cm sticker layout
 *  • Download QR as PNG
 *  • Preview modal with signed payload inspector
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode, Download, Printer, Search, Plus, X,
  MapPin, Shield, RefreshCw, Trash2, Settings, ChevronDown, Info,
} from "lucide-react";

const API_URL     = import.meta.env.VITE_API_URL;
const PB_BARANGAY = "Alangilan";
const PB_CLUSTER  = "SOLID-EAST";
const BARANGAY_CODE_PREFIX = "ALANGILAN";

// ── Web Crypto HMAC-SHA256 ────────────────────────────────────────────────────
async function hmacSha256Hex(message, secret) {
  const enc    = new TextEncoder();
  const keyMat = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", keyMat, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function canonicalise(obj) {
  const { signature: _s, ...rest } = obj;
  function sortKeys(val) {
    if (Array.isArray(val)) return val.map(sortKeys);
    if (val !== null && typeof val === "object")
      return Object.keys(val).sort().reduce((a, k) => { a[k] = sortKeys(val[k]); return a; }, {});
    return val;
  }
  return JSON.stringify(sortKeys(rest));
}

async function buildSignedPayload(bin) {
  const secret  = import.meta.env.VITE_QR_SECRET_KEY ?? "be-smart-dev-secret-change-in-prod";
  const payload = {
    system:                 "BE-SMART",
    version:                "1.0",
    bin_id:                 bin.id,
    barangay_code:          bin.barangay_code ?? `${BARANGAY_CODE_PREFIX}-01`,
    cluster_id:             bin.cluster_id    ?? PB_CLUSTER,
    tier_name:              bin.tier_name     ?? "Tier 1",
    capacity_liters:        bin.capacity_liters ?? null,
    sticker_dimensions:     "15cm x 15cm",
    coordinates:            { lat: parseFloat(bin.latitude ?? 0), lng: parseFloat(bin.longitude ?? 0) },
    name:                   bin.name,
    street:                 bin.street,
    barangay:               bin.barangay,
    issued_at:              new Date().toISOString(),
  };
  payload.signature = await hmacSha256Hex(canonicalise(payload), secret);
  return JSON.stringify(payload);
}

// ── Status badge helpers ──────────────────────────────────────────────────────
function statusStyle(s) {
  if (s === "FULL")      return { bg: "#FFEBEE", color: "#DC2626" };
  if (s === "MISSED")    return { bg: "#FFF3E0", color: "#D97706" };
  if (s === "COLLECTED") return { bg: "#E8F5E9", color: "#2E7D32" };
  if (s === "LOCKED")    return { bg: "#EDE9FE", color: "#7C3AED" };
  return { bg: "#F3F4F6", color: "#6B7280" };
}

// ── QR Card ───────────────────────────────────────────────────────────────────
function QRCard({ bin, size = 180 }) {
  const [payloadStr, setPayloadStr] = useState(null);
  useEffect(() => {
    let cancelled = false;
    buildSignedPayload(bin).then((s) => { if (!cancelled) setPayloadStr(s); });
    return () => { cancelled = true; };
  }, [bin]);

  if (!payloadStr) {
    return (
      <div className="flex items-center justify-center rounded animate-pulse"
        style={{ width: size, height: size, background: "#F3F4F6", border: "1px solid #E5E7EB" }}>
        <QrCode size={24} color="#9CA3AF" />
      </div>
    );
  }
  return <QRCodeSVG value={payloadStr} size={size} level="H" includeMargin style={{ borderRadius: 4, border: "1px solid #E5E7EB" }} />;
}

// ── Download as PNG ───────────────────────────────────────────────────────────
function useQRDownload() {
  return useCallback(async (bin) => {
    const payloadStr = await buildSignedPayload(bin);
    const container  = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
    document.body.appendChild(container);
    const { createRoot }   = await import("react-dom/client");
    const { QRCodeCanvas } = await import("qrcode.react");
    const { createElement }= await import("react");
    const root = createRoot(container);
    root.render(createElement(QRCodeCanvas, { value: payloadStr, size: 400, level: "H", includeMargin: true }));
    await new Promise((r) => setTimeout(r, 80));
    const canvas = container.querySelector("canvas");
    if (canvas) {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `BESMART_QR_${bin.barangay_code ?? bin.id}_${bin.name.replace(/\s+/g, "_")}.png`;
      a.click();
    }
    root.unmount();
    document.body.removeChild(container);
  }, []);
}

// ── Print ─────────────────────────────────────────────────────────────────────
async function handlePrint(bins) {
  if (!bins.length) return;
  const items = await Promise.all(bins.map((bin) =>
    new Promise((resolve) => {
      buildSignedPayload(bin).then((payload) => {
        const container = document.createElement("div");
        container.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
        document.body.appendChild(container);
        Promise.all([import("react-dom/client"), import("qrcode.react"), import("react")]).then(
          ([{ createRoot }, { QRCodeCanvas }, { createElement }]) => {
            const root = createRoot(container);
            root.render(createElement(QRCodeCanvas, { value: payload, size: 450, level: "H", includeMargin: true }));
            setTimeout(() => {
              const canvas  = container.querySelector("canvas");
              const dataUrl = canvas ? canvas.toDataURL("image/png") : "";
              root.unmount();
              document.body.removeChild(container);
              resolve({ bin, dataUrl, payload });
            }, 80);
          }
        );
      });
    })
  ));

  const html = `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8"><title>BE-SMART QR Stickers</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Helvetica Neue',sans-serif;background:#fff;padding:10mm}
      .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8mm}
      .sticker{width:15cm;height:15cm;border:1.5px solid #1C2B1E;border-radius:6px;
        display:flex;flex-direction:column;align-items:center;justify-content:space-between;
        padding:4mm;page-break-inside:avoid;background:#fff}
      .sticker-header{width:100%;display:flex;align-items:center;justify-content:space-between;
        border-bottom:1px solid #E5E7EB;padding-bottom:2mm;margin-bottom:1mm}
      .brand{font-size:9pt;font-weight:700;color:#1C2B1E}
      .tier-badge{font-size:7pt;font-weight:600;background:#DBEAFE;color:#1D4ED8;border-radius:99px;padding:1mm 3mm}
      .qr-wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:2mm 0}
      .qr-wrap img{width:9cm;height:9cm;object-fit:contain}
      .meta{width:100%;border-top:1px solid #E5E7EB;padding-top:2mm}
      .meta-row{display:flex;justify-content:space-between;font-size:7pt;margin-bottom:1mm}
      .meta-label{color:#9CA3AF;font-weight:500}
      .meta-val{color:#1C2B1E;font-weight:600;text-align:right;max-width:60%;word-break:break-all}
      .sig-row{font-size:5.5pt;color:#9CA3AF;margin-top:1mm;word-break:break-all;line-height:1.4}
      @media print{@page{size:A4 portrait;margin:10mm}.sticker{break-inside:avoid}}
    </style>
  </head><body>
    <div class="grid">
    ${items.map(({ bin, dataUrl, payload: ps }) => {
      const p = JSON.parse(ps);
      const capLabel = p.capacity_liters ? `${p.capacity_liters}L` : "Bulk/Custom";
      return `<div class="sticker">
        <div class="sticker-header">
          <span class="brand">BE-SMART · ${bin.barangay_code ?? ""}</span>
          <span class="tier-badge">${p.tier_name} · ${capLabel}</span>
        </div>
        <div class="qr-wrap"><img src="${dataUrl}" alt="QR ${bin.name}" /></div>
        <div class="meta">
          <div class="meta-row"><span class="meta-label">Bin Name</span><span class="meta-val">${bin.name}</span></div>
          <div class="meta-row"><span class="meta-label">Location</span><span class="meta-val">${bin.street ?? "—"}</span></div>
          <div class="meta-row"><span class="meta-label">Tier</span><span class="meta-val">${p.tier_name} (${capLabel})</span></div>
          <div class="meta-row"><span class="meta-label">Coordinates</span><span class="meta-val">${p.coordinates.lat.toFixed(5)}, ${p.coordinates.lng.toFixed(5)}</span></div>
          <div class="sig-row">SIG: ${p.signature?.slice(0, 32)}…</div>
        </div>
      </div>`;
    }).join("")}
    </div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script>
  </body></html>`;
  const win = window.open("", "_blank", "width=1100,height=800");
  win.document.write(html);
  win.document.close();
}

// ── Reusable field ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, error, placeholder, type = "text", required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
        {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="rounded-lg px-3 py-2.5 outline-none transition-colors"
        style={{ fontSize: 14, border: error ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
      {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
    </div>
  );
}

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 w-full" style={{ maxWidth: 360 }}>
        <p className="text-text-primary font-medium text-center" style={{ fontSize: 15 }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 rounded-lg py-2.5 font-semibold hover:bg-gray-100"
            style={{ border: "1.5px solid #E5E7EB", fontSize: 14, color: "#374151" }}>Cancel</button>
          <button onClick={onConfirm}
            className="flex-1 rounded-lg py-2.5 font-semibold text-white hover:opacity-90"
            style={{ background: "#DC2626", fontSize: 14 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Manage Tiers Modal ────────────────────────────────────────────────────────
function ManageTiersModal({ onClose, token, onTiersChanged }) {
  const [tiers, setTiers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newName, setNewName]   = useState("");
  const [newCap, setNewCap]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [editId, setEditId]     = useState(null);
  const [editName, setEditName] = useState("");
  const [editCap, setEditCap]   = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [error, setError]       = useState("");

  async function loadTiers() {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/tiers`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTiers(data.tiers ?? []);
    } catch { setError("Failed to load tiers."); }
    finally  { setLoading(false); }
  }

  useEffect(() => { loadTiers(); }, []);

  async function handleAdd() {
    if (!newName.trim()) { setError("Tier name is required."); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch(`${API_URL}/tiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim(), capacity_liters: newCap ? parseInt(newCap) : null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setNewName(""); setNewCap("");
      await loadTiers();
      onTiersChanged();
    } catch { setError("Failed to create tier."); }
    finally  { setSaving(false); }
  }

  async function handleUpdate(id) {
    if (!editName.trim()) { setError("Tier name is required."); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch(`${API_URL}/tiers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName.trim(), capacity_liters: editCap ? parseInt(editCap) : null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setEditId(null);
      await loadTiers();
      onTiersChanged();
    } catch { setError("Failed to update tier."); }
    finally  { setSaving(false); }
  }

  async function handleDelete(id) {
    setSaving(true); setError("");
    try {
      const res  = await fetch(`${API_URL}/tiers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setConfirmDel(null);
      await loadTiers();
      onTiersChanged();
    } catch { setError("Failed to delete tier."); }
    finally  { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 w-full overflow-y-auto" style={{ maxWidth: 480, maxHeight: "90vh" }}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>Manage Tiers</h2>
          <button onClick={onClose}><X size={20} color="#6B7280" /></button>
        </div>

        {error && (
          <div className="rounded-lg px-3 py-2 text-center" style={{ background: "#FFEBEE", color: "#DC2626", fontSize: 13 }}>{error}</div>
        )}

        {/* Existing tiers */}
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
  const [bins, setBins]               = useState([]);
  const [tiers, setTiers]             = useState([]);
  const [loadingBins, setLoadingBins] = useState(true);
  const [fetchError, setFetchError]   = useState(null);
  const [search, setSearch]           = useState("");
  const [filterTier, setFilterTier]   = useState("");
  const [selected, setSelected]       = useState([]);
  const [previewBin, setPreviewBin]   = useState(null);
  const [previewPayload, setPreviewPayload] = useState(null);
  const [addOpen, setAddOpen]         = useState(false);
  const [tiersOpen, setTiersOpen]     = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [saving, setSaving]           = useState(false);
  const [addedBin, setAddedBin]       = useState(null);
  const [confirmBulkDel, setConfirmBulkDel] = useState(false);
  const [confirmDel, setConfirmDel]   = useState(null);

  const handleDownload = useQRDownload();
  const token = sessionStorage.getItem("bs_token");

  async function fetchTiers() {
    try {
      const res  = await fetch(`${API_URL}/tiers`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTiers(data.tiers ?? []);
    } catch { /* silent */ }
  }

  async function fetchBins() {
    setLoadingBins(true); setFetchError(null);
    try {
      const res  = await fetch(`${API_URL}/bins?barangay=${encodeURIComponent(PB_BARANGAY)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch bins.");
      setBins(data.bins ?? []);
    } catch (err) { setFetchError(err.message); }
    finally       { setLoadingBins(false); }
  }

  useEffect(() => { fetchTiers(); fetchBins(); }, []);

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = bins.filter((b) => {
    const matchSearch = !search.trim() ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.street ?? "").toLowerCase().includes(search.toLowerCase());
    const matchTier = !filterTier || b.tier_id === filterTier;
    return matchSearch && matchTier;
  });

  // ── Selection ────────────────────────────────────────────────────────────────
  const toggleSelect   = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const selectAll      = ()   => setSelected(filtered.map((b) => b.id));
  const clearSelection = ()   => setSelected([]);

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
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: selected }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setBins((prev) => prev.filter((b) => !selected.includes(b.id)));
      setSelected([]);
    } catch (err) { alert(err.message); }
    setConfirmBulkDel(false);
  }

  // ── Preview modal ────────────────────────────────────────────────────────────
  async function openPreview(bin) {
    setPreviewBin(bin);
    const ps = await buildSignedPayload(bin);
    setPreviewPayload(JSON.parse(ps));
  }

  // ── Add bin ──────────────────────────────────────────────────────────────────
  function openAdd() { setForm(EMPTY_FORM); setFormErrors({}); setAddedBin(null); setAddOpen(true); }

  function validateForm() {
    const e = {};
    if (!form.name.trim())  e.name    = "Bin name is required.";
    if (!form.street.trim()) e.street = "Street / location is required.";
    if (!form.tier_id)       e.tier_id = "Please select a tier.";
    if (form.lat && isNaN(parseFloat(form.lat))) e.lat = "Must be a valid number.";
    if (form.lng && isNaN(parseFloat(form.lng))) e.lng = "Must be a valid number.";
    return e;
  }

  async function handleAddBin() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setSaving(true);
    try {
      const seqNum  = bins.filter((b) => b.barangay === PB_BARANGAY).length + 1;
      const barCode = `${BARANGAY_CODE_PREFIX}-${String(seqNum).padStart(2, "0")}`;
      const selectedTier = tiers.find((t) => t.id === form.tier_id);

      const newBinData = {
        name:         form.name.trim(),
        street:       form.street.trim(),
        barangay:     PB_BARANGAY,
        barangay_code: barCode,
        cluster_id:   PB_CLUSTER,
        tier_id:      form.tier_id,
        latitude:  form.lat ? parseFloat(form.lat) : 13.7565 + (Math.random() - 0.5) * 0.01,
        longitude: form.lng ? parseFloat(form.lng) : 121.0583 + (Math.random() - 0.5) * 0.01,
      };

      // Build temporary bin to sign QR payload
      const tempBin = {
        ...newBinData, id: "PENDING",
        tier_name: selectedTier?.name ?? "Tier 1",
        capacity_liters: selectedTier?.capacity_liters ?? null,
      };
      newBinData.qr_payload = await buildSignedPayload(tempBin);

      const res  = await fetch(`${API_URL}/bins`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newBinData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create bin.");

      setBins((prev) => [data.bin, ...prev]);
      setAddedBin(data.bin);
    } catch (err) { setFormErrors({ _api: err.message }); }
    finally        { setSaving(false); }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Bin QR Codes</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            Generate &amp; print QR codes for Brgy. {PB_BARANGAY} · {bins.length} bins
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {selected.length > 0 && (
            <>
              <span className="rounded-full px-3 py-1 font-semibold text-white"
                style={{ fontSize: 12, background: "#2E7D32" }}>{selected.length} selected</span>
              <button onClick={clearSelection}
                className="rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
                style={{ fontSize: 13, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Clear</button>
              <button onClick={() => handlePrint(bins.filter((b) => selected.includes(b.id)))}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90"
                style={{ fontSize: 13, background: "#1976D2" }}>
                <Printer size={14} /> Print Selected
              </button>
              <button onClick={() => setConfirmBulkDel(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90"
                style={{ fontSize: 13, background: "#DC2626" }}>
                <Trash2 size={14} /> Delete Selected
              </button>
            </>
          )}
          <button onClick={selectAll}
            className="rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", color: "#374151" }}>Select All</button>
          <button onClick={() => { fetchTiers(); fetchBins(); }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", color: "#374151" }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => setTiersOpen(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold hover:opacity-90"
            style={{ fontSize: 13, background: "#F3F4F6", color: "#374151", border: "1.5px solid #E5E7EB" }}>
            <Settings size={14} /> Manage Tiers
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90"
            style={{ fontSize: 13, background: "#2E7D32" }}>
            <Plus size={14} /> Add Bin
          </button>
        </div>
      </div>

      {/* ── Security banner ── */}
      <div className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: "#E8F5E9", border: "1px solid #C8E6C9" }}>
        <Shield size={15} color="#2E7D32" className="flex-shrink-0 mt-0.5" />
        <p style={{ fontSize: 13, color: "#1C2B1E" }}>
          Each QR encodes a <strong>HMAC-SHA256 signed</strong> payload. Spoofed QR codes are rejected server-side.
          Print at <strong>15cm × 15cm</strong> for outdoor stickers.
        </p>
      </div>

      {/* ── Error state ── */}
      {fetchError && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: "#FFEBEE", border: "1px solid #FFCDD2", color: "#DC2626", fontSize: 13 }}>
          {fetchError}
          <button onClick={fetchBins} className="underline ml-auto">Retry</button>
        </div>
      )}

      {/* ── Search + Tier filter ── */}
      {!loadingBins && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center" style={{ minWidth: 240 }}>
            <Search size={14} className="absolute left-3 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or street…"
              className="w-full rounded-lg pl-9 pr-3 py-2 outline-none"
              style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
          </div>

          {/* Dynamic tier filter dropdown */}
          <div className="relative">
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="appearance-none rounded-lg pl-3 pr-8 py-2 outline-none cursor-pointer"
              style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: filterTier ? "#111827" : "#6B7280" }}
            >
              <option value="">Filter by Tier</option>
              {tiers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.capacity_liters ? ` · ${t.capacity_liters}L` : " · Bulk"}
                </option>
              ))}
            </select>
            <ChevronDown size={13} color="#9CA3AF" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>

          {filterTier && (
            <button onClick={() => setFilterTier("")}
              className="rounded-full px-3 py-1 font-medium hover:bg-gray-100"
              style={{ fontSize: 12, border: "1px solid #E5E7EB", color: "#6B7280" }}>
              Clear filter ×
            </button>
          )}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loadingBins && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl animate-pulse"
              style={{ height: 320, background: "#F3F4F6", border: "1px solid #E5E7EB" }} />
          ))}
        </div>
      )}

      {/* ── QR Grid ── */}
      {!loadingBins && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {filtered.map((bin) => {
            const sc    = statusStyle(bin.status);
            const isSel = selected.includes(bin.id);
            const capLabel = bin.capacity_liters ? `${bin.capacity_liters}L` : "Bulk";
            return (
              <div key={bin.id}
                className="bg-white rounded-xl p-4 flex flex-col gap-3 transition-all"
                style={{ border: isSel ? "2px solid #2E7D32" : "1px solid #E5E7EB", boxShadow: isSel ? "0 0 0 3px rgba(46,125,50,0.12)" : "0 2px 8px rgba(0,0,0,0.05)", cursor: "pointer" }}
                onClick={() => toggleSelect(bin.id)}
              >
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded flex-shrink-0"
                      style={{ width: 17, height: 17, background: isSel ? "#2E7D32" : "#fff", border: isSel ? "none" : "1.5px solid #D1D5DB" }}>
                      {isSel && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span className="font-semibold text-text-primary truncate" style={{ fontSize: 13, maxWidth: 120 }}>{bin.name}</span>
                  </div>
                  <span className="rounded-full px-2 py-0.5 font-semibold flex-shrink-0"
                    style={{ fontSize: 10, background: sc.bg, color: sc.color }}>{bin.status}</span>
                </div>

                {/* Tier badge */}
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full px-2 py-0.5 font-semibold"
                    style={{ fontSize: 10, background: "#DBEAFE", color: "#1D4ED8" }}>
                    {bin.tier_name ?? "—"} · {capLabel}
                  </span>
                </div>

                {/* QR code */}
                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <QRCard bin={bin} size={160} />
                </div>

                {/* Location */}
                <div className="flex flex-col gap-0.5">
                  <p className="text-text-secondary" style={{ fontSize: 12 }}>{bin.street}</p>
                  <p className="text-text-muted flex items-center gap-1" style={{ fontSize: 11 }}>
                    <MapPin size={10} />
                    {bin.barangay_code} · {bin.latitude && bin.longitude
                      ? `${parseFloat(bin.latitude).toFixed(4)}, ${parseFloat(bin.longitude).toFixed(4)}`
                      : "No coords"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openPreview(bin)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 font-medium hover:bg-gray-100 transition-colors"
                    style={{ fontSize: 12, color: "#6B7280", border: "1px solid #E5E7EB" }}>
                    <Info size={11} /> Preview
                  </button>
                  <button onClick={() => handleDownload(bin)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 font-medium hover:bg-green-50 transition-colors"
                    style={{ fontSize: 12, color: "#2E7D32", border: "1px solid #C8E6C9" }}>
                    <Download size={11} /> Download
                  </button>
                  <button onClick={() => setConfirmDel(bin.id)}
                    className="flex items-center justify-center rounded-lg py-1.5 px-2 font-medium hover:bg-red-50 transition-colors"
                    style={{ fontSize: 12, color: "#DC2626", border: "1px solid #FECACA" }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}

          {!loadingBins && filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 py-16 text-text-muted">
              <QrCode size={32} />
              <span style={{ fontSize: 14 }}>
                {bins.length === 0 ? "No bins yet. Click Add Bin to create one." : "No bins match your filters."}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setPreviewBin(null)}>
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 w-full overflow-y-auto"
            style={{ maxWidth: 520, maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>{previewBin.name}</h2>
              <button onClick={() => setPreviewBin(null)}><X size={20} color="#6B7280" /></button>
            </div>
            <div className="flex justify-center"><QRCard bin={previewBin} size={220} /></div>
            {previewPayload && (
              <pre className="rounded-lg p-3 overflow-x-auto text-xs"
                style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#374151" }}>
                {JSON.stringify(previewPayload, null, 2)}
              </pre>
            )}
            <div className="flex gap-2">
              <button onClick={() => handleDownload(previewBin)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold hover:opacity-90"
                style={{ background: "#2E7D32", color: "#fff", fontSize: 13 }}>
                <Download size={14} /> Download PNG
              </button>
              <button onClick={() => handlePrint([previewBin])}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold hover:opacity-90"
                style={{ background: "#1976D2", color: "#fff", fontSize: 13 }}>
                <Printer size={14} /> Print Sticker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Bin Modal ── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => !saving && setAddOpen(false)}>
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 w-full overflow-y-auto"
            style={{ maxWidth: 480, maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>Add New Bin</h2>
              <button onClick={() => setAddOpen(false)} disabled={saving}><X size={20} color="#6B7280" /></button>
            </div>

            {addedBin ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="rounded-full flex items-center justify-center"
                  style={{ width: 56, height: 56, background: "#E8F5E9" }}>
                  <QrCode size={28} color="#2E7D32" />
                </div>
                <p className="font-semibold text-text-primary text-center" style={{ fontSize: 15 }}>Bin created &amp; QR signed!</p>
                <QRCard bin={addedBin} size={180} />
                <div className="flex gap-2 w-full">
                  <button onClick={() => handleDownload(addedBin)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold hover:opacity-90"
                    style={{ background: "#2E7D32", color: "#fff", fontSize: 13 }}>
                    <Download size={14} /> Download
                  </button>
                  <button onClick={() => { setAddOpen(false); setAddedBin(null); }}
                    className="flex-1 rounded-lg py-2.5 font-semibold hover:bg-gray-100"
                    style={{ border: "1.5px solid #E5E7EB", fontSize: 13, color: "#374151" }}>Done</button>
                </div>
              </div>
            ) : (
              <>
                {formErrors._api && (
                  <div className="rounded-lg px-3 py-2 text-center"
                    style={{ background: "#FFEBEE", color: "#DC2626", fontSize: 13 }}>{formErrors._api}</div>
                )}

                <Field label="Bin Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                  error={formErrors.name} placeholder="e.g. Rizal St. Corner Bin" required />
                <Field label="Street / Location" value={form.street} onChange={(v) => setForm((p) => ({ ...p, street: v }))}
                  error={formErrors.street} placeholder="e.g. Rizal Street, Alangilan" required />

                {/* Tier select — dynamic from API */}
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
                    Capacity Tier <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <select
                    value={form.tier_id}
                    onChange={(e) => setForm((p) => ({ ...p, tier_id: e.target.value }))}
                    className="rounded-lg px-3 py-2.5 outline-none"
                    style={{ fontSize: 14, border: formErrors.tier_id ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }}
                  >
                    <option value="">Select a tier…</option>
                    {tiers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}{t.capacity_liters ? ` — ${t.capacity_liters}L` : " — Bulk/Custom"}
                      </option>
                    ))}
                  </select>
                  {formErrors.tier_id && <span style={{ fontSize: 12, color: "#DC2626" }}>{formErrors.tier_id}</span>}
                </div>

                <div className="flex gap-3">
                  <Field label="Latitude" value={form.lat} onChange={(v) => setForm((p) => ({ ...p, lat: v }))}
                    error={formErrors.lat} placeholder="13.7565" type="number" />
                  <Field label="Longitude" value={form.lng} onChange={(v) => setForm((p) => ({ ...p, lng: v }))}
                    error={formErrors.lng} placeholder="121.0583" type="number" />
                </div>
                <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#6B7280" }}>
                  <MapPin size={12} /> <span>Leave blank to auto-assign approximate coordinates.</span>
                </div>

                <button onClick={handleAddBin} disabled={saving}
                  className="w-full rounded-lg py-3 font-semibold text-white hover:opacity-90"
                  style={{ background: saving ? "#9CA3AF" : "#2E7D32", fontSize: 14, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : "Create Bin & Generate QR"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Manage Tiers Modal ── */}
      {tiersOpen && (
        <ManageTiersModal
          token={token}
          onClose={() => setTiersOpen(false)}
          onTiersChanged={() => { fetchTiers(); fetchBins(); }}
        />
      )}

      {/* ── Confirm single delete ── */}
      {confirmDel && (
        <ConfirmDialog
          message="Delete this bin and its QR code? This cannot be undone."
          onConfirm={() => deleteBin(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {/* ── Confirm bulk delete ── */}
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
