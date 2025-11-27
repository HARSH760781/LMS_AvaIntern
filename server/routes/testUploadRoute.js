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

router.get("/single/:id", async (req, res) => {
  try {
    const test = await UploadTest.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Transform data to match frontend expectations

    const transformedTest = {
      _id: test._id,
      testTitle: test.testTitle || test.testName,
      testDescription: test.testDescription || test.description,
      topic: test.topic,
      duration: test.duration,
      totalQuestions: test.totalQuestions || test.totalQuestion,
      difficultyLevel: test.difficultyLevel,
      files: test.files || [],
      // Include any question data that might be stored directly
      questions: test.questions || [],
      questionData: test.questionData || [],
    };

    console.log("Sending test data with fields:", Object.keys(transformedTest));
    res.json(transformedTest);
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
