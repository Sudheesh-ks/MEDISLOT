import { Request, Response } from 'express';
import { IUserService } from '../../services/interface/IUserService';
import { HttpStatus } from '../../constants/status.constants';
import { HttpResponse } from '../../constants/responseMessage.constants';
import { IUserController } from '../interface/IuserController.interface';
import { PaymentService } from '../../services/implementation/PaymentService';
import { generateAccessToken } from '../../utils/jwt.utils';
import logger from '../../utils/logger';
import { NotificationService } from '../../services/implementation/NotificationService';

export class UserController implements IUserController {
  constructor(
    private _userService: IUserService,
    private _paymentService: PaymentService,
    private _notificationService: NotificationService
  ) {}

  async registerUser(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    try {
      await this._userService.register(name, email, password);
      logger.info(`OTP sent to ${email}`);

      res.status(HttpStatus.OK).json({ success: true, message: HttpResponse.OTP_SENT });
    } catch (error) {
      logger.error(`Register Error: ${error}`);

      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message || HttpResponse.SERVER_ERROR,
      });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;

    try {
      const { purpose, user, refreshToken } = await this._userService.verifyOtp(email, otp);

      if (purpose === 'register' && user && user._id && refreshToken) {
        res.cookie('refreshToken_user', refreshToken, {
          httpOnly: true,
          path: '/api/user/refresh-token',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        logger.info(`User ${email} verified & registered.`);
        res.status(HttpStatus.CREATED).json({
          success: true,
          token: generateAccessToken(user._id, user.email, 'user'),
          message: HttpResponse.REGISTER_SUCCESS,
        });
        return;
      }

      if (purpose === 'reset-password') {
        res.status(HttpStatus.OK).json({
          success: true,
          message: HttpResponse.OTP_VERIFIED,
        });
        return;
      }

      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: HttpResponse.BAD_REQUEST,
      });
    } catch (error) {
      logger.warn(`OTP verification failed for ${email}: ${(error as Error).message}`);
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: (error as Error).message || HttpResponse.OTP_INVALID,
      });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      await this._userService.resendOtp(email);
      logger.info(`OTP resent to ${email}`);
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.OTP_RESENT,
      });
    } catch (error) {
      logger.error(`Resend OTP Error for ${req.body.email}: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message || HttpResponse.OTP_SEND_FAILED,
      });
    }
  }

  async forgotPasswordRequest(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      await this._userService.forgotPasswordRequest(email);
      logger.info(`Forgot password OTP sent to ${email}`);
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.RESET_EMAIL_SENT,
      });
    } catch (error) {
      logger.error(`Forgot Password Request Error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message || HttpResponse.OTP_SEND_FAILED,
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, newPassword } = req.body;

      await this._userService.resetPassword(email, newPassword);
      logger.info(`Password reset for ${email}`);
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.PASSWORD_UPDATED,
      });
    } catch (error) {
      logger.error(`Reset Password Error: ${error}`);
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message || HttpResponse.OTP_EXPIRED_OR_INVALID,
      });
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const { user, token, refreshToken } = await this._userService.login(email, password);

      res.cookie('refreshToken_user', refreshToken, {
        httpOnly: true,
        path: '/api/user/refresh-token',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      logger.info(`User ${email} logged in`);
      res.status(HttpStatus.OK).json({
        success: true,
        token,
        message: HttpResponse.LOGIN_SUCCESS,
      });
    } catch (error) {
      logger.warn(`Login failed for ${req.body.email}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken_user;

      const { token, refreshToken: newRefreshToken } =
        await this._userService.refreshToken(refreshToken);

      res.cookie('refreshToken_user', newRefreshToken, {
        httpOnly: true,
        path: '/api/user/refresh-token',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      logger.info(`Refresh token issued`);
      res.status(HttpStatus.OK).json({ success: true, token });
    } catch (error) {
      logger.warn(`Refresh token failed`);
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: (error as Error).message || HttpResponse.REFRESH_TOKEN_FAILED,
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('refreshToken_user', {
        httpOnly: true,
        secure: true,
        path: '/api/user/refresh-token',
        sameSite: 'strict',
      });
      logger.info('User logged out');
      res.status(HttpStatus.OK).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      logger.error(`Logout Error: ${err}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (err as Error).message,
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this._userService.getUserById(req.params.id);

      if (!user) {
        logger.warn(`User not found with ID: ${req.params.id}`);
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const { _id, name, image } = user;
      res.json({ success: true, user: { _id, name, image } });
    } catch (err) {
      logger.error(`Get user by ID error: ${err}`);
      const statusCode =
        (err as Error).message === 'User not found'
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: (err as Error).message,
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const userData = await this._userService.getProfile(userId);
      logger.info(`Profile fetched for user: ${userId}`);
      res.status(HttpStatus.OK).json({ success: true, userData });
    } catch (error) {
      logger.error(`Get profile error: ${error}`);
      const statusCode =
        (error as Error).message === HttpResponse.USER_NOT_FOUND
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      await this._userService.updateProfile(userId, req.body, req.file);
      logger.info(`Profile updated for user: ${userId}`);
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.PROFILE_UPDATED,
      });
    } catch (error) {
      logger.error(`Update profile error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getUserWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const walletData = await this._userService.getUserWalletPaginated(
        userId,
        'user',
        page,
        limit
      );

      res.status(200).json({
        success: true,
        ...walletData,
      });
    } catch (error) {
      logger.error(`Get wallet error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async bookAppointment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { docId, slotDate, slotStartTime, slotEndTime } = req.body;

      const appointment = await this._userService.bookAppointment({
        userId,
        docId,
        slotDate,
        slotStartTime,
        slotEndTime,
      });
      logger.info(`Appointment booked for user ${userId}`);
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.APPOINTMENT_BOOKED,
        appointment,
      });
    } catch (error) {
      logger.error(`Book appointment error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async listAppointment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      const result = await this._userService.listUserAppointmentsPaginated(userId, page, limit);
      logger.info(`Appointments listed for user ${userId}`);
      res.status(HttpStatus.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      logger.error(`List appointment error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getActiveAppointment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const appointment = await this._userService.getActiveAppointment(userId);

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

  async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { appointmentId } = req.params;
      console.log('userId from token:', userId);

      await this._userService.cancelAppointment(userId, appointmentId);
      logger.info(`Appointment ${appointmentId} cancelled by user ${userId}`);
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.APPOINTMENT_CANCELLED,
      });
    } catch (error) {
      logger.error(`Cancel appointment error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async paymentRazorpay(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { appointmentId } = req.body;

      const { order } = await this._userService.startPayment(userId, appointmentId);
      logger.info(`Payment started for appointment ${appointmentId}`);
      res.status(HttpStatus.OK).json({ success: true, order });
    } catch (error) {
      logger.error(`Payment init error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async verifyRazorpay(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { appointmentId, razorpay_order_id } = req.body;

      await this._userService.verifyPayment(userId, appointmentId, razorpay_order_id);
      logger.info(`Payment verified for appointment ${appointmentId}`);
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.PAYMENT_SUCCESS,
      });
    } catch (error) {
      logger.error(`Payment verify error: ${error}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getAvailableSlotsForDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId, year, month } = req.query;

      if (!doctorId || !year || !month) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: HttpResponse.FIELDS_REQUIRED,
        });
        return;
      }

      const slots = await this._userService.getAvailableSlotsForDoctor(
        String(doctorId),
        Number(year),
        Number(month)
      );
      logger.info(`Available slots fetched for doctor ${doctorId}`);
      res.status(HttpStatus.OK).json({ success: true, data: slots });
    } catch (error) {
      logger.error(`Get available slots error: ${error}`);
      console.error('getAvailableSlotsForDoctor error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch available slots',
      });
    }
  }

  async getAvailableSlotsByDate(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId, date } = req.query;
      if (!doctorId || !date) {
        res.status(400).json({ success: false, message: 'doctorId & date required' });
        return;
      }

      const data = await this._userService.getAvailableSlotsByDate(String(doctorId), String(date));
      logger.info(`Available slots by date fetched for doctor ${doctorId} on ${date}`);
      res.json({ success: true, data });
    } catch (err) {
      logger.error(`Get available slots by date error: ${err}`);
      res.status(500).json({ success: false, message: 'Failed to fetch slots' });
    }
  }

  async getNotificationHistory(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as 'user' | 'doctor' | 'admin';
      const userId = (req as any).userId;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const before = req.query.before ? new Date(String(req.query.before)) : undefined;
      const type = req.query.type ? String(req.query.type) : undefined;

      logger.info(
        `Fetching notifications for user=${userId}, role=${role}, limit=${limit}, before=${before}, type=${type}`
      );

      const notifications = await this._notificationService.fetchNotificationHistory(
        userId,
        role,
        limit,
        before,
        type
      );
      res.status(HttpStatus.OK).json({ success: true, notifications });
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
      const userId = (req as any).userId;
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
      const userId = (req as any).userId;
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

  async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const apptId = req.params.apptId;
      const { message } = req.body;

      if (!message || !apptId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Appointment ID and feedback message are required',
        });
        return;
      }

      await this._userService.submitFeedback(userId, apptId, message);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Feedback submitted successfully',
      });
    } catch (error) {
      logger.error(`Error on submitting feedback: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // doctorController.ts or prescriptionController.ts
  async getPrescriptionByAppointmentId(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;

      const prescription = await this._userService.getPrescriptionByAppointmentId(appointmentId);

      res.status(200).json({ success: true, data: prescription });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
