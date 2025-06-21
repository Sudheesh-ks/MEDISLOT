// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET!;
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// export const generateAccessToken = (userId: string) => {
//   return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "15m" });
// };

// export const generateRefreshToken = (userId: string) => {
//   return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
// };

// export const verifyAccessToken = (token: string): { id: string } => {
//   return jwt.verify(token, JWT_SECRET) as { id: string };
// };

// export const verifyRefreshToken = (token: string): { id: string } => {
//   return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
// };


import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

type Role = "user" | "doctor" | "admin";

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

// 👉 Generate Access Token with role
export const generateAccessToken = (id: string, email: string, role: Role) => {
  return jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: "15m" });
};

// 👉 Generate Refresh Token (usually doesn't need role/email)
export const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// 👉 Verify Access Token and return full payload
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

// 👉 Optionally include email/role in refresh if needed
export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
};

