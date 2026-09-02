import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// Role → dashboard route mapping
const ROLE_ROUTES = {
  super_admin:     "/super-admin/dashboard",
  cluster_admin:   "/cluster-admin/dashboard",
  collector_admin: "/ca/dashboard",
  punong_barangay: "/pb/dashboard",
};

/* ── Floating-label field ───────────────────────────────────────────────── */
function FloatingField({ id, label, type = "text", value, onChange, error, rightSlot }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="flex flex-col gap-1">
      <div style={{ position: "relative" }}>
        <label
          htmlFor={id}
          style={{
            position: "absolute",
            left: 14,
            top: lifted ? 6 : "50%",
            transform: lifted ? "none" : "translateY(-50%)",
            fontSize: lifted ? 10 : 14,
            fontWeight: lifted ? 600 : 400,
            color: focused
              ? "#86EFAC"
              : error
              ? "#FCA5A5"
              : "rgba(255,255,255,0.50)",
            pointerEvents: "none",
            transition: "top 0.16s ease, font-size 0.16s ease, color 0.16s ease",
            letterSpacing: lifted ? 0.3 : 0,
            zIndex: 1,
          }}
        >
          {label}
        </label>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={type === "password" ? "current-password" : "email"}
          style={{
            width: "100%",
            paddingTop: lifted ? 20 : 12,
            paddingBottom: lifted ? 6 : 12,
            paddingLeft: 14,
            paddingRight: rightSlot ? 44 : 14,
            fontSize: 14,
            color: "#fff",
            background: "rgba(255,255,255,0.10)",
            border: `1.5px solid ${
              error
                ? "rgba(220,38,38,0.8)"
                : focused
                ? "#2E7D32"
                : "rgba(255,255,255,0.20)"
            }`,
            borderRadius: 10,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.16s, padding 0.16s",
            minHeight: 52,
          }}
        />

        {rightSlot && (
          <div
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {rightSlot}
          </div>
        )}
      </div>

      {error && (
        <span style={{ fontSize: 12, color: "#FCA5A5", paddingLeft: 2 }}>{error}</span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error || "Invalid email or password. Please try again." });
        setLoading(false);
        return;
      }

      // Store token and user info
      sessionStorage.setItem("bs_token", data.token);
      sessionStorage.setItem("bs_user",  JSON.stringify(data.user));
      sessionStorage.setItem("bs_role",  data.user.role);

      // Redirect based on role
      const route = ROLE_ROUTES[data.user.role];
      if (route) {
        navigate(route);
      } else {
        setErrors({ form: "Your account does not have access to this portal." });
        sessionStorage.clear();
        setLoading(false);
      }
    } catch {
      setErrors({ form: "Unable to connect to the server. Please try again." });
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "#111827" }}
    >
      {/* Blurred background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/login-bg.png')",
          filter: "blur(6px)",
          transform: "scale(1.05)",
        }}
      />
      {/* Dark scrim */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />

      {/* ── Glassmorphism card ── */}
      <div
        className="relative z-10 w-full flex flex-col items-center"
        style={{
          maxWidth: 480,
          borderRadius: 20,
          padding: 40,
          background: "rgba(10,30,15,0.62)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1.5px solid rgba(255,255,255,0.22)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {/* Seal */}
        <img
          src="/Batangas_logo.png"
          alt="Batangas City Seal"
          className="mb-4"
          style={{
            width: 80,
            height: 80,
            objectFit: "contain",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
          }}
        />

        {/* Wordmark */}
        <div
          className="font-bold text-center"
          style={{ fontSize: 28, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}
        >
          BE-SMART
        </div>
        <div
          className="text-center mt-1 mb-6"
          style={{ fontSize: 12, color: "#86EFAC", maxWidth: 320, lineHeight: 1.5 }}
        >
          Batangas Environmental Segregation, Monitoring,
          <br />
          Analytics &amp; Rewards Technology
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4" noValidate>
          {errors.form && (
            <div
              className="rounded-lg px-4 py-3 text-center font-medium"
              style={{
                background: "rgba(220,38,38,0.18)",
                color: "#FCA5A5",
                fontSize: 13,
                border: "1px solid rgba(220,38,38,0.35)",
              }}
            >
              {errors.form}
            </div>
          )}

          <FloatingField
            id="login-email"
            label="Email Address"
            type="email"
            value={email}
            error={errors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => ({ ...p, email: undefined, form: undefined }));
            }}
          />

          <FloatingField
            id="login-password"
            label="Password"
            type={showPw ? "text" : "password"}
            value={password}
            error={errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((p) => ({ ...p, password: undefined, form: undefined }));
            }}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "rgba(255,255,255,0.50)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold text-white mt-1"
            style={{
              background: loading
                ? "rgba(46,125,50,0.6)"
                : "linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)",
              fontSize: 15,
              border: "1px solid rgba(46,125,50,0.5)",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px rgba(46,125,50,0.35)",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.boxShadow = "0 6px 22px rgba(46,125,50,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(46,125,50,0.35)";
            }}
          >
            {loading ? "Signing in…" : "Sign In to Dashboard"}
          </button>
        </form>

        {/* Security note */}
        <div
          className="flex items-center gap-1.5 mt-5"
          style={{ fontSize: 12, color: "rgba(255,255,255,0.40)" }}
        >
          <Lock size={12} />
          <span>Secured access · Batangas City Government</span>
        </div>
      </div>

      {/* Autofill override */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(10,30,15,0.92) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
      `}</style>
    </div>
  );
}
