import express from "express";
import multer from "multer";
import Test from "../models/Test.js";
import User from "../models/User.js";
import UserResults from "../models/TestResult.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import * as xlsx from "xlsx";

const router = express.Router();
const upload = multer(); // in-memory storage

// ----------------- UPLOAD TEST -----------------
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { college, branch, title, topic, duration, startTime, endTime } =
      req.body;
    const file = req.file;

    if (
      !college ||
      !branch ||
      !title ||
      !topic ||
      !duration ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!file)
      return res.status(400).json({ message: "Excel file is required" });

    const test = await Test.create({
      college,
      branch,
      title,
      topic,
      duration: parseInt(duration),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      file: {
        data: file.buffer,
        contentType: file.mimetype,
        fileName: file.originalname,
      },
      createdBy: "Admin",
    });

    res.status(201).json({ success: true, testId: test._id, test });
  } catch (err) {
    console.error("❌ Error creating test:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ----------------- FETCH TESTS -----------------
router.get("/", async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.json({ success: true, tests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- FETCH USER TESTS -----------------
router.get("/user-tests", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const college = user.college || user.collegeName || user.institute;
    const branch = user.branch || user.branchName || user.department;

    if (!college || !branch)
      return res.status(400).json({ message: "User profile incomplete" });

    const tests = await Test.find({ college, branch });
    res.json({ success: true, tests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- EXTRACT QUESTIONS -----------------
router.get("/extract/:id", authMiddleware, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || !test.file || !test.file.data) {
      return res.status(404).json({ message: "Test or Excel file not found" });
    }

    const workbook = xlsx.read(test.file.data, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const questions = rows.map((row) => ({
      question: row.Question || row.Questions || "",
      options: [
        row.OptionA || row.A || "",
        row.OptionB || row.B || "",
        row.OptionC || row.C || "",
        row.OptionD || row.D || "",
      ],
      correct:
        row.Answer || row.Correct || row.correct || row.RightOption || null,
    }));

    res.json({ success: true, questions });
  } catch (err) {
    console.error("❌ Extract error:", err);
    res
      .status(500)
      .json({ message: "Error extracting questions", error: err.message });
  }
});

// ----------------- FETCH METADATA -----------------
router.get("/meta/:id", async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).select("-file");
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json({ success: true, test });
  } catch (err) {
    console.error("❌ Error fetching metadata:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- DOWNLOAD EXCEL FILE -----------------
router.get("/download/:id", async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || !test.file)
      return res.status(404).json({ message: "Test not found" });

    res.set("Content-Type", test.file.contentType);
    res.set(
      "Content-Disposition",
      `attachment; filename=${test.file.fileName}`
    );
    res.send(test.file.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- DELETE TEST -----------------
router.delete("/:id", async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json({ success: true, message: "Test deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- UPDATE TEST STATUS -----------------
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = [
      "scheduled",
      "active",
      "completed",
      "cancelled",
      "paused",
    ];
    if (!status || !allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status", allowedStatuses });
    }

    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!test) return res.status(404).json({ message: "Test not found" });

    res.json({
      success: true,
      message: `Test status updated to ${status}`,
      test,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error while updating test",
      error: err.message,
    });
  }
});

// Submit test (store score & answers)
// ----------------- SUBMIT TEST -----------------
router.post("/submit/:id", authMiddleware, async (req, res) => {
  try {
    const { answers, score, total } = req.body;
    const testId = req.params.id;
    const userId = req.user.id;

    // Check if user has already taken this test
    const existingResult = await UserResults.findOne({
      user: userId,
      "tests.test": testId,
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: "You have already taken this test",
        alreadyTaken: true,
      });
    }

    // Find or create user results
    let userResults = await UserResults.findOne({ user: userId });

    if (!userResults) {
      userResults = new UserResults({
        user: userId,
        tests: [{ test: testId, answers, score, total }],
      });
    } else {
      // Add new test result
      userResults.tests.push({ test: testId, answers, score, total });
    }

    await userResults.save();

    res.json({
      success: true,
      message: "Test submitted successfully",
      userResults,
    });
  } catch (err) {
    console.error("❌ Submit test error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ----------------- CHECK TEST ELIGIBILITY -----------------
router.get("/check-eligibility/:id", authMiddleware, async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.user.id;

    // Check if user has already taken this test
    const existingResult = await UserResults.findOne({
      user: userId,
      "tests.test": testId,
    });

    if (existingResult) {
      return res.json({
        eligible: false,
        message: "You have already taken this test",
        alreadyTaken: true,
      });
    }

    // Check if test exists and is active
    const test = await Test.findById(testId);
    if (!test) {
      return res.json({
        eligible: false,
        message: "Test not found",
      });
    }

    // Check if test is currently active (within time window)
    const now = new Date();
    if (now < test.startTime) {
      return res.json({
        eligible: false,
        message: "Test has not started yet",
      });
    }

    if (now > test.endTime) {
      return res.json({
        eligible: false,
        message: "Test has ended",
      });
    }

    res.json({
      eligible: true,
      message: "You can take this test",
      test: {
        title: test.title,
        duration: test.duration,
        startTime: test.startTime,
        endTime: test.endTime,
      },
    });
  } catch (err) {
    console.error("❌ Check eligibility error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin: Get all test results
router.get("/results", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const results = await UserResults.find()
      .populate("user", "fullName email")
      .populate("test", "title college");

    res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
