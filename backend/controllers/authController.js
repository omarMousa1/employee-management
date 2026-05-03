const crypto = require("crypto");
const User = require("../models/User");
const {
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../utils/jwt.js");

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select(
      "+password +refreshTokens",
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is not activated. Please check your email.",
      });
    }

    const { accessToken, refreshToken } = generateTokenPair(user);

    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const activateAccount = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      activationToken: hashedToken,
      activationTokenExpiry: { $gt: new Date() },
    }).select("+activationToken +activationTokenExpiry");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Activation link is invalid or has expired.",
      });
    }

    user.password = password;
    user.isActive = true;
    user.activationToken = undefined;
    user.activationTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account activated successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided.",
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }

    const user = await User.findById(decoded.id).select("+refreshTokens");

    if (!user || !user.refreshTokens.includes(token)) {
      if (user) {
        user.refreshTokens = [];
        await user.save({ validateBeforeSave: false });
      }
      return res.status(401).json({
        success: false,
        message: "Refresh token reuse detected. Please log in again.",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      generateTokenPair(user);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      const user = await User.findById(req.user.id).select("+refreshTokens");
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
        await user.save({ validateBeforeSave: false });
      }
    }

    res.clearCookie("refreshToken");
    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "department",
      "name description",
    );

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, activateAccount, refreshAccessToken, logout, getMe };
