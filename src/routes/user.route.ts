import { Router } from "express";
import UserController from "../controllers/user.controller";
import { validate } from "../config/zod";
import { loginUserSchema, registerUserSchema } from "../validators/user.validator";
import tryCatch from "../middlewares/tryCatch";


const router = Router();



// Base: /api/users
// checking at route level best practice
router.post("/register", validate(registerUserSchema), tryCatch(UserController.registerUser));
router.post("/verify/:token", tryCatch(UserController.verifyAccount));
router.post("/login",validate(loginUserSchema), tryCatch(UserController.loginUser));
router.post("/verifyOTP",validate(loginUserSchema), tryCatch(UserController.verifyOTP));
router.get("/profile", tryCatch(UserController.userProfile));
router.post("/regenerateAccessToken", tryCatch(UserController.reGenerateAccessToken));
router.post("/logout", tryCatch(UserController.logout));


// router.post("/register", UserController.registerUser);
// router.get("/:id", UserController.getUserById);
// router.get("/", UserController.getUsers);

export default router;
