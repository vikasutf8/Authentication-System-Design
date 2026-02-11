
import { Router } from "express";
import TransactionController from "../controllers/transaction.controller";
import tryCatch from "../middlewares/tryCatch";
import { isAuthenticate } from "../middlewares/isAuthenticated";

const router = Router();

router.post("/create", isAuthenticate, tryCatch(TransactionController.createTransaction));

export default router;