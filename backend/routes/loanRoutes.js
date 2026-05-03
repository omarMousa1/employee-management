const express = require("express");
const router = express.Router();
const {
  createLoanRequest,
  getMyLoanRequests,
  getAllLoanRequests,
  reviewLoanRequest,
} = require("../controllers/loanController");
const { protect, restrict } = require("../middleware/auth");

// Employee routes
router.post("/", protect, restrict("employee"), createLoanRequest);
router.get("/my", protect, restrict("employee"), getMyLoanRequests);

// Admin routes
router.get("/", protect, restrict("admin"), getAllLoanRequests);
router.patch("/:id/review", protect, restrict("admin"), reviewLoanRequest);

module.exports = router;
