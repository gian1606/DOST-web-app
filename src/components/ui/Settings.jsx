import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle, Mail, Shield, KeyRound, LogOut,
  CheckCircle, Eye, EyeOff, AlertTriangle,
} from "lucide-react";

// ── Reusable field ────────────────────────────────────────────────────────────
function Field({ label, value, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <div className="rounded-lg px-3 py-2.5 font-medium text-text-primary" style={{ fontSize: 14, background: "#F9FAFB", border: "1.5px solid #E5E7EB" }}>
        {value}
      </div>
      {hint && <span className="text-text-muted" style={{ fontSize: 11 }}>{hint}</span>}
    </div>
  );
}

function PasswordInput({ label, value, onChange, error, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg px-3 py-2.5 pr-10 outline-none"
          style={{ fontSize: 14, border: error ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB", background: "#F9FAFB" }}
        />
        <button type="button" onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, description, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
        <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 36, height: 36, background: "#E8F5E9" }}>
          <Icon size={18} color="#2E7D32" />
        </div>
        <div>
          <div className="font-semibold text-text-primary" style={{ fontSize: 15 }}>{title}</div>
          {description && <div className="text-text-muted" style={{ fontSize: 12 }}>{description}</div>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/**
 * Shared Settings page used by all roles.
 *
 * Props:
 *   profile   – { name, email, role, scope }   (read-only display)
 *   logoutKey – sessionStorage key to clear on sign out
 *   logoutPath – redirect path after sign out (default "/login")
 */
export default function SettingsPage({ profile, logoutKey, logoutPath = "/login" }) {
  const navigate = useNavigate();

  // ── Change password state ─────────────────────────────────────────────────
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSuccess, setPwSuccess] = useState(false);

  function validatePassword() {
    const e = {};
    if (!pw.current)           e.current  = "Current password is required.";
    if (!pw.next)              e.next     = "New password is required.";
    else if (pw.next.length < 8) e.next   = "Password must be at least 8 characters.";
    if (!pw.confirm)           e.confirm  = "Please confirm your new password.";
    else if (pw.next !== pw.confirm) e.confirm = "Passwords do not match.";
    return e;
  }

  function handleChangePassword(e) {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    // Mock success — in production this would call the API
    setPwSuccess(true);
    setPw({ current: "", next: "", confirm: "" });
    setPwErrors({});
    setTimeout(() => setPwSuccess(false), 4000);
  }

  function handleSignOut() {
    if (logoutKey) sessionStorage.removeItem(logoutKey);
    // Also clear common auth keys
    sessionStorage.removeItem("bs_auth");
    sessionStorage.removeItem("bs_role");
    navigate(logoutPath);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="font-bold text-text-primary" style={{ fontSize: 28 }}>Settings</h1>
        <p className="text-text-secondary mt-0.5" style={{ fontSize: 14 }}>
          Manage your account profile and security preferences
        </p>
      </div>

      {/* ── Account Profile ─────────────────────────────────────────────── */}
      <Section title="Account Profile" description="Your identity and role information" icon={UserCircle}>
        <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: "1px solid #F3F4F6" }}>
          <div className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 60, height: 60, background: "#E8F5E9", border: "3px solid #C8E6C9" }}>
            <UserCircle size={34} color="#2E7D32" />
          </div>
          <div>
            <div className="font-bold text-text-primary" style={{ fontSize: 18 }}>{profile.name}</div>
            <div className="text-text-secondary" style={{ fontSize: 13 }}>{profile.email}</div>
            <span className="inline-block mt-1 rounded-full px-2.5 py-0.5 font-semibold"
              style={{ fontSize: 11, background: "#E8F5E9", color: "#2E7D32" }}>
              {profile.role}
            </span>
          </div>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          <Field label="Full Name" value={profile.name} />
          <Field label="Email Address" value={profile.email} />
          <Field label="Role" value={profile.role} />
          {profile.scope && <Field label={profile.scopeLabel ?? "Assigned To"} value={profile.scope} />}
        </div>
        <p className="mt-4 text-text-muted" style={{ fontSize: 12 }}>
          Profile details are managed by the system administrator. Contact your supervisor to request changes.
        </p>
      </Section>

      {/* ── Change Password ─────────────────────────────────────────────── */}
      <Section title="Change Password" description="Update your login credentials" icon={KeyRound}>
        {pwSuccess && (
          <div className="flex items-center gap-2 rounded-lg px-4 py-3 mb-4"
            style={{ background: "#E8F5E9", border: "1px solid #C8E6C9" }}>
            <CheckCircle size={15} color="#2E7D32" />
            <span style={{ fontSize: 13, color: "#2E7D32", fontWeight: 600 }}>
              Password updated successfully.
            </span>
          </div>
        )}
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4" style={{ maxWidth: 440 }}>
          <PasswordInput label="Current Password" value={pw.current}
            onChange={(v) => { setPw((p) => ({ ...p, current: v })); setPwErrors((p) => ({ ...p, current: undefined })); }}
            error={pwErrors.current} placeholder="Enter your current password" />
          <PasswordInput label="New Password" value={pw.next}
            onChange={(v) => { setPw((p) => ({ ...p, next: v })); setPwErrors((p) => ({ ...p, next: undefined })); }}
            error={pwErrors.next} placeholder="Min. 8 characters" />
          <PasswordInput label="Confirm New Password" value={pw.confirm}
            onChange={(v) => { setPw((p) => ({ ...p, confirm: v })); setPwErrors((p) => ({ ...p, confirm: undefined })); }}
            error={pwErrors.confirm} placeholder="Re-enter new password" />
          <div>
            <button type="submit"
              className="rounded-lg px-5 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, background: "#2E7D32" }}>
              Update Password
            </button>
          </div>
        </form>
      </Section>

      {/* ── Account Security Info ───────────────────────────────────────── */}
      <Section title="Access & Security" description="Session and access information" icon={Shield}>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          <Field label="Account Status" value="Active" hint="Your account is in good standing." />
          <Field label="Session" value="Active — this device" hint="You are currently signed in." />
        </div>
      </Section>

      {/* ── Sign Out ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #FECACA", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "#FECACA" }}>
          <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 36, height: 36, background: "#FFEBEE" }}>
            <AlertTriangle size={18} color="#DC2626" />
          </div>
          <div>
            <div className="font-semibold" style={{ fontSize: 15, color: "#DC2626" }}>Sign Out</div>
            <div className="text-text-muted" style={{ fontSize: 12 }}>End your current session</div>
          </div>
        </div>
        <div className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-text-secondary" style={{ fontSize: 13 }}>
            Signing out will end your session on this device. You will need to log in again to access the dashboard.
          </p>
          <button onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold hover:opacity-90 transition-opacity flex-shrink-0 text-white"
            style={{ fontSize: 14, background: "#DC2626" }}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
