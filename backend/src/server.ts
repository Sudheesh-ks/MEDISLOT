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
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import MessageModel from "./models/messageModel";
import chatRouter from "./routes/chatRoute";
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
app.use("/api/chat", chatRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

// SOCKET.IO SETUP
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});


// for joining a chat room
io.on("connection", (socket: any) => {
  socket.on("join", (chatId: any) => {
    socket.join(chatId);
  });

// For sending an recieving messages
  socket.on("sendMessage", async (msg: any) => {
    const saved = await MessageModel.create(msg);
    io.to(msg.chatId).emit("receiveMessage", saved);
  });

  // For typing indicator
  socket.on("typing", ({ chatId, senderId }: { chatId: string; senderId: string }) => {
    socket.to(chatId).emit("typing", { senderId });
  });

  // For stop typing indicator
  socket.on("stopTyping", ({ chatId, senderId }: { chatId: string; senderId: string }) => {
    socket.to(chatId).emit("stopTyping", { senderId });
  });
});

server.listen(PORT, () => {
  console.log("Server Started", PORT);
});
