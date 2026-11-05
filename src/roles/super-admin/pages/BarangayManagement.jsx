// ─── Barangay Management (Super Admin) ───────────────────────────────────────
// Full CRUD interface for managing barangays dynamically.
// Zero barangays on first install — Super Admin creates them via UI.

import { useState, useEffect } from "react";
import { Building2, Plus, Edit2, Trash2, Mail, User, Search, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import DateFilter from "../../../components/ui/DateFilter.jsx";
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
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", marginBottom: "0.5rem" }}>
            Barangay Management
          </h1>
          <p style={{ fontSize: 14, color: "#666" }}>
            Create and manage barangays across Batangas City
          </p>
          <div style={{ marginTop: "0.75rem", padding: "0.65rem 1rem", background: "#E3F2FD", border: "1px solid #90CAF9", borderRadius: 8 }}>
            <p style={{ fontSize: 12, color: "#1565C0", margin: 0 }}>
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
            background: "#2E7D32",
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
              color: "#999",
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
              border: "1px solid #E0E0E0",
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
            background: "#F9F9F9",
            borderRadius: 12,
            border: "2px dashed #E0E0E0",
          }}
        >
          <Building2 size={56} style={{ color: "#BDBDBD", margin: "0 auto 1.5rem" }} />
          <h3 style={{ fontSize: 20, fontWeight: 600, color: "#424242", marginBottom: "0.75rem" }}>
            No Barangays Yet
          </h3>
          <p style={{ fontSize: 14, color: "#757575", marginBottom: "1.5rem", maxWidth: 420, margin: "0 auto 1.5rem" }}>
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
              background: "#2E7D32",
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
        <div style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid #E0E0E0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F5F5F5", borderBottom: "1px solid #E0E0E0" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#616161" }}>
                  Barangay
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#616161" }}>
                  Captain
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#616161" }}>
                  Contact Email
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#616161" }}>
                  Bins
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#616161" }}>
                  Residents
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#616161" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBarangays.map((barangay) => (
                <tr key={barangay.id} style={{ borderBottom: "1px solid #F0F0F0" }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MapPin size={18} style={{ color: "white" }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#212121" }}>
                        {barangay.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem", fontSize: 14, color: "#616161" }}>
                    {barangay.captain || <span style={{ color: "#BDBDBD", fontStyle: "italic" }}>Not set</span>}
                  </td>
                  <td style={{ padding: "1rem", fontSize: 14, color: "#616161" }}>
                    {barangay.email || <span style={{ color: "#BDBDBD", fontStyle: "italic" }}>Not set</span>}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center", fontSize: 14, color: "#424242", fontWeight: 600 }}>
                    {barangay.totalBins}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center", fontSize: 14, color: "#424242", fontWeight: 600 }}>
                    {barangay.activeResidents}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button
                        onClick={() => openEditModal(barangay)}
                        style={{
                          padding: "0.5rem",
                          border: "1px solid #E0E0E0",
                          borderRadius: 6,
                          background: "white",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Edit"
                      >
                        <Edit2 size={16} style={{ color: "#616161" }} />
                      </button>
                      <button
                        onClick={() => handleDelete(barangay)}
                        style={{
                          padding: "0.5rem",
                          border: "1px solid #FFCDD2",
                          borderRadius: 6,
                          background: "white",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} style={{ color: "#D32F2F" }} />
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
        <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
          Loading barangays...
        </div>
      )}

      {/* No Results */}
      {!loading && barangays.length > 0 && filteredBarangays.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
          No barangays match "{searchQuery}"
        </div>
      )}

      {/* Deleted Barangays History - Collapsible */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #E5E7EB",
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
            background: "#F9FAFB",
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#F3F4F6"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#F9FAFB"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1F2937", margin: 0 }}>
              Deleted Barangays History
            </h3>
            <span style={{
              borderRadius: "9999px",
              padding: "0.125rem 0.5rem",
              fontSize: 11,
              fontWeight: 600,
              background: "#FEE2E2",
              color: "#DC2626"
            }}>
              {deletedBarangays.length}
            </span>
          </div>
          {showDeleted ? <ChevronUp size={20} color="#6B7280" /> : <ChevronDown size={20} color="#6B7280" />}
        </button>

        {showDeleted && (
          <>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #E5E7EB" }}>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: "1rem" }}>
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
              <div style={{ textAlign: "center", padding: "2.5rem", color: "#9CA3AF", fontSize: 14 }}>
                {deleteFilters.year || deleteFilters.month || deleteFilters.day
                  ? "No deleted barangays found for the selected date range."
                  : "No deleted barangays found."}
              </div>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                      {["Barangay Name", "Captain", "Email", "Created", "Deleted", "Deleted By"].map((h) => (
                        <th key={h} style={{
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "#6B7280",
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
                        background: i % 2 === 0 ? "#fff" : "#F9FAFB",
                        borderBottom: "1px solid #F3F4F6"
                      }}>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, fontWeight: 600, color: "#1F2937" }}>
                          {b.name}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, color: "#6B7280" }}>
                          {b.captain || "—"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, color: "#6B7280" }}>
                          {b.email || "—"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, color: "#6B7280" }}>
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, color: "#6B7280" }}>
                          {b.deletedAt ? new Date(b.deletedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: 13, color: "#6B7280" }}>
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
            icon={<Building2 size={18} />}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Alangilan"
          />
          {error && (
            <div style={{ padding: "0.75rem", background: "#FFEBEE", borderRadius: 8, marginTop: "1rem" }}>
              <p style={{ fontSize: 13, color: "#C62828", margin: 0 }}>{error}</p>
            </div>
          )}
          <div style={{ padding: "0.75rem", background: "#E3F2FD", borderRadius: 8, marginTop: "1rem" }}>
            <p style={{ fontSize: 12, color: "#1565C0", margin: 0 }}>
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
            icon={<Building2 size={18} />}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Alangilan"
          />
          {error && (
            <div style={{ padding: "0.75rem", background: "#FFEBEE", borderRadius: 8, marginTop: "1rem" }}>
              <p style={{ fontSize: 13, color: "#C62828", margin: 0 }}>{error}</p>
            </div>
          )}
          <div style={{ padding: "0.75rem", background: "#E3F2FD", borderRadius: 8, marginTop: "1rem" }}>
            <p style={{ fontSize: 12, color: "#1565C0", margin: 0 }}>
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
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: "1.5rem", color: "#212121" }}>
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
              border: "1px solid #E0E0E0",
              borderRadius: 8,
              background: "white",
              fontSize: 14,
              fontWeight: 600,
              color: "#616161",
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
              background: "#2E7D32",
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

// ── Form Field ────────────────────────────────────────────────────────────────
function FormField({ label, icon, required, ...props }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#424242", marginBottom: "0.5rem" }}>
        {label} {required && <span style={{ color: "#D32F2F" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#999" }}>
            {icon}
          </div>
        )}
        <input
          {...props}
          style={{
            width: "100%",
            padding: icon ? "0.75rem 1rem 0.75rem 2.75rem" : "0.75rem 1rem",
            border: "1px solid #E0E0E0",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}
