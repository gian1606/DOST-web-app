import { useState } from "react";
import { Plus, Trash2, Info, History, ChevronDown, ChevronRight, Users, Building } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import Modal from "../components/ui/Modal";
import { CLUSTER_ADMINS, CLUSTERS } from "../mock/data";
import { BARANGAY_ACCOUNTS, CLUSTERS as SA_CLUSTERS } from "./mock/data";

// ── Shared form field ─────────────────────────────────────────────────────────
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

// ── Mock history of previous cluster admins ───────────────────────────────────
const INITIAL_HISTORY = [
  { id: "h1", name: "Ricardo Villanueva", clusterLabel: "Solid East",      yearAssigned: 2022, yearEnded: 2023 },
  { id: "h2", name: "Lorna Castillo",     clusterLabel: "Solid North",     yearAssigned: 2022, yearEnded: 2024 },
  { id: "h3", name: "Benito Aquino",      clusterLabel: "Solid Poblacion", yearAssigned: 2023, yearEnded: 2024 },
  { id: "h4", name: "Cynthia Ramos",      clusterLabel: "Solid Baybay",    yearAssigned: 2022, yearEnded: 2023 },
  { id: "h5", name: "Ernesto Flores",     clusterLabel: "Solid Upland",    yearAssigned: 2023, yearEnded: 2025 },
  { id: "h6", name: "Marilou Bautista",   clusterLabel: "Solid East",      yearAssigned: 2021, yearEnded: 2022 },
  { id: "h7", name: "Danilo Cruz",        clusterLabel: "Solid North",     yearAssigned: 2021, yearEnded: 2022 },
  { id: "h8", name: "Felisa Mendoza",     clusterLabel: "Solid Baybay",    yearAssigned: 2021, yearEnded: 2022 },
];

const EMPTY_CLUSTER_FORM  = { name: "", email: "", assignedCluster: "", tempPassword: "" };
const EMPTY_BARANGAY_FORM = { name: "", captain: "", email: "", cluster: "", tempPassword: "" };

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("cluster");

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>User Management</h1>
        <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
          Manage cluster and barangay admin accounts
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: "#F3F4F6", width: "fit-content" }}>
        {[
          { id: "cluster",  label: "Cluster Admins",  icon: Users    },
          { id: "barangay", label: "Barangay Admins", icon: Building },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all"
            style={{
              fontSize: 13,
              background: activeTab === id ? "#fff" : "transparent",
              color: activeTab === id ? "#1A1A1A" : "#6B7280",
              boxShadow: activeTab === id ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "cluster"  && <ClusterAdminTab />}
      {activeTab === "barangay" && <BarangayAdminTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLUSTER ADMIN TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ClusterAdminTab() {
  const [users, setUsers]           = useState(CLUSTER_ADMINS);
  const [history]                   = useState(INITIAL_HISTORY);
  const [modalOpen, setModalOpen]   = useState(false);
  const [form, setForm]             = useState(EMPTY_CLUSTER_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const historyYears = [...new Set(history.map((h) => h.yearAssigned))].sort((a, b) => b - a);
  const [openYears, setOpenYears] = useState({ [historyYears[0]]: true });
  function toggleYear(year) { setOpenYears((p) => ({ ...p, [year]: !p[year] })); }

  const assignedClusterIds  = new Set(users.map((u) => u.assignedCluster));
  const availableClusters   = CLUSTERS.filter((c) => !assignedClusterIds.has(c.id));

  function openAdd() { setForm(EMPTY_CLUSTER_FORM); setFormErrors({}); setModalOpen(true); }

  function validateForm() {
    const e = {};
    if (!form.name.trim())     e.name            = "Name is required.";
    if (!form.email.trim())    e.email           = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.assignedCluster) e.assignedCluster = "Assign a cluster.";
    if (!form.tempPassword)    e.tempPassword    = "Temporary password is required.";
    return e;
  }

  function handleSave() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setUsers((prev) => [
      ...prev,
      { id: `u${Date.now()}`, name: form.name, email: form.email,
        assignedCluster: form.assignedCluster, role: "cluster_admin",
        status: "active", lastLogin: null },
    ]);
    setModalOpen(false);
  }

  function handleDelete(id) { setUsers((p) => p.filter((u) => u.id !== id)); setDeleteTarget(null); }

  function getClusterLabel(id) { return CLUSTERS.find((c) => c.id === id)?.label ?? id; }
  function formatLastLogin(ts) {
    if (!ts) return "Never";
    return new Date(ts).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 flex-1 mr-4"
          style={{ background: "#E3F2FD", border: "1px solid #90CAF9" }}>
          <Info size={16} color="#1976D2" className="flex-shrink-0 mt-0.5" />
          <p style={{ fontSize: 13, color: "#1565C0" }}>
            Resident buyer information is private and restricted from Super Admin view.
            Only Cluster Admin accounts are managed here.
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity flex-shrink-0"
          style={{ fontSize: 14, background: "#2E7D32" }}>
          <Plus size={15} /> Add Cluster Admin
        </button>
      </div>

      {/* Active admins table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Name", "Role", "Assigned Cluster", "Email", "Status", "Last Login", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                  style={{ fontSize: 11, color: "#6B7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-text-muted py-10" style={{ fontSize: 14 }}>
                No cluster admin accounts found.
              </td></tr>
            ) : users.map((u, i) => (
              <tr key={u.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{u.name}</td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>Cluster Admin</td>
                <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{getClusterLabel(u.assignedCluster)}</td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{u.email}</td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{formatLastLogin(u.lastLogin)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDeleteTarget(u)}
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

      {/* Admin history accordion */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "#E5E7EB" }}>
          <History size={17} color="#6B7280" />
          <h2 className="font-semibold text-text-primary" style={{ fontSize: 17 }}>Admin History</h2>
          <span className="text-text-muted ml-1" style={{ fontSize: 13 }}>— Previous cluster admins grouped by year</span>
        </div>
        <div className="flex flex-col">
          {historyYears.map((year) => {
            const entries = history.filter((h) => h.yearAssigned === year);
            const isOpen  = !!openYears[year];
            return (
              <div key={year} style={{ borderBottom: "1px solid #F3F4F6" }}>
                <button onClick={() => toggleYear(year)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                  style={{ background: isOpen ? "#F9FAFB" : "#fff" }}>
                  {isOpen ? <ChevronDown size={15} color="#6B7280" /> : <ChevronRight size={15} color="#6B7280" />}
                  <span className="font-semibold text-text-primary" style={{ fontSize: 14 }}>{year}</span>
                  <span className="rounded-full px-2 py-0.5 font-medium ml-1"
                    style={{ fontSize: 11, background: "#F3F4F6", color: "#6B7280" }}>
                    {entries.length} admin{entries.length !== 1 ? "s" : ""}
                  </span>
                </button>
                {isOpen && (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr style={{ background: "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                        {["Name", "Assigned Cluster", "Year Assigned", "Year Ended"].map((h) => (
                          <th key={h} className="text-left font-semibold uppercase tracking-wide px-6 py-2"
                            style={{ fontSize: 10, color: "#9CA3AF" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((h, i) => (
                        <tr key={h.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                          <td className="px-6 py-2.5 font-semibold text-text-primary" style={{ fontSize: 13 }}>{h.name}</td>
                          <td className="px-6 py-2.5" style={{ fontSize: 13 }}>
                            <span className="rounded-full px-2.5 py-0.5 font-medium"
                              style={{ fontSize: 11, background: "#F3F4F6", color: "#6B7280" }}>{h.clusterLabel}</span>
                          </td>
                          <td className="px-6 py-2.5 text-text-secondary" style={{ fontSize: 13 }}>{h.yearAssigned}</td>
                          <td className="px-6 py-2.5 text-text-secondary" style={{ fontSize: 13 }}>{h.yearEnded}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Cluster Admin modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Cluster Admin Account"
        footer={<>
          <button onClick={() => setModalOpen(false)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
          <button onClick={handleSave}
            className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: "#2E7D32" }}>Create Account</button>
        </>}>
        <div className="flex flex-col gap-4">
          <FormField label="Full Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            error={formErrors.name} placeholder="e.g. Juan dela Cruz" />
          <FormField label="Email Address" type="email" value={form.email}
            onChange={(v) => setForm((p) => ({ ...p, email: v }))}
            error={formErrors.email} placeholder="juan.delacruz@besmart.gov.ph" />
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Assigned Cluster</label>
            {availableClusters.length === 0 ? (
              <div className="rounded-lg px-3 py-2.5 text-text-muted"
                style={{ fontSize: 14, border: "1.5px solid #E5E7EB", background: "#F3F4F6" }}>
                All clusters already have an assigned admin.
              </div>
            ) : (
              <select value={form.assignedCluster}
                onChange={(e) => setForm((p) => ({ ...p, assignedCluster: e.target.value }))}
                className="rounded-lg px-3 py-2.5 outline-none"
                style={{ fontSize: 14, border: formErrors.assignedCluster ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}>
                <option value="">Select a cluster…</option>
                {availableClusters.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            )}
            {formErrors.assignedCluster && <span style={{ fontSize: 12, color: "#DC2626" }}>{formErrors.assignedCluster}</span>}
          </div>
          <FormField label="Temporary Password" type="password" value={form.tempPassword}
            onChange={(v) => setForm((p) => ({ ...p, tempPassword: v }))}
            error={formErrors.tempPassword} placeholder="Min. 8 characters" />
        </div>
      </Modal>

      {/* Delete Cluster Admin modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Account"
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
              <p style={{ fontSize: 13, color: "#B71C1C" }}>This will permanently delete the account. This action cannot be undone.</p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[
                { label: "Name",             value: deleteTarget.name },
                { label: "Email",            value: deleteTarget.email },
                { label: "Assigned Cluster", value: getClusterLabel(deleteTarget.assignedCluster) },
                { label: "Status",           value: deleteTarget.status === "active" ? "Active" : "Inactive" },
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
// BARANGAY ADMIN TAB
// ═══════════════════════════════════════════════════════════════════════════════
function BarangayAdminTab() {
  const [barangays, setBarangays]   = useState(BARANGAY_ACCOUNTS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_BARANGAY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [filterCluster, setFilterCluster] = useState("all");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [search, setSearch]               = useState("");

  const filtered = barangays.filter((b) => {
    const matchCluster = filterCluster === "all" || b.cluster === filterCluster;
    const matchStatus  = filterStatus  === "all" || b.status  === filterStatus;
    const matchSearch  = !search.trim() ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.captain.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase());
    return matchCluster && matchStatus && matchSearch;
  });

  const activeCount   = barangays.filter((b) => b.status === "active").length;
  const inactiveCount = barangays.filter((b) => b.status === "inactive").length;

  function getClusterLabel(id) { return SA_CLUSTERS.find((c) => c.id === id)?.label ?? id; }

  function openAdd() { setForm(EMPTY_BARANGAY_FORM); setFormErrors({}); setModalOpen(true); }

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
      { id: `ba${Date.now()}`, name: form.name, captain: form.captain, email: form.email,
        cluster: form.cluster, totalBins: 0, activeResidents: 0,
        status: "active", lastActivity: new Date().toISOString().split("T")[0] },
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
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ fontSize: 14, background: "#2E7D32" }}>
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
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#F9FAFB" }} />
        </div>
        <div className="relative flex items-center">
          <select value={filterCluster} onChange={(e) => setFilterCluster(e.target.value)}
            className="appearance-none rounded-lg pl-3 pr-8 py-2 outline-none font-medium"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", minWidth: 180 }}>
            <option value="all">All Clusters</option>
            {SA_CLUSTERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 pointer-events-none text-text-muted" />
        </div>
        <div className="relative flex items-center">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none rounded-lg pl-3 pr-8 py-2 outline-none font-medium"
            style={{ fontSize: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", minWidth: 140 }}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 pointer-events-none text-text-muted" />
        </div>
        {(filterCluster !== "all" || filterStatus !== "all" || search) && (
          <button onClick={() => { setFilterCluster("all"); setFilterStatus("all"); setSearch(""); }}
            className="rounded-lg px-3 py-2 font-medium hover:bg-red-50 transition-colors"
            style={{ fontSize: 13, border: "1.5px solid #FECACA", color: "#DC2626", background: "#FFF5F5" }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Barangay admins table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Barangay Name", "Captain / Contact", "Email", "Cluster", "Total Bins", "Active Residents", "Status", "Last Activity", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                  style={{ fontSize: 11, color: "#6B7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-text-muted py-10" style={{ fontSize: 14 }}>
                No barangay admin accounts match your filters.
              </td></tr>
            ) : filtered.map((b, i) => (
              <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
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
                  <button onClick={() => setDeleteTarget(b)}
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

      {/* Add Barangay Admin modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Barangay Admin Account"
        footer={<>
          <button onClick={() => setModalOpen(false)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
          <button onClick={handleSave}
            className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: "#2E7D32" }}>Create Account</button>
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
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>Assigned Cluster</label>
            <select value={form.cluster} onChange={(e) => setForm((p) => ({ ...p, cluster: e.target.value }))}
              className="rounded-lg px-3 py-2.5 outline-none"
              style={{ fontSize: 14, border: formErrors.cluster ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}>
              <option value="">Select a cluster…</option>
              {SA_CLUSTERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            {formErrors.cluster && <span style={{ fontSize: 12, color: "#DC2626" }}>{formErrors.cluster}</span>}
          </div>
          <FormField label="Temporary Password" type="password" value={form.tempPassword}
            onChange={(v) => setForm((p) => ({ ...p, tempPassword: v }))}
            error={formErrors.tempPassword} placeholder="Min. 8 characters" />
        </div>
      </Modal>

      {/* Delete Barangay Admin modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Barangay Admin Account"
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
              <p style={{ fontSize: 13, color: "#B71C1C" }}>This will permanently delete the account. This action cannot be undone.</p>
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
