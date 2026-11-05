// ─── Barangay Management (Super Admin) ───────────────────────────────────────
// Full CRUD interface for managing barangays dynamically.
// Zero barangays on first install — Super Admin creates them via UI.

import { useState, useEffect } from "react";
import { Building2, Plus, Edit2, Trash2, Mail, User, Search, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import DateFilter from "../../../components/ui/DateFilter.jsx";
import FormField from "../../../components/ui/FormField.jsx";
import { colors } from "../../../theme/colors.js";
import {
  fetchBarangays,
  createBarangay,
  updateBarangay,
  deleteBarangay,
  fetchDeletedBarangays,
} from "../../../services/superAdmin.js";

const EMPTY_FORM = { name: "" };

export default function BarangayManagement() {
  const [barangays, setBarangays] = useState([]);
  const [deletedBarangays, setDeletedBarangays] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteFilters, setDeleteFilters] = useState({ year: null, month: null, day: null });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBarangay, setEditingBarangay] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBarangays();
    loadDeletedBarangays();
  }, []);

  // Refetch deleted barangays when filters change
  useEffect(() => {
    if (showDeleted) {
      loadDeletedBarangays();
    }
  }, [deleteFilters, showDeleted]);

  async function loadBarangays() {
    setLoading(true);
    try {
      const data = await fetchBarangays();
      setBarangays(data);
    } catch (err) {
      console.error("Failed to load barangays:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadDeletedBarangays() {
    try {
      const data = await fetchDeletedBarangays(deleteFilters);
      setDeletedBarangays(data);
    } catch (err) {
      console.error("Failed to load deleted barangays:", err);
    }
  }

  // ── Create ────────────────────────────────────────────────────────────────
  async function handleCreate() {
    if (!form.name.trim()) {
      setError("Barangay name is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const newBarangay = await createBarangay({ name: form.name });
      setBarangays((prev) => [...prev, newBarangay]);
      setShowCreateModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message || "Failed to create barangay.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  function openEditModal(barangay) {
    setEditingBarangay(barangay);
    setForm({
      name: barangay.name,
    });
    setShowEditModal(true);
    setError("");
  }

  async function handleUpdate() {
    if (!form.name.trim()) {
      setError("Barangay name is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const updated = await updateBarangay(editingBarangay.id, { name: form.name });
      setBarangays((prev) =>
        prev.map((b) => (b.id === editingBarangay.id ? { ...b, ...updated } : b))
      );
      setShowEditModal(false);
      setEditingBarangay(null);
      setForm(EMPTY_FORM);
      
      // Broadcast event so other pages can refresh (e.g., User Management, PB Dashboard)
      window.dispatchEvent(new CustomEvent('barangayUpdated', { 
        detail: { oldName: editingBarangay.name, newName: form.name }
      }));
    } catch (err) {
      setError(err.message || "Failed to update barangay.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(barangay) {
    if (
      !confirm(
        `Delete barangay "${barangay.name}"?\n\nThis will unassign it from any cluster and may affect ${barangay.totalBins} bins and ${barangay.activeResidents} residents.`
      )
    )
      return;

    try {
      await deleteBarangay(barangay.id);
      setBarangays((prev) => prev.filter((b) => b.id !== barangay.id));
    } catch (err) {
      alert(err.message || "Failed to delete barangay.");
    }
  }

  // ── Toggle Status ─────────────────────────────────────────────────────────
  // ── Filter ────────────────────────────────────────────────────────────────
  // Filter barangays by search only
  const filteredBarangays = barangays.filter((b) => {
    return b.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.textHeading, marginBottom: "0.5rem" }}>
            Barangay Management
          </h1>
          <p style={{ fontSize: 14, color: colors.textSecondary }}>
            Create and manage barangays across Batangas City
          </p>
          <div style={{ marginTop: "0.75rem", padding: "0.65rem 1rem", background: colors.infoSoft, border: `1px solid ${colors.infoBorder}`, borderRadius: 8 }}>
            <p style={{ fontSize: 12, color: colors.blueDark, margin: 0 }}>
              ℹ️ <strong>Note:</strong> This page is for managing barangay records only. To create user accounts for Punong Barangay, go to <strong>User Management</strong>.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setForm(EMPTY_FORM);
            setError("");
            setShowCreateModal(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            background: colors.primary,
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={18} />
          Add Barangay
        </button>
      </div>

      {/* Search */}
      {/* Search and Filter */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            position: "relative",
            flex: 1,
            maxWidth: 400,
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: colors.textMuted,
            }}
          />
          <input
            type="text"
            placeholder="Search barangays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.65rem 1rem 0.65rem 2.75rem",
              border: `1px solid ${colors.gray200}`,
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Empty State */}
      {!loading && barangays.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: colors.gray50,
            borderRadius: 12,
            border: `2px dashed ${colors.gray200}`,
          }}
        >
          <Building2 size={56} style={{ color: colors.gray400, margin: "0 auto 1.5rem" }} />
          <h3 style={{ fontSize: 20, fontWeight: 600, color: colors.textSecondary, marginBottom: "0.75rem" }}>
            No Barangays Yet
          </h3>
          <p style={{ fontSize: 14, color: colors.gray500, marginBottom: "1.5rem", maxWidth: 420, margin: "0 auto 1.5rem" }}>
            Get started by creating your first barangay. Barangays are used to organize bins, residents, and admins across the city.
          </p>
          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setError("");
              setShowCreateModal(true);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: colors.primary,
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={18} />
            Create First Barangay
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && filteredBarangays.length > 0 && (
        <div style={{ background: "white", borderRadius: 12, overflow: "hidden", border: `1px solid ${colors.gray200}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: colors.gray100, borderBottom: `1px solid ${colors.gray200}` }}>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: colors.gray500 }}>
                  Barangay
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: colors.gray500 }}>
                  Captain
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: colors.gray500 }}>
                  Contact Email
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontSize: 13, fontWeight: 600, color: colors.gray500 }}>
                  Bins
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontSize: 13, fontWeight: 600, color: colors.gray500 }}>
                  Residents
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontSize: 13, fontWeight: 600, color: colors.gray500 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBarangays.map((barangay) => (
                <tr key={barangay.id} style={{ borderBottom: `1px solid ${colors.gray100}` }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: colors.barangayAvatarGradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MapPin size={18} style={{ color: "white" }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                        {barangay.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem", fontSize: 14, color: colors.gray500 }}>
                    {barangay.captain || <span style={{ color: colors.gray400, fontStyle: "italic" }}>Not set</span>}
                  </td>
                  <td style={{ padding: "1rem", fontSize: 14, color: colors.gray500 }}>
                    {barangay.email || <span style={{ color: colors.gray400, fontStyle: "italic" }}>Not set</span>}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center", fontSize: 14, color: colors.textSecondary, fontWeight: 600 }}>
                    {barangay.totalBins}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center", fontSize: 14, color: colors.textSecondary, fontWeight: 600 }}>
                    {barangay.activeResidents}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button
                        onClick={() => openEditModal(barangay)}
                        style={{
                          padding: "0.5rem",
                          border: `1px solid ${colors.gray200}`,
                          borderRadius: 6,
                          background: "white",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Edit"
                      >
                        <Edit2 size={16} style={{ color: colors.gray500 }} />
                      </button>
                      <button
                        onClick={() => handleDelete(barangay)}
                        style={{
                          padding: "0.5rem",
                          border: `1px solid ${colors.errorBorder}`,
                          borderRadius: 6,
                          background: "white",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} style={{ color: colors.error }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>
          Loading barangays...
        </div>
      )}

      {/* No Results */}
      {!loading && barangays.length > 0 && filteredBarangays.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>
          No barangays match "{searchQuery}"
        </div>
      )}

      {/* Deleted Barangays History - Collapsible */}
      <div style={{
        background: colors.white,
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${colors.gray200}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        <button
          onClick={() => setShowDeleted(!showDeleted)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.5rem",
            background: colors.gray50,
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = colors.gray100}
          onMouseLeave={(e) => e.currentTarget.style.background = colors.gray50}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
              Deleted Barangays History
            </h3>
            <span style={{
              borderRadius: "9999px",
              padding: "0.125rem 0.5rem",
              fontSize: 11,
              fontWeight: 600,
              background: colors.errorSoft,
              color: colors.error
            }}>
              {deletedBarangays.length}
            </span>
          </div>
          {showDeleted ? <ChevronUp size={20} color={colors.gray500} /> : <ChevronDown size={20} color={colors.gray500} />}
        </button>

        {showDeleted && (
          <>
            <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${colors.gray200}` }}>
              <p style={{ fontSize: 13, color: colors.gray500, marginBottom: "1rem" }}>
                Barangays that have been deleted. Data is preserved for audit purposes.
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

            {deletedBarangays.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem", color: colors.gray400, fontSize: 14 }}>
                {deleteFilters.year || deleteFilters.month || deleteFilters.day
                  ? "No deleted barangays found for the selected date range."
                  : "No deleted barangays found."}
              </div>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr style={{ background: colors.gray50, borderBottom: `1px solid ${colors.gray200}` }}>
                      {["Barangay Name", "Captain", "Email", "Created", "Deleted", "Deleted By"].map((h) => (
                        <th key={h} style={{
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: colors.gray500,
                          padding: "0.75rem 1rem"
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deletedBarangays.map((b, i) => (
                      <tr key={b.id} style={{
                        background: i % 2 === 0 ? colors.white : colors.gray50,
                        borderBottom: `1px solid ${colors.gray100}`
                      }}>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                          {b.name}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, color: colors.gray500 }}>
                          {b.captain || "—"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, color: colors.gray500 }}>
                          {b.email || "—"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, color: colors.gray500 }}>
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, color: colors.gray500 }}>
                          {b.deletedAt ? new Date(b.deletedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, color: colors.gray500 }}>
                          {b.deletedBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          title="Add New Barangay"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          submitting={submitting}
          submitLabel="Create Barangay"
        >
          <FormField
            label="Barangay Name"
            required
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g., Alangilan"
          />
          {error && (
            <div style={{ padding: "0.75rem", background: colors.errorSoft, borderRadius: 8, marginTop: "1rem" }}>
              <p style={{ fontSize: 13, color: colors.errorDark, margin: 0 }}>{error}</p>
            </div>
          )}
          <div style={{ padding: "0.75rem", background: colors.infoSoft, borderRadius: 8, marginTop: "1rem" }}>
            <p style={{ fontSize: 12, color: colors.blueDark, margin: 0 }}>
              ℹ️ Captain name and contact email will be added when you create a Punong Barangay account in <strong>User Management</strong>.
            </p>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Modal
          title="Edit Barangay"
          onClose={() => {
            setShowEditModal(false);
            setEditingBarangay(null);
            setForm(EMPTY_FORM);
          }}
          onSubmit={handleUpdate}
          submitting={submitting}
          submitLabel="Save Changes"
        >
          <FormField
            label="Barangay Name"
            required
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g., Alangilan"
          />
          {error && (
            <div style={{ padding: "0.75rem", background: colors.errorSoft, borderRadius: 8, marginTop: "1rem" }}>
              <p style={{ fontSize: 13, color: colors.errorDark, margin: 0 }}>{error}</p>
            </div>
          )}
          <div style={{ padding: "0.75rem", background: colors.infoSoft, borderRadius: 8, marginTop: "1rem" }}>
            <p style={{ fontSize: 12, color: colors.blueDark, margin: 0 }}>
              ℹ️ Captain and contact information is managed through the Punong Barangay user account in <strong>User Management</strong>.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose, onSubmit, submitting, submitLabel = "Submit" }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          width: "90%",
          maxWidth: 500,
          padding: "2rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: "1.5rem", color: colors.textPrimary }}>
          {title}
        </h2>
        {children}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "0.75rem",
              border: `1px solid ${colors.gray200}`,
              borderRadius: 8,
              background: "white",
              fontSize: 14,
              fontWeight: 600,
              color: colors.gray500,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "none",
              borderRadius: 8,
              background: colors.primary,
              fontSize: 14,
              fontWeight: 600,
              color: "white",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
