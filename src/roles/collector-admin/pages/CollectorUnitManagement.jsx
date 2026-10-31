import { colors } from "../../../theme/colors.js";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Users, Truck, ChevronDown, ChevronUp } from "lucide-react";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import FormField from "../../../components/ui/FormField.jsx";
import {
  getCollectorUnitsSummary,
  getCollectorUnits,
  createCollectorUnit,
  deleteCollectorUnit,
  assignCollectorToUnit,
  removeCollectorFromUnit,
} from "../../../services/collectorUnits.js";
import { getCollectors } from "../../../services/collectors.js";

const EMPTY_UNIT_FORM = { name: "", plateNumber: "" };

export default function CACollectorUnitManagement() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [units, setUnits]           = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [summary, setSummary]       = useState({ totalUnits: 0, enRoute: 0, idleOrAtDepot: 0, collectorsAssigned: 0 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [expandedUnit, setExpandedUnit]     = useState(null);
  const [unitModalOpen, setUnitModalOpen]   = useState(false);
  const [unitForm, setUnitForm]             = useState(EMPTY_UNIT_FORM);
  const [unitErrors, setUnitErrors]         = useState({});
  const [unitSaving, setUnitSaving]         = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetUnit, setAssignTargetUnit] = useState(null);
  const [selectedCollector, setSelectedCollector] = useState("");
  const [assignError, setAssignError]       = useState("");
  const [assignSaving, setAssignSaving]     = useState(false);

  // ── Load data ────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [unitsData, collectorsData, summaryData] = await Promise.all([
        getCollectorUnits(),
        getCollectors(),
        getCollectorUnitsSummary(),
      ]);
      setUnits(unitsData);
      setCollectors(collectorsData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Create unit ──────────────────────────────────────────────────────────────
  function openAddUnit() { setUnitForm(EMPTY_UNIT_FORM); setUnitErrors({}); setUnitModalOpen(true); }

  function validateUnit() {
    const e = {};
    if (!unitForm.name.trim())        e.name        = "Unit name is required.";
    if (!unitForm.plateNumber.trim()) e.plateNumber = "Plate number is required.";
    return e;
  }

  async function handleSaveUnit() {
    const e = validateUnit();
    if (Object.keys(e).length) { setUnitErrors(e); return; }
    setUnitSaving(true);
    try {
      const newUnit = await createCollectorUnit({ name: unitForm.name, plateNumber: unitForm.plateNumber });
      setUnits((prev) => [...prev, newUnit]);
      setSummary((prev) => ({
        ...prev,
        totalUnits:    prev.totalUnits + 1,
        idleOrAtDepot: prev.idleOrAtDepot + 1,   // new units start as idle
      }));
      setUnitModalOpen(false);
    } catch (err) {
      setUnitErrors({ plateNumber: err.message });
    } finally {
      setUnitSaving(false);
    }
  }

  // ── Delete unit ──────────────────────────────────────────────────────────────
  async function handleDeleteUnit(unit) {
    try {
      await deleteCollectorUnit(unit.id);
      setUnits((prev) => prev.filter((u) => u.id !== unit.id));
      // Reflect freed collectors in the local list (mark as unassigned)
      setCollectors((prev) =>
        prev.map((c) =>
          unit.collectorIds.includes(c.id)
            ? { ...c, assignedUnit: null, assignedUnitId: null }
            : c
        )
      );
      setSummary((prev) => ({
        ...prev,
        totalUnits:         prev.totalUnits - 1,
        enRoute:            unit.status === "en_route" ? prev.enRoute - 1 : prev.enRoute,
        idleOrAtDepot:      unit.status !== "en_route" ? prev.idleOrAtDepot - 1 : prev.idleOrAtDepot,
        collectorsAssigned: prev.collectorsAssigned - unit.collectorIds.length,
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  // ── Assign collector ─────────────────────────────────────────────────────────
  function openAssignModal(unit) {
    setAssignTargetUnit(unit);
    setSelectedCollector("");
    setAssignError("");
    setAssignModalOpen(true);
  }

  async function handleAssignCollector() {
    if (!selectedCollector) { setAssignError("Please select a collector."); return; }
    setAssignSaving(true);
    try {
      const updatedUnit = await assignCollectorToUnit(assignTargetUnit.id, selectedCollector);
      setUnits((prev) => prev.map((u) => u.id === updatedUnit.id ? updatedUnit : u));
      // Mark the collector as assigned in the local list
      setCollectors((prev) =>
        prev.map((c) =>
          c.id === selectedCollector
            ? { ...c, assignedUnitId: updatedUnit.id, assignedUnit: updatedUnit.name }
            : c
        )
      );
      setSummary((prev) => ({ ...prev, collectorsAssigned: prev.collectorsAssigned + 1 }));
      setAssignModalOpen(false);
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssignSaving(false);
    }
  }

  // ── Remove collector from unit ───────────────────────────────────────────────
  async function handleRemoveCollector(unitId, collectorId) {
    try {
      const updatedUnit = await removeCollectorFromUnit(unitId, collectorId);
      setUnits((prev) => prev.map((u) => u.id === unitId ? updatedUnit : u));
      setCollectors((prev) =>
        prev.map((c) =>
          c.id === collectorId ? { ...c, assignedUnitId: null, assignedUnit: null } : c
        )
      );
      setSummary((prev) => ({ ...prev, collectorsAssigned: prev.collectorsAssigned - 1 }));
    } catch (err) {
      setError(err.message);
    }
  }

  // ── Derived helpers ──────────────────────────────────────────────────────────
  // Collectors who are active and not already in this unit
  const getAvailableCollectors = (unit) =>
    collectors.filter((c) => c.status === "active" && !unit.collectorIds.includes(c.id));

  // Collectors belonging to this unit (from the unit's embedded list)
  const getUnitCollectors = (unit) => unit.collectors ?? [];

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
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: colors.errorSoft, color: colors.errorDark, border: "1px solid " + colors.errorBorder }}>
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Collector Unit Management</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>Manage garbage trucks and assign collectors</p>
        </div>
        <button onClick={openAddUnit} className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity" style={{ fontSize: 14, background: colors.primary }}>
          <Plus size={15} />Create Collector Unit
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Units",         value: summary.totalUnits,         color: colors.textHeading, bg: colors.gray50     },
          { label: "En Route",            value: summary.enRoute,            color: colors.recyclable,  bg: colors.infoSoft   },
          { label: "Idle / At Depot",     value: summary.idleOrAtDepot,      color: colors.gray500,     bg: colors.gray100    },
          { label: "Collectors Assigned", value: summary.collectorsAssigned, color: colors.primary,     bg: colors.accentSoft },
        ].map((s) => (
          <div key={s.label} className="rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ background: s.bg, border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="font-bold" style={{ fontSize: 28, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            <div className="text-text-secondary" style={{ fontSize: 13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Unit list ── */}
      <div className="flex flex-col gap-3">
        {units.length === 0 && (
          <div className="bg-white rounded-xl flex items-center justify-center py-16 text-text-muted"
            style={{ border: "1px solid " + colors.gray200, fontSize: 14 }}>
            No collector units yet. Create one to get started.
          </div>
        )}
        {units.map((unit) => {
          const unitCollectors = getUnitCollectors(unit);
          const isExpanded = expandedUnit === unit.id;
          return (
            <div key={unit.id} className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 44, height: 44, background: colors.accentSoft }}>
                  <Truck size={22} color={colors.primary} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary" style={{ fontSize: 16 }}>{unit.name}</span>
                    <span className="rounded-full px-2.5 py-0.5 font-medium" style={{ fontSize: 12, background: colors.gray100, color: colors.gray500 }}>{unit.plateNumber}</span>
                    <StatusBadge status={unit.status} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5" style={{ fontSize: 13, color: colors.gray500 }}>
                    <Users size={13} />
                    <span>{unitCollectors.length} collector{unitCollectors.length !== 1 ? "s" : ""} assigned</span>
                    {unitCollectors.length > 0 && (
                      <span className="text-text-muted">— {unitCollectors.map((c) => c.name.split(" ")[0]).join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openAssignModal(unit)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors"
                    style={{ fontSize: 13, border: "1.5px solid " + colors.primary, color: colors.primary, background: colors.white }}>
                    <Plus size={13} />Add Collector
                  </button>
                  <button onClick={() => handleDeleteUnit(unit)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete unit">
                    <Trash2 size={15} color={colors.error} />
                  </button>
                  <button onClick={() => setExpandedUnit(isExpanded ? null : unit.id)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    {isExpanded ? <ChevronUp size={16} color={colors.gray500} /> : <ChevronDown size={16} color={colors.gray500} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t" style={{ borderColor: colors.gray100 }}>
                  {unitCollectors.length === 0
                    ? (
                      <div className="flex items-center justify-center py-8 text-text-muted" style={{ fontSize: 13 }}>
                        No collectors assigned to this unit yet.
                      </div>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr style={{ background: colors.gray50 }}>
                            {["Collector Name", "Email", "Status", "Last Login", "Action"].map((h) => (
                              <th key={h} className="text-left font-semibold uppercase tracking-wide px-5 py-2.5"
                                style={{ fontSize: 11, color: colors.gray500 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {unitCollectors.map((c) => (
                            <tr key={c.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: colors.gray100 }}>
                              <td className="px-5 py-3 font-medium text-text-primary" style={{ fontSize: 13 }}>{c.name}</td>
                              <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>{c.email}</td>
                              <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                              <td className="px-5 py-3 text-text-secondary" style={{ fontSize: 13 }}>
                                {c.lastLogin ? new Date(c.lastLogin).toLocaleDateString("en-PH", { month: "short", day: "numeric" }) : "Never"}
                              </td>
                              <td className="px-5 py-3">
                                <button onClick={() => handleRemoveCollector(unit.id, c.id)}
                                  className="text-error font-medium hover:underline" style={{ fontSize: 12 }}>
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Create unit modal ── */}
      <Modal open={unitModalOpen} onClose={() => setUnitModalOpen(false)} title="Create Collector Unit"
        footer={
          <>
            <button onClick={() => setUnitModalOpen(false)} className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>
              Cancel
            </button>
            <button onClick={handleSaveUnit} disabled={unitSaving} className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              style={{ fontSize: 14, background: colors.primary }}>
              {unitSaving ? "Creating…" : "Create Unit"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Unit Name" value={unitForm.name}
            onChange={(v) => setUnitForm((p) => ({ ...p, name: v }))}
            error={unitErrors.name} placeholder="e.g. Unit Alpha" />
          <FormField label="Plate Number" value={unitForm.plateNumber}
            onChange={(v) => setUnitForm((p) => ({ ...p, plateNumber: v }))}
            error={unitErrors.plateNumber} placeholder="e.g. BTC-1021" />
        </div>
      </Modal>

      {/* ── Assign collector modal ── */}
      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)}
        title={`Add Collector to ${assignTargetUnit?.name ?? ""}`}
        footer={
          <>
            <button onClick={() => setAssignModalOpen(false)} className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>
              Cancel
            </button>
            <button onClick={handleAssignCollector} disabled={assignSaving} className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              style={{ fontSize: 14, background: colors.primary }}>
              {assignSaving ? "Assigning…" : "Assign Collector"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary" style={{ fontSize: 13 }}>
            Select an active collector to assign to this unit. Only unassigned collectors are shown.
          </p>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Collector</label>
            <select value={selectedCollector}
              onChange={(e) => { setSelectedCollector(e.target.value); setAssignError(""); }}
              className="rounded-lg px-3 py-2.5 outline-none"
              style={{ fontSize: 14, border: assignError ? "1.5px solid " + colors.error : "1.5px solid " + colors.gray200, background: colors.gray50, color: colors.textHeading }}>
              <option value="">Select a collector…</option>
              {assignTargetUnit && getAvailableCollectors(assignTargetUnit).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {assignError && <span style={{ fontSize: 12, color: colors.error }}>{assignError}</span>}
            {assignTargetUnit && getAvailableCollectors(assignTargetUnit).length === 0 && (
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                No available collectors. Add collectors in User Management first.
              </span>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
