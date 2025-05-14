import { IDoctorRepository } from "../../repositories/interface/IDoctorRepository";
import { IDoctorService } from "../interface/IDoctorService";


export class DoctorService implements IDoctorService {
  constructor(private doctorRepo: IDoctorRepository) {}

  async toggleAvailability(docId: string): Promise<void> {
    const doc = await this.doctorRepo.findById(docId);
    if (!doc) throw new Error("Doctor not found");

    await this.doctorRepo.updateAvailability(docId, !doc.available);
  }

  async getAllDoctors(): Promise<any[]> {
    return await this.doctorRepo.findAllDoctors();
  }
}   