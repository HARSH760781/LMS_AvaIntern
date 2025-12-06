import express from "express";
import LearningMaterial from "../models/LearningMaterial.js";
import { adminAuthMiddleware } from "../middleware/authMiddleware.js";
import {
  uploadArray,
  uploadToGoogleDrive,
  deleteFromGoogleDrive,
} from "../middleware/googleDriveUpload.js"; // Changed from cloudinary upload
import fs from "fs";

const router = express.Router();

// ================= UPLOAD ROUTE ===================
router.post(
  "/",
  adminAuthMiddleware,
  (req, res, next) => {
    // Handle multer upload errors
    uploadArray(req, res, function (err) {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              message: "File too large. Maximum size is 50MB",
            });
          }
          if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
              message: "Too many files. Maximum is 10 files per request",
            });
          }
        }
        return res.status(400).json({
          message: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    console.log("=== GOOGLE DRIVE UPLOAD START ===");

    try {
      const { courseTitle, topics } = req.body;

      if (!courseTitle || !topics) {
        return res.status(400).json({
          message: "Course title and topics are required",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "At least one file is required",
        });
      }

      // Parse topics JSON
      let parsedTopics;
      try {
        parsedTopics = JSON.parse(topics);
      } catch (e) {
        return res.status(400).json({
          message: "Invalid topics JSON",
          error: e.message,
        });
      }

      console.log(`📚 Course: ${courseTitle}`);
      console.log(`📁 Files received: ${req.files.length}`);

      // UPLOAD TO GOOGLE DRIVE
      const fileMap = {};

      for (const file of req.files) {
        console.log(`📤 Uploading to Google Drive: ${file.originalname}`);

        try {
          // Upload to Google Drive
          const uploadResult = await uploadToGoogleDrive(
            file.path,
            file.originalname,
            file.mimetype
          );

          // Store in fileMap with original filename as key
          fileMap[file.originalname] = {
            previewUrl: uploadResult.previewUrl,
            downloadUrl: uploadResult.downloadUrl,
            directViewUrl: uploadResult.directViewUrl,
            fileId: uploadResult.fileId,
            fileSize: uploadResult.fileSize,
            mimeType: uploadResult.mimeType,
          };

          // Clean up temp file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`🗑️ Cleaned temp file: ${file.path}`);
          }

          console.log(
            `✅ Uploaded ${file.originalname} → ${uploadResult.fileId}`
          );
        } catch (uploadError) {
          console.error(
            `❌ Failed to upload ${file.originalname}:`,
            uploadError.message
          );

          // Clean up all temp files on error
          req.files.forEach((f) => {
            if (fs.existsSync(f.path)) {
              fs.unlinkSync(f.path);
            }
          });

          return res.status(500).json({
            message: `Failed to upload ${file.originalname}`,
            error: uploadError.message,
          });
        }
      }

      // Attach materials to sub-topics
      parsedTopics.forEach((topic) => {
        topic.subTopics.forEach((subTopic) => {
          subTopic.materials = [];

          if (Array.isArray(subTopic.fileNames)) {
            console.log(
              `🔍 Looking for files in sub-topic "${subTopic.subTopicTitle}":`
            );

            subTopic.fileNames.forEach((fileName) => {
              // Try to find the file (case-insensitive)
              let fileData = fileMap[fileName];

              if (!fileData) {
                // Try case-insensitive search
                const lowerFileName = fileName.toLowerCase();
                for (const [key, value] of Object.entries(fileMap)) {
                  if (key.toLowerCase() === lowerFileName) {
                    fileData = value;
                    console.log(`   ✓ Found case-insensitive match: ${key}`);
                    break;
                  }
                }
              }

              if (fileData) {
                subTopic.materials.push({
                  fileName: fileName,
                  fileUrl: fileData.previewUrl, // Google Drive preview URL
                  downloadUrl: fileData.downloadUrl,
                  directViewUrl: fileData.directViewUrl,
                  fileId: fileData.fileId,
                  fileSize: fileData.fileSize,
                  mimeType: fileData.mimeType,
                  uploadedAt: new Date(),
                });
                console.log(`   ✅ Added material: ${fileName}`);
              } else {
                console.warn(`   ⚠️ File not found: "${fileName}"`);
              }
            });
          }

          delete subTopic.fileNames;
        });
      });

      // Save course to MongoDB
      console.log("\n💾 Saving to MongoDB...");

      // Check if course already exists
      let course = await LearningMaterial.findOne({ courseTitle });

      if (!course) {
        // Create new course
        course = new LearningMaterial({
          courseTitle,
          topics: parsedTopics,
          createdBy: req.user.id,
        });

        await course.save();
        console.log(`✅ Created new course: ${courseTitle}`);
      } else {
        // Course exists - merge materials
        console.log(`🔄 Course exists, merging materials...`);

        parsedTopics.forEach((newTopic) => {
          const existingTopic = course.topics.find(
            (t) => t.topicTitle === newTopic.topicTitle
          );

          if (!existingTopic) {
            // Add new topic
            course.topics.push(newTopic);
            console.log(`   ➕ Added new topic: ${newTopic.topicTitle}`);
          } else {
            // Topic exists, merge sub-topics
            newTopic.subTopics.forEach((newSubTopic) => {
              const existingSubTopic = existingTopic.subTopics.find(
                (st) => st.subTopicTitle === newSubTopic.subTopicTitle
              );

              if (!existingSubTopic) {
                // Add new sub-topic
                existingTopic.subTopics.push(newSubTopic);
                console.log(
                  `   ➕ Added new sub-topic: ${newSubTopic.subTopicTitle}`
                );
              } else {
                // Sub-topic exists, add new materials
                const newMaterialsCount = newSubTopic.materials.length;
                existingSubTopic.materials.push(...newSubTopic.materials);
                console.log(
                  `   ➕ Added ${newMaterialsCount} materials to existing sub-topic`
                );
              }
            });
          }
        });

        await course.save();
        console.log(`✅ Updated existing course: ${courseTitle}`);
      }

      // Count total materials
      const totalMaterials = course.topics.reduce(
        (acc, topic) =>
          acc +
          topic.subTopics.reduce(
            (subAcc, sub) => subAcc + (sub.materials?.length || 0),
            0
          ),
        0
      );

      console.log(`📊 Total materials in course: ${totalMaterials}`);

      res.status(201).json({
        message: "Learning materials uploaded successfully to Google Drive",
        courseId: course._id,
        courseTitle: course.courseTitle,
        filesUploaded: req.files.length,
        totalMaterials: totalMaterials,
        previewLink:
          course.topics[0]?.subTopics[0]?.materials[0]?.previewUrl || null,
        googleDriveFiles: Object.keys(fileMap).map((name) => ({
          name,
          fileId: fileMap[name].fileId,
          previewUrl: fileMap[name].previewUrl,
        })),
      });

      console.log("🎉 UPLOAD COMPLETED SUCCESSFULLY!");
    } catch (error) {
      console.error("❌ UPLOAD ERROR:", error);

      // Clean up any remaining temp files
      if (req.files) {
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
            } catch (cleanupError) {
              console.error(
                `Failed to clean up ${file.path}:`,
                cleanupError.message
              );
            }
          }
        });
      }

      res.status(500).json({
        message: "Server error during upload",
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

// ================= OTHER ROUTES (UNCHANGED) ===================
router.get("/", async (req, res) => {
  try {
    const { courseTitle } = req.query;

    let query = {};
    if (courseTitle) {
      query.courseTitle = { $regex: courseTitle, $options: "i" };
    }

    const courses = await LearningMaterial.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await LearningMaterial.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete material from Google Drive and MongoDB
router.delete(
  "/:courseId/material/:materialId",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const { courseId, materialId } = req.params;

      const course = await LearningMaterial.findById(courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      let fileIdToDelete = null;
      let materialFound = false;

      // Find the material and get its fileId
      for (const topic of course.topics) {
        for (const subTopic of topic.subTopics) {
          const materialIndex = subTopic.materials.findIndex(
            (m) => m._id.toString() === materialId
          );

          if (materialIndex !== -1) {
            fileIdToDelete = subTopic.materials[materialIndex].fileId;
            subTopic.materials.splice(materialIndex, 1);
            materialFound = true;
            break;
          }
        }
        if (materialFound) break;
      }

      if (!materialFound) {
        return res.status(404).json({ message: "Material not found" });
      }

      if (fileIdToDelete) {
        // Delete from Google Drive
        try {
          await deleteFromGoogleDrive(fileIdToDelete);
          console.log(`🗑️ Deleted from Google Drive: ${fileIdToDelete}`);
        } catch (driveError) {
          console.error(
            `Failed to delete from Google Drive:`,
            driveError.message
          );
          // Continue anyway - we still delete from DB
        }
      }

      await course.save();

      res.json({
        message: "Material deleted successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Delete entire course
router.delete("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const course = await LearningMaterial.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get all file IDs to delete from Google Drive
    const fileIds = [];
    course.topics.forEach((topic) => {
      topic.subTopics.forEach((subTopic) => {
        subTopic.materials.forEach((material) => {
          if (material.fileId) {
            fileIds.push(material.fileId);
          }
        });
      });
    });

    // Delete all files from Google Drive
    for (const fileId of fileIds) {
      try {
        await deleteFromGoogleDrive(fileId);
        console.log(`🗑️ Deleted from Google Drive: ${fileId}`);
      } catch (driveError) {
        console.error(`Failed to delete ${fileId}:`, driveError.message);
      }
    }

    // Delete from MongoDB
    await LearningMaterial.findByIdAndDelete(req.params.id);

    res.json({
      message: "Course and all associated files deleted successfully",
      filesDeleted: fileIds.length,
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
