const User = require("../models/User");
const { sendActivationEmail } = require("../services/emailService");

const createEmployee = async (req, res, next) => {
  try {
    const {
      email,
      fullName,
      dateOfBirth,
      maritalStatus,
      nationality,
      address,
      yearsOfExperience,
      joinDate,
      contractDuration,
      salary,
      annualLeaveBalance,
      department,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const employee = new User({
      email,
      fullName,
      role: "employee",
      isActive: false,
      dateOfBirth: dateOfBirth || null,
      maritalStatus: maritalStatus || null,
      nationality: nationality || null,
      address: address || null,
      yearsOfExperience: yearsOfExperience ?? null,
      joinDate: joinDate || null,
      contractDuration: contractDuration || null,
      salary: salary ?? null,
      annualLeaveBalance: annualLeaveBalance ?? 20,
      department: department || null,
    });

    const rawToken = employee.generateActivationToken();
    await employee.save();

    try {
      await sendActivationEmail({
        to: email,
        fullName,
        activationToken: rawToken,
      });
    } catch (emailError) {
      console.error("Activation email failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Employee account created. Activation email sent.",
      data: {
        employee: {
          id: employee._id,
          email: employee.email,
          fullName: employee.fullName,
          isActive: employee.isActive,
          department: employee.department,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, department, search, isActive } = req.query;

    const filter = { role: "employee" };

    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);

    const employees = await User.find(filter)
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        employees,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      role: "employee",
    }).populate("department", "name description");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const prohibited = [
      "role",
      "email",
      "password",
      "refreshToken",
      "activationToken",
    ];
    prohibited.forEach((field) => delete req.body[field]);

    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, role: "employee" },
      { $set: req.body },
      { new: true, runValidators: true },
    ).populate("department", "name description");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, role: "employee" },
      { $set: { isDeleted: true, deletedAt: new Date(), isActive: false } },
      { new: true },
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deactivated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const resendActivation = async (req, res, next) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      role: "employee",
      isActive: false,
    }).select("+activationToken +activationTokenExpiry");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found or already activated.",
      });
    }

    const rawToken = employee.generateActivationToken();
    await employee.save({ validateBeforeSave: false });

    await sendActivationEmail({
      to: employee.email,
      fullName: employee.fullName,
      activationToken: rawToken,
    });

    res.status(200).json({
      success: true,
      message: "Activation email resent.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  resendActivation,
};
