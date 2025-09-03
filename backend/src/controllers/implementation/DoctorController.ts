import { Request, Response } from 'express';
import { DoctorService } from '../../services/implementation/DoctorService';
import { IDoctorController } from '../interface/IdoctorController.interface';
import { HttpStatus } from '../../constants/status.constants';
import { HttpResponse } from '../../constants/responseMessage.constants';
import { DoctorTypes } from '../../types/doctor';
import logger from '../../utils/logger';
import { NotificationService } from '../../services/implementation/NotificationService';
import { BlogService } from '../../services/implementation/BlogService';
import { BlogTypes } from '../../types/blog';
import { patientHistoryTypes } from '../../types/patientHistoryTypes';

export class DoctorController implements IDoctorController {
  constructor(
    private _doctorService: DoctorService,
    private _notificationService: NotificationService,
    private _blogService: BlogService
  ) {}

  async registerDoctor(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const imageFile = files?.['image']?.[0];
      const certificateFile = files?.['certificate']?.[0];

      if (!imageFile || !certificateFile) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Doctor image & certificate is required',
        });
        return;
      }

      const doctorDTO: DoctorTypes = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        experience: req.body.experience,
        about: req.body.about,
        speciality: req.body.speciality,
        degree: req.body.degree,
        fees: Number(req.body.fees),
        address: req.body.address,
        image: imageFile.path,
        certificate: certificateFile.path,
      };

      await this._doctorService.registerDoctor(doctorDTO);
      logger.info(`Doctor registered successfully: ${req.body.email}`);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: HttpResponse.DOCTOR_REGISTER_SUCCESS,
      });
    } catch (error) {
      logger.error(`Doctor registration failed: ${(error as Error).message}`);

      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getDoctorById(req: Request, res: Response): Promise<void> {
    try {
      const doctor = await this._doctorService.getPublicDoctorById(req.params.id);
      logger.info(`Fetched doctor by ID: ${req.params.id}`);

      res.status(HttpStatus.OK).json({ success: true, doctor });
    } catch (err) {
      logger.error(`Doctor not found: ${(err as Error).message}`);

      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: (err as Error).message,
      });
    }
  }

  async changeAvailability(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId || req.params.doctorId || req.params.id;
      await this._doctorService.toggleAvailability(docId);
      logger.info(`Doctor availability toggled: ${docId}`);

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.DOCTOR_AVAILABILITY_CHANGE,
      });
    } catch (error) {
      logger.error(`Error changing availability: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async doctorList(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this._doctorService.getAllDoctors();
      logger.info('Fetched all doctors');

      res.status(HttpStatus.OK).json({ success: true, doctors });
    } catch (error) {
      logger.error(`Error fetching doctors: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getDoctorsPaginated(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._doctorService.getDoctorsPaginated(req.query);
      logger.info('Fetched paginated doctors list');

      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      logger.error(`Error in paginated doctor fetch: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async loginDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { token: accessToken, refreshToken } = await this._doctorService.loginDoctor(req.body);

      res.cookie('refreshToken_doctor', refreshToken, {
        httpOnly: true,
        path: '/api/doctor/refresh-token',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      logger.info(`Doctor login: ${req.body.email}`);

      res.status(HttpStatus.OK).json({
        success: true,
        token: accessToken,
        message: HttpResponse.LOGIN_SUCCESS,
      });
    } catch (error) {
      logger.error(`Doctor login failed: ${(error as Error).message}`);

      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: HttpResponse.UNAUTHORIZED,
      });
    }
  }

  async refreshDoctorToken(req: Request, res: Response): Promise<void> {
    try {
      const { token, refreshToken } = await this._doctorService.refreshToken(
        req.cookies?.refreshToken_doctor
      );

      res.cookie('refreshToken_doctor', refreshToken, {
        httpOnly: true,
        path: '/api/doctor/refresh-token',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      logger.info('Doctor token refreshed');

      res.status(HttpStatus.OK).json({
        success: true,
        token,
      });
    } catch (error) {
      logger.error(`Doctor token refresh failed: ${(error as Error).message}`);

      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: HttpResponse.REFRESH_TOKEN_FAILED,
      });
    }
  }

  async logoutDoctor(req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken_doctor', {
      httpOnly: true,
      path: '/api/doctor/refresh-token',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    logger.info('Doctor logged out');

    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpResponse.LOGOUT_SUCCESS,
    });
  }

  // For getting doctor appointments
  async appointmentsDoctor(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId;

      const appointments = await this._doctorService.getDoctorAppointments(docId);
      logger.info(`Fetched appointments for doctor: ${docId}`);

      res.status(HttpStatus.OK).json({ success: true, appointments });
    } catch (error) {
      logger.error(`Error fetching doctor appointments: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // For getting doctor appointments
  async appointmentsDoctorPaginated(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId;

      const { page, limit, search, dateRange } = req.query;

      const result = await this._doctorService.getDoctorAppointmentsPaginated(
        docId,
        page as string,
        limit as string,
        search as string,
        dateRange as string
      );

      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      logger.error(`Error fetching paginated appointments: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async appointmentConfirm(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId;
      const { appointmentId } = req.params;

      await this._doctorService.confirmAppointment(docId, appointmentId);
      logger.info(`Appointment confirmed: ${appointmentId} by ${docId}`);

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.APPOINTMENT_CONFIRMED,
      });
    } catch (error) {
      logger.error(`Confirm appointment error: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async appointmentCancel(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId;
      const { appointmentId } = req.params;

      await this._doctorService.cancelAppointment(docId, appointmentId);
      logger.info(`Appointment cancelled: ${appointmentId} by ${docId}`);

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.APPOINTMENT_CANCELLED,
      });
    } catch (error) {
      logger.error(`Cancel appointment error: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getActiveAppointment(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId;
      const appointment = await this._doctorService.getActiveAppointment(docId);

      if (!appointment) {
        res.json({ active: false });
        return;
      }

      logger.info(`Appointment is active`);

      res.status(HttpStatus.OK).json({
        active: true,
        appointmentId: appointment._id,
        userId: appointment.userData._id,
        doctorId: appointment.docData._id,
      });
      return;
    } catch (error) {
      logger.error(`Get active appointment error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async doctorProfile(req: Request, res: Response): Promise<void> {
    try {
      const doctId = (req as any).docId;
      const profileData = await this._doctorService.getDoctorProfile(doctId);
      logger.info(`Fetched profile for doctor: ${doctId}`);

      res.json({ success: true, profileData });
    } catch (error) {
      logger.error(`Doctor profile fetch failed: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async updateDoctorProfile(req: Request, res: Response): Promise<void> {
    try {
      await this._doctorService.updateDoctorProfile(req.body, req.file);
      logger.info(`Doctor profile updated: ${(req as any).docId}`);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Doctor profile updated successfully',
      });
    } catch (error) {
      logger.error(`Update doctor profile failed: ${(error as Error).message}`);

      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getDoctorWallet(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = (req as any).docId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const period = (req.query.period as string) || 'all';
      const txnType = (req.query.txnType as 'credit' | 'debit' | 'all') || 'all';

      const wallet = await this._doctorService.getDoctorWalletPaginated(
        doctorId,
        page,
        limit,
        search,
        period,
        txnType
      );

      res.status(200).json(wallet);
    } catch (error) {
      logger.error(`Get wallet error: ${error}`);
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getNotificationHistory(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as 'user' | 'doctor' | 'admin';
      const doctorId = (req as any).docId;

      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const type = req.query.type ? String(req.query.type) : undefined;

      logger.info(
        `Fetching notifications for user=${doctorId}, role=${role}, page=${page}, limit=${limit}, type=${type}`
      );

      const { notifications, total } =
        await this._notificationService.fetchNotificationHistoryPaged(
          doctorId,
          role,
          page,
          limit,
          type
        );

      res.status(HttpStatus.OK).json({
        success: true,
        notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      logger.error(`Error fetching notifications: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async markSingleAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Marking notification ${id} as read`);
      await this._notificationService.markAsRead(id);
      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      logger.error(`Error marking notification as read: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as 'user' | 'doctor' | 'admin';
      const userId = (req as any).docId;
      logger.info(`Marking all notifications as read for user ${userId}`);
      await this._notificationService.markAllAsRead(userId, role);
      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      logger.error(`Error marking all notifications as read: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as 'user' | 'doctor' | 'admin';
      const userId = (req as any).docId;
      const count = await this._notificationService.getUnreadCount(userId, role);
      res.status(HttpStatus.OK).json({ success: true, unreadCount: count });
    } catch (error) {
      logger.error(`Error fetching unread count: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async clearAll(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as 'user' | 'doctor' | 'admin';
      const type = req.query.type ? String(req.query.type) : undefined;
      const doctorId = (req as any).docId;

      logger.info(`Clearing all notifications for user ${doctorId}, role=${role}, type=${type}`);
      await this._notificationService.clearAll(doctorId, role, type);

      res.status(HttpStatus.OK).json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
      logger.error(`Error clearing notifications: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = (req as any).docId;
      if (!doctorId) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }

      const { start, end } = req.query as any;

      const data = await this._doctorService.getDashboardData(doctorId, start, end);
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      logger.error('Error fetching doctor dashboard data', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  }

  async submitPrescription(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = (req as any).docId;
      console.log(doctorId);
      const { appointmentId } = req.params;
      const { prescription } = req.body;

      if (!prescription) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: 'Prescription text is required' });
        return;
      }

      const saved = await this._doctorService.submitPrescription(
        doctorId,
        appointmentId,
        prescription
      );

      res.status(HttpStatus.OK).json({ success: true, data: saved });
    } catch (err: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
  }

  async createBlog(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = (req as any).docId;
      const { title, summary, content, category, readTime, tags, visibility } = req.body;

      const blogData: BlogTypes = {
        title,
        summary,
        content,
        category,
        readTime,
        tags,
        visibility,
        doctorId,
        image: req.file ?? '',
      };

      const blog = await this._blogService.createBlog(blogData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Blog created successfully',
        blog,
      });
    } catch (error) {
      logger.error(`Error creating blog: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async createPatientHistory(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = (req as any).docId;
      const { userId, appointmentId } = req.params;
      const {
        date,
        time,
        type,
        chiefComplaint,
        symptoms,
        vitals,
        diagnosis,
        doctorNotes,
        prescription,
      } = req.body;

      const patientHistory: patientHistoryTypes = {
        appointmentId,
        doctorId,
        patientId: userId,
        date,
        time,
        type,
        chiefComplaint,
        symptoms,
        vitals,
        diagnosis,
        doctorNotes,
        prescription: prescription.filter(
          (p: any) => p.medication && p.dosage && p.frequency && p.duration && p.instructions
        ),
      };

      await this._doctorService.createPatientHistory(patientHistory);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Patient history added successfully',
      });
    } catch (error) {
      logger.error(`Error creating patient history: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async updatePatientHistory(req: Request, res: Response): Promise<void> {
    try {
      const { historyId } = req.params;
      const {
        date,
        time,
        type,
        chiefComplaint,
        symptoms,
        vitals,
        diagnosis,
        doctorNotes,
        prescription,
      } = req.body;

      const updatedHistory = await this._doctorService.updatePatientHistory(historyId, {
        date,
        time,
        type,
        chiefComplaint,
        symptoms,
        vitals,
        diagnosis,
        doctorNotes,
        prescription: prescription.filter(
          (p: any) => p.medication && p.dosage && p.frequency && p.duration && p.instructions
        ),
      });

      if (!updatedHistory) {
        res.status(404).json({
          success: false,
          message: 'Patient history not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Patient history updated successfully',
        history: updatedHistory,
      });
    } catch (error) {
      logger.error(`Error updating patient history: ${(error as Error).message}`);
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getPatientHistory(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = (req as any).docId;
      const { userId } = req.params;
      const histories = await this._doctorService.getPatientHistory(doctorId, userId);

      res.status(HttpStatus.OK).json({ success: true, histories });
    } catch (error) {
      logger.error(`Error fetching patient histories by patient: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getPatientHistoryById(req: Request, res: Response): Promise<void> {
    try {
      const { historyId } = req.params;
      const history = await this._doctorService.getPatientHistoryById(historyId);

      if (!history) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Patient history not found',
        });
        return;
      }

      res.status(HttpStatus.OK).json({ success: true, history });
    } catch (error) {
      logger.error(`Error fetching patient history by ID: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getPatientById(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const patient = await this._doctorService.getPatientById(patientId);

      if (!patient) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'Patient not found' });
        return;
      }

      res.status(HttpStatus.OK).json({ success: true, patient });
    } catch (error) {
      logger.error(`Error fetching patient: ${(error as Error).message}`);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }
}
