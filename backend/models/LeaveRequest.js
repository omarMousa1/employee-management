const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: [1, "Leave must be at least 1 day"],
    },
    reason: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    adminNote: {
      type: String,
      trim: true,
      default: null,
    },
    balanceAtRequest: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
module.exports = LeaveRequest;
