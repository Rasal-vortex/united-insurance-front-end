import { apiClient } from '@/lib/api-client';
import { AdminLoginRequest, BranchLoginRequest, LoginResponse } from '@/types/auth';
import { setStoredSession, clearStoredSession } from '@/lib/auth';

export const authService = {
  async loginAdmin(credentials: AdminLoginRequest): Promise<LoginResponse> {
    const res = await apiClient<LoginResponse>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setStoredSession({
      token: res.token,
      user: res.user,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    });
    return res;
  },

  async loginBranch(credentials: BranchLoginRequest): Promise<LoginResponse> {
    const res = await apiClient<LoginResponse>('/api/auth/branch/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setStoredSession({
      token: res.token,
      user: res.user,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    });
    return res;
  },

  logout(): void {
    clearStoredSession();
  },
};
