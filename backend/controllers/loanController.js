const LoanRequest = require("../models/LoanRequest");

const createLoanRequest = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;

    const pendingLoan = await LoanRequest.findOne({
      employee: req.user._id,
      status: "pending",
    });

    if (pendingLoan) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending loan request.",
      });
    }

    const loanRequest = await LoanRequest.create({
      employee: req.user._id,
      amount,
      reason,
    });

    res.status(200).json({
      success: true,
      message: "Loan request submitted successfully.",
      data: { loanRequest },
    });
  } catch (error) {
    next(error);
  }
};

const getMyLoanRequests = async (req, res, next) => {
  try {
    const loanRequests = await LoanRequest.find({
      employee: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { loanRequests },
    });
  } catch (error) {
    next(error);
  }
};

const getAllLoanRequests = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const loanRequests = await LoanRequest.find(filter)
      .populate("employee", "fullName email department salary")
      .populate("reviewedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { loanRequests },
    });
  } catch (error) {
    next(error);
  }
};

const reviewLoanRequest = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const loanRequest = await LoanRequest.findById(req.params.id);

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: "Loan request not found.",
      });
    }

    if (loanRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been reviewed.",
      });
    }

    loanRequest.status = status;
    loanRequest.adminNote = adminNote || null;
    loanRequest.reviewedBy = req.user._id;
    loanRequest.reviewedAt = new Date();
    await loanRequest.save();

    res.status(200).json({
      success: true,
      message: `Loan request ${status}.`,
      data: { loanRequest },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLoanRequest,
  getMyLoanRequests,
  getAllLoanRequests,
  reviewLoanRequest,
};
