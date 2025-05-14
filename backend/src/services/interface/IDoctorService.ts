export interface IDoctorService {
  toggleAvailability(docId: string): Promise<void>;
  getAllDoctors(): Promise<any[]>;
}