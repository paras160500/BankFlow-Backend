// ────────────────────────────────────────────────────────────────────────
//                         Import/ Init Statements
// ────────────────────────────────────────────────────────────────────────

const accountModel = require("../models/account.model");

// ────────────────────────────────────────────────────────────────────────
//                              Create Account
// ────────────────────────────────────────────────────────────────────────

/**
 *
 * - Account Create Controller
 * - POST /api/accounts
 */
const createAccount = async (req, res) => {
  try {
    // Getting the user from the req
    const user = req.user;
    // Creating an account
    const account = await accountModel.create({
      user: user._id,
    });
    // Check if the account is created or not
    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Issue in creating account",
      });
    }
    // If account created
    return res.status(201).json({
      success: true,
      message: "Account created",
      account,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

const getUserAccountsController = async (req, res) => {
  try {
    const accounts = await accountModel.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      accounts,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

const getAccountBalance = async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id,
    });
    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Account not found",
      });
    }
    const balance = await account.getBalance();

    res.status(200).json({
      success: true,
      accountId: account._id,
      balance: balance,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createAccount,
  getUserAccountsController,
  getAccountBalance,
};
