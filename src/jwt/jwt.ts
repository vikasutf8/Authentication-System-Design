
export interface JwtPayload {
  userId: string ;
  email: string;
  sessionId?: string;
}

export const JWT_CONFIG = {
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_SECRET! as string,
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET! as string,

  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
};
