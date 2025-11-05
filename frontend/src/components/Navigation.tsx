import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthModal } from "./auth/AuthModal";

const Navigation: React.FC = () => {
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const handleLoginClick = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };


  return (
    <nav className="flex items-center justify-between px-12 py-6">
      {/* Logo */}
      <Link to="/" className="text-2xl font-semibold">
        <span className="text-pink-500 italic">Simple</span>
        <span className="text-gray-800"> Strategies</span>
      </Link>

      {/* Center Navigation */}
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className={`px-8 py-3 rounded-full font-medium transition-colors ${
            location.pathname === "/"
              ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
              : "text-gray-700 hover:text-gray-900"
          }`}
        >
          Home
        </Link>
        <Link
          to="/profile"
          className={`px-6 py-3 rounded-full font-medium transition-colors ${
            location.pathname === "/profile"
              ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
              : "text-gray-700 hover:text-gray-900"
          }`}
        >
          Profile
        </Link>
        <button
          className="px-6 py-3 rounded-full font-medium"
          onClick={handleLoginClick}
        >
          Login
        </button>
        <Link
          to="/about"
          className={`px-6 py-3 rounded-full font-medium transition-colors ${
            location.pathname === "/about"
              ? "bg-lime-300 hover:bg-lime-400 text-gray-800"
              : "text-gray-700 hover:text-gray-900"
          }`}
        >
          About
        </Link>
      </div>

      {/* Sign In Button */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </nav>
  );
};

export default Navigation;
