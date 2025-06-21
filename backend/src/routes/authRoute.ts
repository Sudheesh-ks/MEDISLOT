import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils";

dotenv.config();

const authRouter = express.Router();

authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const user = req.user as any;

 const accessToken = generateAccessToken(user._id, user.email, "user");
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken_user", refreshToken, {
      httpOnly: true,
      path: "/api/user/refresh-token",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to the frontend with token
    res.redirect(`${process.env.GOOGLE_REDIRECT_URL}?token=${accessToken}`);
  }
);

export default authRouter;
