// ────────────────────────────────────────────────────────────────────────
//                         Import/ Init Statements
// ────────────────────────────────────────────────────────────────────────

const tokenBlackListModel = require("../models/blacklist.model");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

// ────────────────────────────────────────────────────────────────────────
//                         Auth Middleware logic
// ────────────────────────────────────────────────────────────────────────

const authMiddleWare = async (req, res, next) => {
  // Getting the token from cookies or headers
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  //   If we cant find the token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
  const isBlackListed = await tokenBlackListModel.findOne({ token });
  if (isBlackListed) {
    return res.status(401).json({
      message: "Unauthorized token is invalid",
    });
  }
  try {
    // Try to decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // If we are not able to decode the token
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    // Getting the user based on the userId
    const user = await userModel.findById(decoded.userId);
    // If user is not available
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    // Setting up the user
    req.user = user;
    // Calling the next
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access, token is invalid",
    });
  }
};

const authSystemUserMiddleware = async (req, res, next) => {
  // Getting the token from cookies or headers
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  //   If we cant find the token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
  const isBlackListed = await tokenBlackListModel.findOne({ token });
  if (isBlackListed) {
    return res.status(401).json({
      message: "Unauthorized token is invalid",
    });
  }
  try {
    // Try to decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // If we are not able to decode the token
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    // Getting the user based on the userId
    const user = await userModel.findById(decoded.userId).select("+systemUser");
    // If user is not available
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    if (!user.systemUser) {
      return res.status(401).json({
        success: false,
        message: "Forbidden Access, not a system user.",
      });
    }
    // Setting up the user
    req.user = user;
    // Calling the next
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access, token is invalid",
    });
  }
};

module.exports = {
  authMiddleWare,
  authSystemUserMiddleware,
};
