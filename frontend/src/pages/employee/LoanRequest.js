import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Badge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    approved: "bg-green-400/10 text-green-400 border-green-400/20",
    rejected: "bg-red-400/10 text-red-400 border-red-400/20",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const LoanRequest = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "", reason: "" });

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/loans/my");
      setLoans(res.data.data.loanRequests);
    } catch {
      toast.error("Failed to load loan requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const hasPending = loans.some((l) => l.status === "pending");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || form.amount <= 0) {
      return toast.error("Please enter a valid amount");
    }

    setSubmitting(true);
    try {
      await api.post("/loans", {
        amount: Number(form.amount),
        reason: form.reason,
      });
      toast.success("Loan request submitted!");
      setForm({ amount: "", reason: "" });
      setShowForm(false);
      fetchLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Loan Requests</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loans.length} requests total
          </p>
        </div>
        <button
          onClick={() => {
            if (hasPending) {
              toast.error("You already have a pending loan request");
              return;
            }
            setShowForm(!showForm);
          }}
          className={`flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
            hasPending
              ? "bg-white/5 text-slate-500 cursor-not-allowed"
              : "bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e]"
          }`}
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">
              Total Requests
            </p>
            <p className="text-white text-2xl font-bold mt-0.5">
              {loans.length}
            </p>
          </div>
        </div>
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">
              Approved
            </p>
            <p className="text-white text-2xl font-bold mt-0.5">
              {loans.filter((l) => l.status === "approved").length}
            </p>
          </div>
        </div>
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">
              Pending
            </p>
            <p className="text-white text-2xl font-bold mt-0.5">
              {loans.filter((l) => l.status === "pending").length}
            </p>
          </div>
        </div>
      </div>

      {/* Pending warning */}
      {hasPending && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
          <svg
            className="w-4 h-4 text-yellow-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-yellow-400 text-sm">
            You have a pending loan request. You cannot submit a new one until
            it is reviewed.
          </p>
        </div>
      )}

      {/* New Request Form */}
      {showForm && !hasPending && (
        <div className="bg-[#0d1424] border border-cyan-400/20 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
            New Loan Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Loan Amount <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  min={1}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Reason
              </label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Why do you need this loan?"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Submit Request"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table - desktop */}
      <div className="hidden md:block bg-[#0d1424] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Amount
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Reason
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Admin Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-16 text-slate-500 text-sm"
                  >
                    No loan requests yet
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr
                    key={loan._id}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-slate-300 text-sm">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white font-semibold">
                        ${loan.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-300 text-sm max-w-[150px] truncate">
                        {loan.reason || (
                          <span className="text-slate-600 italic">
                            No reason
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={loan.status} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-500 text-xs max-w-[150px] truncate">
                        {loan.adminNote || <span className="italic">—</span>}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards - mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : loans.length === 0 ? (
          <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-10 text-center text-slate-500 text-sm">
            No loan requests yet
          </div>
        ) : (
          loans.map((loan) => (
            <div
              key={loan._id}
              className="bg-[#0d1424] border border-white/5 rounded-2xl p-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-lg font-bold">
                  ${loan.amount?.toLocaleString()}
                </p>
                <Badge status={loan.status} />
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/3 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Date</p>
                  <p className="text-white text-xs font-medium mt-0.5">
                    {new Date(loan.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {loan.reason && (
                  <div className="bg-white/3 rounded-lg p-2">
                    <p className="text-slate-500 text-xs">Reason</p>
                    <p className="text-white text-xs font-medium mt-0.5 truncate">
                      {loan.reason}
                    </p>
                  </div>
                )}
              </div>

              {/* Admin note */}
              {loan.adminNote && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/3 border border-white/5">
                  <svg
                    className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  <p className="text-slate-400 text-xs">{loan.adminNote}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoanRequest;
