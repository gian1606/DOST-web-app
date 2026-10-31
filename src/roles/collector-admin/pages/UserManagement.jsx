import { colors } from "../../../theme/colors.js";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import FormField from "../../../components/ui/FormField.jsx";
import {
  getCollectorsSummary,
  getCollectors,
  createCollector,
  deleteCollector,
} from "../../../services/collectors.js";

const EMPTY_FORM = { name: "", email: "", tempPassword: "" };

export default function CAUserManagement() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [collectors, setCollectors] = useState([]);
  const [summary, setSummary]       = useState({ totalCollectors: 0, active: 0, inactive: 0 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen]       = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]     = useState({});
  const [saving, setSaving]             = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Load data ────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [collectorsData, summaryData] = await Promise.all([
        getCollectors(),
        getCollectorsSummary(),
      ]);
      setCollectors(collectorsData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Create collector ─────────────────────────────────────────────────────────
  function openAdd() { setForm(EMPTY_FORM); setFormErrors({}); setModalOpen(true); }

  function validateForm() {
    const e = {};
    if (!form.name.trim())   e.name  = "Name is required.";
    if (!form.email.trim())  e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.tempPassword)  e.tempPassword = "Temporary password is required.";
    return e;
  }

  async function handleSave() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setSaving(true);
    try {
      const newCollector = await createCollector({
        name:         form.name,
        email:        form.email,
        tempPassword: form.tempPassword,
      });
      setCollectors((prev) => [newCollector, ...prev]);
      setSummary((prev) => ({
        ...prev,
        totalCollectors: prev.totalCollectors + 1,
        active:          prev.active + 1,   // new accounts start active
      }));
      setModalOpen(false);
    } catch (err) {
      setFormErrors({ email: err.message });
    } finally {
      setSaving(false);
    }
  }

  // ── Delete collector ─────────────────────────────────────────────────────────
  async function handleDelete(id) {
    setDeleting(true);
    try {
      await deleteCollector(id);
      const removed = collectors.find((c) => c.id === id);
      setCollectors((prev) => prev.filter((c) => c.id !== id));
      if (removed) {
        setSummary((prev) => ({
          ...prev,
          totalCollectors: prev.totalCollectors - 1,
          active:          removed.status === "active"   ? prev.active   - 1 : prev.active,
          inactive:        removed.status === "inactive" ? prev.inactive - 1 : prev.inactive,
        }));
      }
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const formatLastLogin = (ts) =>
    ts ? new Date(ts).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "Never";

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-text-muted" style={{ fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm"
          style={{ background: colors.errorSoft, color: colors.errorDark, border: "1px solid " + colors.errorBorder }}>
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>User Management</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>Manage collector accounts</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 14, background: colors.primary }}>
          <Plus size={15} /> Add Collector Account
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Collectors", value: summary.totalCollectors, color: colors.textHeading },
          { label: "Active",           value: summary.active,          color: colors.primary     },
          { label: "Inactive",         value: summary.inactive,        color: colors.textMuted   },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="font-bold" style={{ fontSize: 28, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            <div className="text-text-secondary" style={{ fontSize: 13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
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
              ? (
                <tr>
                  <td colSpan={7} className="text-center text-text-muted py-10" style={{ fontSize: 14 }}>
                    No collectors yet.
                  </td>
                </tr>
              )
              : collectors.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : colors.tableRowAlt, borderBottom: "1px solid #F3F4F6" }}>
                  <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>Collector</td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{c.email}</td>
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{c.assignedUnit ?? "—"}</td>
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

      {/* ── Add modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Collector Account"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              style={{ fontSize: 14, background: colors.primary }}>
              {saving ? "Creating…" : "Create Account"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Full Name" value={form.name}
            onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            error={formErrors.name} placeholder="e.g. Ramon Dela Torre" />
          <FormField label="Email Address" type="email" value={form.email}
            onChange={(v) => setForm((p) => ({ ...p, email: v }))}
            error={formErrors.email} placeholder="ramon.delatorre@besmart.gov.ph" />
          <FormField label="Temporary Password" type="password" value={form.tempPassword}
            onChange={(v) => setForm((p) => ({ ...p, tempPassword: v }))}
            error={formErrors.tempPassword} placeholder="Min. 8 characters" />
        </div>
      </Modal>

      {/* ── Delete confirmation modal ── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Collector Account"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>
              Cancel
            </button>
            <button onClick={() => handleDelete(deleteTarget.id)} disabled={deleting}
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
              style={{ fontSize: 14, background: colors.error }}>
              <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: colors.errorSoft, border: "1px solid " + colors.errorBorder }}>
              <Trash2 size={16} color={colors.error} className="flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: 13, color: colors.errorDark }}>
                This will permanently delete the account. This action cannot be undone.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[{ label: "Name", value: deleteTarget.name }, { label: "Email", value: deleteTarget.email }].map(({ label, value }) => (
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
