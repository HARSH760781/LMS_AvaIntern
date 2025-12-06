// server/middleware/uploadMiddleware.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../bin/cloudinary.js";

// console.log("Upload middleware loading...");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const timestamp = Date.now();

    const ext = file.originalname.split(".").pop().toLowerCase(); // FIX: keep extension
    const base = file.originalname.replace(/\.[^/.]+$/, ""); // remove extension safely

    // Clean file name
    const safeName = base.replace(/[^a-zA-Z0-9]/g, "-");

    return {
      folder: "learning_materials",
      allowed_formats: ["pdf", "doc", "docx", "ppt", "pptx", "txt"],
      resource_type: "auto",

      // FIXED — Cloudinary will now store filename WITH EXTENSION
      public_id: `material-${timestamp}-${safeName}.${ext}`,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Only PDF, DOC, PPT, TXT allowed.`
        ),
        false
      );
    }
  },
});

export const uploadArray = upload.array("files");
export default upload;
