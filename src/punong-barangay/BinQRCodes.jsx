/**
 * BinQRCodes.jsx — BE-SMART Punong Barangay · Bin QR Code Management
 *
 * Features:
 *  • Fetches bins from real API (GET /api/bins?barangay=...)
 *  • Renders scannable QR codes via qrcode.react (Error Correction H = 30%)
 *  • Each QR encodes a HMAC-SHA256 signed JSON payload (Web Crypto API)
 *  • Add-bin modal: tier selector, waste type, GPS coordinates
 *  • Saves new bin to real API (POST /api/bins)
 *  • Print layout formatted for 15cm × 15cm physical sticker
 *  • Download individual QR as PNG via canvas export
 *  • Bulk select → Print Selected
 *  • Preview modal with full encoded-data inspector
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode, Download, Printer, Search, Plus, X,
  MapPin, Shield, ChevronDown, Info, RefreshCw,
} from "lucide-react";

const API_URL      = import.meta.env.VITE_API_URL;
const PB_BARANGAY  = "Alangilan";
const PB_CLUSTER   = "SOLID-EAST";
const BARANGAY_CODE_PREFIX = "ALANGILAN";

const CAPACITY_TIERS = [
  { value: "Tier 1", label: "Tier 1 — 660L",  sublabel: "660L",       volume: 660  },
  { value: "Tier 2", label: "Tier 2 — 1,100L", sublabel: "1,100L",    volume: 1100 },
  { value: "Tier 3", label: "Tier 3 — Bulk",   sublabel: "Custom m³", volume: null },
];

const WASTE_TYPES = ["Biodegradable", "Non-Recyclable", "Recyclable"];

// ── Web Crypto HMAC-SHA256 (matches server-side qrCrypto.js) ─────────────────
async function hmacSha256Hex(message, secret) {
  const enc    = new TextEncoder();
  const keyMat = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig    = await crypto.subtle.sign("HMAC", keyMat, enc.encode(message));
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
  const secret   = import.meta.env.VITE_QR_SECRET_KEY ?? "be-smart-dev-secret-change-in-prod";
  const tierInfo = CAPACITY_TIERS.find((t) => t.value === bin.capacity_tier);
  const payload  = {
    system:                 "BE-SMART",
    version:                "1.0",
    bin_id:                 bin.id,
    barangay_code:          bin.barangay_code  ?? `${BARANGAY_CODE_PREFIX}-01`,
    cluster_id:             bin.cluster_id     ?? PB_CLUSTER,
    capacity_tier:          bin.capacity_tier  ?? "Tier 1",
    capacity_volume_liters: tierInfo?.volume   ?? null,
    waste_type:             bin.waste_type     ?? "Biodegradable",
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

// ── Status / badge helpers ────────────────────────────────────────────────────
function statusStyle(s) {
  if (s === "FULL")      return { bg: "#FFEBEE", color: "#DC2626" };
  if (s === "MISSED")    return { bg: "#FFF3E0", color: "#D97706" };
  if (s === "COLLECTED") return { bg: "#E8F5E9", color: "#2E7D32" };
  if (s === "LOCKED")    return { bg: "#EDE9FE", color: "#7C3AED" };
  return { bg: "#F3F4F6", color: "#6B7280" };
}
function wasteTypeStyle(w) {
  if (w === "Biodegradable") return { bg: "#E8F5E9", color: "#2E7D32" };
  if (w === "Recyclable")    return { bg: "#E3F2FD", color: "#1565C0" };
  return { bg: "#FFF3E0", color: "#E65100" };
}
function tierBadgeStyle(tier) {
  if (tier === "Tier 1") return { bg: "#DBEAFE", color: "#1D4ED8" };
  if (tier === "Tier 2") return { bg: "#FEF3C7", color: "#B45309" };
  return { bg: "#FFE4E6", color: "#BE123C" };
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
  return (
    <QRCodeSVG value={payloadStr} size={size} level="H" includeMargin
      style={{ borderRadius: 4, border: "1px solid #E5E7EB" }} />
  );
}

// ── Download as PNG ───────────────────────────────────────────────────────────
function useQRDownload() {
  return useCallback(async (bin) => {
    const payloadStr = await buildSignedPayload(bin);
    const container  = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
    document.body.appendChild(container);
    const { createRoot } = await import("react-dom/client");
    const { QRCodeCanvas } = await import("qrcode.react");
    const { createElement } = await import("react");
    const root = createRoot(container);
    root.render(createElement(QRCodeCanvas, { value: payloadStr, size: 400, level: "H", includeMargin: true, id: "__bs_qr_export__" }));
    await new Promise((r) => setTimeout(r, 80));
    const canvas = container.querySelector("canvas");
    if (canvas) {
      const a   = document.createElement("a");
      a.href     = canvas.toDataURL("image/png");
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
  const signed = await Promise.all(bins.map(async (b) => ({ bin: b, payload: await buildSignedPayload(b) })));
  const items  = await Promise.all(signed.map(({ bin, payload }) =>
    new Promise((resolve) => {
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
    })
  ));
  const tierMap = Object.fromEntries(CAPACITY_TIERS.map((t) => [t.value, t]));
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
      .badge{font-size:7pt;font-weight:600;border-radius:99px;padding:1mm 3mm}
      .waste-bio{background:#E8F5E9;color:#2E7D32}
      .waste-rec{background:#E3F2FD;color:#1565C0}
      .waste-nonrec{background:#FFF3E0;color:#E65100}
      .qr-wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:2mm 0}
      .qr-wrap img{width:9cm;height:9cm;object-fit:contain}
      .meta{width:100%;border-top:1px solid #E5E7EB;padding-top:2mm}
      .meta-row{display:flex;justify-content:space-between;font-size:7pt;margin-bottom:1mm}
      .meta-label{color:#9CA3AF;font-weight:500}
      .meta-val{color:#1C2B1E;font-weight:600;text-align:right;max-width:55%;word-break:break-all}
      .sig-row{font-size:5.5pt;color:#9CA3AF;margin-top:1mm;word-break:break-all;line-height:1.4}
      @media print{@page{size:A4 portrait;margin:10mm}.sticker{break-inside:avoid}}
    </style>
  </head><body>
    <div class="grid">
    ${items.map(({ bin, dataUrl, payload: ps }) => {
      const p = JSON.parse(ps);
      const tier = tierMap[p.capacity_tier];
      const wClass = p.waste_type === "Biodegradable" ? "waste-bio" : p.waste_type === "Recyclable" ? "waste-rec" : "waste-nonrec";
      return `<div class="sticker">
        <div class="sticker-header">
          <span class="brand">BE-SMART · ${p.barangay_code}</span>
          <span class="badge ${wClass}">${p.waste_type}</span>
        </div>
        <div class="qr-wrap"><img src="${dataUrl}" alt="QR ${bin.name}" /></div>
        <div class="meta">
          <div class="meta-row"><span class="meta-label">Bin Name</span><span class="meta-val">${bin.name}</span></div>
          <div class="meta-row"><span class="meta-label">Location</span><span class="meta-val">${bin.street ?? "—"}</span></div>
          <div class="meta-row"><span class="meta-label">Capacity</span><span class="meta-val">${tier?.label ?? p.capacity_tier}</span></div>
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

// ── Form field sub-components ─────────────────────────────────────────────────
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

function SelectField({ label, value, onChange, options, required }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const selected        = options.find((o) => o.value === value);

  useEffect(() => {
    function outside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
        {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between rounded-lg px-3 py-2.5 outline-none text-left"
        style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }}>
        <span style={{ color: selected ? "#111827" : "#9CA3AF" }}>
          {selected ? selected.label : `Select ${label}`}
        </span>
        <ChevronDown size={14} color="#9CA3AF"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div className="rounded-lg overflow-hidden z-50 shadow-lg"
          style={{ border: "1.5px solid #E5E7EB", background: "#fff", position: "absolute", marginTop: 64, width: "100%", maxWidth: 360 }}>
          {options.map((opt) => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full flex flex-col px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
              style={{ borderBottom: "1px solid #F3F4F6" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{opt.label}</span>
              {opt.sublabel && <span style={{ fontSize: 11, color: "#6B7280" }}>{opt.sublabel}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = { name: "", street: "", capacity_tier: "Tier 1", waste_type: "Biodegradable", lat: "", lng: "" };

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BinQRCodes() {
  const [bins, setBins]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState(null);
  const [search, setSearch]           = useState("");
  const [filterTier, setFilterTier]   = useState("all");
  const [filterWaste, setFilterWaste] = useState("all");
  const [selected, setSelected]       = useState([]);
  const [previewBin, setPreviewBin]   = useState(null);
  const [previewPayload, setPreviewPayload] = useState(null);
  const [addOpen, setAddOpen]         = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [saving, setSaving]           = useState(false);
  const [addedBin, setAddedBin]       = useState(null);

  const handleDownload = useQRDownload();
  const token = sessionStorage.getItem("bs_token");

  // ── Fetch bins from API ──────────────────────────────────────────────────────
  async function fetchBins() {
    setLoading(true);
    setFetchError(null);
    try {
      const res  = await fetch(`${API_URL}/bins?barangay=${encodeURIComponent(PB_BARANGAY)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch bins.");
      setBins(data.bins ?? []);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBins(); }, []);

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = bins.filter((b) => {
    const matchSearch = !search.trim() ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.street ?? "").toLowerCase().includes(search.toLowerCase());
    const matchTier  = filterTier  === "all" || b.capacity_tier === filterTier;
    const matchWaste = filterWaste === "all" || b.waste_type    === filterWaste;
    return matchSearch && matchTier && matchWaste;
  });

  // ── Selection ────────────────────────────────────────────────────────────────
  const toggleSelect   = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const selectAll      = ()   => setSelected(filtered.map((b) => b.id));
  const clearSelection = ()   => setSelected([]);

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
    if (!form.name.trim())   e.name   = "Bin name is required.";
    if (!form.street.trim()) e.street = "Street / location is required.";
    if (!form.capacity_tier) e.capacity_tier = "Select a capacity tier.";
    if (!form.waste_type)    e.waste_type    = "Select a waste type.";
    if (form.lat && isNaN(parseFloat(form.lat))) e.lat = "Must be a valid decimal number.";
    if (form.lng && isNaN(parseFloat(form.lng))) e.lng = "Must be a valid decimal number.";
    return e;
  }

  async function handleAddBin() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }

    setSaving(true);
    try {
      const seqNum  = bins.filter((b) => b.barangay === PB_BARANGAY).length + 1;
      const barCode = `${BARANGAY_CODE_PREFIX}-${String(seqNum).padStart(2, "0")}`;
      const tierInfo = CAPACITY_TIERS.find((t) => t.value === form.capacity_tier);

      // Build the bin object to send (without id — DB generates it)
      const newBinData = {
        name:                   form.name.trim(),
        street:                 form.street.trim(),
        barangay:               PB_BARANGAY,
        barangay_code:          barCode,
        cluster_id:             PB_CLUSTER,
        capacity_tier:          form.capacity_tier,
        capacity_volume_liters: tierInfo?.volume ?? null,
        waste_type:             form.waste_type,
        latitude:  form.lat ? parseFloat(form.lat) : 13.7565 + (Math.random() - 0.5) * 0.01,
        longitude: form.lng ? parseFloat(form.lng) : 121.0583 + (Math.random() - 0.5) * 0.01,
      };

      // Pre-sign QR payload before saving so it's stored in DB
      const tempBin  = { ...newBinData, id: "PENDING" };
      const qrStr    = await buildSignedPayload(tempBin);
      newBinData.qr_payload = qrStr;

      const res  = await fetch(`${API_URL}/bins`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(newBinData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create bin.");

      setBins((prev) => [data.bin, ...prev]);
      setAddedBin(data.bin);
    } catch (err) {
      setFormErrors({ _api: err.message });
    } finally {
      setSaving(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
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
                style={{ fontSize: 12, background: "#2E7D32" }}>{selected.length} selected</span>
              <button onClick={clearSelection}
                className="rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
                style={{ fontSize: 13, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Clear</button>
              <button onClick={() => handlePrint(bins.filter((b) => selected.includes(b.id)))}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: "#1976D2" }}>
                <Printer size={14} /> Print Selected
              </button>
            </>
          )}
          <button onClick={selectAll}
            className="rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", color: "#374151" }}>Select All</button>
          <button onClick={fetchBins}
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", color: "#374151" }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 13, background: "#2E7D32" }}>
            <Plus size={14} /> Add Bin
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: "#E8F5E9", border: "1px solid #C8E6C9" }}>
        <Shield size={15} color="#2E7D32" className="flex-shrink-0 mt-0.5" />
        <p style={{ fontSize: 13, color: "#1C2B1E" }}>
          Each QR encodes a <strong>HMAC-SHA256 signed</strong> payload. Scans are verified
          server-side — spoofed QR codes are rejected. Print at <strong>15cm × 15cm</strong>.
          <strong className="ml-1">Total: {bins.length} bins</strong>
        </p>
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: "#FFEBEE", border: "1px solid #FFCDD2", color: "#DC2626", fontSize: 13 }}>
          {fetchError}
          <button onClick={fetchBins} className="underline ml-auto">Retry</button>
        </div>
      )}

      {/* Filters */}
      {!loading && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center" style={{ minWidth: 240 }}>
            <Search size={14} className="absolute left-3 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or street…"
              className="w-full rounded-lg pl-9 pr-3 py-2 outline-none"
              style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {["all", ...CAPACITY_TIERS.map((t) => t.value)].map((t) => (
              <button key={t} onClick={() => setFilterTier(t)}
                className="rounded-full px-3 py-1 font-medium transition-colors"
                style={{ fontSize: 12, background: filterTier === t ? "#2E7D32" : "#fff", color: filterTier === t ? "#fff" : "#6B7280", border: filterTier === t ? "1px solid #2E7D32" : "1px solid #E5E7EB" }}>
                {t === "all" ? "All Tiers" : t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {["all", ...WASTE_TYPES].map((w) => (
              <button key={w} onClick={() => setFilterWaste(w)}
                className="rounded-full px-3 py-1 font-medium transition-colors"
                style={{ fontSize: 12, background: filterWaste === w ? "#1976D2" : "#fff", color: filterWaste === w ? "#fff" : "#6B7280", border: filterWaste === w ? "1px solid #1976D2" : "1px solid #E5E7EB" }}>
                {w === "all" ? "All Types" : w}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl animate-pulse"
              style={{ height: 320, background: "#F3F4F6", border: "1px solid #E5E7EB" }} />
          ))}
        </div>
      )}

      {/* QR Grid */}
      {!loading && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {filtered.map((bin) => {
            const sc    = statusStyle(bin.status);
            const wc    = wasteTypeStyle(bin.waste_type);
            const tc    = tierBadgeStyle(bin.capacity_tier);
            const isSel = selected.includes(bin.id);
            return (
              <div key={bin.id}
                className="bg-white rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all"
                style={{ border: isSel ? "2px solid #2E7D32" : "1px solid #E5E7EB", boxShadow: isSel ? "0 0 0 3px rgba(46,125,50,0.12)" : "0 2px 8px rgba(0,0,0,0.05)" }}
                onClick={() => toggleSelect(bin.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded flex-shrink-0"
                      style={{ width: 17, height: 17, background: isSel ? "#2E7D32" : "#fff", border: isSel ? "none" : "1.5px solid #D1D5DB" }}>
                      {isSel && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{bin.name}</span>
                  </div>
                  <span className="rounded-full px-2 py-0.5 font-semibold"
                    style={{ fontSize: 10, background: sc.bg, color: sc.color }}>{bin.status}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="rounded-full px-2 py-0.5 font-semibold" style={{ fontSize: 10, background: tc.bg, color: tc.color }}>{bin.capacity_tier}</span>
                  <span className="rounded-full px-2 py-0.5 font-semibold" style={{ fontSize: 10, background: wc.bg, color: wc.color }}>{bin.waste_type}</span>
                </div>

                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <QRCard bin={bin} size={160} />
                </div>

                <div className="flex flex-col gap-0.5">
                  <p className="text-text-secondary" style={{ fontSize: 12 }}>{bin.street}</p>
                  <p className="text-text-muted" style={{ fontSize: 11 }}>
                    {bin.barangay_code} · {bin.latitude && bin.longitude
                      ? `${parseFloat(bin.latitude).toFixed(4)}, ${parseFloat(bin.longitude).toFixed(4)}`
                      : "No coords"}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openPreview(bin)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium hover:bg-gray-100 transition-colors"
                    style={{ fontSize: 12, color: "#6B7280", border: "1px solid #E5E7EB" }}>
                    <Info size={12} /> Preview
                  </button>
                  <button onClick={() => handleDownload(bin)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium hover:bg-green-50 transition-colors"
                    style={{ fontSize: 12, color: "#2E7D32", border: "1px solid #C8E6C9" }}>
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 py-16 text-text-muted">
              <QrCode size={32} />
              <span style={{ fontSize: 14 }}>{bins.length === 0 ? "No bins yet. Click Add Bin to create one." : "No bins match your filters."}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setPreviewBin(null)}>
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 w-full overflow-y-auto"
            style={{ maxWidth: 520, maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>{previewBin.name}</h2>
              <button onClick={() => setPreviewBin(null)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
            <div className="flex justify-center">
              <QRCard bin={previewBin} size={220} />
            </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => !saving && setAddOpen(false)}>
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 w-full overflow-y-auto"
            style={{ maxWidth: 480, maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>Add New Bin</h2>
              <button onClick={() => setAddOpen(false)} className="text-text-muted hover:text-text-primary" disabled={saving}>
                <X size={20} />
              </button>
            </div>

            {addedBin ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="rounded-full flex items-center justify-center"
                  style={{ width: 56, height: 56, background: "#E8F5E9" }}>
                  <QrCode size={28} color="#2E7D32" />
                </div>
                <p className="font-semibold text-text-primary text-center" style={{ fontSize: 15 }}>
                  Bin created &amp; QR signed!
                </p>
                <QRCard bin={addedBin} size={180} />
                <div className="flex gap-2 w-full">
                  <button onClick={() => handleDownload(addedBin)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold hover:opacity-90"
                    style={{ background: "#2E7D32", color: "#fff", fontSize: 13 }}>
                    <Download size={14} /> Download
                  </button>
                  <button onClick={() => { setAddOpen(false); setAddedBin(null); }}
                    className="flex-1 rounded-lg py-2.5 font-semibold hover:bg-gray-100"
                    style={{ border: "1.5px solid #E5E7EB", fontSize: 13, color: "#374151" }}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {formErrors._api && (
                  <div className="rounded-lg px-3 py-2 text-center"
                    style={{ background: "#FFEBEE", color: "#DC2626", fontSize: 13 }}>
                    {formErrors._api}
                  </div>
                )}
                <Field label="Bin Name"         value={form.name}   onChange={(v) => setForm((p) => ({ ...p, name: v }))}   error={formErrors.name}   placeholder="e.g. Rizal St. Corner Bin" required />
                <Field label="Street / Location" value={form.street} onChange={(v) => setForm((p) => ({ ...p, street: v }))} error={formErrors.street} placeholder="e.g. Rizal Street, Alangilan" required />

                <div className="relative">
                  <SelectField label="Capacity Tier" value={form.capacity_tier}
                    onChange={(v) => setForm((p) => ({ ...p, capacity_tier: v }))}
                    options={CAPACITY_TIERS} required />
                </div>
                <div className="relative">
                  <SelectField label="Waste Type" value={form.waste_type}
                    onChange={(v) => setForm((p) => ({ ...p, waste_type: v }))}
                    options={WASTE_TYPES.map((w) => ({ value: w, label: w }))} required />
                </div>

                <div className="flex gap-3">
                  <Field label="Latitude"  value={form.lat} onChange={(v) => setForm((p) => ({ ...p, lat: v }))} error={formErrors.lat} placeholder="13.7565" type="number" />
                  <Field label="Longitude" value={form.lng} onChange={(v) => setForm((p) => ({ ...p, lng: v }))} error={formErrors.lng} placeholder="121.0583" type="number" />
                </div>
                <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#6B7280" }}>
                  <MapPin size={12} />
                  <span>Leave blank to auto-assign approximate coordinates.</span>
                </div>

                <button onClick={handleAddBin} disabled={saving}
                  className="w-full rounded-lg py-3 font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: saving ? "#9CA3AF" : "#2E7D32", fontSize: 14, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : "Create Bin & Generate QR"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
