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

const LeaveRequest = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const calculatedDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end < start) return 0;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leaves/my");
      setLeaves(res.data.data.leaveRequests);
    } catch {
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await api.get("/dashboard/employee");
      setBalance(res.data.data.leaves.balance);
    } catch {}
  };

  useEffect(() => {
    fetchLeaves();
    fetchBalance();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (calculatedDays() <= 0) {
      return toast.error("End date must be after start date");
    }

    if (calculatedDays() > balance) {
      return toast.error(`Insufficient balance. You have ${balance} days left`);
    }

    setSubmitting(true);
    try {
      await api.post("/leaves", form);
      toast.success("Leave request submitted!");
      setForm({ startDate: "", endDate: "", reason: "" });
      setShowForm(false);
      fetchLeaves();
      fetchBalance();
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
          <h1 className="text-2xl font-bold text-white">Leave Requests</h1>
          <p className="text-slate-500 text-sm mt-1">
            {leaves.length} requests total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
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

      {/* Balance Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">
              Leave Balance
            </p>
            <p className="text-white text-2xl font-bold mt-0.5">
              {balance}{" "}
              <span className="text-sm font-normal text-slate-500">days</span>
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
              {leaves.filter((l) => l.status === "approved").length}
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
              {leaves.filter((l) => l.status === "pending").length}
            </p>
          </div>
        </div>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="bg-[#0d1424] border border-cyan-400/20 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
            New Leave Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Start Date <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  End Date <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  required
                  min={form.startDate || new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                />
              </div>
            </div>

            {/* Days preview */}
            {calculatedDays() > 0 && (
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${
                  calculatedDays() > balance
                    ? "bg-red-400/10 border-red-400/20 text-red-400"
                    : "bg-cyan-400/10 border-cyan-400/20 text-cyan-400"
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {calculatedDays() > balance
                  ? `Insufficient balance — requesting ${calculatedDays()} days but only ${balance} available`
                  : `Requesting ${calculatedDays()} day${calculatedDays() > 1 ? "s" : ""} — ${balance - calculatedDays()} days remaining after approval`}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Reason
              </label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Optional reason for leave..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || calculatedDays() > balance}
                className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Period
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Days
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Reason
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Note
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
              ) : leaves.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-16 text-slate-500 text-sm"
                  >
                    No leave requests yet
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr
                    key={leave._id}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-white text-sm">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-slate-500 text-xs">
                        to {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white font-semibold">
                        {leave.numberOfDays}
                      </span>
                      <span className="text-slate-500 text-xs ml-1">days</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-300 text-sm max-w-[150px] truncate">
                        {leave.reason || (
                          <span className="text-slate-600 italic">
                            No reason
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={leave.status} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-500 text-xs max-w-[150px] truncate">
                        {leave.adminNote || <span className="italic">—</span>}
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
        ) : leaves.length === 0 ? (
          <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-10 text-center text-slate-500 text-sm">
            No leave requests yet
          </div>
        ) : (
          leaves.map((leave) => (
            <div
              key={leave._id}
              className="bg-[#0d1424] border border-white/5 rounded-2xl p-4"
            >
              {/* Status row */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-sm font-semibold">
                  {leave.numberOfDays} day{leave.numberOfDays > 1 ? "s" : ""}{" "}
                  leave
                </p>
                <Badge status={leave.status} />
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/3 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Start Date</p>
                  <p className="text-white text-xs font-medium mt-0.5">
                    {new Date(leave.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-white/3 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">End Date</p>
                  <p className="text-white text-xs font-medium mt-0.5">
                    {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                {leave.reason && (
                  <div className="bg-white/3 rounded-lg p-2 col-span-2">
                    <p className="text-slate-500 text-xs">Reason</p>
                    <p className="text-white text-xs font-medium mt-0.5">
                      {leave.reason}
                    </p>
                  </div>
                )}
              </div>

              {/* Admin note */}
              {leave.adminNote && (
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
                  <p className="text-slate-400 text-xs">{leave.adminNote}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeaveRequest;
