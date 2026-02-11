import mongoose, { Schema, Document } from "mongoose";
import LedgerSchema  from "./ledger.model";

export type AccountStatus = "active" | "frozen" | "Closed" | "block";

export interface IAccount extends Document {
  user: mongoose.Types.ObjectId;
  status: AccountStatus;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, //B+ tree
    },
    status: {
      type: String,
      enum: ["active", "frozen", "Closed", "block"],
      required: true,
      default: "active",
    },
    currency: {
      type: String,
      default: "INR",
    },
  },
  { timestamps: true }
);

AccountSchema.index({ user: 1, status: 1 }, { unique: true }); //compound index


// cal the balance of account
AccountSchema.methods.getBalance = async function () {
  // Credit total = sum of all ledgers of account Credit status
//   const creditTotal = LedgerSchema.aggregate([
//     {
//       $match: {
//         account: this._id,
//         type: "credit",
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         total: { $sum: "$amount" },
//       },
//     },
//   ]);
//  // Debit total = sum of all ledgers of account Debit status
//   const debitTotal =  LedgerSchema.aggregate([
//     {
//       $match: {
//         account: this._id,
//         type: "debit",
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         total: { $sum: "$amount" },
//       },
//     },
//   ]);

//   const balance = creditTotal[0].total - debitTotal[0].total;
  // balance = Debit - Credit

  const result = await LedgerSchema.aggregate([
  {
    $match: {
      account: this._id,
    },
  },
  {
    $group: {
      _id: "$account",
      totalCredit: {
        $sum: {
          $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
        },
      },
      totalDebit: {
        $sum: {
          $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      balance: { $subtract: ["$totalCredit", "$totalDebit"] },
    },
  },
]);

const balance = result.length ? result[0].balance : 0;


};

export default mongoose.model<IAccount>("Account", AccountSchema);
