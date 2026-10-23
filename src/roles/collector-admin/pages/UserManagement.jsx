import { colors } from "../../../theme/colors.js";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import FormField from "../../../components/ui/FormField.jsx";
import { COLLECTORS, COLLECTOR_UNITS } from "../../../mock/data";

const EMPTY_FORM = { name: "", email: "", tempPassword: "" };

export default function CAUserManagement() {
  const [collectors, setCollectors] = useState(COLLECTORS);
  const [units]                     = useState(COLLECTOR_UNITS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm() {
    const e = {};
    if (!form.name.trim())  e.name  = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.tempPassword) e.tempPassword = "Temporary password is required.";
    return e;
  }

  function handleSave() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setCollectors((prev) => [
      ...prev,
      { id: `col${Date.now()}`, name: form.name, email: form.email, cluster: "c1", role: "collector", status: "active", lastLogin: null, assignedTruck: null },
    ]);
    setModalOpen(false);
  }

  function handleDelete(id) {
    setCollectors((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
  }

  const getAssignedUnit  = (id) => { const u = units.find((u) => u.collectorIds.includes(id)); return u ? u.name : "—"; };
  const formatLastLogin  = (ts) => ts ? new Date(ts).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "Never";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>User Management</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>Manage collector accounts — Cluster 1</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 14, background: colors.primary }}>
          <Plus size={15} /> Add Collector Account
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Collectors", value: collectors.length,                                        color: colors.textHeading },
          { label: "Active",           value: collectors.filter((c) => c.status === "active").length,   color: colors.primary },
          { label: "Inactive",         value: collectors.filter((c) => c.status === "inactive").length, color: colors.textMuted },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="font-bold" style={{ fontSize: 28, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            <div className="text-text-secondary" style={{ fontSize: 13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: colors.gray50, borderBottom: "1px solid " + colors.gray200 }}>
              {["Name", "Role", "Email", "Assigned Unit", "Status", "Last Login", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                  style={{ fontSize: 12, color: colors.gray500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {collectors.length === 0
              ? <tr><td colSpan={7} className="text-center text-text-muted py-10" style={{ fontSize: 14 }}>No collectors yet.</td></tr>
              : collectors.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : colors.tableRowAlt, borderBottom: "1px solid #F3F4F6" }}>
                  <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>Collector</td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{c.email}</td>
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{getAssignedUnit(c.id)}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{formatLastLogin(c.lastLogin)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteTarget(c)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-red-50"
                      style={{ fontSize: 12, color: colors.error, border: "1px solid " + colors.inputErrorBorder }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* ── ADD MODAL ─────────────────────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Collector Account"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>Cancel</button>
            <button onClick={handleSave} className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90"
              style={{ fontSize: 14, background: colors.primary }}>Create Account</button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Full Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} error={formErrors.name} placeholder="e.g. Ramon Dela Torre" />
          <FormField label="Email Address" type="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} error={formErrors.email} placeholder="ramon.delatorre@besmart.gov.ph" />
          <FormField label="Temporary Password" type="password" value={form.tempPassword} onChange={(v) => setForm((p) => ({ ...p, tempPassword: v }))} error={formErrors.tempPassword} placeholder="Min. 8 characters" />
        </div>
      </Modal>

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────────────── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Collector Account"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>Cancel</button>
            <button onClick={() => handleDelete(deleteTarget.id)}
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, background: colors.error }}>
              <Trash2 size={14} /> Delete
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: colors.errorSoft, border: "1px solid " + colors.errorBorder }}>
              <Trash2 size={16} color={colors.error} className="flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: 13, color: colors.errorDark }}>This will permanently delete the account. This action cannot be undone.</p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[{ label: "Name", value: deleteTarget.name }, { label: "Email", value: deleteTarget.email }].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0" style={{ borderColor: colors.gray100 }}>
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
