import { AuthSession, AuthUser } from '@/types/auth';

const AUTH_STORAGE_KEY = 'united_crm_auth_session';

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (session.expiresAt && Date.now() > session.expiresAt) {
      clearStoredSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('auth_session_changed'));
  } catch (err) {
    console.error('Failed to store auth session', err);
  }
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event('auth_session_changed'));
  } catch (err) {
    console.error('Failed to clear auth session', err);
  }
}

export function getAuthToken(): string | null {
  return getStoredSession()?.token ?? null;
}

export function getAuthUser(): AuthUser | null {
  return getStoredSession()?.user ?? null;
}

// Default initial user if unauthenticated for immediate high-fidelity viewing of the dashboard
export const DEFAULT_BRANCH_USER: AuthUser = {
  id: 'usr_eleanor_vance',
  name: 'Eleanor Vance',
  username: 'metro_admin',
  email: 'eleanor.vance@unitedins.com',
  role: 'ADMIN',
  branchId: 'br_metro_central_04',
  branchName: 'Metro Central Branch #04',
  designation: 'Branch Director / Admin',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaaCCDSetpUsgUpaY5QAD6PqqlhKNYNPNUjGth8p4MebIjj3zyLkI63THqiTSvbx1khgXZCAkZmTba78878ZsTsh1GLWblMtMdfYXv7PK3clipwRiL0pT4xoRWgU7483eJkdg3vK-Anw87ZIz0qAwpcWJPMHnzp38Ih8UCrl38lHWLe07YVhaOHqE_A95LQkgfD30WxMssorLfZHW7clStTJSdUTXsJCV0ieU0-jb10bUxYLByq71fmA',
};
