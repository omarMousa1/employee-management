const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

departmentSchema.virtual("employeeCount", {
  ref: "User",
  localField: "_id",
  foreignField: "department",
  count: true,
});

departmentSchema.pre("find", function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

departmentSchema.pre("findOne", function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

departmentSchema.pre("findOneAndUpdate", function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;
