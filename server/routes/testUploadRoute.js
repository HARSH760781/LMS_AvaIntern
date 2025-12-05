import express from "express";
import multer from "multer";
import { uploadTestFile } from "../controllers/testUploadController.js";
import TestUpload from "../models/UploadTest.js";
import { adminAuthMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// CHANGE: Use memory storage for MongoDB
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});
// Upload new test
router.post(
  "/upload",
  adminAuthMiddleware,
  upload.single("excelFile"),
  uploadTestFile
);

router.get("/file/:courseTitle/:testId", async (req, res) => {
  try {
    const { courseTitle, testId } = req.params;

    const courseDoc = await TestUpload.findOne({
      courseTitle: courseTitle.trim(),
    });

    if (!courseDoc) {
      return res.status(404).json({ message: "Course not found" });
    }

    const test = courseDoc.tests.id(testId);
    if (!test || !test.file || !test.file.fileData) {
      return res.status(404).json({ message: "Test or file not found" });
    }

    // Convert Base64 back to Buffer
    const fileBuffer = Buffer.from(test.file.fileData, "base64");

    // Set headers
    res.set({
      "Content-Type":
        test.file.contentType ||
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Length": fileBuffer.length,
      "Content-Disposition": `inline; filename="${test.file.originalName}"`,
      "Cache-Control": "private, max-age=3600",
    });

    return res.send(fileBuffer);
  } catch (error) {
    console.error("File fetch error:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

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

    // Return without fileData (too large)
    const tests = courseDoc.tests.map((test) => ({
      _id: test._id,
      testName: test.testName,
      description: test.description,
      subject: test.subject,
      topic: test.topic,
      totalQuestion: test.totalQuestion,
      duration: test.duration,
      file: {
        filename: test.file.filename,
        originalName: test.file.originalName,
        size: test.file.size,
        contentType: test.file.contentType,
      },
      status: test.status,
      createdAt: test.createdAt,
    }));

    return res.json(tests);
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

    const courseDoc = await TestUpload.findOne({
      courseTitle: courseTitle.trim(),
    });

    if (!courseDoc)
      return res.status(404).json({ message: "Course not found" });

    const test = courseDoc.tests.id(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    // Return without fileData
    const testResponse = {
      _id: test._id,
      testName: test.testName,
      description: test.description,
      subject: test.subject,
      topic: test.topic,
      totalQuestion: test.totalQuestion,
      duration: test.duration,
      file: {
        filename: test.file.filename,
        originalName: test.file.originalName,
        size: test.file.size,
        contentType: test.file.contentType,
      },
      status: test.status,
      createdAt: test.createdAt,
    };

    return res.json(testResponse);
  } catch (error) {
    console.error("Error fetching test:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

// Update extract route for MongoDB
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
    if (!test.file || !test.file.fileData)
      return res
        .status(400)
        .json({ success: false, message: "No file stored in MongoDB" });

    // Convert Base64 to Buffer and parse Excel
    const fileBuffer = Buffer.from(test.file.fileData, "base64");
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const questions = rows.map((r) => ({
      question: r.Question || r.Questions || "",
      options: [
        r.OptionA || "",
        r.OptionB || "",
        r.OptionC || "",
        r.OptionD || "",
      ].filter((opt) => opt !== ""),
      correct: r.Correct || r.CorrectAnswer || 0,
    }));

    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Keep meta route as is
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

export default router;
