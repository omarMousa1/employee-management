const express = require("express");
const router = express.Router();
const {
  createLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  reviewLeaveRequest,
} = require("../controllers/leaveController");
const { protect, restrict } = require("../middleware/auth");

// Employee routes
router.post("/", protect, restrict("employee"), createLeaveRequest);
router.get("/my", protect, restrict("employee"), getMyLeaveRequests);

// Admin routes
router.get("/", protect, restrict("admin"), getAllLeaveRequests);
router.patch("/:id/review", protect, restrict("admin"), reviewLeaveRequest);

module.exports = router;
