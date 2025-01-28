import React, { useState } from "react";
import axios from "axios";

// Define axiosInstance using environment variable
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // Fetch base URL from .env file
});

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const handleSendOtp = async () => {
    try {
      const response = await axiosInstance.post("/forgot-password", { email });
      setMessage(response.data.message);
      setStep(2);
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axiosInstance.post("/verify-otp", { email, otp });
      setMessage(response.data.message);
      setStep(3);
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await axiosInstance.post("/reset-password", { email, newPassword });
      setMessage(response.data.message);
      onClose(); // Close the popup on successful reset
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <h2>Forgot Password</h2>
        {message && <p>{message}</p>}
        {step === 1 && (
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="dark-button" onClick={handleSendOtp}>
              Send OTP
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button className="dark-button" onClick={handleVerifyOtp}>
              Verify OTP
            </button>
          </div>
        )}
        {step === 3 && (
          <div>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button className="dark-button" onClick={handleResetPassword}>
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
