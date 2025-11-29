import express from "express";
import multer from "multer";
import { uploadTestFile } from "../controllers/testUploadController.js";
import TestUpload from "../models/UploadTest.js";
import { adminAuthMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploadTest/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload new test
router.post(
  "/upload",
  adminAuthMiddleware,
  upload.single("excelFile"),
  uploadTestFile
);

// Fetch all tests of a course
router.get("/testuploads", async (req, res) => {
  try {
    const { courseTitle } = req.query;
    if (!courseTitle)
      return res.status(400).json({ message: "courseTitle required" });

    const courseDoc = await TestUpload.findOne({
      courseTitle: courseTitle.trim(),
    });

    if (!courseDoc) return res.json([]);

    return res.json(courseDoc.tests || []);
  } catch (error) {
    console.error("Fetch Tests Error:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

// Fetch single test inside a course
router.get("/single/:courseTitle/:testId", async (req, res) => {
  try {
    const { courseTitle, testId } = req.params;
    console.log(courseTitle, testId);

    const courseDoc = await TestUpload.findOne({
      courseTitle: courseTitle.trim(),
    });

    if (!courseDoc)
      return res.status(404).json({ message: "Course not found" });

    const test = courseDoc.tests.id(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    console.log("test", test);

    return res.json(test);
  } catch (error) {
    console.error("Error fetching test:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

router.get("/meta/:id", async (req, res) => {
  try {
    const course = await TestUpload.findOne(
      { "tests._id": req.params.id },
      { "tests.$": 1 }
    );

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });

    const test = course.tests[0];

    res.json({
      success: true,
      test: {
        title: test.testName,
        duration: test.duration,
        totalQuestions: test.totalQuestion,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/extract/:id", async (req, res) => {
  try {
    const course = await TestUpload.findOne(
      { "tests._id": req.params.id },
      { "tests.$": 1 }
    );

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });

    const test = course.tests[0];
    if (!test.file || !test.file.path)
      return res
        .status(400)
        .json({ success: false, message: "No file stored" });

    // Parse Excel → Convert to questions[]
    const XLSX = await import("xlsx");
    const workbook = XLSX.readFile(test.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const questions = rows.map((r) => ({
      question: r.Question,
      options: [r.OptionA, r.OptionB, r.OptionC, r.OptionD],
      correct: r.Correct,
    }));

    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
