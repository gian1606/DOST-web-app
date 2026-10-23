import { colors } from "../../../theme/colors.js";
import { useState } from "react";
import { Plus, Trash2, Pencil, MapPin } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import StatusBadge from "../../../components/ui/StatusBadge";
import { BARANGAY_ACCOUNTS } from "../../../mock/data";
import FormField from "../../../components/ui/FormField.jsx";


const EMPTY_FORM = { name: "", captain: "", email: "" };

export default function OrganizationManagement() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Organization Management</h1>
        <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
          Manage barangays — the organizational units that admin accounts are assigned to
        </p>
      </div>
      <BarangaysTab />
    </div>
  );
}

function BarangaysTab() {
  const [barangays, setBarangays]     = useState(
    BARANGAY_ACCOUNTS.map((b) => ({ id: b.id, name: b.name, captain: b.captain, email: b.email, status: b.status, totalBins: b.totalBins, activeResidents: b.activeResidents, lastActivity: b.lastActivity }))
  );
  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [search, setSearch]           = useState("");

  const filtered = barangays.filter((b) =>
    !search.trim() || b.name.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd()   { setEditTarget(null); setForm(EMPTY_FORM); setFormErrors({}); setModalOpen(true); }
  function openEdit(b) { setEditTarget(b); setForm({ name: b.name, captain: b.captain, email: b.email }); setFormErrors({}); setModalOpen(true); }

  function validate() {
    const e = {};
    if (!form.name.trim())    e.name    = "Barangay name is required.";
    if (!form.captain.trim()) e.captain = "Captain is required.";
    if (!form.email.trim())   e.email   = "Email is required.";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    if (editTarget) {
      setBarangays((prev) => prev.map((b) => b.id === editTarget.id
        ? { ...b, name: form.name.trim(), captain: form.captain.trim(), email: form.email.trim() } : b));
    } else {
      setBarangays((prev) => [...prev, {
        id: `br${Date.now()}`, name: form.name.trim(), captain: form.captain.trim(),
        email: form.email.trim(), status: "active", totalBins: 0, activeResidents: 0,
        lastActivity: new Date().toISOString().split("T")[0],
      }]);
    }
    setModalOpen(false);
  }

  function handleDelete(id) { setBarangays((p) => p.filter((b) => b.id !== id)); setDeleteTarget(null); }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex items-center" style={{ minWidth: 240 }}>
          <svg className="absolute left-3 text-text-muted" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search barangay name…"
            className="rounded-lg pl-9 pr-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.gray50 }} />
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg px-3 py-2 flex items-center gap-2"
            style={{ background: colors.gray100, border: "1px solid " + colors.gray200 }}>
            <span className="font-bold" style={{ fontSize: 18, color: colors.gray700 }}>{barangays.length}</span>
            <span className="font-medium text-text-secondary" style={{ fontSize: 13 }}>Barangays</span>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: colors.primary }}>
            <Plus size={15} /> Add Barangay
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: colors.gray50, borderBottom: "1px solid " + colors.gray200 }}>
              {["Barangay Name", "Captain / Contact", "Email", "Total Bins", "Active Residents", "Status", "Last Activity", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-5 py-3"
                  style={{ fontSize: 11, color: colors.gray500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-text-muted py-10" style={{ fontSize: 14 }}>
                No barangays found.
              </td></tr>
            ) : filtered.map((b, i) => (
              <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : colors.tableRowAlt, borderBottom: "1px solid #F3F4F6" }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{ width: 28, height: 28, background: colors.accentSoft }}>
                      <MapPin size={13} color={colors.primary} />
                    </div>
                    <span className="font-semibold text-text-primary" style={{ fontSize: 13 }}>{b.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.captain}</td>
                <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.email}</td>
                <td className="px-5 py-3 text-text-primary" style={{ fontSize: 13 }}>{b.totalBins}</td>
                <td className="px-5 py-3 text-text-primary" style={{ fontSize: 13 }}>{b.activeResidents}</td>
                <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.lastActivity}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(b)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium hover:bg-blue-50 transition-colors"
                      style={{ fontSize: 12, color: colors.recyclable, border: "1px solid " + colors.infoBorder }}>
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(b)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium hover:bg-red-50 transition-colors"
                      style={{ fontSize: 12, color: colors.error, border: "1px solid " + colors.inputErrorBorder }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Barangay" : "Add Barangay"}
        footer={<>
          <button onClick={() => setModalOpen(false)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>Cancel</button>
          <button onClick={handleSave}
            className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: colors.primary }}>
            {editTarget ? "Save Changes" : "Create Barangay"}
          </button>
        </>}>
        <div className="flex flex-col gap-4">
          <FormField label="Barangay Name" value={form.name}
            onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            error={formErrors.name} placeholder="e.g. Brgy. Alangilan" />
          <FormField label="Captain / Contact" value={form.captain}
            onChange={(v) => setForm((p) => ({ ...p, captain: v }))}
            error={formErrors.captain} placeholder="e.g. Jose Reyes" />
          <FormField label="Email" type="email" value={form.email}
            onChange={(v) => setForm((p) => ({ ...p, email: v }))}
            error={formErrors.email} placeholder="barangay@besmart.gov.ph" />
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Barangay"
        footer={<>
          <button onClick={() => setDeleteTarget(null)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>Cancel</button>
          <button onClick={() => handleDelete(deleteTarget.id)}
            className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: colors.error }}>
            <Trash2 size={14} /> Delete
          </button>
        </>}>
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: colors.errorSoft, border: "1px solid " + colors.errorBorder }}>
              <Trash2 size={16} color={colors.error} className="flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: 13, color: colors.errorDark }}>
                Deleting this barangay will not remove the associated admin account, but it will become unassigned. This action cannot be undone.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[
                { label: "Barangay Name", value: deleteTarget.name },
                { label: "Captain",       value: deleteTarget.captain },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0"
                  style={{ borderColor: colors.gray100 }}>
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
