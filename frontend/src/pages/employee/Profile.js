import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import PasswordSection from "../../components/PasswordSection.js";

const Profile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    nationality: "",
    address: "",
    maritalStatus: "",
    phone: "",
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      const user = res.data.data.user;
      setEmployee(user);
      setForm({
        fullName: user.fullName || "",
        nationality: user.nationality || "",
        address: user.address || "",
        maritalStatus: user.maritalStatus || "",
        phone: user.phone || "",
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch("/auth/me/", form);
      toast.success("Profile updated!");
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const res = await api.get("/reports/my/report", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `report-${employee?.fullName?.replace(" ", "-")}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded!");
    } catch {
      toast.error("Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const InfoItem = ({ label, value }) => (
    <div className="bg-white/3 border border-white/5 rounded-xl p-4">
      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-white text-sm font-medium">
        {value || <span className="text-slate-600 italic">Not provided</span>}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">
            Your personal and employment information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              editMode
                ? "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
            }`}
          >
            {editMode ? (
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
                Cancel
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </>
            )}
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                Generating...
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-[#0d1424] border border-white/5 rounded-2xl p-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
            <span className="text-cyan-400 text-3xl font-bold">
              {employee?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">
              {employee?.fullName}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">{employee?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-cyan-400/10 text-cyan-400 border-cyan-400/20">
                {employee?.department?.name || "No Department"}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  employee?.isActive
                    ? "bg-green-400/10 text-green-400 border-green-400/20"
                    : "bg-red-400/10 text-red-400 border-red-400/20"
                }`}
              >
                {employee?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
                Edit Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    placeholder="Your full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={form.nationality}
                    onChange={(e) =>
                      setForm({ ...form, nationality: e.target.value })
                    }
                    placeholder="e.g. Saudi"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                  />
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    Marital Status
                  </label>
                  <select
                    value={form.maritalStatus}
                    onChange={(e) =>
                      setForm({ ...form, maritalStatus: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/50 transition-all"
                  >
                    <option value="">Select status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    Address
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="City, Country"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="e.g. +966 5X XXX XXXX"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
              <svg
                className="w-4 h-4 text-yellow-400 flex-shrink-0"
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
              <p className="text-yellow-400 text-xs">
                You can only update your name, nationality, address and marital
                status. Contact admin for other changes.
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f1e] font-bold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
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
                onClick={() => setEditMode(false)}
                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Personal Info - view mode */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoItem label="Full Name" value={employee?.fullName} />
                <InfoItem label="Email" value={employee?.email} />
                <InfoItem
                  label="Date of Birth"
                  value={
                    employee?.dateOfBirth
                      ? new Date(employee.dateOfBirth).toLocaleDateString()
                      : null
                  }
                />
                <InfoItem label="Phone" value={employee?.phone} />
                <InfoItem
                  label="Age"
                  value={employee?.age ? `${employee.age} years` : null}
                />
                <InfoItem
                  label="Marital Status"
                  value={
                    employee?.maritalStatus
                      ? employee.maritalStatus.charAt(0).toUpperCase() +
                        employee.maritalStatus.slice(1)
                      : null
                  }
                />
                <InfoItem label="Nationality" value={employee?.nationality} />
                <InfoItem label="Address" value={employee?.address} />
              </div>
            </div>

            {/* Employment Info - view mode */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
                Employment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoItem
                  label="Department"
                  value={employee?.department?.name}
                />
                <InfoItem
                  label="Join Date"
                  value={
                    employee?.joinDate
                      ? new Date(employee.joinDate).toLocaleDateString()
                      : null
                  }
                />
                <InfoItem
                  label="Contract Duration"
                  value={employee?.contractDuration}
                />
                <InfoItem
                  label="Years of Experience"
                  value={
                    employee?.yearsOfExperience !== null
                      ? `${employee?.yearsOfExperience} years`
                      : null
                  }
                />
                <InfoItem
                  label="Salary"
                  value={
                    employee?.salary
                      ? `$${employee.salary.toLocaleString()}`
                      : null
                  }
                />
                <InfoItem
                  label="Annual Leave Balance"
                  value={`${employee?.annualLeaveBalance} days`}
                />
              </div>
            </div>
          </>
        )}

        {/* Change Password */}
        {!editMode && <PasswordSection />}
      </div>
    </div>
  );
};

export default Profile;
