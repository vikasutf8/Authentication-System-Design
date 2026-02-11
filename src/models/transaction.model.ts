import mongoose, { Schema, Document } from "mongoose";

export type TransactionStatus = "Pending" | "complete" | "failed" | "revert";

export interface ITransaction extends Document {
  fromAccount: mongoose.Types.ObjectId;
  toAccount: mongoose.Types.ObjectId;
  status: TransactionStatus;
  amount: number;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    fromAccount: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    toAccount: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
        index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "complete", "failed", "revert"],
      default: "Pending",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
