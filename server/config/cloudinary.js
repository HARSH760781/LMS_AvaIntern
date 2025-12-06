// server/test-cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// console.log("=== CLOUDINARY CONFIG TEST ===");
// console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("API key exists:", !!process.env.CLOUDINARY_API_KEY);
// console.log("API secret exists:", !!process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test upload
const testUpload = async () => {
  try {
    console.log("Testing Cloudinary upload...");
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      { folder: "test_uploads" }
    );
    console.log("✓ Cloudinary upload successful:", result.public_id);
    console.log("URL:", result.secure_url);
  } catch (error) {
    console.error("✗ Cloudinary upload failed:", error.message);
  }
};

testUpload();
