import { Document } from "mongoose";

export interface adminData {
  email: string;
  password: string;
  // any other fields
}

export interface AdminDocument extends adminData, Document {
  _id: string;
}
