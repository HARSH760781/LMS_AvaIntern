// routes/fileServeRoute.js
import express from "express";
import path from "path";
import fs from "fs";
// import { fileURLToPath } from "url";
import LearningMaterial from "../models/LearningMaterial.js";

const router = express.Router();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// secure serve by material fileId
router.get("/material/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { download } = req.query; // optional: ?download=true

    // Find the course containing this file
    const course = await LearningMaterial.findOne({
      "topics.subTopics.materials._id": fileId,
    });

    if (!course) return res.status(404).send("File not found");

    let targetFile;
    course.topics.forEach((t) =>
      t.subTopics.forEach((st) =>
        st.materials.forEach((m) => {
          if (m._id.toString() === fileId) targetFile = m;
        })
      )
    );

    if (!targetFile) return res.status(404).send("File missing");

    const filePath = path.join(
      process.cwd(),
      targetFile.filePath.replace(/^\//, "")
    );

    if (!fs.existsSync(filePath)) return res.status(404).send("Missing file");

    res.setHeader("Content-Type", "application/pdf");

    if (download === "true") {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${targetFile.fileName}"`
      );
    } else {
      res.setHeader("Content-Disposition", "inline");
    }

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Serve uploaded test files from uploadTest directory
// router.get("/:filename", (req, res) => {
//   try {
//     const { filename } = req.params;

//     // Path to your uploadTest directory
//     const filePath = path.join(__dirname, "../uploadTest", filename);

//     console.log("Attempting to serve file:", filePath);

//     res.sendFile(filePath, (err) => {
//       if (err) {
//         console.error("File serve error:", err);
//         res.status(404).json({
//           message: "File not found",
//           path: filePath,
//           filename: filename,
//         });
//       }
//     });
//   } catch (error) {
//     console.error("File serve error:", error);
//     res
//       .status(500)
//       .json({ message: "Error serving file", error: error.message });
//   }
// });

export default router;
