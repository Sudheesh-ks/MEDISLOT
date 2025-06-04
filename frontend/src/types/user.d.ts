export interface Address {
  line1: string;
  line2: string;
}

export interface userData {
  _id: string;
  name: string;
  email: string;
  image: string;
  address: Address;
  gender: string;
  dob: string;
  phone: string;
  isBlocked: boolean;
}
