import { Request, Response } from "express";
import { HttpStatus } from "../constants/status.constants";
import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from "../models/userModel";
import  Jwt  from "jsonwebtoken";
import { ErrorType } from "../types/error";



// API to register user
const registerUser = async (req: Request,res: Response): Promise<void> => {
    try {

        const { name, email, password } = req.body;

        if ( !name || !email || !password ) {
            res.status(HttpStatus.FORBIDDEN).json({success:false,message:'Missing Details'});
            return;
        }

        // validating email format
        if ( !validator.isEmail(email) ) {
            res.json({success:false, message:'enter a valid email'});
            return;
        }

        // validating storng password
        if ( password.length < 8 ) {
            res.json({success: false, message:'enter a strong password'});
            return;
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password : hashedPassword
        }

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = Jwt.sign({id:user._id},process.env.JWT_SECRET)

        res.json({success:true,token})
        
    } catch (error) {
        const err = error as ErrorType;
        console.log(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message:err.message });
    }
}


// API for user login
const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {

        const {email,password} = req.body;
        const user = await userModel.findOne({email})

        if(!user){
            res.json({success:false,message:'User does not exists'})
            return;
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch){
            const token = Jwt.sign({id:user._id},process.env.JWT_SECRET);
            res.json({success:true,token})
        }else{
            res.json({success:false,message:'Invalid Credentials'});
            return;
        }
        
    } catch (error) {
        const err = error as ErrorType;
        console.log(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message:err.message });
    }
}



export {
    registerUser,
    loginUser,
}