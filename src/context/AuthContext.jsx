// ─── AuthContext — single source of truth for auth state ──────────────────────
//
// Owns isAuthenticated, user, role, token, login(), logout().
// Pages and components read auth via useAuth() — never via sessionStorage.
// AuthContext is the only module besides services/ that imports from api.js
// (it calls setToken / clearToken to keep the request wrapper in sync).

import { createContext, useContext, useState, useCallback } from "react";
import { SESSION_KEYS } from "../constants/index.js";
import { setToken, clearToken } from "../services/api.js";

const AuthContext = createContext(null);

/**
 * Initialize state from sessionStorage on mount / page reload.
 */
function readInitialUser() {
  const raw = sessionStorage.getItem(SESSION_KEYS.USER);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => sessionStorage.getItem(SESSION_KEYS.TOKEN));
  const [user, setUser]         = useState(readInitialUser);
  const [role, setRole]         = useState(() => sessionStorage.getItem(SESSION_KEYS.ROLE));

  const isAuthenticated = !!token;

  /**
   * Store token + user after a successful login.
   * Called by the Login page with the values returned by services/auth.js.
   */
  const login = useCallback((newToken, newUser) => {
    sessionStorage.setItem(SESSION_KEYS.TOKEN, newToken);
    sessionStorage.setItem(SESSION_KEYS.USER, JSON.stringify(newUser));
    sessionStorage.setItem(SESSION_KEYS.ROLE, newUser.role);
    setToken(newToken);          // sync the api.js request wrapper
    setTokenState(newToken);
    setUser(newUser);
    setRole(newUser.role);
  }, []);

  /**
   * Clear all auth state and redirect to login (caller handles navigation).
   */
  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEYS.TOKEN);
    sessionStorage.removeItem(SESSION_KEYS.USER);
    sessionStorage.removeItem(SESSION_KEYS.ROLE);
    clearToken();                // sync the api.js request wrapper
    setTokenState(null);
    setUser(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Access auth state from any component inside <AuthProvider>.
 * Throws if used outside the provider — catches wiring mistakes early.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
