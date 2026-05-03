import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-all duration-200">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white text-2xl font-bold mt-0.5">{value ?? "—"}</p>
    </div>
  </div>
);

const Badge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    approved: "bg-green-400/10 text-green-400 border-green-400/20",
    rejected: "bg-red-400/10 text-red-400 border-red-400/20",
    active: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
    inactive: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}
    >
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/dashboard/admin");
        setData(res.data.data);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back! Here's what's happening.
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Employees"
          value={data?.overview?.totalEmployees}
          color="bg-cyan-400/10"
          icon={
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Active Employees"
          value={data?.overview?.activeEmployees}
          color="bg-green-400/10"
          icon={
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
          }
        />
        <StatCard
          label="Departments"
          value={data?.overview?.totalDepartments}
          color="bg-blue-400/10"
          icon={
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
        />
        <StatCard
          label="Archived Employees"
          value={data?.overview?.inactiveEmployees}
          color="bg-red-400/10"
          icon={
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          }
        />
      </div>

      {/* Tasks + Requests row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Tasks */}
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Task Overview</h2>
          <div className="space-y-3">
            {[
              {
                label: "Total",
                value: data?.tasks?.total,
                color: "bg-slate-400",
              },
              {
                label: "Pending",
                value: data?.tasks?.pending,
                color: "bg-yellow-400",
              },
              {
                label: "In Progress",
                value: data?.tasks?.inProgress,
                color: "bg-blue-400",
              },
              {
                label: "Done",
                value: data?.tasks?.done,
                color: "bg-green-400",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-slate-400 text-sm">{item.label}</span>
                </div>
                <span className="text-white font-semibold">
                  {item.value ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Leave Requests</h2>
          <div className="space-y-3">
            {[
              {
                label: "Pending",
                value: data?.leaves?.pending,
                color: "bg-yellow-400",
              },
              {
                label: "Approved",
                value: data?.leaves?.approved,
                color: "bg-green-400",
              },
              {
                label: "Rejected",
                value: data?.leaves?.rejected,
                color: "bg-red-400",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-slate-400 text-sm">{item.label}</span>
                </div>
                <span className="text-white font-semibold">
                  {item.value ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Loan Requests */}
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Loan Requests</h2>
          <div className="space-y-3">
            {[
              {
                label: "Pending",
                value: data?.loans?.pending,
                color: "bg-yellow-400",
              },
              {
                label: "Approved",
                value: data?.loans?.approved,
                color: "bg-green-400",
              },
              {
                label: "Rejected",
                value: data?.loans?.rejected,
                color: "bg-red-400",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-slate-400 text-sm">{item.label}</span>
                </div>
                <span className="text-white font-semibold">
                  {item.value ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">Departments</h2>
        {data?.departments?.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">
            No departments yet
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {data?.departments?.map((dept) => (
              <div
                key={dept._id}
                className="bg-white/3 border border-white/5 rounded-xl p-4 hover:border-cyan-400/20 transition-all duration-200"
              >
                <p className="text-white font-medium text-sm truncate">
                  {dept.name}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  {dept.employeeCount ?? 0} employees
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom row — Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Employees */}
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Recent Employees</h2>
          <div className="space-y-3">
            {data?.recentEmployee?.length === 0 ? (
              <p className="text-slate-500 text-sm">No employees yet</p>
            ) : (
              data?.recentEmployee?.map((emp) => (
                <div
                  key={emp._id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-cyan-400 text-xs font-bold">
                        {emp.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-white text-xs font-medium truncate">
                        {emp.fullName}
                      </p>
                      <p className="text-slate-500 text-xs truncate">
                        {emp.department?.name || "No dept"}
                      </p>
                    </div>
                  </div>
                  <Badge status={emp.isActive ? "active" : "inactive"} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Leave */}
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">
            Recent Leave Requests
          </h2>
          <div className="space-y-3">
            {data?.recentLeave?.length === 0 ? (
              <p className="text-slate-500 text-sm">No requests yet</p>
            ) : (
              data?.recentLeave?.map((leave) => (
                <div
                  key={leave._id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="overflow-hidden">
                    <p className="text-white text-xs font-medium truncate">
                      {leave.employee?.fullName}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {leave.numberOfDays} days
                    </p>
                  </div>
                  <Badge status={leave.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Loans */}
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">
            Recent Loan Requests
          </h2>
          <div className="space-y-3">
            {data?.recentLoans?.length === 0 ? (
              <p className="text-slate-500 text-sm">No requests yet</p>
            ) : (
              data?.recentLoans?.map((loan) => (
                <div
                  key={loan._id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="overflow-hidden">
                    <p className="text-white text-xs font-medium truncate">
                      {loan.employee?.fullName}
                    </p>
                    <p className="text-slate-500 text-xs">${loan.amount}</p>
                  </div>
                  <Badge status={loan.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
