import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

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

const emptyForm = {
  title: "",
  description: "",
  assignedTo: "",
  priority: "medium",
  deadline: "",
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
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

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterEmployee) params.assignedTo = filterEmployee;
      const res = await api.get("/tasks", { params });
      setTasks(res.data.data.tasks);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/admin/employees", {
        params: { limit: 100, isActive: true },
      });
      setEmployees(res.data.data.employees);
    } catch {}
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  useEffect(() => {
    fetchTasks();
  }, [filterStatus, filterPriority, filterEmployee]);

  const openCreate = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      assignedTo: task.assignedTo?._id || "",
      priority: task.priority,
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().split("T")[0]
        : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.deadline) delete payload.deadline;
      if (!payload.description) delete payload.description;

      if (editingTask) {
        await api.patch(`/tasks/${editingTask._id}`, payload);
        toast.success("Task updated successfully");
      } else {
        await api.post("/tasks", payload);
        toast.success("Task created successfully");
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Task",
      message:
        "Are you sure you want to delete this task? This action cannot be undone.",
      confirmText: "Delete",
      confirmColor: "red",
      onConfirm: async () => {
        closeConfirm();
        setDeletingId(id);
        try {
          await api.delete(`/tasks/${id}`);
          toast.success("Task deleted");
          fetchTasks();
        } catch {
          toast.error("Failed to delete task");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const isOverdue = (deadline, status) => {
    if (!deadline || status === "done" || status === "cancelled") return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">
            {tasks.length} tasks total
          </p>
        </div>
        <button
          onClick={openCreate}
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
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
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

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-[#0d1424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <select
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          className="bg-[#0d1424] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* Table - desktop */}
      <div className="hidden md:block bg-[#0d1424] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Task
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Assigned To
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Priority
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Deadline
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-4">
                  Employee Note
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
              ) : tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-slate-500 text-sm"
                  >
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="hover:bg-white/2 transition-colors"
                  >
                    {/* Task */}
                    <td className="px-5 py-4 max-w-[180px]">
                      <p className="text-white text-sm font-medium truncate">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-slate-500 text-xs mt-0.5 truncate">
                          {task.description}
                        </p>
                      )}
                    </td>

                    {/* Assigned To */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-cyan-400 text-xs font-bold">
                            {task.assignedTo?.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-slate-300 text-sm">
                            {task.assignedTo?.fullName}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {task.assignedTo?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    {/* Deadline */}
                    <td className="px-5 py-4">
                      {task.deadline ? (
                        <div>
                          <p
                            className={`text-sm ${isOverdue(task.deadline, task.status) ? "text-red-400" : "text-slate-300"}`}
                          >
                            {new Date(task.deadline).toLocaleDateString()}
                          </p>
                          {isOverdue(task.deadline, task.status) && (
                            <p className="text-red-400 text-xs mt-0.5">
                              Overdue
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-sm">
                          No deadline
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <Badge status={task.status} />
                    </td>

                    {/* Employee Note */}
                    <td className="px-5 py-4 max-w-[160px]">
                      {task.employeeNote ? (
                        <div className="flex items-start gap-1.5">
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
                          <p className="text-slate-400 text-xs truncate">
                            {task.employeeNote}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                          title="Edit"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          disabled={deletingId === task._id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === task._id ? (
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
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
        ) : tasks.length === 0 ? (
          <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-10 text-center text-slate-500 text-sm">
            No tasks found
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="bg-[#0d1424] border border-white/5 rounded-2xl p-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                <PriorityBadge priority={task.priority} />
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/3 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Assigned To</p>
                  <p className="text-white text-xs font-medium mt-0.5">
                    {task.assignedTo?.fullName}
                  </p>
                </div>
                <div className="bg-white/3 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Deadline</p>
                  <p
                    className={`text-xs font-medium mt-0.5 ${
                      isOverdue(task.deadline, task.status)
                        ? "text-red-400"
                        : "text-white"
                    }`}
                  >
                    {task.deadline
                      ? new Date(task.deadline).toLocaleDateString()
                      : "No deadline"}
                  </p>
                </div>

                {/* Employee Note */}
                {task.employeeNote && (
                  <div className="bg-white/3 rounded-lg p-2 col-span-2">
                    <p className="text-slate-500 text-xs">Employee Note</p>
                    <p className="text-white text-xs font-medium mt-0.5">
                      {task.employeeNote}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <Badge status={task.status} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(task)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-400/10 text-blue-400 text-xs font-medium transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    disabled={deletingId === task._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {deletingId === task._id ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-white font-semibold">
                {editingTask ? "Edit Task" : "New Task"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Title <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Task title..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Task details..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all resize-none"
                />
              </div>

              {/* Assign To */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Assign To <span className="text-cyan-400">*</span>
                </label>
                <select
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm({ ...form, assignedTo: e.target.value })
                  }
                  required
                  disabled={!!editingTask}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all disabled:opacity-50"
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName}
                    </option>
                  ))}
                </select>
                {editingTask && (
                  <p className="text-slate-600 text-xs mt-1">
                    Assigned employee cannot be changed
                  </p>
                )}
              </div>

              {/* Priority + Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                  ) : editingTask ? (
                    "Save Changes"
                  ) : (
                    "Create Task"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white py-2.5 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

export default Tasks;
