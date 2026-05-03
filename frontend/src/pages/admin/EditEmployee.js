import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
}) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
    />
  </div>
);

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    maritalStatus: "",
    nationality: "",
    address: "",
    phone: "",
    yearsOfExperience: "",
    joinDate: "",
    contractDuration: "",
    salary: "",
    annualLeaveBalance: "",
    department: "",
    isActive: true,
  });

  const [employeeEmail, setEmployeeEmail] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/admin/employees/${id}`);
        const emp = res.data.data.employee;
        setEmployeeEmail(emp.email);
        setForm({
          fullName: emp.fullName || "",
          dateOfBirth: emp.dateOfBirth
            ? new Date(emp.dateOfBirth).toISOString().split("T")[0]
            : "",
          maritalStatus: emp.maritalStatus || "",
          nationality: emp.nationality || "",
          address: emp.address || "",
          phone: emp.phone || "",
          yearsOfExperience: emp.yearsOfExperience ?? "",
          joinDate: emp.joinDate
            ? new Date(emp.joinDate).toISOString().split("T")[0]
            : "",
          contractDuration: emp.contractDuration || "",
          salary: emp.salary ?? "",
          annualLeaveBalance: emp.annualLeaveBalance ?? 20,
          department: emp.department?._id || "",
          isActive: emp.isActive,
        });
      } catch {
        toast.error("Failed to load employee");
        navigate("/admin/employees");
      } finally {
        setLoading(false);
      }
    };

    const fetchDepts = async () => {
      try {
        const res = await api.get("/admin/departments");
        setDepartments(res.data.data.departments);
      } catch {}
    };

    fetchEmployee();
    fetchDepts();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.department) payload.department = null;
      if (!payload.dateOfBirth) delete payload.dateOfBirth;
      if (!payload.maritalStatus) delete payload.maritalStatus;
      if (payload.yearsOfExperience === "") delete payload.yearsOfExperience;
      if (payload.salary === "") delete payload.salary;

      await api.patch(`/admin/employees/${id}`, payload);
      toast.success("Employee updated successfully");
      navigate("/admin/employees");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update employee");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/employees")}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Employee</h1>
          <p className="text-slate-500 text-sm mt-1">{employeeEmail}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="Full Name"
              name="fullName"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder={employeeEmail}
              value={employeeEmail}
              disabled
            />
            <InputField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="e.g. +966 5X XXX XXXX"
              value={form.phone}
              onChange={handleChange}
            />
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Marital Status
              </label>
              <select
                name="maritalStatus"
                value={form.maritalStatus}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
              >
                <option value="">Select status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            <InputField
              label="Nationality"
              name="nationality"
              placeholder="e.g. Saudi"
              value={form.nationality}
              onChange={handleChange}
            />
            <InputField
              label="Address"
              name="address"
              placeholder="City, Country"
              value={form.address}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
            Employment Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="Join Date"
              name="joinDate"
              type="date"
              value={form.joinDate}
              onChange={handleChange}
            />
            <InputField
              label="Contract Duration"
              name="contractDuration"
              placeholder="e.g. 1 year"
              value={form.contractDuration}
              onChange={handleChange}
            />
            <InputField
              label="Years of Experience"
              name="yearsOfExperience"
              type="number"
              placeholder="e.g. 3"
              value={form.yearsOfExperience}
              onChange={handleChange}
            />
            <InputField
              label="Salary"
              name="salary"
              type="number"
              placeholder="e.g. 5000"
              value={form.salary}
              onChange={handleChange}
            />
            <InputField
              label="Annual Leave Balance"
              name="annualLeaveBalance"
              type="number"
              placeholder="e.g. 20"
              value={form.annualLeaveBalance}
              onChange={handleChange}
            />
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Department
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
              >
                <option value="">No department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Account Status */}
        {/* Account Status */}
        <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
            Account Status
          </h2>
          <div className="flex items-center gap-4">
            {[
              { label: "Active", value: true, color: "green" },
              { label: "Archived", value: false, color: "red" },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setForm({ ...form, isActive: opt.value })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  form.isActive === opt.value
                    ? opt.color === "green"
                      ? "bg-green-400/10 border-green-400/30 text-green-400"
                      : "bg-slate-400/10 border-slate-400/30 text-slate-400"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    form.isActive === opt.value
                      ? opt.color === "green"
                        ? "bg-green-400"
                        : "bg-slate-400"
                      : "bg-slate-600"
                  }`}
                />
                {opt.label}
              </button>
            ))}
          </div>

          {/* Archived warning */}
          {!form.isActive && (
            <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl bg-slate-400/10 border border-slate-400/20">
              <svg
                className="w-4 h-4 text-slate-400 flex-shrink-0"
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
              <p className="text-slate-400 text-xs">
                This employee is archived. Set status to{" "}
                <span className="text-green-400 font-medium">Active</span> and
                save to reactivate their account.
              </p>
            </div>
          )}

          {/* Active info */}
          {form.isActive && (
            <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl bg-green-400/10 border border-green-400/20">
              <svg
                className="w-4 h-4 text-green-400 flex-shrink-0"
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
              <p className="text-green-400 text-xs">
                This employee is active and can access the system.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                Saving...
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/employees")}
            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
