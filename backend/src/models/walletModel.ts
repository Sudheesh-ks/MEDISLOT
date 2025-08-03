import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { WalletTypes } from "../types/wallet";


export interface WalletDocument extends Omit<WalletTypes, "_id">, Document {
  _id: Types.ObjectId;
}

const walletSchema: Schema<WalletDocument> = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "ownerType",
  },
  ownerType: {
    type: String,
    required: true,
    enum: ["user", "doctor", "admin"],
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  history: [
    {
      type: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      reason: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const walletModel: Model<WalletDocument> = mongoose.model<WalletDocument>(
  "wallet",
  walletSchema
);

export default walletModel;
