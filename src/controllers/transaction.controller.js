// ────────────────────────────────────────────────────────────────────────
//                         Import/ Init Statements
// ────────────────────────────────────────────────────────────────────────
const mongoose = require("mongoose");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const { sendTransactionEmail } = require("../config/mail");

// ────────────────────────────────────────────────────────────────────────
//                           Create Initial Fund
// ────────────────────────────────────────────────────────────────────────

const createInitialFundsTransaction = async (req, res) => {
  // Getting the data from the req
  const { toAccount, amount, idempotencyKey } = req.body;
  // Validating the data
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(401).json({
      success: false,
      message: "Please provide all the required fields.",
    });
  }
  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });
  if (!toUserAccount) {
    return res.status(401).json({
      success: false,
      message: "Invalid account.",
    });
  }
  const fromUserAccount = await accountModel
    .findOne({
      user: req.user._id,
    })
    .populate({
      path: "user",
      select: "+systemUser",
    });
  if (!fromUserAccount || !fromUserAccount.user.systemUser) {
    return res.status(401).json({
      success: false,
      message: "System user account not found.",
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  res.status(201).json({
    message: "Initial fund transaction completed successfully.",
    transaction,
  });
};

// ────────────────────────────────────────────────────────────────────────
//                              Create Transaction
// ────────────────────────────────────────────────────────────────────────

const createTransaction = async (req, res) => {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  let session = null;

  try {
    // ------------------------------------------------------------
    // 1. Validate request body
    // ------------------------------------------------------------
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields.",
      });
    }

    // ------------------------------------------------------------
    // 2. Validate amount
    // ------------------------------------------------------------
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount should be greater than 0.",
      });
    }

    // ------------------------------------------------------------
    // 3. Check if FROM account exists
    // ------------------------------------------------------------
    const fromUserAccount = await accountModel.findOne({
      _id: fromAccount,
    });

    if (!fromUserAccount) {
      return res.status(400).json({
        success: false,
        message: "From Account is not valid",
      });
    }

    // ------------------------------------------------------------
    // 4. Check if TO account exists
    // ------------------------------------------------------------
    const toUserAccount = await accountModel.findOne({
      _id: toAccount,
    });

    if (!toUserAccount) {
      return res.status(400).json({
        success: false,
        message: "To Account is not valid",
      });
    }

    // ------------------------------------------------------------
    // 5. Check idempotency key
    // ------------------------------------------------------------
    const isTransactionAlreadyExists = await transactionModel.findOne({
      idempotencyKey,
    });

    if (isTransactionAlreadyExists) {
      // Transaction already completed
      if (isTransactionAlreadyExists.status === "COMPLETED") {
        return res.status(200).json({
          success: true,
          message: "Transaction already processed",
          transaction: isTransactionAlreadyExists,
        });
      }

      // Transaction is pending
      if (isTransactionAlreadyExists.status === "PENDING") {
        return res.status(200).json({
          success: true,
          message: "Transaction is still processing",
          transaction: isTransactionAlreadyExists,
        });
      }

      // Transaction failed
      if (isTransactionAlreadyExists.status === "FAILED") {
        return res.status(500).json({
          success: false,
          message: "Transaction processing failed.",
        });
      }

      // Transaction reversed
      if (isTransactionAlreadyExists.status === "REVERSED") {
        return res.status(500).json({
          success: false,
          message: "Transaction was reversed.",
        });
      }
    }

    // ------------------------------------------------------------
    // 6. Check account status
    // ------------------------------------------------------------
    if (
      fromUserAccount.status !== "ACTIVE" ||
      toUserAccount.status !== "ACTIVE"
    ) {
      return res.status(400).json({
        success: false,
        message: "Both to and from accounts must be active.",
      });
    }

    // ------------------------------------------------------------
    // 7. Check sender balance
    // ------------------------------------------------------------
    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Funds, Current Balance is ${balance} and requested amount is ${amount}`,
      });
    }

    // ------------------------------------------------------------
    // 8. Start MongoDB transaction
    // ------------------------------------------------------------
    session = await mongoose.startSession();

    session.startTransaction();

    // ------------------------------------------------------------
    // 9. Create transaction record
    // ------------------------------------------------------------
    const transaction = (
      await transactionModel.create(
        [
          {
            fromAccount: fromUserAccount._id,
            toAccount: toUserAccount._id,
            amount: Number(amount),
            idempotencyKey,
            status: "PENDING",
          },
        ],
        { session },
      )
    )[0];

    // ------------------------------------------------------------
    // 10. Create DEBIT ledger entry
    // ------------------------------------------------------------
    await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          amount: Number(amount),
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    // ------------------------------------------------------------
    // Optional delay for testing
    // 10,000 ms = 10 seconds
    // ------------------------------------------------------------
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // ------------------------------------------------------------
    // 11. Create CREDIT ledger entry
    // ------------------------------------------------------------
    await ledgerModel.create(
      [
        {
          account: toUserAccount._id,
          amount: Number(amount),
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    // ------------------------------------------------------------
    // 12. Mark transaction as COMPLETED
    // ------------------------------------------------------------
    transaction.status = "COMPLETED";

    await transaction.save({ session });

    // ------------------------------------------------------------
    // 13. Commit MongoDB transaction
    // ------------------------------------------------------------
    await session.commitTransaction();

    // End session
    await session.endSession();
    session = null;

    // ------------------------------------------------------------
    // 14. Send email AFTER successful transaction
    // ------------------------------------------------------------
    await sendTransactionEmail(
      req.user.email,
      req.user.name,
      amount,
      toUserAccount._id,
    );

    // ------------------------------------------------------------
    // 15. Send success response
    // ------------------------------------------------------------
    return res.status(201).json({
      success: true,
      message: "Transaction completed successfully",
      transaction,
    });
  } catch (error) {
    // ------------------------------------------------------------
    // Rollback transaction if something failed
    // ------------------------------------------------------------
    if (session) {
      try {
        await session.abortTransaction();
        await session.endSession();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError.message);
      }
    }

    console.error("Transaction error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const accounts = await accountModel
      .find({ user: req.user._id })
      .select("_id");

    const accountIds = accounts.map((account) => account._id);

    const transactions = await transactionModel
      .find({
        $or: [
          { fromAccount: { $in: accountIds } },
          { toAccount: { $in: accountIds } },
        ],
      })
      .sort({ createdAt: -1 })
      .populate("fromAccount")
      .populate("toAccount");

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve transactions",
      error: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
  getUserTransactions,
};
