interface CustomRequest extends Request {
    file?: Express.Multer.File;
}


export interface Address {
    line1: string;
    line2: string;
}


export interface DoctorData {
  name: string;
  email: string;
  image: string;
  password: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  available?: boolean;
  fees: number;
  address: Address;
  date: Date;
  slots_booked?: object;
}
