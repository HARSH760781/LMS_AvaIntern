import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import {
  testGoogleDriveConnection,
  uploadToGoogleDrive,
  deleteFromGoogleDrive,
} from "./middleware/googleDriveUpload.js";

async function testGoogleDriveUpload() {
  console.log("🚀 Google Drive Upload Test\n");
  console.log("=".repeat(60));

  // Step 0: Check environment
  console.log("0️⃣ Environment Check:");
  console.log(
    `   📁 Folder ID from .env: ${
      process.env.GOOGLE_DRIVE_FOLDER_ID || "Not set"
    }`
  );
  console.log(`   🌐 Node Environment: ${process.env.NODE_ENV || "Not set"}`);

  if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
    console.error("\n❌ GOOGLE_DRIVE_FOLDER_ID not set in .env");
    console.log("   Please add: GOOGLE_DRIVE_FOLDER_ID=0AJleOSAouJSZUk9PVA");
    return;
  }

  // Step 1: Test connection
  console.log("\n1️⃣ Testing Google Drive connection...");
  const connected = await testGoogleDriveConnection();

  if (!connected) {
    console.log("\n❌ Cannot proceed without Google Drive connection");
    console.log("\n🔧 Next steps:");
    console.log(
      "   1. Go to: https://console.cloud.google.com/apis/library/drive.googleapis.com"
    );
    console.log("   2. Select project: key-petal-459807-q6");
    console.log('   3. Click "ENABLE"');
    console.log("   4. Wait 2 minutes and try again");
    return;
  }

  // Step 2: Create test file
  console.log("\n2️⃣ Creating test file...");
  const testDir = "temp-test-files";

  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
    console.log(`   Created directory: ${testDir}`);
  }

  const testFileName = `test-file-${Date.now()}.txt`;
  const testFilePath = path.join(testDir, testFileName);

  const testContent = `Test file for Google Drive upload
Created: ${new Date().toISOString()}
Project: Learning Management System
Service Account: pdf-upload@key-petal-459807-q6.iam.gserviceaccount.com
Folder ID: ${process.env.GOOGLE_DRIVE_FOLDER_ID}
`;

  fs.writeFileSync(testFilePath, testContent);
  console.log(`✅ Test file created: ${testFileName}`);
  console.log(`   Path: ${testFilePath}`);
  console.log(`   Size: ${fs.statSync(testFilePath).size} bytes`);

  // Step 3: Upload to Google Drive
  console.log("\n3️⃣ Uploading to Google Drive...");
  console.log(
    `   Folder: https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_FOLDER_ID}`
  );

  try {
    const result = await uploadToGoogleDrive(
      testFilePath,
      testFileName,
      "text/plain"
    );

    console.log("\n✅ UPLOAD SUCCESSFUL!");
    console.log("=".repeat(40));
    console.log(`📄 File: ${result.fileName}`);
    console.log(`🔑 File ID: ${result.fileId}`);
    console.log(`📊 File Size: ${result.fileSize || "Unknown"} bytes`);
    console.log(`🔗 Preview URL: ${result.previewUrl}`);
    console.log(`📥 Download URL: ${result.downloadUrl}`);

    // Step 4: Cleanup local file
    console.log("\n4️⃣ Cleaning up local file...");
    fs.unlinkSync(testFilePath);
    console.log(`   Deleted: ${testFilePath}`);

    // Remove directory if empty
    if (fs.existsSync(testDir) && fs.readdirSync(testDir).length === 0) {
      fs.rmdirSync(testDir);
      console.log(`   Removed empty directory: ${testDir}`);
    }

    // Step 5: Optional - Delete from Google Drive (for testing)
    console.log("\n5️⃣ Optional - Test deletion (enter Y to delete):");

    // For terminal input
    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Delete test file from Google Drive? (y/N): ",
      async (answer) => {
        if (answer.toLowerCase() === "y") {
          try {
            await deleteFromGoogleDrive(result.fileId);
            console.log("✅ Test file deleted from Google Drive");
          } catch (deleteError) {
            console.error("❌ Failed to delete:", deleteError.message);
          }
        } else {
          console.log("✅ Test file preserved in Google Drive");
          console.log(`   You can view it at: ${result.previewUrl}`);
        }

        rl.close();

        console.log("\n🎉 ALL TESTS PASSED!");
        console.log("\n💡 Your Google Drive setup is working correctly!");
        console.log(
          "   You can now use the upload route with your application."
        );
        console.log(
          "\n📁 Folder URL: https://drive.google.com/drive/folders/" +
            process.env.GOOGLE_DRIVE_FOLDER_ID
        );
      }
    );
  } catch (error) {
    console.error("\n❌ UPLOAD FAILED:", error.message);

    // Cleanup on error
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log(`   Cleaned up: ${testFilePath}`);
    }

    console.log("\n🔧 Troubleshooting Checklist:");
    console.log(
      "1. ✅ Folder shared with service account: pdf-upload@key-petal-459807-q6.iam.gserviceaccount.com"
    );
    console.log('2. ✅ Service account has "Content manager" access');
    console.log("3. ❓ Is Google Drive API enabled?");
    console.log(
      "   Check: https://console.cloud.google.com/apis/library/drive.googleapis.com"
    );
    console.log("4. ❓ Are you using the correct project?");
    console.log("   Current project: key-petal-459807-q6");
    console.log("5. ❓ Folder exists?");
    console.log(
      "   Check: https://drive.google.com/drive/folders/0AJleOSAouJSZUk9PVA"
    );

    // Detailed error info
    if (error.code) {
      console.log(`\n🔍 Error Details:`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Message: ${error.message}`);
    }
  }
}

// Run test
testGoogleDriveUpload().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
