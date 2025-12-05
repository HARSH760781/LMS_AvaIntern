// models/ProgramingUploads.js
import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileData: { type: String, required: true }, // Base64 string
    contentType: { type: String, required: true },
    fileSize: { type: Number, required: true },
  },
  { timestamps: true }
);

const ProgrammingUploadSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true },
    files: [fileSchema],
  },
  { timestamps: true }
);

export default mongoose.model("ProgrammingUpload", ProgrammingUploadSchema);
