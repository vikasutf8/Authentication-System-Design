
import crypto from "crypto";


// Random 6 digit OTP
const length = 6;
class OTP {
  static generateOTP(): string {
    const otp = crypto.randomInt(0, Math.pow(10, length));
    return otp.toString().padStart(length, "0");
  }

  static verifyOTP(otp: string, otpToVerify: string): boolean {
    const otpInt = parseInt(otp);
    return otpInt >= 0 && otpInt < Math.pow(10, length) && otp === otpToVerify;
  }
}

export default OTP;