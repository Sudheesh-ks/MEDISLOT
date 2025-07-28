export interface DoctorDTO {
  _id?: string;
  name: string;
  email: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  available?: boolean;
  fees: number;
  address: {
    line1: string;
    line2: string;
  };
  status?: "pending" | "approved" | "rejected";
  image?: string;
}

