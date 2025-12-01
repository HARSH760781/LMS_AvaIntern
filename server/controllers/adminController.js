import User from "../models/User.js";
import nodemailer from "nodemailer";
import UserResults from "../models/TestResult.js";
import Test from "../models/Test.js";

export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalMentors = await User.countDocuments({ role: "mentor" });

    const activeUsers = await User.countDocuments({
      isOnline: true,
    });

    res.json({
      totalUsers,
      totalStudents,
      totalMentors,
      activeUsers,
    });
  } catch (error) {
    console.error("❌ getUserStats Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// Fetch users by role
export const getUserDetails = async (req, res) => {
  try {
    const role = req.query.role; // "student" or "mentor"
    if (!role) {
      return res
        .status(400)
        .json({ message: "Role query parameter is required" });
    }

    const users = await User.find({ role }).sort({ createdAt: -1 }); // latest first

    res.json(users);
  } catch (error) {
    console.error("❌ getUserDetails Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Send feedback to a user via email
export const sendFeedback = async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res
      .status(400)
      .json({ message: "Email, subject, and message are required." });
  }

  try {
    // Configure Nodemailer transporter (replace with your SMTP credentials)
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or your email service
      auth: {
        user: process.env.EMAIL_USER, // set in your .env
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"AvaIntern Admin" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject,
      text: message,
    });

    res.json({ message: "Feedback sent successfully." });
  } catch (error) {
    console.error("❌ sendFeedback Error:", error.message);
    res
      .status(500)
      .json({ message: "Failed to send feedback.", error: error.message });
  }
};

export const getAllUserResult = async (req, res) => {
  try {
    // 1️⃣ Fetch all students with college and branch info
    const users = await User.find({ role: "student" })
      .select("_id fullName email college branch")
      .lean();

    // 2️⃣ Fetch all user results with test details populated
    const userResults = await UserResults.find()
      .populate("user", "fullName email college branch")
      .populate("tests.test", "title college branch")
      .lean();

    // 3️⃣ Group by college and filter tests by college match
    const colleges = {};

    userResults.forEach((userResult) => {
      if (!userResult.user || !userResult.user.college) return;

      const userCollege = userResult.user.college;
      const userBranch = userResult.user.branch;

      // Filter tests to only include those that match user's college and branch
      const filteredTests = userResult.tests.filter((testEntry) => {
        if (!testEntry.test) return false;
        return (
          testEntry.test.college === userCollege &&
          testEntry.test.branch === userBranch
        );
      });

      if (filteredTests.length === 0) return;

      const testResults = filteredTests.map((testEntry) => ({
        testId: testEntry.test._id,
        testTitle: testEntry.test.title,
        score: testEntry.score,
        total: testEntry.total,
        submittedAt: testEntry.submittedAt,
      }));

      if (!colleges[userCollege]) {
        colleges[userCollege] = [];
      }

      // Check if user already exists in college array
      const existingUser = colleges[userCollege].find(
        (u) => u.userId.toString() === userResult.user._id.toString()
      );

      if (existingUser) {
        // Add tests to existing user
        existingUser.tests.push(...testResults);
      } else {
        // Create new user entry
        colleges[userCollege].push({
          userId: userResult.user._id,
          fullName: userResult.user.fullName,
          email: userResult.user.email,
          college: userCollege,
          branch: userBranch,
          tests: testResults,
        });
      }
    });

    res.json({ success: true, colleges });
  } catch (err) {
    console.error("❌ Fetch all results error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
