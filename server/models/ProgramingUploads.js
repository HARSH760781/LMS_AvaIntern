import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: false },
});

const ProgrammingUploadSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true },
    files: [fileSchema], // ✅ array of files
  },
  { timestamps: true }
);

export default mongoose.model("ProgrammingUpload", ProgrammingUploadSchema);
