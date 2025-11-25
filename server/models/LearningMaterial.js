import mongoose from "mongoose";

// File (material under sub-topic)
const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// Sub-topic
const subTopicSchema = new mongoose.Schema({
  subTopicTitle: { type: String, required: true }, // e.g., "Percentage"
  materials: [fileSchema], // array of files under sub-topic
});

// Topic
const topicSchema = new mongoose.Schema({
  topicTitle: { type: String, required: true }, // e.g., "Math"
  subTopics: [subTopicSchema], // array of sub-topics
});

// Course
const courseSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true }, // e.g., "Aptitude"
    topics: [topicSchema], // array of topics
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("learningmaterial", courseSchema);
