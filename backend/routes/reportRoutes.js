const express = require("express");
const router = express.Router();
const { generateEmployeeReport } = require("../controllers/reportController");
const { protect, restrict } = require("../middleware/auth");

router.get("/my/report", protect, restrict("employee"), generateEmployeeReport);

module.exports = router;
