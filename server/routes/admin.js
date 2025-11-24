import express from "express";
import User from "../models/User.js";
import UserResults from "../models/TestResult.js";
import Test from "../models/Test.js";

import {
  getUserStats,
  getUserDetails,
  sendFeedback,
  getAllUserResult,
} from "../controllers/adminController.js";
import { adminAuthMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/admin/user-stats
router.get("/user-stats", adminAuthMiddleware, getUserStats);
router.get("/users", adminAuthMiddleware, getUserDetails);
router.post("/send-feedback", adminAuthMiddleware, sendFeedback);
router.get("/all-results", adminAuthMiddleware, getAllUserResult);

// router.get("/user-stats", async (req, res) => {
//   try {
//     // console.log("🔍 Counting users by role...");

//     // Count students and mentors
//     const totalStudents = await User.countDocuments({ role: "student" });
//     const totalMentors = await User.countDocuments({ role: "mentor" });
//     const totalUsers = await User.countDocuments();

//     // console.log(
//     //   `📊 Counts - Students: ${totalStudents}, Mentors: ${totalMentors}, Total: ${totalUsers}`
//     // );

//     res.json({
//       totalStudents,
//       totalMentors,
//       totalUsers: totalStudents + totalMentors, // Calculate total
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user stats:", error);
//     // Return mock data if database fails
//     res.json({
//       totalStudents: 1842,
//       totalMentors: 127,
//       totalUsers: 1969,
//     });
//   }
// });

// GET /api/admin/active-users
// router.get("/active-users", async (req, res) => {
//   try {
//     console.log("👥 Fetching active users...");

//     // Users active in last 15 minutes
//     const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
//     const activeUsers = await User.countDocuments({
//       lastActive: { $gte: fifteenMinutesAgo },
//     });

//     console.log(`✅ Active users: ${activeUsers}`);

//     res.json({ activeUsers });
//   } catch (error) {
//     console.log("Hello");

//     console.error("❌ Error fetching active users:", error);
//     // Return mock data if database fails
//     res.json({ activeUsers: 243 });
//   }
// });

// GET /api/admin/platform-metrics
router.get("/platform-metrics", async (req, res) => {
  try {
    console.log("📊 Fetching platform metrics...");

    // For now, return mock data
    // Later replace with real database queries
    const platformMetrics = {
      coursesPublished: 156,
      assignmentsSubmitted: 2847,
      examsCompleted: 1923,
      averageScore: 83.7,
      satisfactionRate: 94.2,
      completionRate: 87.5,
    };

    console.log("✅ Platform metrics sent");

    res.json(platformMetrics);
  } catch (error) {
    console.error("❌ Error fetching platform metrics:", error);
    res.status(500).json({
      error: "Failed to fetch platform metrics",
      details: error.message,
    });
  }
});

export default router; // Use ES6 export
