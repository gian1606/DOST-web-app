import { colors } from "../../../theme/colors.js";
import { useState, useEffect } from "react";
import { Plus, Trash2, Building, ChevronDown, ChevronUp, RefreshCw, UserPlus } from "lucide-react";
import Modal       from "../../../components/ui/Modal";
import FormField from "../../../components/ui/FormField.jsx";
import DateFilter from "../../../components/ui/DateFilter.jsx";
import {
  fetchBarangayAdmins,
  createBarangayAdmin,
  deleteBarangayAdmin,
  updateBarangayAdminStatus,
  fetchAllBarangays,
  fetchAvailableBarangays,
  fetchClusters,
  fetchDeletedBarangayAdmins,
} from "../../../services/superAdmin.js";

const EMPTY_BARANGAY_FORM = { name: "", captain: "", email: "", tempPassword: "", useExisting: false, existingUserId: "" };

// Online status badge component
function OnlineStatusBadge({ status }) {
  const config = {
    online: { 
      label: "Online", 
      dotColor: "#10B981", 
      bgColor: "#D1FAE5", 
      textColor: "#065F46" 
    },
    recently_active: { 
      label: "Recently Active", 
      dotColor: "#F59E0B", 
      bgColor: "#FEF3C7", 
      textColor: "#92400E" 
    },
    offline: { 
      label: "Offline", 
      dotColor: "#6B7280", 
      bgColor: "#F3F4F6", 
      textColor: "#374151" 
    },
    never: { 
      label: "Never Logged In", 
      dotColor: "#9CA3AF", 
      bgColor: "#F9FAFB", 
      textColor: "#6B7280" 
    },
  };

  const style = config[status] || config.never;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{ background: style.bgColor }}>
      <span style={{ 
        width: 6, 
        height: 6, 
        borderRadius: "50%", 
        background: style.dotColor 
      }} />
      <span className="font-medium" style={{ fontSize: 12, color: style.textColor }}>
        {style.label}
      </span>
    </div>
  );
}

export default function UserManagement() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>User Management</h1>
        <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
          Create and manage Punong Barangay (Barangay Admin) user accounts
        </p>
        <div className="mt-2 rounded-lg px-3 py-2" style={{ background: "#E3F2FD", border: "1px solid #90CAF9" }}>
          <p style={{ fontSize: 12, color: "#1565C0" }}>
            ℹ️ <strong>Note:</strong> This page is for creating user accounts only. To add new barangays, go to <strong>Barangay Management</strong>.
          </p>
        </div>
      </div>
      <BarangayAdminTab />
    </div>
  );
}

function BarangayAdminTab() {
  const [barangays, setBarangays]   = useState([]);
  const [deletedAccounts, setDeletedAccounts] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteFilters, setDeleteFilters] = useState({ year: null, month: null, day: null });
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [disableTarget, setDisableTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_BARANGAY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCluster, setFilterCluster] = useState("all");
  const [sortBy, setSortBy]         = useState("newest");
  const [search, setSearch]             = useState("");
  const [saving, setSaving]             = useState(false);
  const [apiError, setApiError]         = useState("");
  const [allBarangayList, setAllBarangayList] = useState([]);
  const [clusters, setClusters]     = useState([]);

  // Load data on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBarangayAdmins(), 
      fetchAllBarangays(), 
      fetchClusters(),
      fetchDeletedBarangayAdmins(deleteFilters)
    ])
      .then(([admins, brgys, clust, deleted]) => { 
        setBarangays(admins); 
        setAllBarangayList(brgys); 
        setClusters(clust);
        setDeletedAccounts(deleted);
      })
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Refetch deleted accounts when date filters change
  useEffect(() => {
    if (showDeleted) {
      fetchDeletedBarangayAdmins(deleteFilters)
        .then(setDeletedAccounts)
        .catch(console.error);
    }
  }, [deleteFilters, showDeleted]);

  // Listen for barangay updates from Barangay Management page
  useEffect(() => {
    async function handleBarangayUpdated() {
      try {
        // Refresh both admin list AND barangay list to get updated names
        const [admins, brgys] = await Promise.all([
          fetchBarangayAdmins(),
          fetchAllBarangays()
        ]);
        setBarangays(admins);
        setAllBarangayList(brgys);
      } catch (err) {
        console.error("Failed to refresh after barangay update:", err);
      }
    }
    
    window.addEventListener('barangayUpdated', handleBarangayUpdated);
    return () => window.removeEventListener('barangayUpdated', handleBarangayUpdated);
  }, []);

  // Refresh deleted accounts when an account is deleted
  async function refreshAfterDelete() {
    try {
      const deleted = await fetchDeletedBarangayAdmins();
      setDeletedAccounts(deleted);
    } catch (err) {
      console.error("Failed to refresh deleted accounts:", err);
    }
  }

  const filtered = barangays.filter((b) => {
    const matchStatus = filterStatus === "all" || 
      (filterStatus === "enabled" && b.isActive) ||
      (filterStatus === "disabled" && !b.isActive && b.name) ||
      (filterStatus === "unassigned" && !b.isActive && !b.name);
    
    const matchSearch = !search.trim() ||
      (b.name && b.name.toLowerCase().includes(search.toLowerCase())) ||
      (b.captain && b.captain.toLowerCase().includes(search.toLowerCase())) ||
      b.email.toLowerCase().includes(search.toLowerCase());
    
    // Get cluster for this barangay
    const barangayData = allBarangayList.find(br => br.name === b.name);
    const matchCluster = filterCluster === "all" || 
      (filterCluster === "none" && !barangayData?.cluster_id) ||
      (barangayData?.cluster_id === filterCluster);
    
    return matchStatus && matchSearch && matchCluster;
  });

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        const newestDiff = new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        // If dates are the same, sort alphabetically as secondary
        return newestDiff !== 0 ? newestDiff : (a.name || a.email).localeCompare(b.name || b.email);
      case "oldest":
        const oldestDiff = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        // If dates are the same, sort alphabetically as secondary
        return oldestDiff !== 0 ? oldestDiff : (a.name || a.email).localeCompare(b.name || b.email);
      case "a-z":
        return (a.name || a.email).localeCompare(b.name || b.email);
      case "z-a":
        return (b.name || b.email).localeCompare(a.name || a.email);
      default:
        return 0;
    }
  });

  const enabledCount    = barangays.filter((b) => b.isActive).length;
  const disabledCount   = barangays.filter((b) => !b.isActive && b.name).length;
  const unassignedCount = barangays.filter((b) => !b.isActive && !b.name).length;
  
  // Only show truly unassigned users (no barangay assigned, available for reuse)
  const inactiveUsers = barangays.filter((b) => !b.isActive && !b.name);
  
  // Get barangays that already have ACTIVE accounts assigned
  // Check by barangay ID, not name, to prevent edited barangays from appearing as "new"
  const barangayIdsWithAccounts = barangays
    .filter((b) => b.barangayId && b.isActive) // Only count active accounts
    .map((b) => b.barangayId);
  
  // Also get barangay names with active accounts as a secondary check
  const barangayNamesWithActiveAccounts = barangays
    .filter((b) => b.name && b.isActive) // Active accounts with barangay names
    .map((b) => b.name);
  
  // Filter out barangays that already have active accounts (check both ID and name)
  const availableBarangays = allBarangayList.filter((b) => 
    !barangayIdsWithAccounts.includes(b.id) && 
    !barangayNamesWithActiveAccounts.includes(b.name)
  );

  function openAdd() { setForm(EMPTY_BARANGAY_FORM); setFormErrors({}); setApiError(""); setModalOpen(true); }

  function validateForm() {
    const e = {};
    if (form.useExisting) {
      if (!form.existingUserId) e.existingUserId = "Please select an unassigned account.";
      if (!form.name.trim()) e.name = "Please select a barangay.";
    } else {
      if (!form.name.trim())    e.name    = "Barangay name is required.";
      if (!form.captain.trim()) e.captain = "Contact person is required.";
      if (!form.email.trim())   e.email   = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
      if (!form.tempPassword)   e.tempPassword = "Temporary password is required.";
    }
    return e;
  }

  async function handleSave() {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setSaving(true);
    setApiError("");
    try {
      await createBarangayAdmin({
        name: form.name,
        captain: form.captain,
        email: form.email,
        tempPassword: form.tempPassword,
        useExisting: form.useExisting,
        existingUserId: form.existingUserId,
      });
      // Refresh both the admin list and barangay list
      const [admins, brgys] = await Promise.all([
        fetchBarangayAdmins(),
        fetchAllBarangays()
      ]);
      setBarangays(admins);
      setAllBarangayList(brgys);
      setModalOpen(false);
    } catch (err) {
      setApiError(err.message || "Failed to create/assign account.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteBarangayAdmin(id);
      setBarangays((p) => p.filter((b) => b.id !== id));
      setDeleteTarget(null);
      // Refresh deleted accounts list
      await refreshAfterDelete();
    } catch (err) {
      setApiError(err.message || "Failed to delete account.");
    }
  }

  async function handleToggleStatus(account) {
    setDisableTarget(account);
  }

  async function confirmDisable() {
    if (!disableTarget) return;
    try {
      // Call service to disable account (set is_active = false)
      await updateBarangayAdminStatus(disableTarget.id, false);
      
      // Refresh the full list to ensure sync
      const admins = await fetchBarangayAdmins();
      setBarangays(admins);
      setDisableTarget(null);
    } catch (err) {
      setApiError(err.message || "Failed to disable account.");
    }
  }

  async function handleEnable(account) {
    try {
      // Call service to enable account (set is_active = true)
      await updateBarangayAdminStatus(account.id, true);
      
      // Refresh the full list to ensure sync
      const admins = await fetchBarangayAdmins();
      setBarangays(admins);
    } catch (err) {
      setApiError(err.message || "Failed to enable account.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full border-4 border-t-transparent"
          style={{ width: 32, height: 32, borderColor: colors.primary, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {apiError && (
        <div className="rounded-lg px-4 py-3 font-medium"
          style={{ background: colors.errorSoft, color: colors.error, fontSize: 13, border: "1px solid " + colors.errorBorder }}>
          {apiError}
        </div>
      )}

      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {[
            { label: "Total",      value: barangays.length, bg: colors.gray100, color: colors.gray700 },
            { label: "Enabled",    value: enabledCount,     bg: colors.accentSoft, color: colors.primary },
            { label: "Disabled",   value: disabledCount,    bg: "#FEF3C7", color: "#92400E" },
            { label: "Unassigned", value: unassignedCount,  bg: colors.errorSoft, color: colors.error },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: s.bg, border: "1px solid " + colors.gray200 }}>
              <span className="font-bold" style={{ fontSize: 18, color: s.color }}>{s.value}</span>
              <span className="font-medium text-text-secondary" style={{ fontSize: 13 }}>{s.label}</span>
            </div>
          ))}
        </div>
        <button onClick={openAdd}
          disabled={availableBarangays.length === 0}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontSize: 14, background: colors.primary }}
          title={availableBarangays.length === 0 ? "All barangays already have accounts assigned. Delete a barangay or create new ones first." : ""}>
          <Plus size={15} /> Add Barangay Admin
        </button>
      </div>

      {/* Filters - Compact Modern Layout */}
      <div className="flex flex-col gap-4">
        {/* Tab-style Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { value: "all", label: "All Accounts", count: barangays.length },
            { value: "enabled", label: "Enabled", count: enabledCount },
            { value: "disabled", label: "Disabled", count: disabledCount },
            { value: "unassigned", label: "Unassigned", count: unassignedCount },
            { value: "deleted", label: "Deleted History", count: deletedAccounts.length },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                if (filter.value === "deleted") {
                  setShowDeleted(!showDeleted);
                } else {
                  setFilterStatus(filter.value);
                  setShowDeleted(false);
                }
              }}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition-all"
              style={{
                fontSize: 13,
                background: (filter.value === "deleted" ? showDeleted : filterStatus === filter.value) ? colors.primary : colors.white,
                color: (filter.value === "deleted" ? showDeleted : filterStatus === filter.value) ? colors.white : colors.gray700,
                border: `1.5px solid ${(filter.value === "deleted" ? showDeleted : filterStatus === filter.value) ? colors.primary : colors.gray200}`,
              }}>
              {filter.label}
              <span
                className="rounded-full px-2 py-0.5 font-bold"
                style={{
                  fontSize: 11,
                  background: (filter.value === "deleted" ? showDeleted : filterStatus === filter.value) ? "rgba(255,255,255,0.25)" : colors.gray100,
                  color: (filter.value === "deleted" ? showDeleted : filterStatus === filter.value) ? colors.white : colors.gray700,
                }}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Compact Filter Bar: Search, Cluster, Sort */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex items-center flex-1" style={{ minWidth: 300, maxWidth: 450 }}>
            <svg className="absolute left-3 text-text-muted" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search barangay, captain, email..."
              className="w-full rounded-lg pl-10 pr-3 py-2.5 outline-none"
              style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.white }} />
          </div>
          
          {/* Cluster Filter */}
          <div className="flex items-center gap-2">
            <span className="text-text-secondary font-medium whitespace-nowrap" style={{ fontSize: 13 }}>Cluster:</span>
            <select 
              value={filterCluster} 
              onChange={(e) => setFilterCluster(e.target.value)}
              className="rounded-lg px-3 py-2.5 outline-none font-medium"
              style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.white, minWidth: 150 }}>
              <option value="all">All Clusters</option>
              <option value="none">No Cluster</option>
              {clusters.map((cluster) => (
                <option key={cluster.id} value={cluster.id}>{cluster.label}</option>
              ))}
            </select>
          </div>
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-text-secondary font-medium whitespace-nowrap" style={{ fontSize: 13 }}>Sort:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg px-3 py-2 outline-none font-medium"
              style={{ fontSize: 13, border: "1.5px solid " + colors.gray200, background: colors.white }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
            style={{ border: "1.5px solid " + colors.gray200, background: colors.white }}
            title="Refresh">
            <RefreshCw size={16} color={colors.gray600} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: colors.gray50, borderBottom: "1px solid " + colors.gray200 }}>
              {["Barangay Name", "Captain / Contact", "Email", "Total Bins", "Active Residents", "Account Status", "Online Status", "Last Login", "Actions"].map((h) => (
                <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                  style={{ fontSize: 11, color: colors.gray500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-text-muted py-10" style={{ fontSize: 14 }}>
                No barangay admin accounts match your filters.
              </td></tr>
            ) : sorted.map((b, i) => (
              <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : colors.tableRowAlt, borderBottom: "1px solid #F3F4F6" }}>
                <td className="px-4 py-3" style={{ fontSize: 13 }}>
                  {b.name ? (
                    <span className="font-semibold text-text-primary">{b.name}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: colors.gray100, fontSize: 12, fontWeight: 600, color: colors.gray600 }}>
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.captain || "—"}</td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.email}</td>
                <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{b.totalBins}</td>
                <td className="px-4 py-3 text-text-primary" style={{ fontSize: 13 }}>{b.activeResidents}</td>
                <td className="px-4 py-3">
                  {b.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
                      style={{ fontSize: 12, background: colors.accentSoft, color: colors.primary }}>
                      ✓ Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium"
                      style={{ fontSize: 12, background: colors.errorSoft, color: colors.error }}>
                      ✕ Disabled
                    </span>
                  )}
                </td>
                <td className="px-4 py-3"><OnlineStatusBadge status={b.onlineStatus} /></td>
                <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{b.lastLoginText}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {b.isActive ? (
                      // Enabled accounts: Only show Disable button
                      <button onClick={() => handleToggleStatus(b)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-orange-50"
                        style={{ fontSize: 12, color: "#F97316", border: "1px solid #FED7AA" }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Disable
                      </button>
                    ) : b.name ? (
                      // Disabled accounts (with barangay): Only show Enable button
                      <button onClick={() => handleEnable(b)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-green-50"
                        style={{ fontSize: 12, color: "#10B981", border: "1px solid #86EFAC" }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" ry="2"/><path d="M12 11V7a2 2 0 0 1 4 0"/></svg>
                        Enable
                      </button>
                    ) : (
                      // Unassigned accounts (no barangay): Only show Delete button
                      <button onClick={() => setDeleteTarget(b)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-red-50"
                        style={{ fontSize: 12, color: colors.error, border: "1px solid #FECACA" }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deleted Accounts History - Collapsible */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid " + colors.gray200, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <button
          onClick={() => setShowDeleted(!showDeleted)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          style={{ background: colors.gray50 }}>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-text-primary" style={{ fontSize: 16 }}>
              Deleted Accounts History
            </h3>
            <span className="rounded-full px-2 py-0.5 font-semibold"
              style={{ background: colors.errorSoft, color: colors.error, fontSize: 11 }}>
              {deletedAccounts.length}
            </span>
          </div>
          {showDeleted ? <ChevronUp size={20} color={colors.textSecondary} /> : <ChevronDown size={20} color={colors.textSecondary} />}
        </button>
        
        {showDeleted && (
          <>
            <div className="px-4 py-3 border-b" style={{ borderColor: colors.gray200 }}>
              <p className="text-text-secondary mb-3" style={{ fontSize: 13 }}>
                Accounts that have been permanently deleted. Data is preserved for audit purposes.
              </p>
              <DateFilter
                year={deleteFilters.year}
                month={deleteFilters.month}
                day={deleteFilters.day}
                onYearChange={(year) => setDeleteFilters({ year, month: null, day: null })}
                onMonthChange={(month) => setDeleteFilters((prev) => ({ ...prev, month, day: null }))}
                onDayChange={(day) => setDeleteFilters((prev) => ({ ...prev, day }))}
                onClear={() => setDeleteFilters({ year: null, month: null, day: null })}
              />
            </div>
            
            {deletedAccounts.length === 0 ? (
              <div className="text-center py-10 text-text-muted" style={{ fontSize: 14 }}>
                {deleteFilters.year || deleteFilters.month || deleteFilters.day 
                  ? "No deleted accounts found for the selected date range." 
                  : "No deleted accounts found."}
              </div>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table className="w-full border-collapse">
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr style={{ background: colors.gray50, borderBottom: "1px solid " + colors.gray200 }}>
                      {["Barangay", "Captain", "Email", "Created", "Deleted", "Deleted By"].map((h) => (
                        <th key={h} className="text-left font-semibold uppercase tracking-wide px-4 py-3"
                          style={{ fontSize: 11, color: colors.gray500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deletedAccounts.map((acc, i) => (
                      <tr key={acc.id} style={{ background: i % 2 === 0 ? "#fff" : colors.tableRowAlt, borderBottom: "1px solid #F3F4F6" }}>
                        <td className="px-4 py-3 font-semibold text-text-primary" style={{ fontSize: 13 }}>{acc.barangayName}</td>
                        <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{acc.captain}</td>
                        <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{acc.email}</td>
                        <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>
                          {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>
                          {acc.deletedAt ? new Date(acc.deletedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-text-secondary" style={{ fontSize: 13 }}>{acc.deletedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} 
        title={form.useExisting ? "Assign Existing Account to Barangay" : "Add Barangay Admin Account"}
        footer={<>
          <button onClick={() => setModalOpen(false)} disabled={saving}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || availableBarangays.length === 0}
            className="rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontSize: 14, background: colors.primary }}>
            {saving ? (form.useExisting ? "Assigning…" : "Creating…") : (form.useExisting ? "Assign Account" : "Create Account")}
          </button>
        </>}>
        <div className="flex flex-col gap-4">
          {apiError && (
            <div className="rounded-lg px-4 py-2.5 text-center font-medium"
              style={{ background: colors.errorSoft, color: colors.error, fontSize: 13 }}>{apiError}</div>
          )}

          {/* Toggle buttons: Use Existing vs Define New */}
          {inactiveUsers.length > 0 && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...EMPTY_BARANGAY_FORM, useExisting: true })}
                className="flex-1 flex flex-col items-center gap-2 rounded-xl px-4 py-4 font-semibold transition-all"
                style={{
                  fontSize: 14,
                  background: form.useExisting ? colors.accentSoft : colors.gray50,
                  color: form.useExisting ? colors.primary : colors.gray600,
                  border: `2px solid ${form.useExisting ? colors.primary : colors.gray200}`,
                }}>
                <RefreshCw size={20} color={form.useExisting ? colors.primary : colors.gray500} />
                <div className="text-center">
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Use Existing Credentials</div>
                  <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>({inactiveUsers.length} inactive account available)</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...EMPTY_BARANGAY_FORM, useExisting: false })}
                className="flex-1 flex flex-col items-center gap-2 rounded-xl px-4 py-4 font-semibold transition-all"
                style={{
                  fontSize: 14,
                  background: !form.useExisting ? colors.accentSoft : colors.gray50,
                  color: !form.useExisting ? colors.primary : colors.gray600,
                  border: `2px solid ${!form.useExisting ? colors.primary : colors.gray200}`,
                }}>
                <UserPlus size={20} color={!form.useExisting ? colors.primary : colors.gray500} />
                <div className="text-center">
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Define New Account</div>
                  <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Set up a new administrator profile</div>
                </div>
              </button>
            </div>
          )}

          {form.useExisting ? (
            <>
              {/* Select unassigned user */}
              <div className="flex flex-col gap-1">
                <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
                  Select Unassigned Account <span style={{ color: colors.error }}>*</span>
                </label>
                <select
                  value={form.existingUserId}
                  onChange={(e) => { setForm((p) => ({ ...p, existingUserId: e.target.value })); setFormErrors((p) => ({ ...p, existingUserId: undefined })); }}
                  className="rounded-lg px-3 py-2.5 outline-none"
                  style={{ fontSize: 14, border: formErrors.existingUserId ? "1.5px solid " + colors.error : "1.5px solid " + colors.gray200, background: colors.gray50 }}>
                  <option value="">-- Select an unassigned account --</option>
                  {inactiveUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email} {u.captain ? `(${u.captain})` : ""}
                    </option>
                  ))}
                </select>
                {formErrors.existingUserId && <span style={{ fontSize: 12, color: colors.error }}>{formErrors.existingUserId}</span>}
              </div>

              {/* Select barangay to assign to */}
              <div className="flex flex-col gap-1">
                <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
                  Assign to Barangay <span style={{ color: colors.error }}>*</span>
                </label>
                {availableBarangays.length === 0 ? (
                  <div className="rounded-xl px-4 py-6 text-center flex flex-col items-center gap-3"
                    style={{ background: colors.accentSoft, border: "1px solid " + colors.accentBorderLight }}>
                    <Building size={24} color={colors.primary} />
                    <div>
                      <p className="font-semibold text-text-primary" style={{ fontSize: 14 }}>
                        No Available Barangays
                      </p>
                      <p className="text-text-secondary" style={{ fontSize: 12 }}>
                        All barangays already have accounts assigned.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <select
                      value={form.name}
                      onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setFormErrors((p) => ({ ...p, name: undefined })); }}
                      className="rounded-lg px-3 py-2.5 outline-none"
                      style={{ fontSize: 14, border: formErrors.name ? "1.5px solid " + colors.error : "1.5px solid " + colors.gray200, background: colors.gray50 }}>
                      <option value="">-- Select a barangay --</option>
                      {availableBarangays.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.name && <span style={{ fontSize: 12, color: colors.error }}>{formErrors.name}</span>}
                  </>
                )}
              </div>

              {availableBarangays.length > 0 && (
                <div className="rounded-xl px-4 py-3"
                  style={{ background: colors.accentSoft, border: "1px solid " + colors.accentBorderLight }}>
                  <p style={{ fontSize: 12, color: colors.primary, lineHeight: 1.6 }}>
                    💡 This will reactivate the selected account and assign it to the chosen barangay.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Barangay dropdown */}
              <div className="flex flex-col gap-1">
                <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
                  Barangay <span style={{ color: colors.error }}>*</span>
                </label>
                
                {availableBarangays.length === 0 ? (
                  <div className="rounded-xl px-4 py-6 text-center flex flex-col items-center gap-3"
                    style={{ background: colors.accentSoft, border: "1px solid " + colors.accentBorderLight }}>
                    <Building size={24} color={colors.primary} />
                    <div>
                      <p className="font-semibold text-text-primary" style={{ fontSize: 14, marginBottom: "0.25rem" }}>
                        No Available Barangays
                      </p>
                      <p className="text-text-secondary" style={{ fontSize: 12 }}>
                        All barangays already have admin accounts. Create new barangays in <strong>Barangay Management</strong> first.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <select
                      value={form.name}
                      onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setFormErrors((p) => ({ ...p, name: undefined })); }}
                      className="rounded-lg px-3 py-2.5 outline-none"
                      style={{ fontSize: 14, border: formErrors.name ? "1.5px solid " + colors.error : "1.5px solid " + colors.gray200, background: colors.gray50 }}>
                      <option value="">-- Select a barangay --</option>
                      {availableBarangays.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.name && <span style={{ fontSize: 12, color: colors.error }}>{formErrors.name}</span>}
                  </>
                )}
              </div>

              {availableBarangays.length > 0 && (
                <>
                  <FormField label="Contact Person / Captain" value={form.captain}
                    onChange={(v) => { setForm((p) => ({ ...p, captain: v })); setFormErrors((p) => ({ ...p, captain: undefined })); }}
                    error={formErrors.captain} placeholder="e.g. Jose Reyes" required />
                  <FormField label="Email Address" type="email" value={form.email}
                    onChange={(v) => { setForm((p) => ({ ...p, email: v })); setFormErrors((p) => ({ ...p, email: undefined })); }}
                    error={formErrors.email} placeholder="barangay@besmart.gov.ph" required />
                  <FormField label="Temporary Password" type="password" value={form.tempPassword}
                    onChange={(v) => { setForm((p) => ({ ...p, tempPassword: v })); setFormErrors((p) => ({ ...p, tempPassword: undefined })); }}
                    error={formErrors.tempPassword} placeholder="Min. 8 characters" required />

                  <div className="rounded-xl px-4 py-3"
                    style={{ background: colors.accentSoft, border: "1px solid " + colors.accentBorderLight }}>
                    <p style={{ fontSize: 12, color: colors.primary, lineHeight: 1.6 }}>
                      💡 Account will be created with <strong>Punong Barangay</strong> role. The temporary password will be used for the first login.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Barangay Admin Account"
        footer={<>
          <button onClick={() => setDeleteTarget(null)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>Cancel</button>
          <button onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: colors.error }}>
            <Trash2 size={14} /> Delete
          </button>
        </>}>
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: colors.errorSoft, border: "1px solid " + colors.errorBorder }}>
              <Trash2 size={16} color={colors.error} className="flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: 13, color: colors.errorDark }}>
                This will permanently delete this account and all associated data. This action cannot be undone.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[
                { label: "Barangay Name", value: deleteTarget.name || "—" },
                { label: "Captain",       value: deleteTarget.captain || "—" },
                { label: "Email",         value: deleteTarget.email },
                { label: "Status",        value: deleteTarget.isActive ? "Enabled" : "Disabled" },
              ].map(({ label, value }) => (
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

      {/* Disable modal */}
      <Modal open={!!disableTarget} onClose={() => setDisableTarget(null)} title="Disable Barangay Admin Account"
        footer={<>
          <button onClick={() => setDisableTarget(null)}
            className="rounded-lg px-4 py-2 font-medium"
            style={{ fontSize: 14, border: "1.5px solid " + colors.gray200, color: colors.gray500 }}>Cancel</button>
          <button onClick={confirmDisable}
            className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, background: "#F97316" }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Disable Account
          </button>
        </>}>
        {disableTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div>
                <p className="font-semibold" style={{ fontSize: 13, color: "#C2410C", marginBottom: 4 }}>
                  This will suspend the account temporarily
                </p>
                <p style={{ fontSize: 12, color: "#C2410C" }}>
                  The Punong Barangay will not be able to log in until the account is re-enabled. This is useful for inspections, audits, or temporary suspensions. Account data will be preserved.
                </p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              {[
                { label: "Barangay Name", value: disableTarget.name || "—" },
                { label: "Captain",       value: disableTarget.captain || "—" },
                { label: "Email",         value: disableTarget.email },
                { label: "Current Status", value: "Enabled" },
              ].map(({ label, value }) => (
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

// UI UPDATE COMPLETE - Compact modern layout with tab-style filters