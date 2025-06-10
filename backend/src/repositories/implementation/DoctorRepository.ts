import appointmentModel from "../../models/appointmentModel";
import doctorModel from "../../models/doctorModel";
import { AppointmentTypes } from "../../types/appointment";
import { DoctorData } from "../../types/doctor";
import { IDoctorRepository } from "../interface/IDoctorRepository";

export class DoctorRepository implements IDoctorRepository {
  async findById(id: string): Promise<DoctorData | null> {
    return await doctorModel.findById(id);
  }


    async findByEmail(email: string): Promise<DoctorData | null> {
    return (await doctorModel.findOne({ email })) as DoctorData | null;
  }

  async updateAvailability(id: string, available: boolean): Promise<void> {
    await doctorModel.findByIdAndUpdate(id, { available });
  }

  async findAllDoctors(): Promise<Partial<DoctorData>[]> {
    return await doctorModel.find({}).select("-password -email");
  }

    async findAppointmentsByDoctorId(docId: string): Promise<AppointmentTypes[]> {
    return await appointmentModel.find({ docId });
  }

  async findAppointmentById(id: string): Promise<AppointmentTypes | null> {
  return await appointmentModel.findById(id);
}

async markAppointmentAsCompleted(id: string): Promise<void> {
  await appointmentModel.findByIdAndUpdate(id, { isCompleted: true });
}

async cancelAppointment(id: string): Promise<void> {
  await appointmentModel.findByIdAndUpdate(id, { cancelled: true });
}
}
