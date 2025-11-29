// controllers/testUploadController.js
import TestUpload from "../models/UploadTest.js";

export const uploadTestFile = async (req, res) => {
  try {
    const { courseTitle, testName, description, subject, topic, duration } =
      req.body;

    if (!courseTitle || !testName || !subject || !topic || !duration) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No Excel file uploaded" });
    }

    const userId = req.user?.id || req.user?.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const normalizedCourseTitle = courseTitle.trim();
    const normalizedTestName = testName.trim();

    // FILE DATA
    const fileSubdoc = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadedBy: userId,
      version: 1,
      isActive: true,
    };

    // Find course
    let courseDoc = await TestUpload.findOne({
      courseTitle: normalizedCourseTitle,
    });

    const newTest = {
      testName: normalizedTestName,
      description,
      subject,
      topic,
      totalQuestion: 0,
      duration: Number(duration),
      file: fileSubdoc,
      version: 1,
      createdBy: userId,
      status: "active",
    };
    if (!courseDoc) {
      // Create new course with first test
      courseDoc = new TestUpload({
        courseTitle: normalizedCourseTitle,
        tests: [newTest],
        lastUpdatedBy: userId,
        currentVersion: 1,
      });

      if (Number(duration) <= 0) {
        return res
          .status(400)
          .json({ message: "Duration must be greater than 0" });
      }

      await courseDoc.save();

      return res.status(201).json({
        message: "Course created and test uploaded successfully",
        courseId: courseDoc._id,
        test: courseDoc.tests[0],
      });
    }

    // COURSE EXISTS → ALWAYS ADD NEW TEST (NO REPLACING)
    courseDoc.tests.push(newTest);
    courseDoc.currentVersion = (courseDoc.currentVersion || 0) + 1;
    courseDoc.lastUpdatedBy = userId;

    await courseDoc.save();

    return res.status(201).json({
      message: "New test added successfully",
      courseId: courseDoc._id,
      test: newTest,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
