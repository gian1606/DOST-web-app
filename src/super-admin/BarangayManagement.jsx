import { useState, useMemo } from "react";
import { Plus, Trash2, Search, ChevronDown } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import Modal from "../components/ui/Modal";
import { BARANGAY_ACCOUNTS, CLUSTERS } from "./mock/data";

const EMPTY_FORM = {
  name: "",
  captain: "",
  email: "",
  cluster: "",
  tempPassword: "",
};

function FormField({ label, type = "text", value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg px-3 py-2.5 outline-none"
        style={{ fontSize: 14, border: error ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }}
      />
      {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
    </div>
  );
}

export default function BarangayManagement() {
  const [barangays, setBarangays] = useState(BARANGAY_ACCOUNTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [filterCluster, setFilterCluster] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return barangays.filter((b) => {
      const matchCluster = filterCluster === "all" || b.cluster === filterCluster;
      const matchStatus  = filterStatus  === "all" || b.status  === filterStatus;
      const matchSearch  = !search.trim() ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.captain.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase());
      return matchCluster && matchStatus && matchSearch;
    });
  }, [barangays, filterCluster, filterStatus, search]);

  const activeCount   = barangays.filter((b) => b.status === "active").length;
  const inactiveCount = barangays.filter((b) => b.status === "inactive").length;

  function getClusterLabel(id) {
    return CLUSTERS.find((c) => c.id === id)?.label ?? id;
  }

  // ── Modal helpers ───────────────────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm() {
    const e = {};
    if (!form.name.trim())    e.name    = "Barangay name is required.";
    if (!form.captain.trim()) e.captain = "Contact person is required.";
    if (!form.email.trim())   e.email   = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.cluster)        e.cluster = "Assign a cluster.";
    if (!form.tempPassword)   e.tempPassword = "Temporary password is required.";
    return e;
  }

  function handleSave() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setBarangays((prev) => [
      ...prev,
      {
        id: `ba${Date.now()}`,
        name: form.name,
        captain: form.captain,
        email: form.email,
        cluster: form.cluster,
        totalBins: 0,
        activeResidents: 0,
        status: "active",
        lastActivity: new Date().toISOString().split("T")[0],
      },
    ]);
    setModalOpen(false);
  }

  function handleDelete(id) {
    setBarangays((prev) => prev.filter((b) => b.id !== id));
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Barangay Management</h1>
          <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
            City-wide barangay accounts — Batangas City
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 14, background: "#2E7D32" }}
        >
          <Plus size={15} />
          Add Barangay Account
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-3">
        {[
          { label: "Total",    value: barangays.length, bg: "#F3F4F6", color: "#374151" },
          { label: "Active",   value: activeCount,      bg: "#E8F5E9", color: "#2E7D32" },
          { label: "Inactive", value: inactiveCount,    bg: "#FFEBEE", color: "#DC2626" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: s.bg, border: "1px solid #E5E7EB" }}>
            <span className="font-bold" style={{ fontSize: 18, color: s.color }}>{s.value}</span>
            <span className="font-medium text-text-secondary" style={{ fontSize: 13 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex items-center flex-1" style={{ minWidth: 220 }}>
          <Search size={14} className="absolute left-3 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search barangay, captain, email…"
            className="w-full rounded-lg pl-9 pr-3 py-2 outline-none"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }}
          />
        </div>
        <div className="relative flex items-center">
          <select
            value={filterCluster}
            onChange={(e) => setFilterCluster(e.target.value)}
            className="appearance-none rounded-lg pl-3 pr-8 py-2 outline-none font-medium"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", minWidth: 180 }}
          >
            <option value="all">All Clusters</option>
            {CLUSTERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 pointer-events-none text-text-muted" />
        </div>
        <div className="relative flex items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none rounded-lg pl-3 pr-8 py-2 outline-none font-medium"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", minWidth: 140 }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 pointer-events-none text-text-muted" />
        </div>
        {(filterCluster !== "all" || filterStatus !== "all" || search) && (
          <button
            onClick={() => { setFilterCluster("all"); setFilterStatus("all"); setSearch(""); }}
            className="rounded-lg px-3 py-2 font-medium hover:bg-red-50 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #FECACA", color: "#DC2626", background: "#FFF5F5" }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Barangay Name", "Captain / Contact", "Email", "Cluster", "Total Bins", "Active Residents", "Status", "Last Activity", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                  style={{ fontSize: 11, color: "#6B7280" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-text-muted py-10" style={{ fontSize: 14 }}>
                  No barangays match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((b, i) => (
                <tr key={b.id}
                  style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                  <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{b.name}</td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.captain}</td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.email}</td>
                  <td className="px-4 py-3" style={{ fontSize: 13 }}>
                    <span className="rounded-full px-2.5 py-0.5 font-medium"
                      style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}>
                      {getClusterLabel(b.cluster)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{b.totalBins}</td>
                  <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{b.activeResidents}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.lastActivity}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteTarget(b)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-red-50"
                      style={{ fontSize: 12, color: "#DC2626", border: "1px solid #FECACA" }}
                      title="Delete barangay"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── ADD BARANGAY MODAL ────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Barangay Account"
        footer={
          <>
            <button onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>
              Cancel
            </button>
            <button onClick={handleSave}
              className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, background: "#2E7D32" }}>
              Create Account
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Barangay Name" value={form.name}
            onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            error={formErrors.name} placeholder="e.g. Brgy. Kumintang Ibaba" />
          <FormField label="Contact Person / Captain" value={form.captain}
            onChange={(v) => setForm((p) => ({ ...p, captain: v }))}
            error={formErrors.captain} placeholder="e.g. Jose Reyes" />
          <FormField label="Email Address" type="email" value={form.email}
            onChange={(v) => setForm((p) => ({ ...p, email: v }))}
            error={formErrors.email} placeholder="barangay@besmart.gov.ph" />
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Assigned Cluster</label>
            <select
              value={form.cluster}
              onChange={(e) => setForm((p) => ({ ...p, cluster: e.target.value }))}
              className="rounded-lg px-3 py-2.5 outline-none"
              style={{ fontSize: 14, border: formErrors.cluster ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}
            >
              <option value="">Select a cluster…</option>
              {CLUSTERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            {formErrors.cluster && <span style={{ fontSize: 12, color: "#DC2626" }}>{formErrors.cluster}</span>}
          </div>
          <FormField label="Temporary Password" type="password" value={form.tempPassword}
            onChange={(v) => setForm((p) => ({ ...p, tempPassword: v }))}
            error={formErrors.tempPassword} placeholder="Min. 8 characters" />
        </div>
      </Modal>

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────────────── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Barangay Account"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)}
              className="rounded-lg px-4 py-2 font-medium"
              style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteTarget.id)}
              className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, background: "#DC2626" }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: "#FFEBEE", border: "1px solid #FFCDD2" }}>
              <Trash2 size={16} color="#DC2626" className="flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: 13, color: "#B71C1C" }}>
                This will permanently delete the barangay account. This action cannot be undone.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[
                { label: "Barangay Name", value: deleteTarget.name },
                { label: "Captain",       value: deleteTarget.captain },
                { label: "Email",         value: deleteTarget.email },
                { label: "Cluster",       value: getClusterLabel(deleteTarget.cluster) },
                { label: "Status",        value: deleteTarget.status === "active" ? "Active" : "Inactive" },
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

