import { Request, Response, NextFunction } from "express";
import multer, { StorageEngine } from "multer";

const storage: StorageEngine = multer.diskStorage({
  filename: function (req: Request, file, callback) {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage });

export default upload;
