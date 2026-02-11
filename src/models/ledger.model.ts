import mongoose, { Schema, Document, CallbackError, Query } from "mongoose";

export type LedgerType = "credit" | "debit";

export interface ILedger extends Document {
  account: mongoose.Types.ObjectId;
  amount: number;
  transaction: mongoose.Types.ObjectId;
  type: LedgerType;
  createdAt: Date;
  updatedAt: Date;
}

const LedgerSchema = new Schema<ILedger>(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
      immutable: true,
    },
    amount: {
      type: Number,
      required: true,
      immutable: true,
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
  },
  { timestamps: true }
);

function preventLedgeModification(this: Query<any, any>, next: (err?: CallbackError) => void) {
  next(new Error("Ledger entries are immutable and cannot be modified or deleted"));
}

(LedgerSchema as any).pre("findOneAndUpdate", preventLedgeModification);
(LedgerSchema as any).pre("updateOne", preventLedgeModification);
(LedgerSchema as any).pre("updateMany", preventLedgeModification);
(LedgerSchema as any).pre("findOneAndDelete", preventLedgeModification);
(LedgerSchema as any).pre("deleteOne", preventLedgeModification);
(LedgerSchema as any).pre("deleteMany", preventLedgeModification);
(LedgerSchema as any).pre("remove", preventLedgeModification);



export default mongoose.model<ILedger>("Ledger", LedgerSchema);
