import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

const upload = multer({ storage });

// GET current logged-in user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE user details including profile image
router.put(
  "/me",
  authMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { fullName, phone, location } = req.body; // Changed 'zone' to 'location'

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      // ✅ Prepare update data
      const updateData = {
        fullName: fullName || user.fullName,
        phone: phone || user.phone,
        location: location || user.location, // Make sure this matches your field name
      };

      // Update profile image only if file uploaded
      if (req.file) {
        updateData.profileImage = req.file.filename;
      }

      // ✅ Use the custom method that updates lastUpdated
      await user.updateProfile(updateData);

      // ✅ Send the updated user data with new lastUpdated timestamp
      const updatedUser = await User.findById(req.user.id).select("-password");

      res.json({
        ...updatedUser.toObject(),
        lastUpdated: user.lastUpdated, // Ensure we send the updated timestamp
      });
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).send("Server error");
    }
  }
);

export default router;
