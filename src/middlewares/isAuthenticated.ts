import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as JwtLibPayload } from "jsonwebtoken";
import { JWT_CONFIG } from "../jwt/jwt";
import { CacheService } from "../services/cache.service";
import UserService from "../services/user.service";
import Session from "./session";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const isAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1️⃣ Get token from cookie or header
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.split(" ")[1];
      // its should be at cookie not header >> it set cookiest "accessToken"
    console.log(token,"token");
    if (!token) {
      res.status(403).json({ message: "Unauthorized: Token missing" });
      return;
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(
      token,
      JWT_CONFIG.ACCESS_TOKEN_SECRET
    ) as JwtLibPayload & {
      userId: string;
      email: string;
    };

    // cache that user present
    const userKey = await CacheService.setUserKey(decoded.userId);
    const cacheUserData = await CacheService.get(userKey);
    if(cacheUserData){
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
      next();
    }
// addition and no sence check
    const userData =await UserService.getUserById(decoded.userId);
    if(!userData){
      res.status(403).json({ message: "Unauthorized: User not found" });
      return;
    }

    const isSessionActive = await Session.isSessionActive(decoded.userId, decoded.sessionId);

    if(!isSessionActive){
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.clearCookie("csrfToken"); 
      res.status(403).json({ message: "Unauthorized: Session not active" });
    }

    await CacheService.set(userKey, userData, 60 * 5); //set session ID also
    // 3️⃣ Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      // sessionId is intentionally omitted – req.user type only allows userId and email
    };
    // sessionId is intentionally omitted – req.user type only allows userId and email

    req.sessionId = decoded.sessionId;

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Access token expired" });
      return;
    }

    res.status(400).json({ message: "Invalid access token" });
  }
};



export const authorizedUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(403).json({ message: "Unauthorized: User missing" });
      return;
    }
    if(user.role !== "admin"){
      res.status(403).json({ message: "Unauthorized: User not admin" });
      return;
    }

    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid user ID" });
  }
};
