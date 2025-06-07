import { IDoctorRepository } from "../../repositories/interface/IDoctorRepository";
import { DoctorData } from "../../types/doctor";
import { IDoctorService } from "../interface/IDoctorService";

export class DoctorService implements IDoctorService {
  constructor(private doctorRepository: IDoctorRepository) {}

  async toggleAvailability(docId: string): Promise<void> {
    const doc = await this.doctorRepository.findById(docId);
    if (!doc) throw new Error("Doctor not found");

    await this.doctorRepository.updateAvailability(docId, !doc.available);
  }

  async getAllDoctors(): Promise<any[]> {
    return await this.doctorRepository.findAllDoctors();
  }

}
