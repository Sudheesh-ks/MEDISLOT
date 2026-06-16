import { OtpStoreData } from '../../utils/OtpStore';

export interface IOtpRedisService {
  storeOtp(email: string, data: OtpStoreData): Promise<void>;
  getOtp(email: string): Promise<OtpStoreData | null>;
  updateOtp(email: string, data: OtpStoreData): Promise<void>;
  deleteOtp(email: string): Promise<void>;
}
