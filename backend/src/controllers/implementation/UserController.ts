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
import { log } from "console";
import { use } from "passport";

export class UserController implements IUserController {
  constructor(
    private _userService: IUserService,
    private _paymentService: PaymentService
  ) {}

  async registerUser(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: HttpResponse.FIELDS_REQUIRED });
      return;
    }

    if (!isValidName(name)) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: HttpResponse.INVALID_NAME });
      return;
    }

    if (!isValidEmail(email)) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: HttpResponse.INVALID_EMAIL });
      return;
    }

    if (!isValidPassword(password)) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: HttpResponse.INVALID_PASSWORD });
      return;
    }

    const existing = await this._userService.checkEmailExists(email);
    if (existing) {
      res
        .status(HttpStatus.CONFLICT)
        .json({ success: false, message: HttpResponse.EMAIL_ALREADY_EXISTS });
      return;
    }

    const hashed = await this._userService.hashPassword(password);
    const otp = generateOTP();
    console.log(otp);

    otpStore.set(email, {
      otp,
      purpose: "register",
      userData: { name, email, password: hashed },
    });

    try {
      await sendOTP(email, otp);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.OTP_SENT });
    } catch (err) {
      console.error("Email send failed:", err);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: HttpResponse.OTP_SEND_FAILED });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;

    const record = otpStore.get(email);
    if (!record || record.otp !== otp) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: HttpResponse.OTP_INVALID });
      return;
    }

    if (record.purpose === "register") {
      const newUser = await this._userService.finalizeRegister(record.userData);

  const token = generateAccessToken(newUser._id, newUser.email, "user");
  const refreshToken = generateRefreshToken(newUser._id);

  res.cookie("refreshToken_user", refreshToken, {
    httpOnly: true,
    path: "/api/user/refresh-token",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  otpStore.delete(email);

  res.status(HttpStatus.CREATED).json({
    success: true,
    token,
    message: HttpResponse.REGISTER_SUCCESS,
  });
  return;
    }

    if (record.purpose === "reset-password") {
      otpStore.set(email, { ...record, otp: "VERIFIED" });
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.OTP_VERIFIED });
      return;
    }

    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: HttpResponse.BAD_REQUEST });
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const record = otpStore.get(email);

      if (!record) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: HttpResponse.OTP_NOT_FOUND });
        return;
      }

      const newOtp = generateOTP();
      console.log(newOtp);
      otpStore.set(email, { ...record, otp: newOtp });

      await sendOTP(email, newOtp);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.OTP_RESENT });
    } catch (error) { 
      console.error("Resend OTP error:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: HttpResponse.OTP_SEND_FAILED });
    }
  }

  async forgotPasswordRequest(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      const user = await this._userService.checkEmailExists(email);
      if (!user) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: HttpResponse.USER_NOT_FOUND });
        return;
      }

      const otp = generateOTP();
      console.log(otp);
      otpStore.set(email, { otp, purpose: "reset-password", email });

      await sendOTP(email, otp);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.RESET_EMAIL_SENT });
    } catch (err) {
      console.error("Error sending OTP:", err);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: HttpResponse.OTP_SEND_FAILED });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, newPassword } = req.body;

    if (!isValidPassword(newPassword)) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: HttpResponse.INVALID_PASSWORD });
      return;
    }

    const record = otpStore.get(email);
    if (
      !record ||
      record.purpose !== "reset-password" ||
      record.otp !== "VERIFIED"
    ) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: HttpResponse.OTP_EXPIRED_OR_INVALID });
      return;
    }

    const hashed = await this._userService.hashPassword(newPassword);
    const updated = await this._userService.resetPassword(email, hashed);

    if (!updated) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: HttpResponse.USER_NOT_FOUND });
      return;
    }

    otpStore.delete(email);
    res
      .status(HttpStatus.OK)
      .json({ success: true, message: HttpResponse.PASSWORD_UPDATED });
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: HttpResponse.FIELDS_REQUIRED });
        return;
      }

      if (!isValidEmail(email)) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: HttpResponse.INVALID_EMAIL });
        return;
      }

      if (!isValidPassword(password)) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: HttpResponse.INVALID_PASSWORD });
        return;
      }

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

      res
        .status(HttpStatus.OK)
        .json({ success: true, token, message: HttpResponse.LOGIN_SUCCESS });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken_user;

      if (!refreshToken) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({
            success: false,
            message: HttpResponse.REFRESH_TOKEN_MISSING,
          });
        return;
      }

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({
            success: false,
            message: HttpResponse.REFRESH_TOKEN_INVALID,
          });
        return;
      }

const user = await this._userService.getUserById(decoded.id);
const newAccessToken = generateAccessToken(user._id, user.email, "user");
const newRefreshToken = generateRefreshToken(user._id);

      res.cookie("refreshToken_user", newRefreshToken, {
        httpOnly: true,
        path: "/api/user/refresh-token",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(HttpStatus.OK).json({ success: true, token: newAccessToken });
    } catch (error) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: HttpResponse.REFRESH_TOKEN_FAILED });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie("refreshToken_user", {
      httpOnly: true,
      secure: true,
      path: "/api/user/refresh-token",
      sameSite: "strict",
    });
    res
      .status(HttpStatus.OK)
      .json({ success: true, message: "Logged out successfully" });
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const userData = await this._userService.getProfile(userId);
      if (!userData) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: HttpResponse.USER_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, userData });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      await this._userService.updateProfile(userId, req.body, req.file);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.PROFILE_UPDATED });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async bookAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { docId, slotDate, slotTime } = req.body;
      const userId = (req as any).userId;

      const user = await this._userService.getUserById(userId);
      const doctor = await this._userService.getDoctorById(docId);

      const appointmentData = {
        userId,
        docId,
        slotDate,
        slotTime,
        userData: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        docData: {
          name: doctor.name,
          speciality: doctor.speciality,
        },
        amount:doctor.fees,
        date: Date.now(),
      };

      await this._userService.bookAppointment(appointmentData);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.APPOINTMENT_BOOKED });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async listAppointment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const appointments = await this._userService.listUserAppointments(userId);
      res.status(HttpStatus.OK).json({ success: true, appointments });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      // console.log(userId)
      const { appointmentId } = req.params;
      // console.log(appointmentId);
      await this._userService.cancelAppointment(userId, appointmentId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.APPOINTMENT_CANCELLED });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async paymentRazorpay(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      // console.log(userId)
      if(!userId){
        console.log("user id required")
      }
      const { appointmentId } = req.body;
      // console.log(appointmentId)
          if (!appointmentId) {
            console.log("Ap id reqrd")
       res.status(400).json({ success: false, message: "Appointment ID is required" });
       return
    }

      const { order } = await this._userService.startPayment(
        userId,
        appointmentId
      );
      res.status(HttpStatus.OK).json({ success: true, order });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async verifyRazorpay(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { appointmentId, razorpay_order_id } = req.body;
      await this._userService.verifyPayment(
        userId,
        appointmentId,
        razorpay_order_id
      );
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.PAYMENT_SUCCESS });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
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

}
