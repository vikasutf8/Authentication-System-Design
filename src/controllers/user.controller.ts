import { Request, Response, NextFunction } from "express";
import UserService from "../services/user.service";
import tryCatch from "../middlewares/tryCatch";
import sanitize from "mongo-sanitize";
import { registerUserSchema } from "../validators/user.validator";
import { CacheService } from "../services/cache.service";
import Password from "../utils/password";
import Token from "../utils/token";
import { sendMail } from "../config/sendMail";
import { renderEmailTemplate } from "../config/renderEmail";

class UserController {
  static registerUser = tryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
      // const {name,email,password} = sanitize(req.body);

      const sanitizedBody = sanitize(req.body);
      const { name, email, password } = sanitizedBody;
      // const user = await UserService.registerUser({name,email,password});
      const ip =
        req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
        req.socket.remoteAddress ||
        "unknown";

      await CacheService.check(email, ip);
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const hashedPassword = await Password.hashPassword(password);
      console.log(hashedPassword);
      const dataToCache = {
        email,
        name,
        password: hashedPassword,
      };
      //   tokens :eg :http://localhost:3000/hajfdhsatrhfdsfashfasdhfa8ort
      const token = Token.generateToken();// create a token
      //stored in redis
      const tokenKey = await CacheService.verify(token);
      await CacheService.set(tokenKey, dataToCache,60 * 5); //redis

      const verifyUrl = `http://localhost:3000/token/${token}`;

      const html = await renderEmailTemplate("accountVerify", {
        name,
        verifyUrl,
      });

      await sendMail({
        to: email,
        subject: "Verify your email",
        html,
      });
//at time of check i set it already  --NO need again
      // await CacheService.set(
      //   `${email}:register-rate-limit:${ip}`,
      //   "true",
      //   60 * 5
      // );

      res
        .status(201)
        .json({
          message: "Verification email sent !! Please verify your Account.",
        });
    }
  );

  static verifyAccount = tryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      const tokenKey = await CacheService.verify(token);
      const userDataJson = await CacheService.get(tokenKey);
      console.log(userDataJson, "verifyaccount redis data");
      if (!userDataJson) {
        return res.status(400).json({ message: "Invalid token" });
      }

      await CacheService.del(tokenKey);

      // const userData = JSON.parse(userDataJson);
      const userData = userDataJson as {
        email: string;
        name: string;
        password: string;
      };
      const existingUser = await UserService.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const newUser = await UserService.registerUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });

      res
        .status(200)
        .json({
          message:
            "Account verified successfully & User registered successfully",
          user: {_id:newUser._id,name:newUser.name,email:newUser.email},
        });
    }
  );
}

export default UserController;
