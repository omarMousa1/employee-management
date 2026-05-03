const mongoose = require("mongoose");

const LoanRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Loan amount is required"],
      min: [1, "Loan amount must be greater than 0"],
    },
    reason: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    adminNote: {
      type: String,
      trim: true,
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

const LoanRequest = mongoose.model("LoanRequest", LoanRequestSchema);
module.exports = LoanRequest;
