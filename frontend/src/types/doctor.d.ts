export interface DoctorProfileType {
  _id: string;
  name: string;
  email: string;
  image?: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  fees: number;
  address: {
    line1: string;
    line2: string;
  };
  status?: "pending" | "approved" | "rejected";
  available?: boolean;
  date?: Date;
}
