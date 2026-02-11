import mongoose, { Schema, Document } from "mongoose";

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

export default mongoose.model<IAccount>("Account", AccountSchema);
