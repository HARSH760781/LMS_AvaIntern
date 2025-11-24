import UserModel from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
