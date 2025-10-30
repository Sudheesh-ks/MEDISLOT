import express from 'express';
import cors from 'cors';
import { connectDB } from './config/mongodb';
import connectCloudinary from './config/cloudinary';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import adminRouter from './routes/adminRoute';
import doctorRouter from './routes/doctorRoute';
import userRouter from './routes/userRoute';
import authRouter from './routes/authRoute';
import './utils/passport';
import passport from 'passport';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import chatRouter from './routes/chatRoute';

process.env.TZ = 'Asia/Kolkata';

dotenv.config();

// chat layer
import { ChatRepository } from './repositories/implementation/ChatRepository';
import { ChatService } from './services/implementation/ChatService';

// socket registration
import { registerChatSocket } from './sockets/ChatSocket';
import slotRouter from './routes/slotRoute';
import aiChatRouter from './routes/aiChatBotRoutes';
import './utils/activeAppointmentChecker';
import { startLockCleanupJob } from './jobs/cleanupLock';

const allowedOrigins = [
  'https://medislot-eight.vercel.app',
  'https://13-236-136-196.sslip.io',
  'http://localhost:5173'
];

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
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

// initialize passport
app.use(passport.initialize());

// api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/slots', slotRouter);
app.use('/api/chatbot', aiChatRouter);

app.get('/', (req, res) => {
  res.send('API WORKING');
});

// chat service
const chatService = new ChatService(new ChatRepository());

// socket.io
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

registerChatSocket(io, chatService);

startLockCleanupJob();

server.listen(PORT, () => {
  console.log('Server Started', PORT);
  console.log('Periodic cleanup of expired locks scheduled every 5 minutes');
});
