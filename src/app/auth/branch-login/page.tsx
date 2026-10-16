import React, { useState } from 'react';
import { authService } from '@/services/auth-service';
import { AuthUser } from '@/types/auth';

interface BranchLoginPageProps {
  onSuccess: (user: AuthUser) => void;
  onNavigate: (path: string) => void;
}

export const BranchLoginPage: React.FC<BranchLoginPageProps> = ({ onSuccess, onNavigate }) => {
  const [username, setUsername] = useState('metro_admin');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await authService.loginBranch({ username, password });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid branch credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17263f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl border border-[#dde9ff] flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-[#002c26] text-[#93f4e3] flex items-center justify-center mb-3 shadow-md">
            <span className="material-symbols-outlined text-2xl">domain</span>
          </div>
          <h1 className="text-2xl font-bold text-[#021129]">Branch Operator Access</h1>
          <p className="text-xs text-[#44474d] mt-1">
            Metro Central Branch #04 Underwriting Terminal
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
            <label className="text-xs font-bold text-[#0f1c2e]">Branch Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-10 px-3.5 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#0f1c2e]">Password</label>
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
                {loading ? 'refresh' : 'login'}
              </span>
              <span>{loading ? 'Logging in...' : 'Sign In to Branch'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/auth/admin-login')}
              className="text-xs text-[#4d5f7b] hover:text-[#021129] font-medium text-center"
            >
              System Administrator? Go to Admin Portal →
            </button>
          </div>
        </form>

        <div className="p-3 bg-[#eff3ff] rounded-lg border border-[#d6e3fc] text-[11px] text-[#44474d] text-center">
          Default Test Branch: <code className="font-bold text-[#021129]">metro_admin</code> /{' '}
          <code className="font-bold text-[#021129]">password</code>
        </div>
      </div>
    </div>
  );
};
