// models/TestUpload.js
import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  // CHANGED: Store file data as Base64 instead of path
  fileData: { type: String, required: true }, // Base64 encoded file
  contentType: { type: String, required: true }, // MIME type
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Each test inside course
const testSchema = new mongoose.Schema({
  testName: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  subject: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  totalQuestion: { type: Number, default: 0 },
  duration: { type: Number, required: true },
  file: fileSchema, // ONE file per test (now stored in MongoDB)
  version: { type: Number, default: 1 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "draft"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
});

// Final document → One per courseTitle
const testUploadSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true, unique: true, trim: true },

    // All tests grouped inside this one document
    tests: [testSchema],

    // Tracking
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    currentVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("TestUpload", testUploadSchema);
