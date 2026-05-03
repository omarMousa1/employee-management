const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  resendActivation,
} = require("../controllers/employeeController");
const { protect, restrict } = require("../middleware/auth");

router.use(protect, restrict("admin"));

router.route("/").post(createEmployee).get(getAllEmployees);

router
  .route("/:id")
  .get(getEmployeeById)
  .patch(updateEmployee)
  .delete(deleteEmployee);

router.post("/:id/resend-activation", resendActivation);

module.exports = router;
