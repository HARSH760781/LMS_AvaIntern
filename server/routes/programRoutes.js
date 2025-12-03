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
const UPLOAD_FOLDER = "uploads/programs";

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
    // Use simple filename: timestamp-originalname
    // Remove spaces and special characters for safety
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
    console.error(err);
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

// GET: Serve an uploaded file by subdocument _id
router.get("/file/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    // console.log("=== File Request Debug ===");
    // console.log("File ID:", fileId);
    // console.log("Upload Folder:", UPLOAD_FOLDER);

    // Use projection to get only the needed file, not entire document
    const result = await ProgrammingUploads.findOne(
      { "files._id": fileId },
      {
        "files.$": 1, // Get only the matching file
        courseTitle: 1,
      }
    );

    if (!result || !result.files || result.files.length === 0) {
      // console.log("❌ File not found in database");
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const file = result.files[0];
    // console.log("✅ File found:", {
    //   fileName: file.fileName,
    //   filePath: file.filePath,
    //   originalName: file.originalName,
    // });

    // Construct path: UPLOAD_FOLDER + filename
    const filePath = path.join(UPLOAD_FOLDER, file.filePath || file.fileName);
    // console.log("Constructed path:", filePath);
    // console.log("Absolute path:", path.resolve(filePath));

    if (!fs.existsSync(filePath)) {
      // console.log("❌ File not found on disk:", filePath);

      // Try alternative: just the filename
      const altPath = path.join(UPLOAD_FOLDER, file.fileName);
      // console.log("Trying alternative path:", altPath);

      if (fs.existsSync(altPath)) {
        // console.log("✅ Found file at alternative path");
        return res.sendFile(path.resolve(altPath));
      }

      return res.status(404).json({
        success: false,
        message: "File does not exist on server",
      });
    }

    // console.log("✅ Sending file...");
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    // console.error("❌ Error serving file:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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

export default router;
