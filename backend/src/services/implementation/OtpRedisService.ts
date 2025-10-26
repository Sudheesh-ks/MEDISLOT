import redisClient from '../../config/redisClient';
import { OtpStoreData } from '../../utils/otpStore';
import { IOtpRedisService } from '../interface/IOtpRedisService';

const OTP_EXPIRY_SECONDS = 300;

export class OtpRedisService implements IOtpRedisService {
  async storeOtp(email: string, data: OtpStoreData): Promise<void> {
    const value = JSON.stringify(data);
    await redisClient.setEx(email, OTP_EXPIRY_SECONDS, value);
  }

  async getOtp(email: string): Promise<OtpStoreData | null> {
    const data = await redisClient.get(email);
    return data ? JSON.parse(data) : null;
  }

  async updateOtp(email: string, data: OtpStoreData): Promise<void> {
    const value = JSON.stringify(data);
    await redisClient.setEx(email, OTP_EXPIRY_SECONDS, value);
  }

  async deleteOtp(email: string): Promise<void> {
    await redisClient.del(email);
  }
}
