const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User.js");

const createLeaveRequest = async (req, res, next) => {
  try {
    const { startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date.",
      });
    }

    // Check for overlapping leave requests
    const overlapping = await LeaveRequest.findOne({
      employee: req.user._id,
      status: { $in: ["pending", "approved"] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start },
        },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${overlapping.status} leave request that overlaps with these dates.`,
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date.",
      });
    }

    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const employee = await User.findById(req.user._id);

    if (employee.annualLeaveBalance < numberOfDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. You have ${employee.annualLeaveBalance} days left.`,
      });
    }

    const leaveRequest = await LeaveRequest.create({
      employee: req.user._id,
      startDate,
      endDate,
      numberOfDays,
      reason,
      balanceAtRequest: employee.annualLeaveBalance,
    });

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully.",
      data: { leaveRequest },
    });
  } catch (error) {
    next(error);
  }
};

const getMyLeaveRequests = async (req, res, next) => {
  try {
    const leaveRequests = await LeaveRequest.find({
      employee: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { leaveRequests },
    });
  } catch (error) {
    next(error);
  }
};

const getAllLeaveRequests = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const leaveRequests = await LeaveRequest.find(filter)
      .populate("employee", "fullName email department")
      .populate("reviewedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { leaveRequests },
    });
  } catch (error) {
    next(error);
  }
};

const reviewLeaveRequest = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    if (leaveRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been reviewed.",
      });
    }

    if (status === "approved") {
      const employee = await User.findById(leaveRequest.employee);

      if (employee.annualLeaveBalance < leaveRequest.numberOfDays) {
        return res.status(400).json({
          success: false,
          message: "Employee has insufficient leave balance.",
        });
      }
      employee.annualLeaveBalance -= leaveRequest.numberOfDays;
      await employee.save({ validateBeforeSave: false });
    }

    leaveRequest.status = status;
    leaveRequest.adminNote = adminNote || null;
    leaveRequest.reviewedBy = req.user._id;
    leaveRequest.reviewedAt = new Date();
    await leaveRequest.save();

    return res.status(200).json({
      success: true,
      message: `Leave request ${status}.`,
      data: { leaveRequest },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  reviewLeaveRequest,
};
