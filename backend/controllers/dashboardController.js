const User = require("../models/User");
const Department = require("../models/Department");
const Task = require("../models/Task");
const LeaveRequest = require("../models/LeaveRequest");
const LoanRequest = require("../models/LoanRequest");

const getAdminDashboard = async (req, res, next) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const activeEmployees = await User.countDocuments({
      role: "employee",
      isActive: true,
    });
    const inactiveEmployees = await User.countDocuments({
      role: "employee",
      isActive: false,
    });
    const totalDepartments = await Department.countDocuments();

    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "pending" });
    const inProgressTasks = await Task.countDocuments({
      status: "in-progress",
    });
    const doneTasks = await Task.countDocuments({ status: "done" });

    const pendingLeave = await LeaveRequest.countDocuments({
      status: "pending",
    });
    const approvedLeave = await LeaveRequest.countDocuments({
      status: "approved",
    });
    const rejectedLeave = await LeaveRequest.countDocuments({
      status: "rejected",
    });

    const pendingLoans = await LoanRequest.countDocuments({
      status: "pending",
    });
    const approvedLoans = await LoanRequest.countDocuments({
      status: "approved",
    });
    const rejectedLoans = await LoanRequest.countDocuments({
      status: "rejected",
    });

    const departments = await Department.find()
      .populate("employeeCount")
      .sort({ name: 1 });

    const recentEmployee = await User.find({ role: "employee" })
      .select("fullName email isActive joinDate department")
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentLeave = await LeaveRequest.find()
      .populate("employee", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentLoans = await LoanRequest.find()
      .populate("employee", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          totalDepartments,
        },
        tasks: {
          total: totalTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          done: doneTasks,
        },
        leaves: {
          pending: pendingLeave,
          approved: approvedLeave,
          rejected: rejectedLeave,
        },
        loans: {
          pending: pendingLoans,
          approved: approvedLoans,
          rejected: rejectedLoans,
        },
        departments,
        recentEmployee,
        recentLeave,
        recentLoans,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeDashboard = async (req, res, next) => {
  try {
    const employee = await User.findById(req.user._id).populate(
      "department",
      "name description",
    );

    const totalTasks = await Task.countDocuments({ assignedTo: req.user._id });
    const pendingTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: "pending",
    });
    const inProgressTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: "in-progress",
    });
    const doneTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: "done",
    });

    const recentTasks = await Task.find({ assignedTo: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const leaveRequests = await LeaveRequest.find({ employee: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const loanRequests = await LoanRequest.find({ employee: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        employee,
        tasks: {
          total: totalTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          done: doneTasks,
          recent: recentTasks,
        },
        leaves: {
          balance: employee.annualLeaveBalance,
          recent: leaveRequests,
        },
        loans: {
          recent: loanRequests,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminDashboard, getEmployeeDashboard };
