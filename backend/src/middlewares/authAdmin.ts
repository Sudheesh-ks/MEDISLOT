import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const atoken = req.headers.atoken as string;

    if (!atoken) {
      res.status(401).json({ success: false, message: "No token provided" });
      return;
    }

    const decoded = jwt.verify(atoken, process.env.JWT_SECRET!) as {
      id: string;
    };

    if (!decoded?.id) {
      res.status(403).json({ success: false, message: "Invalid token" });
      return;
    }

    (req as any).adminId = decoded.id;

    next();
  } catch (error: any) {
    console.log("Auth error:", error);
    res.status(403).json({ success: false, message: "Authentication failed" });
  }
};

export default authAdmin;
