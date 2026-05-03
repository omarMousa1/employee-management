const Task = require("../models/Task");
const User = require("../models/User");

const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, deadline } = req.body;

    const employee = await User.findOne({ _id: assignedTo, role: "employee" });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      priority,
      deadline,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate("assignedTo", "fullName email")
      .populate("assignedBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "fullName email")
      .populate("assignedBy", "fullName email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const prohibited = ["assignedBy", "assignedTo"];
    prohibited.forEach((field) => delete req.body[field]);

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, rinValidators: true },
    )
      .populate("assignedTo", "fullName email")
      .populate("assignedBy", "fullName email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("assignedBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, employeeNote } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (status) task.status = status;
    if (employeeNote !== undefined) task.employeeNote = employeeNote;
    await task.save();

    res.status(200).json({
      success: true,
      message: "Task status updated.",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getEmployeeTasks,
  updateTaskStatus,
};
