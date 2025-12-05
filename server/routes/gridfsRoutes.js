// Create a new file: gridfsRoutes.js
import express from "express";
import multer from "multer";
import { GridFSBucket, MongoClient } from "mongodb";
import mongoose from "mongoose";
import ProgrammingUploads from "../models/ProgramingUploads.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GridFS upload
router.post(
  "/upload-gridfs",
  upload.array("programFiles"),
  async (req, res) => {
    try {
      const { courseTitle } = req.body;

      if (!courseTitle || !req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Missing course title or files",
        });
      }

      const db = mongoose.connection.db;
      const bucket = new GridFSBucket(db, {
        bucketName: "programFiles",
      });

      const fileIds = [];

      // Upload each file to GridFS
      for (const file of req.files) {
        const uploadStream = bucket.openUploadStream(file.originalname, {
          metadata: {
            courseTitle,
            originalName: file.originalname,
            contentType: file.mimetype,
            uploadedAt: new Date(),
          },
        });

        // Return a promise for the upload
        const fileId = await new Promise((resolve, reject) => {
          uploadStream.end(file.buffer);
          uploadStream.on("finish", () => {
            resolve(uploadStream.id);
          });
          uploadStream.on("error", reject);
        });

        fileIds.push({
          fileId,
          originalName: file.originalname,
          contentType: file.mimetype,
          size: file.size,
        });
      }

      // Store metadata in your main collection
      let program = await ProgrammingUploads.findOne({ courseTitle });

      const fileDocs = fileIds.map((f) => ({
        fileName: f.originalName,
        originalName: f.originalName,
        fileId: f.fileId, // Store GridFS file ID
        contentType: f.contentType,
        fileSize: f.size,
        storage: "gridfs", // Mark as GridFS storage
      }));

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
        message: `${fileIds.length} file(s) uploaded to GridFS`,
        data: {
          _id: program._id,
          courseTitle,
          files: fileDocs,
        },
      });
    } catch (error) {
      console.error("GridFS upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Download from GridFS
router.get("/download-gridfs/:fileId", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: "programFiles" });

    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(req.params.fileId)
    );

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
