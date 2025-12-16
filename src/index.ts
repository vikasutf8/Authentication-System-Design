import dotenv from "dotenv";
import app from "./app";
import Database from "./config/db";
import { buildMongoUri } from "./config/mongoUri";
import { disconnectRedis } from "./config/redis";
// import { createIndexes } from "./config/indexes";

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";
async function bootstrap() {
  const uri = buildMongoUri({
    user: process.env.MONGO_USER!,
    password: process.env.MONGO_PASSWORD!,
    cluster: process.env.MONGO_CLUSTER!,
    hostSuffix: process.env.MONGO_HOST_SUFFIX!,
  });

  await Database.connect({
    uri,
    dbName: process.env.DB_NAME,
  });

  //   await createIndexes();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  const shutdown = async (): Promise<void> => {
    console.log("🛑 Graceful shutdown initiated");
    console.log("🛑 Redis graceful shutdown initiated");
    await disconnectRedis();
    // process.e÷xit(0);
    server.close(async () => {
      await Database.disconnect();
      process.exit(0);
    });
  };


//   process.on("SIGINT", async () => {
//     await disconnectRedis();
//     process.exit(0);
//   });

//   process.on("SIGTERM", async () => {
//     await disconnectRedis();
//     process.exit(0);
//   });

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap();
