// server/bin/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// LOAD ENVIRONMENT VARIABLES FIRST
dotenv.config();

// console.log("=== CLOUDINARY CONFIG FROM BIN ===");
// console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("API Key exists:", !!process.env.CLOUDINARY_API_KEY);
// console.log("API Secret exists:", !!process.env.CLOUDINARY_API_SECRET);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
