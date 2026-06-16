import express from 'express';
import cors from 'cors';
import { connectDB } from './config/Mongodb';
import connectCloudinary from './config/Cloudinary';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import adminRouter from './routes/AdminRoute';
import doctorRouter from './routes/DoctorRoute';
import userRouter from './routes/UserRoute';
import authRouter from './routes/AuthRoute';
import './utils/Passport';
import passport from 'passport';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import chatRouter from './routes/ChatRoute';

process.env.TZ = 'Asia/Kolkata';

dotenv.config();

// chat layer
import { ChatRepository } from './repositories/implementation/ChatRepository';
import { ChatService } from './services/implementation/ChatService';

// socket registration
import { registerChatSocket } from './sockets/ChatSocket';
import slotRouter from './routes/SlotRoute';
import aiChatRouter from './routes/AiChatbotRoute';
import './utils/ActiveAppointmentChecker';
import { startLockCleanupJob } from './jobs/CleanupLock';
import { startStaleAppointmentCleaner } from './jobs/AppointmentAutoCancel';


const allowedOrigins = [
  'https://medislot-eight.vercel.app',
  'https://medislot.ddns.net',
  'http://localhost:5173',
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
startStaleAppointmentCleaner();

server.listen(PORT, () => {
  console.log('Server Started', PORT);
  console.log('Periodic cleanup of expired locks scheduled (5m)');
  console.log('Stale appointment auto-cancellation scheduled (Hourly)');
});
