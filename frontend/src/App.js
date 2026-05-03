import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

// Auth pages
import Login from "./pages/auth/Login";
import Activate from "./pages/auth/Activate";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import Employees from "./pages/admin/Employees";
import AddEmployee from "./pages/admin/AddEmployee";
import Departments from "./pages/admin/Departments";
import Leaves from "./pages/admin/Leaves";
import Loans from "./pages/admin/Loans";
import AdminTasks from "./pages/admin/Tasks";

// Employee pages
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeTasks from "./pages/employee/Tasks";
import LeaveRequest from "./pages/employee/LeaveRequest";
import LoanRequest from "./pages/employee/LoanRequest";
import Profile from "./pages/employee/Profile";
import EditEmployee from "./pages/admin/EditEmployee";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#e2e8f0",
            border: "1px solid #1e293b",
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/add" element={<AddEmployee />} />
          <Route path="employees/:id/edit" element={<EditEmployee />} />
          <Route path="departments" element={<Departments />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="loans" element={<Loans />} />
          <Route path="tasks" element={<AdminTasks />} />
        </Route>

        {/* Employee */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDashboard />} />
          <Route path="tasks" element={<EmployeeTasks />} />
          <Route path="leaves" element={<LeaveRequest />} />
          <Route path="loans" element={<LoanRequest />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
