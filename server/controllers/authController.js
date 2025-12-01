import UserModel from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email); // Debug log

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ FIXED: Use the schema method to update login time
    await user.updateLoginTime();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    console.log("Login successful, timestamps updated for:", email); // Debug log

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("Logout attempt for user ID:", userId); // Debug log

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ FIXED: Use the schema method to update logout time
    await user.updateLogoutTime();

    console.log("Logout successful, timestamps updated for user ID:", userId); // Debug log

    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      college,
      branch,
      role,
      location,
      phone,
    } = req.body;
    const profileImage = req.file ? req.file.filename : null;

    if (!profileImage) {
      return res.status(400).json({ message: "Please upload an image!" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email is already used by another user" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      fullName,
      email,
      password: hashedPassword,
      college,
      branch,
      role,
      profileImage,
      phone,
      location,
      // ✅ Set initial timestamps
      lastLogin: null,
      lastLogout: null,
      isOnline: false,
    });

    await newUser.save();

    console.log("New user registered:", email); // Debug log

    res.status(200).json({
      success: true,
      message: "Registration successful!",
      user: newUser,
    });
  } catch (error) {
    console.log("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// SEND RESET LINK
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 5 * 60 * 1000; // 5 minutes

    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
<div style="
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: auto;
  padding: 24px;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  background: #fafafa;
">
  
  <!-- Header -->
  <h2 style="margin-bottom: 10px; color: #222; font-weight: 600;">
    Password Reset Request
  </h2>

  <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">
    <span style="color: black;">Ava</span><span style="color: #007bff;">Intern</span>
  </h3>

  <!-- Greeting -->
  <p style="font-size: 16px; color: #444; line-height: 1.6;">
    Hello ${user.fullName || "User"},
  </p>

  <p style="font-size: 15px; color: #555; line-height: 1.6;">
    We received a request to reset the password associated with your AvaIntern account.
    If you initiated this request, you can reset your password securely using the button below.
  </p>

  <!-- Reset Button -->
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetURL}"
      style="
        background-color: #007bff;
        color: white;
        padding: 12px 26px;
        text-decoration: none;
        border-radius: 6px;
        font-size: 16px;
        display: inline-block;
      "
    >
      Reset Password
    </a>
  </div>

  <p style="font-size: 14px; color: #555; line-height: 1.6;">
    This link is valid for <strong>5 minutes</strong>.  
    For security reasons, the link will expire automatically.
  </p>

  <p style="font-size: 14px; color: #777; line-height: 1.6;">
    If you did not request a password reset, you may safely ignore this email.
    Your account remains secure.
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

  <!-- Footer -->
  <p style="font-size: 13px; color: #888; text-align: center; line-height: 1.5;">
    © ${new Date().getFullYear()} AvaIntern. All rights reserved.<br>
    This is an automated message — please do not reply.
  </p>
</div>
`;

    await sendEmail(user.email, "Password Reset Link", message);

    res.json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error sending reset email" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const resetToken = req.params.token;
  const { password } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  try {
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Something went wrong" });
  }
};
