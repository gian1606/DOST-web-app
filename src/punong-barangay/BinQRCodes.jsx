import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, Download, Printer, Search, Plus, X, MapPin } from "lucide-react";
import { BINS } from "../mock/data";

const PB_BARANGAY = "Alangilan";
const PB_CLUSTER  = "c1";
const API_URL     = import.meta.env.VITE_API_URL;

// ── Helpers ───────────────────────────────────────────────────────────────────
// For existing mock bins: build an unsigned payload for display only.
// New bins created via the API will use the signed qr_payload from the server.
function buildPayload(bin) {
  // If the bin has a server-signed qr_payload, use it directly.
  if (bin.qr_payload) return bin.qr_payload;
  // Fallback for mock/display bins (not scannable by the mobile app)
  return JSON.stringify({
    system:   "BE-SMART",
    bin_id:   bin.id,
    name:     bin.name,
    street:   bin.street || "",
    barangay: bin.barangay,
    tier:     bin.tier || "",
  });
}

function statusColor(s) {
  const key = (s || "").toLowerCase();
  if (key === "full")      return { bg: "#FFEBEE", color: "#DC2626" };
  if (key === "missed")    return { bg: "#FFF3E0", color: "#D97706" };
  if (key === "collected") return { bg: "#E8F5E9", color: "#2E7D32" };
  return { bg: "#F3F4F6", color: "#6B7280" };
}

// ── QR card using qrcode.react ────────────────────────────────────────────────
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

// ── Form field ────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, error, placeholder, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
        {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      <input
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

// ── Main page ─────────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", street: "", tier_id: "" };

export default function BinQRCodes() {
  // Seed local state from mock; new bins added here persist for the session
  const [bins, setBins]             = useState(() => BINS.filter((b) => b.barangay === PB_BARANGAY));
  const [tiers, setTiers]           = useState([]);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState([]);
  const [previewBin, setPreviewBin] = useState(null);

  // Add-bin modal
  const [addOpen, setAddOpen]       = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [addedBin, setAddedBin]     = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError]     = useState("");

  // Load tiers from API on mount
  useEffect(() => {
    const token = sessionStorage.getItem("bs_token");
    if (!token) return;
    fetch(`${API_URL}/bins?barangay=${encodeURIComponent(PB_BARANGAY)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.bins && data.bins.length > 0) {
          // Merge API bins with mock bins (API bins take precedence by id)
          setBins((prev) => {
            const apiIds = new Set(data.bins.map((b) => b.id));
            const filtered = prev.filter((b) => !apiIds.has(b.id));
            return [...data.bins, ...filtered];
          });
        }
      })
      .catch(() => {}); // keep mock bins if API unavailable

    fetch(`${API_URL}/tiers`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTiers(data); })
      .catch(() => {});

  }, []);

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = bins.filter((b) =>
    !search.trim() ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.street.toLowerCase().includes(search.toLowerCase())
  );

  // ── Selection ───────────────────────────────────────────────────────────────
  function toggleSelect(id) {
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }
  function selectAll()    { setSelected(filtered.map((b) => b.id)); }
  function clearSelection() { setSelected([]); }

  // ── Download ────────────────────────────────────────────────────────────────
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

  // ── Print ───────────────────────────────────────────────────────────────────
  async function handlePrint(overrideBins) {
    const printBins = overrideBins
      ?? (selected.length > 0 ? bins.filter((b) => selected.includes(b.id)) : [previewBin].filter(Boolean));
    if (!printBins.length) return;

    const QRCode = await import("qrcode").then((m) => m.default ?? m);

    const cards = await Promise.all(printBins.map(async (bin) => {
      const url = await QRCode.toDataURL(buildPayload(bin), { width: 320, margin: 2 });
      return `
        <div class="card">
          <img src="${url}" alt="QR ${bin.name}" />
          <div class="name">${bin.name}</div>
          <div class="sub">${bin.street}</div>
          <div class="badge">${bin.status}</div>
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
        .badge{background:#E8F5E9;color:#2E7D32;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:600}
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

  // ── Add bin ─────────────────────────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setAddedBin(null);
    setAddError("");
    setAddOpen(true);
  }

  function validateForm() {
    const e = {};
    if (!form.name.trim())    e.name    = "Bin name is required.";
    if (!form.street.trim())  e.street  = "Street / location is required.";
    if (!form.tier_id)        e.tier_id = "Please select a bin tier.";
    return e;
  }

  async function handleAddBin() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }

    setAddLoading(true);
    setAddError("");
    try {
      const token = sessionStorage.getItem("bs_token");
      const res = await fetch(`${API_URL}/bins`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name:        form.name.trim(),
          street:      form.street.trim(),
          barangay:    PB_BARANGAY,
          cluster_id:  PB_CLUSTER,
          tier_id:     form.tier_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Failed to create bin.");
        setAddLoading(false);
        return;
      }

      const newBin = { ...data.bin, status: "ok" };
      setBins((prev) => [newBin, ...prev]);
      setAddedBin(newBin);
    } catch {
      setAddError("Unable to connect to the server.");
    } finally {
      setAddLoading(false);
    }
  }

  function handleAddClose() {
    setAddOpen(false);
    setAddedBin(null);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
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
              <button onClick={() => handlePrint()}
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

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: "#E8F5E9", border: "1px solid #C8E6C9" }}>
        <QrCode size={16} color="#2E7D32" className="flex-shrink-0 mt-0.5" />
        <p style={{ fontSize: 13, color: "#1C2B1E" }}>
          Each QR code encodes the bin's ID, name, street, and barangay. Residents scan these
          with the BE-SMART mobile app to report bin status. Print and attach them to the physical bins.
          <strong className="ml-1">Total: {bins.length} bins</strong>
        </p>
      </div>

      {/* Search */}
      <div className="relative flex items-center" style={{ maxWidth: 360 }}>
        <Search size={14} className="absolute left-3 text-text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by bin name or street…"
          className="w-full rounded-lg pl-9 pr-3 py-2 outline-none"
          style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
      </div>

      {/* QR Grid */}
      <div className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {filtered.map((bin) => {
          const sc = statusColor(bin.status);
          const isSelected = selected.includes(bin.id);
          const isNew = bin.id.startsWith("pb_bin_");
          return (
            <div key={bin.id}
              className="bg-white rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all"
              style={{
                border: isSelected ? "2px solid #2E7D32" : "1px solid #E5E7EB",
                boxShadow: isSelected ? "0 0 0 3px rgba(46,125,50,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
              }}
              onClick={() => toggleSelect(bin.id)}
            >
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
                    style={{ fontSize: 10, background: sc.bg, color: sc.color }}>{bin.status}</span>
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
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center text-text-muted py-12" style={{ fontSize: 14 }}>
            No bins match your search.
          </div>
        )}
      </div>

      {/* ── ADD BIN MODAL ──────────────────────────────────────────────────── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={handleAddClose}>
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-5 relative"
            style={{ width: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>

            {/* Close */}
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

                {/* Preview the new QR */}
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
                      style={{ fontSize: 14, border: formErrors.tier_id ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }}
                    >
                      <option value="">Select a tier…</option>
                      {tiers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}{t.capacity_liters ? ` (${t.capacity_liters}L)` : ""} — {t.eco_reward} ECO reward
                        </option>
                      ))}
                    </select>
                    {formErrors.tier_id && <span style={{ fontSize: 12, color: "#DC2626" }}>{formErrors.tier_id}</span>}
                  </div>

                  {/* Barangay — locked */}
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Barangay</label>
                    <input value={`Brgy. ${PB_BARANGAY}`} disabled
                      className="rounded-lg px-3 py-2.5"
                      style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F3F4F6", color: "#9CA3AF" }} />
                  </div>

                  {/* Map position hint */}
                  <div className="rounded-xl px-4 py-3 flex items-start gap-3"
                    style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
                    <MapPin size={15} color="#0284C7" className="flex-shrink-0 mt-0.5" />
                    <p style={{ fontSize: 12, color: "#0369A1" }}>
                      Map position will be auto-assigned. You can adjust it later from the Live Map view.
                    </p>
                  </div>

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

      {/* ── PREVIEW MODAL ──────────────────────────────────────────────────── */}
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
                {previewBin.status}
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
    </div>
  );
}

