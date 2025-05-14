import { DoctorData } from "../../types/doctor";


export interface IDoctorRepository {
  findById(id: string): Promise<DoctorData | null>;
  updateAvailability(id: string, available: boolean): Promise<void>;
  findAllDoctors(): Promise<Partial<DoctorData>[]>;
}