import { OtpStoreData } from '../../utils/otpStore';

export interface IOtpRedisService {
  storeOtp(email: string, data: OtpStoreData): Promise<void>;
  getOtp(email: string): Promise<OtpStoreData | null>;
  updateOtp(email: string, data: OtpStoreData): Promise<void>;
  deleteOtp(email: string): Promise<void>;
}
