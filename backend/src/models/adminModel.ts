import mongoose, { Schema, Model } from "mongoose";
import { AdminDocument } from "../types/admin";

const adminSchema = new Schema<AdminDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const adminModel: Model<AdminDocument> = mongoose.model("admin", adminSchema);

export default adminModel;
