import express from "express";
import cors from "cors";
import { connectDB } from "./config/mongodb";
import connectCloudinary from "./config/cloudinary";
import dotenv from 'dotenv';
import adminRouter from "./routes/adminRoute";
dotenv.config();



// app config
const app = express();
const PORT = process.env.PORT || 4000

connectDB();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use('/api/admin',adminRouter)

app.get('/', (req,res) => {
    res.send('API WORKING');
})

app.listen(PORT, () => {
    console.log('Server Started',PORT);
})