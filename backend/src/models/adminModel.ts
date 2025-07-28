import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { adminTypes } from "../types/admin";


export interface AdminDocument extends Omit<adminTypes, "_id">, Document {
  _id: Types.ObjectId
}

const adminSchema: Schema<AdminDocument> = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true 
  },

  password: {
    type: String, 
    required: true 
  },
});

const adminModel: Model<AdminDocument> = mongoose.model("admin", adminSchema);

export default adminModel;
