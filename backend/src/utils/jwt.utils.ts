import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

type Role = "user" | "doctor" | "admin";

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

export const generateAccessToken = (id: string, email: string, role: Role) => {
  return jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
};
