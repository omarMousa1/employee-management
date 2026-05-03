const express = require("express");
const router = express.Router();
const {
  getAdminDashboard,
  getEmployeeDashboard,
} = require("../controllers/dashboardController");
const { protect, restrict } = require("../middleware/auth");

router.get("/admin", protect, restrict("admin"), getAdminDashboard);
router.get("/employee", protect, restrict("employee"), getEmployeeDashboard);

module.exports = router;
