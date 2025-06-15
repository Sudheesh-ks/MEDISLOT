import { BaseRepository } from "../BaseRepository";
import appointmentModel from "../../models/appointmentModel";
import doctorModel from "../../models/doctorModel";
import { AppointmentTypes } from "../../types/appointment";
import { DoctorData, DoctorDocument } from "../../types/doctor";
import { IDoctorRepository } from "../interface/IDoctorRepository";

export class DoctorRepository extends BaseRepository<DoctorDocument> implements IDoctorRepository {
  constructor() {
    super(doctorModel);
  }

  async findByEmail(email: string): Promise<DoctorData | null> {
    return this.findOne({ email });
  }

  async updateAvailability(id: string, available: boolean): Promise<void> {
    await this.updateById(id, { available });
  }

  async findAllDoctors(): Promise<Partial<DoctorData>[]> {
    return doctorModel.find({}).select("-password -email");
  }

  async findAppointmentsByDoctorId(docId: string): Promise<AppointmentTypes[]> {
    return appointmentModel.find({ docId });
  }

  async findAppointmentById(id: string): Promise<AppointmentTypes | null> {
    return appointmentModel.findById(id);
  }

  async markAppointmentAsConfirmed(id: string): Promise<void> {
    await appointmentModel.findByIdAndUpdate(id, { isConfirmed: true });
  }

  async cancelAppointment(id: string): Promise<void> {
    await appointmentModel.findByIdAndUpdate(id, { cancelled: true });
  }
}