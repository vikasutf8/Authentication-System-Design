import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoute from "./routes/user.route";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import cookieParser from "cookie-parser";



dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/users", userRoute);

export default app;
