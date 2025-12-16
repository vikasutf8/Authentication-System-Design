// import mongoose from "mongoose";

// const connectDB = async (): Promise<void> => {
//   try {
//     const mongoURI = process.env.MONGO_URI ;

//     if (!mongoURI) {
//       throw new Error("❌ MONGO_URI is not defined in environment variables");
//     }

//     await mongoose.connect(mongoURI);

//     console.log("✅ MongoDB connected successfully");
//   } catch (error) {
//     console.error("❌ MongoDB connection failed:", error);
//     process.exit(1); // Exit app if DB connection fails
//   }
// };

// export default connectDB;
import mongoose from "mongoose";
import { DBConfig } from "./types";

class Database {
  private static connected = false;

  static async connect({ uri, dbName }: DBConfig): Promise<void> {
    if (this.connected) return;

    try {
      await mongoose.connect(uri, {
        dbName,
        autoIndex: false, // 🔥 production best practice
      });

      this.connected = true;
      console.log("✅ MongoDB connected");

      this.registerEvents();
    } catch (error) {
      console.error("❌ MongoDB connection failed", error);
      process.exit(1);
    }
  }

  private static registerEvents(): void {
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
      this.connected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
      this.connected = true;
    });
  }

  static async disconnect(): Promise<void> {
    if (!this.connected) return;

    await mongoose.connection.close();
    console.log("🛑 MongoDB disconnected cleanly");
  }
}

export default Database;
