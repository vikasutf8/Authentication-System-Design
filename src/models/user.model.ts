import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  oauthProvider?: "github" | "google" | "linkedin";
  oauthId?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  sessionVersion: number;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: false, // Nullable for OAuth users
    },
    name: {
      type: String,
      required: true,
    },
    role:{
        type: String,
        default: "user",
    },
    oauthProvider: {
      type: String,
      enum: ["github", "google", "linkedin"],
      required: false,
    },
    oauthId: {
      type: String,
      required: false,
    },
    isVerified :{
      type: Boolean,
      default: false,
    },
    sessionVersion: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);

/**
 * 
 * model User {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String?
  password      String?       // nullable — OAuth users have no password
  avatar        String?
  oauthProvider String?       // "github" | "google" | "linkedin"
  oauthId       String?       // provider's user ID
  isVerified    Boolean  @default(false)
  sessionVersion Int      @default(1)
}
 */