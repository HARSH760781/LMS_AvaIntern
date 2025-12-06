// server/models/LearningMaterial.js
import mongoose from "mongoose";

// File (material under sub-topic) - UPDATED FOR GOOGLE DRIVE
const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Google Drive preview URL
  downloadUrl: { type: String }, // Google Drive download URL
  directViewUrl: { type: String }, // Google Drive direct view URL
  fileId: { type: String }, // Google Drive file ID (replaces cloudinaryId)
  fileSize: { type: Number },
  mimeType: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

// Sub-topic
const subTopicSchema = new mongoose.Schema({
  subTopicTitle: { type: String, required: true },
  materials: [fileSchema], // array of files under sub-topic
});

// Topic
const topicSchema = new mongoose.Schema({
  topicTitle: { type: String, required: true },
  subTopics: [subTopicSchema], // array of sub-topics
});

// Course
const courseSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true },
    topics: [topicSchema], // array of topics
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("LearningMaterial", courseSchema);
