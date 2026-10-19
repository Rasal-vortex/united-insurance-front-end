const AUTH_STORAGE_KEY = "united_crm_auth_session";
export function getStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.expiresAt && Date.now() > session.expiresAt) {
      clearStoredSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}
export function setStoredSession(session) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("auth_session_changed"));
  } catch (err) {
    console.error("Failed to store auth session", err);
  }
}
export function clearStoredSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event("auth_session_changed"));
  } catch (err) {
    console.error("Failed to clear auth session", err);
  }
}
export function getAuthToken() {
  return getStoredSession()?.token ?? null;
}
export function getAuthUser() {
  return getStoredSession()?.user ?? null;
}
