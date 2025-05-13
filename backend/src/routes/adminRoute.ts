import express from 'express';
import { loginAdmin, addDoctor, allDoctors } from '../controllers/adminController';
import upload from '../middlewares/multer';
import authAdmin from '../middlewares/authAdmin';
import { changeAvailability } from '../controllers/doctorController';


const adminRouter = express.Router();

adminRouter.post('/login',loginAdmin)
adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.post('/all-doctors',authAdmin,allDoctors)
adminRouter.post('/change-availability',authAdmin,changeAvailability);


export default adminRouter