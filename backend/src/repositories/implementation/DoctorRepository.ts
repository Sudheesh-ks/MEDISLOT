import { BaseRepository } from "../BaseRepository";
import appointmentModel from "../../models/appointmentModel";
import doctorModel from "../../models/doctorModel";
import { AppointmentTypes } from "../../types/appointment";
import { DoctorData, DoctorDocument } from "../../types/doctor";
import { IDoctorRepository, PaginationResult } from "../interface/IDoctorRepository";

export class DoctorRepository
  extends BaseRepository<DoctorDocument>
  implements IDoctorRepository
{
  constructor() {
    super(doctorModel);
  }

  async registerDoctor(data: DoctorData): Promise<DoctorDocument> {
    const newDoctor = new doctorModel(data);
    return await newDoctor.save();
  }

  async findById(id: string): Promise<DoctorData | null> {
      const doctor = await super.findById(id);
  if (!doctor) return null;

  // Optional: sanitize the result (if needed)
  const { password, ...rest } = doctor.toObject();
  return rest as DoctorData;
  }

  async updateAvailability(id: string, available: boolean): Promise<void> {
    const doctor = await doctorModel.findById(id);
    if (!doctor) throw new Error("Doctor not found");
    doctor.available = available;
    await doctor.save();
  }

  async findAllDoctors(): Promise<Partial<DoctorData>[]> {
    return doctorModel.find({}).select("-password");
  }

  async getDoctorsPaginated(page: number, limit: number): Promise<PaginationResult<Partial<DoctorData>>> {
    const skip = (page - 1) * limit;
    const totalCount = await doctorModel.countDocuments({ status: "approved" });
    const data = await doctorModel.find({ status: "approved" }).select("-password").skip(skip).limit(limit);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      data,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  async findByEmail(email: string): Promise<DoctorData | null> {
    return this.findOne({ email });
  }

  async save(doctor: DoctorDocument): Promise<void> {
    await doctor.save();
  }

  async findAppointmentsByDoctorId(docId: string): Promise<AppointmentTypes[]> {
    return appointmentModel.find({ docId });
  }

  async getAppointmentsPaginated(docId: string, page: number, limit: number): Promise<PaginationResult<AppointmentTypes>> {
    const skip = (page - 1) * limit;
    const totalCount = await appointmentModel.countDocuments({ docId });
    const data = await appointmentModel.find({ docId })
      .populate('userId', 'name email image dob')
      .populate('docId', 'name image speciality')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      data,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  async findAppointmentById(id: string): Promise<AppointmentTypes | null> {
    return appointmentModel.findById(id);
  }

  async markAppointmentAsConfirmed(id: string): Promise<void> {
    const appointment = await appointmentModel.findById(id);
    if (!appointment) throw new Error("Appointment not found");
    appointment.isConfirmed = true;
    await appointment.save();
  }

  async cancelAppointment(id: string): Promise<void> {
    const appointment = await appointmentModel.findById(id);
    if (!appointment) throw new Error("Appointment not found");
    appointment.cancelled = true;
    await appointment.save();
  }

  async getDoctorProfileById(id: string): Promise<DoctorData | null> {
    return doctorModel.findById(id).select("-password");
  }

  async updateDoctorProfile(
    id: string,
    updateData: Partial<
      Pick<
        DoctorData,
        "name" | "speciality" | "degree" | "experience" | "about" | "fees" | "address" | "image"
      >
    >
  ): Promise<void> {
    await doctorModel.findByIdAndUpdate(id, updateData);
  }
}
