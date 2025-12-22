import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { CacheService } from "../services/cache.service";

export const generateCSRFToken = async (req: Request, res: Response, next: NextFunction, userId: string) => {
  const token = crypto.randomBytes(16).toString("hex");
  const csrfTokenKey = await CacheService.generateCSRFTokenKey(userId);
  await CacheService.setCSRFToken(csrfTokenKey, token);

  res.cookie("csrfToken", token, {
    httpOnly: false, //backend readOnly document.cookie
    secure: true, // https working not http
    sameSite: "none", // csrf attack here ..backend readOnly // why none ?
    maxAge: 5 * 60 * 1000, // 5 min  ->60mi
  });


  return token;
};


export const verifyCSRFToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(req.method === "GET"){
      next();
      return;
    }
    // const csrfToken = req.cookies.csrfToken;
    // if (!csrfToken) {
    //   throw new Error("CSRF token missing");
    // }

    const userId = (req as any).user?._id?.toString();
    if (!userId) {
     return res.status(401).json({ error: "Not Authenticated" });
    }


    // const csrfTokenKey = await CacheService.generateCSRFTokenKey(userId);
    // const storedToken = await CacheService.getCSRFToken(userId);

    // if (storedToken !== csrfToken) {
    //   throw new Error("Invalid CSRF token");
    // }
    // 3 ways 
    const csrfToken = req.cookies.csrfToken || req.headers["x-csrf-token"] || req.headers["x-xsrf-token"] || req.headers["csrf-token"];
    if (!csrfToken) {
      return res.status(403).json({ message: "CSRF token missing" ,code:"CSRF_TOKEN_MISSING"});
    }

    const csrfTokenKey = await CacheService.generateCSRFTokenKey(userId);
    const storedToken = await CacheService.getCSRFToken(userId);
    if (!storedToken) {
      return res.status(403).json({ message: "CSRF token not found" ,code:"CSRF_TOKEN_EXPIRED"});
    }

    if (storedToken !== csrfToken) {
      return res.status(403).json({ message: "Invalid CSRF token" ,code:"CSRF_TOKEN_INVALID"});
    }

    next();
  } catch (error) {
    console.log("CSRF token verification failed",error);
    res.status(500).json({ message: "CSRF token verification failed" ,code:"CSRF_TOKEN_VERIFICATION_FAILED"});
  }
};

export const revokeCSRFToken = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?._id?.toString();
  if (!userId) {
    return res.status(401).json({ error: "Not Authenticated" });
  }
  const csrfTokenKey = await CacheService.generateCSRFTokenKey(userId);
  await CacheService.del(csrfTokenKey);
  res.clearCookie("csrfToken");

  return await generateCSRFToken(req, res, next, userId);
  // next();
};

