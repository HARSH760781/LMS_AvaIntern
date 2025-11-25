import express from "express";
import multer from "multer";
import { uploadTestFile } from "../controllers/testUploadController.js";
import UploadTest from "../models/UploadTest.js";
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

router.get("/testuploads", async (req, res) => {
  try {
    const { courseTitle } = req.query;

    if (!courseTitle) {
      return res.status(400).json({ message: "courseTitle required" });
    }

    const tests = await UploadTest.find({
      testName: courseTitle.toLowerCase(),
    });

    res.json(tests);
  } catch (error) {
    console.error("Fetch Tests Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
