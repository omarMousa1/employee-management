const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must be assigned to an employee"],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "done", "cancelled"],
      default: "pending",
    },
    deadline: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    employeeNote: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.pre("save", async function () {
  if (
    this.isModified("status") &&
    this.status === "done" &&
    !this.completedAt
  ) {
    this.completedAt = new Date();
  }
  if (this.isModified("status") && this.status !== "done") {
    this.completedAt = null;
  }
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
