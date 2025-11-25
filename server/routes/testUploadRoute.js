import express from "express";
import multer from "multer";
import { uploadTestFile } from "../controllers/testUploadController.js";
import {
  authMiddleware,
  adminAuthMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploadTest/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post(
  "/upload",
  adminAuthMiddleware, // user must login
  upload.single("excelFile"),
  uploadTestFile
);

export default router;
