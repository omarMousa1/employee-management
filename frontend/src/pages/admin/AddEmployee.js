import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
}) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
      {label} {required && <span className="text-cyan-400">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
    />
  </div>
);

const AddEmployee = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "",
    maritalStatus: "",
    nationality: "",
    address: "",
    phone: "",
    yearsOfExperience: "",
    joinDate: "",
    contractDuration: "",
    salary: "",
    annualLeaveBalance: 20,
    department: "",
  });

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get("/admin/departments");
        setDepartments(res.data.data.departments);
      } catch {}
    };
    fetchDepts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.department) delete payload.department;
      if (!payload.dateOfBirth) delete payload.dateOfBirth;
      if (!payload.maritalStatus) delete payload.maritalStatus;
      if (payload.yearsOfExperience === "") delete payload.yearsOfExperience;
      if (payload.salary === "") delete payload.salary;

      await api.post("/admin/employees", payload);
      toast.success("Employee created! Activation email sent.");
      navigate("/admin/employees");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-white">Add Employee</h1>
          <p className="text-slate-500 text-sm mt-1">
            Create a new employee account
          </p>
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
              required
              value={form.fullName}
              onChange={handleChange}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="john@company.com"
              required
              value={form.email}
              onChange={handleChange}
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
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Annual Leave Balance
              </label>
              <input
                type="number"
                name="annualLeaveBalance"
                value={form.annualLeaveBalance}
                onChange={handleChange}
                min={0}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
              />
            </div>
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

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                Creating...
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Employee
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

export default AddEmployee;
