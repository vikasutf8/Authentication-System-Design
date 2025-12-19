import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as JwtLibPayload } from "jsonwebtoken";
import { JWT_CONFIG } from "../jwt/jwt";
import { CacheService } from "../services/cache.service";
import UserService from "../services/user.service";

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

    await CacheService.set(userKey, userData, 60 * 5);
    // 3️⃣ Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Access token expired" });
      return;
    }

    res.status(400).json({ message: "Invalid access token" });
  }
};
