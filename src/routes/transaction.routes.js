// ────────────────────────────────────────────────────────────────────────
//                              Import Statement
// ────────────────────────────────────────────────────────────────────────
const express = require("express");
const {
  authMiddleWare,
  authSystemUserMiddleware,
} = require("../middleware/auth.middleware");
const {
  createTransaction,
  createInitialFundsTransaction,
  getUserTransactions,
} = require("../controllers/transaction.controller");
const router = express.Router();

// ────────────────────────────────────────────────────────────────────────
//                           Routes adding to router
// ────────────────────────────────────────────────────────────────────────

router.post("/", authMiddleWare, createTransaction);
router.post(
  "/system/initial-fund",
  authSystemUserMiddleware,
  createInitialFundsTransaction,
);
router.get("/", authMiddleWare, getUserTransactions);

module.exports = router;
