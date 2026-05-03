import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Badge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
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

const PriorityBadge = ({ priority }) => {
  const styles = {
    low: "bg-slate-400/10 text-slate-400 border-slate-400/20",
    medium: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    high: "bg-orange-400/10 text-orange-400 border-orange-400/20",
    urgent: "bg-red-400/10 text-red-400 border-red-400/20",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[priority] || styles.medium}`}
    >
      {priority}
    </span>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks/my/tasks");
      setTasks(res.data.data.tasks);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filtered = filterStatus
    ? tasks.filter((t) => t.status === filterStatus)
    : tasks;

  const openTask = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setNewNote(task.employeeNote || "");
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await api.patch(`/tasks/my/tasks/${selectedTask._id}/status`, {
        status: newStatus,
        employeeNote: newNote,
      });
      toast.success("Task status updated!");
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">
            {filtered.length} tasks found
          </p>
        </div>

        {/* Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#0d1424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">No tasks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((task) => (
            <div
              key={task._id}
              onClick={() => openTask(task)}
              className="bg-[#0d1424] border border-white/5 rounded-2xl p-5 hover:border-cyan-400/20 transition-all duration-200 cursor-pointer group"
            >
              {/* Task header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors">
                  {task.title}
                </h3>
                <PriorityBadge priority={task.priority} />
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Badge status={task.status} />
                  {isOverdue(task.deadline) && task.status !== "done" && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-400/10 text-red-400 border-red-400/20">
                      Overdue
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {task.deadline ? (
                    <p
                      className={`text-xs ${isOverdue(task.deadline) && task.status !== "done" ? "text-red-400" : "text-slate-500"}`}
                    >
                      Due {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-slate-600 text-xs">No deadline</p>
                  )}
                  <p className="text-slate-600 text-xs mt-0.5">
                    by {task.assignedBy?.fullName || "Admin"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-white font-semibold">Task Details</h2>
              <button
                onClick={() => setSelectedTask(null)}
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
              {/* Task info */}
              <div>
                <h3 className="text-white font-semibold text-base">
                  {selectedTask.title}
                </h3>
                {selectedTask.description && (
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                    {selectedTask.description}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Priority</span>
                  <PriorityBadge priority={selectedTask.priority} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Assigned by</span>
                  <span className="text-white">
                    {selectedTask.assignedBy?.fullName || "Admin"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Deadline</span>
                  <span
                    className={`${isOverdue(selectedTask.deadline) && selectedTask.status !== "done" ? "text-red-400" : "text-white"}`}
                  >
                    {selectedTask.deadline
                      ? new Date(selectedTask.deadline).toLocaleDateString()
                      : "No deadline"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Created</span>
                  <span className="text-white">
                    {new Date(selectedTask.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Update Status */}
              {selectedTask.status !== "cancelled" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                      Update Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  {/* Employee Note */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                      Add a Note
                    </label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this task..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Show existing note if cancelled */}
              {selectedTask.status === "cancelled" &&
                selectedTask.employeeNote && (
                  <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                      Employee Note
                    </p>
                    <p className="text-slate-300 text-sm">
                      {selectedTask.employeeNote}
                    </p>
                  </div>
                )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {selectedTask.status !== "cancelled" && (
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Save Status"
                    )}
                  </button>
                )}
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white py-2.5 rounded-xl text-sm transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
