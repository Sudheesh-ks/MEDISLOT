import { AppointmentDTO } from '../dtos/Appointment.dto';
import { AppointmentDocument } from '../models/AppointmentModel';
import { toDoctorDTO } from './Doctor.mapper';
import { toUserDTO } from './User.mapper';

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
    patientDetails: a.patientDetails,
  };
};
