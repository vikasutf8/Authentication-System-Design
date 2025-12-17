import crypto from "crypto";

const TOKEN_SECRET = "secret";
const TOKEN_EXPIRY = 60 * 60 * 24; // 24 hours

class Token {
  static generateToken = () => {
    return crypto.randomBytes(64).toString("hex");
    // const token = crypto.randomBytes(64).toString("hex");
    // const expiry = Date.now() + TOKEN_EXPIRY;

    // return {
    //   token,
    //   expiry,
    //   payload,
    // };
  };

  static verifyToken = (token: string) => {
    const [, payload] = token.split(".");
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64").toString());

    if (Date.now() > decodedPayload.expiry) {
      throw new Error("Token has expired");
    }

    return decodedPayload;
  };
}

export default Token;
