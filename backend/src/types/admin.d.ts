import { Document } from "mongoose";

export interface adminData {
  email: string;
  password: string;
}

export interface AdminDocument extends adminData, Document {
  _id: string;
}
