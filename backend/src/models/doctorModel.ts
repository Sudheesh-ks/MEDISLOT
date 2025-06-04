import mongoose, { Schema, Document, Model } from "mongoose";
import { DoctorData } from "../types/doctor";

interface DoctorDocument extends DoctorData, Document {}

const doctorSchema: Schema<DoctorDocument> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    speciality: {
      type: String,
      required: true,
    },

    degree: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    about: {
      type: String,
      required: true,
    },

    available: {
      type: Boolean,
      default: true,
    },

    fees: {
      type: Number,
      required: true,
    },

    address: {
      type: Object,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    slots_booked: {
      type: Object,
      default: {},
    },
  },
  { minimize: false }
);

const doctorModel: Model<DoctorDocument> = mongoose.model<DoctorDocument>(
  "doctor",
  doctorSchema
);

export default doctorModel;
