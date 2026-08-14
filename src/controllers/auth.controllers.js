const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const generate_token = (id) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
};

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
};

module.exports = {
  userRegisterController,
  userLoginControoler,
};
