import mongoose, { Schema, Model } from "mongoose";
import { adminData } from "../types/admin";


interface adminDocument extends adminData { }


const adminSchema: Schema<adminDocument> = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }
})


const adminModel: Model<adminDocument> = mongoose.model<adminDocument>('admin', adminSchema);

export default adminModel