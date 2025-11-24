import React, { useState } from "react";

const PhoneInputWithOTP = ({ value, onChange, onVerified }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  // Handle phone input change: only numbers, max 10 digits
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) {
      onChange(val);
      if (verified) setVerified(false); // reset verified if user edits number
    }
  };

  // Send OTP
  // Send OTP
  const handleSendOTP = async () => {
    if (value.length !== 10) {
      setError("Enter a valid 10-digit number");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: value }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        setError("");
        alert("OTP sent to your phone!");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to send OTP");
      console.log(err);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: value, otp }),
      });
      const data = await res.json();

      if (data.success) {
        setVerified(true);
        setOtpSent(false);
        setError("");
        if (onVerified) onVerified(true);
        alert("Mobile number verified successfully!");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to verify OTP");
      console.log(err);
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium text-gray-700">
        Contact Number
      </label>
      <div className="flex items-center">
        <input
          type="text"
          value={value}
          onChange={handlePhoneChange}
          placeholder="Enter 10-digit number"
          className={`flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-400 outline-none ${
            verified ? "bg-green-50 border-green-400" : ""
          }`}
          disabled={verified} // disable input if verified
        />
        <button
          type="button"
          onClick={handleSendOTP}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
          disabled={otpSent || verified} // disable if OTP sent or verified
        >
          {verified ? "Verified" : "Verify"}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {otpSent && !verified && (
        <div className="mt-3">
          <label className="block mb-1 font-medium text-gray-700">
            Enter OTP
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="6-digit OTP"
              className="flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              type="button"
              onClick={handleVerifyOTP}
              className={`px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition ${
                otp.length !== 6 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={otp.length !== 6}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInputWithOTP;
