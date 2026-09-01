import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import { BARANGAYS, CLUSTER_INFO } from "../mock/data";

const EMPTY_FORM = { name: "", captain: "", email: "", zone: "", tempPassword: "" };

export default function BarangayManagement() {
  const [barangays, setBarangays]   = useState(BARANGAYS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  function openAdd() { setForm(EMPTY_FORM); setFormErrors({}); setModalOpen(true); }

  function validateForm() {
    const e = {};
    if (!form.name.trim())    e.name    = "Barangay name is required.";
    if (!form.captain.trim()) e.captain = "Contact person is required.";
    if (!form.email.trim())   e.email   = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.tempPassword)   e.tempPassword = "Temporary password is required.";
    return e;
  }

  function handleSave() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setBarangays((prev) => [
      ...prev,
      { id: `br${Date.now()}`, name: form.name, captain: form.captain, email: form.email, totalBins: 0, activeResidents: 0, status: "active", lastActivity: new Date().toISOString().split("T")[0] },
    ]);
    setModalOpen(false);
  }

  function handleDelete(id) {
    setBarangays((prev) => prev.filter((b) => b.id !== id));
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Barangay Management</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            Managing barangays under {CLUSTER_INFO.label} — {CLUSTER_INFO.zone}
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 14, background: "#2E7D32" }}>
          <Plus size={15} /> Add Barangay Account
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Barangay Name", "Captain / Contact", "Email", "Total Bins", "Active Residents", "Status", "Last Activity", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                  style={{ fontSize: 12, color: "#6B7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {barangays.map((b, i) => (
              <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{b.name}</td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.captain}</td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.email}</td>
                <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{b.totalBins}</td>
                <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{b.activeResidents}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.lastActivity}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDeleteTarget(b)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-red-50"
                    style={{ fontSize: 12, color: "#DC2626", border: "1px solid #FECACA" }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── ADD MODAL ─────────────────────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Barangay Account"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
            <button onClick={handleSave} className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, background: "#2E7D32" }}>Create Account</button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Barangay Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} error={formErrors.name} placeholder="e.g. Brgy. Kumintang Ibaba" />
          <FormField label="Contact Person / Captain" value={form.captain} onChange={(v) => setForm((p) => ({ ...p, captain: v }))} error={formErrors.captain} placeholder="e.g. Jose Reyes" />
          <FormField label="Email Address" type="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} error={formErrors.email} placeholder="barangay@besmart.gov.ph" />
          <FormField label="Assigned Zone / Area" value={form.zone} onChange={(v) => setForm((p) => ({ ...p, zone: v }))} placeholder="e.g. North Zone" />
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Cluster</label>
            <input value={`${CLUSTER_INFO.label} — ${CLUSTER_INFO.zone}`} disabled className="rounded-lg px-3 py-2.5"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F3F4F6", color: "#9CA3AF" }} />
          </div>
          <FormField label="Temporary Password" type="password" value={form.tempPassword} onChange={(v) => setForm((p) => ({ ...p, tempPassword: v }))} error={formErrors.tempPassword} placeholder="Min. 8 characters" />
        </div>
      </Modal>

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────────────── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Barangay Account"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
            <button onClick={() => handleDelete(deleteTarget.id)}
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, background: "#DC2626" }}>
              <Trash2 size={14} /> Delete
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: "#FFEBEE", border: "1px solid #FFCDD2" }}>
              <Trash2 size={16} color="#DC2626" className="flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: 13, color: "#B71C1C" }}>This will permanently delete the barangay account. This action cannot be undone.</p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[
                { label: "Barangay Name", value: deleteTarget.name },
                { label: "Captain",       value: deleteTarget.captain },
                { label: "Email",         value: deleteTarget.email },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0" style={{ borderColor: "#F3F4F6" }}>
                  <span className="text-text-muted font-medium" style={{ fontSize: 13 }}>{label}</span>
                  <span className="text-text-primary font-semibold" style={{ fontSize: 13 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function FormField({ label, type = "text", value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="rounded-lg px-3 py-2.5 outline-none"
        style={{ fontSize: 14, border: error ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
      {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
    </div>
  );
}

