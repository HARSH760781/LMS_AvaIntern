import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/users.js";
import otpRoutes from "./routes/otpRoutes.js";
import adminRoutes from "./routes/admin.js";
import testRoutes from "./routes/testRoutes.js";
import testUploadRoute from "./routes/testUploadRoute.js";
import learningMaterialRoute from "./routes/learningMaterialRoute.js";
import pdfViewerRoute from "./routes/fileServeRoute.js";
import programRoutes from "./routes/programRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "https://avainternlms.in",
      "https://www.avainternlms.in",
      "https://lms-avaintern.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
// Secure headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// Rate limiting (100 requests / 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later",
});
app.use(limiter);

app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));
app.use("/learning-materials", express.static("learning-materials"));
app.use("/uploadTest", express.static(path.join(process.cwd(), "uploadTest")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/test", testUploadRoute);
app.use("/api/learning-material", learningMaterialRoute);
app.use("/api/file", pdfViewerRoute);
app.use("/api/programs", programRoutes);

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
