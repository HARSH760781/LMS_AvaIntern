import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/users.js";
import otpRoutes from "./routes/otpRoutes.js";
import adminRoutes from "./routes/admin.js";
import testRoutes from "./routes/testRoutes.js";
import testUploadRoute from "./routes/testUploadRoute.js";
import learningMaterialRoute from "./routes/learningMaterialRoute.js";
import pdfViewerRoute from "./routes/fileServeRoute.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));
app.use("/uploadTest", express.static(path.join(process.cwd(), "uploadTest")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/test", testUploadRoute);
app.use("/api/learning-material", learningMaterialRoute);
app.use("/api/file", pdfViewerRoute);

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
