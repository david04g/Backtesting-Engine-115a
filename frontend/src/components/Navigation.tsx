import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthModal } from "./auth/AuthModal";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, [location]);

  const handleLoginClick = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };


  const isPublicPage = location.pathname === "/";

  return (
    <nav className="flex items-center justify-between px-12 py-4 bg-white shadow-sm">
      {/* Logo */}
      <Link to="/" className="text-2xl font-semibold">
        <span className="text-pink-500 italic">Simple</span>
        <span className="text-gray-800"> Strategies</span>
      </Link>

      
      {isLoggedIn ? (
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
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
            onClick={handleLogout}
            className="px-6 py-3 rounded-full bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-6">
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

          <button
            onClick={handleLoginClick}
            className="px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            Login
          </button>

          <Link
            to="/about"
            className="px-6 py-3 rounded-full font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            About
          </Link>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </nav>
  );
};

export default Navigation;
