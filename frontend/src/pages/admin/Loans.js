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

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await api.get("/loans", { params });
      setLoans(res.data.data.loanRequests);
    } catch {
      toast.error("Failed to load loan requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [filterStatus]);

  const handleReview = async (status) => {
    setReviewing(true);
    try {
      await api.patch(`/loans/${selectedLoan._id}/review`, {
        status,
        adminNote,
      });
      toast.success(`Loan request ${status}`);
      setSelectedLoan(null);
      fetchLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to review request");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Loan Requests</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loans.length} requests found
          </p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#0d1424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table - desktop */}
      <div className="hidden md:block bg-[#0d1424] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Employee
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Amount
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Salary
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Reason
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-slate-500 text-sm"
                  >
                    No loan requests found
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr
                    key={loan._id}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-cyan-400 text-xs font-bold">
                            {loan.employee?.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {loan.employee?.fullName}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {loan.employee?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white font-semibold">
                        ${loan.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-300 text-sm">
                        {loan.employee?.salary ? (
                          `$${loan.employee.salary.toLocaleString()}`
                        ) : (
                          <span className="text-slate-600 italic">N/A</span>
                        )}
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
                      <span className="text-slate-300 text-sm">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={loan.status} />
                    </td>
                    <td className="px-5 py-4">
                      {loan.status === "pending" ? (
                        <button
                          onClick={() => {
                            setSelectedLoan(loan);
                            setAdminNote("");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 text-xs font-medium transition-all"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Review
                        </button>
                      ) : (
                        <div>
                          <p className="text-slate-500 text-xs">
                            by {loan.reviewedBy?.fullName || "Admin"}
                          </p>
                          {loan.adminNote && (
                            <p className="text-slate-600 text-xs mt-0.5 max-w-[120px] truncate">
                              "{loan.adminNote}"
                            </p>
                          )}
                        </div>
                      )}
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
          <div className="text-center py-16 text-slate-500 text-sm">
            No loan requests found
          </div>
        ) : (
          loans.map((loan) => (
            <div
              key={loan._id}
              className="bg-[#0d1424] border border-white/5 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 text-xs font-bold">
                      {loan.employee?.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {loan.employee?.fullName}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {loan.employee?.email}
                    </p>
                  </div>
                </div>
                <Badge status={loan.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/3 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Amount</p>
                  <p className="text-white text-sm font-bold mt-0.5">
                    ${loan.amount?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/3 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Salary</p>
                  <p className="text-white text-xs font-medium mt-0.5">
                    {loan.employee?.salary
                      ? `$${loan.employee.salary.toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
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
              {loan.status === "pending" && (
                <button
                  onClick={() => {
                    setSelectedLoan(loan);
                    setAdminNote("");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 text-sm font-medium transition-all"
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Review Request
                </button>
              )}
              {loan.status !== "pending" && loan.adminNote && (
                <div className="pt-3 border-t border-white/5">
                  <p className="text-slate-500 text-xs">
                    Admin note:{" "}
                    <span className="text-slate-300">{loan.adminNote}</span>
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-white font-semibold">Review Loan Request</h2>
              <button
                onClick={() => setSelectedLoan(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Loan details */}
              <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Employee</span>
                  <span className="text-white font-medium">
                    {selectedLoan.employee?.fullName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Loan Amount</span>
                  <span className="text-white font-semibold text-base">
                    ${selectedLoan.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Monthly Salary</span>
                  <span className="text-white">
                    {selectedLoan.employee?.salary
                      ? `$${selectedLoan.employee.salary.toLocaleString()}`
                      : "N/A"}
                  </span>
                </div>
                {selectedLoan.employee?.salary && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Loan / Salary Ratio</span>
                    <span
                      className={`font-medium ${
                        selectedLoan.amount / selectedLoan.employee.salary > 3
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {(
                        selectedLoan.amount / selectedLoan.employee.salary
                      ).toFixed(1)}
                      x
                    </span>
                  </div>
                )}
                {selectedLoan.reason && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-slate-500 text-xs mb-1">Reason</p>
                    <p className="text-slate-300 text-sm">
                      {selectedLoan.reason}
                    </p>
                  </div>
                )}
              </div>

              {/* Admin note */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Admin Note (optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note for the employee..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleReview("approved")}
                  disabled={reviewing}
                  className="flex-1 bg-green-400/10 hover:bg-green-400/20 border border-green-400/20 text-green-400 font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reviewing ? (
                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
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
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleReview("rejected")}
                  disabled={reviewing}
                  className="flex-1 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 text-red-400 font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reviewing ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
