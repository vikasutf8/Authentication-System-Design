import jwt,{Secret, SignOptions} from "jsonwebtoken";
import { JwtPayload, JWT_CONFIG } from "./jwt";
/**
 * 
 * sign(
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret,
  options?: SignOptions
): string;

 */
class JwtService {
  static generateAccessToken(payload: JwtPayload): string {
    const secret: Secret = JWT_CONFIG.ACCESS_TOKEN_SECRET;
    return jwt.sign(payload as object, secret, {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
    } as SignOptions);
  }

  static generateRefreshToken(payload: JwtPayload): string {
    const secret: Secret = JWT_CONFIG.REFRESH_TOKEN_SECRET;
    return jwt.sign(payload as object, secret, {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
    } as SignOptions
  ) ;
  }

  static verifyRefreshToken(token: string): string {
    const secret: Secret = JWT_CONFIG.REFRESH_TOKEN_SECRET;
    return jwt.verify(token, secret) as string;
  }

  // static generateTokens(payload: JwtPayload) {
  //   const accessToken = this.generateAccessToken(payload);
  //   const refreshToken = this.generateRefreshToken(payload);

  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }
}

export default JwtService;
