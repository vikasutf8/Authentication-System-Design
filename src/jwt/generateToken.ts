import jwt from "jsonwebtoken";
import { JwtPayload, JWT_CONFIG } from "./jwt";

class JwtService {
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_CONFIG.ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
    });
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_CONFIG.REFRESH_TOKEN_SECRET, {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
    });
  }

  static generateTokens(payload: JwtPayload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }
}

export default JwtService;
