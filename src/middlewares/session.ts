import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { CacheService } from "../services/cache.service";

class Session {
 static generateSessionId(req: Request, res: Response, next: NextFunction) {
  const sessionId = crypto.randomBytes(16).toString("hex");
//   req.session.id = sessionId;
//   next();
return sessionId;
 }


 static isSessionActive = async (userId: string, sessionId: string) => {
//   const activeSessionKey = await CacheService.generateActiveSessionKey(userId);
  const activeSession = await CacheService.getActiveSession(userId);
  return activeSession === sessionId;
 }
}

export default Session;