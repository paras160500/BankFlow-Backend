const { sendRegisterEmail } = require("../config/mail");
const tokenBlackListModel = require("../models/blacklist.model");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

// ────────────────────────────────────────────────────────────────────────
//                              User Register
// ────────────────────────────────────────────────────────────────────────

/**
 *
 * - User Register Controller
 * - POST /api/auth/register
 */
const userRegisterController = async (req, res) => {
  // Check if the email password and name passed or not
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(401).json({
      success: false,
      message: "Please provide all the required fields.",
    });
  }
  try {
    // Check the user available or not
    const isExists = await userModel.findOne({ email });
    if (isExists) {
      return res.status(422).json({
        success: false,
        message: "User Already exists with email.",
      });
    }
    // Creating a new account
    const user = await userModel.create({
      email,
      password,
      name,
    });
    //   Creating a token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    // Saving the cookie
    res.cookie("token", token);

    res.status(201).json({
      success: true,
      message: "User Register Successfully.",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
    await sendRegisterEmail(user.email, user.name);
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

// ────────────────────────────────────────────────────────────────────────
//                              User Login
// ────────────────────────────────────────────────────────────────────────

/**
 *
 * - User Login Controller
 * - POST /api/auth/login
 */
const userLoginControoler = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json({
      success: false,
      message: "Please provide all the required fields.",
    });
  }
  try {
    // Check if the user if there or not
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email or password is invalid",
      });
    }
    // Check if the password is correct or not
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Email or password is invalid",
      });
    }
    // Creating a token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    // Saving the cookie
    res.cookie("token", token);
    // REturning the user
    res.status(201).json({
      success: true,
      message: "User Login Successfully.",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

const userLogoutcontroller = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(201).json({
      success: false,
      message: "User Logged out Successfully",
    });
  }

  await tokenBlackListModel.create({
    token: token,
  });
  res.clearCookie("token");
  res.status(200).json({
    message: "User logged out successfully",
  });
};

module.exports = {
  userRegisterController,
  userLoginControoler,
  userLogoutcontroller,
};
