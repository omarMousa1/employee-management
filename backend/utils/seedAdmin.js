require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/db");

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: "admin" }).setOptions({
      includeDeleted: true,
    });

    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    const admin = await User.create({
      email: "admin@company.com",
      password: "Admin@123456",
      fullName: "System Administrator",
      role: "admin",
      isActive: true,
    });

    console.log("Admin created successfully:");
    console.log("Email   :", admin.email);
    console.log("Password: Admin@123456");
    process.exit(0);
  } catch (error) {
    console.log("Seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
