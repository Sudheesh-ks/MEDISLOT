import { DoctorData } from '../types/doctor';
import { Request, Response } from 'express';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


interface CustomRequest extends Request {
    file?: Express.Multer.File;
}


// API for the admin Login
const loginAdmin = async (req: Request,res: Response): Promise<void> => {
    try {
        
        const {email,password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){

            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})

        }else{
            res.json({success:false, message:'Invalid Credentials'});
        }

    } catch (error: any) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}




// API for adding doctor
const addDoctor = async (req: CustomRequest,res: Response): Promise<void> => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address} = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address){
            res.json({success:false, message:'Missing Details'});
            return;
        }

        // validating email format
        if(!validator.isEmail(email)){
             res.json({success:false, message:'Please enter a valid email'});
             return;
        }

        // validating strong password
        if(password.length < 8){
             res.json({success:false, message:'Password should include 8 characters'});
             return;
        }

        // hashing doctor password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        let imageUrl = '';
        if(imageFile){
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"});
            imageUrl = imageUpload.secure_url
        }
        

        const doctorData: DoctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: new Date()
        }

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save()

        res.json({success:true,message:"Doctor added successfully"})


    } catch (error:any) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}




export {
    addDoctor,
    loginAdmin,
}