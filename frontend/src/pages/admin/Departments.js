// const Dashboard = () => <div>Dashboard</div>;
// export default Dashboard;

import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [editingDept, setEditingDept] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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

  const [form, setForm] = useState({ name: "", description: "" });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/departments");
      setDepartments(res.data.data.departments);
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/admin/employees", { params: { limit: 100 } });
      setEmployees(res.data.data.employees);
    } catch {}
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const openCreate = () => {
    setEditingDept(null);
    setForm({ name: "", description: "" });
    setShowForm(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setForm({ name: dept.name, description: dept.description || "" });
    setShowForm(true);
  };

  const openAssign = (dept) => {
    setSelectedDept(dept);
    setSelectedEmployee("");
    setShowAssign(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDept) {
        await api.patch(`/admin/departments/${editingDept._id}`, form);
        toast.success("Department updated");
      } else {
        await api.post("/admin/departments", form);
        toast.success("Department created");
      }
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Department",
      message:
        "Are you sure you want to delete this department? All employees will be unassigned.",
      confirmText: "Delete",
      confirmColor: "red",
      onConfirm: async () => {
        closeConfirm();
        setDeletingId(id);
        try {
          await api.delete(`/admin/departments/${id}`);
          toast.success("Department deleted");
          fetchDepartments();
        } catch {
          toast.error("Failed to delete department");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleAssign = async () => {
    if (!selectedEmployee) return toast.error("Please select an employee");
    setAssigningId(selectedDept._id);
    try {
      await api.patch(`/admin/departments/${selectedDept._id}/assign`, {
        employeeId: selectedEmployee,
      });
      toast.success("Employee assigned successfully");
      setShowAssign(false);
      fetchDepartments();
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign employee");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-slate-500 text-sm mt-1">
            {departments.length} departments total
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
          New Department
        </button>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : departments.length === 0 ? (
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">
            No departments yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div
              key={d._id}
              className="bg-[#0d1424] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-200 group"
            >
              {/* Departments Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-cyan-400"
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
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {d.name}
                    </h3>
                    <p className="text-cyan-400 text-xs mt-0.5">
                      {d.employeeCount ?? 0} employees
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {d.description && (
                <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                  {d.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => openAssign(d)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-cyan-400/10 text-slate-400 hover:text-cyan-400 text-xs font-medium transition-all"
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Assign
                </button>
                <button
                  onClick={() => openEdit(d)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-blue-400/10 text-slate-400 hover:text-blue-400 text-xs font-medium transition-all"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(d._id)}
                  disabled={deletingId === d._id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-red-400/10 text-slate-400 hover:text-red-400 text-xs font-medium transition-all disabled:opacity-50"
                >
                  {deletingId === d._id ? (
                    <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-white font-semibold">
                {editingDept ? "Edit Department" : "New Department"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
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
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Department Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Engineering"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                  ) : editingDept ? (
                    "Save Changes"
                  ) : (
                    "Create"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white py-2.5 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Employee Model */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1424] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="text-white font-semibold">Assign Employee</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  to {selectedDept?.name}
                </p>
              </div>
              <button
                onClick={() => setShowAssign(false)}
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
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Select Employee
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
                >
                  <option value="">Choose an employee...</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.fullName} - {e.department?.name || "No dept"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAssign}
                  disabled={!!assigningId}
                  className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {assigningId ? (
                    <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Assign"
                  )}
                </button>
                <button
                  onClick={() => setShowAssign(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white py-2.5 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
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

export default Departments;
