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
import OTP from "../utils/otp";

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

      // await CacheService.check(email, ip);
      // await CacheService.slidingWindowLogLimiter(email, ip);
      // await CacheService.slidingWindowCounterLimiter(email, ip);\
      // await CacheService.tokenBucketLimiter(email, ip);
      await CacheService.leakyBucketLimiter(email, ip);
      // console.log(await CacheService.check(email, ip))
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
      const token = Token.generateToken(); // create a token
      console.log(token,"token");
      //stored in redis
      const tokenKey = await CacheService.verify(token);
      console.log(tokenKey,"tokenKey");
      await CacheService.set(tokenKey, dataToCache, 60 * 5); //redis
// console.log(await CacheService.set(tokenKey, dataToCache, 60 * 5))
      const verifyUrl = `http://localhost:3000/token/${token}`;

      const html = await renderEmailTemplate("AccountVerify", {
        name,
        verifyUrl,
      });

      console.log(html,"html");

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

      res.status(201).json({
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

      res.status(200).json({
        message: "Account verified successfully & User registered successfully",
        user: { _id: newUser._id, name: newUser.name, email: newUser.email },
      });
    }
  );

  static loginUser = tryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
      // 1. validation
      const sanitizedBody = sanitize(req.body);
      const { email, password } = sanitizedBody;
      // 2. OTP generatee : Rate limiting
      const ip =
        req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
        req.socket.remoteAddress ||
        "unknown";

      await CacheService.loginRateLimiterCheck(email, ip);
      // 3. check if user exist
      const existingUser = await UserService.getUserByEmail(email);
      if (!existingUser) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // 4. check password
      if (!(await Password.comparePassword(password, existingUser.password))) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
// 5. generate OTP
      const otp = OTP.generateOTP(); 

      //6. set OTP in cache for Rate limiting
      const otpKey = await CacheService.verifyOTP(otp,email);
      await CacheService.set(otpKey, JSON.stringify(OTP), 60 * 5);
// 7. send OTP to user
      const html = await renderEmailTemplate("LoginOTP", {
        otp,
      });

      await sendMail({
        to: email,
        subject: "Your Login OTP",
        html,
      });

      res.status(200).json({
        message: "OTP sent to your email",
      });
    }
  );

  static verifyOTP = tryCatch(
    async (req: Request, res: Response, next: NextFunction) => {

      // email; stored ::
      const { email, otp } = req.body;

      if(!email || !otp){
        return res.status(400).json({ message: "Please provide email and OTP" });
      }

      const otpKey = await CacheService.verifyOTP(otp,email);

      const otpData = await CacheService.get(otpKey);
      if(!otpData){
        return res.status(400).json({ message: "OTP is invalid" });
      }

      const otpDataJson = (otpData) as {otp:string};
      if(!OTP.verifyOTP(otpDataJson.otp,otp)){
        return res.status(400).json({ message: "OTP is invalid" });
      }

      await CacheService.del(otpKey);

      //jwt token
      

      res.status(200).json({
        message: "OTP verified successfully",
      });
    });
}

export default UserController;
