import express from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';

dotenv.config();

const authRouter = express.Router();

authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  (req, res) => {
    const user = req.user as any;

    const accessToken = generateAccessToken(user._id, user.email, 'user');
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken_user', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '13-236-136-196.sslip.io',
      path: '/api/user',
      maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE), // 7 days
    });

    // Redirect to the frontend with token
    res.redirect(`${process.env.GOOGLE_REDIRECT_URL}?token=${accessToken}`);
  }
);

export default authRouter;
