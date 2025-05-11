import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


// Admin authentication middleware
const authAdmin = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    try {
        
        const atoken = req.headers.atoken as string;
        if(!atoken){
            res.status(401).json({success:false,message:"Authentication Failed Login Again"});
            return;
        }

        const token_decode = jwt.verify(atoken,process.env.JWT_SECRET);

        if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
             res.status(403).json({success:false,message:"Authentication Failed Login Again"});
        }

        next();

    } catch (error: any) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

export default authAdmin