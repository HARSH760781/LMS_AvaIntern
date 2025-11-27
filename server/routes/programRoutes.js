// routes/programRoutes.js
import express from "express";
import multer from "multer";
import ProgrammingUploads from "../models/ProgramingUploads.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Ensure upload folder exists
const UPLOAD_FOLDER = path.join("./uploadTest/programs");
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// GET all programming uploads for a course

router.get("/", async (req, res) => {
  const { courseTitle } = req.query;
  // console.log("Incoming courseTitle:", courseTitle);
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

      const fileDocs = req.files.map((file) => ({
        fileName: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
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

// GET: Serve an uploaded file by filename
// GET: Open or Download a file by subdocument _id
// GET: Serve an uploaded file by subdocument _id
router.get("/file/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    // Find the parent document that contains this file
    const parentDoc = await ProgrammingUploads.findOne({ "files._id": fileId });

    if (!parentDoc) return res.status(404).json({ message: "File not found" });

    // Find the specific file in the files array
    const file = parentDoc.files.id(fileId);

    if (!file)
      return res
        .status(404)
        .json({ message: "File not found in parent document" });

    const filePath = path.resolve(file.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File does not exist on server" });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
