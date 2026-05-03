import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

const Badge = ({ status }) => {
  const styles = {
    true: "bg-green-400/10 text-green-400 border-green-400/20",
    false: "bg-red-400/10 text-red-400 border-red-400/20",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status ? "Active" : "Archived"}
    </span>
  );
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    confirmColor: "red",
    onConfirm: null,
  });

  const closeConfirm = () =>
    setConfirmModal({ ...confirmModal, isOpen: false });

  const navigate = useNavigate();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (filterDept) params.department = filterDept;
      if (filterStatus !== "") params.isActive = filterStatus;

      const res = await api.get("/admin/employees", { params });
      setEmployees(res.data.data.employees);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/admin/departments");
      setDepartments(res.data.data.departments);
    } catch {}
  };

  useEffect(() => {
    fetchDepartments();
  }, []);
  useEffect(() => {
    fetchEmployees();
  }, [page, filterDept, filterStatus]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchEmployees();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Archive Employee",
      message:
        "Are you sure you want to Archive this employee? They will lose access to the system.",
      confirmText: "Archive",
      confirmColor: "red",
      onConfirm: async () => {
        closeConfirm();
        setDeletingId(id);
        try {
          await api.delete(`/admin/employees/${id}`);
          toast.success("Employee Archived");
          fetchEmployees();
        } catch {
          toast.error("Failed to Archive employee");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleResend = async (id) => {
    setResendingId(id);
    try {
      await api.post(`/admin/employees/${id}/resend-activation`);
      toast.success("Activation email resent");
    } catch {
      toast.error("Failed to resend email");
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-slate-500 text-sm mt-1">
            {pagination.total ?? 0} total employees
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/employees/add")}
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
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d1424] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
          />
        </div>

        {/* Department filter */}
        <select
          value={filterDept}
          onChange={(e) => {
            setFilterDept(e.target.value);
            setPage(1);
          }}
          className="bg-[#0d1424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="bg-[#0d1424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Archived</option>
        </select>
      </div>

      {/* Table */}
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
                  Department
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Join Date
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
                  <td colSpan={5} className="text-center py-16">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-16 text-slate-500 text-sm"
                  >
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-cyan-400 text-xs font-bold">
                            {emp.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {emp.fullName}
                          </p>
                          <p className="text-slate-500 text-xs">{emp.email}</p>
                          {emp.phone && (
                            <p className="text-slate-600 text-xs">
                              {emp.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-300 text-sm">
                        {emp.department?.name || (
                          <span className="text-slate-600 italic">
                            Not assigned
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-300 text-sm">
                        {emp.joinDate ? (
                          new Date(emp.joinDate).toLocaleDateString()
                        ) : (
                          <span className="text-slate-600 italic">N/A</span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={emp.isActive} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/employees/${emp._id}/edit`)
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                          title="View"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        {!emp.isActive && (
                          <button
                            onClick={() => handleResend(emp._id)}
                            disabled={resendingId === emp._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all disabled:opacity-50"
                            title="Resend Activation"
                          >
                            {resendingId === emp._id ? (
                              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
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
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </button>
                        )}
                        {emp.isActive && (
                          <button
                            onClick={() => handleDelete(emp._id)}
                            disabled={deletingId === emp._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                            title="Archived"
                          >
                            {deletingId === emp._id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
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
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
            <p className="text-slate-500 text-sm">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cards - mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No employees found
          </div>
        ) : (
          employees.map((emp) => (
            <div
              key={emp._id}
              className="bg-[#0d1424] border border-white/5 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 text-sm font-bold">
                      {emp.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {emp.fullName}
                    </p>
                    <p className="text-slate-500 text-xs">{emp.email}</p>
                  </div>
                </div>
                <Badge status={emp.isActive} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/3 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Department</p>
                  <p className="text-white text-xs font-medium mt-0.5">
                    {emp.department?.name || "Not assigned"}
                  </p>
                </div>
                <div className="bg-white/3 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Join Date</p>
                  <p className="text-white text-xs font-medium mt-0.5">
                    {emp.joinDate
                      ? new Date(emp.joinDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                {/* Edit button - always visible */}
                <button
                  onClick={() => navigate(`/admin/employees/${emp._id}/edit`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-cyan-400/10 text-cyan-400 text-xs font-medium transition-all"
                >
                  Edit
                </button>
                {!emp.isActive && (
                  <button
                    onClick={() => handleResend(emp._id)}
                    disabled={resendingId === emp._id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-yellow-400/10 text-yellow-400 text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {resendingId === emp._id ? (
                      <div className="w-3.5 h-3.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Resend Email"
                    )}
                  </button>
                )}
                {emp.isActive && (
                  <button
                    onClick={() => handleDelete(emp._id)}
                    disabled={deletingId === emp._id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-400/10 text-red-400 text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {deletingId === emp._id ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Deactivate"
                    )}
                  </button>
                )}
                {emp.isActive && (
                  <button
                    onClick={() => handleDelete(emp._id)}
                    disabled={deletingId === emp._id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-400/10 text-red-400 text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {deletingId === emp._id ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Archived"
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Pagination mobile */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-slate-500 text-sm">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-sm disabled:opacity-40 transition-all"
              >
                Prev
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-sm disabled:opacity-40 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default Employees;
