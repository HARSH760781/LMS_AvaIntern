// routes/programRoutes.js
import express from "express";
import multer from "multer";
import ProgrammingUploads from "../models/ProgramingUploads.js";

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// ======================
// 1. GET all uploads for a course
// ======================
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

    // Return metadata only (not file data)
    const result = data.map((program) => ({
      _id: program._id,
      courseTitle: program.courseTitle,
      files: program.files.map((f) => ({
        _id: f._id,
        fileName: f.fileName,
        originalName: f.originalName,
        contentType: f.contentType,
        fileSize: f.fileSize,
        uploadedAt: f.createdAt,
      })),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================
// 2. UPLOAD FILES - SIMPLE & WORKING
// ======================
router.post(
  "/upload-program",
  upload.array("programFiles"),
  async (req, res) => {
    try {
      console.log("Upload request received");
      console.log("Files:", req.files?.length || 0);
      console.log("Course Title:", req.body.courseTitle);

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const { courseTitle } = req.body;
      if (!courseTitle) {
        return res.status(400).json({
          success: false,
          message: "courseTitle is required",
        });
      }

      // Convert files to Base64
      const fileDocs = req.files.map((file) => {
        // Check if file.buffer exists and has content
        if (!file.buffer || file.buffer.length === 0) {
          throw new Error(`File ${file.originalname} is empty`);
        }

        return {
          fileName: `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`,
          originalName: file.originalname,
          fileData: file.buffer.toString("base64"), // Convert to Base64
          contentType: file.mimetype || "application/octet-stream",
          fileSize: file.size,
        };
      });

      // Find existing or create new
      let program = await ProgrammingUploads.findOne({ courseTitle });

      if (program) {
        program.files.push(...fileDocs);
      } else {
        program = new ProgrammingUploads({
          courseTitle,
          files: fileDocs,
        });
      }

      await program.save();

      res.status(201).json({
        success: true,
        message: `${fileDocs.length} file(s) uploaded successfully`,
        data: {
          _id: program._id,
          courseTitle: program.courseTitle,
          files: program.files.slice(-fileDocs.length).map((f) => ({
            _id: f._id,
            originalName: f.originalName,
            fileSize: f.fileSize,
            contentType: f.contentType,
          })),
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Upload failed",
      });
    }
  }
);

// ======================
// 3. GET FILE BY ID - Serve from MongoDB (Base64)
// ======================
router.get("/file/:uploadId/:fileId", async (req, res) => {
  try {
    const { uploadId, fileId } = req.params;

    console.log(`Fetching file: uploadId=${uploadId}, fileId=${fileId}`);

    const program = await ProgrammingUploads.findById(uploadId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Upload not found",
      });
    }

    const file = program.files.find((f) => f._id.toString() === fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Convert Base64 back to Buffer
    const fileBuffer = Buffer.from(file.fileData, "base64");

    // Set headers
    res.set({
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Length": fileBuffer.length,
      "Content-Disposition": `inline; filename="${file.originalName}"`,
    });

    // Send file
    res.send(fileBuffer);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});

// ======================
// 4. ALTERNATIVE: Get file by courseTitle + fileId (for backward compatibility)
// ======================
router.get("/file-old/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { courseTitle } = req.query;

    if (!courseTitle) {
      return res.status(400).json({
        success: false,
        message: "courseTitle is required",
      });
    }

    const program = await ProgrammingUploads.findOne({ courseTitle });
    if (!program) {
      return res.status(404).json({
        success: false,
        message: `Course "${courseTitle}" not found`,
      });
    }

    const file = program.files.find((f) => f._id.toString() === fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: `File not found`,
      });
    }

    // Convert Base64 back to Buffer
    const fileBuffer = Buffer.from(file.fileData, "base64");

    res.set({
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Length": fileBuffer.length,
      "Content-Disposition": `inline; filename="${file.originalName}"`,
    });

    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/file/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { courseTitle } = req.query;

    if (!courseTitle) {
      return res.status(400).json({
        success: false,
        message: "courseTitle query parameter is required",
      });
    }

    // Find course upload
    const program = await ProgrammingUploads.findOne({ courseTitle });
    if (!program) {
      return res.status(404).json({
        success: false,
        message: `Course "${courseTitle}" not found`,
      });
    }

    // Find file
    const file = program.files.find((f) => f._id.toString() === fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: `File not found`,
      });
    }

    // Convert Base64 to Buffer
    const fileBuffer = Buffer.from(file.fileData, "base64");

    res.set({
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Length": fileBuffer.length,
      "Content-Disposition": `inline; filename="${file.originalName}"`,
      "Cache-Control": "private, max-age=3600",
    });

    res.send(fileBuffer);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// ======================
// 5. DELETE FILE
// ======================
router.delete("/:uploadId/:fileId", async (req, res) => {
  try {
    const { uploadId, fileId } = req.params;

    await ProgrammingUploads.updateOne(
      { _id: uploadId },
      { $pull: { files: { _id: fileId } } }
    );

    res.json({ success: true, message: "File deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
