// ────────────────────────────────────────────────────────────────────────
//                            Import Statements
// ────────────────────────────────────────────────────────────────────────
const express = require("express");
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRouter = require("./routes/transaction.routes");
const cookieParser = require("cookie-parser");

const app = express();

// ────────────────────────────────────────────────────────────────────────
//                            Logic Statements
// ────────────────────────────────────────────────────────────────────────

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routers
app.get("/", (req, res) => {
  res.status(201).json({
    success: true,
    message: "Its working....",
  });
});
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);

module.exports = app;
