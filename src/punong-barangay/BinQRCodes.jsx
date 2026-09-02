/**
 * BinQRCodes.jsx — BE-SMART Punong Barangay · Bin QR Code Management
 *
 * Features:
 *  • Renders real, scannable QR codes via qrcode.react (error correction H = 30%)
 *  • Each QR encodes a signed JSON payload (HMAC-SHA256 via Web Crypto API)
 *  • Add-bin modal: tier selector (Tier 1–4), waste type, GPS coordinates
 *  • Print layout formatted for 15 cm × 15 cm physical sticker
 *  • Download individual QR as PNG via canvas export
 *  • Bulk select → Print Selected
 *  • Preview modal with full encoded-data inspector
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { QRCodeSVG }  from "qrcode.react";
import {
  QrCode, Download, Printer, Search, Plus, X,
  MapPin, Shield, ChevronDown, Info,
} from "lucide-react";
import { BINS } from "../mock/data";

// ── Constants ─────────────────────────────────────────────────────────────────
const PB_BARANGAY  = "Alangilan";
const PB_CLUSTER   = "SOLID-EAST";
const BARANGAY_CODE_PREFIX = "ALANGILAN";

// Matches DOST-api/src/lib/qrSigner.js CAPACITY_TIERS
const CAPACITY_TIERS = [
  { value: "Tier 1", label: "Tier 1 — Small",  sublabel: "120L – 240L",  volume: 240  },
  { value: "Tier 2", label: "Tier 2 — Medium", sublabel: "660L",         volume: 660  },
  { value: "Tier 3", label: "Tier 3 — Large",  sublabel: "1,100L",       volume: 1100 },
  { value: "Tier 4", label: "Tier 4 — Bulk",   sublabel: "Custom m³",    volume: null },
];

const WASTE_TYPES = ["Biodegradable", "Non-Recyclable", "Recyclable"];

// QR_SECRET_KEY used only for dev/preview signing.
// In production the backend issues pre-signed payload strings; the web app
// calls POST /api/bins/generate-qr and receives the signed JSON back.
const DEV_SECRET = import.meta.env.VITE_QR_SECRET_KEY ?? "be-smart-dev-secret-change-in-prod";

// ── Web Crypto HMAC-SHA256 (runs in the browser — no Node dependency) ─────────
async function hmacSha256Hex(message, secret) {
  const enc     = new TextEncoder();
  const keyMat  = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig     = await crypto.subtle.sign("HMAC", keyMat, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Mirrors the canonical serialisation in qrSigner.js (sorted keys, no signature field)
function canonicalise(obj) {
  const { signature: _s, ...rest } = obj;
  return JSON.stringify(rest, Object.keys(rest).sort());
}

/**
 * Build and sign a QR payload for a bin object.
 * Returns the full payload JSON string ready to be encoded into the QR.
 */
async function buildSignedPayload(bin) {
  const tierInfo = CAPACITY_TIERS.find((t) => t.value === bin.capacity_tier);
  const payload  = {
    system:                 "BE-SMART",
    version:                "1.0",
    bin_id:                 bin.id,
    barangay_code:          bin.barangay_code  ?? `${BARANGAY_CODE_PREFIX}-01`,
    cluster_id:             bin.cluster_id     ?? PB_CLUSTER,
    capacity_tier:          bin.capacity_tier  ?? "Tier 1",
    capacity_volume_liters: tierInfo?.volume   ?? null,
    waste_type:             bin.waste_type      ?? "Biodegradable",
    sticker_dimensions:     "15cm x 15cm",
    coordinates:            bin.coordinates    ?? { lat: 0, lng: 0 },
    name:                   bin.name,
    street:                 bin.street,
    barangay:               bin.barangay,
    issued_at:              new Date().toISOString(),
  };
  payload.signature = await hmacSha256Hex(canonicalise(payload), DEV_SECRET);
  return JSON.stringify(payload);
}

// ── Status helpers ────────────────────────────────────────────────────────────
function statusStyle(s) {
  if (s === "full")      return { bg: "#FFEBEE", color: "#DC2626" };
  if (s === "missed")    return { bg: "#FFF3E0", color: "#D97706" };
  if (s === "collected") return { bg: "#E8F5E9", color: "#2E7D32" };
  return { bg: "#F3F4F6", color: "#6B7280" };
}

function wasteTypeStyle(w) {
  if (w === "Biodegradable")  return { bg: "#E8F5E9", color: "#2E7D32" };
  if (w === "Recyclable")     return { bg: "#E3F2FD", color: "#1565C0" };
  return { bg: "#FFF3E0", color: "#E65100" };
}

// ── QR Card (renders the live SVG + lazily signs payload) ────────────────────
function QRCard({ bin, size = 180 }) {
  const [payloadStr, setPayloadStr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    buildSignedPayload(bin).then((str) => {
      if (!cancelled) setPayloadStr(str);
    });
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
    <QRCodeSVG
      value={payloadStr}
      size={size}
      level="H"                   // High error correction — 30% recovery for outdoor stickers
      includeMargin={true}
      style={{ borderRadius: 4, border: "1px solid #E5E7EB" }}
    />
  );
}

// ── Download a QR as a PNG via an offscreen canvas ───────────────────────────
function useQRDownload() {
  return useCallback(async (bin) => {
    const payloadStr = await buildSignedPayload(bin);
    // Render into an offscreen canvas by creating a temporary SVG → image → canvas pipeline
    const svgNs   = "http://www.w3.org/2000/svg";
    const SIZE    = 400;
    const MARGIN  = 4;

    // Build SVG string from QRCodeSVG props (we use canvas API directly for PNG export)
    // Easiest approach: create an in-DOM invisible container, capture it, then remove.
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
    document.body.appendChild(container);

    const { createRoot } = await import("react-dom/client");
    const { QRCodeCanvas } = await import("qrcode.react");
    const { createElement } = await import("react");

    const root = createRoot(container);
    root.render(
      createElement(QRCodeCanvas, {
        value: payloadStr, size: SIZE, level: "H",
        includeMargin: true,
        id: "__bs_qr_export__",
      })
    );

    // Give React one tick to render
    await new Promise((r) => setTimeout(r, 80));

    const canvas = container.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `BESMART_QR_${bin.barangay_code ?? bin.id}_${bin.name.replace(/\s+/g, "_")}.png`;
      a.click();
    }

    root.unmount();
    document.body.removeChild(container);
  }, []);
}

// ── Print layout (15 cm × 15 cm sticker) ─────────────────────────────────────
async function handlePrint(bins) {
  if (!bins.length) return;

  // Build signed payloads for all bins before opening the print window
  const signed = await Promise.all(
    bins.map(async (b) => ({ bin: b, payload: await buildSignedPayload(b) }))
  );

  // Build QR image data URLs via offscreen canvas for each bin
  const items = await Promise.all(
    signed.map(({ bin, payload }) =>
      new Promise((resolve) => {
        const container = document.createElement("div");
        container.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
        document.body.appendChild(container);

        Promise.all([
          import("react-dom/client"),
          import("qrcode.react"),
          import("react"),
        ]).then(([{ createRoot }, { QRCodeCanvas }, { createElement }]) => {
          const root = createRoot(container);
          root.render(createElement(QRCodeCanvas, {
            value: payload, size: 450, level: "H",
            includeMargin: true, id: `__bs_print_${bin.id}__`,
          }));
          setTimeout(() => {
            const canvas  = container.querySelector("canvas");
            const dataUrl = canvas ? canvas.toDataURL("image/png") : "";
            root.unmount();
            document.body.removeChild(container);
            resolve({ bin, dataUrl, payload });
          }, 80);
        });
      })
    )
  );

  const tierMap = Object.fromEntries(CAPACITY_TIERS.map((t) => [t.value, t]));

  const html = `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8">
    <title>BE-SMART QR Stickers — Brgy. ${PB_BARANGAY}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#fff;padding:10mm}
      h1{font-size:13pt;color:#1C2B1E;margin-bottom:6mm;text-align:center}
      .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8mm}

      /* ── Sticker card — optimised for 15 cm × 15 cm physical print ── */
      .sticker{
        width:15cm;height:15cm;
        border:1.5px solid #1C2B1E;border-radius:6px;
        display:flex;flex-direction:column;align-items:center;justify-content:space-between;
        padding:4mm;page-break-inside:avoid;background:#fff;
      }
      .sticker-header{
        width:100%;display:flex;align-items:center;justify-content:space-between;
        border-bottom:1px solid #E5E7EB;padding-bottom:2mm;margin-bottom:1mm;
      }
      .brand{font-size:9pt;font-weight:700;color:#1C2B1E;letter-spacing:0.5px}
      .badge{font-size:7pt;font-weight:600;border-radius:99px;padding:1mm 3mm}
      .waste-bio  {background:#E8F5E9;color:#2E7D32}
      .waste-rec  {background:#E3F2FD;color:#1565C0}
      .waste-nonrec{background:#FFF3E0;color:#E65100}
      .qr-wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:2mm 0}
      .qr-wrap img{width:9cm;height:9cm;object-fit:contain}
      .meta{width:100%;border-top:1px solid #E5E7EB;padding-top:2mm;margin-top:1mm}
      .meta-row{display:flex;justify-content:space-between;font-size:7pt;margin-bottom:1mm}
      .meta-label{color:#9CA3AF;font-weight:500}
      .meta-val{color:#1C2B1E;font-weight:600;text-align:right;max-width:55%;word-break:break-all}
      .sig-row{font-size:5.5pt;color:#9CA3AF;margin-top:1mm;word-break:break-all;line-height:1.4}
      @media print{
        @page{size:A4 portrait;margin:10mm}
        .no-print{display:none}
        .sticker{break-inside:avoid}
      }
    </style>
  </head><body>
    <h1 class="no-print">BE-SMART · Brgy. ${PB_BARANGAY} · Print Preview</h1>
    <div class="grid">
    ${items.map(({ bin, dataUrl, payload: ps }) => {
      const p     = JSON.parse(ps);
      const tier  = tierMap[p.capacity_tier];
      const wClass = p.waste_type === "Biodegradable" ? "waste-bio"
                   : p.waste_type === "Recyclable"    ? "waste-rec" : "waste-nonrec";
      return `
      <div class="sticker">
        <div class="sticker-header">
          <span class="brand">BE-SMART · ${p.barangay_code}</span>
          <span class="badge ${wClass}">${p.waste_type}</span>
        </div>
        <div class="qr-wrap">
          <img src="${dataUrl}" alt="QR ${bin.name}" />
        </div>
        <div class="meta">
          <div class="meta-row">
            <span class="meta-label">Bin Name</span>
            <span class="meta-val">${bin.name}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Location</span>
            <span class="meta-val">${bin.street}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Capacity</span>
            <span class="meta-val">${tier?.label ?? p.capacity_tier}${tier?.volume ? ` (${tier.sublabel})` : ""}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Coordinates</span>
            <span class="meta-val">${p.coordinates.lat.toFixed(5)}, ${p.coordinates.lng.toFixed(5)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Sticker Size</span>
            <span class="meta-val">${p.sticker_dimensions}</span>
          </div>
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

// ── Form sub-components ───────────────────────────────────────────────────────
function Field({ label, value, onChange, error, placeholder, type = "text", required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
        {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg px-3 py-2.5 outline-none transition-colors"
        style={{
          fontSize: 14,
          border: error ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB",
          background: "#F9FAFB",
        }}
      />
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between rounded-lg px-3 py-2.5 outline-none text-left"
        style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }}
      >
        <span style={{ color: selected ? "#111827" : "#9CA3AF" }}>
          {selected ? selected.label : `Select ${label}`}
        </span>
        <ChevronDown size={14} color="#9CA3AF" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div className="rounded-lg overflow-hidden z-50 shadow-lg"
          style={{ border: "1.5px solid #E5E7EB", background: "#fff", position: "absolute", marginTop: 64, width: "100%", maxWidth: 360 }}>
          {options.map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
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

// ── Empty form state ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", street: "",
  capacity_tier: "Tier 1", waste_type: "Biodegradable",
  lat: "", lng: "",
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BinQRCodes() {
  const [bins, setBins]             = useState(() => BINS.filter((b) => b.barangay === PB_BARANGAY));
  const [search, setSearch]         = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [filterWaste, setFilterWaste] = useState("all");
  const [selected, setSelected]     = useState([]);
  const [previewBin, setPreviewBin] = useState(null);
  const [previewPayload, setPreviewPayload] = useState(null);

  // Add-bin modal
  const [addOpen, setAddOpen]       = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [addedBin, setAddedBin]     = useState(null);

  const handleDownload = useQRDownload();

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = bins.filter((b) => {
    const matchSearch = !search.trim() ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.street.toLowerCase().includes(search.toLowerCase());
    const matchTier  = filterTier  === "all" || b.capacity_tier === filterTier;
    const matchWaste = filterWaste === "all" || b.waste_type    === filterWaste;
    return matchSearch && matchTier && matchWaste;
  });

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleSelect    = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const selectAll       = ()   => setSelected(filtered.map((b) => b.id));
  const clearSelection  = ()   => setSelected([]);

  // ── Preview modal ──────────────────────────────────────────────────────────
  async function openPreview(bin) {
    setPreviewBin(bin);
    const ps = await buildSignedPayload(bin);
    setPreviewPayload(JSON.parse(ps));
  }

  // ── Add bin ────────────────────────────────────────────────────────────────
  function openAdd() { setForm(EMPTY_FORM); setFormErrors({}); setAddedBin(null); setAddOpen(true); }

  function validateForm() {
    const e = {};
    if (!form.name.trim())   e.name   = "Bin name is required.";
    if (!form.street.trim()) e.street = "Street / location is required.";
    if (!form.capacity_tier) e.capacity_tier = "Select a capacity tier.";
    if (!form.waste_type)    e.waste_type    = "Select a waste type.";
    if (form.lat && isNaN(parseFloat(form.lat)))  e.lat = "Must be a valid decimal number.";
    if (form.lng && isNaN(parseFloat(form.lng)))  e.lng = "Must be a valid decimal number.";
    return e;
  }

  function handleAddBin() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }

    const seqNum      = bins.filter((b) => b.barangay === PB_BARANGAY).length + 1;
    const barCode     = `${BARANGAY_CODE_PREFIX}-${String(seqNum).padStart(2, "0")}`;
    const tierInfo    = CAPACITY_TIERS.find((t) => t.value === form.capacity_tier);

    const newBin = {
      id:                    `pb_bin_${Date.now()}`,
      name:                  form.name.trim(),
      street:                form.street.trim(),
      barangay:              PB_BARANGAY,
      barangay_code:         barCode,
      cluster_id:            PB_CLUSTER,
      capacity_tier:         form.capacity_tier,
      capacity_volume_liters: tierInfo?.volume ?? null,
      waste_type:            form.waste_type,
      sticker_dimensions:    "15cm x 15cm",
      coordinates: {
        lat: form.lat ? parseFloat(form.lat) : 13.7565 + (Math.random() - 0.5) * 0.01,
        lng: form.lng ? parseFloat(form.lng) : 121.0583 + (Math.random() - 0.5) * 0.01,
      },
      status:       "ok",
      reportedBy:   null,
      timeReported: null,
      posX: parseFloat((Math.random() * 0.5 + 0.2).toFixed(2)),
      posY: parseFloat((Math.random() * 0.5 + 0.2).toFixed(2)),
    };

    setBins((prev) => [...prev, newBin]);
    setAddedBin(newBin);
  }

  const tierBadgeStyle = (tier) => {
    if (tier === "Tier 1") return { bg: "#F3E8FF", color: "#7C3AED" };
    if (tier === "Tier 2") return { bg: "#DBEAFE", color: "#1D4ED8" };
    if (tier === "Tier 3") return { bg: "#FEF3C7", color: "#B45309" };
    return { bg: "#FFE4E6", color: "#BE123C" };
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
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
            </>
          )}
          <button onClick={selectAll}
            className="rounded-lg px-3 py-2 font-medium hover:bg-gray-100 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", color: "#374151" }}>
            Select All
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 13, background: "#2E7D32" }}>
            <Plus size={14} /> Add Bin
          </button>
        </div>
      </div>

      {/* ── Info banner ──────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: "#E8F5E9", border: "1px solid #C8E6C9" }}>
        <Shield size={15} color="#2E7D32" className="flex-shrink-0 mt-0.5" />
        <p style={{ fontSize: 13, color: "#1C2B1E" }}>
          Each QR encodes a <strong>HMAC-SHA256 signed</strong> payload with bin ID, tier,
          waste type, and GPS coordinates. Scans are verified server-side — spoofed QR
          codes are rejected. Print at <strong>15 cm × 15 cm</strong> for outdoor stickers.
          <strong className="ml-1">Total: {bins.length} bins</strong>
        </p>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex items-center" style={{ minWidth: 240 }}>
          <Search size={14} className="absolute left-3 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bin name or street…"
            className="w-full rounded-lg pl-9 pr-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
        </div>

        {/* Tier filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", ...CAPACITY_TIERS.map((t) => t.value)].map((t) => (
            <button key={t} onClick={() => setFilterTier(t)}
              className="rounded-full px-3 py-1 font-medium transition-colors"
              style={{
                fontSize: 12,
                background: filterTier === t ? "#2E7D32" : "#fff",
                color:      filterTier === t ? "#fff"    : "#6B7280",
                border:     filterTier === t ? "1px solid #2E7D32" : "1px solid #E5E7EB",
              }}>
              {t === "all" ? "All Tiers" : t}
            </button>
          ))}
        </div>

        {/* Waste type filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", ...WASTE_TYPES].map((w) => (
            <button key={w} onClick={() => setFilterWaste(w)}
              className="rounded-full px-3 py-1 font-medium transition-colors"
              style={{
                fontSize: 12,
                background: filterWaste === w ? "#1976D2" : "#fff",
                color:      filterWaste === w ? "#fff"    : "#6B7280",
                border:     filterWaste === w ? "1px solid #1976D2" : "1px solid #E5E7EB",
              }}>
              {w === "all" ? "All Types" : w}
            </button>
          ))}
        </div>
      </div>

      {/* ── QR Grid ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
        {filtered.map((bin) => {
          const sc       = statusStyle(bin.status);
          const wc       = wasteTypeStyle(bin.waste_type);
          const tc       = tierBadgeStyle(bin.capacity_tier);
          const isSel    = selected.includes(bin.id);
          const isNew    = bin.id.startsWith("pb_bin_");
          return (
            <div key={bin.id}
              className="bg-white rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all"
              style={{
                border:     isSel ? "2px solid #2E7D32" : "1px solid #E5E7EB",
                boxShadow:  isSel ? "0 0 0 3px rgba(46,125,50,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
              }}
              onClick={() => toggleSelect(bin.id)}
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded flex-shrink-0"
                    style={{ width: 17, height: 17, background: isSel ? "#2E7D32" : "#fff", border: isSel ? "none" : "1.5px solid #D1D5DB" }}>
                    {isSel && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{bin.name}</span>
                </div>
                <span className="rounded-full px-2 py-0.5 font-semibold"
                  style={{ fontSize: 10, background: sc.bg, color: sc.color }}>{bin.status}</span>
              </div>

              {/* Tier + waste type badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="rounded-full px-2 py-0.5 font-semibold"
                  style={{ fontSize: 10, background: tc.bg, color: tc.color }}>{bin.capacity_tier}</span>
                <span className="rounded-full px-2 py-0.5 font-semibold"
                  style={{ fontSize: 10, background: wc.bg, color: wc.color }}>{bin.waste_type}</span>
                {isNew && (
                  <span className="rounded-full px-2 py-0.5 font-semibold"
                    style={{ fontSize: 9, background: "#E3F2FD", color: "#1976D2" }}>NEW</span>
                )}
              </div>

              {/* QR */}
              <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                <QRCard bin={bin} size={160} />
              </div>

              {/* Meta */}
              <div className="flex flex-col gap-0.5">
                <p className="text-text-secondary" style={{ fontSize: 12 }}>{bin.street}</p>
                <p className="text-text-muted" style={{ fontSize: 11 }}>
                  {bin.barangay_code} · {bin.coordinates
                    ? `${bin.coordinates.lat.toFixed(4)}, ${bin.coordinates.lng.toFixed(4)}`
                    : "No coords"}
                </p>
              </div>

              {/* Actions */}
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

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-2 py-16 text-text-muted">
            <QrCode size={32} />
            <span style={{ fontSize: 14 }}>No bins match your filters.</span>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ADD BIN MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.48)" }}
          onClick={() => { setAddOpen(false); setAddedBin(null); }}>
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-5 relative"
            style={{ width: 440, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", maxHeight: "92vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>

            <button onClick={() => { setAddOpen(false); setAddedBin(null); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={16} color="#6B7280" />
            </button>

            {addedBin ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="flex items-center justify-center rounded-full"
                  style={{ width: 64, height: 64, background: "#E8F5E9" }}>
                  <Shield size={28} color="#2E7D32" />
                </div>
                <div className="text-center">
                  <h2 className="font-bold text-text-primary" style={{ fontSize: 18 }}>Bin Registered!</h2>
                  <p className="text-text-secondary mt-1" style={{ fontSize: 13 }}>
                    <strong>{addedBin.name}</strong> — signed QR code is ready for printing.
                  </p>
                </div>

                <QRCard bin={addedBin} size={190} />

                {/* Payload summary */}
                <div className="rounded-xl px-4 py-3 w-full flex flex-col gap-1.5"
                  style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                  {[
                    ["Bin ID",         addedBin.id],
                    ["Barangay Code",  addedBin.barangay_code],
                    ["Capacity Tier",  addedBin.capacity_tier],
                    ["Waste Type",     addedBin.waste_type],
                    ["Coordinates",    `${addedBin.coordinates.lat.toFixed(5)}, ${addedBin.coordinates.lng.toFixed(5)}`],
                    ["Sticker Size",   "15cm × 15cm"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-text-muted" style={{ fontSize: 12 }}>{k}</span>
                      <span className="font-semibold text-text-primary" style={{ fontSize: 12 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 w-full">
                  <button onClick={() => handleDownload(addedBin)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold hover:opacity-90 transition-opacity"
                    style={{ fontSize: 13, background: "#E8F5E9", color: "#2E7D32", border: "1px solid #C8E6C9" }}>
                    <Download size={14} /> Download PNG
                  </button>
                  <button onClick={() => handlePrint([addedBin])}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ fontSize: 13, background: "#1976D2" }}>
                    <Printer size={14} /> Print Sticker
                  </button>
                </div>

                <button onClick={() => { setAddOpen(false); setAddedBin(null); }}
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
                    Register a new drop-off point for Brgy. {PB_BARANGAY}.
                    A signed QR sticker will be generated automatically.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <Field label="Bin Name" required value={form.name}
                    onChange={(v) => { setForm((p) => ({ ...p, name: v })); setFormErrors((p) => ({ ...p, name: undefined })); }}
                    error={formErrors.name} placeholder="e.g. Bin A-03" />

                  <Field label="Street / Location" required value={form.street}
                    onChange={(v) => { setForm((p) => ({ ...p, street: v })); setFormErrors((p) => ({ ...p, street: undefined })); }}
                    error={formErrors.street} placeholder="e.g. P. Burgos St." />

                  {/* Barangay — locked */}
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Barangay</label>
                    <input value={`Brgy. ${PB_BARANGAY}`} disabled className="rounded-lg px-3 py-2.5"
                      style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F3F4F6", color: "#9CA3AF" }} />
                  </div>

                  {/* Capacity Tier */}
                  <div className="relative">
                    <SelectField label="Capacity Tier" required value={form.capacity_tier}
                      onChange={(v) => setForm((p) => ({ ...p, capacity_tier: v }))}
                      options={CAPACITY_TIERS} />
                    {formErrors.capacity_tier && (
                      <span style={{ fontSize: 12, color: "#DC2626" }}>{formErrors.capacity_tier}</span>
                    )}
                  </div>

                  {/* Waste Type */}
                  <div className="relative">
                    <SelectField label="Primary Waste Type" required value={form.waste_type}
                      onChange={(v) => setForm((p) => ({ ...p, waste_type: v }))}
                      options={WASTE_TYPES.map((w) => ({ value: w, label: w }))} />
                    {formErrors.waste_type && (
                      <span style={{ fontSize: 12, color: "#DC2626" }}>{formErrors.waste_type}</span>
                    )}
                  </div>

                  {/* GPS Coordinates */}
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
                      GPS Coordinates <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <div className="flex items-start gap-2">
                      <Field label="Latitude" value={form.lat}
                        onChange={(v) => { setForm((p) => ({ ...p, lat: v })); setFormErrors((p) => ({ ...p, lat: undefined })); }}
                        error={formErrors.lat} placeholder="e.g. 13.7565" />
                      <Field label="Longitude" value={form.lng}
                        onChange={(v) => { setForm((p) => ({ ...p, lng: v })); setFormErrors((p) => ({ ...p, lng: undefined })); }}
                        error={formErrors.lng} placeholder="e.g. 121.0583" />
                    </div>
                  </div>

                  {/* Coords hint */}
                  <div className="rounded-xl px-4 py-3 flex items-start gap-3"
                    style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
                    <MapPin size={14} color="#0284C7" className="flex-shrink-0 mt-0.5" />
                    <p style={{ fontSize: 12, color: "#0369A1" }}>
                      Coordinates are embedded in the signed QR payload for Amazon Rekognition
                      spatial calibration and SageMaker route optimisation.
                      If left blank, approximate coordinates will be auto-assigned.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => { setAddOpen(false); setAddedBin(null); }}
                    className="flex-1 rounded-xl py-2.5 font-medium"
                    style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>
                    Cancel
                  </button>
                  <button onClick={handleAddBin}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ fontSize: 14, background: "#2E7D32" }}>
                    <Plus size={14} /> Register &amp; Generate QR
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          PREVIEW MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {previewBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.48)" }}
          onClick={() => { setPreviewBin(null); setPreviewPayload(null); }}>
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-5 relative"
            style={{ width: 400, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", maxHeight: "92vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>

            <button onClick={() => { setPreviewBin(null); setPreviewPayload(null); }}
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

            {/* Payload inspector */}
            {previewPayload ? (
              <div className="rounded-xl p-4 flex flex-col gap-2"
                style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={13} color="#2E7D32" />
                  <span className="font-semibold text-text-primary" style={{ fontSize: 12 }}>Signed Payload</span>
                </div>
                {[
                  ["System",       previewPayload.system],
                  ["Bin ID",       previewPayload.bin_id],
                  ["Barangay Code",previewPayload.barangay_code],
                  ["Cluster",      previewPayload.cluster_id],
                  ["Tier",         previewPayload.capacity_tier],
                  ["Volume",       previewPayload.capacity_volume_liters ? `${previewPayload.capacity_volume_liters}L` : "Custom m³"],
                  ["Waste Type",   previewPayload.waste_type],
                  ["Sticker",      previewPayload.sticker_dimensions],
                  ["Lat / Lng",    `${previewPayload.coordinates?.lat?.toFixed(6)}, ${previewPayload.coordinates?.lng?.toFixed(6)}`],
                  ["Issued",       new Date(previewPayload.issued_at).toLocaleString("en-PH")],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-text-muted flex-shrink-0" style={{ fontSize: 11 }}>{k}</span>
                    <span className="font-medium text-text-primary text-right" style={{ fontSize: 11 }}>{v}</span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t" style={{ borderColor: "#E5E7EB" }}>
                  <span className="text-text-muted" style={{ fontSize: 10 }}>HMAC-SHA256 Signature</span>
                  <code className="block text-text-muted break-all mt-0.5" style={{ fontSize: 9, lineHeight: 1.7 }}>
                    {previewPayload.signature}
                  </code>
                </div>
              </div>
            ) : (
              <div className="rounded-xl px-4 py-3 flex items-center justify-center"
                style={{ background: "#F9FAFB", border: "1px solid #F3F4F6", minHeight: 80 }}>
                <span className="text-text-muted animate-pulse" style={{ fontSize: 12 }}>Signing payload…</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={() => handleDownload(previewBin)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: "#E8F5E9", color: "#2E7D32", border: "1px solid #C8E6C9" }}>
                <Download size={14} /> Download PNG
              </button>
              <button onClick={() => { setPreviewBin(null); setPreviewPayload(null); handlePrint([previewBin]); }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: "#1976D2" }}>
                <Printer size={14} /> Print Sticker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
