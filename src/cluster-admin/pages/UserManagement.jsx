import { useState } from "react";
import { Plus, Trash2, Truck } from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import { COLLECTORS, CLUSTER_INFO, BARANGAYS } from "../mock/data";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TRUCKS_LIST = ["Truck 01", "Truck 02", "Truck 03", "Truck 04", "Truck 05"];

const EMPTY_FORM = { name: "", collectorId: "", assignedTruck: "", zone: "", schedule: "", tempPassword: "" };

const SUMMARY = { activeTrucks: 3, totalTrucks: 5, totalCollectors: COLLECTORS.length };

export default function UserManagement() {
  const [collectors, setCollectors] = useState(COLLECTORS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  function openAdd() { setForm(EMPTY_FORM); setFormErrors({}); setModalOpen(true); }

  function validateForm() {
    const e = {};
    if (!form.name.trim())        e.name        = "Name is required.";
    if (!form.collectorId.trim()) e.collectorId = "Collector ID is required.";
    if (!form.assignedTruck)      e.assignedTruck = "Assign a truck.";
    if (!form.tempPassword)       e.tempPassword  = "Temporary password is required.";
    return e;
  }

  function handleSave() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setCollectors((prev) => [
      ...prev,
      { id: `col${Date.now()}`, name: form.name, collectorId: form.collectorId, assignedTruck: form.assignedTruck, zone: form.zone, status: "active", schedule: form.schedule, lastActive: new Date().toISOString() },
    ]);
    setModalOpen(false);
  }

  function handleDelete(id) {
    setCollectors((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
  }

  function formatLastActive(ts) {
    if (!ts) return "Never";
    return new Date(ts).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>User Management</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>Collectors &amp; Drivers — {CLUSTER_INFO.label}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 14, background: "#2E7D32" }}>
          <Plus size={15} /> Add Collector
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-4">
        {[
          { label: "Active Trucks",    value: SUMMARY.activeTrucks,    color: "#2E7D32", bg: "#E8F5E9" },
          { label: "Total Trucks",     value: SUMMARY.totalTrucks,     color: "#1976D2", bg: "#E3F2FD" },
          { label: "Total Collectors", value: SUMMARY.totalCollectors, color: "#6B7280", bg: "#F3F4F6" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{ background: s.bg, border: `1px solid ${s.color}33` }}>
            <Truck size={15} color={s.color} />
            <span className="font-bold" style={{ fontSize: 18, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
            <span className="text-text-secondary font-medium" style={{ fontSize: 13 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Name", "Collector ID", "Assigned Truck", "Zone / Barangay", "Status", "Schedule", "Last Active", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3" style={{ fontSize: 12, color: "#6B7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {collectors.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{c.name}</td>
                <td className="px-4 py-3 text-text-secondary font-mono" style={{ fontSize: 12 }}>{c.collectorId}</td>
                <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{c.assignedTruck}</td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{c.zone}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 12 }}>{c.schedule}</td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 12 }}>{formatLastActive(c.lastActive)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDeleteTarget(c)}
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

      {/* Weekly schedule grid */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "#E5E7EB" }}>
          <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>Weekly Schedule</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <th className="text-left font-semibold uppercase tracking-wide px-4 py-3" style={{ fontSize: 12, color: "#6B7280", minWidth: 140 }}>Collector</th>
                {DAYS.map((d) => (
                  <th key={d} className="text-center font-semibold uppercase tracking-wide px-3 py-3" style={{ fontSize: 12, color: "#6B7280", minWidth: 80 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collectors.map((c, i) => {
                const scheduledDays = c.schedule.split(",")[0].trim();
                return (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                    <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{c.name}</td>
                    {DAYS.map((d) => {
                      const isScheduled =
                        scheduledDays.includes(d) ||
                        (scheduledDays === "Mon–Fri" && ["Mon","Tue","Wed","Thu","Fri"].includes(d)) ||
                        (scheduledDays === "Mon–Sat" && ["Mon","Tue","Wed","Thu","Fri","Sat"].includes(d)) ||
                        (scheduledDays === "Tue–Sat" && ["Tue","Wed","Thu","Fri","Sat"].includes(d));
                      return (
                        <td key={d} className="px-3 py-3 text-center">
                          {isScheduled
                            ? <span className="inline-block rounded-md px-2 py-1 font-medium" style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}>{c.zone.split(" ")[0]}</span>
                            : <span className="inline-block rounded-md px-2 py-1 font-medium" style={{ fontSize: 11, background: "#F3F4F6", color: "#9CA3AF" }}>Rest</span>
                          }
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD MODAL ─────────────────────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Collector"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
            <button onClick={handleSave} className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, background: "#2E7D32" }}>Add Collector</button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Full Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} error={formErrors.name} placeholder="e.g. Pedro Santos" />
          <FormField label="Collector ID" value={form.collectorId} onChange={(v) => setForm((p) => ({ ...p, collectorId: v }))} error={formErrors.collectorId} placeholder="e.g. COL-2024-0042" />
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Assigned Truck</label>
            <select value={form.assignedTruck} onChange={(e) => setForm((p) => ({ ...p, assignedTruck: e.target.value }))}
              className="rounded-lg px-3 py-2.5 outline-none"
              style={{ fontSize: 14, border: formErrors.assignedTruck ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}>
              <option value="">Select a truck…</option>
              {TRUCKS_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {formErrors.assignedTruck && <span style={{ fontSize: 12, color: "#DC2626" }}>{formErrors.assignedTruck}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Zone / Barangay</label>
            <select value={form.zone} onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))}
              className="rounded-lg px-3 py-2.5 outline-none"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}>
              <option value="">Select a barangay…</option>
              {BARANGAYS.map((b) => <option key={b.id} value={b.name.replace("Brgy. ", "")}>{b.name}</option>)}
            </select>
          </div>
          <FormField label="Schedule" value={form.schedule} onChange={(v) => setForm((p) => ({ ...p, schedule: v }))} placeholder="e.g. Mon–Fri, 6:00 AM" />
          <FormField label="Temporary Password" type="password" value={form.tempPassword} onChange={(v) => setForm((p) => ({ ...p, tempPassword: v }))} error={formErrors.tempPassword} placeholder="Min. 8 characters" />
        </div>
      </Modal>

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────────────── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Collector"
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
              <p style={{ fontSize: 13, color: "#B71C1C" }}>This will permanently delete the collector account. This action cannot be undone.</p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[{ label: "Name", value: deleteTarget.name }, { label: "Collector ID", value: deleteTarget.collectorId }, { label: "Assigned Truck", value: deleteTarget.assignedTruck }].map(({ label, value }) => (
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

