const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  login,
  activateAccount,
  refreshAccessToken,
  logout,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/login", login);
router.post("/activate", activateAccount);
router.post("/refresh", refreshAccessToken);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/me", protect, async (req, res, next) => {
  try {
    const prohibited = [
      "role",
      "email",
      "password",
      "salary",
      "annualLeaveBalance",
      "isActive",
      "department",
      "joinDate",
      "contractDuration",
      "yearsOfExperience",
    ];
    prohibited.forEach((field) => delete req.body[field]);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true },
    ).populate("department", "name description");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/change-password", protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
