import { DoctorDTO } from "../dtos/doctor.dto";
import { DoctorDocument } from "../models/doctorModel";


export const toDoctorDTO = (doc: DoctorDocument): DoctorDTO => {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    speciality: doc.speciality,
    degree: doc.degree,
    experience: doc.experience,
    about: doc.about,
    available: doc.available,
    fees: doc.fees,
    address: doc.address,
    status: doc.status,
    image: doc.image,
  };
};