import { Router } from "express";
import UserController from "../controllers/user.controller";
import { validate } from "../config/zod";
import { registerUserSchema } from "../validators/user.validator";
import tryCatch from "../middlewares/tryCatch";
const router = Router();

// Base: /api/users
// checking at route level best practice
router.post("/register", validate(registerUserSchema), tryCatch(UserController.registerUser));
router.post("/verify/:token", tryCatch(UserController.verifyAccount));



// router.post("/register", UserController.registerUser);
// router.get("/:id", UserController.getUserById);
// router.get("/", UserController.getUsers);

export default router;
