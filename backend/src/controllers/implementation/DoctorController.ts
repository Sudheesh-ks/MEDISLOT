import { Request, Response } from "express";
import { DoctorService } from "../../services/implementation/DoctorService";
import { IDoctorController } from "../interface/doctorController.interface";
import { HttpStatus } from "../../constants/status.constants";


export class DoctorController implements IDoctorController {
  constructor(private doctorService: DoctorService) {}

  // For updating doctor availability
  async changeAvailability(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId || req.params.doctorId || req.params.id;
      await this.doctorService.toggleAvailability(docId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Availability Changed" });
    } catch (error) {
      console.log((error as Error))
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // For getting all doctor profiles
  async doctorList(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this.doctorService.getAllDoctors();
      res.status(HttpStatus.OK).json({ success: true, doctors });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }


  // For doctor login
  async loginDoctor(req: Request, res: Response): Promise<void> {
    try {

      const { email, password } = req.body;

    const token = await this.doctorService.loginDoctor(email, password);
    if (!token) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: 'Invalid credentials' });
      return;
    }

    res.status(HttpStatus.OK).json({ success: true, token });
      
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }


  // For getting doctor appointments
  async appointmentsDoctor(req: Request, res: Response): Promise<void> {
    try {

      const docId = (req as any).docId;
      
      // Now using the service layer instead of direct model access
      const appointments = await this.doctorService.getDoctorAppointments(docId);

      res.status(HttpStatus.OK).json({ success: true, appointments });
      
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }


  // For appointment acceptance
  async appointmentComplete(req: Request, res: Response): Promise<void> {
    try {

      const docId = (req as any).docId;
    const { appointmentId } = req.params;

    await this.doctorService.completeAppointment(docId, appointmentId);

    res.status(HttpStatus.OK).json({ success: true, message: "Appointment Completed" });
      
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }


  // For appointment cancellation
  async appointmentCancel(req: Request, res: Response): Promise<void> {
    try {

      const docId = (req as any).docId;
    const { appointmentId } = req.params;

    await this.doctorService.cancelAppointment(docId, appointmentId);

    res.status(HttpStatus.OK).json({ success: true, message: "Appointment Cancelled" });
      
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }
  
}
