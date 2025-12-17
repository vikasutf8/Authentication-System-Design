import "dotenv/config";

import app from "./app";
import Database from "./config/db";
import { buildMongoUri } from "./config/mongoUri";
import { disconnectRedis } from "./config/redis";

const PORT = process.env.PORT || 5000;

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

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    console.log("🛑 Graceful shutdown initiated");
    await disconnectRedis();

    server.close(async () => {
      await Database.disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap();
