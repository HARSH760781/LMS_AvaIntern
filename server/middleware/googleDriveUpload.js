import { google } from "googleapis";
import path from "path";
import fs from "fs";
import multer from "multer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Debug: Check environment
console.log("🔧 Environment check:");
console.log(`   GOOGLE_DRIVE_FOLDER_ID: ${process.env.GOOGLE_DRIVE_FOLDER_ID}`);
console.log("");

// Load credentials from JSON file
const CREDENTIALS_PATH = path.resolve("config", "google-service-account1.json");

if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error(`❌ Credentials file not found at: ${CREDENTIALS_PATH}`);
  throw new Error("Google Drive credentials file not found");
}

let credentials;
try {
  credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  console.log(`✅ Loaded credentials for: ${credentials.client_email}`);
  console.log(`   Project ID: ${credentials.project_id}`);
} catch (error) {
  console.error(`❌ Failed to parse credentials: ${error.message}`);
  throw new Error("Invalid credentials file format");
}

// Initialize Google Drive API with proper scopes
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.appdata",
  ],
});

const drive = google.drive({
  version: "v3",
  auth: auth,
});

// Configure multer for local temp storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "temp-uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    // Clean filename
    const cleanName = baseName.replace(/[^a-zA-Z0-9]/g, "-");
    cb(null, `${uniqueSuffix}-${cleanName}${ext}`);
  },
});

export const uploadArray = multer({
  storage: storage,
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
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Allowed: PDF, DOC, PPT, TXT, Images`
        ),
        false
      );
    }
  },
}).array("files", 10);

// Upload to Google Drive
export const uploadToGoogleDrive = async (filePath, originalName, mimeType) => {
  try {
    console.log(`📤 Uploading to Google Drive: ${originalName}`);
    console.log(`📁 Target folder ID: ${process.env.GOOGLE_DRIVE_FOLDER_ID}`);
    console.log(`👤 Service Account: ${credentials.client_email}`);

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId || folderId === "your_actual_folder_id_here") {
      throw new Error("Please set GOOGLE_DRIVE_FOLDER_ID in .env file");
    }

    // Check if file exists locally
    if (!fs.existsSync(filePath)) {
      throw new Error(`Local file not found: ${filePath}`);
    }

    const fileMetadata = {
      name: originalName,
      parents: [folderId],
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    };

    console.log("⏳ Creating file in Drive...");

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, name, size, mimeType, webViewLink, webContentLink",
      supportsAllDrives: true, // CRITICAL for shared folders
    });

    console.log(
      `✅ File created: ${response.data.name} (ID: ${response.data.id})`
    );

    // Make file publicly accessible
    console.log("🔗 Setting public permissions...");
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true, // CRITICAL for shared folders
    });

    // Generate URLs
    const previewUrl = `https://drive.google.com/file/d/${response.data.id}/preview`;
    const downloadUrl = `https://drive.google.com/uc?id=${response.data.id}&export=download`;

    console.log(`🔗 Preview URL: ${previewUrl}`);

    return {
      fileId: response.data.id,
      fileName: response.data.name,
      previewUrl: previewUrl,
      downloadUrl: downloadUrl,
      directViewUrl: response.data.webViewLink,
      fileSize: response.data.size,
      mimeType: response.data.mimeType,
    };
  } catch (error) {
    console.error("❌ Error uploading to Google Drive:", error.message);
    console.error("Error code:", error.code);

    // Detailed error analysis
    if (error.code === 404) {
      console.error("\n🔍 404 Error - Possible causes:");
      console.error("   1. Folder doesn't exist OR");
      console.error(
        "   2. Service account doesn't have access (even if shared)"
      );
      console.error("   3. Drive API not enabled for this project");
      console.error("   4. Wrong folder ID");
      console.error("\n✅ Solution steps:");
      console.error(
        "   1. Enable Drive API: https://console.cloud.google.com/apis/library/drive.googleapis.com"
      );
      console.error("   2. Check folder sharing again");
      console.error("   3. Try with 'supportsAllDrives: true' parameter");
    }

    if (error.code === 403) {
      console.error("\n🔍 403 Error - Permission denied");
      console.error("   1. Check if Drive API is enabled");
      console.error("   2. Check service account permissions in IAM");
      console.error("   3. Try different authentication scopes");
    }

    throw error;
  }
};

// Delete from Google Drive
export const deleteFromGoogleDrive = async (fileId) => {
  try {
    console.log(`🗑️ Deleting file ${fileId} from Google Drive...`);

    await drive.files.delete({
      fileId: fileId,
      supportsAllDrives: true,
    });

    console.log(`✅ Deleted file ${fileId} from Google Drive`);
  } catch (error) {
    console.error("❌ Error deleting from Google Drive:", error.message);
    throw error;
  }
};

// Test function to verify connection
export const testGoogleDriveConnection = async () => {
  try {
    console.log("🔍 Testing Google Drive connection...");
    console.log(`👤 Service Account: ${credentials.client_email}`);

    // Simple API call to test authentication
    const about = await drive.about.get({
      fields: "user, storageQuota, maxUploadSize",
    });

    console.log("✅ Google Drive connection successful!");
    console.log(`   Account: ${about.data.user.emailAddress}`);

    if (about.data.storageQuota && about.data.storageQuota.limit) {
      console.log(
        `   💾 Storage: ${(about.data.storageQuota.limit / 1e9).toFixed(
          2
        )} GB total`
      );
    }

    if (about.data.maxUploadSize) {
      console.log(
        `   📁 Max upload: ${(about.data.maxUploadSize / 1e9).toFixed(2)} GB`
      );
    }

    return true;
  } catch (error) {
    console.error("❌ Google Drive connection failed:", error.message);
    console.error("Error code:", error.code);

    if (error.code === 403) {
      console.error("\n🔧 Fix: Enable Drive API:");
      console.error(
        "   Go to: https://console.cloud.google.com/apis/library/drive.googleapis.com"
      );
      console.error("   Click 'ENABLE'");
      console.error("   Wait 2-3 minutes");
    }

    return false;
  }
};
