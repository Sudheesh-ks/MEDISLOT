import { AppointmentDTO } from "../dtos/appointment.dto";
import { AppointmentDocument } from "../models/appointmentModel";
import { toDoctorDTO } from "./doctor.mapper";
import { toUserDTO } from "./user.mapper";

export const toAppointmentDTO = (a: AppointmentDocument): AppointmentDTO => {
  return {
    _id: a._id?.toString(),
    userData: toUserDTO(a.userData),
    docData: toDoctorDTO(a.docData),
    slotDate: a.slotDate,
    slotStartTime: a.slotStartTime,
    slotEndTime: a.slotEndTime,
    amount: a.amount,
    date: a.date,
    cancelled: a.cancelled,
    payment: a.payment,
    isConfirmed: a.isConfirmed,
    isCompleted: a.isCompleted,
  };
};
