import { Router } from "express";
import AccountController from "../controllers/account.controller";
import tryCatch from "../middlewares/tryCatch";
import { isAuthenticate } from "../middlewares/isAuthenticated";

const router = Router();


//create an account..protector
router.post("/create", isAuthenticate, tryCatch(AccountController.createAccount));

export default router;
