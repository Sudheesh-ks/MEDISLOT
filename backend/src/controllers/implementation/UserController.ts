import { Request, Response } from "express";
import { IUserService } from "../../services/interface/IUserService";
import { HttpStatus } from "../../constants/status.constants";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { IUserController } from "../interface/IuserController.interface";
import { otpStore } from "../../utils/otpStore";
import { sendOTP } from "../../utils/mail.util";
import { generateOTP } from "../../utils/otp.util";
import {
  isValidName,
  isValidEmail,
  isValidPassword,
} from "../../utils/validator";
import { PaymentService } from "../../services/implementation/PaymentService";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.utils";

export class UserController implements IUserController {
  constructor(
    private _userService: IUserService,
    private _paymentService: PaymentService
  ) {}



 async registerUser(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  try {
    await this._userService.register(name, email, password);
    res
      .status(HttpStatus.OK)
      .json({ success: true, message: HttpResponse.OTP_SENT });
  } catch (error) {
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

    if (purpose === "register" && user && user._id && refreshToken) {
      res.cookie("refreshToken_user", refreshToken, {
        httpOnly: true,
        path: "/api/user/refresh-token",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        token: generateAccessToken(user._id, user.email, "user"),
        message: HttpResponse.REGISTER_SUCCESS,
      });
      return;
    }

    if (purpose === "reset-password") {
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

    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpResponse.OTP_RESENT,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
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

    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpResponse.RESET_EMAIL_SENT,
    });
  } catch (error) {
    console.error("Forgot Password OTP Error:", error);
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

    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpResponse.PASSWORD_UPDATED,
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: (error as Error).message || HttpResponse.OTP_EXPIRED_OR_INVALID,
    });
  }
}


  async loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const { user, token, refreshToken } = await this._userService.login(
      email,
      password
    );

    res.cookie("refreshToken_user", refreshToken, {
      httpOnly: true,
      path: "/api/user/refresh-token",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(HttpStatus.OK).json({
      success: true,
      token,
      message: HttpResponse.LOGIN_SUCCESS,
    });
  } catch (error) {
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

    res.cookie("refreshToken_user", newRefreshToken, {
      httpOnly: true,
      path: "/api/user/refresh-token",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(HttpStatus.OK).json({ success: true, token });
  } catch (error) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: (error as Error).message || HttpResponse.REFRESH_TOKEN_FAILED,
    });
  }
}

 async logout(req: Request, res: Response): Promise<void> {
  try {
    res.clearCookie("refreshToken_user", {
      httpOnly: true,
      secure: true,
      path: "/api/user/refresh-token",
      sameSite: "strict",
    });
    res.status(HttpStatus.OK).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
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
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const { _id, name, image } = user;
    res.json({ success: true, user: { _id, name, image } });
  } catch (err) {
    const statusCode = (err as Error).message === "User not found"
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

    res.status(HttpStatus.OK).json({ success: true, userData });
  } catch (error) {
    const statusCode = (error as Error).message === HttpResponse.USER_NOT_FOUND
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

    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpResponse.PROFILE_UPDATED,
    });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: (error as Error).message,
    });
  }
}


  async bookAppointment(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { docId, slotDate, slotTime } = req.body;

    const appointment = await this._userService.bookAppointment({
      userId,
      docId,
      slotDate,
      slotTime,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpResponse.APPOINTMENT_BOOKED,
      appointment,
    });
  } catch (error) {
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

    res.status(HttpStatus.OK).json({
      success: true,
      ...result,
    });
  } catch (error) {
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
    console.log("userId from token:", userId);


    await this._userService.cancelAppointment(userId, appointmentId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpResponse.APPOINTMENT_CANCELLED,
    });
  } catch (error) {
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

    res.status(HttpStatus.OK).json({ success: true, order });
  } catch (error) {
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

    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpResponse.PAYMENT_SUCCESS,
    });
  } catch (error) {
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

    res.status(HttpStatus.OK).json({ success: true, data: slots });
  } catch (error) {
    console.error("getAvailableSlotsForDoctor error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch available slots",
    });
  }
}

async getAvailableSlotsByDate(req: Request, res: Response): Promise<void> {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      res
        .status(400)
        .json({ success: false, message: "doctorId & date required" });
      return;
    }

    const data = await this._userService.getAvailableSlotsByDate(
      String(doctorId),
      String(date)
    );
    res.json({ success: true, data });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch slots" });
  }
}
}
