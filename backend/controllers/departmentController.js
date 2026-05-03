const Department = require("../models/Department.js");
const User = require("../models/User.js");

const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Check if a soft-deleted department with same name exists
    const existing = await Department.findOne({ name }).setOptions({
      includeDeleted: true,
    });

    if (existing && !existing.isDeleted) {
      return res.status(409).json({
        success: false,
        message: "Department name already exists.",
      });
    }

    // If soft-deleted with same name → restore it
    if (existing && existing.isDeleted) {
      existing.isDeleted = false;
      existing.deletedAt = null;
      existing.description = description || existing.description;
      await existing.save();

      return res.status(201).json({
        success: true,
        message: "Department created successfully.",
        data: { department: existing },
      });
    }

    const department = await Department.create({ name, description });

    res.status(201).json({
      success: true,
      message: "Department created successfully.",
      data: { department },
    });
  } catch (error) {
    next(error);
  }
};

const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate("employeeCount")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { departments },
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      "employeeCount",
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    const employees = await User.find({
      department: department._id,
      role: "employee",
    }).select("fullName email isActive joinDate");

    res.status(200).json({
      success: true,
      data: { department, employees },
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: { name, description } },
      { new: true, runValidators: true },
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department updated.",
      data: { department },
    });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    await User.updateMany(
      { department: department._id },
      { $set: { department: null } },
    );

    department.isDeleted = true;
    department.deletedAt = new Date();
    await department.save();

    res.status(200).json({
      success: true,
      message: "Department deleted and employees unassigned.",
    });
  } catch (error) {
    next(error);
  }
};

const assignEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required.",
      });
    }

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    const employee = await User.findOneAndUpdate(
      { _id: employeeId, role: "employee" },
      { $set: { department: department._id } },
      { new: true },
    ).select("fullName email department");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `${employee.fullName} assigned to ${department.name}.`,
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  assignEmployee,
};
