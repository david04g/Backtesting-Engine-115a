"use client";
import React, { useState } from "react";
import { TrendingUp, ArrowLeft } from "lucide-react";

interface ForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  isOpen,
  onClose,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRequestReset = async () => {
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8000/api/forgot_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setMessage("Password reset code sent to your email!");
        setStep("verify");
      } else {
        setMessage(data.message || "Failed to send reset code. Please try again.");
      }
    } catch (err) {
      console.error("Error requesting password reset:", err);
      setMessage("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resetCode) {
      setMessage("Please enter the reset code.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8000/api/verify_reset_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reset_code: resetCode }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setStep("reset");
        setMessage("");
      } else {
        setMessage(data.message || "Invalid or expired reset code.");
      }
    } catch (err) {
      console.error("Error verifying reset code:", err);
      setMessage("Unable to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8000/api/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          reset_code: resetCode,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setMessage("Password reset successfully! You can now log in.");
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      } else {
        setMessage(data.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setMessage("Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Left Side */}
        <div className="w-full md:w-1/2 bg-lime-200 flex flex-col justify-center items-center p-6 md:p-10 text-center min-h-[200px] md:min-h-0">
          <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-gray-800 mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Reset Password
          </h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 max-w-xs">
            {step === "request" && "Enter your email to receive a reset code."}
            {step === "verify" && "Enter the code sent to your email."}
            {step === "reset" && "Enter your new password."}
          </p>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 bg-white p-6 md:p-10 flex flex-col justify-center">
          {step === "request" && (
            <>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">
                Forgot Password?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter your email address and we'll send you a code to reset your password.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-md text-sm ${
                  message.includes("successfully") || message.includes("sent")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {message}
                </div>
              )}

              <button
                onClick={handleRequestReset}
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>

              <button
                onClick={onBackToLogin}
                className="mt-4 w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </>
          )}

          {step === "verify" && (
            <>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">
                Enter Reset Code
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a 6-digit code to <strong>{email}</strong>. Enter it below.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reset Code
                </label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-md text-sm ${
                  message.includes("successfully") || message.includes("sent")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {message}
                </div>
              )}

              <button
                onClick={handleVerifyCode}
                disabled={loading || resetCode.length !== 6}
                className="w-full bg-lime-500 hover:bg-lime-600 text-white py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                onClick={() => {
                  setStep("request");
                  setResetCode("");
                  setMessage("");
                }}
                className="mt-2 w-full border border-gray-300 py-2 rounded-md font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            </>
          )}

          {step === "reset" && (
            <>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">
                Set New Password
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="••••••••"
                  required
                />
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-md text-sm ${
                  message.includes("successfully")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {message}
                </div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                onClick={() => {
                  setStep("verify");
                  setNewPassword("");
                  setConfirmPassword("");
                  setMessage("");
                }}
                className="mt-2 w-full border border-gray-300 py-2 rounded-md font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            </>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
