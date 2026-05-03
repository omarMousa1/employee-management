// const Dashboard = () => <div>Dashboard</div>;
// export default Dashboard;

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Activate = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Password do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/activate", { token, password });
      toast.success("Account activate! You can now log in");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent mb-8" />
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-cyan-400/10 border border-cyan-400/20 mb-4">
              <svg
                className="w-7 h-7 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Activate Account
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Set your password to get started
            </p>
          </div>
          {/* No token warning */}
          {!token ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-400 text-sm">
                Invalid or missing activation link.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="text-cyan-400 text-sm mt-2 hover:underline"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={password ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 8 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all duration-200 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!setPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none transition-all duration-200 
                    ${
                      confirm && password !== confirm
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/10 focus:border-cyan-400/50"
                    }`}
                />
                {confirm && password !== confirm && (
                  <p className="text-red-400 text-xs mt-1">
                    Password do not match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || (confirm && password !== confirm)}
                className="w-full bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold py-3 rounded-xl transition-all duration-200 text-sm tracking-wide mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                    Activation...
                  </>
                ) : (
                  "Activate Account"
                )}
              </button>

              <p className="text-center text-slate-600 text-xs">
                Already activated?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-cyan-400 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent mt-8" />
      </div>
    </div>
  );
};

export default Activate;
