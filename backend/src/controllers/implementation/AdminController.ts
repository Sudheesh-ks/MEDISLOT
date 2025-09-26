import { Request, Response } from 'express';
import { IAdminService } from '../../services/interface/IAdminService';
import { IAdminController } from '../interface/IadminController.interface';
import { HttpStatus } from '../../constants/status.constants';
import { HttpResponse } from '../../constants/responseMessage.constants';
import logger from '../../utils/logger';
import { INotificationService } from '../../services/interface/INotificationService';

export class AdminController implements IAdminController {
  constructor(
    private readonly _adminService: IAdminService,
    private readonly _notificationService: INotificationService
  ) {}

  // For Admin login
  async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken, refreshToken } = await this._adminService.login(
        req.body.email,
        req.body.password
      );
      logger.info(`Admin login success: ${req.body.email}`);
      res
        .cookie('refreshToken_admin', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/api/admin/refresh-token',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(HttpStatus.OK)
        .json({
          success: true,
          token: accessToken,
          message: HttpResponse.LOGIN_SUCCESS,
        });
    } catch (error) {
      logger.error(`Admin login failed: ${(error as Error).message}`, {
        stack: (error as Error).stack,
      });
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async refreshAdminToken(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken, refreshToken } = await this._adminService.refreshAdminToken(
        req.cookies?.refreshToken_admin
      );

      res.cookie('refreshToken_admin', refreshToken, {
        httpOnly: true,
        path: '/api/admin/refresh-token',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        token: accessToken,
      });
    } catch (error) {
      logger.error('Refresh admin token failed', { error });
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: (error as Error).message || HttpResponse.REFRESH_TOKEN_FAILED,
      });
    }
  }

  // For Admin Logout
  async logoutAdmin(req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken_admin', {
      httpOnly: true,
      path: '/api/admin/refresh-token',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    logger.info('Admin logout successful');
    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpResponse.LOGOUT_SUCCESS,
    });
  }

  // For getting doctors
  async getDoctorsPaginated(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._adminService.getDoctorsPaginated(
        req.query.page as string,
        req.query.limit as string,
        req.query.search as string | undefined
      );
      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      logger.error('Failed to fetch doctors paginated', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getDoctorById(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.id;
      const doctor = await this._adminService.getDoctorById(doctorId);
      res.status(HttpStatus.OK).json({ success: true, doctor });
    } catch (error) {
      logger.error('Failed to fetch doctor by id', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getUsersPaginated(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._adminService.getUsersPaginated(
        req.query.page as string,
        req.query.limit as string,
        req.query.search as string
      );
      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      logger.error('Failed to fetch users paginated', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async toggleUserBlock(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { block } = req.body as { block?: boolean };

      logger.info(`Toggling user block - ID: ${userId}, Block: ${block}`);

      const data = await this._adminService.toggleUserBlock(userId, block!);
      res.status(HttpStatus.OK).json({ success: true, data });
    } catch (error) {
      logger.error('Failed to toggle user block', { error });
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async approveDoctor(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.id;
      logger.info(`Approving doctor ID: ${doctorId}`);
      const message = await this._adminService.approveDoctor(doctorId);
      res.status(HttpStatus.OK).json({ success: true, message });
    } catch (error) {
      logger.error(`Failed to approve doctor ID: ${req.params.id}`, { error });
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async rejectDoctor(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.id;
      const { reason } = req.body;

      logger.info(`Doctor rejected: ${doctorId}`);

      const message = await this._adminService.rejectDoctor(doctorId, reason);
      res.status(HttpStatus.OK).json({ success: true, message });
    } catch (error) {
      logger.error(`Doctor rejection failed: ${(error as Error).message}`, {
        stack: (error as Error).stack,
      });
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // For getting paginated appointments
  async appointmentsListPaginated(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const search = (req.query.search as string) || '';
      const dateRange = req.query.dateRange as string;

      const result = await this._adminService.listAppointmentsPaginated(
        page,
        limit,
        search,
        dateRange
      );
      logger.info(`Admin fetched appointments page: ${page} with search: "${search}"`);
      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      logger.error(`Failed to list appointments: ${(error as Error).message}`, {
        stack: (error as Error).stack,
      });
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async adminCancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;

      await this._adminService.cancelAppointment(appointmentId);
      logger.info(`Admin canceled appointment ID: ${appointmentId}`);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.APPOINTMENT_CANCELLED });
    } catch (error) {
      logger.error(`Failed to cancel appointment: ${(error as Error).message}`, {
        stack: (error as Error).stack,
      });
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async getAdminWalletPaginated(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const period = (req.query.period as string) || 'all';
      const txnType = (req.query.txnType as 'credit' | 'debit' | 'all') || 'all';

      const wallet = await this._adminService.getAdminWalletPaginated(
        page,
        limit,
        search,
        period,
        txnType
      );

      res.status(200).json(wallet);
    } catch (error) {
      logger.error(`Get admin wallet error: ${error}`);
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // For admin dashboard
  async adminDashboard(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this._adminService.getDoctors();
      const users = await this._adminService.getUsers();
      const appointments = await this._adminService.listAppointments();

      const dashData = {
        doctors: doctors.length,
        patients: users.length,
        appointments: appointments.length,
        latestAppointments: appointments.reverse().slice(0, 5),
      };

      res.status(HttpStatus.OK).json({ success: true, dashData });
    } catch (error) {
      logger.error(`Failed to list doctors: ${(error as Error).message}`, {
        stack: (error as Error).stack,
      });
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async getLatestDoctorRequests(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 5;
      const requests = await this._adminService.getLatestDoctorRequests(limit);
      res.status(HttpStatus.OK).json({ success: true, requests });
    } catch (err) {
      logger.error(`Latest doctor requests failed: ${(err as Error).message}`);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (err as Error).message });
    }
  }

  async getAppointmentsStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query as any;
      const data = await this._adminService.getAppointmentsStats(startDate, endDate);
      res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) {
      logger.error(`Appointments stats failed: ${(err as Error).message}`);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (err as Error).message });
    }
  }

  async getTopDoctors(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query as any;
      const data = await this._adminService.getTopDoctors(Number(limit) || 5);
      res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) {
      logger.error(`Top doctors failed: ${(err as Error).message}`);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (err as Error).message });
    }
  }

  async getRevenueStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query as any;
      const data = await this._adminService.getRevenueStats(startDate, endDate);
      res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) {
      logger.error(`Revenue stats failed: ${(err as Error).message}`);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (err as Error).message });
    }
  }

  async getNotificationHistory(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as 'user' | 'doctor' | 'admin';
      const adminId = (req as any).adminId;

      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const type = req.query.type ? String(req.query.type) : undefined;

      logger.info(
        `Fetching notifications for user=${adminId}, role=${role}, page=${page}, limit=${limit}, type=${type}`
      );

      const { notifications, total } =
        await this._notificationService.fetchNotificationHistoryPaged(
          adminId,
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
      const userId = (req as any).adminId;
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
      const userId = (req as any).adminId;
      // console.log(role, userId)
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
      const adminId = (req as any).adminId;

      logger.info(`Clearing all notifications for user ${adminId}, role=${role}, type=${type}`);
      await this._notificationService.clearAll(adminId, role, type);

      res.status(HttpStatus.OK).json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
      logger.error(`Error clearing notifications: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getAllComplaints(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.q as string) || '';
      const status = (req.query.status as string) || 'all';

      const result = await this._adminService.getAllComplaints(page, limit, search, status);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Complaints fetched successfully',
        data: result.complaints,
        pagination: {
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
      });
    } catch (error) {
      logger.error('Error fetching complaints:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  }

  async updateComplaintStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await this._adminService.updateComplainStatus(id, status);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Complaint status updated successfully',
        data: updated,
      });
    } catch (error) {
      logger.error('Error updating complaint status:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Something went wrong',
      });
    }
  }
}
