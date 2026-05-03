import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
    "in-progress": "bg-blue-400/10 text-blue-400 border-blue-400/20",
    done: "bg-green-400/10 text-green-400 border-green-400/20",
    cancelled: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}
    >
      {status}
    </span>
  );
};

const PriorityDot = ({ priority }) => {
  const colors = {
    low: "bg-slate-400",
    medium: "bg-blue-400",
    high: "bg-orange-400",
    urgent: "bg-red-400",
  };
  return (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[priority] || "bg-slate-400"}`}
    />
  );
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/dashboard/employee");
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
      {/* Welcome */}
      <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
          <span className="text-cyan-400 text-2xl font-bold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            Welcome back, {user?.fullName?.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {data?.employee?.department?.name || "No department"} •{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={data?.tasks?.total}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={data?.tasks?.done}
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
          label="In Progress"
          value={data?.tasks?.inProgress}
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Leave Balance"
          value={`${data?.leaves?.balance ?? 0} days`}
          color="bg-purple-400/10"
          icon={
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
          }
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Tasks */}
        <div className="xl:col-span-2 bg-[#0d1424] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Recent Tasks</h2>
            <button
              onClick={() => navigate("/employee/tasks")}
              className="text-cyan-400 text-xs hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {data?.tasks?.recent?.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                No tasks assigned yet
              </p>
            ) : (
              data?.tasks?.recent?.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all"
                >
                  <PriorityDot priority={task.priority} />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-white text-sm font-medium truncate">
                      {task.title}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {task.deadline
                        ? `Due ${new Date(task.deadline).toLocaleDateString()}`
                        : "No deadline"}
                    </p>
                  </div>
                  <Badge status={task.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="space-y-4">
          {/* Recent Leaves */}
          <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">
                Leave Requests
              </h2>
              <button
                onClick={() => navigate("/employee/leaves")}
                className="text-cyan-400 text-xs hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-2">
              {data?.leaves?.recent?.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">
                  No leave requests
                </p>
              ) : (
                data?.leaves?.recent?.map((leave) => (
                  <div
                    key={leave._id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-white text-xs font-medium">
                        {leave.numberOfDays} days
                      </p>
                      <p className="text-slate-500 text-xs">
                        {new Date(leave.startDate).toLocaleDateString()}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">
                Loan Requests
              </h2>
              <button
                onClick={() => navigate("/employee/loans")}
                className="text-cyan-400 text-xs hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-2">
              {data?.loans?.recent?.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">
                  No loan requests
                </p>
              ) : (
                data?.loans?.recent?.map((loan) => (
                  <div
                    key={loan._id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-white text-xs font-medium">
                        ${loan.amount?.toLocaleString()}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge status={loan.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
