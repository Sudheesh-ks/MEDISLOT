import nodemailer from 'nodemailer';

export const sendOTP = async (email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_EMAIL,
            pass: process.env.MAIL_PASSWORD,
        },
    });


    await transporter.sendMail({
        from: process.env.MAIL_EMAIL,
        to: email,
        subject: 'Verify Your Account - OTP Inside',
        html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; color: #333;">Welcome to MediSlot🙏</h2>
            <p style="font-size: 16px; color: #555;">Hi there,</p>
            <p style="font-size: 16px; color: #555;">
                Thank you for registering with us. Please use the following One-Time Password (OTP) to complete your verification process:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #4CAF50; background: #f1f1f1; padding: 15px 30px; border-radius: 8px; letter-spacing: 4px;">
                    ${otp}
                </span>
            </div>
            <p style="font-size: 14px; color: #777;">
                This OTP is valid for ⏰1 minute. Please do not share it with anyone.
            </p>
            <p style="font-size: 14px; color: #777;">If you did not initiate this request, please ignore this email.</p>
            <p style="margin-top: 30px; font-size: 14px; color: #999; text-align: center;">
                &copy; ${new Date().getFullYear()} MediSlot. All rights reserved.
            </p>
        </div>
    </div>
    `
    });

};


