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

    } catch (err) {
      setErrors({ form: "Unable to connect to the server. Please try again." });
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "#111827" }}
    >
      {/* Background image with blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/login-bg.png')",
          filter: "blur(6px)",
          transform: "scale(1.05)",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />

      <div
        className="relative z-10 w-full bg-white flex flex-col items-center"
        style={{
          maxWidth: 480,
          borderRadius: 16,
          padding: 40,
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        }}
      >
        {/* Seal */}
        <img
          src="/Batangas_logo.png"
          alt="Batangas City Seal"
          className="mb-4"
          style={{ width: 80, height: 80, objectFit: "contain" }}
        />

        {/* Wordmark */}
        <div className="font-bold text-text-primary text-center" style={{ fontSize: 28 }}>
          BE-SMART
        </div>
        <div
          className="text-center mt-1 mb-5"
          style={{ fontSize: 12, color: "#388E3C", maxWidth: 320, lineHeight: 1.5 }}
        >
          Batangas Environmental Segregation, Monitoring,
          <br />Analytics &amp; Rewards Technology
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4" noValidate>
          {errors.form && (
            <div
              className="rounded-lg px-4 py-3 text-center font-medium"
              style={{ background: "#FFEBEE", color: "#DC2626", fontSize: 13 }}
            >
              {errors.form}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined, form: undefined }));
              }}
              placeholder="superadmin@besmart.gov.ph"
              className="w-full rounded-lg px-4 py-2.5 outline-none transition-colors"
              style={{
                fontSize: 14,
                border: errors.email ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB",
                background: "#F9FAFB",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
              onBlur={(e)  => (e.target.style.borderColor = errors.email ? "#DC2626" : "#E5E7EB")}
            />
            {errors.email && (
              <span style={{ fontSize: 12, color: "#DC2626" }}>{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-text-primary" style={{ fontSize: 13 }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: undefined, form: undefined }));
                }}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-2.5 pr-11 outline-none transition-colors"
                style={{
                  fontSize: 14,
                  border: errors.password ? "1.5px solid #DC2626" : "1.5px solid #E5E7EB",
                  background: "#F9FAFB",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2E7D32")}
                onBlur={(e)  => (e.target.style.borderColor = errors.password ? "#DC2626" : "#E5E7EB")}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span style={{ fontSize: 12, color: "#DC2626" }}>{errors.password}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 font-semibold text-white transition-opacity mt-1"
            style={{
              background: "#2E7D32",
              fontSize: 15,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign In to Dashboard"}
          </button>
        </form>

        {/* Security note */}
        <div
          className="flex items-center gap-1.5 mt-5"
          style={{ fontSize: 12, color: "#9CA3AF" }}
        >
          <Lock size={12} />
          <span>Secured access · Batangas City Government</span>
        </div>
      </div>
    </div>
  );
}
