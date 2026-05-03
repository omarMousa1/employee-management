require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const taskRoutes = require("./routes/taskRoutes.js");
const leaveRoutes = require("./routes/leaveRoutes");
const loanRequest = require("./routes/loanRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes.js");

connectDB();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "https://flourishing-rugelach-244afa.netlify.app",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/employees", employeeRoutes);
app.use("/api/admin/departments", departmentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/loans", loanRequest);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
