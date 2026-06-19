import { DoctorDocument } from '../../models/DoctorModel';
import { DoctorTypes } from '../../types/Doctor';
import { PaginationResult } from '../../types/Pagination';

export interface IDoctorRepository {
  registerDoctor(data: DoctorTypes): Promise<DoctorDocument>;
  findById(id: string): Promise<DoctorDocument | null>;
  updateAvailability(id: string, available: boolean): Promise<void>;
  findAllDoctors(): Promise<DoctorDocument[]>;
  getDoctorsPaginated(
    page: number,
    limit: number,
    search?: string,
    speciality?: string,
    minRating?: number,
    sortOrder?: string
  ): Promise<PaginationResult<DoctorDocument>>;
  findByEmail(email: string): Promise<DoctorDocument | null>;
  save(doctor: DoctorDocument): Promise<void>;
  findDoctorById(id: string): Promise<DoctorDocument | null>;
  updateDoctorById(id: string, data: Partial<DoctorTypes>): Promise<void>;
  updateDoctorProfile(
    id: string,
    updateData: Partial<
      Pick<
        DoctorTypes,
        | 'name'
        | 'speciality'
        | 'degree'
        | 'experience'
        | 'about'
        | 'fees'
        | 'address'
        | 'image'
        | 'available'
      >
    >
  ): Promise<void>;
  updateDoctorRating(doctorId: string, rating: number): Promise<void>;
  getRevenueOverTime(
    doctorId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; revenue: number }[]>;
}
