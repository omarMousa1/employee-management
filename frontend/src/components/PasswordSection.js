import { useState } from "react";
import api from "../components/PasswordSection";
import toast from "react-hot-toast";

const PasswordSection = () => {
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (form.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    if (form.currentPassword === form.newPassword) {
      return toast.error(
        "New password must be different from current password",
      );
    }

    setSubmitting(true);
    try {
      await api.patch("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShow(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
          Password & Security
        </h3>
        <button
          onClick={() => setShow(!show)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm transition-all"
        >
          {show ? (
            <>
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </>
          ) : (
            <>
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Change Password
            </>
          )}
        </button>
      </div>

      {show && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Password */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Current Password <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm({ ...form, currentPassword: e.target.value })
                  }
                  required
                  placeholder="Enter current password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  {showPasswords ? (
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

            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                New Password <span className="text-cyan-400">*</span>
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                required
                placeholder="Min. 8 characters"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Confirm Password <span className="text-cyan-400">*</span>
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                required
                placeholder="Re-enter new password"
                className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none transition-all ${
                  form.confirmPassword &&
                  form.newPassword !== form.confirmPassword
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-cyan-400/50"
                }`}
              />
              {form.confirmPassword &&
                form.newPassword !== form.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    Passwords do not match
                  </p>
                )}
            </div>
          </div>

          {/* Password strength */}
          {form.newPassword && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      form.newPassword.length >= level * 3
                        ? level <= 1
                          ? "bg-red-400"
                          : level <= 2
                            ? "bg-orange-400"
                            : level <= 3
                              ? "bg-yellow-400"
                              : "bg-green-400"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <p className="text-slate-500 text-xs">
                {form.newPassword.length < 4
                  ? "Too weak"
                  : form.newPassword.length < 7
                    ? "Weak"
                    : form.newPassword.length < 10
                      ? "Medium"
                      : "Strong"}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={
                submitting ||
                (form.confirmPassword &&
                  form.newPassword !== form.confirmPassword)
              }
              className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Update Password
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShow(false);
                setForm({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PasswordSection;
