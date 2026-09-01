import { useState } from "react";
import { Plus, Pencil, Trash2, Gift, PackageX } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import Modal from "../components/ui/Modal";
import { REWARDS } from "../mock/data";

const EMPTY_FORM = {
  name: "",
  pointsCost: "",
  stock: "",
  status: "available",
  description: "",
};

export default function Rewards() {
  const [rewards, setRewards] = useState(REWARDS);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null); // reward to delete
  const [editReward, setEditReward] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  function openAdd() {
    setEditReward(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(reward) {
    setEditReward(reward);
    setForm({
      name: reward.name,
      pointsCost: String(reward.pointsCost),
      stock: String(reward.stock),
      status: reward.status,
      description: reward.description,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm() {
    const e = {};
    if (!form.name.trim()) e.name = "Reward name is required.";
    if (!form.pointsCost || isNaN(Number(form.pointsCost)) || Number(form.pointsCost) <= 0)
      e.pointsCost = "Enter a valid points cost (> 0).";
    if (form.stock === "" || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = "Enter a valid stock quantity (≥ 0).";
    if (!form.description.trim()) e.description = "Description is required.";
    return e;
  }

  function handleSave() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }

    if (editReward) {
      setRewards((prev) =>
        prev.map((r) =>
          r.id === editReward.id
            ? {
                ...r,
                name: form.name,
                pointsCost: Number(form.pointsCost),
                stock: Number(form.stock),
                status: form.status,
                description: form.description,
              }
            : r
        )
      );
    } else {
      const newReward = {
        id: `rw${Date.now()}`,
        name: form.name,
        pointsCost: Number(form.pointsCost),
        stock: Number(form.stock),
        status: form.status,
        description: form.description,
      };
      setRewards((prev) => [...prev, newReward]);
    }
    setModalOpen(false);
  }

  function handleDelete(id) {
    setRewards((prev) => prev.filter((r) => r.id !== id));
    setDeleteModal(null);
  }

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
          style={{ fontSize: 14, background: "#2E7D32" }}
        >
          <Plus size={15} />
          Add Reward
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-3">
        <SummaryChip
          icon={<Gift size={14} color="#2E7D32" />}
          label="Total Rewards"
          value={rewards.length}
          bg="#E8F5E9"
          color="#2E7D32"
        />
        <SummaryChip
          icon={<Gift size={14} color="#1976D2" />}
          label="Available"
          value={rewards.filter((r) => r.status === "available").length}
          bg="#E3F2FD"
          color="#1976D2"
        />
        <SummaryChip
          icon={<PackageX size={14} color="#D97706" />}
          label="Out of Stock"
          value={rewards.filter((r) => r.stock === 0).length}
          bg="#FFF3E0"
          color="#D97706"
        />
      </div>

      {/* Rewards grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {rewards.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl p-5 flex flex-col gap-3"
            style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            {/* Icon + status */}
            <div className="flex items-start justify-between">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ width: 44, height: 44, background: "#E8F5E9" }}
              >
                <Gift size={22} color="#2E7D32" />
              </div>
              <StatusBadge status={r.status} />
            </div>

            {/* Name & description */}
            <div>
              <div className="font-bold text-text-primary" style={{ fontSize: 16 }}>
                {r.name}
              </div>
              <div className="text-text-secondary mt-0.5" style={{ fontSize: 13, lineHeight: 1.5 }}>
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
              <div
                className="w-px self-stretch"
                style={{ background: "#E5E7EB" }}
              />
              <div>
                <div
                  className="font-bold"
                  style={{ fontSize: 20, color: r.stock === 0 ? "#DC2626" : "#1A1A1A" }}
                >
                  {r.stock}
                </div>
                <div className="text-text-muted" style={{ fontSize: 11 }}>
                  In Stock
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: "#F3F4F6" }}>
              <button
                onClick={() => openEdit(r)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-gray-100"
                style={{ fontSize: 13, color: "#6B7280" }}
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                onClick={() => setDeleteModal(r)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-red-50 ml-auto"
                style={{ fontSize: 13, color: "#DC2626" }}
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editReward ? "Edit Reward" : "Add New Reward"}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 font-medium transition-colors"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, background: "#2E7D32" }}
            >
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
                border: "1.5px solid #E5E7EB",
                background: "#F9FAFB",
                color: "#1A1A1A",
              }}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Reward"
        footer={
          <>
            <button
              onClick={() => setDeleteModal(null)}
              className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteModal.id)}
              className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90"
              style={{ fontSize: 14, background: "#DC2626" }}
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-text-secondary" style={{ fontSize: 14 }}>
          Are you sure you want to delete{" "}
          <strong className="text-text-primary">{deleteModal?.name}</strong>? This action
          cannot be undone.
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

function FormField({ label, type = "text", value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg px-3 py-2.5 outline-none"
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

