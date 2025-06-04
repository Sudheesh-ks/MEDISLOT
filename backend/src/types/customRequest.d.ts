import { Request } from "express";

export interface CustomRequest extends Request {
  file?: Express.Multer.File;
}
