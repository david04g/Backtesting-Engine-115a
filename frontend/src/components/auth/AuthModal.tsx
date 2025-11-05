"use client";
import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { AuthModalProps } from "../../types";

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
  const [verify, setVerify] = useState(false);

  const sendVerificationEmail = async () => {
    console.log("🟢 sending verification email...");
    const endpoint = "http://localhost:8000/api/send_verification_email";
    const payload = { email };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log(" Server response:", data);
    } catch (err) {
      console.error(" Error sending Verification email:", err);
    }
  };
  const verifyEmail = async () => {
    console.log("🟣 verifying email...");
    const endpoint = "http://localhost:8000/api/verify_email";
    const payload = { email, verification_code: verifyCode };
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Server response", data);
      return true;
    } catch (err) {
      console.log("Error verifying email");
      return false;
    }
  };
  const handleSubmit = async () => {
    console.log("🟡 handleSubmit triggered");
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
      console.log(" Server response:", data);
      if (!isLoginMode) {
        await sendVerificationEmail();
        setVerify(true);
      }
    } catch (err) {
      console.error(" Error submitting form:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative flex w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
        {/* Left Panel */}
        <div className="w-1/2 bg-lime-200 flex flex-col justify-center items-center p-10 text-center">
          <TrendingUp className="w-12 h-12 text-gray-800 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {isLoginMode ? "Welcome !" : "Hello There!"}
          </h2>
          <p className="text-gray-700 mb-6 max-w-xs">
            {isLoginMode
              ? "Backtest your trading. Login to continue."
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
          {verify ? (
            <>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Verification Sent
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="number"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="i.e. 12345"
                />
              </div>
              <button
                onClick={async () => {
                  const success = await verifyEmail();
                  if (success) {
                    alert("Email verified!");
                    setVerify(false);
                  }
                }}
                className="w-full bg-lime-500 hover:bg-lime-600 text-white py-2 rounded-md font-semibold transition-colors"
              >
                Verify
              </button>
              <button
                onClick={() => setVerify(false)}
                className="w-full bg-lime-500 hover:bg-lime-600 text-white py-2 rounded-md font-semibold transition-colors"
              >
                Go back
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
