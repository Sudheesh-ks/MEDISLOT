import express from 'express';
import { loginAdmin, addDoctor, allDoctors } from '../controllers/adminController';
import upload from '../middlewares/multer';
import authAdmin from '../middlewares/authAdmin';


const adminRouter = express.Router();

adminRouter.post('/login',loginAdmin)
adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.post('/all-doctors',authAdmin,allDoctors)


export default adminRouter