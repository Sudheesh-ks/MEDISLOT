import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log("An unknown error occurred while connecting to MongoDB.");
    }
    process.exit(1); // Exit with failure
  }
};
