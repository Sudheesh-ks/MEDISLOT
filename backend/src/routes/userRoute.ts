import express from 'express';
import { UserController } from '../controllers/implementation/UserController';
import { UserService } from '../services/implementation/UserService';
import { UserRepository } from '../repositories/implementation/UserRepository';
import authUser from '../middlewares/authUser';
import upload from '../middlewares/multer';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const userRouter = express.Router();

userRouter.post('/register', userController.registerUser.bind(userController));
userRouter.post('/login', userController.loginUser.bind(userController));
userRouter.post("/resend-otp", userController.resendOtp.bind(userController));
userRouter.post('/verify-otp', userController.verifyOtp.bind(userController));
userRouter.post('/forgot-password', userController.forgotPasswordRequest.bind(userController));
userRouter.post('/reset-password', userController.resetPassword.bind(userController));
userRouter.get('/get-profile', authUser, userController.getProfile.bind(userController));
userRouter.put('/update-profile', upload.single('image'), authUser, userController.updateProfile.bind(userController));
userRouter.post('/book-appointment', authUser, userController.bookAppointment.bind(userController));

export default userRouter;