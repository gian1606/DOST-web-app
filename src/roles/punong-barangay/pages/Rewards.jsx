import { colors } from "../../../theme/colors.js";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Gift, PackageX, Loader2 } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import FormField from "../../../components/ui/FormField.jsx";
import {
  fetchRewards,
  createReward,
  updateReward,
  deleteReward,
} from "../../../services/rewards.js";

const EMPTY_FORM = {
  name:        "",
  pointsCost:  "",
  stock:       "",
  status:      "available",
  description: "",
};

export default function Rewards() {
  const [rewards, setRewards]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [apiError, setApiError]   = useState(null);

  // Add / Edit modal
  const [modalOpen, setModalOpen]   = useState(false);
  const [editReward, setEditReward] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]         = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal]     = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch on mount ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      setApiError(null);
      try {
        const data = await fetchRewards();
        setRewards(data);
      } catch (err) {
        setApiError(err.message || "Failed to load rewards.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Modal helpers ────────────────────────────────────────────────────────────
  function openAdd() {
    setEditReward(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setApiError(null);
    setModalOpen(true);
  }

  function openEdit(reward) {
    setEditReward(reward);
    setForm({
      name:        reward.name,
      pointsCost:  String(reward.pointsCost),
      stock:       String(reward.stock),
      status:      reward.status,
      description: reward.description,
    });
    setFormErrors({});
    setApiError(null);
    setModalOpen(true);
  }

  // ── Validation ───────────────────────────────────────────────────────────────
  function validateForm() {
    const e = {};
    if (!form.name.trim())
      e.name = "Reward name is required.";
    if (!form.pointsCost || isNaN(Number(form.pointsCost)) || Number(form.pointsCost) <= 0)
      e.pointsCost = "Enter a valid points cost (> 0).";
    if (form.stock === "" || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = "Enter a valid stock quantity (≥ 0).";
    if (!form.description.trim())
      e.description = "Description is required.";
    return e;
  }

  // ── Save (create or update) ──────────────────────────────────────────────────
  async function handleSave() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }

    const payload = {
      name:        form.name,
      description: form.description,
      pointsCost:  Number(form.pointsCost),
      stock:       Number(form.stock),
      status:      form.status,
    };

    setSaving(true);
    setApiError(null);
    try {
      if (editReward) {
        const updated = await updateReward(editReward.id, payload);
        setRewards((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        const created = await createReward(payload);
        setRewards((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      setApiError(err.message || "Failed to save reward.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteModal) return;
    setDeleteLoading(true);
    setApiError(null);
    try {
      await deleteReward(deleteModal.id);
      setRewards((prev) => prev.filter((r) => r.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      setApiError(err.message || "Failed to delete reward.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>
            Rewards Management
          </h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            Manage redeemable incentives for barangay residents.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 14, background: colors.primary }}
        >
          <Plus size={15} />
          Add Reward
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-3">
        <SummaryChip
          icon={<Gift size={14} color={colors.primary} />}
          label="Total Rewards"
          value={rewards.length}
          bg={colors.accentSoft}
          color={colors.primary}
        />
        <SummaryChip
          icon={<Gift size={14} color={colors.recyclable} />}
          label="Available"
          value={rewards.filter((r) => r.status === "available").length}
          bg={colors.infoSoft}
          color={colors.recyclable}
        />
        <SummaryChip
          icon={<PackageX size={14} color={colors.warning} />}
          label="Out of Stock"
          value={rewards.filter((r) => r.stock === 0).length}
          bg={colors.warningSoft}
          color={colors.warning}
        />
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

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 size={20} className="animate-spin" />
            <span style={{ fontSize: 14 }}>Loading rewards…</span>
          </div>
        </div>
      ) : rewards.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-text-secondary" style={{ fontSize: 14 }}>
            No rewards yet. Click "Add Reward" to create one.
          </p>
        </div>
      ) : (
        /* Rewards grid */
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {rewards.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl p-5 flex flex-col gap-3"
              style={{
                border: `1px solid ${colors.gray200}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* Icon + status */}
              <div className="flex items-start justify-between">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: 44, height: 44, background: colors.accentSoft }}
                >
                  <Gift size={22} color={colors.primary} />
                </div>
                <StatusBadge status={r.status} />
              </div>

              {/* Name & description */}
              <div>
                <div className="font-bold text-text-primary" style={{ fontSize: 16 }}>
                  {r.name}
                </div>
                <div
                  className="text-text-secondary mt-0.5"
                  style={{ fontSize: 13, lineHeight: 1.5 }}
                >
                  {r.description}
                </div>
              </div>

              {/* Points & stock */}
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-bold text-primary" style={{ fontSize: 20 }}>
                    {r.pointsCost}
                  </div>
                  <div className="text-text-muted" style={{ fontSize: 11 }}>
                    Eco Points
                  </div>
                </div>
                <div className="w-px self-stretch" style={{ background: colors.gray200 }} />
                <div>
                  <div
                    className="font-bold"
                    style={{
                      fontSize: 20,
                      color: r.stock === 0 ? colors.error : colors.textHeading,
                    }}
                  >
                    {r.stock}
                  </div>
                  <div className="text-text-muted" style={{ fontSize: 11 }}>
                    In Stock
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-2 pt-1 border-t"
                style={{ borderColor: colors.gray100 }}
              >
                <button
                  onClick={() => openEdit(r)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-gray-100"
                  style={{ fontSize: 13, color: colors.gray500 }}
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteModal(r)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-red-50 ml-auto"
                  style={{ fontSize: 13, color: colors.error }}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ──────────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editReward ? "Edit Reward" : "Add New Reward"}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 font-medium transition-colors"
              style={{
                fontSize: 14,
                border: `1.5px solid ${colors.gray200}`,
                color: colors.gray500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ fontSize: 14, background: colors.primary }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editReward ? "Save Changes" : "Add Reward"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField
            label="Reward Name"
            value={form.name}
            onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            error={formErrors.name}
            placeholder="e.g. Eco Bag"
          />
          <FormField
            label="Description"
            value={form.description}
            onChange={(v) => setForm((p) => ({ ...p, description: v }))}
            error={formErrors.description}
            placeholder="Brief description of the reward"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Points Cost"
              type="number"
              value={form.pointsCost}
              onChange={(v) => setForm((p) => ({ ...p, pointsCost: v }))}
              error={formErrors.pointsCost}
              placeholder="e.g. 50"
            />
            <FormField
              label="Stock Quantity"
              type="number"
              value={form.stock}
              onChange={(v) => setForm((p) => ({ ...p, stock: v }))}
              error={formErrors.stock}
              placeholder="e.g. 30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
              Availability
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="rounded-lg px-3 py-2.5 outline-none"
              style={{
                fontSize: 14,
                border: `1.5px solid ${colors.gray200}`,
                background: colors.gray50,
                color: colors.textHeading,
              }}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────────────────── */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Reward"
        footer={
          <>
            <button
              onClick={() => setDeleteModal(null)}
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
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              style={{ fontSize: 14, background: colors.error }}
            >
              {deleteLoading && <Loader2 size={14} className="animate-spin" />}
              Delete
            </button>
          </>
        }
      >
        <p className="text-text-secondary" style={{ fontSize: 14 }}>
          Are you sure you want to delete{" "}
          <strong className="text-text-primary">{deleteModal?.name}</strong>? The reward
          will be deactivated and hidden from residents.
        </p>
      </Modal>
    </div>
  );
}

function SummaryChip({ icon, label, value, bg, color }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-4 py-2.5"
      style={{ background: bg, border: `1px solid ${color}22` }}
    >
      {icon}
      <span className="font-semibold" style={{ fontSize: 14, color }}>
        {value}
      </span>
      <span style={{ fontSize: 13, color }}>{label}</span>
    </div>
  );
}
