import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoute from "./routes/user.route";
import accountRoute from "./routes/account.route";
import transactionRoute from "./routes/transaction.route";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import cookieParser from "cookie-parser";
import oauthRoutes from "./routes/oauth.routes";



dotenv.config();

const app: Application = express();

app.use(cors());

app.use(express.json());        // ✅ REQUIRED
app.use(express.urlencoded({ extended: true })); // optional
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/users", userRoute);
app.use("/api/v1/accounts", accountRoute);
app.use("/api/v1/transactions", transactionRoute);
app.use("/api/v2/auth", oauthRoutes);

export default app;
