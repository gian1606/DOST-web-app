import { useState } from "react";
import { Plus, Trash2, Pencil, ChevronDown, Layers, MapPin } from "lucide-react";
import Modal from "../components/ui/Modal";
import { CLUSTERS as INIT_CLUSTERS, BARANGAY_ACCOUNTS } from "./mock/data";

// ── Shared FormField ──────────────────────────────────────────────────────────
function FormField({ label, type = "text", value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className="rounded-lg px-3 py-2.5 outline-none"
        style={{ fontSize: 14, border: error ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
      {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
    </div>
  );
}

const EMPTY_CLUSTER_FORM  = { label: "" };
const EMPTY_BARANGAY_FORM = { name: "", cluster: "" };

export default function OrganizationManagement() {
  const [activeTab, setActiveTab] = useState("clusters");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Organization Management</h1>
        <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
          Manage clusters and barangays — the organizational units that admin accounts are assigned to
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: "#F3F4F6", width: "fit-content" }}>
        {[
          { id: "clusters",  label: "Clusters",  icon: Layers },
          { id: "barangays", label: "Barangays", icon: MapPin  },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all"
            style={{
              fontSize: 13,
              background: activeTab === id ? "#fff" : "transparent",
              color: activeTab === id ? "#1A1A1A" : "#6B7280",
              boxShadow: activeTab === id ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
            }}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "clusters"  && <ClustersTab />}
      {activeTab === "barangays" && <BarangaysTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLUSTERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ClustersTab() {
  const [clusters, setClusters]     = useState(INIT_CLUSTERS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add, object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_CLUSTER_FORM);
  const [formErrors, setFormErrors] = useState({});

  // How many barangays are assigned to each cluster
  function barangayCount(clusterId) {
    return BARANGAY_ACCOUNTS.filter((b) => b.cluster === clusterId).length;
  }

  function openAdd() { setEditTarget(null); setForm(EMPTY_CLUSTER_FORM); setFormErrors({}); setModalOpen(true); }
  function openEdit(c) { setEditTarget(c); setForm({ label: c.label }); setFormErrors({}); setModalOpen(true); }

  function validate() {
    const e = {};
    if (!form.label.trim()) e.label = "Cluster name is required.";
    else if (clusters.some((c) => c.label.toLowerCase() === form.label.trim().toLowerCase() && c.id !== editTarget?.id))
      e.label = "A cluster with this name already exists.";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    if (editTarget) {
      setClusters((prev) => prev.map((c) => c.id === editTarget.id ? { ...c, label: form.label.trim() } : c));
    } else {
      setClusters((prev) => [...prev, { id: `c${Date.now()}`, label: form.label.trim() }]);
    }
    setModalOpen(false);
  }

  function handleDelete(id) { setClusters((p) => p.filter((c) => c.id !== id)); setDeleteTarget(null); }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg px-3 py-2 flex items-center gap-2"
            style={{ background: "#F3F4F6", border: "1px solid #E5E7EB" }}>
            <span className="font-bold" style={{ fontSize: 18, color: "#374151" }}>{clusters.length}</span>
            <span className="font-medium text-text-secondary" style={{ fontSize: 13 }}>Total Clusters</span>
          </div>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 14, background: "#2E7D32" }}>
          <Plus size={15} /> Add Cluster
        </button>
      </div>

      {/* Clusters grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {clusters.map((c) => (
          <div key={c.id} className="bg-white rounded-xl p-5 flex flex-col gap-3"
            style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 36, height: 36, background: "#E8F5E9" }}>
                  <Layers size={18} color="#2E7D32" />
                </div>
                <div>
                  <div className="font-bold text-text-primary" style={{ fontSize: 15 }}>{c.label}</div>
                  <div className="text-text-muted" style={{ fontSize: 12 }}>ID: {c.id}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => openEdit(c)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium hover:bg-blue-50 transition-colors"
                  style={{ fontSize: 12, color: "#1976D2", border: "1px solid #BBDEFB" }}>
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(c)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium hover:bg-red-50 transition-colors"
                  style={{ fontSize: 12, color: "#DC2626", border: "1px solid #FECACA" }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1" style={{ borderTop: "1px solid #F3F4F6" }}>
              <MapPin size={13} color="#6B7280" />
              <span className="text-text-secondary" style={{ fontSize: 13 }}>
                {barangayCount(c.id)} barangay{barangayCount(c.id) !== 1 ? "s" : ""} assigned
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Cluster modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Cluster" : "Add Cluster"}
        footer={<>
          <button onClick={() => setModalOpen(false)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
          <button onClick={handleSave}
            className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: "#2E7D32" }}>
            {editTarget ? "Save Changes" : "Create Cluster"}
          </button>
        </>}>
        <div className="flex flex-col gap-4">
          <FormField label="Cluster Name" value={form.label}
            onChange={(v) => setForm((p) => ({ ...p, label: v }))}
            error={formErrors.label} placeholder="e.g. Solid East" />
        </div>
      </Modal>

      {/* Delete Cluster modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Cluster"
        footer={<>
          <button onClick={() => setDeleteTarget(null)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
          <button onClick={() => handleDelete(deleteTarget.id)}
            className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: "#DC2626" }}>
            <Trash2 size={14} /> Delete
          </button>
        </>}>
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: "#FFEBEE", border: "1px solid #FFCDD2" }}>
              <Trash2 size={16} color="#DC2626" className="flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: 13, color: "#B71C1C" }}>
                Deleting this cluster will not delete its assigned admin accounts or barangays,
                but they will become unassigned. This action cannot be undone.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[
                { label: "Cluster Name", value: deleteTarget.label },
                { label: "Barangays",    value: `${barangayCount(deleteTarget.id)} assigned` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0"
                  style={{ borderColor: "#F3F4F6" }}>
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

// ═══════════════════════════════════════════════════════════════════════════════
// BARANGAYS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function BarangaysTab() {
  const [clusters]              = useState(INIT_CLUSTERS);
  const [barangays, setBarangays] = useState(
    // Derive unique barangay org records from BARANGAY_ACCOUNTS
    BARANGAY_ACCOUNTS.map((b) => ({ id: b.id, name: b.name, cluster: b.cluster }))
  );
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_BARANGAY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [filterCluster, setFilterCluster] = useState("all");
  const [search, setSearch]               = useState("");

  const filtered = barangays.filter((b) => {
    const matchCluster = filterCluster === "all" || b.cluster === filterCluster;
    const matchSearch  = !search.trim() || b.name.toLowerCase().includes(search.toLowerCase());
    return matchCluster && matchSearch;
  });

  function getClusterLabel(id) { return clusters.find((c) => c.id === id)?.label ?? id; }

  function openAdd()    { setEditTarget(null); setForm(EMPTY_BARANGAY_FORM); setFormErrors({}); setModalOpen(true); }
  function openEdit(b)  { setEditTarget(b); setForm({ name: b.name, cluster: b.cluster }); setFormErrors({}); setModalOpen(true); }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name    = "Barangay name is required.";
    if (!form.cluster)     e.cluster = "Assign a cluster.";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    if (editTarget) {
      setBarangays((prev) => prev.map((b) => b.id === editTarget.id ? { ...b, name: form.name.trim(), cluster: form.cluster } : b));
    } else {
      setBarangays((prev) => [...prev, { id: `br${Date.now()}`, name: form.name.trim(), cluster: form.cluster }]);
    }
    setModalOpen(false);
  }

  function handleDelete(id) { setBarangays((p) => p.filter((b) => b.id !== id)); setDeleteTarget(null); }

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center" style={{ minWidth: 220 }}>
            <svg className="absolute left-3 text-text-muted" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search barangay name…"
              className="rounded-lg pl-9 pr-3 py-2 outline-none"
              style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
          </div>
          <div className="relative flex items-center">
            <select value={filterCluster} onChange={(e) => setFilterCluster(e.target.value)}
              className="appearance-none rounded-lg pl-3 pr-8 py-2 outline-none font-medium"
              style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", minWidth: 180 }}>
              <option value="all">All Clusters</option>
              {clusters.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 pointer-events-none text-text-muted" />
          </div>
          {(filterCluster !== "all" || search) && (
            <button onClick={() => { setFilterCluster("all"); setSearch(""); }}
              className="rounded-lg px-3 py-2 font-medium hover:bg-red-50 transition-colors"
              style={{ fontSize: 13, border: "1.5px solid #FECACA", color: "#DC2626", background: "#FFF5F5" }}>
              ✕ Clear
            </button>
          )}
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity flex-shrink-0"
          style={{ fontSize: 14, background: "#2E7D32" }}>
          <Plus size={15} /> Add Barangay
        </button>
      </div>

      {/* Group barangays by cluster */}
      {clusters.map((c) => {
        const items = filtered.filter((b) => b.cluster === c.id);
        if (items.length === 0 && filterCluster !== "all" && filterCluster !== c.id) return null;
        if (items.length === 0 && filterCluster === "all" && search.trim()) return null;
        return (
          <div key={c.id} className="bg-white rounded-xl overflow-hidden"
            style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ background: "#F9FAFB", borderColor: "#E5E7EB" }}>
              <Layers size={15} color="#2E7D32" />
              <span className="font-semibold text-text-primary" style={{ fontSize: 14 }}>{c.label}</span>
              <span className="rounded-full px-2 py-0.5 font-medium"
                style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}>
                {items.length} barangay{items.length !== 1 ? "s" : ""}
              </span>
            </div>
            {items.length === 0 ? (
              <div className="px-5 py-6 text-text-muted text-center" style={{ fontSize: 13 }}>
                No barangays in this cluster yet.
              </div>
            ) : (
              <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "45%" }} />
                  <col style={{ width: "35%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {["Barangay Name", "Cluster", "Actions"].map((h) => (
                      <th key={h} className="text-left font-semibold uppercase tracking-wide px-5 py-2.5"
                        style={{ fontSize: 11, color: "#6B7280" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((b, i) => (
                    <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                      <td className="px-5 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{b.name}</td>
                      <td className="px-5 py-3" style={{ fontSize: 13 }}>
                        <span className="rounded-full px-2.5 py-0.5 font-medium"
                          style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}>
                          {getClusterLabel(b.cluster)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(b)}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium hover:bg-blue-50 transition-colors"
                            style={{ fontSize: 12, color: "#1976D2", border: "1px solid #BBDEFB" }}>
                            <Pencil size={12} /> Edit
                          </button>
                          <button onClick={() => setDeleteTarget(b)}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium hover:bg-red-50 transition-colors"
                            style={{ fontSize: 12, color: "#DC2626", border: "1px solid #FECACA" }}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      {/* Add / Edit Barangay modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Barangay" : "Add Barangay"}
        footer={<>
          <button onClick={() => setModalOpen(false)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
          <button onClick={handleSave}
            className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: "#2E7D32" }}>
            {editTarget ? "Save Changes" : "Create Barangay"}
          </button>
        </>}>
        <div className="flex flex-col gap-4">
          <FormField label="Barangay Name" value={form.name}
            onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            error={formErrors.name} placeholder="e.g. Brgy. Alangilan" />
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Assigned Cluster</label>
            <select value={form.cluster} onChange={(e) => setForm((p) => ({ ...p, cluster: e.target.value }))}
              className="rounded-lg px-3 py-2.5 outline-none"
              style={{ fontSize: 14, border: formErrors.cluster ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}>
              <option value="">Select a cluster…</option>
              {clusters.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            {formErrors.cluster && <span style={{ fontSize: 12, color: "#DC2626" }}>{formErrors.cluster}</span>}
          </div>
        </div>
      </Modal>

      {/* Delete Barangay modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Barangay"
        footer={<>
          <button onClick={() => setDeleteTarget(null)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
          <button onClick={() => handleDelete(deleteTarget.id)}
            className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: "#DC2626" }}>
            <Trash2 size={14} /> Delete
          </button>
        </>}>
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: "#FFEBEE", border: "1px solid #FFCDD2" }}>
              <Trash2 size={16} color="#DC2626" className="flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: 13, color: "#B71C1C" }}>
                Deleting this barangay will not remove any associated admin account,
                but the account will become unassigned. This action cannot be undone.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[
                { label: "Barangay Name", value: deleteTarget.name },
                { label: "Cluster",       value: getClusterLabel(deleteTarget.cluster) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0"
                  style={{ borderColor: "#F3F4F6" }}>
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
