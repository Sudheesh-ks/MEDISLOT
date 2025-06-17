import express from "express";
import cors from "cors";
import { connectDB } from "./config/mongodb";
import connectCloudinary from "./config/cloudinary";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import adminRouter from "./routes/adminRoute";
import doctorRouter from "./routes/doctorRoute";
import userRouter from "./routes/userRoute";
import authRouter from "./routes/authRoute";
import "./utils/passport";
import passport from "passport";
dotenv.config();

// app config
const app = express();
const PORT = process.env.PORT || 4000;

connectDB();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// initialize passport
app.use(passport.initialize());

// api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(PORT, () => {
  console.log("Server Started", PORT);
});
