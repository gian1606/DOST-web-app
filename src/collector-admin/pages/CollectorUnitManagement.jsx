import { useState } from "react";
import { Plus, Trash2, Users, Truck, ChevronDown, ChevronUp } from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import { COLLECTOR_UNITS, COLLECTORS } from "../../mock/data";

const EMPTY_UNIT_FORM = { name: "", plateNumber: "" };

export default function CACollectorUnitManagement() {
  const [units, setUnits] = useState(COLLECTOR_UNITS);
  const [collectors, setCollectors] = useState(COLLECTORS);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [unitForm, setUnitForm] = useState(EMPTY_UNIT_FORM);
  const [unitErrors, setUnitErrors] = useState({});
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetUnit, setAssignTargetUnit] = useState(null);
  const [selectedCollector, setSelectedCollector] = useState("");
  const [assignError, setAssignError] = useState("");

  function openAddUnit() { setUnitForm(EMPTY_UNIT_FORM); setUnitErrors({}); setUnitModalOpen(true); }

  function validateUnit() {
    const e = {};
    if (!unitForm.name.trim()) e.name = "Unit name is required.";
    if (!unitForm.plateNumber.trim()) e.plateNumber = "Plate number is required.";
    return e;
  }

  function handleSaveUnit() {
    const e = validateUnit();
    if (Object.keys(e).length) { setUnitErrors(e); return; }
    setUnits((prev) => [...prev, { id: `ct${Date.now()}`, name: unitForm.name, plateNumber: unitForm.plateNumber, cluster: "c1", status: "at_depot", collectorIds: [], posX: 0.15, posY: 0.90 }]);
    setUnitModalOpen(false);
  }

  function handleDeleteUnit(id) {
    setUnits((prev) => prev.filter((u) => u.id !== id));
    setCollectors((prev) => prev.map((c) => c.assignedTruck === id ? { ...c, assignedTruck: null } : c));
  }

  function openAssignModal(unit) { setAssignTargetUnit(unit); setSelectedCollector(""); setAssignError(""); setAssignModalOpen(true); }

  function handleAssignCollector() {
    if (!selectedCollector) { setAssignError("Please select a collector."); return; }
    setAssignError("");
    setUnits((prev) => prev.map((u) => u.id === assignTargetUnit.id ? { ...u, collectorIds: [...new Set([...u.collectorIds, selectedCollector])] } : u));
    setCollectors((prev) => prev.map((c) => c.id === selectedCollector ? { ...c, assignedTruck: assignTargetUnit.id } : c));
    setAssignModalOpen(false);
  }

  function handleRemoveCollector(unitId, collectorId) {
    setUnits((prev) => prev.map((u) => u.id === unitId ? { ...u, collectorIds: u.collectorIds.filter((id) => id !== collectorId) } : u));
    setCollectors((prev) => prev.map((c) => c.id === collectorId ? { ...c, assignedTruck: null } : c));
  }

  const getAvailableCollectors = (unit) => collectors.filter((c) => c.status === "active" && !unit.collectorIds.includes(c.id));
  const getUnitCollectors = (unit) => collectors.filter((c) => unit.collectorIds.includes(c.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Collector Unit Management</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>Manage garbage trucks and assign collectors — Cluster 1</p>
        </div>
        <button onClick={openAddUnit} className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity" style={{ fontSize: 14, background: "#2E7D32" }}><Plus size={15} />Create Collector Unit</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Units",        value: units.length,                                                color: "#1A1A1A", bg: "#F9FAFB" },
          { label: "En Route",           value: units.filter((u) => u.status === "en_route").length,         color: "#1976D2", bg: "#E3F2FD" },
          { label: "Idle / At Depot",    value: units.filter((u) => u.status !== "en_route").length,         color: "#6B7280", bg: "#F3F4F6" },
          { label: "Collectors Assigned",value: units.reduce((sum, u) => sum + u.collectorIds.length, 0),    color: "#2E7D32", bg: "#E8F5E9" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ background: s.bg, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="font-bold" style={{ fontSize: 28, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            <div className="text-text-secondary" style={{ fontSize: 13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {units.length === 0 && <div className="bg-white rounded-xl flex items-center justify-center py-16 text-text-muted" style={{ border: "1px solid #E5E7EB", fontSize: 14 }}>No collector units yet. Create one to get started.</div>}
        {units.map((unit) => {
          const unitCollectors = getUnitCollectors(unit);
          const isExpanded = expandedUnit === unit.id;
          return (
            <div key={unit.id} className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 44, height: 44, background: "#E8F5E9" }}><Truck size={22} color="#2E7D32" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary" style={{ fontSize: 16 }}>{unit.name}</span>
                    <span className="rounded-full px-2.5 py-0.5 font-medium" style={{ fontSize: 12, background: "#F3F4F6", color: "#6B7280" }}>{unit.plateNumber}</span>
                    <StatusBadge status={unit.status} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5" style={{ fontSize: 13, color: "#6B7280" }}>
                    <Users size={13} />
                    <span>{unitCollectors.length} collector{unitCollectors.length !== 1 ? "s" : ""} assigned</span>
                    {unitCollectors.length > 0 && <span className="text-text-muted">— {unitCollectors.map((c) => c.name.split(" ")[0]).join(", ")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openAssignModal(unit)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors" style={{ fontSize: 13, border: "1.5px solid #2E7D32", color: "#2E7D32", background: "#fff" }}><Plus size={13} />Add Collector</button>
                  <button onClick={() => handleDeleteUnit(unit.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete unit"><Trash2 size={15} color="#DC2626" /></button>
                  <button onClick={() => setExpandedUnit(isExpanded ? null : unit.id)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">{isExpanded ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}</button>
                </div>
              </div>
              {isExpanded && (
                <div className="border-t" style={{ borderColor: "#F3F4F6" }}>
                  {unitCollectors.length === 0
                    ? <div className="flex items-center justify-center py-8 text-text-muted" style={{ fontSize: 13 }}>No collectors assigned to this unit yet.</div>
                    : <table className="w-full border-collapse">
                        <thead><tr style={{ background: "#F9FAFB" }}>{["Collector Name","Email","Status","Last Login","Action"].map((h) => <th key={h} className="text-left font-semibold uppercase tracking-wide px-5 py-2.5" style={{ fontSize: 11, color: "#6B7280" }}>{h}</th>)}</tr></thead>
                        <tbody>
                          {unitCollectors.map((c) => (
                            <tr key={c.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: "#F3F4F6" }}>
                              <td className="px-5 py-3 font-medium text-text-primary" style={{ fontSize: 13 }}>{c.name}</td>
                              <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>{c.email}</td>
                              <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                              <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>{c.lastLogin ? new Date(c.lastLogin).toLocaleDateString("en-PH", { month: "short", day: "numeric" }) : "Never"}</td>
                              <td className="px-5 py-3"><button onClick={() => handleRemoveCollector(unit.id, c.id)} className="text-error font-medium hover:underline" style={{ fontSize: 12 }}>Remove</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={unitModalOpen} onClose={() => setUnitModalOpen(false)} title="Create Collector Unit"
        footer={<><button onClick={() => setUnitModalOpen(false)} className="rounded-lg px-4 py-2 font-medium" style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button><button onClick={handleSaveUnit} className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90" style={{ fontSize: 14, background: "#2E7D32" }}>Create Unit</button></>}
      >
        <div className="flex flex-col gap-4">
          <FormField label="Unit Name" value={unitForm.name} onChange={(v) => setUnitForm((p) => ({ ...p, name: v }))} error={unitErrors.name} placeholder="e.g. Unit Alpha" />
          <FormField label="Plate Number" value={unitForm.plateNumber} onChange={(v) => setUnitForm((p) => ({ ...p, plateNumber: v }))} error={unitErrors.plateNumber} placeholder="e.g. BTC-1021" />
          <div className="flex flex-col gap-1"><label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Cluster</label><input value="Cluster 1 (North Zone)" disabled className="rounded-lg px-3 py-2.5" style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F3F4F6", color: "#9CA3AF" }} /></div>
        </div>
      </Modal>

      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} title={`Add Collector to ${assignTargetUnit?.name ?? ""}`}
        footer={<><button onClick={() => setAssignModalOpen(false)} className="rounded-lg px-4 py-2 font-medium" style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button><button onClick={handleAssignCollector} className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90" style={{ fontSize: 14, background: "#2E7D32" }}>Assign Collector</button></>}
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary" style={{ fontSize: 13 }}>Select an active collector to assign to this unit. Only unassigned collectors are shown.</p>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Collector</label>
            <select value={selectedCollector} onChange={(e) => { setSelectedCollector(e.target.value); setAssignError(""); }} className="rounded-lg px-3 py-2.5 outline-none" style={{ fontSize: 14, border: assignError ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}>
              <option value="">Select a collector…</option>
              {assignTargetUnit && getAvailableCollectors(assignTargetUnit).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {assignError && <span style={{ fontSize: 12, color: "#DC2626" }}>{assignError}</span>}
            {assignTargetUnit && getAvailableCollectors(assignTargetUnit).length === 0 && <span style={{ fontSize: 12, color: "#9CA3AF" }}>No available collectors. Add collectors in User Management first.</span>}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FormField({ label, value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-lg px-3 py-2.5 outline-none" style={{ fontSize: 14, border: error ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
      {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
    </div>
  );
}

