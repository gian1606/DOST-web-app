// ─── FormField — shared labelled text input ────────────────────────────────────
// Used by SA pages that have add/edit modals (UserManagement, BarangayManagement,
// OrganizationManagement, Notifications) and any other page that needs a simple
// label + input + error message field.

/**
 * @param {string}   label        — visible label text
 * @param {string}   [type]       — input type (default "text")
 * @param {string}   value        — controlled value
 * @param {Function} onChange     — called with the new string value
 * @param {string}   [error]      — validation error message (shown in red below input)
 * @param {string}   [placeholder]
 * @param {boolean}  [required]   — appends a red * to the label when true
 */
export default function FormField({ label, type = "text", value, onChange, error, placeholder, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded-lg px-3 py-2.5 outline-none bg-gray-50 ${error ? "border border-error" : "border border-gray-200"}`}
        style={{ fontSize: 14, borderWidth: "1.5px" }}
      />
      {error && <span className="text-error" style={{ fontSize: 12 }}>{error}</span>}
    </div>
  );
}
