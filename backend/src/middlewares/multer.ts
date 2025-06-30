import { Request, Response, NextFunction } from "express";
import multer, { StorageEngine } from "multer";

const storage: StorageEngine = multer.diskStorage({
  filename: function (req: Request, file, callback) {
    callback(null, file.originalname);
  },
});

export const upload = multer({ storage });
export const uploadMemory = multer({ storage: multer.memoryStorage() });

export default upload;
