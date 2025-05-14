// import express from 'express';
// import { getProfile, loginUser, registerUser, updateProfile } from '../controllers/userController';
// import authUser from '../middlewares/authUser';
// import upload from '../middlewares/multer';


// const userRouter = express.Router();


// userRouter.post('/register',registerUser);
// userRouter.post('/login',loginUser);

// userRouter.get('/get-profile',authUser,getProfile);
// userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile);
// // userRouter.post('/book-appointment',authUser,bookappointment)


// export default userRouter


import express from 'express';
import { UserController } from '../controllers/implementation/UserController';
import { UserService } from '../services/implementation/UserService';
import { UserRepository } from '../repositories/implementation/UserRepository';
import authUser from '../middlewares/authUser';
import upload from '../middlewares/multer';

// Create instances and inject dependencies
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const userRouter = express.Router();

userRouter.post('/register', userController.registerUser.bind(userController));
userRouter.post('/login', userController.loginUser.bind(userController));
userRouter.get('/get-profile', authUser, userController.getProfile.bind(userController));
userRouter.post('/update-profile', upload.single('image'), authUser, userController.updateProfile.bind(userController));

export default userRouter;