import express from "express";
import twilio from "twilio";

const router = express.Router();

// Twilio setup
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Temporary in-memory store for OTPs
let otpStore = {};

/**
 * Send OTP
 * POST /api/otp/send
 * Body: { phone }
 */
router.post("/send", async (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length !== 10) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid phone number" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = otp;

  try {
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE, // Twilio number
      to: `+91${phone}`, // Add country code
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

/**
 * Verify OTP
 * POST /api/otp/verify
 * Body: { phone, otp }
 */
router.post("/verify", (req, res) => {
  const { phone, otp } = req.body;

  if (otpStore[phone] && otpStore[phone] === otp) {
    delete otpStore[phone]; // Remove after verification
    return res.json({ success: true, message: "OTP verified successfully" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
});

export default router;
