// ─── Shared API client ────────────────────────────────────────────────────────
// Holds the auth token after login and attaches it to every request.
// Only services/ and context/AuthContext.jsx may import from this file.
// Pages and components never call api.* directly — they use service functions.

import { SESSION_KEYS } from "../constants/index.js";

const BASE_URL = import.meta.env.VITE_API_URL;

let _token = sessionStorage.getItem(SESSION_KEYS.TOKEN);

/** Called by AuthContext.login() to store the token. */
export function setToken(token) {
  _token = token;
  if (token) sessionStorage.setItem(SESSION_KEYS.TOKEN, token);
}

/** Called by AuthContext.logout() to clear the token. */
export function clearToken() {
  _token = null;
  sessionStorage.removeItem(SESSION_KEYS.TOKEN);
}

export function getToken() {
  return _token;
}

/**
 * Low-level request helper.
 * Attaches the Authorization header automatically when a token is present.
 * Throws an Error with the server's error message on non-2xx responses.
 */
async function request(method, path, { body, params } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  get:  (path, params) => request("GET", path, { params }),
  post: (path, body)   => request("POST", path, { body }),
  put:  (path, body)   => request("PUT", path, { body }),
  del:  (path)         => request("DELETE", path),
};
