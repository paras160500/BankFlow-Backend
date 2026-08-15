// ────────────────────────────────────────────────────────────────────────
//                         Import/ Init Statements
// ────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

// ────────────────────────────────────────────────────────────────────────
//                              Schema Defination
// ────────────────────────────────────────────────────────────────────────

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Account must be associated with a user"],
      index: true, // For fast retrieval
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status can be either ACTIVE,FROZEN or CLOSED",
      },
      default: "ACTIVE",
    },
    currency: {
      type: String,
      required: [true, "Currency is required for creating an account"],
      default: "INR",
    },
  },
  { timestamps: true },
);

// Creating compound index for fast retrival...
accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function () {
  const balanceData = await ledgerModel.aggregate([
    // 1. Get only this account's ledger entries
    {
      $match: {
        account: this._id,
      },
    },

    // 2. Calculate total debit and credit
    {
      $group: {
        _id: null,

        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
          },
        },

        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
          },
        },
      },
    },

    // 3. Calculate final balance
    {
      $project: {
        _id: 0,
        balance: {
          $subtract: ["$totalCredit", "$totalDebit"],
        },
      },
    },
  ]);
  if (balanceData.length === 0) {
    return 0;
  }
  return balanceData[0].balance;
};

const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;
