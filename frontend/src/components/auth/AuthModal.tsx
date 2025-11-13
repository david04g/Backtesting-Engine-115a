"use client";
import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { AuthModalProps } from "../../types";
import { useNavigate } from "react-router-dom";
import { get_user_id } from "../apiServices/userApi";



export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
}) => {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [showVerifyStep, setShowVerifyStep] = useState(false);

  const navigate = useNavigate();

  const add_learning_user = async (userId: string) => {
    const endpoint = "http://localhost:8000/api/add_learning_user";
    const payload = { uid: userId };
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      console.log("added lessons to user :", data);

      if (data.status === "success" && data.data === true) {
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error adding lessons:", err);
      return false;
    }
  };
  const checkUserVerified = async (email: string) => {
    console.log("Checking if user is verified...");
    const endpoint = "http://localhost:8000/api/is_user_verified";
    const payload = { email };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Verification check result:", data);

      if (data.status === "success" && data.data === true) {
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error checking verification:", err);
      return false;
    }
  };

  const sendVerificationEmail = async () => {
    console.log("Sending verification email...");
    const endpoint = "http://localhost:8000/api/send_verification_email";
    const payload = { email };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Server response:", data);
      setShowVerifyStep(true);
    } catch (err) {
      console.error("Error sending verification email:", err);
    }
  };

  const verifyEmail = async () => {
    console.log("Verifying email...");
    const endpoint = "http://localhost:8000/api/verify_email";
    const payload = { email, verification_code: verifyCode };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Verification result:", data);

      if (data.success || data.status === "success") {
        alert("Email verified successfully!");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        const userId = await get_user_id();
        if (userId) {
          await add_learning_user(userId);
        }

        navigate("/profile");
      } else {
        alert("Invalid verification code. Try again.");
      }
    } catch (err) {
      console.error("Error verifying email:", err);
      alert("Verification failed. Please try again.");
    }
  };

  const handleSubmit = async () => {
    console.log("Submitting credentials...");

    const endpoint = isLoginMode
      ? "http://localhost:8000/api/login_user"
      : "http://localhost:8000/api/add_user";

    const payload = isLoginMode
      ? { email, password_hash: password }
      : { name, email, password_hash: password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("isLoginMode:", isLoginMode);
      console.log("data.status:", data.status);

      if (data.status === "success") {
        if (!isLoginMode) {
          await sendVerificationEmail();
          setShowVerifyStep(true);
        } else {
          const isVerified = await checkUserVerified(email);
          if (isVerified) {
            localStorage.setItem("isLoggedIn", "true");
            const userId = await get_user_id();
            if (userId) {
              await add_learning_user(userId);
            }

            navigate("/profile");
          } else {
            alert("Please verify your email before continuing.");
          }
        }
      } else {
        alert(`Error: ${data.message || "Something went wrong"}`);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Unable to connect to server.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative flex w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
        {/* Left Side */}
        <div className="w-1/2 bg-lime-200 flex flex-col justify-center items-center p-10 text-center">
          <TrendingUp className="w-12 h-12 text-gray-800 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {isLoginMode ? "Welcome Back!" : "Hello There!"}
          </h2>
          <p className="text-gray-700 mb-6 max-w-xs">
            {isLoginMode
              ? "Backtest your trading. Log in to continue."
              : "Join Simple Strategies to start optimizing your trades!"}
          </p>
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="px-8 py-2 border border-gray-800 rounded-full font-semibold hover:bg-gray-800 hover:text-white transition-all"
          >
            {isLoginMode ? "Sign Up" : "Sign In"}
          </button>
        </div>

        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          {showVerifyStep ? (
            <>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Verify Your Email
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a code to <strong>{email}</strong>. Enter it below to
                verify your account.
              </p>

              <input
                type="number"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
                placeholder="Enter verification code"
              />

              <button
                onClick={verifyEmail}
                className="mt-4 w-full bg-lime-500 hover:bg-lime-600 text-white py-2 rounded-md font-semibold transition-colors"
              >
                Verify
              </button>

              <button
                onClick={() => setShowVerifyStep(false)}
                className="mt-2 w-full border border-gray-300 py-2 rounded-md font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Go Back
              </button>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                {isLoginMode ? "Sign In" : "Create Account"}
              </h3>

              {!isLoginMode && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
                    placeholder="Your name"
                  />
                </div>
              )}

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

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-md font-semibold transition-colors"
              >
                {isLoginMode ? "Sign In" : "Sign Up"}
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
