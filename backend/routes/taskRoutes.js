const express = require("express");
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getEmployeeTasks,
  updateTaskStatus,
} = require("../controllers/taskController");
const { protect, restrict } = require("../middleware/auth");

// Employee routes (must be before /:id to avoid conflict)
router.get("/my/tasks", protect, restrict("employee"), getEmployeeTasks);
router.patch(
  "/my/tasks/:id/status",
  protect,
  restrict("employee"),
  updateTaskStatus,
);

// Admin routes
router.post("/", protect, restrict("admin"), createTask);
router.get("/", protect, restrict("admin"), getAllTasks);
router.get("/:id", protect, restrict("admin"), getTaskById);
router.patch("/:id", protect, restrict("admin"), updateTask);
router.delete("/:id", protect, restrict("admin"), deleteTask);

module.exports = router;
