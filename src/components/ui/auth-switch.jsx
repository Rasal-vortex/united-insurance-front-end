import { useEffect, useState } from "react";
import { Building2, Eye, EyeOff, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { authService } from "@/services/auth-service";

const TEST_CREDENTIALS = {
  admin: { email: "admin@info.com", password: "NmmtqHDcmm-kcg_Dt-Kvrw" },
  branch: { username: "north-branch", password: "sample123" },
};

export default function AuthSwitch({ initialMode = "admin", onSuccess, onNavigate }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState(TEST_CREDENTIALS.admin.email);
  const [username, setUsername] = useState(TEST_CREDENTIALS.branch.username);
  const [password, setPassword] = useState(TEST_CREDENTIALS[initialMode]?.password || TEST_CREDENTIALS.admin.password);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = mode === "admin";

  useEffect(() => {
    setMode(initialMode);
    setPassword(TEST_CREDENTIALS[initialMode]?.password || TEST_CREDENTIALS.admin.password);
  }, [initialMode]);

  const switchMode = () => {
    const nextMode = isAdmin ? "branch" : "admin";
    setMode(nextMode);
    setPassword(TEST_CREDENTIALS[nextMode].password);
    setShowPassword(false);
    setError("");
    onNavigate?.(nextMode === "admin" ? "/auth/admin-login" : "/auth/branch-login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      setLoading(true);
      const response = isAdmin
        ? await authService.loginAdmin({ email, password })
        : await authService.loginBranch({ username, password });
      onSuccess(response.data.user);
    } catch (err) {
      setError(err?.message || (isAdmin ? "Invalid administrator credentials" : "Invalid branch credentials"));
    } finally {
      setLoading(false);
    }
  };

  return <main className="auth-switch flex min-h-screen items-center justify-center bg-[#f5f5f7] p-3 sm:p-5">
    <style>{`
      .auth-switch, .auth-switch * { box-sizing: border-box; }
      .auth-switch .auth-container { position:relative; isolation:isolate; width:100%; max-width:960px; min-height:590px; overflow:hidden; border:0; border-radius:22px; background:#fff; box-shadow:0 25px 50px rgba(25,22,48,.22); }
      .auth-switch .auth-container::before { content:""; position:absolute; z-index:1; top:-10%; right:48%; width:2000px; height:2000px; border-radius:50%; transform:translateY(-50%); background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); transition:transform 1.2s ease-in-out, right 1.2s ease-in-out, background 1s ease; }
      .auth-switch .auth-container.branch-mode::before { right:52%; transform:translate(100%,-50%); background:linear-gradient(135deg,#358acb 0%,#5358b5 100%); }
      .auth-switch .forms-container { position:absolute; inset:0; z-index:4; pointer-events:none; }
      .auth-switch .auth-watermark { position:absolute; top:50%; z-index:0; width:245px; height:245px; transform:translateY(-50%); color:#7650b5; opacity:.055; pointer-events:none; }
      .auth-switch .auth-watermark svg { width:100%; height:100%; stroke-width:1.05; }
      .auth-switch .admin-watermark { right:3%; }
      .auth-switch .branch-watermark { left:3%; color:#358acb; }
      .auth-switch .signin-signup { position:absolute; z-index:1; top:50%; left:75%; width:50%; padding:0 44px; transform:translate(-50%,-50%); transition:left .9s .25s ease-in-out; }
      .auth-switch .auth-form { pointer-events:auto; }
      .auth-switch .branch-mode .signin-signup { left:25%; }
      .auth-switch .auth-form { display:flex; width:100%; flex-direction:column; align-items:center; justify-content:center; }
      .auth-switch .auth-title { margin:0 0 6px; color:#302d36; font-size:30px; font-weight:700; letter-spacing:-.04em; }
      .auth-switch .auth-subtitle { margin:0 0 22px; color:#77737e; font-size:12px; text-align:center; }
      .auth-switch .input-field { display:grid; width:100%; max-width:370px; height:48px; grid-template-columns:42px 1fr; align-items:center; margin:7px 0; padding:0 12px 0 4px; border:1px solid transparent; border-radius:999px; background:#f1f0f3; transition:background .2s,border-color .2s,box-shadow .2s; }
      .auth-switch .input-field:focus-within { border-color:#8585e8; background:#fff; box-shadow:0 0 0 3px rgba(102,126,234,.12); }
      .auth-switch .input-field svg { justify-self:center; color:#77737e; }
      .auth-switch .input-field input { width:100%; height:100%; border:0; outline:0; background:transparent; color:#302d36; font-size:13px; }
      .auth-switch .password-field { grid-template-columns:42px minmax(0,1fr) 34px; }
      .auth-switch .password-toggle { display:grid; width:28px; height:28px; place-items:center; border:0; border-radius:50%; background:transparent; color:#77737e; cursor:pointer; }
      .auth-switch .password-toggle:hover { background:rgba(48,45,54,.07); color:#302d36; }
      .auth-switch .password-toggle:focus-visible { outline:2px solid #8585e8; outline-offset:1px; }
      .auth-switch .input-field input:-webkit-autofill,
      .auth-switch .input-field input:-webkit-autofill:hover,
      .auth-switch .input-field input:-webkit-autofill:focus { -webkit-text-fill-color:#302d36; -webkit-box-shadow:0 0 0 1000px #f1f0f3 inset; box-shadow:0 0 0 1000px #f1f0f3 inset; transition:background-color 9999s ease-out; }
      .auth-switch .input-field input::placeholder { color:#96929c; }
      .auth-switch .login-button { width:100%; max-width:370px; min-height:46px; margin-top:15px; border:0; border-radius:999px; background:linear-gradient(100deg,#667eea,#7650b5); color:#fff; font-size:12px; font-weight:700; cursor:pointer; transition:transform .2s,box-shadow .2s,opacity .2s; }
      .auth-switch .branch-mode .login-button { background:linear-gradient(100deg,#358acb,#5358b5); }
      .auth-switch .login-button:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 16px rgba(90,86,180,.25); }
      .auth-switch .login-button:disabled { cursor:wait; opacity:.65; }
      .auth-switch .auth-error { width:100%; max-width:370px; margin-bottom:10px; border:1px solid #f1d3d0; border-radius:10px; background:#fff5f3; padding:10px 12px; color:#93000a; font-size:12px; }
      .auth-switch .panels-container { position:absolute; inset:0; z-index:2; display:grid; grid-template-columns:repeat(2,1fr); pointer-events:none; }
      .auth-switch .panel { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 15%; color:#fff; text-align:center; }
      .auth-switch .panel-content { max-width:290px; transition:transform .8s ease-in-out,opacity .5s ease; }
      .auth-switch .panel h2 { margin:0 0 9px; font-size:24px; font-weight:650; letter-spacing:-.025em; }
      .auth-switch .panel p { margin:0 0 19px; color:rgba(255,255,255,.84); font-size:12px; line-height:1.6; }
      .auth-switch .panel-button { min-height:38px; min-width:128px; border:1px solid rgba(255,255,255,.85); border-radius:999px; background:rgba(255,255,255,.08); padding:0 18px; color:#fff; font-size:11px; font-weight:650; cursor:pointer; transition:background .2s,transform .2s; }
      .auth-switch .panel-button:hover { transform:translateY(-1px); background:rgba(255,255,255,.18); }
      .auth-switch .right-panel .panel-content { transform:translateX(800px); opacity:0; }
      .auth-switch .branch-mode .left-panel .panel-content { transform:translateX(-800px); opacity:0; }
      .auth-switch .branch-mode .right-panel .panel-content { transform:translateX(0); opacity:1; }
      .auth-switch .left-panel, .auth-switch .right-panel { pointer-events:auto; }
      .auth-switch .mobile-switch { display:none; }
      @media (max-width:900px) {
        .auth-switch .auth-container { max-width:560px; min-height:690px; }
        .auth-switch .auth-watermark { display:none; }
        .auth-switch .auth-container::before { top:-145%; right:auto; left:50%; width:1000px; height:1000px; transform:translateX(-50%); }
        .auth-switch .auth-container.branch-mode::before { top:72%; right:auto; left:50%; transform:translate(-50%,0); }
        .auth-switch .panels-container { bottom:auto; height:190px; grid-template-columns:1fr; }
        .auth-switch .panel { position:absolute; inset:0; padding:20px; }
        .auth-switch .panel-content, .auth-switch .right-panel .panel-content, .auth-switch .branch-mode .left-panel .panel-content, .auth-switch .branch-mode .right-panel .panel-content { transform:none; opacity:1; }
        .auth-switch .left-panel .panel-content { display:none; }
        .auth-switch:not(.branch-mode) .left-panel .panel-content { display:block; }
        .auth-switch .right-panel .panel-content { display:none; }
        .auth-switch.branch-mode .right-panel .panel-content { display:block; }
        .auth-switch .panel h2 { margin-bottom:5px; font-size:20px; }
        .auth-switch .panel p { margin-bottom:9px; font-size:11px; }
        .auth-switch .panel-button { min-height:32px; }
        .auth-switch .signin-signup, .auth-switch .branch-mode .signin-signup { top:190px; left:0; width:100%; padding:36px 30px 25px; transform:none; transition:none; }
        .auth-switch .mobile-switch { display:block; margin-top:14px; border:0; background:none; color:#625d69; font-size:11px; cursor:pointer; }
      }
      @media (max-width:420px) {
        .auth-switch .auth-container { min-height:660px; border-radius:18px; }
        .auth-switch .signin-signup, .auth-switch .branch-mode .signin-signup { padding-right:20px; padding-left:20px; }
        .auth-switch .auth-title { font-size:26px; }
      }
      @media (prefers-reduced-motion:reduce) {
        .auth-switch .auth-container::before,.auth-switch .signin-signup,.auth-switch .panel-content,.auth-switch .login-button,.auth-switch .panel-button { transition-duration:.01ms !important; }
      }
    `}</style>

    <div className={`auth-container ${isAdmin ? "admin-mode" : "branch-mode"}`}>
      <div className="forms-container">
        <div className={`auth-watermark ${isAdmin ? "admin-watermark" : "branch-watermark"}`} aria-hidden="true">
          {isAdmin ? <ShieldCheck /> : <Building2 />}
        </div>
        <div className="signin-signup">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h1 className="auth-title">Sign in</h1>
            <p className="auth-subtitle">{isAdmin ? "Administrator workspace" : "Branch workspace"}</p>
            {error && <div role="alert" className="auth-error">{error}</div>}
            <label className="input-field">
              {isAdmin ? <Mail size={17} aria-hidden="true" /> : <UserRound size={17} aria-hidden="true" />}
              <span className="sr-only">{isAdmin ? "Email address" : "Branch username"}</span>
              <input type={isAdmin ? "email" : "text"} name={isAdmin ? "email" : "username"} autoComplete={isAdmin ? "email" : "username"} value={isAdmin ? email : username} onChange={(event) => isAdmin ? setEmail(event.target.value) : setUsername(event.target.value)} placeholder={isAdmin ? "Email address" : "Branch username"} required />
            </label>
            <div className="input-field password-field">
              <KeyRound size={17} aria-hidden="true" />
              <label className="sr-only" htmlFor="auth-password">Password</label>
              <input id="auth-password" type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
            <button className="login-button" type="submit" disabled={loading}>{loading ? "Signing in…" : isAdmin ? "Sign in as administrator" : "Sign in to branch"}</button>
            <button className="mobile-switch" type="button" onClick={switchMode}>{isAdmin ? "Branch account? Switch sign in" : "Administrator? Switch sign in"}</button>
          </form>
        </div>
      </div>

      <div className="panels-container" aria-live="polite">
        <section className="panel left-panel">
          <div className="panel-content">
            <Building2 size={29} strokeWidth={1.6} aria-hidden="true" />
            <h2>Branch team?</h2>
            <p>Sign in to manage your branch customers, policies, and follow-ups.</p>
            <button type="button" className="panel-button" onClick={switchMode}>Branch sign in</button>
          </div>
        </section>
        <section className="panel right-panel">
          <div className="panel-content">
            <ShieldCheck size={29} strokeWidth={1.6} aria-hidden="true" />
            <h2>Administrator?</h2>
            <p>Manage branches and oversee insurance operations from one secure workspace.</p>
            <button type="button" className="panel-button" onClick={switchMode}>Administrator sign in</button>
          </div>
        </section>
      </div>
    </div>
  </main>;
}
