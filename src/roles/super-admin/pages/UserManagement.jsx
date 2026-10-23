import { colors } from "../../../theme/colors.js";
import { useState } from "react";
import { Plus, Trash2, Building, ChevronDown } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal       from "../../../components/ui/Modal";
import { BARANGAY_ACCOUNTS } from "../../../mock/data";
import FormField from "../../../components/ui/FormField.jsx";


const EMPTY_BARANGAY_FORM = { name: "", captain: "", email: "", tempPassword: "" };

export default function UserManagement() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>User Management</h1>
        <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
          Manage barangay admin accounts — Batangas City
        </p>
      </div>
      <BarangayAdminTab />
    </div>
  );
}

function BarangayAdminTab() {
  const [barangays, setBarangays]   = useState(BARANGAY_ACCOUNTS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_BARANGAY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch]             = useState("");

  const filtered = barangays.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchSearch = !search.trim() ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.captain.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeCount   = barangays.filter((b) => b.status === "active").length;
  const inactiveCount = barangays.filter((b) => b.status === "inactive").length;

  function openAdd() { setForm(EMPTY_BARANGAY_FORM); setFormErrors({}); setModalOpen(true); }

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
      { id: `ba${Date.now()}`, name: form.name, captain: form.captain, email: form.email,
        totalBins: 0, activeResidents: 0, status: "active",
        lastActivity: new Date().toISOString().split("T")[0] },
    ]);
    setModalOpen(false);
  }

  function handleDelete(id) { setBarangays((p) => p.filter((b) => b.id !== id)); setDeleteTarget(null); }

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {[
            { label: "Total",    value: barangays.length, bg: colors.gray100, color: colors.gray700 },
            { label: "Active",   value: activeCount,      bg: colors.accentSoft, color: colors.primary },
            { label: "Inactive", value: inactiveCount,    bg: colors.errorSoft, color: colors.error },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: s.bg, border: "1px solid " + colors.gray200 }}>
              <span className="font-bold" style={{ fontSize: 18, color: s.color }}>{s.value}</span>
              <span className="font-medium text-text-secondary" style={{ fontSize: 13 }}>{s.label}</span>
            </div>
          ))}
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 14, background: colors.primary }}>
          <Plus size={15} /> Add Barangay Admin
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex items-center flex-1" style={{ minWidth: 220 }}>
          <svg className="absolute left-3 text-text-muted" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search barangay, captain, email…"
            className="w-full rounded-lg pl-9 pr-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.gray50 }} />
        </div>
        <div className="relative flex items-center">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none rounded-lg pl-3 pr-8 py-2 outline-none font-medium"
            style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.white, color: colors.gray700, minWidth: 140 }}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 pointer-events-none text-text-muted" />
        </div>
        {(filterStatus !== "all" || search) && (
          <button onClick={() => { setFilterStatus("all"); setSearch(""); }}
            className="rounded-lg px-3 py-2 font-medium hover:bg-red-50 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #FECACA", color: colors.error, background: colors.errorSoft }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: colors.gray50, borderBottom: "1px solid " + colors.gray200 }}>
              {["Barangay Name", "Captain / Contact", "Email", "Total Bins", "Active Residents", "Status", "Last Activity", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                  style={{ fontSize: 11, color: colors.gray500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-text-muted py-10" style={{ fontSize: 14 }}>
                No barangay admin accounts match your filters.
              </td></tr>
            ) : filtered.map((b, i) => (
              <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : colors.tableRowAlt, borderBottom: "1px solid #F3F4F6" }}>
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
                    style={{ fontSize: 12, color: colors.error, border: "1px solid #FECACA" }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Barangay Admin Account"
        footer={<>
          <button onClick={() => setModalOpen(false)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>Cancel</button>
          <button onClick={handleSave}
            className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: colors.primary }}>Create Account</button>
        </>}>
        <div className="flex flex-col gap-4">
          <FormField label="Barangay Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            error={formErrors.name} placeholder="e.g. Brgy. Kumintang Ibaba" />
          <FormField label="Contact Person / Captain" value={form.captain}
            onChange={(v) => setForm((p) => ({ ...p, captain: v }))}
            error={formErrors.captain} placeholder="e.g. Jose Reyes" />
          <FormField label="Email Address" type="email" value={form.email}
            onChange={(v) => setForm((p) => ({ ...p, email: v }))}
            error={formErrors.email} placeholder="barangay@besmart.gov.ph" />
          <FormField label="Temporary Password" type="password" value={form.tempPassword}
            onChange={(v) => setForm((p) => ({ ...p, tempPassword: v }))}
            error={formErrors.tempPassword} placeholder="Min. 8 characters" />
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Barangay Admin Account"
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
              <p style={{ fontSize: 13, color: colors.errorDark }}>This will permanently delete the account. This action cannot be undone.</p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[
                { label: "Barangay Name", value: deleteTarget.name },
                { label: "Captain",       value: deleteTarget.captain },
                { label: "Email",         value: deleteTarget.email },
                { label: "Status",        value: deleteTarget.status === "active" ? "Active" : "Inactive" },
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
