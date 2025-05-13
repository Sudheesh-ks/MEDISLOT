import doctorModel from "../models/doctorModel";
import { ErrorType } from "../types/error"
import { Request, Response } from "express";
import { HttpStatus } from '../constants/status.constants'

const changeAvailability = async (req: Request,res: Response) => {
    try {

        const { docId } = req.body;

        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId,{available: !docData?.available })
        res.status(HttpStatus.OK).json({ success:true, message: 'Availability Changed' })
        
    } catch (error) {
        const err = error as ErrorType;
        console.log(err.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success:false, message:err.message });
    }
}


export {
    changeAvailability,
}