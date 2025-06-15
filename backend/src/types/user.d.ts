export interface Address {
  line1: string;
  line2: string;
}

export interface userData {
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


export type UserDocument = HydratedDocument<userData>;
