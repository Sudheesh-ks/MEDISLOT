import { userData } from "../../types/user";
import { AppointmentTypes } from "../../types/appointment";

export interface UserDocument extends userData {
    _id: string;
}

export interface userDataRepository {
    create(user: Partial<userData>): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    updateById(id: string, data: Partial<userData>): Promise<void>;
    updatePasswordByEmail(email: string, newHashedPassword: string): Promise<boolean>;
    bookAppointment(appointmentData: AppointmentTypes): Promise<void>;
}