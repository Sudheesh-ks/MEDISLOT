interface CustomRequest extends Request {
  file?: Express.Multer.File;
}

export interface Address {
  line1: string;
  line2: string;
}

export interface DoctorTypes {
  _id?: string;
  name: string;
  email: string;
  image?: string;
  certificate?: string;
  password: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  available?: boolean;
  fees: number;
  address: Address;
  status?: 'pending' | 'approved' | 'rejected';
  date?: Date;
  slots_booked?: {
    [date: string]: string[];
  };
  rejectionReason?: string;
  averageRating?: number;
  ratingCount?: number;
}

export interface DoctorAppntTypes {
  name: string;
  speciality: string;
}
