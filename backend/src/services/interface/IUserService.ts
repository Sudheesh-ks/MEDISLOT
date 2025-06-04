import { AppointmentTypes } from "../../types/appointment";
import { userData } from "../../types/user";

export interface UserDocument extends userData {
  _id: string;
}

export interface userDataService {
  register(
    name: string,
    email: string,
    password: string
  ): Promise<{ token: string }>;
  login(email: string, password: string): Promise<{ token: string }>;
  getProfile(userId: string): Promise<userData | null>;
  updateProfile(
    userId: string,
    data: Partial<userData>,
    imageFile?: Express.Multer.File
  ): Promise<void>;
  checkEmailExists(email: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  finalizeRegister(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserDocument>;
  generateToken(userId: string): string;
  resetPassword(email: string, newHashedPassword: string): Promise<boolean>;
  bookAppointment(appointmentData: AppointmentTypes): Promise<void>;
}
