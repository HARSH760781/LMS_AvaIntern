import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import upload from "../middleware/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logoutUser } from "../controllers/authController.js";

const router = express.Router();

// /api/auth/register
router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);

export default router;
