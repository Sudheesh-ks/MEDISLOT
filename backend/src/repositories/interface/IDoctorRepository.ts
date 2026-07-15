import { DoctorDocument } from '../../models/DoctorModel';
import { DoctorTypes } from '../../types/Doctor';
import { PaginationResult } from '../../types/Pagination';

export interface IDoctorRepository {
  registerDoctor(data: DoctorTypes): Promise<DoctorDocument>;
  findDoctorById(id: string): Promise<DoctorDocument | null>;
  updateAvailability(id: string, available: boolean): Promise<void>;
  getAllDoctors(): Promise<DoctorDocument[]>;
  getDoctorsPaginated(
    page: number,
    limit: number,
    search?: string,
    speciality?: string,
    minRating?: number,
    sortOrder?: string,
    status?: string | null
  ): Promise<PaginationResult<DoctorDocument>>;
  findDoctorByEmail(email: string): Promise<DoctorDocument | null>;
  saveDoctorData(doctor: DoctorDocument): Promise<void>;
  updateDoctorById(id: string, data: Partial<DoctorTypes>): Promise<void>;
  getLatestDoctorRequests(limit: number): Promise<DoctorDocument[]>;
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
  updateDoctorRating(doctorId: string, averageRating: number, ratingCount: number): Promise<void>;
}
