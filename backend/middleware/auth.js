const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please log in.",
      });
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is not activated.",
      });
    }

    req.user = user;
    next();
    // console.log("TOKEN:", token);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

const restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };
};

module.exports = { protect, restrict };
