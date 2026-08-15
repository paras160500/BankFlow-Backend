// ────────────────────────────────────────────────────────────────────────
//                            Import Statements
// ────────────────────────────────────────────────────────────────────────
const express = require("express");
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRouter = require("./routes/transaction.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ────────────────────────────────────────────────────────────────────────
//                            Logic Statements
// ────────────────────────────────────────────────────────────────────────

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend.vercel.app",
      "https://bankflowdash-3uguoeae.manus.space",
      "https://3000-ibwsqfrhk2sopb0xabhru-19fe7248.us3.manus.computer/",
    ],
    credentials: true,
  }),
);

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
