// server/routes/learningMaterialRoute.js
import express from "express";
import multer from "multer";
import LearningMaterial from "../models/LearningMaterial.js";
import { adminAuthMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

import fs from "fs";
import path from "path";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "learning-materials");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created missing folder:", uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "learning-materials/"),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `material-${Date.now()}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"), false);
};

const upload = multer({ storage, fileFilter }).any();

// Upload PDF to an existing course or create new course
router.post("/", adminAuthMiddleware, upload, async (req, res) => {
  try {
    const { courseTitle, topics } = req.body;

    if (!courseTitle || !topics)
      return res
        .status(400)
        .json({ message: "Course title & topics required" });

    // 1️⃣ Parse JSON for topics
    const parsedTopics = JSON.parse(topics);

    // 2️⃣ Map files to subTopics by name
    let fileIndex = 0;
    parsedTopics.forEach((topic) => {
      topic.subTopics.forEach((sub) => {
        sub.materials = []; // initialize files array
        sub.fileNames.forEach((fileName) => {
          const file = req.files[fileIndex];
          sub.materials.push({
            fileName: file.originalname,
            filePath: `learning-materials/${file.filename}`,
          });
          fileIndex++;
        });
        delete sub.fileNames;
      });
    });

    // 3️⃣ Save course
    let course = await LearningMaterial.findOne({ courseTitle });
    if (!course) {
      course = new LearningMaterial({
        courseTitle,
        topics: parsedTopics,
        createdBy: req.user.id,
      });
    } else {
      course.topics.push(...parsedTopics);
    }

    await course.save();
    res.status(201).json({ message: "Course uploaded", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all courses with their materials
router.get("/", async (req, res) => {
  try {
    const courses = await LearningMaterial.find();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
