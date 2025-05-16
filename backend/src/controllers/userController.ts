// import { Request, Response } from "express";
// import { HttpStatus } from "../constants/status.constants";
// import validator from 'validator';
// import bcrypt from 'bcrypt';
// import userModel from "../models/userModel";
// import  Jwt  from "jsonwebtoken";
// import { v2 as cloudinary } from 'cloudinary';
// import { ErrorType } from "../types/error";
// import doctorModel from "../models/doctorModel";
// import appointmentModel from "../models/appointmentModel";



// // API to register user
// const registerUser = async (req: Request,res: Response): Promise<void> => {
//     try {

//         const { name, email, password } = req.body;

//         if ( !name || !email || !password ) {
//             res.status(HttpStatus.FORBIDDEN).json({success:false,message:'Missing Details'});
//             return;
//         }

//         // validating email format
//         if ( !validator.isEmail(email) ) {
//             res.json({success:false, message:'enter a valid email'});
//             return;
//         }

//         // validating storng password
//         if ( password.length < 8 ) {
//             res.json({success: false, message:'enter a strong password'});
//             return;
//         }

//         // hashing user password
//         const salt = await bcrypt.genSalt(10)
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const userData = {
//             name,
//             email,
//             password : hashedPassword
//         }

//         const newUser = new userModel(userData);
//         const user = await newUser.save();

//         const token = Jwt.sign({id:user._id},process.env.JWT_SECRET)

//         res.json({success:true,token})
        
//     } catch (error) {
//         const err = error as ErrorType;
//         console.log(err.message);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message:err.message });
//     }
// }


// // API for user login
// const loginUser = async (req: Request, res: Response): Promise<void> => {
//     try {

//         const {email,password} = req.body;
//         const user = await userModel.findOne({email})

//         if(!user){
//             res.json({success:false,message:'User does not exists'})
//             return;
//         }

//         const isMatch = await bcrypt.compare(password,user.password)

//         if(isMatch){
//             const token = Jwt.sign({id:user._id},process.env.JWT_SECRET);
//             res.json({success:true,token})
//         }else{
//             res.json({success:false,message:'Invalid Credentials'});
//             return;
//         }
        
//     } catch (error) {
//         const err = error as ErrorType;
//         console.log(err.message);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message:err.message });
//     }
// }


// // API to get user profile data
// const getProfile = async (req: Request, res: Response): Promise<void> => {
//     try {

//         const userId = (req as any).userId;
//         const userData = await userModel.findById(userId).select('-password')

//         if (!userData) {
//             console.log("User not found")
//             res.status(404).json({ success: false, message: "User not found" });
//             return;   
//         }

//         res.json({success: true,userData})
        
//     } catch (error) {
//         const err = error as ErrorType;
//         console.log(err.message);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message:err.message });
//     }
// }


// // API to update user profile
// const updateProfile = async (req: Request, res: Response): Promise<void> => {
//     try {

//         const userId = (req as any).userId;
//         const {  name, phone, address, dob, gender } = req.body;
//         const imageFile = req.file

//         if( !name || !phone || !address || !dob || !gender) {
//             res.json({success:false,message:'Data Missing'})
//             return;
//         }

//         await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})

//         if(imageFile){

//             // upload image to cloudinary
//             const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
//             const imageURL = imageUpload.secure_url;

//             await userModel.findByIdAndUpdate(userId,{image:imageURL})
//         }

//         res.json({success:true,message:'Profile Updated'})
        
//     } catch (error) {
//         const err = error as ErrorType;
//         console.log(err.message);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message:err.message });
//     }
// }


// // API to book appointments
// // const bookappointment = async (req: Request, res: Response): Promise<void> => {
// //     try {

// //         const userId = (req as any).userId;
// //         const { docId, slotDate, slotTime } = req.body

// //         const docData = await doctorModel.findById(docId).select('-password')

// //         if(!docData?.available){
// //             res.json({success:false,message:'Doctor not availaable'})
// //             return;
// //         }

// //         let slots_booked = docData.slots_booked

// //         // Checking for slots availability
// //         if(slots_booked[slotDate]){
// //             if(slots_booked[slotDate].includes(slotTime)){
// //                 res.json({success:false,message:'Slots not available'})
// //                 return;
// //             }else{
// //                 slots_booked[slotDate].push(slotTime)
// //             }
// //         }else{
// //             slots_booked[slotDate] = []
// //             slots_booked[slotDate].push(slotTime)
// //         }

// //         const userData = await userModel.findById(userId).select('-password')

// //         delete docData.slots_booked;

// //         const appointmentData = {
// //             userId,
// //             docId,
// //             userData,
// //             docData,
// //             amount: docData.fees,
// //             slotTime,
// //             slotDate,
// //             date: Date.now()
// //         }

// //         const newAppointment = new appointmentModel(appointmentData);
// //         await newAppointment.save();

// //         // Save new slots data in docData
// //         await doctorModel.findByIdAndUpdate(docId,{slots_booked})

// //         res.json({success:true,message:'Appointment Booked'})
// //         return;
        
// //     } catch (error) {
// //          const err = error as ErrorType;
// //         console.log(err.message);
// //         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message:err.message });
// //     }
// // }



// export {
//     registerUser,
//     loginUser,
//     getProfile,
//     updateProfile,
//     // bookappointment,
// }