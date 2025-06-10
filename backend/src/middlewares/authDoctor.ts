import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { HttpStatus } from "../constants/status.constants";
dotenv.config();

// Doctor authentication middleware
const authDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization as string;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({
          success: false,
          message: "Authentication Failed. Login Again",
        });
      return;
    }

    const token = authHeader.split(" ")[1];

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof token_decode === "object" && "id" in token_decode) {
      (req as any).docId = token_decode.id;
      next();
    } else {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: "Invalid token" });
    }
  } catch (error: any) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
