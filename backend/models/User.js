const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    activationToken: {
      type: String,
      select: false,
    },
    activationTokenExpiry: {
      type: Date,
      select: false,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
      default: null,
    },
    nationality: {
      type: String,
      trim: true,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: null,
    },
    joinDate: {
      type: Date,
      default: null,
    },
    contractDuration: {
      type: String,
      trim: true,
      default: null,
    },
    salary: {
      type: Number,
      min: 0,
      default: null,
    },
    annualLeaveBalance: {
      type: Number,
      default: 20,
      min: 0,
    },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.pre("find", function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

userSchema.pre("findOne", function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

userSchema.pre("findOneAndUpdate", function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateActivationToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.activationToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.activationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return rawToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
