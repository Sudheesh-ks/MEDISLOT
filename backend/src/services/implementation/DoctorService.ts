import { IDoctorRepository } from "../../repositories/interface/IDoctorRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IDoctorService } from "../interface/IDoctorService";
import { AppointmentTypes } from "../../types/appointment";

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

  async loginDoctor(
    email: string,
    plainPassword: string
  ): Promise<string | null> {
    const doctor = await this.doctorRepository.findByEmail(email);
    if (!doctor) return null;

    const match = await bcrypt.compare(plainPassword, doctor.password);
    if (!match) return null;

    return jwt.sign({ id: doctor._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
  }

  async getDoctorAppointments(docId: string): Promise<AppointmentTypes[]> {
    const doctor = await this.doctorRepository.findById(docId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    return await this.doctorRepository.findAppointmentsByDoctorId(docId);
  }

  async confirmAppointment(
    docId: string,
    appointmentId: string
  ): Promise<void> {
    const appointment = await this.doctorRepository.findAppointmentById(
      appointmentId
    );
    if (!appointment || appointment.docId !== docId) {
      throw new Error("Mark Failed");
    }
    await this.doctorRepository.markAppointmentAsConfirmed(appointmentId);
  }

  async cancelAppointment(docId: string, appointmentId: string): Promise<void> {
    const appointment = await this.doctorRepository.findAppointmentById(
      appointmentId
    );
    if (!appointment || appointment.docId !== docId) {
      throw new Error("Cancellation Failed");
    }
    await this.doctorRepository.cancelAppointment(appointmentId);
  }
}
