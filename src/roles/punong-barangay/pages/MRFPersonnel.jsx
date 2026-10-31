import { colors } from "../../../theme/colors.js";
import { useState, useEffect } from "react";
import { Plus, Trash2, Info, Pencil, Loader2 } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import FormField from "../../../components/ui/FormField.jsx";
import { MRF_FACILITIES } from "../../../constants/index.js";
import {
  getMrfWorkers,
  createMrfWorker,
  updateMrfWorker,
  deleteMrfWorker,
} from "../../../services/users.js";

const EMPTY_FORM = { name: "", email: "", mrf: "", tempPassword: "" };

export default function MRFPersonnel() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState(null);

  // Add modal
  const [addOpen, setAddOpen]       = useState(false);
  const [addForm, setAddForm]       = useState(EMPTY_FORM);
  const [addErrors, setAddErrors]   = useState({});
  const [addSaving, setAddSaving]   = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState({ name: "", email: "", mrf: "" });
  const [editErrors, setEditErrors] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      setApiError(null);
      try {
        const data = await getMrfWorkers();
        setUsers(data);
      } catch (err) {
        setApiError(err.message || "Failed to load MRF personnel.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function formatLastLogin(ts) {
    if (!ts) return "Never";
    return new Date(ts).toLocaleDateString("en-PH", {
      month: "short", day: "numeric", year: "numeric",
    });
  }

  function mrfNameFromBarangay(barangay) {
    const found = MRF_FACILITIES.find((f) => f.barangay === barangay);
    return found ? found.name : barangay;
  }

  // ── Add ────────────────────────────────────────────────────────────────────
  function openAdd() {
    setAddForm(EMPTY_FORM);
    setAddErrors({});
    setApiError(null);
    setAddOpen(true);
  }

  function validateAddForm() {
    const e = {};
    if (!addForm.name.trim())  e.name = "Name is required.";
    if (!addForm.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email))
      e.email = "Enter a valid email.";
    if (!addForm.mrf)          e.mrf = "Assign an MRF facility.";
    if (!addForm.tempPassword) e.tempPassword = "Temporary password is required.";
    else if (addForm.tempPassword.length < 8)
      e.tempPassword = "Password must be at least 8 characters.";
    return e;
  }

  async function handleAdd() {
    const e = validateAddForm();
    if (Object.keys(e).length) { setAddErrors(e); return; }

    const facility = MRF_FACILITIES.find((f) => f.name === addForm.mrf);
    setAddSaving(true);
    setApiError(null);
    try {
      const created = await createMrfWorker({
        name: addForm.name,
        email: addForm.email,
        barangay: facility ? facility.barangay : addForm.mrf,
        tempPassword: addForm.tempPassword,
      });
      setUsers((prev) => [...prev, created]);
      setAddOpen(false);
    } catch (err) {
      setApiError(err.message || "Failed to create account.");
    } finally {
      setAddSaving(false);
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  function openEdit(user) {
    setEditTarget(user);
    setEditForm({
      name:  user.name,
      email: user.email,
      mrf:   mrfNameFromBarangay(user.mrf),
    });
    setEditErrors({});
    setApiError(null);
  }

  function validateEditForm() {
    const e = {};
    if (!editForm.name.trim())  e.name = "Name is required.";
    if (!editForm.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email))
      e.email = "Enter a valid email.";
    if (!editForm.mrf)          e.mrf = "Assign an MRF facility.";
    return e;
  }

  async function handleEdit() {
    const e = validateEditForm();
    if (Object.keys(e).length) { setEditErrors(e); return; }

    const facility = MRF_FACILITIES.find((f) => f.name === editForm.mrf);
    setEditSaving(true);
    setApiError(null);
    try {
      const updated = await updateMrfWorker(editTarget.id, {
        name:     editForm.name,
        email:    editForm.email,
        barangay: facility ? facility.barangay : editForm.mrf,
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditTarget(null);
    } catch (err) {
      setApiError(err.message || "Failed to update account.");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setApiError(null);
    try {
      await deleteMrfWorker(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setApiError(err.message || "Failed to delete account.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Shared MRF select ──────────────────────────────────────────────────────
  function MRFSelect({ value, onChange, error }) {
    return (
      <div className="flex flex-col gap-1">
        <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
          Assigned MRF Facility
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg px-3 py-2.5 outline-none"
          style={{
            fontSize: 14,
            border: error
              ? `1.5px solid ${colors.error}`
              : `1.5px solid ${colors.gray200}`,
            background: colors.gray50,
            color: colors.textHeading,
          }}
        >
          <option value="">Select an MRF facility…</option>
          {MRF_FACILITIES.map((m) => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
        {error && <span style={{ fontSize: 12, color: colors.error }}>{error}</span>}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>
            MRF Personnel
          </h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            Manage accounts for Material Recovery Facility staff.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 14, background: colors.primary }}
        >
          <Plus size={15} />
          Add MRF Account
        </button>
      </div>

      {/* Privacy notice */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{
          background: colors.infoSoft,
          border: `1px solid ${colors.infoBorder}`,
        }}
      >
        <Info size={16} color={colors.recyclable} className="flex-shrink-0 mt-0.5" />
        <p style={{ fontSize: 13, color: colors.blueDark }}>
          Only MRF personnel accounts are managed here. Resident data is private
          and restricted from this view.
        </p>
      </div>

      {/* API error banner */}
      {apiError && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3"
          style={{
            background: colors.errorSoft,
            border: `1px solid ${colors.errorBorder}`,
          }}
        >
          <p style={{ fontSize: 13, color: colors.errorDark }}>{apiError}</p>
        </div>
      )}

      {/* Table */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{
          border: `1px solid ${colors.gray200}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr
              style={{
                background: colors.gray50,
                borderBottom: `1px solid ${colors.gray200}`,
              }}
            >
              {["Name", "Role", "Assigned MRF", "Email", "Status", "Last Login", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                    style={{ fontSize: 12, color: colors.gray500 }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-text-secondary">
                    <Loader2 size={18} className="animate-spin" />
                    <span style={{ fontSize: 14 }}>Loading…</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-text-secondary"
                  style={{ fontSize: 14 }}
                >
                  No MRF personnel accounts yet. Click "Add MRF Account" to create one.
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    background: i % 2 === 0 ? "#fff" : colors.tableRowAlt,
                    borderBottom: `1px solid ${colors.gray100}`,
                  }}
                >
                  <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>
                    MRF Personnel
                  </td>
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>
                    {mrfNameFromBarangay(u.mrf)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.isActive ? "active" : "inactive"} />
                  </td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>
                    {formatLastLogin(u.lastLogin)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(u)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-blue-50"
                        style={{
                          fontSize: 12,
                          color: colors.recyclable,
                          border: `1px solid ${colors.infoBorder}`,
                        }}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-red-50"
                        style={{
                          fontSize: 12,
                          color: colors.error,
                          border: `1px solid ${colors.inputErrorBorder}`,
                        }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── ADD MODAL ──────────────────────────────────────────────────────── */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add MRF Account"
        footer={
          <>
            <button
              onClick={() => setAddOpen(false)}
              className="rounded-lg px-4 py-2 font-medium"
              style={{
                fontSize: 14,
                border: `1.5px solid ${colors.gray200}`,
                color: colors.gray500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={addSaving}
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ fontSize: 14, background: colors.primary }}
            >
              {addSaving && <Loader2 size={14} className="animate-spin" />}
              Create Account
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField
            label="Full Name"
            value={addForm.name}
            onChange={(v) => setAddForm((p) => ({ ...p, name: v }))}
            error={addErrors.name}
            placeholder="e.g. Roberto Navarro"
          />
          <FormField
            label="Email Address"
            type="email"
            value={addForm.email}
            onChange={(v) => setAddForm((p) => ({ ...p, email: v }))}
            error={addErrors.email}
            placeholder="roberto.navarro@besmart.gov.ph"
          />
          <MRFSelect
            value={addForm.mrf}
            onChange={(v) => setAddForm((p) => ({ ...p, mrf: v }))}
            error={addErrors.mrf}
          />
          <FormField
            label="Temporary Password"
            type="password"
            value={addForm.tempPassword}
            onChange={(v) => setAddForm((p) => ({ ...p, tempPassword: v }))}
            error={addErrors.tempPassword}
            placeholder="Min. 8 characters"
          />
        </div>
      </Modal>

      {/* ── EDIT MODAL ─────────────────────────────────────────────────────── */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit MRF Account"
        footer={
          <>
            <button
              onClick={() => setEditTarget(null)}
              className="rounded-lg px-4 py-2 font-medium"
              style={{
                fontSize: 14,
                border: `1.5px solid ${colors.gray200}`,
                color: colors.gray500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={editSaving}
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ fontSize: 14, background: colors.primary }}
            >
              {editSaving && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField
            label="Full Name"
            value={editForm.name}
            onChange={(v) => setEditForm((p) => ({ ...p, name: v }))}
            error={editErrors.name}
          />
          <FormField
            label="Email Address"
            type="email"
            value={editForm.email}
            onChange={(v) => setEditForm((p) => ({ ...p, email: v }))}
            error={editErrors.email}
          />
          <MRFSelect
            value={editForm.mrf}
            onChange={(v) => setEditForm((p) => ({ ...p, mrf: v }))}
            error={editErrors.mrf}
          />
        </div>
      </Modal>

      {/* ── DELETE CONFIRMATION MODAL ──────────────────────────────────────── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete MRF Account"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg px-4 py-2 font-medium"
              style={{
                fontSize: 14,
                border: `1.5px solid ${colors.gray200}`,
                color: colors.gray500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ fontSize: 14, background: colors.error }}
            >
              {deleteLoading
                ? <Loader2 size={14} className="animate-spin" />
                : <Trash2 size={14} />}
              Delete
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <div
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{
                background: colors.errorSoft,
                border: `1px solid ${colors.errorBorder}`,
              }}
            >
              <Trash2 size={16} color={colors.error} className="flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: 13, color: colors.errorDark }}>
                This will permanently delete the account. This action cannot be undone.
              </p>
            </div>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${colors.gray100}` }}
            >
              {[
                { label: "Name",         value: deleteTarget.name  },
                { label: "Email",        value: deleteTarget.email },
                { label: "Assigned MRF", value: mrfNameFromBarangay(deleteTarget.mrf) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-2.5 border-b last:border-0"
                  style={{ borderColor: colors.gray100 }}
                >
                  <span className="text-text-muted font-medium" style={{ fontSize: 13 }}>
                    {label}
                  </span>
                  <span className="text-text-primary font-semibold" style={{ fontSize: 13 }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
