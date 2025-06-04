import doctorModel from "../../models/doctorModel";
import { DoctorData } from "../../types/doctor";
import { IDoctorRepository } from "../interface/IDoctorRepository";

export class DoctorRepository implements IDoctorRepository {
  async findById(id: string): Promise<DoctorData | null> {
    return await doctorModel.findById(id);
  }

  async updateAvailability(id: string, available: boolean): Promise<void> {
    await doctorModel.findByIdAndUpdate(id, { available });
  }

  async findAllDoctors(): Promise<Partial<DoctorData>[]> {
    return await doctorModel.find({}).select("-password -email");
  }
}
