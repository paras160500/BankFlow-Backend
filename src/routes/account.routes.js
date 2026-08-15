// ────────────────────────────────────────────────────────────────────────
//                         Import/ Init Statements
// ────────────────────────────────────────────────────────────────────────
const express = require("express");
const { authMiddleWare } = require("../middleware/auth.middleware");
const {
  createAccount,
  getUserAccountsController,
  getAccountBalance,
} = require("../controllers/account.controller");

const router = express.Router();

// ────────────────────────────────────────────────────────────────────────
//                          Routing Logic
// ────────────────────────────────────────────────────────────────────────

router.post("/", authMiddleWare, createAccount);
router.get("/", authMiddleWare, getUserAccountsController);
router.get("/balance/:accountId", authMiddleWare, getAccountBalance);

module.exports = router;
