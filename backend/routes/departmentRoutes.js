const express = require("express");
const router = express.Router();
const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  assignEmployee,
} = require("../controllers/departmentController");
const { protect, restrict } = require("../middleware/auth");

router.use(protect, restrict("admin"));

router.route("/").post(createDepartment).get(getAllDepartments);

router
  .route("/:id")
  .get(getDepartmentById)
  .patch(updateDepartment)
  .delete(deleteDepartment);

router.patch("/:id/assign", assignEmployee);

module.exports = router;
