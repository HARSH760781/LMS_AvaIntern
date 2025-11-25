// ✅ CORRECT IMPORT - Change this based on your actual file name
import TestUpload from "../models/UploadTest.js";

export const uploadTestFile = async (req, res) => {
  try {
    const { testName, description, subject, topic, duration } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Use req.user.id or req.user.userId based on your auth middleware
    const userId = req.user.id || req.user.userId || req.user._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find existing test
    let test = await TestUpload.findOne({ testName });

    if (!test) {
      // Create new test
      test = new TestUpload({
        testName,
        description,
        subject,
        topic,
        duration: parseInt(duration),
        createdBy: userId,
        files: [
          {
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            uploadedBy: userId,
            version: 1,
            isActive: true,
          },
        ],
        currentVersion: 1,
      });
    } else {
      // Add new file to existing test
      const nextVersion = test.currentVersion + 1;

      test.files.push({
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        uploadedBy: userId,
        version: nextVersion,
        isActive: true,
      });

      test.currentVersion = nextVersion;
      test.lastUpdatedBy = userId;
      test.description = description || test.description;
      test.subject = subject || test.subject;
      test.topic = topic || test.topic;
      test.duration = duration || test.duration;
    }

    await test.save();

    return res.status(200).json({
      message:
        test.files.length === 1
          ? "Test created successfully"
          : "File uploaded successfully",
      test: {
        _id: test._id,
        testName: test.testName,
        totalFiles: test.files.length,
        currentVersion: test.currentVersion,
        files: test.files,
      },
    });
  } catch (error) {
    console.log("Upload error:", error);

    // More specific error handling
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Test name must be unique",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
