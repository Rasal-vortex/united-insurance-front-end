import React, { useState } from 'react';
import { authService } from '@/services/auth-service';
import { AuthUser } from '@/types/auth';

interface AdminLoginPageProps {
  onSuccess: (user: AuthUser) => void;
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onNavigate }) => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await authService.loginAdmin({ email, password });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17263f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl border border-[#dde9ff] flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-[#002c26] text-[#93f4e3] flex items-center justify-center mb-3 shadow-md">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <h1 className="text-2xl font-bold text-[#021129]">Administrator Terminal</h1>
          <p className="text-xs text-[#44474d] mt-1">
            United Insurance Enterprise Governance Portal
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-lg text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#0f1c2e]">Corporate Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 px-3.5 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#0f1c2e]">Security Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 px-3.5 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
            />
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#002c26] text-[#93f4e3] font-bold text-xs hover:opacity-95 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">
                {loading ? 'refresh' : 'lock_open'}
              </span>
              <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/auth/branch-login')}
              className="text-xs text-[#4d5f7b] hover:text-[#021129] font-medium text-center"
            >
              Branch Manager or Underwriter? Sign in here →
            </button>
          </div>
        </form>

        <div className="p-3 bg-[#eff3ff] rounded-lg border border-[#d6e3fc] text-[11px] text-[#44474d] text-center">
          Default Test Admin: <code className="font-bold text-[#021129]">admin@example.com</code> /{' '}
          <code className="font-bold text-[#021129]">password</code>
        </div>
      </div>
    </div>
  );
};
