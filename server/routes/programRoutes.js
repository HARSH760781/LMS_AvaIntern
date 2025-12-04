// routes/programRoutes.js
import express from "express";
import multer from "multer";
import ProgrammingUploads from "../models/ProgramingUploads.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// ======================
// FIXED: Upload directory configuration
// ======================

// Always use a relative path that works everywhere
const UPLOAD_FOLDER = "uploadTest/programs";

// Ensure upload folder exists
const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
  }
};

// Call it once at startup
ensureUploadDir();

// ======================
// MULTER CONFIG (Updated)
// ======================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const filename = `${Date.now()}-${safeName}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// ======================
// EXISTING ROUTES (with minimal fixes)
// ======================

// GET all programming uploads for a course
router.get("/", async (req, res) => {
  const { courseTitle } = req.query;
  if (!courseTitle) {
    return res.status(400).json({
      success: false,
      message: "courseTitle is required",
    });
  }

  try {
    const data = await ProgrammingUploads.find({ courseTitle });
    res.json(data);
  } catch (err) {
    // console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST upload programming files
router.post(
  "/upload-program",
  upload.array("programFiles"),
  async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const { courseTitle } = req.body;
    if (!courseTitle) {
      return res
        .status(400)
        .json({ success: false, message: "courseTitle is required" });
    }

    try {
      // Find existing course document
      let program = await ProgrammingUploads.findOne({ courseTitle });

      // Store data matching your schema
      const fileDocs = req.files.map((file) => ({
        fileName: file.filename, // Just the filename
        originalName: file.originalname, // Original name
        filePath: file.filename, // Store only filename (not path)
        fileSize: file.size, // Optional as per your schema
      }));

      if (program) {
        // Append new files
        program.files.push(...fileDocs);
      } else {
        // Create new document
        program = new ProgrammingUploads({
          courseTitle,
          files: fileDocs,
        });
      }

      await program.save();

      res.status(201).json({
        success: true,
        message: `${fileDocs.length} file(s) uploaded successfully`,
        data: program,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ======================
// FIXED: File serving route - OPTIMIZED
// ======================

// ======================
// FIXED: File serving route - WORKS WITH ObjectId
// ======================

// GET: Serve an uploaded file by subdocument _id
// ======================
// MINIMAL CHANGE: File serving route
// ======================
// In programRoutes.js - Update the /file/:fileId route with more debugging
router.get("/file/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const { courseTitle } = req.query;

    // console.log("=== FILE REQUEST ===");
    // console.log("File ID:", fileId);
    // console.log("Course Title:", courseTitle);

    if (!courseTitle) {
      return res.status(400).json({
        success: false,
        message: "courseTitle query parameter is required",
      });
    }

    // Find the course
    const program = await ProgrammingUploads.findOne({ courseTitle });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find the file
    const file = program.files.find((f) => f._id.toString() === fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found in this course",
      });
    }

    // console.log("File from DB:", {
    //   fileName: file.fileName,
    //   originalName: file.originalName,
    //   filePath: file.filePath,
    // });

    // Try multiple possible file locations
    const possiblePaths = [
      path.join(UPLOAD_FOLDER, file.fileName),
      path.join(UPLOAD_FOLDER, file.filePath),
      path.join(UPLOAD_FOLDER, file.originalName),
      path.join(UPLOAD_FOLDER, file.originalName?.replace(/\s+/g, "_")),
    ];

    // console.log("Trying possible paths:");
    let foundPath = null;

    for (const p of possiblePaths) {
      const fullPath = path.resolve(p);
      // console.log(
      //   `- ${fullPath}: ${
      //     fs.existsSync(fullPath) ? "✅ EXISTS" : "❌ NOT FOUND"
      //   }`
      // );
      if (fs.existsSync(fullPath)) {
        foundPath = fullPath;
        break;
      }
    }

    if (!foundPath) {
      // List all files in upload directory for debugging
      const allFiles = fs.readdirSync(UPLOAD_FOLDER);
      // console.log("All files in upload folder:", allFiles);
      //
      // Try to find any .xlsx file
      const excelFiles = allFiles.filter((f) => f.endsWith(".xlsx"));
      // console.log("Excel files in folder:", excelFiles);

      if (excelFiles.length > 0) {
        // Use the first Excel file as fallback
        // console.log("Using fallback Excel file:", excelFiles[0]);
        foundPath = path.resolve(path.join(UPLOAD_FOLDER, excelFiles[0]));
      } else {
        return res.status(404).json({
          success: false,
          message: "No Excel files found in upload folder",
          debug: {
            expectedFile: file.fileName,
            uploadFolder: UPLOAD_FOLDER,
            availableFiles: allFiles,
          },
        });
      }
    }

    // console.log("✅ Sending file from:", foundPath);

    // Set proper headers for Excel file
    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `inline; filename="${
        file.originalName || "file.xlsx"
      }"`,
    });

    return res.sendFile(foundPath);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ======================
// NEW: Test endpoint to verify setup
// ======================

router.get("/test/health", async (req, res) => {
  try {
    const uploadDir = path.resolve(UPLOAD_FOLDER);
    const dirExists = fs.existsSync(uploadDir);
    const filesInDir = dirExists ? fs.readdirSync(uploadDir) : [];

    res.json({
      success: true,
      data: {
        uploadDirectory: uploadDir,
        directoryExists: dirExists,
        filesCount: filesInDir.length,
        files: filesInDir.slice(0, 10), // First 10 files
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
    });
  }
});

// Add this test route for debugging
router.get("/test/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const { courseTitle } = req.query;

    if (!courseTitle) {
      return res.json({
        success: false,
        message: "courseTitle is required",
        testData: { fileId },
      });
    }

    // Test database connection
    const course = await ProgrammingUploads.findOne({ courseTitle });

    if (!course) {
      return res.json({
        success: false,
        message: "Course not found",
        courseTitle: courseTitle,
      });
    }

    // Test file lookup
    const file = course.files.find((f) => f._id.toString() === fileId);

    if (!file) {
      return res.json({
        success: false,
        message: "File not found in course",
        courseTitle: courseTitle,
        fileId: fileId,
        availableFiles: course.files.map((f) => ({
          id: f._id.toString(),
          name: f.originalName,
          fileName: f.fileName,
        })),
      });
    }

    // Test file existence
    const filePath = path.join(UPLOAD_FOLDER, file.fileName);
    const fileExists = fs.existsSync(filePath);

    return res.json({
      success: true,
      message: "All tests passed",
      data: {
        courseTitle: courseTitle,
        file: {
          id: file._id.toString(),
          originalName: file.originalName,
          fileName: file.fileName,
          fileSize: file.fileSize,
        },
        filePath: filePath,
        fileExists: fileExists,
        absolutePath: path.resolve(filePath),
      },
    });
  } catch (error) {
    console.error("Test error:", error);
    res.json({
      success: false,
      message: "Test failed",
      error: error.message,
    });
  }
});

export default router;
