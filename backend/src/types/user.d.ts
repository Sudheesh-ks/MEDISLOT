import { Types } from "mongoose";

export interface Address {
  line1: string;
  line2: string;
}

export interface userTypes {
  _id?: string;
  name: string;
  email: string;
  image: string;
  password: string;
  address: Address;
  gender: string;
  dob: string;
  phone: string;
  isBlocked: boolean;
  googleId?: string;
}

export interface UserAppntTypes {
  name: string;
  email: string;
  phone: string;
}
