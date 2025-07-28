export interface UserDTO {
  _id?: string;
  name: string;
  email: string;
  image: string;
  gender: string;
  dob: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
  };
}

