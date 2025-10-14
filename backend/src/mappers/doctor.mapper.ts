import { DoctorDTO } from '../dtos/doctor.dto';
import { DoctorDocument } from '../models/doctorModel';
import { v2 as cloudinary } from 'cloudinary';

export const toDoctorDTO = (doc: DoctorDocument): DoctorDTO => {
  let imageUrl = doc.image;
  let certificateUrl = doc.certificate;

  if (imageUrl && !imageUrl.includes('res.cloudinary.com')) {
    imageUrl = cloudinary.url(imageUrl, {
      type: 'authenticated',
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
    });
  }

  if (certificateUrl && !certificateUrl.includes('res.cloudinary.com')) {
    certificateUrl = cloudinary.url(certificateUrl, {
      type: 'authenticated',
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
  }
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
    image: imageUrl || doc.image,
    certificate: certificateUrl || doc.certificate,
    averageRating: doc.averageRating,
    ratingCount: doc.ratingCount,
  };
};
